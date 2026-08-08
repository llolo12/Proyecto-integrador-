from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from core.config import settings
from core.database import engine
from middleware.security import SecurityHeadersMiddleware
from routers import auth, usuarios, proveedores, destinos, admin

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        pass
    yield
    await engine.dispose()


app = FastAPI(
    title="Pura Vida Conecta API",
    description="Plataforma de turismo centralizada para Puntarenas, Costa Rica",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(usuarios.router, prefix="/api/v1")
app.include_router(proveedores.router, prefix="/api/v1")
app.include_router(destinos.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "app": "Pura Vida Conecta API",
        "version": "1.0.0",
    }
