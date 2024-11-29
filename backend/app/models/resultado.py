from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Resultado(Base):
    __tablename__ = "resultados"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pareja_id = Column(Integer, ForeignKey("parejas.id"))
    rp = Column(Integer, default=0)
    pp = Column(Integer, default=0)
    pg = Column(Integer, default=0)
    gb = Column(Boolean, default=False)
    mesa_id = Column(Integer, ForeignKey("mesas.id"))
    partida = Column(Integer)
    campeonato_id = Column(Integer, ForeignKey("campeonatos.id"))
    
    pareja = relationship("Pareja", back_populates="resultados")
    mesa = relationship("Mesa", back_populates="resultados")
    campeonato = relationship("Campeonato", back_populates="resultados") 