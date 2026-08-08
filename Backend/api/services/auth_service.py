from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from models.usuario import Usuario, Rol
from schemas.auth import RegisterRequest
from core.security import hash_password, verify_password, create_access_token


async def register_user(db: AsyncSession, data: RegisterRequest) -> dict:
    result = await db.execute(select(Usuario).where(Usuario.correo == data.correo))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    result = await db.execute(select(Rol).where(Rol.nombre == "turista"))
    rol = result.scalar_one_or_none()
    if not rol:
        raise HTTPException(status_code=500, detail="Rol turista no encontrado")

    usuario = Usuario(
        id=uuid4(),
        nombre=data.nombre,
        correo=data.correo,
        password_hash=hash_password(data.password),
        rol_id=rol.id,
        idioma=data.idioma,
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)

    token = create_access_token({"sub": str(usuario.id), "rol": rol.nombre})
    return {"access_token": token, "token_type": "bearer", "usuario_id": str(usuario.id)}


async def login_user(db: AsyncSession, correo: str, password: str) -> dict:
    result = await db.execute(
        select(Usuario)
        .where(Usuario.correo == correo)
        .options(selectinload(Usuario.rol))
    )
    usuario = result.scalar_one_or_none()

    if not usuario or not verify_password(password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if usuario.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta no activa",
        )

    token = create_access_token({"sub": str(usuario.id), "rol": usuario.rol.nombre if usuario.rol else "turista"})
    return {"access_token": token, "token_type": "bearer"}
