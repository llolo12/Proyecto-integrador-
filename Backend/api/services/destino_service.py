from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.contenido import Destino
from schemas.destino import DestinoCreate


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
    result = await db.execute(select(Destino).offset(skip).limit(limit))
    return result.scalars().all()


async def get_destino_by_id(db: AsyncSession, destino_id) -> Destino | None:
    result = await db.execute(select(Destino).where(Destino.id == destino_id))
    return result.scalar_one_or_none()
