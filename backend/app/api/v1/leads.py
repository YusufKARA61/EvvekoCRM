from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.lead import CRMLead
from app.models.activity import CRMActivity
from app.models.user import CRMUser
from app.schemas.lead import (
    LeadCreateRequest,
    LeadResponse,
    LeadStatusUpdate,
    LeadUpdateRequest,
)
from app.utils.pagination import PaginatedResponse

router = APIRouter()

VALID_STATUSES = [
    "talep_geldi", "merkez_arandi", "besleme", "toplanti_planlandi",
    "toplanti_yapildi", "takip_aramasi", "teklif_asamasi",
    "kapanis_basarili", "kapanis_basarisiz", "iptal", "sahte_bos",
]


@router.get("", response_model=PaginatedResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    source: Optional[str] = None,
    ilce: Optional[str] = None,
    search: Optional[str] = None,
    assigned_franchise_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    query = select(CRMLead)

    # Franchise kullanicilari sadece kendi ofislerini gorur
    if current_user.is_franchise and current_user.franchise_office_id:
        query = query.where(
            CRMLead.assigned_franchise_id == current_user.franchise_office_id
        )

    # Filtreler
    if status_filter:
        query = query.where(CRMLead.status == status_filter)
    if source:
        query = query.where(CRMLead.source == source)
    if ilce:
        query = query.where(CRMLead.ilce == ilce)
    if assigned_franchise_id:
        query = query.where(CRMLead.assigned_franchise_id == assigned_franchise_id)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            CRMLead.customer_name.ilike(search_filter)
            | CRMLead.customer_phone.ilike(search_filter)
            | CRMLead.ilce.ilike(search_filter)
            | CRMLead.mahalle.ilike(search_filter)
        )

    # Toplam sayim
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Siralama + sayfalama
    query = query.order_by(CRMLead.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    leads = result.scalars().all()

    return PaginatedResponse(
        items=[LeadResponse.model_validate(l) for l in leads],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    request: LeadCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    lead = CRMLead(**request.model_dump())

    # SLA deadline (varsayilan 30dk)
    lead.ilk_arama_deadline = datetime.now(timezone.utc) + timedelta(minutes=30)

    db.add(lead)
    await db.flush()

    # Aktivite kaydi
    db.add(CRMActivity(
        lead_id=lead.id,
        actor_id=current_user.id,
        activity_type="lead_created",
        title="Lead olusturuldu",
        description=f"Kaynak: {lead.source}",
    ))

    await db.flush()
    await db.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(select(CRMLead).where(CRMLead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead bulunamadi")

    # Franchise kontrolu
    if current_user.is_franchise and current_user.franchise_office_id:
        if lead.assigned_franchise_id != current_user.franchise_office_id:
            raise HTTPException(status_code=403, detail="Bu leade erisim yetkiniz yok")

    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    request: LeadUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(select(CRMLead).where(CRMLead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead bulunamadi")

    old_status = lead.status
    update_data = request.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(lead, field, value)

    # Status degistiyse aktivite kaydi
    new_status = update_data.get("status")
    if new_status and new_status != old_status:
        db.add(CRMActivity(
            lead_id=lead.id,
            actor_id=current_user.id,
            activity_type="status_change",
            title=f"Durum degisti: {old_status} -> {new_status}",
            metadata={"old_status": old_status, "new_status": new_status},
        ))

        # Kapanis kontrolu
        if new_status in ("kapanis_basarili", "kapanis_basarisiz", "iptal", "sahte_bos"):
            lead.closed_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(lead)
    return lead


@router.post("/{lead_id}/status")
async def update_lead_status(
    lead_id: int,
    request: LeadStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    if request.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400, detail=f"Gecersiz durum: {request.status}"
        )

    result = await db.execute(select(CRMLead).where(CRMLead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead bulunamadi")

    old_status = lead.status
    lead.status = request.status
    if request.sub_status:
        lead.sub_status = request.sub_status

    if request.status in ("kapanis_basarili", "kapanis_basarisiz", "iptal", "sahte_bos"):
        lead.closed_at = datetime.now(timezone.utc)

    db.add(CRMActivity(
        lead_id=lead.id,
        actor_id=current_user.id,
        activity_type="status_change",
        title=f"Durum degisti: {old_status} -> {request.status}",
        description=request.note,
        metadata={"old_status": old_status, "new_status": request.status},
    ))

    await db.flush()
    return {"ok": True, "status": lead.status}


@router.get("/stats/funnel")
async def get_funnel_stats(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(
        select(CRMLead.status, func.count(CRMLead.id))
        .group_by(CRMLead.status)
    )
    counts = dict(result.all())

    return {
        "talep_geldi": counts.get("talep_geldi", 0),
        "merkez_arandi": counts.get("merkez_arandi", 0),
        "besleme": counts.get("besleme", 0),
        "toplanti_planlandi": counts.get("toplanti_planlandi", 0),
        "toplanti_yapildi": counts.get("toplanti_yapildi", 0),
        "takip_aramasi": counts.get("takip_aramasi", 0),
        "teklif_asamasi": counts.get("teklif_asamasi", 0),
        "kapanis_basarili": counts.get("kapanis_basarili", 0),
        "kapanis_basarisiz": counts.get("kapanis_basarisiz", 0),
    }
