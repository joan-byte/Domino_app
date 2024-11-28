from app.database import init_db
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """
    Inicializa la base de datos y crea las tablas necesarias
    """
    try:
        print("Iniciando inicialización de la base de datos...")
        engine = init_db('domino_app')
        print("Base de datos inicializada correctamente")
        return True
    except Exception as e:
        print(f"Error durante la inicialización de la base de datos: {str(e)}")
        return False

if __name__ == "__main__":
    success = init_database()
    if not success:
        print("La inicialización de la base de datos falló. Revise los logs para más detalles.")
        exit(1) 