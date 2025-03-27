from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class CampeonatoBase(BaseModel):
    nombre: str
    fecha_inicio: date
    dias_duracion: int = Field(gt=0, description="Duración del campeonato en días")
    numero_partidas: int = Field(gt=0, description="Número total de partidas")
    gb: bool = False
    gb_valor: Optional[int] = None
    pm: int = Field(ge=0, le=500, default=300, description="Puntuación Máxima por partida")
    logo: Optional[str] = None  # URL o path opcional para el logo del campeonato

class CampeonatoCreate(CampeonatoBase):
    pass

class CampeonatoUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha_inicio: Optional[date] = None
    dias_duracion: Optional[int] = Field(None, gt=0, description="Duración del campeonato en días")
    numero_partidas: Optional[int] = Field(None, gt=0, description="Número total de partidas")
    gb: Optional[bool] = None
    gb_valor: Optional[int] = None
    pm: Optional[int] = Field(None, ge=0, le=500, description="Puntuación Máxima por partida")
    logo: Optional[str] = None  # Permitir actualizar el logo del campeonato

class CampeonatoResponse(CampeonatoBase):
    id: int
    activo: bool
    partida_actual: int

    class Config:
        from_attributes = True