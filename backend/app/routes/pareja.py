from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import Pareja, Jugador, Campeonato
from ..schemas import ParejaCreate, Pareja as ParejaSchema
from sqlalchemy import desc

router = APIRouter(prefix="/parejas", tags=["parejas"])

def verificar_nombres_duplicados(db: Session, jugadores_data: List[dict], campeonato_id: int, pareja_id: int = None):
    """Verifica que no haya jugadores con el mismo nombre y apellido en el campeonato"""
    for jugador in jugadores_data:
        nombre = jugador["nombre"]
        apellido = jugador["apellido"]
        
        # Construir la consulta base
        query = db.query(Jugador).join(Pareja).filter(
            Jugador.nombre == nombre,
            Jugador.apellido == apellido,
            Pareja.campeonato_id == campeonato_id
        )
        
        # Si estamos actualizando, excluir la pareja actual
        if pareja_id:
            query = query.filter(Pareja.id != pareja_id)
        
        # Verificar si existe un jugador con el mismo nombre y apellido
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un jugador con nombre {nombre} {apellido} en el campeonato"
            )

@router.post("/", response_model=ParejaSchema)
def create_pareja(pareja: ParejaCreate, db: Session = Depends(get_db)):
    # Verificar que existe el campeonato
    campeonato = db.query(Campeonato).filter(Campeonato.id == pareja.campeonato_id).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    # Verificar que el campeonato no ha comenzado
    if campeonato.partida_actual > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden crear parejas una vez iniciado el campeonato"
        )
    
    # Verificar que hay exactamente 2 jugadores
    if len(pareja.jugadores) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Una pareja debe tener exactamente 2 jugadores"
        )
    
    # Verificar nombres duplicados
    verificar_nombres_duplicados(db, [{"nombre": j.nombre, "apellido": j.apellido} for j in pareja.jugadores], pareja.campeonato_id)
    
    try:
        # Crear la pareja
        db_pareja = Pareja(
            nombre=pareja.nombre,
            club_pertenencia=pareja.club_pertenencia,
            activa=pareja.activa,
            campeonato_id=pareja.campeonato_id
        )
        db.add(db_pareja)
        db.flush()  # Para obtener el id de la pareja
        
        # Crear los jugadores
        for jugador_data in pareja.jugadores:
            db_jugador = Jugador(
                nombre=jugador_data.nombre,
                apellido=jugador_data.apellido,
                pareja_id=db_pareja.id,
                campeonato_id=pareja.campeonato_id
            )
            db.add(db_jugador)
        
        db.commit()
        db.refresh(db_pareja)
        return db_pareja
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la pareja: {str(e)}"
        )

@router.get("/", response_model=List[ParejaSchema])
def get_parejas(campeonato_id: int, db: Session = Depends(get_db)):
    return db.query(Pareja)\
             .filter(Pareja.campeonato_id == campeonato_id)\
             .order_by(desc(Pareja.id))\
             .all()

@router.get("/{pareja_id}", response_model=ParejaSchema)
def get_pareja(pareja_id: int, db: Session = Depends(get_db)):
    try:
        # Obtener la pareja con sus jugadores usando joinedload
        pareja = db.query(Pareja)\
                  .options(joinedload(Pareja.jugadores))\
                  .filter(Pareja.id == pareja_id)\
                  .first()
        
        if not pareja:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pareja no encontrada"
            )
        
        return pareja
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la pareja: {str(e)}"
        )

@router.put("/{pareja_id}", response_model=ParejaSchema)
def update_pareja(pareja_id: int, pareja_update: ParejaCreate, db: Session = Depends(get_db)):
    try:
        # Verificar que existe la pareja
        pareja = db.query(Pareja).filter(Pareja.id == pareja_id).first()
        if not pareja:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pareja no encontrada"
            )
        
        # Verificar que el campeonato no ha comenzado
        campeonato = db.query(Campeonato).filter(Campeonato.id == pareja.campeonato_id).first()
        if campeonato.partida_actual > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pueden modificar parejas una vez iniciado el campeonato"
            )
        
        # Verificar que hay exactamente 2 jugadores
        if len(pareja_update.jugadores) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Una pareja debe tener exactamente 2 jugadores"
            )
        
        # Verificar nombres duplicados
        verificar_nombres_duplicados(
            db, 
            [{"nombre": j.nombre, "apellido": j.apellido} for j in pareja_update.jugadores], 
            pareja.campeonato_id,
            pareja_id
        )
        
        # Actualizar datos de la pareja
        pareja.nombre = pareja_update.nombre
        pareja.club_pertenencia = pareja_update.club_pertenencia
        
        # Eliminar jugadores actuales
        db.query(Jugador).filter(Jugador.pareja_id == pareja_id).delete()
        
        # Crear nuevos jugadores
        for jugador_data in pareja_update.jugadores:
            db_jugador = Jugador(
                nombre=jugador_data.nombre,
                apellido=jugador_data.apellido,
                pareja_id=pareja_id,
                campeonato_id=pareja.campeonato_id
            )
            db.add(db_jugador)
        
        db.commit()
        db.refresh(pareja)
        return pareja
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la pareja: {str(e)}"
        )

@router.put("/{pareja_id}/activar", response_model=ParejaSchema)
def toggle_pareja_activa(pareja_id: int, db: Session = Depends(get_db)):
    try:
        pareja = db.query(Pareja).filter(Pareja.id == pareja_id).first()
        if not pareja:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pareja no encontrada"
            )
        
        pareja.activa = not pareja.activa
        db.commit()
        db.refresh(pareja)
        return pareja
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cambiar el estado de la pareja: {str(e)}"
        )

@router.delete("/{pareja_id}")
def delete_pareja(pareja_id: int, db: Session = Depends(get_db)):
    try:
        pareja = db.query(Pareja).filter(Pareja.id == pareja_id).first()
        if not pareja:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pareja no encontrada"
            )
        
        # Verificar que el campeonato no ha comenzado
        campeonato = db.query(Campeonato).filter(Campeonato.id == pareja.campeonato_id).first()
        if campeonato.partida_actual > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pueden eliminar parejas una vez iniciado el campeonato"
            )
        
        # Eliminar jugadores asociados
        db.query(Jugador).filter(Jugador.pareja_id == pareja_id).delete()
        
        # Eliminar la pareja
        db.delete(pareja)
        db.commit()
        
        return {"message": "Pareja eliminada correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la pareja: {str(e)}"
        ) 