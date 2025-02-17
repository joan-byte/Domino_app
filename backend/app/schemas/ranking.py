from pydantic import BaseModel, Field

class RankingPareja(BaseModel):
    numero: int
    pareja_id: int  # Añadido para mantener compatibilidad
    nombre: str
    club: str
    gb: bool
    partidas_jugadas: int = 0
    ultima_partida: int = 0
    pp: int = Field(default=0, description="Puntos Parciales (suma de todos los PP)")
    pg: int = Field(default=0, description="Partidas Ganadas (suma de todos los PG)")
    rt: int = Field(default=0, description="Resultado Total (suma de todos los RT)")
    mg: int = Field(default=0, description="Manos Ganadas (suma de todos los MG)")
    ordenSorteo: int = Field(default=0, description="Orden del sorteo inicial para la primera partida")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "numero": 1,
                "pareja_id": 1,
                "nombre": "Ejemplo Pareja",
                "club": "Club Ejemplo",
                "gb": False,
                "partidas_jugadas": 1,
                "ultima_partida": 1,
                "pp": 150,
                "pg": 1,
                "rt": 150,
                "mg": 1,
                "ordenSorteo": 1
            }
        } 