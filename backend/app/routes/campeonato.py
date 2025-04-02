from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import logging
import random
import os
import shutil
from pathlib import Path
from ..database import get_db
from ..models.campeonato import Campeonato
from ..models.pareja import Pareja
from ..models.mesa import Mesa
from ..models.resultado import Resultado
from ..models.jugador import Jugador
from ..schemas.campeonato import CampeonatoCreate, CampeonatoUpdate, CampeonatoResponse
from ..schemas.pareja import Pareja as ParejaSchema
from sqlalchemy import text, desc

router = APIRouter(prefix="/campeonatos", tags=["campeonatos"])
logger = logging.getLogger(__name__) 

# Directorio para guardar las imágenes
LOGO_DIR = Path("static/logos")
# Asegurar que el directorio de logos existe
os.makedirs(LOGO_DIR, exist_ok=True)

@router.get("/{campeonato_id}/parejas", response_model=List[ParejaSchema])
def obtener_parejas_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Obteniendo parejas del campeonato {campeonato_id}")
        # Verificar que existe el campeonato
        campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Obtener todas las parejas del campeonato ordenadas por ID descendente
        parejas = db.query(Pareja)\
                    .filter(Pareja.campeonato_id == campeonato_id)\
                    .order_by(desc(Pareja.id))\
                    .all()
        return parejas
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al obtener parejas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las parejas: {str(e)}"
        )

def reset_database_sequences(db: Session):
    """Reinicia todas las secuencias de las tablas a 1"""
    tables = [
        'campeonatos',
        'parejas',
        'mesas',
        'resultados',
        'jugadores'
    ]
    
    try:
        for table in tables:
            # Reiniciar la secuencia de cada tabla
            db.execute(text(f"ALTER SEQUENCE {table}_id_seq RESTART WITH 1"))
        db.commit()
    except Exception as e:
        logger.error(f"Error al reiniciar secuencias: {str(e)}")
        db.rollback()
        raise

@router.post("/", response_model=CampeonatoResponse)
def crear_campeonato(campeonato: CampeonatoCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando crear nuevo campeonato: {campeonato.dict()}")
        # Verificar si hay un campeonato activo
        campeonato_activo = db.query(Campeonato).filter(Campeonato.activo == True).first()
        if campeonato_activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un campeonato activo"
            )
        
        # Reiniciar todas las secuencias
        reset_database_sequences(db)
        
        # Crear nuevo campeonato
        db_campeonato = Campeonato(
            nombre=campeonato.nombre,
            fecha_inicio=campeonato.fecha_inicio,
            dias_duracion=campeonato.dias_duracion,
            numero_partidas=campeonato.numero_partidas,
            gb=campeonato.gb,
            gb_valor=campeonato.gb_valor,
            activo=True,
            partida_actual=0,
            pm=campeonato.pm,
            logo=campeonato.logo
        )
        db.add(db_campeonato)
        db.commit()
        db.refresh(db_campeonato)
        logger.info(f"Campeonato creado exitosamente: {db_campeonato.id}")
        return db_campeonato
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al crear campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el campeonato: {str(e)}"
        )

@router.put("/{campeonato_id}", response_model=CampeonatoResponse)
def actualizar_campeonato(campeonato_id: int, campeonato: CampeonatoUpdate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando actualizar campeonato {campeonato_id}")
        db_campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not db_campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Actualizar campos del campeonato
        if campeonato.nombre is not None:
            db_campeonato.nombre = campeonato.nombre
        if campeonato.fecha_inicio is not None:
            db_campeonato.fecha_inicio = campeonato.fecha_inicio
        if campeonato.dias_duracion is not None:
            db_campeonato.dias_duracion = campeonato.dias_duracion
        if campeonato.numero_partidas is not None:
            db_campeonato.numero_partidas = campeonato.numero_partidas
        if campeonato.gb is not None:
            db_campeonato.gb = campeonato.gb
        if campeonato.gb_valor is not None:
            db_campeonato.gb_valor = campeonato.gb_valor
        if campeonato.pm is not None:
            db_campeonato.pm = campeonato.pm
        if campeonato.logo is not None:
            db_campeonato.logo = campeonato.logo
        
        db.commit()
        db.refresh(db_campeonato)
        logger.info(f"Campeonato {campeonato_id} actualizado exitosamente")
        return db_campeonato
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al actualizar campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el campeonato: {str(e)}"
        )

@router.get("/actual", response_model=CampeonatoResponse)
def obtener_campeonato_actual(db: Session = Depends(get_db)):
    try:
        campeonato = db.query(Campeonato).filter(Campeonato.activo == True).first()
        
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay campeonato activo"
            )
        
        # Convertir el modelo SQLAlchemy a un diccionario
        campeonato_dict = {
            "id": campeonato.id,
            "nombre": campeonato.nombre,
            "fecha_inicio": campeonato.fecha_inicio,
            "dias_duracion": campeonato.dias_duracion,
            "numero_partidas": campeonato.numero_partidas,
            "gb": campeonato.gb,
            "gb_valor": campeonato.gb_valor,
            "activo": campeonato.activo,
            "partida_actual": campeonato.partida_actual,
            "pm": campeonato.pm,
            "logo": campeonato.logo
        }
        
        return campeonato_dict
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el campeonato actual: {str(e)}"
        )

