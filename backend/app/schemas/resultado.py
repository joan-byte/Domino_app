from pydantic import BaseModel, Field

class ResultadoBase(BaseModel):
    rp: int = Field(gt=0, lt=301)
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
    mesa_id: int
    partida: int
    campeonato_id: int
    
    class Config:
        from_attributes = True 