from uuid import uuid4, UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.proveedor import Proveedor, ImagenProveedor, ContactoProveedor
from schemas.proveedor import ProveedorCreate, ProveedorUpdate


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