@router.delete("/{campeonato_id}")
def eliminar_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando eliminar campeonato {campeonato_id}")
        
        # Verificar si el campeonato existe
        db_campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not db_campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Eliminar el campeonato (el cascade se encargará del resto)
        db.delete(db_campeonato)
        db.commit()
        
        logger.info(f"Campeonato {campeonato_id} y datos relacionados eliminados exitosamente")
        return {"message": "Campeonato eliminado exitosamente"}
        
    except Exception as e:
        logger.error(f"Error al eliminar campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el campeonato: {str(e)}"
        )

@router.post("/{campeonato_id}/cerrar-inscripcion")
def cerrar_inscripcion(campeonato_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando cerrar inscripción del campeonato {campeonato_id}")
        
        # Verificar que existe el campeonato
        campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Verificar que el campeonato no ha comenzado
        if campeonato.partida_actual > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El campeonato ya ha comenzado"
            )
        
        # Obtener parejas activas
        parejas_activas = db.query(Pareja).filter(
            Pareja.campeonato_id == campeonato_id,
            Pareja.activa == True
        ).all()
        
        # Verificar número mínimo de parejas
        if len(parejas_activas) < 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Se necesitan al menos 4 parejas activas para comenzar"
            )
        
        # Crear mesas iniciales por sorteo
        parejas_ids = [p.id for p in parejas_activas]
        random.shuffle(parejas_ids)
        
        # Crear mesas
        for i in range(0, len(parejas_ids), 2):
            pareja1_id = parejas_ids[i]
            pareja2_id = parejas_ids[i + 1] if i + 1 < len(parejas_ids) else None
            
            mesa = Mesa(
                id=i//2 + 1,  # Mesa 1, 2, 3, etc.
                partida=1,
                pareja1_id=pareja1_id,
                pareja2_id=pareja2_id,
                campeonato_id=campeonato_id
            )
            db.add(mesa)
        
        # Actualizar estado del campeonato
        campeonato.partida_actual = 1
        db.commit()
        
        logger.info(f"Inscripción cerrada exitosamente para el campeonato {campeonato_id}")
        return {"message": "Inscripción cerrada exitosamente"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al cerrar inscripción: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cerrar la inscripción: {str(e)}"
        )

@router.put("/{campeonato_id}/reiniciar")
def reiniciar_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando reiniciar campeonato {campeonato_id}")
        
        # Verificar que existe el campeonato
        campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Reiniciar la partida actual a 0
        campeonato.partida_actual = 0
        db.commit()
        
        logger.info(f"Campeonato {campeonato_id} reiniciado exitosamente")
        return {"message": "Campeonato reiniciado exitosamente"}
        
    except Exception as e:
        logger.error(f"Error al reiniciar campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al reiniciar el campeonato: {str(e)}"
        )

@router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    """
    Sube una imagen de logo y devuelve la ruta para acceder a ella
    """
    try:
        logger.info(f"Subiendo archivo: {file.filename}")
        
        # Validar el tipo de archivo
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo debe ser una imagen"
            )
        
        # Crear un nombre seguro para el archivo
        file_extension = file.filename.split(".")[-1]
        file_name = f"logo_{random.randint(10000, 99999)}.{file_extension}"
        file_path = LOGO_DIR / file_name
        
        # Guardar el archivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Devolver la ruta relativa para acceder al archivo
        return {"logo_path": f"/static/logos/{file_name}"}
    
    except Exception as e:
        logger.error(f"Error al subir logo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir la imagen: {str(e)}"
        )

@router.post("/{campeonato_id}/retroceder-partida")
def retroceder_partida(campeonato_id: int, db: Session = Depends(get_db)):
    """
    Retrocede a la partida anterior si no hay resultados en la partida actual.
    Primero verifica si hay resultados en la partida actual.
    Si hay resultados, retorna un error.
    Si no hay resultados, retrocede a la partida anterior y elimina las mesas de la partida actual.
    """
    try:
        logger.info(f"Intentando retroceder partida del campeonato {campeonato_id}")
        
        # Verificar que existe el campeonato
        campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Verificar que el campeonato ha comenzado
        if campeonato.partida_actual <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede retroceder desde la primera partida"
            )
        
        # Verificar si hay resultados en la partida actual
        resultados = db.query(Resultado).filter(
            Resultado.campeonato_id == campeonato_id,
            Resultado.partida == campeonato.partida_actual
        ).all()
        
        if resultados:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede retroceder porque ya hay resultados registrados en la partida actual"
            )
        
        # Guardar la partida anterior para devolverla en la respuesta
        partida_anterior = campeonato.partida_actual - 1
        
        # Eliminar las mesas de la partida actual
        db.query(Mesa).filter(
            Mesa.campeonato_id == campeonato_id,
            Mesa.partida == campeonato.partida_actual
        ).delete()
        
        # Actualizar la partida actual
        campeonato.partida_actual = partida_anterior
        db.commit()
        
        # Obtener información de las mesas de la partida anterior para devolverla en la respuesta
        mesas_partida_anterior = db.query(Mesa).filter(
            Mesa.campeonato_id == campeonato_id,
            Mesa.partida == partida_anterior
        ).all()
        
        logger.info(f"Partida retrocedida exitosamente para el campeonato {campeonato_id}")
        return {
            "message": "Partida retrocedida exitosamente",
            "partida_actual": partida_anterior,
            "campeonato_actual": campeonato,
            "mesas_count": len(mesas_partida_anterior)
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al retroceder partida: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al retroceder la partida: {str(e)}"
        ) 