import uuid
from sqlalchemy import String, Text, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Destino(Base):
    __tablename__ = "destino"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(DECIMAL(10, 8), nullable=True)
    lng: Mapped[float] = mapped_column(DECIMAL(11, 8), nullable=True)

    proveedores: Mapped[list["Proveedor"]] = relationship(
        "Proveedor", secondary="proveedor_destino", back_populates="destinos"
    )


class ProveedorDestino(Base):
    __tablename__ = "proveedor_destino"

    proveedor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proveedor.id", ondelete="CASCADE"), primary_key=True)
    destino_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("destino.id", ondelete="CASCADE"), primary_key=True)
