from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Pareja, Jugador, Campeonato
from ..schemas import ParejaCreate, Pareja as ParejaSchema

router = APIRouter(prefix="/parejas", tags=["parejas"])

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
            **jugador_data.model_dump(),
            pareja_id=db_pareja.id,
            campeonato_id=pareja.campeonato_id
        )
        db.add(db_jugador)
    
    db.commit()
    db.refresh(db_pareja)
    return db_pareja

@router.get("/", response_model=List[ParejaSchema])
def get_parejas(campeonato_id: int, db: Session = Depends(get_db)):
    return db.query(Pareja).filter(Pareja.campeonato_id == campeonato_id).all()

@router.get("/{pareja_id}", response_model=ParejaSchema)
def get_pareja(pareja_id: int, db: Session = Depends(get_db)):
    pareja = db.query(Pareja).filter(Pareja.id == pareja_id).first()
    if not pareja:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pareja no encontrada"
        )
    return pareja

@router.put("/{pareja_id}/activar")
def toggle_pareja_activa(pareja_id: int, db: Session = Depends(get_db)):
    pareja = db.query(Pareja).filter(Pareja.id == pareja_id).first()
    if not pareja:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pareja no encontrada"
        )
    
    pareja.activa = not pareja.activa
    db.commit()
    return {"message": f"Pareja {'activada' if pareja.activa else 'desactivada'} correctamente"}

@router.put("/{pareja_id}", response_model=ParejaSchema)
def update_pareja(
    pareja_id: int,
    pareja_update: ParejaCreate,
    db: Session = Depends(get_db)
):
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
    
    # Actualizar datos de la pareja
    pareja.nombre = pareja_update.nombre
    pareja.club_pertenencia = pareja_update.club_pertenencia
    
    # Actualizar jugadores
    if len(pareja_update.jugadores) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Una pareja debe tener exactamente 2 jugadores"
        )
    
    # Eliminar jugadores actuales
    db.query(Jugador).filter(Jugador.pareja_id == pareja_id).delete()
    
    # Crear nuevos jugadores
    for jugador_data in pareja_update.jugadores:
        db_jugador = Jugador(
            **jugador_data.model_dump(),
            pareja_id=pareja_id,
            campeonato_id=pareja.campeonato_id
        )
        db.add(db_jugador)
    
    db.commit()
    db.refresh(pareja)
    return pareja

@router.delete("/{pareja_id}")
def delete_pareja(pareja_id: int, db: Session = Depends(get_db)):
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