from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Resultado, Campeonato
from ..schemas.resultado import ResultadoCreate

router = APIRouter(prefix="/resultados", tags=["resultados"])

@router.post("/recalcular/{campeonato_id}")
async def recalcular_valores(campeonato_id: int, db: Session = Depends(get_db)):
    """
    Recalcula RT y MG para todos los resultados del campeonato
    """
    try:
        # Obtener todos los resultados del campeonato
        resultados = db.query(Resultado).filter(
            Resultado.campeonato_id == campeonato_id
        ).all()

        actualizados = 0
        # Actualizar cada resultado
        for resultado in resultados:
            if resultado.rp is not None and resultado.rp > 0:
                resultado.rt = resultado.rp  # RT es el resultado parcial
                resultado.mg = 1 if resultado.rp >= 150 else 0  # MG es 1 si ganó la mano
                actualizados += 1

        db.commit()
        return {"message": f"Recalculados RT y MG para {actualizados} resultados"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/mesa/{mesa_id}")
async def actualizar_resultados_mesa(
    mesa_id: int,
    resultado1: ResultadoCreate,
    resultado2: Optional[ResultadoCreate] = None,
    db: Session = Depends(get_db)
):
    """
    Actualiza los resultados de una mesa, calculando automáticamente los campos derivados:
    - RT: Es igual a RP si es inferior a PM, sino es PM (para mesas con dos parejas)
    - RT: Es 150 para mesas con una sola pareja
    - MG: Se mantiene el valor del input
    - PP: Es RP de la pareja - RP de la pareja contraria
    - PG: Es 1 si PP es positivo, 0 si es negativo
    """
    # Buscar resultados existentes para la mesa y partida
    resultados_existentes = db.query(Resultado).filter(
        Resultado.mesa_id == mesa_id,
        Resultado.partida == resultado1.partida
    ).all()

    # Obtener el campeonato para acceder a su PM
    campeonato = db.query(Campeonato).filter(
        Campeonato.id == resultado1.campeonato_id
    ).first()
    if not campeonato:
        raise HTTPException(status_code=404, detail="Campeonato no encontrado")

    def actualizar_resultado(resultado_existente, resultado_nuevo, rp_contrario=None):
        if resultado_existente:
            # Actualizar campos básicos
            for key, value in resultado_nuevo.dict().items():
                setattr(resultado_existente, key, value)
            
            # Si no hay pareja contraria (mesa con una sola pareja)
            if rp_contrario is None:
                resultado_existente.rt = 150  # RT fijo de 150 para mesas con una pareja
                resultado_existente.pp = 150  # PP fijo de 150 para mesas con una pareja
                resultado_existente.pg = 1    # PG fijo de 1 para mesas con una pareja
            else:
                # RT: Es igual a RP si es inferior a PM, sino es PM
                resultado_existente.rt = min(resultado_existente.rp, campeonato.pm)
                # PP: Es RP de la pareja - RP de la pareja contraria
                resultado_existente.pp = resultado_existente.rp - rp_contrario
                # PG: Es 1 si PP es positivo, 0 si es negativo
                resultado_existente.pg = 1 if resultado_existente.pp > 0 else 0

    # Si solo hay un resultado (mesa con una sola pareja)
    if resultado2 is None:
        resultado_1_existente = next(
            (r for r in resultados_existentes if r.pareja_id == resultado1.pareja_id),
            None
        )
        actualizar_resultado(resultado_1_existente, resultado1)
        if resultado_1_existente:
            resultado_1_existente.ultima_partida = 5  # Última partida = 5
    else:
        # Actualizar resultado1
        resultado_1_existente = next(
            (r for r in resultados_existentes if r.pareja_id == resultado1.pareja_id),
            None
        )
        # Actualizar resultado2
        resultado_2_existente = next(
            (r for r in resultados_existentes if r.pareja_id == resultado2.pareja_id),
            None
        )
        
        # Actualizar ambos resultados con los RP contrarios
        if resultado_1_existente and resultado_2_existente:
            actualizar_resultado(resultado_1_existente, resultado1, resultado2.rp)
            actualizar_resultado(resultado_2_existente, resultado2, resultado1.rp)

    try:
        db.commit()
        return {"message": "Resultados actualizados correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def crear_resultados(
    resultado1: ResultadoCreate,
    resultado2: Optional[ResultadoCreate] = None,
    db: Session = Depends(get_db)
):
    """
    Crea nuevos resultados para una mesa.
    Para mesas con una sola pareja:
    - RT = 150
    - PP = 150
    - PG = 1
    Para mesas con dos parejas:
    - RT = min(RP, PM del campeonato)
    - PP = RP propio - RP contrario
    - PG = 1 si PP > 0, 0 en caso contrario
    """
    try:
        # Obtener el campeonato para acceder a su PM
        campeonato = db.query(Campeonato).filter(
            Campeonato.id == resultado1.campeonato_id
        ).first()
        if not campeonato:
            raise HTTPException(status_code=404, detail="Campeonato no encontrado")

        # Si solo hay una pareja, valores fijos
        if resultado2 is None:
            nuevo_resultado1 = Resultado(
                pareja_id=resultado1.pareja_id,
                mesa_id=resultado1.mesa_id,
                partida=resultado1.partida,
                campeonato_id=resultado1.campeonato_id,
                rt=150,  # RT fijo para mesas con una pareja
                mg=resultado1.mg,
                rp=resultado1.rp,
                pg=1,    # PG fijo para mesas con una pareja
                pp=150,  # PP fijo para mesas con una pareja
                gb=resultado1.gb
            )
            db.add(nuevo_resultado1)
        else:
            # Calcular RT, PP y PG para ambas parejas
            rt1 = min(resultado1.rp, campeonato.pm)
            rt2 = min(resultado2.rp, campeonato.pm)
            pp1 = resultado1.rp - resultado2.rp
            pp2 = resultado2.rp - resultado1.rp
            pg1 = 1 if pp1 > 0 else 0
            pg2 = 1 if pp2 > 0 else 0

            nuevo_resultado1 = Resultado(
                pareja_id=resultado1.pareja_id,
                mesa_id=resultado1.mesa_id,
                partida=resultado1.partida,
                campeonato_id=resultado1.campeonato_id,
                rt=rt1,
                mg=resultado1.mg,
                rp=resultado1.rp,
                pg=pg1,
                pp=pp1,
                gb=resultado1.gb
            )
            db.add(nuevo_resultado1)

            nuevo_resultado2 = Resultado(
                pareja_id=resultado2.pareja_id,
                mesa_id=resultado2.mesa_id,
                partida=resultado2.partida,
                campeonato_id=resultado2.campeonato_id,
                rt=rt2,
                mg=resultado2.mg,
                rp=resultado2.rp,
                pg=pg2,
                pp=pp2,
                gb=resultado2.gb
            )
            db.add(nuevo_resultado2)

        db.commit()
        return {"message": "Resultados creados correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campeonato/{campeonato_id}", response_model=List[ResultadoCreate])
async def obtener_resultados_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los resultados de un campeonato
    """
    try:
        resultados = db.query(Resultado).filter(
            Resultado.campeonato_id == campeonato_id
        ).all()
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mesa/{mesa_id}")
async def obtener_resultados_mesa(
    mesa_id: int,
    partida: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene los resultados de una mesa específica para una partida
    """
    try:
        resultados = db.query(Resultado).filter(
            Resultado.mesa_id == mesa_id,
            Resultado.partida == partida
        ).all()
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 