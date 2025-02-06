#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración
IMAGE_NAME="joanalba/domino_app"
CONTAINER_NAME="domino-parejas"
VERSION="latest"

# Función para mostrar el menú
show_menu() {
    echo -e "${BLUE}🎮 Gestor de Domino App${NC}"
    echo
    echo "1. Instalar aplicación"
    echo "2. Iniciar aplicación"
    echo "3. Detener aplicación"
    echo "4. Ver logs"
    echo "5. Subir imagen a Docker Hub"
    echo "6. Descargar imagen de Docker Hub"
    echo "7. Limpiar todo"
    echo "8. Salir"
    echo
    read -p "Selecciona una opción (1-8): " option
}

# Función para verificar secretos
check_secrets() {
    echo -e "${BLUE}📁 Verificando archivos de secretos...${NC}"
    if [ ! -d "secrets" ]; then
        echo -e "${RED}❌ Error: El directorio 'secrets' no existe${NC}"
        exit 1
    fi

    for secret in "db_password.txt" "secret_key.txt" "jwt_secret_key.txt"; do
        if [ ! -f "secrets/$secret" ]; then
            echo -e "${RED}❌ Error: Falta el archivo secrets/$secret${NC}"
            exit 1
        fi
    done
    echo -e "${GREEN}✅ Archivos de secretos verificados${NC}"
}

# Función para instalar
install_app() {
    check_secrets
    echo -e "${BLUE}🚀 Iniciando instalación de Domino App...${NC}"
    
    # Limpiar instalaciones previas
    echo -e "${BLUE}🧹 Limpiando instalaciones previas...${NC}"
    docker-compose -f docker-compose.unified.yml down -v 2>/dev/null
    docker system prune -f

    # Descargar la imagen
    echo -e "${BLUE}📥 Descargando imagen de Docker Hub...${NC}"
    docker pull ${IMAGE_NAME}:${VERSION}

    # Iniciar la aplicación
    start_app
}

# Función para iniciar
start_app() {
    echo -e "${BLUE}🚀 Iniciando la aplicación...${NC}"
    docker-compose -f docker-compose.unified.yml up -d

    # Verificar que el contenedor está corriendo
    echo -e "${BLUE}🔍 Verificando el estado del contenedor...${NC}"
    sleep 5
    if docker ps | grep -q ${CONTAINER_NAME}; then
        echo -e "${GREEN}✅ Aplicación ejecutándose correctamente${NC}"
        echo -e "${BLUE}🌐 La aplicación está disponible en:${NC}"
        echo "   - Frontend: http://localhost"
        echo "   - Backend: http://localhost/api"
        echo "   - Base de datos: localhost:5432"
    else
        echo -e "${RED}❌ Error: El contenedor no está ejecutándose${NC}"
        echo -e "${YELLOW}Mostrando logs del contenedor:${NC}"
        docker-compose -f docker-compose.unified.yml logs
    fi
}

# Función para detener
stop_app() {
    echo -e "${BLUE}🛑 Deteniendo la aplicación...${NC}"
    docker-compose -f docker-compose.unified.yml down
    echo -e "${GREEN}✅ Aplicación detenida${NC}"
}

# Función para ver logs
show_logs() {
    echo -e "${BLUE}📋 Mostrando logs de la aplicación...${NC}"
    docker-compose -f docker-compose.unified.yml logs -f
}

# Función para subir imagen
push_image() {
    echo -e "${BLUE}📤 Preparando para subir imagen a Docker Hub...${NC}"
    echo -e "${YELLOW}⚠️  Asegúrate de haber hecho login con 'docker login'${NC}"
    
    # Primero construir la imagen
    echo -e "${BLUE}🏗️  Construyendo imagen...${NC}"
    docker-compose -f docker-compose.unified.yml build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Imagen construida correctamente${NC}"
        
        # Etiquetar la imagen
        echo -e "${BLUE}🏷️  Etiquetando imagen...${NC}"
        docker tag domino-container:latest ${IMAGE_NAME}:${VERSION}
        
        # Subir la imagen
        echo -e "${BLUE}📤 Subiendo imagen a Docker Hub...${NC}"
        docker push ${IMAGE_NAME}:${VERSION}
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Imagen subida correctamente${NC}"
        else
            echo -e "${RED}❌ Error al subir la imagen${NC}"
        fi
    else
        echo -e "${RED}❌ Error al construir la imagen${NC}"
    fi
}

# Función para descargar imagen
pull_image() {
    echo -e "${BLUE}📥 Descargando imagen de Docker Hub...${NC}"
    docker pull ${IMAGE_NAME}:${VERSION}
    echo -e "${GREEN}✅ Imagen descargada correctamente${NC}"
}

# Función para limpiar
clean_all() {
    echo -e "${BLUE}🧹 Limpiando todo...${NC}"
    docker-compose -f docker-compose.unified.yml down -v
    docker system prune -f
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Menú principal
while true; do
    show_menu
    case $option in
        1) install_app ;;
        2) start_app ;;
        3) stop_app ;;
        4) show_logs ;;
        5) push_image ;;
        6) pull_image ;;
        7) clean_all ;;
        8) echo -e "${GREEN}👋 ¡Hasta luego!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Opción no válida${NC}" ;;
    esac
    echo
    read -p "Presiona Enter para continuar..."
    clear
done 