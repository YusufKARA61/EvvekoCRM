from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models.lead import CRMLead
from app.services.yevveko_db_sync import fetch_talepler_from_yevveko, fetch_single_talep

router = APIRouter()
settings = get_settings()

# SLA suresi (dakika)
SLA_MINUTES = 30


def _build_lead(talep: dict) -> CRMLead:
    """Talep verisinden CRMLead olusturur."""
    # Deadline: talebin orijinal olusturulma tarihi + SLA suresi
    created_at = talep.get("created_at")
    if created_at:
        deadline = created_at + timedelta(minutes=SLA_MINUTES)
    else:
        deadline = datetime.now() + timedelta(minutes=SLA_MINUTES)

    return CRMLead(
        yevveko_talep_id=talep["talep_id"],
        source="yevveko",
        customer_name=talep["customer_name"],
        customer_phone=talep["customer_phone"],
        customer_email=talep["customer_email"],
        il="İstanbul",
        ilce=talep["ilce"],
        mahalle=talep["mahalle"],
        sokak=talep["sokak"],
        kapi_no=talep["kapi_no"],
        ada=talep["ada"],
        parsel=talep["parsel"],
        bina_alani=talep["bina_alani"],
        bagimsiz_bolum_sayisi=talep["bagimsiz_bolum_sayisi"],
        donusum_tipi=talep["donusum_tipi"],
        status="talep_geldi",
        ilk_arama_deadline=deadline,
    )


class WebhookPayload(BaseModel):
    talep_id: int


@router.post("/yevveko-sync")
async def sync_from_yevveko_db(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """evveko_db'den yeni talepleri CRM'e senkronize eder."""
    result = await db.execute(
        select(func.coalesce(func.max(CRMLead.yevveko_talep_id), 0))
    )
    last_id = result.scalar() or 0

    talepler = await fetch_talepler_from_yevveko(since_id=last_id)

    created = 0
    skipped = 0

    for talep in talepler:
        existing = await db.execute(
            select(CRMLead).where(CRMLead.yevveko_talep_id == talep["talep_id"])
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        db.add(_build_lead(talep))
        created += 1

    await db.flush()

    return {
        "ok": True,
        "message": f"{created} yeni talep senkronize edildi, {skipped} zaten mevcuttu",
        "created": created,
        "skipped": skipped,
        "last_yevveko_id": last_id,
    }


@router.post("/yevveko-sync-all")
async def sync_all_from_yevveko_db(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """evveko_db'den TUM talepleri CRM'e senkronize eder (ilk kurulum icin)."""
    talepler = await fetch_talepler_from_yevveko(since_id=0)

    created = 0
    skipped = 0

    for talep in talepler:
        existing = await db.execute(
            select(CRMLead).where(CRMLead.yevveko_talep_id == talep["talep_id"])
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        db.add(_build_lead(talep))
        created += 1

    await db.flush()

    return {
        "ok": True,
        "message": f"{created} talep senkronize edildi, {skipped} zaten mevcuttu",
        "created": created,
        "skipped": skipped,
        "total_in_yevveko": len(talepler),
    }


@router.post("/webhook/yeni-talep")
async def receive_new_talep(
    payload: WebhookPayload,
    x_api_key: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    """Yevveko'dan gelen yeni talep webhook'u."""
    if x_api_key != settings.yevveko_crm_api_key:
        raise HTTPException(status_code=401, detail="Gecersiz API key")

    existing = await db.execute(
        select(CRMLead).where(CRMLead.yevveko_talep_id == payload.talep_id)
    )
    if existing.scalar_one_or_none():
        return {"ok": True, "message": "Talep zaten mevcut"}

    talep_data = await fetch_single_talep(payload.talep_id)
    if not talep_data:
        raise HTTPException(status_code=404, detail="Talep evveko_db'de bulunamadi")

    lead = _build_lead(talep_data)
    db.add(lead)
    await db.flush()

    return {"ok": True, "lead_id": lead.id}
