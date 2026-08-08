from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Literal
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
    motivo_rechazo: Optional[str] = None
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
class ProveedorAdminResponse(ProveedorResponse):
    """Respuesta enriquecida para la tabla de administración."""
    categoria_nombre: Optional[str] = None
    usuario_nombre: Optional[str] = None
    usuario_correo: Optional[str] = None
class ProveedorEstadoUpdate(BaseModel):
    estado: Literal["aprobado", "rechazado"]
    motivo: Optional[str] = Field(default=None, max_length=1000)
    @model_validator(mode="after")
    def _motivo_requerido_si_rechazado(self):
        if self.estado == "rechazado" and not (self.motivo and self.motivo.strip()):
            raise ValueError("El motivo es obligatorio al rechazar un proveedor")
        return self
