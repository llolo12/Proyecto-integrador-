from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from core.database import get_db
from core.security import get_current_user
from models.usuario import Usuario
from schemas.usuario import UsuarioResponse
from services import usuario_service
from sqlalchemy import select

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("rol") != "administrador":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return user


@router.get("/usuarios", response_model=list[UsuarioResponse])
async def list_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).offset(skip).limit(limit))
    return result.scalars().all()


@router.put("/usuarios/{usuario_id}/estado")
async def cambiar_estado_usuario(
    usuario_id: UUID,
    estado: str,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    usuario = await usuario_service.get_usuario_by_id(db, usuario_id)
    if estado not in ("activo", "suspendido", "pendiente"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Estado inválido")
    usuario.estado = estado
    await db.commit()
    return {"detail": f"Usuario {estado}"}
