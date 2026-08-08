from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime
class UsuarioCreate(BaseModel):
    nombre: str
    correo: EmailStr
    password: str
    idioma: Optional[str] = "es"
class UsuarioResponse(BaseModel):
    id: UUID
    nombre: str
    correo: str
    tipo_auth: str
    rol_id: UUID
    estado: str
    idioma: str
    created_at: datetime
    model_config = {"from_attributes": True}
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    idioma: Optional[str] = None
class UsuarioAdminResponse(UsuarioResponse):
    """Respuesta enriquecida para la tabla de administración."""
    rol_nombre: Optional[str] = None
class UsuarioEstadoUpdate(BaseModel):
    estado: Literal["activo", "suspendido", "pendiente"]
    motivo: Optional[str] = Field(default=None, max_length=1000)
