from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Resultado
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
    - RT: Es igual a RP si es inferior a PM, sino es PM
    - MG: Se mantiene el valor del input
    - PP: Es RP de la pareja - RP de la pareja contraria
    - PG: Es 1 si PP es positivo, 0 si es negativo
    """
    # Buscar resultados existentes para la mesa y partida
    resultados_existentes = db.query(Resultado).filter(
        Resultado.mesa_id == mesa_id,
        Resultado.partida == resultado1.partida
    ).all()

    def actualizar_resultado(resultado_existente, resultado_nuevo, rp_contrario=None):
        if resultado_existente:
            # Actualizar campos básicos
            for key, value in resultado_nuevo.dict().items():
                setattr(resultado_existente, key, value)
            
            # RT: Es igual a RP si es inferior a PM, sino es PM
            resultado_existente.rt = min(resultado_existente.rp, 150)  # PM = 150
            
            # MG: Se mantiene el valor del input
            # (no necesitamos hacer nada ya que se actualiza con el setattr)
            
            # PP: Si no hay pareja contraria (última partida con una sola pareja)
            if rp_contrario is None:
                resultado_existente.pp = 150  # PP = 150 en este caso
            else:
                # PP: Es RP de la pareja - RP de la pareja contraria
                resultado_existente.pp = resultado_existente.rp - rp_contrario
            
            # PG: Es 1 si PP es positivo, 0 si es negativo
            resultado_existente.pg = 1 if resultado_existente.pp > 0 else 0

    # Si solo hay un resultado (última partida con una sola pareja)
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