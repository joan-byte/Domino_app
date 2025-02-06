#!/bin/bash

echo "🗄️  Iniciando PostgreSQL..."

# Inicializar el directorio de datos si no existe
if [ ! -f "/var/lib/postgresql/data/PG_VERSION" ]; then
    echo "Inicializando el directorio de datos de PostgreSQL..."
    initdb -D /var/lib/postgresql/data
fi

# Iniciar PostgreSQL
pg_ctl -D /var/lib/postgresql/data start

echo "⏳ Esperando a que PostgreSQL esté listo..."
until pg_isready; do
  sleep 1
done

# Crear base de datos si no existe
echo "Verificando y creando base de datos si es necesario..."
psql -U domino -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'domino_app'" | grep -q 1
if [ $? -ne 0 ]; then
    echo "Creando base de datos domino_app..."
    psql -U domino -d postgres -c "CREATE DATABASE domino_app"
    if [ $? -eq 0 ]; then
        echo "Base de datos domino_app creada exitosamente"
    else
        echo "Error al crear la base de datos domino_app"
        exit 1
    fi
else
    echo "La base de datos domino_app ya existe"
fi

# Activar entorno virtual
source $VIRTUAL_ENV/bin/activate

# Iniciar el backend
echo "🚀 Iniciando el backend..."
cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Asegurarse de que los directorios de nginx existan y tengan los permisos correctos
echo "🔧 Configurando permisos de nginx..."
mkdir -p /var/run/nginx /var/tmp/nginx /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi
chmod -R 755 /var/run/nginx /var/tmp/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx

# Iniciar nginx (frontend)
echo "🌐 Iniciando nginx (frontend)..."
nginx -g "daemon off;" &

# Esperar a que nginx inicie y verificar su estado
echo "⏳ Verificando estado de nginx..."
sleep 2

# Verificar que nginx esté corriendo buscando el proceso
ps aux | grep "[n]ginx" > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: nginx no se pudo iniciar"
    # Mostrar los logs de nginx para diagnóstico
    echo "Logs de nginx:"
    cat /var/log/nginx/error.log
    exit 1
fi

echo "✅ nginx iniciado correctamente"

# Mantener el contenedor corriendo
echo "✅ Todos los servicios iniciados"
echo "🌐 La aplicación está disponible en:"
echo "   - Frontend: http://localhost"
echo "   - Backend: http://localhost/api"
echo "   - Base de datos: localhost:5432"

# Mantener el contenedor en ejecución
tail -f /dev/null 