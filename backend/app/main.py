from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import campeonato, pareja, mesa, resultados, ranking
from .database import Base, engine, init_db, get_db_url
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
DB_NAME = os.getenv("DB_NAME")
if not DB_NAME:
    raise ValueError("DB_NAME no está definido en el archivo .env")

print(f"Intentando conectar a la base de datos con URL: {get_db_url(DB_NAME)}")
engine = init_db(DB_NAME)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Incluir routers
app.include_router(campeonato)
app.include_router(pareja)
app.include_router(mesa)
app.include_router(resultados)
app.include_router(ranking) 