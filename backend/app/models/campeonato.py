from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Campeonato(Base):
    __tablename__ = "campeonatos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    fecha_inicio = Column(Date, nullable=False)
    dias_duracion = Column(Integer, nullable=False)
    numero_partidas = Column(Integer, nullable=False)
    gb = Column(Boolean, default=False)
    gb_valor = Column(Integer, nullable=True)
    activo = Column(Boolean, default=True)
    partida_actual = Column(Integer, default=0)
    pm = Column(Integer, default=300)
    
    parejas = relationship("Pareja", back_populates="campeonato", cascade="all, delete-orphan")
    jugadores = relationship("Jugador", back_populates="campeonato", cascade="all, delete-orphan")
    mesas = relationship("Mesa", back_populates="campeonato", cascade="all, delete-orphan")
    resultados = relationship("Resultado", back_populates="campeonato", cascade="all, delete-orphan")
    