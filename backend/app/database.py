from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

def get_db_url(db_name: str = None):
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    
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
        # Conectar directamente a la base de datos especificada
        database_url = get_db_url(db_name)
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Crear todas las tablas si no existen
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas/verificadas exitosamente")
        
        return engine
    except Exception as e:
        print(f"Error al inicializar la base de datos: {str(e)}")
        raise

def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_db first.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 