from fastapi import APIRouter, Depends, Query, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date
from typing import Optional
from core.database import get_db
from core.security import get_current_user
from schemas.usuario import UsuarioAdminResponse, UsuarioEstadoUpdate
from schemas.proveedor import ProveedorAdminResponse, ProveedorEstadoUpdate
from schemas.destino import DestinoCreate, DestinoResponse, DestinoUpdate
from schemas.auditoria import LogAccionPage, LogAccionResponse
from schemas.configuracion import ConfiguracionResponse, ConfiguracionUpdate
from services import usuario_service, proveedor_service, destino_service, auditoria_service, configuracion_service
router = APIRouter(prefix="/admin", tags=["admin"])
async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return user
def _client_ip(request: Request) -> Optional[str]:
    return request.client.host if request.client else None
# ============================================================
# USUARIOS
# ============================================================
@router.get("/usuarios", response_model=list[UsuarioAdminResponse])
async def list_usuarios(
    response: Response,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[str] = Query(None, pattern="^(activo|suspendido|pendiente)$"),
    busqueda: Optional[str] = Query(None, max_length=200),
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    items, total = await usuario_service.list_usuarios_admin(
        db, skip=skip, limit=limit, estado=estado, busqueda=busqueda
    )
    response.headers["X-Total-Count"] = str(total)
    return items
@router.put("/usuarios/{usuario_id}/estado", response_model=UsuarioAdminResponse)
async def cambiar_estado_usuario(
    usuario_id: UUID,
    data: UsuarioEstadoUpdate,
    request: Request,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    usuario = await usuario_service.cambiar_estado_usuario(db, usuario_id, data, admin["id"])
    accion = "reactivar_usuario" if data.estado == "activo" else (
        "suspender_usuario" if data.estado == "suspendido" else "marcar_pendiente_usuario"
    )
    await auditoria_service.log_action(
        db, admin["id"], accion, "usuario", usuario_id, _client_ip(request)
    )
    await db.commit()
    await db.refresh(usuario)
    return {
        "id": usuario.id, "nombre": usuario.nombre, "correo": usuario.correo,
        "tipo_auth": usuario.tipo_auth, "rol_id": usuario.rol_id, "estado": usuario.estado,
        "idioma": usuario.idioma, "created_at": usuario.created_at, "rol_nombre": None,
    }
# ============================================================
# PROVEEDORES
# ============================================================
@router.get("/proveedores", response_model=list[ProveedorAdminResponse])
async def list_proveedores(
    response: Response,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[str] = Query(None, pattern="^(pendiente|aprobado|rechazado)$"),
    busqueda: Optional[str] = Query(None, max_length=200),
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    items, total = await proveedor_service.list_proveedores_admin(
        db, skip=skip, limit=limit, estado=estado, busqueda=busqueda
    )
    response.headers["X-Total-Count"] = str(total)
    return items
@router.put("/proveedores/{proveedor_id}/estado", response_model=ProveedorAdminResponse)
async def cambiar_estado_proveedor(
    proveedor_id: UUID,
    data: ProveedorEstadoUpdate,
    request: Request,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    proveedor = await proveedor_service.cambiar_estado_proveedor(db, proveedor_id, data)
    accion = "aprobar_proveedor" if data.estado == "aprobado" else "rechazar_proveedor"
    await auditoria_service.log_action(
        db, admin["id"], accion, "proveedor", proveedor_id, _client_ip(request)
    )
    await db.commit()
    await db.refresh(proveedor)
    return {
        "id": proveedor.id, "usuario_id": proveedor.usuario_id, "categoria_id": proveedor.categoria_id,
        "nombre": proveedor.nombre, "descripcion": proveedor.descripcion,
        "declaratoria_ict": proveedor.declaratoria_ict, "estado_verificacion": proveedor.estado_verificacion,
        "motivo_rechazo": proveedor.motivo_rechazo, "lat": proveedor.lat, "lng": proveedor.lng,
        "created_at": proveedor.created_at, "categoria_nombre": None,
        "usuario_nombre": None, "usuario_correo": None,
    }
# ============================================================
# DESTINOS (CRUD completo)
# ============================================================
@router.get("/destinos", response_model=list[DestinoResponse])
async def list_destinos(
    response: Response,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    busqueda: Optional[str] = Query(None, max_length=200),
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    items, total = await destino_service.list_destinos_admin(db, skip=skip, limit=limit, busqueda=busqueda)
    response.headers["X-Total-Count"] = str(total)
    return items
@router.post("/destinos", response_model=DestinoResponse, status_code=201)
async def create_destino(
    data: DestinoCreate,
    request: Request,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    destino = await destino_service.create_destino(db, data)
    await auditoria_service.log_action(
        db, admin["id"], "crear_destino", "destino", destino.id, _client_ip(request)
    )
    await db.commit()
    return destino
@router.put("/destinos/{destino_id}", response_model=DestinoResponse)
async def update_destino(
    destino_id: UUID,
    data: DestinoUpdate,
    request: Request,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    destino = await destino_service.update_destino(db, destino_id, data)
    await auditoria_service.log_action(
        db, admin["id"], "actualizar_destino", "destino", destino_id, _client_ip(request)
    )
    await db.commit()
    await db.refresh(destino)
    return destino
@router.delete("/destinos/{destino_id}", status_code=204)
async def delete_destino(
    destino_id: UUID,
    request: Request,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await destino_service.delete_destino(db, destino_id)
    await auditoria_service.log_action(
        db, admin["id"], "eliminar_destino", "destino", destino_id, _client_ip(request)
    )
    await db.commit()
    return None
# ============================================================
# AUDITORIA (solo lectura)
# ============================================================
@router.get("/logs", response_model=LogAccionPage)
async def list_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    entidad: Optional[str] = Query(None, max_length=100),
    accion: Optional[str] = Query(None, max_length=100),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    logs, total = await auditoria_service.list_logs(
        db, skip=skip, limit=limit, entidad=entidad, accion=accion,
        fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
    )
    items = [
        LogAccionResponse(
            id=log.id,
            usuario_id=log.usuario_id,
            usuario_nombre=log.usuario.nombre if log.usuario else None,
            usuario_correo=log.usuario.correo if log.usuario else None,
            accion=log.accion,
            entidad=log.entidad,
            entidad_id=log.entidad_id,
            ip=log.ip,
            timestamp=log.timestamp,
        )
        for log in logs
    ]
    return LogAccionPage(items=items, total=total, skip=skip, limit=limit)
# ============================================================
# CONFIGURACION (CMS de landing - Clarence)
# ============================================================
@router.get("/configuracion", response_model=list[ConfiguracionResponse])
async def list_configuracion(
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await configuracion_service.list_configuraciones(db)
@router.put("/configuracion/{clave}", response_model=ConfiguracionResponse)
async def update_configuracion(
    clave: str,
    data: ConfiguracionUpdate,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await configuracion_service.update_configuracion(db, clave, data)
