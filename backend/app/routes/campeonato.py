from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, init_db
from ..models.campeonato import Campeonato
from ..models.resultado import Resultado
from ..models.mesa import Mesa
from ..models.pareja import Pareja
from ..schemas.campeonato import CampeonatoCreate, CampeonatoResponse, CampeonatoUpdate
from ..schemas.pareja import Pareja as ParejaSchema
from sqlalchemy import desc, func, text
import logging
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import random

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/campeonatos",
    tags=["campeonatos"]
)

def reset_database_sequences(db: Session):
    """Reinicia todas las secuencias de las tablas a 1"""
    tables = [
        'campeonatos',
        'parejas',
        'mesas',
        'resultados'
    ]
    
    try:
        for table in tables:
            # Eliminar todos los registros de la tabla
            db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
        db.commit()
    except Exception as e:
        logger.error(f"Error al reiniciar secuencias: {str(e)}")
        db.rollback()
        raise

def eliminar_datos_relacionados(db: Session, campeonato_id: int):
    """Elimina todos los datos relacionados con un campeonato en el orden correcto"""
    try:
        # Eliminar resultados
        db.query(Resultado).filter(Resultado.campeonato_id == campeonato_id).delete()
        
        # Eliminar mesas
        db.query(Mesa).filter(Mesa.campeonato_id == campeonato_id).delete()
        
        # Eliminar parejas
        db.query(Pareja).filter(Pareja.campeonato_id == campeonato_id).delete()
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

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
        
        # Reiniciar todas las secuencias antes de crear el nuevo campeonato
        reset_database_sequences(db)
        
        # Crear nuevo campeonato
        db_campeonato = Campeonato(
            nombre=campeonato.nombre,
            fecha_inicio=campeonato.fecha_inicio,
            dias_duracion=campeonato.dias_duracion,
            numero_partidas=campeonato.numero_partidas,
            gb=campeonato.gb,
            activo=True,
            partida_actual=0
        )
        db.add(db_campeonato)
        db.commit()
        db.refresh(db_campeonato)
        logger.info(f"Campeonato creado exitosamente: {db_campeonato.id}")
        return CampeonatoResponse(
            id=db_campeonato.id,
            nombre=db_campeonato.nombre,
            fecha_inicio=db_campeonato.fecha_inicio,
            dias_duracion=db_campeonato.dias_duracion,
            numero_partidas=db_campeonato.numero_partidas,
            gb=db_campeonato.gb,
            activo=db_campeonato.activo,
            partida_actual=db_campeonato.partida_actual
        )
    except HTTPException as he:
        logger.error(f"Error HTTP al crear campeonato: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al crear campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el campeonato: {str(e)}"
        )

@router.put("/{campeonato_id}", response_model=CampeonatoResponse)
def actualizar_campeonato(
    campeonato_id: int,
    campeonato: CampeonatoUpdate,
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Intentando actualizar campeonato {campeonato_id}")
        db_campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not db_campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Actualizar campos
        for key, value in campeonato.dict(exclude_unset=True).items():
            setattr(db_campeonato, key, value)
        
        db.commit()
        db.refresh(db_campeonato)
        logger.info(f"Campeonato {campeonato_id} actualizado exitosamente")
        
        return CampeonatoResponse(
            id=db_campeonato.id,
            nombre=db_campeonato.nombre,
            fecha_inicio=db_campeonato.fecha_inicio,
            dias_duracion=db_campeonato.dias_duracion,
            numero_partidas=db_campeonato.numero_partidas,
            gb=db_campeonato.gb,
            activo=db_campeonato.activo,
            partida_actual=db_campeonato.partida_actual
        )
    except HTTPException as he:
        logger.error(f"Error HTTP al actualizar campeonato: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al actualizar campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el campeonato: {str(e)}"
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
        
        # Eliminar registros relacionados usando SQL directo
        db.execute(text("DELETE FROM resultados WHERE campeonato_id = :id"), {"id": campeonato_id})
        db.execute(text("DELETE FROM mesas WHERE campeonato_id = :id"), {"id": campeonato_id})
        db.execute(text("DELETE FROM parejas WHERE campeonato_id = :id"), {"id": campeonato_id})
        
        # Eliminar el campeonato
        db.execute(text("DELETE FROM campeonatos WHERE id = :id"), {"id": campeonato_id})
        
        db.commit()
        logger.info(f"Campeonato {campeonato_id} y datos relacionados eliminados exitosamente")
        return {"message": "Campeonato eliminado exitosamente"}
    except HTTPException as he:
        logger.error(f"Error HTTP al eliminar campeonato: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al eliminar campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el campeonato: {str(e)}"
        )

@router.get("/actual", response_model=CampeonatoResponse)
def obtener_campeonato_actual(db: Session = Depends(get_db)):
    try:
        logger.info("Intentando obtener campeonato actual")
        campeonato = db.query(Campeonato).filter(Campeonato.activo == True).first()
        if not campeonato:
            logger.info("No se encontró ningún campeonato activo")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay campeonato activo"
            )
        logger.info(f"Campeonato actual encontrado: {campeonato.id}")
        return CampeonatoResponse(
            id=campeonato.id,
            nombre=campeonato.nombre,
            fecha_inicio=campeonato.fecha_inicio,
            dias_duracion=campeonato.dias_duracion,
            numero_partidas=campeonato.numero_partidas,
            gb=campeonato.gb,
            activo=campeonato.activo,
            partida_actual=campeonato.partida_actual
        )
    except HTTPException as he:
        logger.error(f"Error HTTP al obtener campeonato actual: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al obtener campeonato actual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el campeonato actual: {str(e)}"
        )

@router.get("/", response_model=List[CampeonatoResponse])
def listar_campeonatos(db: Session = Depends(get_db)):
    try:
        logger.info("Listando todos los campeonatos")
        campeonatos = db.query(Campeonato).order_by(desc(Campeonato.fecha_inicio)).all()
        return [
            CampeonatoResponse(
                id=c.id,
                nombre=c.nombre,
                fecha_inicio=c.fecha_inicio,
                dias_duracion=c.dias_duracion,
                numero_partidas=c.numero_partidas,
                gb=c.gb,
                activo=c.activo,
                partida_actual=c.partida_actual
            ) for c in campeonatos
        ]
    except Exception as e:
        logger.error(f"Error al listar campeonatos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar los campeonatos: {str(e)}"
        )

@router.put("/{campeonato_id}/finalizar")
def finalizar_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando finalizar campeonato: {campeonato_id}")
        campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        campeonato.activo = False
        db.commit()
        logger.info(f"Campeonato {campeonato_id} finalizado exitosamente")
        return {"message": "Campeonato finalizado exitosamente"}
    except HTTPException as he:
        logger.error(f"Error HTTP al finalizar campeonato: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al finalizar campeonato: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al finalizar el campeonato: {str(e)}"
        )

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
        logger.error(f"Error HTTP al obtener parejas: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al obtener parejas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las parejas: {str(e)}"
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
        logger.error(f"Error HTTP al cerrar inscripción: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error al cerrar inscripción: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cerrar la inscripción: {str(e)}"
        ) 