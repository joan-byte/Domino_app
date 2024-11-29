from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import Pareja, Resultado
from ..schemas.ranking import RankingPareja

router = APIRouter(prefix="/ranking", tags=["ranking"])

@router.get("/{campeonato_id}", response_model=List[RankingPareja])
async def obtener_ranking(campeonato_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el ranking actual del campeonato, ordenado por puntos totales (de mayor a menor)
    """
    # Obtener todas las parejas del campeonato con sus puntos totales
    ranking = db.query(
        Pareja.id,
        Pareja.nombre,
        Pareja.club_pertenencia,
        func.count(Resultado.id).label('partidas_jugadas'),
        func.coalesce(func.sum(Resultado.puntos), 0).label('puntos_totales')
    ).outerjoin(Resultado).filter(
        Pareja.campeonato_id == campeonato_id
    ).group_by(
        Pareja.id
    ).order_by(
        func.coalesce(func.sum(Resultado.puntos), 0).desc()
    ).all()
    
    return [
        RankingPareja(
            id=r.id,
            nombre=r.nombre,
            club_pertenencia=r.club_pertenencia,
            partidas_jugadas=r.partidas_jugadas,
            puntos_totales=r.puntos_totales
        ) for r in ranking
    ] 