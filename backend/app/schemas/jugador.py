from pydantic import BaseModel

class JugadorBase(BaseModel):
    nombre: str
    apellido: str

class JugadorCreate(JugadorBase):
    pareja_id: int
    campeonato_id: int

class Jugador(JugadorBase):
    id: int
    pareja_id: int
    campeonato_id: int
    
    class Config:
        from_attributes = True 