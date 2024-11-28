from pydantic import BaseModel

class RankingPareja(BaseModel):
    id: int
    nombre: str
    puntos: int
    partidos_jugados: int
    victorias: int
    derrotas: int
    club_pertenencia: str
    
    class Config:
        from_attributes = True 