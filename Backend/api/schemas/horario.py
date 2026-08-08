from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import time, date


class HorarioSemanalCreate(BaseModel):
    dia_semana: str
    hora_apertura: time
    hora_cierre: time
    abierto: bool = True


class HorarioSemanalResponse(BaseModel):
    id: UUID
    proveedor_id: UUID
    dia_semana: str
    hora_apertura: time
    hora_cierre: time
    abierto: bool

    model_config = {"from_attributes": True}


class ExcepcionHorarioCreate(BaseModel):
    fecha: date
    motivo: Optional[str] = None
    hora_apertura: Optional[time] = None
    hora_cierre: Optional[time] = None
    cerrado: bool = True
    alerta: bool = True


class ExcepcionHorarioResponse(BaseModel):
    id: UUID
    proveedor_id: UUID
    fecha: date
    motivo: Optional[str]
    hora_apertura: Optional[time]
    hora_cierre: Optional[time]
    cerrado: bool
    alerta: bool
    created_at: str

    model_config = {"from_attributes": True}
