from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class DestinoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class DestinoResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str]
    lat: Optional[float]
    lng: Optional[float]

    model_config = {"from_attributes": True}
