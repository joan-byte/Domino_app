from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import random
from ..database import get_db
from ..models import Mesa, Pareja, Campeonato, Resultado
from ..schemas import MesaCreate, Mesa as MesaSchema
from sqlalchemy import func, text

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
            id=i//2 + 1,  # Mesa 1, 2, 3, etc.
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
    try:
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
            func.sum(Resultado.pg).label('total_pg'),
            func.sum(Resultado.pp).label('total_pp'),
            func.bool_or(Resultado.gb).label('gb')
        ).join(
            Resultado,
            Pareja.id == Resultado.pareja_id
        ).filter(
            Pareja.campeonato_id == campeonato_id,
            Pareja.activa == True
        ).group_by(
            Pareja.id
        ).order_by(
            func.coalesce(func.bool_or(Resultado.gb), False),  # GB ascendente
            func.coalesce(func.sum(Resultado.pg), 0).desc(),  # Total PG descendente
            func.coalesce(func.sum(Resultado.pp), 0).desc()   # Total PP descendente
        ).all()

        # Preparar las nuevas mesas
        nueva_partida = campeonato.partida_actual + 1
        parejas_ids = [p[0].id for p in parejas_ranking]
        nuevas_mesas = []
        
        # Crear los valores para la inserción
        valores_mesas = []
        for i in range(0, len(parejas_ids), 2):
            pareja1_id = parejas_ids[i]
            pareja2_id = parejas_ids[i + 1] if i + 1 < len(parejas_ids) else None
            
            valores_mesas.append({
                'id': i//2 + 1,
                'partida': nueva_partida,
                'pareja1_id': pareja1_id,
                'pareja2_id': pareja2_id,
                'campeonato_id': campeonato_id
            })

        # Ejecutar las operaciones en orden usando SQL directo
        # 1. Desactivar la restricción de clave foránea
        db.execute(text("ALTER TABLE resultados DROP CONSTRAINT IF EXISTS resultados_mesa_id_fkey"))
        
        # 2. Eliminar las mesas antiguas
        db.execute(
            text("DELETE FROM mesas WHERE campeonato_id = :campeonato_id AND partida = :partida"),
            {'campeonato_id': campeonato_id, 'partida': campeonato.partida_actual}
        )
        
        # 3. Insertar las nuevas mesas
        for valores in valores_mesas:
            db.execute(
                text("INSERT INTO mesas (id, partida, pareja1_id, pareja2_id, campeonato_id) VALUES (:id, :partida, :pareja1_id, :pareja2_id, :campeonato_id)"),
                valores
            )
        
        # 4. Actualizar el contador de partidas
        db.execute(
            text("UPDATE campeonatos SET partida_actual = :nueva_partida WHERE id = :campeonato_id"),
            {'nueva_partida': nueva_partida, 'campeonato_id': campeonato_id}
        )
        
        # 5. Restaurar la restricción de clave foránea
        db.execute(text("ALTER TABLE resultados ADD CONSTRAINT resultados_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES mesas(id)"))
        
        # 6. Commit los cambios
        db.commit()
        
        # 7. Retornar las nuevas mesas
        return db.query(Mesa).filter(
            Mesa.campeonato_id == campeonato_id,
            Mesa.partida == nueva_partida
        ).all()
        
    except Exception as e:
        db.rollback()
        # Asegurarse de restaurar la restricción de clave foránea en caso de error
        db.execute(text("ALTER TABLE resultados ADD CONSTRAINT resultados_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES mesas(id)"))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

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