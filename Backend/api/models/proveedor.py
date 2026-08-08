import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Text, Boolean, Integer, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func
from sqlalchemy import DateTime
from core.database import Base
class CategoriaProveedor(Base):
    __tablename__ = "categoria_proveedor"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    proveedores: Mapped[list["Proveedor"]] = relationship("Proveedor", back_populates="categoria")
class Proveedor(Base):
    __tablename__ = "proveedor"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuario.id", ondelete="CASCADE"), unique=True, nullable=False)
    categoria_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("categoria_proveedor.id"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=True)
    declaratoria_ict: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    estado_verificacion = Column(ENUM("pendiente", "aprobado", "rechazado", name="estado_verificacion", create_type=False), nullable=False, default="pendiente")
    motivo_rechazo: Mapped[str] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(DECIMAL(10, 8), nullable=True)
    lng: Mapped[float] = mapped_column(DECIMAL(11, 8), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="proveedor")
    categoria: Mapped["CategoriaProveedor"] = relationship("CategoriaProveedor", back_populates="proveedores")
    imagenes: Mapped[list["ImagenProveedor"]] = relationship("ImagenProveedor", back_populates="proveedor", cascade="all, delete-orphan")
    contactos: Mapped[list["ContactoProveedor"]] = relationship("ContactoProveedor", back_populates="proveedor", cascade="all, delete-orphan")
    horarios: Mapped[list["HorarioSemanal"]] = relationship("HorarioSemanal", back_populates="proveedor", cascade="all, delete-orphan")
    excepciones: Mapped[list["ExcepcionHorario"]] = relationship("ExcepcionHorario", back_populates="proveedor", cascade="all, delete-orphan")
    destinos: Mapped[list["Destino"]] = relationship(
        "Destino", secondary="proveedor_destino", back_populates="proveedores"
    )
class ImagenProveedor(Base):
    __tablename__ = "imagen_proveedor"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proveedor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proveedor.id", ondelete="CASCADE"), nullable=False)
    url_webp: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(default=0)
    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="imagenes")
class ContactoProveedor(Base):
    __tablename__ = "contacto_proveedor"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proveedor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proveedor.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(ENUM("telefono", "web", "instagram", "whatsapp", name="tipo_contacto", create_type=False), nullable=False)
    valor: Mapped[str] = mapped_column(String(300), nullable=False)
    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="contactos")
