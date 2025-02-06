#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración
IMAGE_NAME="domino-app"
CONTAINER_NAME="domino-container"
VERSION="1.0"

# Función para mostrar el uso del script
show_help() {
    echo -e "${BLUE}Uso: ./domino.sh [comando]${NC}"
    echo
    echo "Comandos disponibles:"
    echo "  build    - Construye la imagen Docker"
    echo "  start    - Inicia la aplicación en modo detached (background)"
    echo "  up       - Inicia la aplicación mostrando logs en tiempo real"
    echo "  stop     - Detiene la aplicación"
    echo "  restart  - Reinicia la aplicación"
    echo "  logs     - Muestra los logs de la aplicación"
    echo "  status   - Muestra el estado de los contenedores"
    echo "  clean    - Limpia imágenes y contenedores no utilizados"
    echo "  help     - Muestra esta ayuda"
}

# Función para construir la imagen
build_image() {
    echo -e "${BLUE}🏗️  Construyendo imagen Docker...${NC}"
    echo -e "${YELLOW}Nombre de la imagen: ${IMAGE_NAME}:${VERSION}${NC}"
    
    docker build -t ${IMAGE_NAME}:${VERSION} .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
        echo -e "${BLUE}Para ver la imagen en Docker Desktop:${NC}"
        echo "1. Abre Docker Desktop"
        echo "2. Ve a la pestaña 'Images'"
        echo "3. Busca '${IMAGE_NAME}:${VERSION}'"
    else
        echo -e "${RED}❌ Error al construir la imagen${NC}"
        exit 1
    fi
}

# Función para iniciar la aplicación en modo detached
start_app() {
    echo -e "${BLUE}🚀 Iniciando la aplicación en modo detached...${NC}"
    
    # Verificar si el contenedor ya existe
    if docker ps -a | grep -q ${CONTAINER_NAME}; then
        echo -e "${YELLOW}⚠️  El contenedor ya existe, reiniciándolo...${NC}"
        docker start ${CONTAINER_NAME}
    else
        echo -e "${BLUE}🌟 Creando nuevo contenedor...${NC}"
        docker-compose -f docker-compose.unified.yml up -d
    fi
    
    echo -e "${GREEN}✅ Aplicación iniciada!${NC}"
    echo -e "${BLUE}🌐 La aplicación está disponible en:${NC}"
    echo "   - Frontend: http://localhost"
    echo "   - Backend: http://localhost/api"
    echo "   - Base de datos: localhost:5432"
    echo -e "${BLUE}💡 Puedes ver el contenedor en Docker Desktop:${NC}"
    echo "1. Abre Docker Desktop"
    echo "2. Ve a la pestaña 'Containers'"
    echo "3. Busca '${CONTAINER_NAME}'"
}

# Función para iniciar la aplicación con logs
up_app() {
    echo -e "${BLUE}🚀 Iniciando la aplicación con logs en tiempo real...${NC}"
    echo -e "${YELLOW}⚠️  Presiona Ctrl+C para detener la aplicación${NC}"
    echo -e "${BLUE}🌐 La aplicación estará disponible en:${NC}"
    echo "   - Frontend: http://localhost"
    echo "   - Backend: http://localhost/api"
    echo "   - Base de datos: localhost:5432"
    
    docker-compose -f docker-compose.unified.yml up --build
}

# Función para detener la aplicación
stop_app() {
    echo -e "${BLUE}🛑 Deteniendo la aplicación...${NC}"
    docker-compose -f docker-compose.unified.yml down
    echo -e "${GREEN}✅ Aplicación detenida${NC}"
}

# Función para mostrar los logs
show_logs() {
    echo -e "${BLUE}📋 Mostrando logs de la aplicación...${NC}"
    docker-compose -f docker-compose.unified.yml logs -f
}

# Función para mostrar el estado
show_status() {
    echo -e "${BLUE}📊 Estado de los contenedores:${NC}"
    docker-compose -f docker-compose.unified.yml ps
    
    echo -e "\n${BLUE}📊 Información detallada:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep ${CONTAINER_NAME}
}

# Función para limpiar
clean_docker() {
    echo -e "${BLUE}🧹 Limpiando Docker...${NC}"
    
    echo -e "${YELLOW}Deteniendo contenedores...${NC}"
    docker-compose -f docker-compose.unified.yml down
    
    echo -e "${YELLOW}Eliminando imágenes no utilizadas...${NC}"
    docker image prune -f
    
    echo -e "${YELLOW}Eliminando volúmenes no utilizados...${NC}"
    docker volume prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Procesar comandos
case "$1" in
    "build")
        build_image
        ;;
    "start")
        start_app
        ;;
    "up")
        up_app
        ;;
    "stop")
        stop_app
        ;;
    "restart")
        stop_app
        echo -e "${BLUE}⏳ Esperando 5 segundos antes de reiniciar...${NC}"
        sleep 5
        start_app
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_docker
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no reconocido: $1${NC}"
        show_help
        exit 1
        ;;
esac 