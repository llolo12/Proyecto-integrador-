from uuid import uuid4
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from models.contenido import Destino
from schemas.destino import DestinoCreate, DestinoUpdate
async def create_destino(db: AsyncSession, data: DestinoCreate) -> Destino:
    destino = Destino(
        id=uuid4(),
        nombre=data.nombre,
        descripcion=data.descripcion,
        lat=data.lat,
        lng=data.lng,
    )
    db.add(destino)
    await db.commit()
    await db.refresh(destino)
    return destino
async def list_destinos(db: AsyncSession, skip: int = 0, limit: int = 20) -> list[Destino]:
    result = await db.execute(select(Destino).order_by(Destino.nombre).offset(skip).limit(limit))
    return result.scalars().all()
async def list_destinos_admin(db: AsyncSession, skip: int = 0, limit: int = 20, busqueda: str | None = None):
    query = select(Destino)
    count_query = select(func.count()).select_from(Destino)
    if busqueda:
        like = f"%{busqueda}%"
        query = query.where(Destino.nombre.ilike(like))
        count_query = count_query.where(Destino.nombre.ilike(like))
    total = (await db.execute(count_query)).scalar_one()
    query = query.order_by(Destino.nombre).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all(), total
async def get_destino_by_id(db: AsyncSession, destino_id) -> Destino | None:
    result = await db.execute(select(Destino).where(Destino.id == destino_id))
    return result.scalar_one_or_none()
async def update_destino(db: AsyncSession, destino_id, data: DestinoUpdate) -> Destino:
    destino = await get_destino_by_id(db, destino_id)
    if not destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(destino, field, value)
    await db.flush()
    await db.refresh(destino)
    return destino
async def delete_destino(db: AsyncSession, destino_id) -> None:
    destino = await get_destino_by_id(db, destino_id)
    if not destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    await db.delete(destino)
    await db.flush()
