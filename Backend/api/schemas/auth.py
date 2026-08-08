from pydantic import BaseModel
from uuid import UUID


class LoginRequest(BaseModel):
    correo: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    nombre: str
    correo: str
    password: str
    idioma: str = "es"
