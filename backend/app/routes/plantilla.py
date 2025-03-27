from fastapi import APIRouter, File, UploadFile, HTTPException, status, Request
from fastapi.responses import FileResponse
import os
import random
import shutil
import logging
import pathlib
from typing import Optional

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plantillas", tags=["plantillas"])

# Definir las rutas para las plantillas
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
PLANTILLAS_DIR = BASE_DIR / "static" / "plantillas"

# Crear el directorio si no existe
os.makedirs(PLANTILLAS_DIR, exist_ok=True)

# Nombre fijo para la plantilla de mesas
PLANTILLA_MESAS_FILENAME = "plantilla_mesas.png"

@router.post("/mesas", status_code=status.HTTP_201_CREATED)
async def upload_plantilla_mesas(request: Request, file: UploadFile = File(...)):
    """
    Sube una imagen de plantilla para las mesas y la guarda con un nombre fijo
    """
    try:
        logger.info(f"Subiendo plantilla de mesas: {file.filename}")
        
        # Validar el tipo de archivo
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo debe ser una imagen"
            )
        
        # Definir la ruta completa del archivo
        file_path = PLANTILLAS_DIR / PLANTILLA_MESAS_FILENAME
        
        # Guardar el archivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Obtener la URL base del servidor
        base_url = str(request.base_url).rstrip('/')
        
        # Construir URL completa
        full_url = f"{base_url}/static/plantillas/{PLANTILLA_MESAS_FILENAME}"
        
        # Log para depuración
        logger.info(f"URL completa generada: {full_url}")
        
        # Devolver la URL completa para acceder al archivo
        return {"url": full_url}
    
    except Exception as e:
        logger.error(f"Error al subir plantilla de mesas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir la plantilla: {str(e)}"
        )

@router.get("/mesas")
async def get_plantilla_mesas(request: Request):
    """
    Devuelve la URL de la plantilla de mesas si existe
    """
    file_path = PLANTILLAS_DIR / PLANTILLA_MESAS_FILENAME
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe una plantilla de mesas"
        )
    
    # Obtener la URL base del servidor
    base_url = str(request.base_url).rstrip('/')
    
    # Construir URL completa
    full_url = f"{base_url}/static/plantillas/{PLANTILLA_MESAS_FILENAME}"
    
    # Log para depuración
    logger.info(f"URL completa recuperada: {full_url}")
    
    return {"url": full_url} 