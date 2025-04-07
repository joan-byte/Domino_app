import os
from dotenv import load_dotenv
import pathlib
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Configurar el nivel de logging para SQLAlchemy
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
logging.getLogger('app.database').setLevel(logging.INFO)

# Cargar variables de entorno desde el archivo .env
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
env = os.getenv("ENV", "development")
if env.lower() == "production":
    dotenv_path = BASE_DIR / ".env.prod"
else:
    dotenv_path = BASE_DIR / ".env.dev"
load_dotenv(dotenv_path=str(dotenv_path))

# Cargar secretos desde archivos si están especificados
for secret_key in ["SECRET_KEY", "JWT_SECRET_KEY"]:
    file_path = os.getenv(f"{secret_key}_FILE")
    if file_path and os.path.exists(file_path):
        with open(file_path, "r") as f:
            os.environ[secret_key] = f.read().strip()
            logger.info(f"Cargado {secret_key} desde archivo {file_path}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import campeonato, pareja, mesa, resultados, ranking, plantilla
from .database import Base, engine, init_db, get_db_url

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost",
        "http://localhost:80",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        # Añadir todos los orígenes de desarrollo y producción
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        # Añadir comodín para desarrollo local en cualquier puerto
        "http://localhost:*",
        "http://127.0.0.1:*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600  # Tiempo de caché de preflight en segundos
)

# Montar directorio de archivos estáticos
# Creamos el directorio si no existe
os.makedirs(os.path.join(BASE_DIR, "static"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "static/logos"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "static/plantillas"), exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Inicializar la base de datos
DB_NAME = os.getenv("DB_NAME")
if not DB_NAME:
    raise ValueError("DB_NAME no está definido en el archivo .env")

logger.info(f"Nombre de base de datos configurado: {DB_NAME}")
logger.info(f"Inicializando con configuración de base de datos")
engine = init_db(DB_NAME)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Incluir routers
app.include_router(campeonato)
app.include_router(pareja)
app.include_router(mesa)
app.include_router(resultados)
app.include_router(ranking)
app.include_router(plantilla)

@app.get("/health")
def health_check():
    return {"status": "ok", "database": engine is not None} 