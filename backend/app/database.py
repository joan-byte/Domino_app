from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

def get_db_url(db_name: str = None):
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    
    logger.info(f"Configuración de BD: HOST={DB_HOST}, PORT={DB_PORT}, USER={DB_USER}, DB_NAME={DB_NAME}")
    
    if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT]):
        raise ValueError("Missing database configuration. Check your .env file.")
    
    if db_name:
        return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{db_name}"
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
        DATABASE_URL = get_db_url(db_name)
        logger.info(f"Intentando conectar a la base de datos con URL: {DATABASE_URL}")
        
        engine = create_engine(DATABASE_URL, echo=False)  # Cambiamos echo=True a echo=False
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Probar la conexión
        with engine.connect() as conn:
            logger.info("Conexión a la base de datos establecida exitosamente")
            conn.execute(text("SELECT 1"))
        
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