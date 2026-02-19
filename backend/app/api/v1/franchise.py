from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, require_permission
from app.models.franchise import FranchiseOffice
from app.models.user import CRMUser
from app.schemas.franchise import (
    FranchiseOfficeCreateRequest,
    FranchiseOfficeResponse,
    FranchiseOfficeUpdateRequest,
)
from app.utils.permissions import Permission

router = APIRouter()


@router.get("", response_model=list[FranchiseOfficeResponse])
async def list_offices(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    query = select(FranchiseOffice).order_by(FranchiseOffice.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=FranchiseOfficeResponse, status_code=201)
async def create_office(
    request: FranchiseOfficeCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.FRANCHISE_MANAGE)
    ),
):
    # Kod kontrolu
    existing = await db.execute(
        select(FranchiseOffice).where(FranchiseOffice.code == request.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu ofis kodu zaten kullaniliyor")

    office = FranchiseOffice(**request.model_dump())
    db.add(office)
    await db.flush()
    await db.refresh(office)
    return office


@router.get("/{office_id}", response_model=FranchiseOfficeResponse)
async def get_office(
    office_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(
        select(FranchiseOffice).where(FranchiseOffice.id == office_id)
    )
    office = result.scalar_one_or_none()
    if not office:
        raise HTTPException(status_code=404, detail="Ofis bulunamadi")
    return office


@router.put("/{office_id}", response_model=FranchiseOfficeResponse)
async def update_office(
    office_id: int,
    request: FranchiseOfficeUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.FRANCHISE_MANAGE)
    ),
):
    result = await db.execute(
        select(FranchiseOffice).where(FranchiseOffice.id == office_id)
    )
    office = result.scalar_one_or_none()
    if not office:
        raise HTTPException(status_code=404, detail="Ofis bulunamadi")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(office, field, value)

    await db.flush()
    await db.refresh(office)
    return office
