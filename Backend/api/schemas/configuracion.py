from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ConfiguracionResponse(BaseModel):
    id: UUID
    clave: str
    valor: str
    descripcion: str | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConfiguracionUpdate(BaseModel):
    valor: str