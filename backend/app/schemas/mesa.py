from pydantic import BaseModel
from typing import Optional

class MesaBase(BaseModel):
    partida: int
    pareja1_id: int
    pareja2_id: Optional[int] = None

class MesaCreate(MesaBase):
    campeonato_id: int

class Mesa(MesaBase):
    id: int
    campeonato_id: int
    
    class Config:
        from_attributes = True 