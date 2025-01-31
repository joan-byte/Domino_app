from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Pareja(Base):
    __tablename__ = "parejas"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String)
    club_pertenencia = Column(String)
    activa = Column(Boolean, default=True)
    gb = Column(Boolean, default=False)
    campeonato_id = Column(Integer, ForeignKey("campeonatos.id"))
    
    jugadores = relationship("Jugador", back_populates="pareja")
    campeonato = relationship("Campeonato", back_populates="parejas")
    resultados = relationship("Resultado", back_populates="pareja") 