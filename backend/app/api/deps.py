from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.user import CRMUser
from app.utils.permissions import Permission, has_permission

settings = get_settings()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> CRMUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        if user_id_str is None or token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gecersiz token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecersiz token",
        )

    user_id = int(user_id_str)
    result = await db.execute(select(CRMUser).where(CRMUser.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanici bulunamadi veya aktif degil",
        )

    return user


def require_permission(permission: Permission):
    async def _check(current_user: CRMUser = Depends(get_current_user)):
        if not has_permission(current_user.role_names, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bu islem icin yetkiniz yok: {permission.value}",
            )
        return current_user
    return _check


def require_any_role(*roles: str):
    async def _check(current_user: CRMUser = Depends(get_current_user)):
        if not any(r in current_user.role_names for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu sayfaya erisim yetkiniz yok",
            )
        return current_user
    return _check
