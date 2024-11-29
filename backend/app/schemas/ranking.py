from pydantic import BaseModel

class RankingPareja(BaseModel):
    id: int
    nombre: str
    puntos_totales: int
    partidas_jugadas: int
    club_pertenencia: str
    
    class Config:
        from_attributes = True 