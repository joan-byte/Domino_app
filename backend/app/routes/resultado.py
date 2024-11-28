from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Resultado, Mesa, Pareja, Campeonato
from ..schemas import ResultadoCreate, Resultado as ResultadoSchema

router = APIRouter(prefix="/resultados", tags=["resultados"])

@router.post("/", response_model=List[ResultadoSchema])
def create_resultado(resultado1: ResultadoCreate, resultado2: ResultadoCreate, db: Session = Depends(get_db)):
    # Verificar que la mesa existe
    mesa = db.query(Mesa).filter(Mesa.id == resultado1.mesa_id).first()
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    
    # Verificar que los resultados corresponden a las parejas de la mesa
    if {resultado1.pareja_id, resultado2.pareja_id} != {mesa.pareja1_id, mesa.pareja2_id}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las parejas no corresponden a la mesa indicada"
        )
    
    # Verificar que no hay resultados previos para esta mesa
    existing = db.query(Resultado).filter(Resultado.mesa_id == mesa.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existen resultados para esta mesa"
        )
    
    # Calcular PG y PP
    pp1 = resultado2.rp - resultado1.rp
    pp2 = resultado1.rp - resultado2.rp
    
    pg1 = 1 if pp1 > 0 else 0
    pg2 = 1 if pp2 > 0 else 0
    
    # Crear resultados
    db_resultado1 = Resultado(
        pareja_id=resultado1.pareja_id,
        mesa_id=resultado1.mesa_id,
        partida=resultado1.partida,
        campeonato_id=resultado1.campeonato_id,
        rp=resultado1.rp,
        pp=pp1,
        pg=pg1,
        gb=resultado1.gb
    )
    
    db_resultado2 = Resultado(
        pareja_id=resultado2.pareja_id,
        mesa_id=resultado2.mesa_id,
        partida=resultado2.partida,
        campeonato_id=resultado2.campeonato_id,
        rp=resultado2.rp,
        pp=pp2,
        pg=pg2,
        gb=resultado2.gb
    )
    
    db.add(db_resultado1)
    db.add(db_resultado2)
    db.commit()
    
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
    pp1 = resultado2.rp - resultado1.rp
    pp2 = resultado1.rp - resultado2.rp
    
    pg1 = 1 if pp1 > 0 else 0
    pg2 = 1 if pp2 > 0 else 0
    
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