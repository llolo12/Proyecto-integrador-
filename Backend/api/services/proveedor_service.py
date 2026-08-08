from uuid import uuid4, UUID
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.proveedor import Proveedor, ImagenProveedor, ContactoProveedor
from schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorEstadoUpdate
async def create_proveedor(db: AsyncSession, usuario_id: UUID, data: ProveedorCreate) -> Proveedor:
    existing = await db.execute(select(Proveedor).where(Proveedor.usuario_id == usuario_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El usuario ya tiene un proveedor registrado")
    proveedor = Proveedor(
        id=uuid4(),
        usuario_id=usuario_id,
        categoria_id=data.categoria_id,
        nombre=data.nombre,
        descripcion=data.descripcion,
        declaratoria_ict=data.declaratoria_ict,
        lat=data.lat,
        lng=data.lng,
    )
    db.add(proveedor)
    await db.flush()
    if data.imagenes:
        for img in data.imagenes:
            db.add(ImagenProveedor(
                id=uuid4(), proveedor_id=proveedor.id, url_webp=img.url_webp, orden=img.orden
            ))
    if data.contactos:
        for c in data.contactos:
            db.add(ContactoProveedor(
                id=uuid4(), proveedor_id=proveedor.id, tipo=c.tipo, valor=c.valor
            ))
    await db.commit()
    await db.refresh(proveedor)
    return proveedor
async def get_proveedor_by_id(db: AsyncSession, proveedor_id: UUID) -> Proveedor:
    result = await db.execute(
        select(Proveedor)
        .where(Proveedor.id == proveedor_id)
    )
    proveedor = result.scalar_one_or_none()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor
async def update_proveedor(db: AsyncSession, proveedor_id: UUID, data: ProveedorUpdate) -> Proveedor:
    proveedor = await get_proveedor_by_id(db, proveedor_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(proveedor, field, value)
    await db.commit()
    await db.refresh(proveedor)
    return proveedor
async def list_proveedores(db: AsyncSession, skip: int = 0, limit: int = 20) -> list[Proveedor]:
    result = await db.execute(select(Proveedor).offset(skip).limit(limit))
    return result.scalars().all()
async def list_proveedores_admin(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    estado: Optional[str] = None,
    busqueda: Optional[str] = None,
):
    """Listado enriquecido (categoria + usuario) para la tabla de admin."""
    query = select(Proveedor).options(
        selectinload(Proveedor.categoria), selectinload(Proveedor.usuario)
    )
    count_query = select(Proveedor)
    if estado:
        query = query.where(Proveedor.estado_verificacion == estado)
        count_query = count_query.where(Proveedor.estado_verificacion == estado)
    if busqueda:
        like = f"%{busqueda}%"
        query = query.where(Proveedor.nombre.ilike(like))
        count_query = count_query.where(Proveedor.nombre.ilike(like))
    from sqlalchemy import func as sa_func
    total = (
        await db.execute(select(sa_func.count()).select_from(count_query.subquery()))
    ).scalar_one()
    query = query.order_by(Proveedor.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    proveedores = result.scalars().all()
    items = []
    for p in proveedores:
        items.append({
            "id": p.id,
            "usuario_id": p.usuario_id,
            "categoria_id": p.categoria_id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "declaratoria_ict": p.declaratoria_ict,
            "estado_verificacion": p.estado_verificacion,
            "motivo_rechazo": p.motivo_rechazo,
            "lat": p.lat,
            "lng": p.lng,
            "created_at": p.created_at,
            "categoria_nombre": p.categoria.nombre if p.categoria else None,
            "usuario_nombre": p.usuario.nombre if p.usuario else None,
            "usuario_correo": p.usuario.correo if p.usuario else None,
        })
    return items, total
async def cambiar_estado_proveedor(
    db: AsyncSession, proveedor_id: UUID, data: ProveedorEstadoUpdate
) -> Proveedor:
    proveedor = await get_proveedor_by_id(db, proveedor_id)
    proveedor.estado_verificacion = data.estado
    proveedor.motivo_rechazo = data.motivo if data.estado == "rechazado" else None
    await db.flush()
    await db.refresh(proveedor)
    return proveedor
