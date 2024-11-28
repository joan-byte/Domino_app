from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Jugador(Base):
    __tablename__ = "jugadores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String)
    apellido = Column(String)
    pareja_id = Column(Integer, ForeignKey("parejas.id"))
    campeonato_id = Column(Integer, ForeignKey("campeonatos.id"))
    
    pareja = relationship("Pareja", back_populates="jugadores")
    campeonato = relationship("Campeonato", back_populates="jugadores") 