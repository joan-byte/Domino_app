from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes.campeonato import router as campeonato_router
from app.routes.pareja import router as pareja_router
from app.routes.mesa import router as mesa_router
from app.routes.resultado import router as resultado_router
from app.routes.ranking import router as ranking_router

app = FastAPI(title="Domino App API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas
app.include_router(campeonato_router)
app.include_router(pareja_router)
app.include_router(mesa_router)
app.include_router(resultado_router)
app.include_router(ranking_router)

# Ruta de prueba
@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Domino App"}

# Inicializar la base de datos al arrancar
@app.on_event("startup")
async def startup_event():
    init_db('domino_app')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 