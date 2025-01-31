# Sistema de Gestión de Campeonatos de Dominó

## Descripción
Sistema integral para la gestión de campeonatos de dominó que facilita la organización, seguimiento y administración de torneos. La aplicación está diseñada para optimizar la experiencia tanto de organizadores como de jugadores, ofreciendo una interfaz intuitiva y funcionalidades completas.

## Características Principales
- Gestión completa de torneos y campeonatos
- Sistema de ranking automático
- Generación automática de mesas y emparejamientos
- Estadísticas detalladas por pareja y jugador
- Interfaz responsive para acceso desde cualquier dispositivo
- Sistema de notificaciones en tiempo real
- Exportación de resultados y estadísticas

## Tecnologías
### Backend
- FastAPI (Framework Python de alto rendimiento)
- PostgreSQL (Base de datos relacional)
- SQLAlchemy (ORM)
- Pydantic (Validación de datos)

### Frontend
- Vue.js 3 (Framework JavaScript)
- Tailwind CSS (Framework CSS)
- Pinia (Gestión de estado)
- Vue Router (Enrutamiento)

## Requisitos Previos
- Python 3.8+
- PostgreSQL 12+
- Node.js 16+
- npm 8+

## Instalación

### 1. Configuración Inicial
```bash
# Clonar el repositorio
git clone [https://github.com/joan-byte/Domino_app]
cd domino_app

# Crear y activar entorno virtual
python3 -m venv venv
source venv/bin/activate  # Unix/macOS
.\venv\Scripts\activate   # Windows
```

### 2. Backend
```bash
# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (.env)
DB_USER=domino
DB_PASSWORD=375CheyTac
DB_HOST=localhost
DB_PORT=5432
DB_NAME=domino_db
SECRET_KEY=tu_clave_secreta_aqui
JWT_SECRET_KEY=tu_jwt_secreto_aqui

# Inicializar base de datos
cd backend
python init_app.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Guía de Uso

### 1. Gestión de Campeonatos
#### Crear Nuevo Campeonato
- Definir nombre y descripción
- Establecer fecha de inicio y duración
- Configurar número de partidas
- Activar/desactivar modo GB (Great Britain)
- Gestionar estado activo del campeonato

#### Configuración de Reglas
- Sistema de puntuación configurable
- Control de partidas por campeonato
- Gestión de inscripciones
- Sistema de cierre automático

### 2. Gestión de Parejas
#### Registro de Parejas
- Datos completos de los jugadores
- Asignación a campeonatos
- Control de estado activo/inactivo
- Historial de participación

#### Sistema de Ranking
- Puntuación acumulada automática
- Posición en tiempo real
- Estadísticas detalladas
- Histórico de resultados

### 3. Control de Partidas
#### Gestión de Mesas
- Asignación automática por sorteo
- Control de rotación de parejas
- Seguimiento de mesas activas
- Registro de incidencias

#### Registro de Resultados
- Puntuación por partida
- Validación automática
- Actualización en tiempo real
- Generación de reportes

### 4. Análisis y Estadísticas
- Rendimiento por pareja
- Gráficos de evolución
- Exportación de datos
- Informes personalizados

## Estructura del Proyecto
```
domino_app/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Endpoints API
│   │   ├── schemas/         # Esquemas de validación
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades
│   ├── tests/               # Pruebas unitarias
│   ├── main.py             # Punto de entrada
│   └── init_app.py         # Inicialización
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes Vue
│   │   ├── views/          # Páginas principales
│   │   ├── stores/         # Estado global
│   │   ├── services/       # Servicios API
│   │   └── assets/         # Recursos estáticos
│   └── package.json
└── README.md
```

## API Documentation
### Endpoints Principales
- `/campeonatos`: Gestión completa de torneos
  - POST /: Crear nuevo campeonato
  - GET /actual: Obtener campeonato activo
  - PUT /{id}: Actualizar campeonato
  - DELETE /{id}: Eliminar campeonato
  - POST /{id}/cerrar-inscripcion: Cerrar inscripciones

- `/parejas`: Gestión de parejas
  - POST /: Registrar nueva pareja
  - GET /: Listar parejas
  - PUT /{id}: Actualizar pareja
  - DELETE /{id}: Eliminar pareja

- `/mesas`: Control de mesas
  - GET /: Listar mesas activas
  - POST /asignar: Asignar mesas
  - PUT /{id}: Actualizar mesa

- `/resultados`: Registro de resultados
  - POST /: Registrar resultado
  - GET /campeonato/{id}: Obtener resultados
  - PUT /{id}: Actualizar resultado

## Desarrollo
### Backend
- Documentación API: `http://localhost:8000/docs`
- Tests con pytest
- Logging configurado para debugging
- Manejo de errores centralizado

### Frontend
- Componentes Vue 3 con Composition API
- Estado global con Pinia
- Rutas protegidas
- Diseño responsive

## Soporte
Para reportar bugs o solicitar nuevas características, por favor crear un issue en el repositorio.

## Licencia
Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.
``` 
</rewritten_file>