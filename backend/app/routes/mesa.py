from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import random
from ..database import get_db
from ..models import Mesa, Pareja, Campeonato, Resultado
from ..schemas import MesaCreate, Mesa as MesaSchema

router = APIRouter(prefix="/mesas", tags=["mesas"])

@router.post("/sorteo", response_model=List[MesaSchema])
def crear_mesas_sorteo(campeonato_id: int, db: Session = Depends(get_db)):
    # Verificar que existe el campeonato
    campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    # Verificar que es la primera partida
    if campeonato.partida_actual != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El sorteo solo se puede realizar en la primera partida"
        )
    
    # Obtener parejas activas
    parejas_activas = db.query(Pareja).filter(
        Pareja.campeonato_id == campeonato_id,
        Pareja.activa == True
    ).all()
    
    # Verificar que hay al menos 4 parejas
    if len(parejas_activas) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se necesitan al menos 4 parejas activas para comenzar"
        )
    
    # Mezclar parejas aleatoriamente
    parejas_ids = [p.id for p in parejas_activas]
    random.shuffle(parejas_ids)
    
    # Crear mesas
    mesas = []
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
        mesas.append(mesa)
    
    # Actualizar partida actual del campeonato
    campeonato.partida_actual = 1
    
    db.commit()
    return mesas

@router.post("/ranking", response_model=List[MesaSchema])
def crear_mesas_ranking(campeonato_id: int, db: Session = Depends(get_db)):
    # Verificar que existe el campeonato
    campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    # Verificar que no es la primera partida
    if campeonato.partida_actual == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La primera partida debe ser por sorteo"
        )
    
    # Verificar que no se excede el número de partidas
    if campeonato.partida_actual >= campeonato.numero_partidas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya se han jugado todas las partidas del campeonato"
        )
    
    # Obtener parejas activas ordenadas por ranking
    parejas_ranking = db.query(
        Pareja,
        db.func.sum(Resultado.pg).label('total_pg'),
        db.func.sum(Resultado.pp).label('total_pp')
    ).join(Resultado).filter(
        Pareja.campeonato_id == campeonato_id,
        Pareja.activa == True
    ).group_by(Pareja.id).order_by(
        'total_pg.desc()',
        'total_pp.desc()'
    ).all()
    
    # Crear mesas según ranking
    mesas = []
    parejas_ids = [p[0].id for p in parejas_ranking]
    
    for i in range(0, len(parejas_ids), 2):
        pareja1_id = parejas_ids[i]
        pareja2_id = parejas_ids[i + 1] if i + 1 < len(parejas_ids) else None
        
        mesa = Mesa(
            partida=campeonato.partida_actual + 1,
            pareja1_id=pareja1_id,
            pareja2_id=pareja2_id,
            campeonato_id=campeonato_id
        )
        db.add(mesa)
        mesas.append(mesa)
    
    # Actualizar partida actual del campeonato
    campeonato.partida_actual += 1
    
    db.commit()
    return mesas

@router.get("/", response_model=List[MesaSchema])
def get_mesas(campeonato_id: int, partida: int, db: Session = Depends(get_db)):
    return db.query(Mesa).filter(
        Mesa.campeonato_id == campeonato_id,
        Mesa.partida == partida
    ).options(
        joinedload(Mesa.pareja1),
        joinedload(Mesa.pareja2)
    ).all()

@router.get("/{mesa_id}", response_model=MesaSchema)
def get_mesa(mesa_id: int, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    return mesa 