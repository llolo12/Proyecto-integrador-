from uuid import UUID
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.usuario import Usuario
from schemas.usuario import UsuarioUpdate, UsuarioEstadoUpdate
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
async def list_usuarios_admin(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    estado: Optional[str] = None,
    busqueda: Optional[str] = None,
):
    query = select(Usuario).options(selectinload(Usuario.rol))
    count_query = select(func.count()).select_from(Usuario)
    conditions = []
    if estado:
        conditions.append(Usuario.estado == estado)
    if busqueda:
        like = f"%{busqueda}%"
        conditions.append((Usuario.nombre.ilike(like)) | (Usuario.correo.ilike(like)))
    for cond in conditions:
        query = query.where(cond)
        count_query = count_query.where(cond)
    total = (await db.execute(count_query)).scalar_one()
    query = query.order_by(Usuario.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    usuarios = result.scalars().all()
    items = [{
        "id": u.id,
        "nombre": u.nombre,
        "correo": u.correo,
        "tipo_auth": u.tipo_auth,
        "rol_id": u.rol_id,
        "estado": u.estado,
        "idioma": u.idioma,
        "created_at": u.created_at,
        "rol_nombre": u.rol.nombre if u.rol else None,
    } for u in usuarios]
    return items, total
async def cambiar_estado_usuario(
    db: AsyncSession, usuario_id: UUID, data: UsuarioEstadoUpdate, actor_id: UUID
) -> Usuario:
    if usuario_id == actor_id:
        raise HTTPException(status_code=400, detail="No podes cambiar el estado de tu propia cuenta")
    usuario = await get_usuario_by_id(db, usuario_id)
    usuario.estado = data.estado
    await db.flush()
    await db.refresh(usuario)
    return usuario
