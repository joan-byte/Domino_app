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
    Obtiene el ranking actual del campeonato, ordenado por puntos (de mayor a menor)
    """
    # Obtener todas las parejas del campeonato
    parejas = db.query(Pareja).filter(Pareja.campeonato_id == campeonato_id).all()
    
    ranking = []
    for pareja in parejas:
        # Obtener resultados donde la pareja participó
        resultados = db.query(Resultado).filter(
            (Resultado.pareja_id == pareja.id)
        ).all()
        
        # Calcular estadísticas
        partidos_jugados = len(resultados)
        victorias = sum(1 for r in resultados if r.puntos > 0)
        derrotas = partidos_jugados - victorias
        puntos_totales = sum(r.puntos for r in resultados)
        
        ranking.append(RankingPareja(
            id=pareja.id,
            nombre=pareja.nombre,
            puntos=puntos_totales,
            partidos_jugados=partidos_jugados,
            victorias=victorias,
            derrotas=derrotas,
            club_pertenencia=pareja.club_pertenencia
        ))
    
    # Ordenar por puntos (descendente)
    ranking.sort(key=lambda x: (-x.puntos, -x.victorias))
    
    return ranking 