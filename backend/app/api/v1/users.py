from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, require_permission
from app.models.user import CRMRole, CRMUser, CRMUserRole
from app.schemas.user import UserCreateRequest, UserResponse, UserUpdateRequest
from app.services.auth_service import hash_password
from app.utils.permissions import Permission

router = APIRouter()


@router.get("/roles", response_model=list)
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(select(CRMRole).order_by(CRMRole.id))
    roles = result.scalars().all()
    return [{"id": r.id, "name": r.name, "display_name": r.display_name} for r in roles]


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.USERS_MANAGE)
    ),
):
    result = await db.execute(select(CRMUser).order_by(CRMUser.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    request: UserCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.USERS_MANAGE)
    ),
):
    # Email kontrolu
    existing = await db.execute(
        select(CRMUser).where(CRMUser.email == request.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email adresi zaten kullaniliyor",
        )

    user = CRMUser(
        email=request.email,
        password_hash=hash_password(request.password),
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone,
        franchise_office_id=request.franchise_office_id,
    )
    db.add(user)
    await db.flush()

    # Rolleri ata
    if request.role_ids:
        for role_id in request.role_ids:
            db.add(CRMUserRole(user_id=user.id, role_id=role_id))
        await db.flush()

    # Rolleri yukle
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(select(CRMUser).where(CRMUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.USERS_MANAGE)
    ),
):
    result = await db.execute(select(CRMUser).where(CRMUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")

    update_data = request.model_dump(exclude_unset=True)

    # Rol guncelleme ayri
    role_ids = update_data.pop("role_ids", None)
    for field, value in update_data.items():
        setattr(user, field, value)

    if role_ids is not None:
        # Mevcut rolleri sil
        await db.execute(
            CRMUserRole.__table__.delete().where(CRMUserRole.user_id == user_id)
        )
        for role_id in role_ids:
            db.add(CRMUserRole(user_id=user_id, role_id=role_id))

    await db.flush()
    await db.refresh(user)
    return user
