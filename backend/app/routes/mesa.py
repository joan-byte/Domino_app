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

        # Eliminar todas las mesas existentes del campeonato
        db.query(Mesa).filter(Mesa.campeonato_id == campeonato_id).delete()

        # Obtener parejas activas ordenadas por ranking actual (GB, PG, PP)
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
            func.coalesce(func.bool_or(Resultado.gb), False),  # GB ascendente (A antes que B)
            func.coalesce(func.sum(Resultado.pg), 0).desc(),  # Total PG descendente
            func.coalesce(func.sum(Resultado.pp), 0).desc()   # Total PP descendente
        ).all()

        # Separar parejas por GB
        parejas_gb_a = [p for p in parejas_ranking if not p[3]]  # GB = False (A)
        parejas_gb_b = [p for p in parejas_ranking if p[3]]      # GB = True (B)

        parejas_para_mesas = []
        es_ultima_partida = campeonato.partida_actual + 1 == campeonato.numero_partidas

        if len(parejas_ranking) >= 2:
            if es_ultima_partida:
                # Lógica especial para la última partida
                # Verificar diferencia entre las dos primeras parejas del grupo A
                if len(parejas_gb_a) >= 2:
                    primera_pareja_a = parejas_gb_a[0]
                    segunda_pareja_a = parejas_gb_a[1]
                    
                    pg_primera_a = primera_pareja_a[1] or 0
                    pg_segunda_a = segunda_pareja_a[1] or 0
                    pp_primera_a = primera_pareja_a[2] or 0
                    pp_segunda_a = segunda_pareja_a[2] or 0
                    
                    diferencia_pg_a = pg_primera_a - pg_segunda_a
                    diferencia_pp_a = pp_primera_a - pp_segunda_a
                    
                    if diferencia_pg_a >= 2 or diferencia_pp_a > 300:
                        # La primera pareja del grupo A es campeona
                        nuevo_resultado_a = Resultado(
                            pareja_id=primera_pareja_a[0].id,
                            pg=1,
                            pp=0,
                            rp=0,
                            gb=False,
                            mesa_id=None,
                            partida=campeonato.partida_actual + 1,
                            campeonato_id=campeonato_id
                        )
                        db.add(nuevo_resultado_a)
                        parejas_gb_a = parejas_gb_a[1:]  # Excluir la primera pareja

                # Verificar diferencia entre las dos primeras parejas del grupo B
                if len(parejas_gb_b) >= 2:
                    primera_pareja_b = parejas_gb_b[0]
                    segunda_pareja_b = parejas_gb_b[1]
                    
                    pg_primera_b = primera_pareja_b[1] or 0
                    pg_segunda_b = segunda_pareja_b[1] or 0
                    pp_primera_b = primera_pareja_b[2] or 0
                    pp_segunda_b = segunda_pareja_b[2] or 0
                    
                    diferencia_pg_b = pg_primera_b - pg_segunda_b
                    diferencia_pp_b = pp_primera_b - pp_segunda_b
                    
                    if diferencia_pg_b >= 2 or diferencia_pp_b > 300:
                        # La primera pareja del grupo B es campeona
                        nuevo_resultado_b = Resultado(
                            pareja_id=primera_pareja_b[0].id,
                            pg=1,
                            pp=0,
                            rp=0,
                            gb=True,
                            mesa_id=None,
                            partida=campeonato.partida_actual + 1,
                            campeonato_id=campeonato_id
                        )
                        db.add(nuevo_resultado_b)
                        parejas_gb_b = parejas_gb_b[1:]  # Excluir la primera pareja

            # Crear mesas separadas para cada grupo
            mesas = []
            nueva_partida = campeonato.partida_actual + 1
            mesa_id = 1

            # Crear mesas para grupo A
            for i in range(0, len(parejas_gb_a), 2):
                pareja1 = parejas_gb_a[i][0]
                pareja2 = parejas_gb_a[i + 1][0] if i + 1 < len(parejas_gb_a) else None
                
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

            # Crear mesas para grupo B
            for i in range(0, len(parejas_gb_b), 2):
                pareja1 = parejas_gb_b[i][0]
                pareja2 = parejas_gb_b[i + 1][0] if i + 1 < len(parejas_gb_b) else None
                
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
            return mesas
            
        else:
            # Si hay menos de 2 parejas, crear una mesa con la pareja solitaria
            if len(parejas_ranking) == 1:
                mesa = Mesa(
                    id=1,
                    partida=campeonato.partida_actual + 1,
                    pareja1_id=parejas_ranking[0][0].id,
                    pareja2_id=None,
                    campeonato_id=campeonato_id
                )
                db.add(mesa)
                campeonato.partida_actual += 1
                db.commit()
                return [mesa]
            return []
        
    except Exception as e:
        db.rollback()
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