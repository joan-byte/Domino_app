FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ENV VITE_API_URL=/api
RUN npm run build

FROM python:3.12-slim AS backend-builder
WORKDIR /backend
# Mejora: uso de --no-install-recommends para reducir el tamaño de la imagen
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn
COPY backend/ .

# Imagen base con soporte para múltiples arquitecturas
FROM debian:bookworm-slim

# Crear usuario no privilegiado
RUN groupadd -r domino && useradd -r -g domino domino

# Variables de entorno para PostgreSQL
ENV POSTGRES_USER=domino
ENV POSTGRES_DB=domino_app
ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_PASSWORD_FILE=/app/secrets/db_password.txt

# Metadatos para la imagen
LABEL maintainer="joanalba" \
      org.opencontainers.image.architecture="amd64,arm64" \
      description="Aplicación Domino Parejas - Todo en uno (Backend, Frontend y Base de datos)"

# Instalar dependencias en un solo paso para reducir capas de imagen
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    wget \
    lsb-release \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Añadir repositorio PostgreSQL oficial
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/postgresql.list

# Instalar paquetes principales primero
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-15 \
    postgresql-client-15 \
    libpq5 \
    nginx \
    supervisor \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    python3-venv \
    python3-full \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js manualmente con scripts binarios
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Configurar PostgreSQL para escuchar en todos los interfaces
RUN mkdir -p /etc/postgresql/15/main/ && \
    echo "listen_addresses = '*'" >> /etc/postgresql/15/main/postgresql.conf && \
    echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/15/main/pg_hba.conf

# Crear un entorno virtual para Python e instalar uvicorn
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN /opt/venv/bin/pip install --no-cache-dir uvicorn python-dotenv

# Crear directorio para datos persistentes
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql/data && \
    chmod 700 /var/lib/postgresql/data

# Copiar backend y sus dependencias
COPY --from=backend-builder /backend /app/backend
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /opt/venv/lib/python3.*/site-packages/

# Instalar las dependencias del backend directamente en el entorno virtual
RUN /opt/venv/bin/pip install --no-cache-dir -r /app/backend/requirements.txt

RUN chown -R domino:domino /opt/venv && \
    chmod -R 755 /opt/venv

# Configurar directorios necesarios
RUN mkdir -p /frontend /app/backend /var/run/postgresql /app/secrets && \
    chown -R domino:domino /frontend /app/backend && \
    chown -R postgres:postgres /var/run/postgresql

# Copiar frontend compilado
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Arreglar la configuración de nginx
RUN sed -i '/add_header/d' /etc/nginx/conf.d/default.conf

# Configurar nginx para ejecutarse como usuario no root
RUN mkdir -p /var/run/nginx /var/tmp/nginx /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi && \
    chown -R domino:domino /var/run/nginx /var/tmp/nginx /var/log/nginx /usr/share/nginx/html /etc/nginx/conf.d /var/lib/nginx && \
    chmod -R 755 /var/run/nginx /var/tmp/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx && \
    sed -i 's/user nginx/user domino/g' /etc/nginx/nginx.conf && \
    sed -i 's/pid \/run\/nginx.pid/pid \/var\/run\/nginx\/nginx.pid/g' /etc/nginx/nginx.conf

# Configurar supervisord
COPY <<EOT /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
logfile_maxbytes=50MB
logfile_backups=5
loglevel=info
pidfile=/var/run/supervisord.pid
user=root

[program:postgresql]
command=/usr/lib/postgresql/15/bin/postgres -D /var/lib/postgresql/data
user=postgres
autostart=true
autorestart=true
priority=10
stdout_logfile=/var/log/postgresql.log
stderr_logfile=/var/log/postgresql-error.log
startsecs=5
stopwaitsecs=30

[program:backend]
command=/opt/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
directory=/app/backend
user=domino
autostart=true
autorestart=true
priority=20
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend-error.log
environment=PYTHONPATH="/app/backend"
startsecs=10
stopwaitsecs=10
startretries=3
stopsignal=TERM

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=30
stdout_logfile=/var/log/nginx-access.log
stderr_logfile=/var/log/nginx-error.log
startsecs=5
stopwaitsecs=10
EOT

# Crear directorio para logs de supervisor
RUN mkdir -p /var/log/supervisor && \
    chown -R domino:domino /var/log/supervisor && \
    mkdir -p /var/log/backend /var/log/postgresql /var/log/nginx && \
    chown -R domino:domino /var/log/backend && \
    chown -R postgres:postgres /var/log/postgresql && \
    chown -R domino:domino /var/log/nginx && \
    touch /var/log/supervisor/supervisord.log && \
    touch /var/log/postgresql.log /var/log/postgresql-error.log && \
    touch /var/log/backend.log /var/log/backend-error.log && \
    touch /var/log/nginx-access.log /var/log/nginx-error.log && \
    chown domino:domino /var/log/supervisor/supervisord.log && \
    chown postgres:postgres /var/log/postgresql.log /var/log/postgresql-error.log && \
    chown domino:domino /var/log/backend.log /var/log/backend-error.log && \
    chown domino:domino /var/log/nginx-access.log /var/log/nginx-error.log

# Crear script de inicio para inicializar la base de datos
COPY <<EOT /app/init-db.sh
#!/bin/bash
set -e

# Esperar a que PostgreSQL esté disponible
MAX_RETRIES=30
COUNT=0
while [ \$COUNT -lt \$MAX_RETRIES ]; do
    pg_isready -h localhost -p 5432 -U postgres
    if [ \$? -eq 0 ]; then
        echo "✅ PostgreSQL está en funcionamiento"
        break
    fi
    echo "⏳ Esperando a que PostgreSQL esté disponible... (\$COUNT/\$MAX_RETRIES)"
    COUNT=\$((COUNT+1))
    sleep 2
