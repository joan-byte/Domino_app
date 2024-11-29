from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.campeonato import router as campeonato_router
from app.routes.pareja import router as pareja_router
from app.routes.mesa import router as mesa_router
from app.routes.resultado import router as resultado_router
from app.routes.ranking import router as ranking_router
from app.database import init_db

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(campeonato_router)
app.include_router(pareja_router)
app.include_router(mesa_router)
app.include_router(resultado_router)
app.include_router(ranking_router)

# Inicializar la base de datos al arrancar
@app.on_event("startup")
async def startup_event():
    init_db('domino_app') 