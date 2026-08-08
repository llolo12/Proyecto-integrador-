from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.configuracion import Configuracion
from schemas.configuracion import ConfiguracionUpdate


async def list_configuraciones(db: AsyncSession) -> list[Configuracion]:
    result = await db.execute(select(Configuracion).order_by(Configuracion.clave))
    return result.scalars().all()


async def get_configuracion_by_clave(db: AsyncSession, clave: str) -> Configuracion:
    result = await db.execute(select(Configuracion).where(Configuracion.clave == clave))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Clave de configuración no encontrada")
    return config


async def update_configuracion(db: AsyncSession, clave: str, data: ConfiguracionUpdate) -> Configuracion:
    config = await get_configuracion_by_clave(db, clave)
    config.valor = data.valor
    await db.commit()
    await db.refresh(config)
    return config