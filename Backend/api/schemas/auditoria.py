from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
class LogAccionResponse(BaseModel):
    id: UUID
    usuario_id: Optional[UUID]
    usuario_nombre: Optional[str] = None
    usuario_correo: Optional[str] = None
    accion: str
    entidad: str
    entidad_id: Optional[UUID]
    ip: Optional[str]
    timestamp: datetime
    model_config = {"from_attributes": True}
class LogAccionPage(BaseModel):
    items: List[LogAccionResponse]
    total: int
    skip: int
    limit: int
