from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import Resultado, Mesa, Pareja, Campeonato
from ..schemas import ResultadoCreate, Resultado as ResultadoSchema
from sqlalchemy.sql import func
import logging

class ResultadoRequest(BaseModel):
    resultado1: ResultadoCreate
    resultado2: Optional[ResultadoCreate] = None

class ResultadoUpdateRequest(BaseModel):
    resultado1: ResultadoCreate
    resultado2: Optional[ResultadoCreate] = None

router = APIRouter(prefix="/resultados", tags=["resultados"])

# Verificar si el GB está activo y si estamos en la partida que corresponde
def debe_activar_gb(campeonato, partida_actual):
    if not campeonato.gb:
        return False
    
    # Para un campeonato de N partidas:
    # N/2 -> parte entera -> +1 = partida donde se activa GB
    partida_gb = (campeonato.numero_partidas // 2) + 1
    return campeonato.partida_actual == partida_gb

@router.post("/", response_model=List[ResultadoSchema])
def create_resultado(request: ResultadoRequest, db: Session = Depends(get_db)):
    # Verificar que la mesa existe
    mesa = db.query(Mesa).filter(Mesa.id == request.resultado1.mesa_id).first()
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    
    # Obtener el campeonato para verificar GB
    campeonato = db.query(Campeonato).filter(Campeonato.id == request.resultado1.campeonato_id).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )

    # Verificar si el GB está activo
    gb_activo = debe_activar_gb(campeonato, request.resultado1.partida)
    
    # Caso especial: Mesa con una sola pareja (pareja2_id is None)
    if mesa.pareja2_id is None:
        # Verificar que el resultado corresponde a la pareja1
        if request.resultado1.pareja_id != mesa.pareja1_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El resultado debe corresponder a la pareja 1"
            )
        
        # Buscar si ya existe un resultado para esta pareja en esta partida
        existing_resultado = db.query(Resultado).filter(
            Resultado.pareja_id == mesa.pareja1_id,
            Resultado.partida == request.resultado1.partida,
            Resultado.campeonato_id == request.resultado1.campeonato_id
        ).first()
        
        # Verificar si la pareja ya tiene GB en resultados anteriores
        tiene_gb_previo = db.query(Resultado).filter(
            Resultado.pareja_id == mesa.pareja1_id,
            Resultado.campeonato_id == request.resultado1.campeonato_id,
            Resultado.gb == True
        ).first() is not None

        # Si GB está activo y no tiene GB previo, verificar si está en las últimas mesas
        if gb_activo and not tiene_gb_previo:
            # Obtener todas las mesas de la partida actual ordenadas por ID
            mesas_partida = db.query(Mesa).filter(
                Mesa.campeonato_id == campeonato.id,
                Mesa.partida == request.resultado1.partida
            ).order_by(Mesa.id).all()
            
            total_mesas = len(mesas_partida)
            mitad_mesas = total_mesas // 2
            
            # Identificar las parejas que están en las últimas mesas
            parejas_gb = set()
            for m in mesas_partida[mitad_mesas:]:
                if m.pareja1_id:
                    parejas_gb.add(m.pareja1_id)
                if m.pareja2_id:
                    parejas_gb.add(m.pareja2_id)
            
            # Verificar si la pareja está en el conjunto de parejas GB
            tiene_gb_previo = mesa.pareja1_id in parejas_gb
        
        if existing_resultado:
            # Actualizar el resultado existente
            existing_resultado.rp = 150
            existing_resultado.pp = 150
            existing_resultado.pg = 1
            existing_resultado.gb = tiene_gb_previo
            db.commit()
            db.refresh(existing_resultado)
            return [existing_resultado]
        else:
            # Crear nuevo resultado
            db_resultado1 = Resultado(
                pareja_id=mesa.pareja1_id,
                mesa_id=mesa.id,
                partida=request.resultado1.partida,
                campeonato_id=request.resultado1.campeonato_id,
                rp=150,
                pp=150,
                pg=1,
                gb=tiene_gb_previo
            )
            db.add(db_resultado1)
            db.commit()
            db.refresh(db_resultado1)
            return [db_resultado1]
    
    # Caso normal: Mesa con dos parejas
    if not request.resultado2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requieren dos resultados para una mesa con dos parejas"
        )
    
    # Verificar que los resultados corresponden a las parejas de la mesa
    if {request.resultado1.pareja_id, request.resultado2.pareja_id} != {mesa.pareja1_id, mesa.pareja2_id}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las parejas no corresponden a la mesa indicada"
        )
    
    # Verificar si ya existen resultados para estas parejas en esta partida
    existing_pareja1 = db.query(Resultado).filter(
        Resultado.pareja_id == request.resultado1.pareja_id,
        Resultado.partida == request.resultado1.partida,
        Resultado.campeonato_id == request.resultado1.campeonato_id
    ).first()
    
    existing_pareja2 = db.query(Resultado).filter(
        Resultado.pareja_id == request.resultado2.pareja_id,
        Resultado.partida == request.resultado2.partida,
        Resultado.campeonato_id == request.resultado2.campeonato_id
    ).first()
    
    if existing_pareja1 or existing_pareja2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existen resultados registrados para esta partida"
        )
    
    # Calcular PG y PP
    pp1 = request.resultado1.rp - request.resultado2.rp
    pp2 = request.resultado2.rp - request.resultado1.rp
    pg1 = 1 if request.resultado1.rp > request.resultado2.rp else 0
    pg2 = 1 if request.resultado2.rp > request.resultado1.rp else 0
    
    # Verificar GB previo para cada pareja
    tiene_gb_previo1 = db.query(Resultado).filter(
        Resultado.pareja_id == request.resultado1.pareja_id,
        Resultado.campeonato_id == request.resultado1.campeonato_id,
        Resultado.gb == True
    ).first() is not None

    tiene_gb_previo2 = db.query(Resultado).filter(
        Resultado.pareja_id == request.resultado2.pareja_id,
        Resultado.campeonato_id == request.resultado2.campeonato_id,
        Resultado.gb == True
    ).first() is not None

    # Si el GB está activo y estamos a mitad de torneo, verificar si las parejas están en las últimas mesas
    if gb_activo and not (tiene_gb_previo1 and tiene_gb_previo2):
        # Obtener todas las mesas de la partida actual ordenadas por ID
        mesas_partida = db.query(Mesa).filter(
            Mesa.campeonato_id == campeonato.id,
            Mesa.partida == request.resultado1.partida
        ).order_by(Mesa.id).all()
        
        total_mesas = len(mesas_partida)
        mitad_mesas = total_mesas // 2
        
        # Identificar las parejas que están en las últimas mesas
        parejas_gb = set()
        for m in mesas_partida[mitad_mesas:]:
            if m.pareja1_id:
                parejas_gb.add(m.pareja1_id)
            if m.pareja2_id:
                parejas_gb.add(m.pareja2_id)
        
        # Verificar si las parejas están en el conjunto de parejas GB
        if not tiene_gb_previo1:
            tiene_gb_previo1 = request.resultado1.pareja_id in parejas_gb
        if not tiene_gb_previo2:
            tiene_gb_previo2 = request.resultado2.pareja_id in parejas_gb
    
    # Crear resultados
    db_resultado1 = Resultado(
        pareja_id=request.resultado1.pareja_id,
        mesa_id=request.resultado1.mesa_id,
        partida=request.resultado1.partida,
        campeonato_id=request.resultado1.campeonato_id,
        rp=request.resultado1.rp,
        pp=pp1,
        pg=pg1,
        gb=tiene_gb_previo1
    )
    
    db_resultado2 = Resultado(
        pareja_id=request.resultado2.pareja_id,
        mesa_id=request.resultado2.mesa_id,
        partida=request.resultado2.partida,
        campeonato_id=request.resultado2.campeonato_id,
        rp=request.resultado2.rp,
        pp=pp2,
        pg=pg2,
        gb=tiene_gb_previo2
    )
    
    db.add(db_resultado1)
    db.add(db_resultado2)
    db.commit()
    db.refresh(db_resultado1)
    db.refresh(db_resultado2)
    
    return [db_resultado1, db_resultado2]

