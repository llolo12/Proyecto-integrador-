from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CategoriaProveedorResponse(BaseModel):
    id: UUID
    nombre: str

    model_config = {"from_attributes": True}


class ImagenProveedorSchema(BaseModel):
    url_webp: str
    orden: int = 0


class ContactoProveedorSchema(BaseModel):
    tipo: str
    valor: str


class ProveedorCreate(BaseModel):
    categoria_id: UUID
    nombre: str
    descripcion: Optional[str] = None
    declaratoria_ict: bool = False
    lat: Optional[float] = None
    lng: Optional[float] = None
    imagenes: Optional[List[ImagenProveedorSchema]] = None
    contactos: Optional[List[ContactoProveedorSchema]] = None


class ProveedorResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    categoria_id: UUID
    nombre: str
    descripcion: Optional[str]
    declaratoria_ict: bool
    estado_verificacion: str
    lat: Optional[float]
    lng: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class ProveedorDetailResponse(ProveedorResponse):
    imagenes: List[dict] = []
    contactos: List[dict] = []


class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    declaratoria_ict: Optional[bool] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
