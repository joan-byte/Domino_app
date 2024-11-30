from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import Resultado, Mesa, Pareja, Campeonato
from ..schemas import ResultadoCreate, Resultado as ResultadoSchema

class ResultadoRequest(BaseModel):
    resultado1: ResultadoCreate
    resultado2: Optional[ResultadoCreate] = None

router = APIRouter(prefix="/resultados", tags=["resultados"])

@router.post("/", response_model=List[ResultadoSchema])
def create_resultado(request: ResultadoRequest, db: Session = Depends(get_db)):
    # Verificar que la mesa existe
    mesa = db.query(Mesa).filter(Mesa.id == request.resultado1.mesa_id).first()
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    
    # Verificar que las parejas no tengan resultados previos en esta partida
    existing_pareja1 = db.query(Resultado).filter(
        Resultado.pareja_id == request.resultado1.pareja_id,
        Resultado.partida == request.resultado1.partida,
        Resultado.campeonato_id == request.resultado1.campeonato_id
    ).first()
    
    if existing_pareja1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La pareja {request.resultado1.pareja_id} ya tiene un resultado registrado para esta partida"
        )
    
    if request.resultado2:
        existing_pareja2 = db.query(Resultado).filter(
            Resultado.pareja_id == request.resultado2.pareja_id,
            Resultado.partida == request.resultado2.partida,
            Resultado.campeonato_id == request.resultado2.campeonato_id
        ).first()
        
        if existing_pareja2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La pareja {request.resultado2.pareja_id} ya tiene un resultado registrado para esta partida"
            )
    
    # Caso especial: Mesa con una sola pareja (pareja2_id es None)
    if mesa.pareja2_id is None:
        # Verificar que el resultado corresponde a la pareja1
        if request.resultado1.pareja_id != mesa.pareja1_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El resultado debe corresponder a la pareja 1"
            )
        
        # La pareja existente automáticamente obtiene RP=150 y PG=1
        db_resultado1 = Resultado(
            pareja_id=mesa.pareja1_id,
            mesa_id=mesa.id,
            partida=request.resultado1.partida,
            campeonato_id=request.resultado1.campeonato_id,
            rp=150,
            pp=150,
            pg=1,
            gb=request.resultado1.gb
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
    
    # Calcular PG y PP
    pp1 = request.resultado1.rp - request.resultado2.rp
    pp2 = request.resultado2.rp - request.resultado1.rp
    
    # PG se asigna a la pareja con mayor RP
    pg1 = 1 if request.resultado1.rp > request.resultado2.rp else 0
    pg2 = 1 if request.resultado2.rp > request.resultado1.rp else 0
    
    # Crear resultados
    db_resultado1 = Resultado(
        pareja_id=request.resultado1.pareja_id,
        mesa_id=request.resultado1.mesa_id,
        partida=request.resultado1.partida,
        campeonato_id=request.resultado1.campeonato_id,
        rp=request.resultado1.rp,
        pp=pp1,
        pg=pg1,
        gb=request.resultado1.gb
    )
    
    db_resultado2 = Resultado(
        pareja_id=request.resultado2.pareja_id,
        mesa_id=request.resultado2.mesa_id,
        partida=request.resultado2.partida,
        campeonato_id=request.resultado2.campeonato_id,
        rp=request.resultado2.rp,
        pp=pp2,
        pg=pg2,
        gb=request.resultado2.gb
    )
    
    db.add(db_resultado1)
    db.add(db_resultado2)
    db.commit()
    db.refresh(db_resultado1)
    db.refresh(db_resultado2)
    
    return [db_resultado1, db_resultado2]

@router.get("/ranking", response_model=List[dict])
def get_ranking(campeonato_id: int, db: Session = Depends(get_db)):
    # Obtener el ranking de parejas
    ranking = db.query(
        Pareja,
        db.func.sum(Resultado.pg).label('total_pg'),
        db.func.sum(Resultado.pp).label('total_pp'),
        db.func.bool_or(Resultado.gb).label('gb')
    ).join(Resultado).filter(
        Pareja.campeonato_id == campeonato_id
    ).group_by(Pareja.id).order_by(
        'gb.asc()',
        'total_pg.desc()',
        'total_pp.desc()'
    ).all()
    
    return [{
        'pareja_id': r[0].id,
        'nombre': r[0].nombre,
        'club': r[0].club_pertenencia,
        'pg': r[1],
        'pp': r[2],
        'gb': r[3],
        'activa': r[0].activa
    } for r in ranking]

@router.get("/mesa/{mesa_id}", response_model=List[ResultadoSchema])
def get_resultados_mesa(mesa_id: int, db: Session = Depends(get_db)):
    return db.query(Resultado).filter(Resultado.mesa_id == mesa_id).all()

@router.put("/mesa/{mesa_id}", response_model=List[ResultadoSchema])
def update_resultados_mesa(
    mesa_id: int,
    resultado1: ResultadoCreate,
    resultado2: ResultadoCreate,
    db: Session = Depends(get_db)
):
    # Verificar que existen resultados para la mesa
    resultados = db.query(Resultado).filter(Resultado.mesa_id == mesa_id).all()
    if not resultados:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay resultados para esta mesa"
        )
    
    # Calcular nuevos PG y PP
    pp1 = resultado1.rp - resultado2.rp
    pp2 = resultado2.rp - resultado1.rp
    
    # PG se asigna a la pareja con mayor RP
    pg1 = 1 if resultado1.rp > resultado2.rp else 0
    pg2 = 1 if resultado2.rp > resultado1.rp else 0
    
    # Actualizar resultados
    for resultado in resultados:
        if resultado.pareja_id == resultado1.pareja_id:
            resultado.rp = resultado1.rp
            resultado.pp = pp1
            resultado.pg = pg1
            resultado.gb = resultado1.gb
        else:
            resultado.rp = resultado2.rp
            resultado.pp = pp2
            resultado.pg = pg2
            resultado.gb = resultado2.gb
    
    db.commit()
    return resultados 

@router.get("/campeonato/{campeonato_id}", response_model=List[ResultadoSchema])
def get_resultados_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    """Obtener todos los resultados de un campeonato"""
    return db.query(Resultado).filter(Resultado.campeonato_id == campeonato_id).all()