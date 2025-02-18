from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc, asc, case
from typing import List
from ..database import get_db
from ..models import Pareja, Resultado, Mesa, Campeonato
from ..schemas.ranking import RankingPareja

router = APIRouter(prefix="/resultados", tags=["resultados"])

@router.get("/ranking", response_model=List[RankingPareja])
async def obtener_ranking(campeonato_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el ranking actual del campeonato.
    Para la primera partida y siguientes, ordena según los criterios establecidos:
    - GB ascendente (grupo A antes que B)
    - PG como sumatorio descendente
    - PP como sumatorio descendente
    - RT como sumatorio descendente
    - MG como sumatorio ascendente
    """
    # Primero obtener el campeonato para saber en qué partida estamos
    campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not campeonato:
        raise HTTPException(status_code=404, detail="Campeonato no encontrado")

    # Obtener el orden del sorteo inicial
    orden_sorteo_subquery = db.query(
        Mesa.pareja1_id.label('pareja_id'),
        (Mesa.id * 2 - 1).label('orden')
    ).filter(
        Mesa.campeonato_id == campeonato_id,
        Mesa.partida == 1
    ).union(
        db.query(
            Mesa.pareja2_id.label('pareja_id'),
            (Mesa.id * 2).label('orden')
        ).filter(
            Mesa.campeonato_id == campeonato_id,
            Mesa.partida == 1,
            Mesa.pareja2_id != None
        )
    ).subquery()

    # Calcular sumatorios hasta la partida actual
    resultados_subquery = db.query(
        Resultado.pareja_id,
        func.sum(Resultado.rt).label('rt'),
        func.sum(Resultado.mg).label('mg'),
        func.sum(Resultado.pp).label('pp'),
        func.sum(Resultado.pg).label('pg'),
        func.max(Resultado.partida).label('ultima_partida'),
        func.count(Resultado.id).label('partidas_jugadas')
    ).filter(
        Resultado.campeonato_id == campeonato_id,
        Resultado.partida <= campeonato.partida_actual  # Solo hasta la partida actual
    ).group_by(
        Resultado.pareja_id
    ).subquery()

    # Consulta principal
    ranking_query = db.query(
        Pareja.id.label('numero'),
        Pareja.nombre.label('nombre'),
        Pareja.club_pertenencia.label('club'),
        Pareja.gb.label('gb'),
        func.coalesce(resultados_subquery.c.pp, 0).label('pp'),
        func.coalesce(resultados_subquery.c.rt, 0).label('rt'),
        func.coalesce(resultados_subquery.c.mg, 0).label('mg'),
        func.coalesce(resultados_subquery.c.pg, 0).label('pg'),
        func.coalesce(resultados_subquery.c.ultima_partida, 0).label('ultima_partida'),
        func.coalesce(resultados_subquery.c.partidas_jugadas, 0).label('partidas_jugadas'),
        orden_sorteo_subquery.c.orden.label('ordenSorteo')
    ).outerjoin(
        resultados_subquery,
        Pareja.id == resultados_subquery.c.pareja_id
    ).outerjoin(
        orden_sorteo_subquery,
        Pareja.id == orden_sorteo_subquery.c.pareja_id
    ).filter(
        Pareja.campeonato_id == campeonato_id,
        Pareja.activa == True
    )

    # Aplicar orden según la partida
    if campeonato.partida_actual == 1:
        ranking_query = ranking_query.order_by(orden_sorteo_subquery.c.orden)
    else:
        ranking_query = ranking_query.order_by(
            asc(Pareja.gb),  # GB ascendente (grupo A antes que B)
            desc(func.coalesce(resultados_subquery.c.pg, 0)),  # PG descendente
            desc(func.coalesce(resultados_subquery.c.pp, 0)),  # PP descendente
            desc(func.coalesce(resultados_subquery.c.rt, 0)),  # RT descendente
            asc(func.coalesce(resultados_subquery.c.mg, 0))    # MG ascendente
        )

    ranking = ranking_query.all()

    # Convertir los resultados a diccionarios
    result = []
    for r in ranking:
        values = r._asdict()
        pareja_dict = {
            'numero': int(values['numero']),
            'pareja_id': int(values['numero']),
            'nombre': str(values['nombre']),
            'club': str(values['club'] or ''),
            'gb': bool(values['gb']),
            'partidas_jugadas': int(values['partidas_jugadas']),
            'ultima_partida': int(values['ultima_partida']),
            'pp': int(values['pp']),
            'pg': int(values['pg']),
            'rt': int(values['rt']),
            'mg': int(values['mg']),
            'ordenSorteo': int(values['ordenSorteo'] or 0)
        }
        result.append(pareja_dict)

    return result 