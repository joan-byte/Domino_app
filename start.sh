#!/bin/bash

# NO iniciar PostgreSQL localmente, ya que usaremos el servicio DB externo
echo "🗄️ Utilizando servicio de base de datos externo (domino-parejas-db)"

# Configurar variables para la conexión a la base de datos externa
DB_HOST="db"
DB_PORT="5432"
DB_USER="domino"
DB_PASSWORD=$(cat /app/secrets/db_password.txt)
DB_NAME="domino_app"

echo "⏳ Esperando a que el servicio de base de datos esté listo..."
# Intentar conectarse a la base de datos externa
MAX_RETRIES=30
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
    pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
    if [ $? -eq 0 ]; then
        echo "✅ Conexión a la base de datos externa establecida"
        break
    fi
    echo "⏳ Esperando a que la base de datos esté disponible... ($COUNT/$MAX_RETRIES)"
    COUNT=$((COUNT+1))
    sleep 2
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Error: No se pudo establecer conexión con la base de datos después de $MAX_RETRIES intentos"
    exit 1
fi

# Iniciar el backend
echo "🚀 Iniciando el backend..."
cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 5

# Verificar que el backend esté respondiendo
which curl > /dev/null
if [ $? -eq 0 ]; then
    curl -s http://localhost:8000 > /dev/null
    if [ $? -ne 0 ]; then
        echo "⚠️ Advertencia: El backend no parece estar respondiendo en http://localhost:8000"
    else
        echo "✅ Backend respondiendo en http://localhost:8000"
    fi
else
    echo "⚠️ Advertencia: No se pudo verificar el backend porque curl no está instalado"
fi

# Asegurarse de que los directorios de nginx existan y tengan los permisos correctos
echo "🔧 Configurando permisos de nginx..."
mkdir -p /var/run/nginx /var/tmp/nginx /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi
chmod -R 755 /var/run/nginx /var/tmp/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx

# Iniciar nginx (frontend)
echo "🌐 Iniciando nginx (frontend)..."
nginx -g "daemon off;" &
NGINX_PID=$!

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

# Verificar la comunicación entre nginx y backend
which curl > /dev/null
if [ $? -eq 0 ]; then
    curl -s http://localhost/api/ > /dev/null
    if [ $? -ne 0 ]; then
        echo "⚠️ Advertencia: No se pudo acceder al backend a través de nginx (http://localhost/api/)"
        echo "📝 Logs de nginx:"
        cat /var/log/nginx/error.log
    else
        echo "✅ Comunicación entre nginx y backend verificada correctamente"
    fi
else
    echo "⚠️ Advertencia: No se pudo verificar la comunicación porque curl no está instalado"
fi

# Mantener el contenedor corriendo
echo "✅ Todos los servicios iniciados"
echo "🌐 La aplicación está disponible en:"
echo "   - Frontend: http://localhost"
echo "   - Backend: http://localhost/api"
echo "   - Base de datos: $DB_HOST:$DB_PORT"

# Mostrar versiones e información útil
echo "📊 Información de versiones:"
echo "   - Python: $(python --version)"
echo "   - Node: $(node --version)"
echo "   - Nginx: $(nginx -v 2>&1)"

# Mantener el contenedor en ejecución y monitorear los procesos principales
echo "📝 Monitoreando servicios..."
wait $BACKEND_PID
echo "⚠️ El proceso del backend se ha detenido"
wait $NGINX_PID
echo "⚠️ El proceso de nginx se ha detenido"

# Si llegamos aquí, los servicios se han detenido
echo "❌ Los servicios se han detenido, manteniendo el contenedor activo para diagnóstico"
tail -f /dev/null