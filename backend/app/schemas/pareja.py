from pydantic import BaseModel
from typing import List
from .jugador import JugadorBase, Jugador

class ParejaBase(BaseModel):
    nombre: str
    club_pertenencia: str
    activa: bool = True

class ParejaCreate(ParejaBase):
    campeonato_id: int
    jugadores: List[JugadorBase]

class Pareja(ParejaBase):
    id: int
    campeonato_id: int
    jugadores: List[Jugador] = []
    
    class Config:
        from_attributes = True 