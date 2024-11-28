from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Resultado(Base):
    __tablename__ = "resultados"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pareja_id = Column(Integer, ForeignKey("parejas.id"))
    gb = Column(Boolean)
    rp = Column(Integer)
    pg = Column(Integer)
    pp = Column(Integer)
    mesa_id = Column(Integer, ForeignKey("mesas.id"))
    partida = Column(Integer)
    campeonato_id = Column(Integer, ForeignKey("campeonatos.id"))
    
    pareja = relationship("Pareja", back_populates="resultados")
    mesa = relationship("Mesa", back_populates="resultados")
    campeonato = relationship("Campeonato", back_populates="resultados") 