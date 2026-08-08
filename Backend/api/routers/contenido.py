from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from schemas.configuracion import ConfiguracionResponse
from services import configuracion_service

router = APIRouter(prefix="/contenido", tags=["contenido"])


@router.get("/landing", response_model=list[ConfiguracionResponse])
async def get_landing_content(db: AsyncSession = Depends(get_db)):
    """Textos publicados de la landing. Público, sin autenticación."""
    return await configuracion_service.list_configuraciones(db)