@router.get("/ranking", response_model=List[dict])
def get_ranking(campeonato_id: int, db: Session = Depends(get_db)):
    logger = logging.getLogger(__name__)
    
    # Subconsulta para obtener el sumatorio de PG y PP por pareja, y el máximo valor de partida
    subquery = db.query(
        Resultado.pareja_id,
        func.sum(Resultado.pg).label('total_pg'),
        func.sum(Resultado.pp).label('total_pp'),
        func.bool_or(Resultado.gb).label('gb'),
        func.max(Resultado.partida).label('ultima_partida')
    ).filter(
        Resultado.campeonato_id == campeonato_id
    ).group_by(
        Resultado.pareja_id
    ).subquery()
    
    # Consulta principal que une las parejas con sus resultados
    ranking = db.query(
        Pareja,
        func.coalesce(subquery.c.total_pg, 0).label('total_pg'),
        func.coalesce(subquery.c.total_pp, 0).label('total_pp'),
        func.coalesce(subquery.c.gb, False).label('gb'),
        func.coalesce(subquery.c.ultima_partida, 0).label('ultima_partida')
    ).outerjoin(
        subquery,
        Pareja.id == subquery.c.pareja_id
    ).filter(
        Pareja.campeonato_id == campeonato_id,
        Pareja.activa == True
    ).order_by(
        func.coalesce(subquery.c.gb, False),  # GB ascendente
        func.coalesce(subquery.c.total_pg, 0).desc(),  # Total PG descendente
        func.coalesce(subquery.c.total_pp, 0).desc()   # Total PP descendente
    ).all()
    
    return [{
        'pareja_id': r[0].id,
        'numero': r[0].id,
        'nombre': r[0].nombre,
        'club': r[0].club_pertenencia,
        'pg': int(r[1] or 0),
        'pp': int(r[2] or 0),
        'gb': bool(r[3]),
        'ultima_partida': int(r[4] or 0),
        'activa': r[0].activa
    } for r in ranking]

