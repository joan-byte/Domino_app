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

@router.post("/ranking")
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
        
        # Si es la última partida, no crear nuevas mesas
        if campeonato.partida_actual == campeonato.numero_partidas:
            return {"mesas": [], "ranking_actualizado": True}

        # Verificar que no se excede el número de partidas
        if campeonato.partida_actual > campeonato.numero_partidas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya se han jugado todas las partidas del campeonato"
            )

        nueva_partida = campeonato.partida_actual + 1

        # Eliminar todas las mesas existentes del campeonato
        db.query(Mesa).filter(Mesa.campeonato_id == campeonato_id).delete()

        # Verificar si estamos en la partida GBP y necesitamos asignar GB=B
        if campeonato.gb and campeonato.partida_actual == campeonato.gb_valor:
            # Obtener todas las parejas ordenadas por ranking actual
            parejas_ranking = db.query(
                Pareja,
                func.coalesce(func.sum(Resultado.pg), 0).label('total_pg'),
                func.coalesce(func.sum(Resultado.pp), 0).label('total_pp')
            ).outerjoin(
                Resultado,
                (Pareja.id == Resultado.pareja_id) & 
                (Resultado.partida <= campeonato.partida_actual)
            ).filter(
                Pareja.campeonato_id == campeonato_id,
                Pareja.activa == True
            ).group_by(
                Pareja.id
            ).order_by(
                func.coalesce(func.sum(Resultado.pg), 0).desc(),
                func.coalesce(func.sum(Resultado.pp), 0).desc()
            ).all()

            # Calcular el índice desde donde empiezan las parejas GB=B
            total_parejas = len(parejas_ranking)
            indice_gb_b = total_parejas // 2

            # Marcar parejas como GB=B
            for pareja_info in parejas_ranking[indice_gb_b:]:
                pareja = pareja_info[0]
                db.query(Pareja).filter(Pareja.id == pareja.id).update({"gb": True})

        # Obtener parejas activas ordenadas por ranking actual
        parejas_ranking = db.query(
            Pareja,
            func.coalesce(func.sum(Resultado.pg), 0).label('total_pg'),
            func.coalesce(func.sum(Resultado.pp), 0).label('total_pp'),
            func.coalesce(func.sum(Resultado.rt), 0).label('total_rt'),
            func.coalesce(func.sum(Resultado.mg), 0).label('total_mg')
        ).outerjoin(
            Resultado,
            (Pareja.id == Resultado.pareja_id) & 
            (Resultado.partida <= campeonato.partida_actual)
        ).filter(
            Pareja.campeonato_id == campeonato_id,
            Pareja.activa == True
        ).group_by(
            Pareja.id
        ).order_by(
            Pareja.gb.asc(),  # False antes que True
            func.coalesce(func.sum(Resultado.pg), 0).desc(),
            func.coalesce(func.sum(Resultado.pp), 0).desc(),
            func.coalesce(func.sum(Resultado.rt), 0).desc(),
            func.coalesce(func.sum(Resultado.mg), 0).asc()
        ).all()

        if not parejas_ranking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay parejas activas para crear mesas"
            )

        # Separar parejas por GB manteniendo el orden del ranking
        parejas_ordenadas = []
        for pareja_info in parejas_ranking:
            pareja = pareja_info[0]
            total_pg = pareja_info[1]
            total_pp = pareja_info[2]
            total_rt = pareja_info[3]
            total_mg = pareja_info[4]
            
            parejas_ordenadas.append({
                'pareja': pareja,
                'total_pg': total_pg,
                'total_pp': total_pp,
                'total_rt': total_rt,
                'total_mg': total_mg
            })

        # Crear mesas manteniendo el orden del ranking
        mesas = []
        mesa_id = 1

        # Crear mesas emparejando parejas consecutivas
        for i in range(0, len(parejas_ordenadas), 2):
            # La pareja con ranking superior (i) va a la izquierda como pareja1
            # La pareja con ranking inferior (i+1) va a la derecha como pareja2
            if i + 1 < len(parejas_ordenadas):
                pareja1 = parejas_ordenadas[i]['pareja']      # Ranking superior a la izquierda
                pareja2 = parejas_ordenadas[i + 1]['pareja']  # Ranking inferior a la derecha
            else:
                # Si es la última pareja y está sola
                pareja1 = parejas_ordenadas[i]['pareja']
                pareja2 = None
            
            mesa = Mesa(
                id=mesa_id,
                partida=nueva_partida,
                pareja1_id=pareja1.id,
                pareja2_id=pareja2.id if pareja2 else None,
                campeonato_id=campeonato_id
            )
            db.add(mesa)
            mesas.append(mesa)
            mesa_id += 1

        # Actualizar partida actual del campeonato
        campeonato.partida_actual = nueva_partida
        
        db.commit()
        return {"mesas": mesas, "ranking_actualizado": True}
            
    except Exception as e:
        db.rollback()
        print(f"Error al crear mesas por ranking: {str(e)}")  # Agregar log del error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear mesas por ranking: {str(e)}"
        )

@router.get("", response_model=List[MesaSchema])
def get_mesas(campeonato_id: int, partida: int, db: Session = Depends(get_db)):
    return db.query(Mesa).filter(
        Mesa.campeonato_id == campeonato_id,
        Mesa.partida == partida
    ).options(
        joinedload(Mesa.pareja1).load_only(Pareja.id, Pareja.nombre, Pareja.gb),
        joinedload(Mesa.pareja2).load_only(Pareja.id, Pareja.nombre, Pareja.gb)
    ).order_by(Mesa.id.asc()).all()

@router.get("/{mesa_id}", response_model=MesaSchema)
def get_mesa(mesa_id: int, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    return mesa

@router.delete("/campeonato/{campeonato_id}")
def eliminar_mesas_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    try:
        # Verificar que existe el campeonato
        campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
        if not campeonato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campeonato no encontrado"
            )
        
        # Eliminar todas las mesas del campeonato
        db.query(Mesa).filter(Mesa.campeonato_id == campeonato_id).delete()
        
        # Reiniciar la partida actual a 0
        campeonato.partida_actual = 0
        
        db.commit()
        return {"message": "Mesas eliminadas exitosamente"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )