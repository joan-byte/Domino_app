# Aplicación de Gestión de Campeonatos de Dominó

## Descripción
Sistema completo de gestión para campeonatos de dominó que permite administrar parejas, mesas, resultados y rankings.

## Tecnologías
- Backend: FastAPI + PostgreSQL
- Frontend: Vue.js + Tailwind CSS

## Requisitos Previos
- Python 3.8+
- PostgreSQL 12+
- Node.js 16+
- npm 8+

## Instalación

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd domino_app
```

### 2. Configurar el Backend

#### Crear y activar entorno virtual
```bash
python3 -m venv venv
source venv/bin/activate  # En Unix/macOS
# o
.\venv\Scripts\activate  # En Windows
```

#### Instalar dependencias del backend
```bash
pip install -r requirements.txt
```

#### Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto con:
```
DB_USER=domino
DB_PASSWORD=375CheyTac
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=tu_clave_secreta_aqui
```

#### Inicializar la base de datos
```bash
cd backend
python init_app.py
```

### 3. Configurar el Frontend

#### Instalar dependencias
```bash
cd frontend
npm install
```

## Ejecutar la Aplicación

### 1. Iniciar el Backend
```bash
cd backend
uvicorn main:app --reload
```
El servidor estará disponible en `http://localhost:8000`

### 2. Iniciar el Frontend
```bash
cd frontend
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

## Uso de la Aplicación

1. **Gestión de Campeonato**
   - Crear un nuevo campeonato
   - Configurar número de partidas y duración

2. **Gestión de Parejas**
   - Registrar nuevas parejas
   - Activar/desactivar parejas
   - Ver lista de parejas

3. **Gestión de Mesas**
   - Crear mesas por sorteo o ranking
   - Ver distribución de mesas
   - Registrar resultados

4. **Ranking**
   - Ver clasificación actual
   - Estadísticas por pareja
   - Filtrar y buscar resultados

## Estructura del Proyecto
```
domino_app/
├── backend/
│   ├── app/
│   │   ├── models/        # Modelos de la base de datos
│   │   ├── routes/        # Rutas de la API
│   │   ├── schemas/       # Esquemas Pydantic
│   │   └── database.py    # Configuración de la BD
│   ├── main.py           # Aplicación principal
│   └── init_app.py       # Script de inicialización
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes Vue
│   │   ├── views/        # Vistas principales
│   │   ├── stores/       # Estado global (Pinia)
│   │   └── services/     # Servicios API
│   └── package.json
└── README.md
```

## Desarrollo

### Backend
- API documentación disponible en `http://localhost:8000/docs`
- Pruebas con pytest en `/backend/tests`

### Frontend
- Componentes Vue 3 con Composition API
- Estado global con Pinia
- Estilos con Tailwind CSS

## Contribuir
1. Fork el repositorio
2. Crear una rama para tu feature
3. Commit los cambios
4. Push a la rama
5. Crear un Pull Request
``` 
</rewritten_file># Domino_app
