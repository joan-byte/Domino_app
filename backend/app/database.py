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
    
    if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT]):
        raise ValueError("Missing database configuration. Check your .env file.")
    
    if db_name:
        return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{db_name}"
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"

engine = None
SessionLocal = None
Base = declarative_base()

def init_db(db_name: str):
    """
    Inicializa la base de datos y crea las tablas si no existen
    """
    global engine, SessionLocal
    try:
        # Primero nos conectamos a la base de datos postgres para crear la nueva base de datos si no existe
        postgres_engine = create_engine(get_db_url())
        with postgres_engine.connect() as conn:
            # Verificar si la base de datos existe
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
            exists = result.scalar()
            
            if not exists:
                # Necesitamos cerrar todas las conexiones antes de crear la base de datos
                conn.execute(text("COMMIT"))
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                print(f"Base de datos '{db_name}' creada exitosamente")
                
                # Solo reiniciar secuencias si es una base de datos nueva
                should_reset_sequences = True
            else:
                should_reset_sequences = False
        
        postgres_engine.dispose()
        
        # Ahora nos conectamos a la base de datos específica
        database_url = get_db_url(db_name)
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Crear todas las tablas si no existen
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas/verificadas exitosamente")
        
        # Verificar la conexión
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Conexión a la base de datos verificada")
        
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