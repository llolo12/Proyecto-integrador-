# Pura Vida Conecta

**Plataforma de turismo para Puntarenas, Costa Rica.**

Esto no es solo otro proyecto de universidad. La idea es construir algo que pueda trascender el aula y convertirse en una herramienta real para la comunidad puntarenense: un directorio vivo de proveedores turisticos locales — hoteles, restaurantes, guias, actividades — con informacion verificada, horarios reales y geolocalizacion.

---

## Stack

```
React + Vite + Tailwind  ->  Frontend 
        | HTTP / JSON
FastAPI + Python 3.12     ->  Backend 
        | asyncpg
PostgreSQL 16             ->  Base de datos (Docker)
```

### Herramientas del entorno

| Herramienta       | Uso                                            |
|-------------------|------------------------------------------------|
| Docker Compose    | Orquesta postgres + api                        |
| DBeaver           | Visualizar la BD local (sin pgAdmin)           |
| Swagger UI        | Documentacion automatica en `/docs`             |
| SlowAPI           | Rate limiting en API                           |
| PyJWT + bcrypt    | Autenticacion segura                           |

---

## Estructura del Backend

```
Backend/
├── docker-compose.yml        # Orquestacion PostgreSQL + FastAPI
├── .env.example              # Template de variables de entorno
├── .env                      # NO SE SUBE — cada quien genera el suyo
├── .gitignore
├── init.sql                  # DDL completo + seed data (creacion automatica)
├── scripts/
│   └── generate-env.ps1      # Genera .env con SECRET_KEY aleatoria
└── api/
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py                # Entrypoint: FastAPI + CORS + middlewares
    ├── core/
    │   ├── config.py          # pydantic-settings (carga variables de entorno)
    │   ├── security.py        # JWT, bcrypt, get_current_user
    │   └── database.py        # Engine async SQLAlchemy + get_db
    ├── models/                # SQLAlchemy ORM (1 archivo por dominio)
    ├── schemas/               # Pydantic v2 (request/response validation)
    ├── routers/               # Endpoints organizados por recurso
    ├── services/              # Logica de negocio separada de routers
    └── middleware/
        └── security.py        # Headers tipo Helmet (XSS, ClickJacking, etc.)
```

### Endpoints disponibles (`/api/v1`)

| Metodo | Ruta                          | Auth  | Descripcion                        |
|--------|-------------------------------|-------|------------------------------------|
| POST   | `/auth/register`              | -     | Registro de usuario (rol turista)  |
| POST   | `/auth/login`                 | -     | Inicio de sesion -> JWT            |
| GET    | `/auth/me`                    | JWT   | Datos del token actual             |
| GET    | `/usuarios/me`                | JWT   | Perfil del usuario autenticado     |
| PUT    | `/usuarios/me`                | JWT   | Actualizar perfil                  |
| POST   | `/proveedores`                | JWT   | Crear proveedor (1 por usuario)    |
| GET    | `/proveedores`                | -     | Listar proveedores                 |
| GET    | `/proveedores/{id}`           | -     | Detalle del proveedor              |
| PUT    | `/proveedores/{id}`           | JWT   | Actualizar proveedor               |
| POST   | `/destinos`                   | JWT   | Crear destino                      |
| GET    | `/destinos`                   | -     | Listar destinos                    |
| GET    | `/destinos/{id}`              | -     | Detalle del destino                |
| GET    | `/admin/usuarios`             | Admin | Listar todos los usuarios          |
| PUT    | `/admin/usuarios/{id}/estado` | Admin | Cambiar estado del usuario         |

> `-` = publico | `JWT` = token requerido via `Authorization: Bearer` | `Admin` = JWT + rol administrador

---

## Como arrancar (local)

### Requisitos

- Docker Desktop
- Python 3.12+ (solo si queres correr la API fuera del contenedor)
- DBeaver (opcional, para ver la BD)

### Paso a paso

