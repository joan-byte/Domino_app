from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import campeonato, pareja, mesa, resultado
from .database import Base, engine

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

# Crear tablas
Base.metadata.create_all(bind=engine)

# Incluir routers
app.include_router(campeonato.router)
app.include_router(pareja.router)
app.include_router(mesa.router)
app.include_router(resultado.router) 