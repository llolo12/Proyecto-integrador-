from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from schemas.usuario import UsuarioResponse, UsuarioUpdate
from services import usuario_service

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me", response_model=UsuarioResponse)
async def get_me(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await usuario_service.get_usuario_by_id(db, user["id"])


@router.put("/me", response_model=UsuarioResponse)
async def update_me(
    data: UsuarioUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await usuario_service.update_usuario(db, user["id"], data)
