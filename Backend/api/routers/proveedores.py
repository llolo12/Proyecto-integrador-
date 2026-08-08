from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from core.database import get_db
from core.security import get_current_user
from schemas.proveedor import (
    ProveedorCreate, ProveedorResponse, ProveedorDetailResponse, ProveedorUpdate,
)
from services import proveedor_service

router = APIRouter(prefix="/proveedores", tags=["proveedores"])


@router.post("", response_model=ProveedorResponse, status_code=201)
async def create(
    data: ProveedorCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await proveedor_service.create_proveedor(db, user["id"], data)


@router.get("", response_model=list[ProveedorResponse])
async def list_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await proveedor_service.list_proveedores(db, skip=skip, limit=limit)


@router.get("/{proveedor_id}", response_model=ProveedorDetailResponse)
async def get_one(
    proveedor_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await proveedor_service.get_proveedor_by_id(db, proveedor_id)


@router.put("/{proveedor_id}", response_model=ProveedorResponse)
async def update(
    proveedor_id: UUID,
    data: ProveedorUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await proveedor_service.update_proveedor(db, proveedor_id, data)
