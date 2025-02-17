from pydantic import BaseModel, Field
from typing import Optional

class ResultadoBase(BaseModel):
    rp: int = Field(ge=0)
    gb: bool = False
    pp: int = Field(default=0)
    pg: int = Field(default=0)
    rt: int = Field(default=0)
    mg: int = Field(default=0)

class ResultadoCreate(ResultadoBase):
    pareja_id: int
    mesa_id: Optional[int] = None
    partida: int
    campeonato_id: int

class Resultado(ResultadoBase):
    id: int
    pareja_id: int
    mesa_id: Optional[int] = None
    partida: int
    campeonato_id: int
    
    class Config:
        from_attributes = True 