@router.get("/mesa/{mesa_id}", response_model=List[ResultadoSchema])
def get_resultados_mesa(mesa_id: int, partida: int, db: Session = Depends(get_db)):
    return db.query(Resultado).filter(
        Resultado.mesa_id == mesa_id,
        Resultado.partida == partida
    ).all()

@router.put("/mesa/{mesa_id}", response_model=List[ResultadoSchema])
def update_resultados_mesa(
    mesa_id: int,
    request: ResultadoUpdateRequest,
    db: Session = Depends(get_db)
):
    # Verificar que existen resultados para la mesa
    resultados = db.query(Resultado).filter(
        Resultado.mesa_id == mesa_id,
        Resultado.partida == request.resultado1.partida
    ).all()
    
    if not resultados:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay resultados para esta mesa"
        )
    
    # Verificar que los resultados corresponden a las parejas de la mesa
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )

    if request.resultado2:
        # Caso normal: Mesa con dos parejas
        if {request.resultado1.pareja_id, request.resultado2.pareja_id} != {mesa.pareja1_id, mesa.pareja2_id}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Las parejas no corresponden a la mesa indicada"
            )
        
        # Calcular PG y PP
        pp1 = request.resultado1.rp - request.resultado2.rp
        pp2 = request.resultado2.rp - request.resultado1.rp
        pg1 = 1 if request.resultado1.rp > request.resultado2.rp else 0
        pg2 = 1 if request.resultado2.rp > request.resultado1.rp else 0
        
        # Actualizar resultados
        for resultado in resultados:
            if resultado.pareja_id == request.resultado1.pareja_id:
                resultado.rp = request.resultado1.rp
                resultado.pp = pp1
                resultado.pg = pg1
                resultado.gb = request.resultado1.gb
            else:
                resultado.rp = request.resultado2.rp
                resultado.pp = pp2
                resultado.pg = pg2
                resultado.gb = request.resultado2.gb
    else:
        # Caso especial: Mesa con una sola pareja
        if request.resultado1.pareja_id != mesa.pareja1_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La pareja no corresponde a la mesa indicada"
            )
        
        # La pareja existente mantiene RP=150 y PG=1
        resultado = resultados[0]
        resultado.rp = 150
        resultado.pp = 150
        resultado.pg = 1
        resultado.gb = request.resultado1.gb
    
    db.commit()
    return resultados

@router.get("/campeonato/{campeonato_id}", response_model=List[ResultadoSchema])
def get_resultados_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    # Verificar que el campeonato existe
    campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    return db.query(Resultado).filter(
        Resultado.campeonato_id == campeonato_id
    ).all()