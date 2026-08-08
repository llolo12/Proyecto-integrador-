from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from core.database import get_db
from core.security import get_current_user
from schemas.destino import DestinoCreate, DestinoResponse
from services import destino_service

router = APIRouter(prefix="/destinos", tags=["destinos"])


@router.post("", response_model=DestinoResponse, status_code=201)
async def create(
    data: DestinoCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await destino_service.create_destino(db, data)


@router.get("", response_model=list[DestinoResponse])
async def list_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await destino_service.list_destinos(db, skip=skip, limit=limit)


@router.get("/{destino_id}", response_model=DestinoResponse)
async def get_one(destino_id: UUID, db: AsyncSession = Depends(get_db)):
    destino = await destino_service.get_destino_by_id(db, destino_id)
    if not destino:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    return destino