```bash
# 1. Clonar
git clone <repo-url>
cd PuraVidaConect

# 2. Generar .env con SECRET_KEY aleatoria
cd Backend
powershell -File scripts/generate-env.ps1
# -> Crea Backend/.env automaticamente

# 3. Levantar servicios
docker compose up -d

# 4. Verificar
curl http://localhost:8000/
# -> {"status":"ok","app":"Pura Vida Conecta API","version":"1.0.0"}

# 5. Swagger
open http://localhost:8000/docs
```

Para **detener**:
```bash
docker compose down        # Detiene contenedores
docker compose down -v     # Detiene + borra volumen (pierde datos)
```

### Alternativa: correr la API en local (sin Docker)

```bash
cd Backend/api
pip install -r requirements.txt
# Asegurate que .env tenga DB_HOST=localhost
uvicorn main:app --reload --port 8000
```

---

## DISCLAIMER PARA EL EQUIPO

Esto se lee **antes de hacer cualquier cambio**. En serio.

1. **No suban basura.** Si algo no funciona en su maquina, no lo empujen a GitHub. Pregunten antes.
2. **Cada quien su `.env`.** La `SECRET_KEY` se genera con el script. La `DB_PASSWORD` puede ser unica de cada uno. **Nunca commiteen el `.env`.**
3. **Respeten la estructura.** Endpoint nuevo = schema en `schemas/`, service en `services/`, router en `routers/`. Nada en `main.py`.
4. **Async siempre.** No hay excusa para endpoints sync. Si ves un `requests.get()` bloqueante, esta mal.
5. **Commits con sentido.** `"fix cosas"` no es valido. Usen conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).
6. **No borren el init.sql.** Las tablas se crean ahi. Si necesitas un cambio de schema, hablalo con el equipo.
7. **PR antes que main.** Nadie pushea directo a main sin review. Minimo 2 personas.
8. **Prueben los cambios.** Si agregas logica nueva, corre la app y proba el endpoint con curl o Swagger.

> **Regla de oro:** Si tenes dudas, pregunta. Mejor preguntar 5 minutos que romper todo y perder 2 horas arreglandolo.

---

## Convenciones para contribuir

### Nomenclatura

| Concepto            | Convencion          | Ejemplo                          |
|---------------------|----------------------|-----------------------------------|
| Archivos Python     | snake_case           | `proveedor_service.py`            |
| Clases / modelos    | PascalCase           | `class ProveedorService`          |
| Funciones/variables | snake_case           | `def get_proveedor_by_id()`       |
| Schemas Pydantic    | PascalCase           | `class ProveedorCreate`           |
| Rutas               | plural, snake_case   | `/api/v1/proveedores/{id}`        |
| Tablas BD           | snake_case           | `categoria_proveedor`             |
| Commits             | conventional commits | `feat: add horario endpoints`     |

### Flujo de trabajo recomendado

1. Crear rama: `git checkout -b feat/mi-cambio`
2. Hacer los cambios
3. Probar local: `docker compose up -d` + curl / Swagger
4. Commit: `git commit -m "feat: descripcion clara"`
5. PR a main

### Si queres proponer un cambio grande

Abri un issue o hablalo en el grupo antes de codificar. La estructura actual cubre lo esencial pero todo es mejorable — el README, los schemas, los servicios, etc. Este archivo puede (y deberia) evolucionar.

---

## Seguridad implementada

- **JWT (PyJWT)** con expiracion configurable
- **Bcrypt** para hash de contrasenas
- **CORS estricto** (solo origenes en `ALLOWED_ORIGINS`)
- **Rate limiting** (100 req/min global con SlowAPI)
- **Headers de seguridad** tipo Helmet: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`
- **Variables de entorno** con `pydantic-settings` — cero credenciales hardcodeadas

---

## Proximos pasos (ideas)

- [ ] Modulo de resenas (descomentar tabla `resena` en `init.sql`)
- [ ] Busqueda geografica con PostGIS
- [ ] Carga de imagenes a Cloudinary / S3
- [ ] Recuperacion de contrasena
- [ ] Dashboard admin con estadisticas
- [ ] Frontend React + Tailwind

---

Pura vida.
