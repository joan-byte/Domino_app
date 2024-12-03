from pydantic import BaseModel, Field
from typing import Optional

class ResultadoBase(BaseModel):
    rp: int = Field(ge=0, lt=301)
    gb: bool = False

class ResultadoCreate(ResultadoBase):
    pareja_id: int
    mesa_id: int
    partida: int
    campeonato_id: int

class Resultado(ResultadoBase):
    id: int
    pareja_id: int
    pg: int
    pp: int
    mesa_id: Optional[int] = None
    partida: int
    campeonato_id: int
    
    class Config:
        from_attributes = True 