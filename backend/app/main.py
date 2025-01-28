from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import campeonato, pareja, mesa, resultado
from .database import Base, engine, init_db
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Inicializar la base de datos
DB_NAME = os.getenv("DB_NAME", "domino_app")
engine = init_db(DB_NAME)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Incluir routers - los routers son directamente los objetos APIRouter, no necesitamos acceder a .router
app.include_router(campeonato)
app.include_router(pareja)
app.include_router(mesa)
app.include_router(resultado) 