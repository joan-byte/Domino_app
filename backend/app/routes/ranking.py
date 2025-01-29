from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc, asc, case
from typing import List
from ..database import get_db
from ..models import Pareja, Resultado
from ..schemas.ranking import RankingPareja

router = APIRouter(prefix="/resultados", tags=["resultados"])

@router.get("/ranking", response_model=List[RankingPareja])
async def obtener_ranking(campeonato_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el ranking actual del campeonato, ordenado según los siguientes criterios:
    1. GB (último valor) ascendente
    2. PG (suma) descendente
    3. PP (suma) descendente
    4. RT (suma) descendente
    5. MG (suma) ascendente
    """
    # Subconsulta para obtener los resultados acumulados por pareja
    resultados_subquery = db.query(
        Resultado.pareja_id,
        func.coalesce(func.sum(Resultado.rt), 0).label('rt'),
        func.coalesce(func.sum(Resultado.mg), 0).label('mg'),
        func.coalesce(func.sum(Resultado.pp), 0).label('pp'),
        func.coalesce(func.sum(Resultado.pg), 0).label('pg'),
        func.max(Resultado.partida).label('ultima_partida'),
        func.count(Resultado.id).label('partidas_jugadas'),
        func.bool_or(Resultado.gb).label('gb')  # Obtiene el último valor de GB
    ).filter(
        Resultado.campeonato_id == campeonato_id
    ).group_by(
        Resultado.pareja_id
    ).subquery()

    # Consulta principal
    ranking_query = db.query(
        Pareja.id.label('numero'),
        Pareja.nombre.label('nombre'),
        Pareja.club_pertenencia.label('club'),
        func.coalesce(resultados_subquery.c.gb, False).label('gb'),  # Si no hay resultados, asume GB = False (Grupo A)
        func.coalesce(resultados_subquery.c.pp, 0).label('pp'),
        func.coalesce(resultados_subquery.c.rt, 0).label('rt'),
        func.coalesce(resultados_subquery.c.mg, 0).label('mg'),
        func.coalesce(resultados_subquery.c.pg, 0).label('pg'),
        func.coalesce(resultados_subquery.c.ultima_partida, 0).label('ultima_partida'),
        func.coalesce(resultados_subquery.c.partidas_jugadas, 0).label('partidas_jugadas')
    ).outerjoin(
        resultados_subquery,
        Pareja.id == resultados_subquery.c.pareja_id
    ).filter(
        Pareja.campeonato_id == campeonato_id
    ).order_by(
        asc(func.coalesce(resultados_subquery.c.gb, False)),
        desc(func.coalesce(resultados_subquery.c.pg, 0)),
        desc(func.coalesce(resultados_subquery.c.pp, 0)),
        desc(func.coalesce(resultados_subquery.c.rt, 0)),
        asc(func.coalesce(resultados_subquery.c.mg, 0))
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
            'mg': int(values['mg'])
        }
        result.append(pareja_dict)

    return result 