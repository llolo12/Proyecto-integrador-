from uuid import uuid4, UUID
from datetime import datetime, date, time, timezone
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from models.auditoria import LogAccion
async def log_action(
    db: AsyncSession,
    usuario_id: Optional[UUID],
    accion: str,
    entidad: str,
    entidad_id: Optional[UUID] = None,
    ip: Optional[str] = None,
) -> LogAccion:
    """Registra una accion administrativa. No hace commit: se apoya en el
    commit que ya hace el caller para que la entrada de auditoria quede
    en la misma transaccion que el cambio que la origina."""
    log = LogAccion(
        id=uuid4(),
        usuario_id=usuario_id,
        accion=accion,
        entidad=entidad,
        entidad_id=entidad_id,
        ip=ip,
    )
    db.add(log)
    return log
async def list_logs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    entidad: Optional[str] = None,
    accion: Optional[str] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    from models.usuario import Usuario
    query = select(LogAccion).options(selectinload(LogAccion.usuario))
    count_query = select(func.count()).select_from(LogAccion)
    conditions = []
    if entidad:
        conditions.append(LogAccion.entidad == entidad)
    if accion:
        conditions.append(LogAccion.accion == accion)
    if fecha_desde:
        conditions.append(
            LogAccion.timestamp >= datetime.combine(fecha_desde, time.min, tzinfo=timezone.utc)
        )
    if fecha_hasta:
        conditions.append(
            LogAccion.timestamp <= datetime.combine(fecha_hasta, time.max, tzinfo=timezone.utc)
        )
    for cond in conditions:
        query = query.where(cond)
        count_query = count_query.where(cond)
    query = query.order_by(LogAccion.timestamp.desc()).offset(skip).limit(limit)
    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query)
    logs = result.scalars().all()
    return logs, total
