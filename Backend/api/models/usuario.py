import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, ForeignKey, Text, DateTime, Boolean, Integer, Time, Date, DECIMAL
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func

from core.database import Base


class Rol(Base):
    __tablename__ = "rol"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    permisos = Column(JSONB, nullable=False, default={})
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuarios: Mapped[list["Usuario"]] = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    correo: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_auth = Column(ENUM("local", "oauth", name="tipo_auth", create_type=False), nullable=False, default="local")
    rol_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rol.id"), nullable=False)
    estado = Column(ENUM("activo", "suspendido", "pendiente", name="estado_usuario", create_type=False), nullable=False, default="pendiente")
    idioma: Mapped[str] = mapped_column(String(5), nullable=False, default="es")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    rol: Mapped["Rol"] = relationship("Rol", back_populates="usuarios")
    sesiones: Mapped[list["Sesion"]] = relationship("Sesion", back_populates="usuario", cascade="all, delete-orphan")
    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="usuario", uselist=False, cascade="all, delete-orphan")


class Sesion(Base):
    __tablename__ = "sesion"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ip: Mapped[str] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="sesiones")
