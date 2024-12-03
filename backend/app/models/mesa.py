from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Mesa(Base):
    __tablename__ = "mesas"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    partida = Column(Integer)
    pareja1_id = Column(Integer, ForeignKey("parejas.id"))
    pareja2_id = Column(Integer, ForeignKey("parejas.id"))
    campeonato_id = Column(Integer, ForeignKey("campeonatos.id"))
    
    pareja1 = relationship("Pareja", foreign_keys=[pareja1_id])
    pareja2 = relationship("Pareja", foreign_keys=[pareja2_id])
    campeonato = relationship("Campeonato", back_populates="mesas") 