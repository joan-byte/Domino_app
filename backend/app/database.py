from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

def get_db_url(db_name: str = None):
    # Leer valores de las variables de entorno
    DB_USER = os.getenv("DB_USER")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    
    # Leer el nombre de la base de datos
    if db_name:
        DB_NAME = db_name
    else:
        DB_NAME = os.getenv("DB_NAME")
    
    # Leer la contraseña desde archivo si está especificado
    DB_PASSWORD_FILE = os.getenv("DB_PASSWORD_FILE")
    if DB_PASSWORD_FILE and os.path.exists(DB_PASSWORD_FILE):
        with open(DB_PASSWORD_FILE, 'r') as f:
            DB_PASSWORD = f.read().strip()
            logger.info(f"Contraseña leída desde archivo: {DB_PASSWORD_FILE}")
    else:
        DB_PASSWORD = os.getenv("DB_PASSWORD")
        logger.info("Contraseña leída desde variable de entorno DB_PASSWORD")
    
    # Registrar la configuración (sin mostrar la contraseña)
    logger.info(f"Configuración de BD: HOST={DB_HOST}, PORT={DB_PORT}, USER={DB_USER}, DB_NAME={DB_NAME}")
    
    # Validar que tenemos todos los valores necesarios
    if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
        missing = []
        if not DB_USER: missing.append("DB_USER")
        if not DB_PASSWORD: missing.append("DB_PASSWORD/DB_PASSWORD_FILE")
        if not DB_HOST: missing.append("DB_HOST")
        if not DB_PORT: missing.append("DB_PORT")
        if not DB_NAME: missing.append("DB_NAME")
        raise ValueError(f"Falta configuración de base de datos: {', '.join(missing)}")
    
    # Construir y devolver la URL de conexión
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = None
SessionLocal = None
Base = declarative_base()

def init_db(db_name: str):
    """
    Inicializa la base de datos y crea las tablas si no existen
    """
    global engine, SessionLocal
    try:
        logger.info(f"Inicializando base de datos con nombre: {db_name}")
        DATABASE_URL = get_db_url(db_name)
        # Ocultar credenciales en los logs
        safe_url = DATABASE_URL.replace(DATABASE_URL.split('@')[0], '***')
        logger.info(f"Intentando conectar a la base de datos con URL: {safe_url}")
        
        # Configurar el engine con soporte UTF-8
        engine = create_engine(
            DATABASE_URL,
            echo=False,
            connect_args={
                'client_encoding': 'utf8'
            }
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Probar la conexión
        with engine.connect() as conn:
            logger.info("Conexión a la base de datos establecida exitosamente")
            conn.execute(text("SELECT 1"))
            # Asegurar que la conexión use UTF-8
            conn.execute(text("SET client_encoding TO 'UTF8'"))
        
        # Crear todas las tablas si no existen
        Base.metadata.create_all(bind=engine)
        logger.info("Tablas creadas/verificadas exitosamente")
        
        return engine
    except Exception as e:
        logger.error(f"Error al inicializar la base de datos: {e}")
        raise e

def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_db first.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 