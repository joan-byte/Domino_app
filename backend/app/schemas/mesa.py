from pydantic import BaseModel
from typing import Optional
from .pareja import Pareja

class MesaBase(BaseModel):
    partida: int
    pareja1_id: int
    pareja2_id: Optional[int] = None

class MesaCreate(MesaBase):
    campeonato_id: int

class Mesa(MesaBase):
    id: int
    campeonato_id: int
    pareja1: Optional[Pareja] = None
    pareja2: Optional[Pareja] = None
    
    class Config:
        from_attributes = True 