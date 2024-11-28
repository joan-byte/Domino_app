#!/bin/bash

# Activar el entorno virtual
source venv/bin/activate

# Instalar dependencias del backend si no están instaladas
pip install -r requirements.txt

# Instalar dependencias del frontend si no están instaladas
cd frontend
npm install
cd ..

# Iniciar el backend en segundo plano
cd backend
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Iniciar el frontend
cd frontend
npm run dev

# Al terminar, matar el proceso del backend
kill $BACKEND_PID 