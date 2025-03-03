FROM node:18 AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.12.4-slim AS backend-builder
WORKDIR /backend
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn
COPY backend/ .

FROM postgres:14.13 AS db-base
ENV POSTGRES_USER=domino
ENV POSTGRES_DB=domino_app
COPY secrets/db_password.txt /run/secrets/db_password
RUN cat /run/secrets/db_password > /tmp/pwd && \
    export POSTGRES_PASSWORD=$(cat /tmp/pwd) && \
    rm /tmp/pwd

FROM python:3.12.4-slim

# Crear usuario no privilegiado
RUN groupadd -r domino && useradd -r -g domino domino

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    postgresql \
    postgresql-contrib \
    nginx \
    gcc \
    libpq-dev \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Instalar uvicorn globalmente
RUN pip install --no-cache-dir uvicorn

# Copiar backend y sus dependencias
COPY --from=backend-builder /backend /app/backend
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
RUN chown -R domino:domino /usr/local/lib/python3.12/site-packages && \
    chmod -R 755 /usr/local/lib/python3.12/site-packages

# Crear directorios necesarios y establecer permisos
RUN mkdir -p /frontend /app/backend /var/lib/postgresql/data /var/run/postgresql && \
    chown -R domino:domino /frontend /app/backend /var/lib/postgresql/data /var/run/postgresql

# Copiar frontend compilado
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Configurar nginx para ejecutarse como usuario no root
RUN mkdir -p /var/run/nginx /var/tmp/nginx /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi && \
    chown -R domino:domino /var/run/nginx /var/tmp/nginx /var/log/nginx /usr/share/nginx/html /etc/nginx/conf.d /var/lib/nginx && \
    chmod -R 755 /var/run/nginx /var/tmp/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx && \
    sed -i 's/user nginx/user domino/g' /etc/nginx/nginx.conf && \
    sed -i 's/pid \/run\/nginx.pid/pid \/var\/run\/nginx\/nginx.pid/g' /etc/nginx/nginx.conf

# Configurar .env.prod con los secrets
COPY secrets/db_password.txt secrets/secret_key.txt secrets/jwt_secret_key.txt /app/secrets/
RUN cd /app/backend && \
    DB_PASSWORD=$(cat /app/secrets/db_password.txt) && \
    SECRET_KEY=$(cat /app/secrets/secret_key.txt) && \
    JWT_SECRET_KEY=$(cat /app/secrets/jwt_secret_key.txt) && \
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env.prod && \
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env.prod && \
    sed -i "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET_KEY/" .env.prod && \
    chown domino:domino .env.prod && \
    chmod 600 .env.prod

# Copiar base de datos
COPY --from=db-base /usr/lib/postgresql /usr/lib/postgresql
COPY --from=db-base /usr/share/postgresql /usr/share/postgresql
COPY --from=db-base /var/lib/postgresql/data /var/lib/postgresql/data

# Configurar PATH para PostgreSQL y Python
ENV PATH="/usr/local/bin:/usr/lib/postgresql/14/bin:$PATH"
ENV PYTHONPATH="/app/backend"

# Script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh && \
    chown -R domino:domino /frontend /app/backend /var/lib/postgresql

# Cambiar al usuario no privilegiado
USER domino

EXPOSE 80 8000 5432
CMD ["/start.sh"] 