import uuid
from datetime import datetime, date, time
from sqlalchemy import Column, String, ForeignKey, Text, Boolean, Time, Date
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func, DateTime

from core.database import Base


class HorarioSemanal(Base):
    __tablename__ = "horario_semanal"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proveedor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proveedor.id", ondelete="CASCADE"), nullable=False)
    dia_semana = Column(ENUM("lunes","martes","miercoles","jueves","viernes","sabado","domingo", name="dia_semana", create_type=False), nullable=False)
    hora_apertura: Mapped[time] = mapped_column(Time, nullable=False)
    hora_cierre: Mapped[time] = mapped_column(Time, nullable=False)
    abierto: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="horarios")


class ExcepcionHorario(Base):
    __tablename__ = "excepcion_horario"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proveedor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proveedor.id", ondelete="CASCADE"), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    motivo: Mapped[str] = mapped_column(Text, nullable=True)
    hora_apertura: Mapped[time] = mapped_column(Time, nullable=True)
    hora_cierre: Mapped[time] = mapped_column(Time, nullable=True)
    cerrado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    alerta: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="excepciones")