done

if [ \$COUNT -eq \$MAX_RETRIES ]; then
    echo "❌ Error: No se pudo establecer conexión con PostgreSQL después de \$MAX_RETRIES intentos"
    exit 1
fi

# Obtener contraseña de la base de datos desde el archivo
DB_PASSWORD=\$(cat \$POSTGRES_PASSWORD_FILE)

# Verificar si ya existe el usuario y la base de datos
USER_EXISTS=\$(psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='\$POSTGRES_USER'")
if [ "\$USER_EXISTS" != "1" ]; then
    echo "🔧 Creando usuario \$POSTGRES_USER..."
    psql -v ON_ERROR_STOP=1 -U postgres -c "CREATE USER \$POSTGRES_USER WITH PASSWORD '\$DB_PASSWORD';"
    psql -v ON_ERROR_STOP=1 -U postgres -c "ALTER USER \$POSTGRES_USER WITH SUPERUSER;"
fi

DB_EXISTS=\$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='\$POSTGRES_DB'")
if [ "\$DB_EXISTS" != "1" ]; then
    echo "🔧 Creando base de datos \$POSTGRES_DB..."
    psql -v ON_ERROR_STOP=1 -U postgres -c "CREATE DATABASE \$POSTGRES_DB OWNER \$POSTGRES_USER;"
fi

echo "✅ Configuración de la base de datos completada"
EOT

# Hacer el script ejecutable
RUN chmod +x /app/init-db.sh

# Configurar secrets para la aplicación
COPY secrets/db_password.txt secrets/secret_key.txt secrets/jwt_secret_key.txt /app/secrets/
RUN chmod 700 /app/secrets && \
    chmod 600 /app/secrets/*

# Configurar archivo .env.prod para el backend
RUN cd /app/backend && \
    echo "ENV=production" > .env.prod && \
    echo "DB_USER=domino" >> .env.prod && \
    echo "DB_PASSWORD_FILE=/app/secrets/db_password.txt" >> .env.prod && \
    echo "DB_HOST=localhost" >> .env.prod && \
    echo "DB_PORT=5432" >> .env.prod && \
    echo "DB_NAME=domino_app" >> .env.prod && \
    echo "API_HOST=0.0.0.0" >> .env.prod && \
    echo "API_PORT=8000" >> .env.prod && \
    echo "SECRET_KEY_FILE=/app/secrets/secret_key.txt" >> .env.prod && \
    echo "JWT_SECRET_KEY_FILE=/app/secrets/jwt_secret_key.txt" >> .env.prod && \
    echo "CORS_ORIGINS=http://localhost,http://localhost:80,http://0.0.0.0:80" >> .env.prod && \
    chown domino:domino .env.prod && \
    chmod 600 .env.prod

# Script de inicio principal
COPY <<EOT /app/start.sh
#!/bin/bash
set -e

echo "🚀 Iniciando servicios de Domino Parejas..."

# Verificar que los archivos de logs existan
mkdir -p /var/log/supervisor /var/log/backend /var/log/postgresql /var/log/nginx
touch /var/log/supervisor/supervisord.log
touch /var/log/postgresql.log /var/log/postgresql-error.log
touch /var/log/backend.log /var/log/backend-error.log
touch /var/log/nginx-access.log /var/log/nginx-error.log
chown domino:domino /var/log/supervisor/supervisord.log
chown postgres:postgres /var/log/postgresql.log /var/log/postgresql-error.log
chown domino:domino /var/log/backend.log /var/log/backend-error.log
chown domino:domino /var/log/nginx-access.log /var/log/nginx-error.log

# Verificar si PostgreSQL está inicializado
if [ ! -f "\$PGDATA/PG_VERSION" ]; then
    echo "🔧 Inicializando PostgreSQL por primera vez..."
    mkdir -p \$PGDATA
    chown -R postgres:postgres \$PGDATA
    chmod 700 \$PGDATA
    # Aseguramos que el locale sea compatible con Debian
    su - postgres -c "LC_ALL=C.UTF-8 /usr/lib/postgresql/15/bin/initdb -D \$PGDATA --locale=C.UTF-8"
    echo "✅ PostgreSQL inicializado correctamente"
fi

# Asegurar permisos correctos para PostgreSQL
chown -R postgres:postgres \$PGDATA
chmod 700 \$PGDATA

# Iniciar PostgreSQL manualmente primero
echo "🔄 Iniciando PostgreSQL..."
su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D \$PGDATA start"

# Esperar a que PostgreSQL esté disponible
MAX_RETRIES=30
COUNT=0
while [ \$COUNT -lt \$MAX_RETRIES ]; do
    su - postgres -c "pg_isready -h localhost -p 5432"
    if [ \$? -eq 0 ]; then
        echo "✅ PostgreSQL está en funcionamiento"
        break
    fi
    echo "⏳ Esperando a que PostgreSQL esté disponible... (\$COUNT/\$MAX_RETRIES)"
    COUNT=\$((COUNT+1))
    sleep 2
done

# Inicializar la base de datos si es necesario
/app/init-db.sh

# Detener PostgreSQL antes de que supervisord lo inicie
su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D \$PGDATA stop"

# Iniciar supervisord para gestionar todos los servicios
echo "🔄 Iniciando servicios con supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOT

# Hacer el script de inicio ejecutable
RUN chmod +x /app/start.sh

# Configurar PATH para Python
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONPATH="/app/backend"

# Puerto para nginx y backend API
EXPOSE 80 8000 5432

# Comando para iniciar todos los servicios
CMD ["/app/start.sh"] 