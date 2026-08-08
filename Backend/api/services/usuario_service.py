from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.usuario import Usuario
from schemas.usuario import UsuarioUpdate


async def get_usuario_by_id(db: AsyncSession, usuario_id: UUID) -> Usuario:
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


async def update_usuario(db: AsyncSession, usuario_id: UUID, data: UsuarioUpdate) -> Usuario:
    usuario = await get_usuario_by_id(db, usuario_id)
    if data.nombre is not None:
        usuario.nombre = data.nombre
    if data.idioma is not None:
        usuario.idioma = data.idioma
    await db.commit()
    await db.refresh(usuario)
    return usuario
