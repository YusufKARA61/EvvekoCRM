from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.lead import CRMLead
from app.services.yevveko_client import YevvekoClient

router = APIRouter()
settings = get_settings()


class WebhookPayload(BaseModel):
    talep_id: int


@router.post("/webhook/yeni-talep")
async def receive_new_talep(
    payload: WebhookPayload,
    x_api_key: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    """Yevveko'dan gelen yeni talep webhook'u."""
    if x_api_key != settings.yevveko_crm_api_key:
        raise HTTPException(status_code=401, detail="Gecersiz API key")

    # Zaten var mi kontrol
    existing = await db.execute(
        select(CRMLead).where(CRMLead.yevveko_talep_id == payload.talep_id)
    )
    if existing.scalar_one_or_none():
        return {"ok": True, "message": "Talep zaten mevcut"}

    # Yevveko'dan talep detayini cek
    client = YevvekoClient()
    talep_data = await client.get_talep(payload.talep_id)
    if not talep_data:
        raise HTTPException(status_code=404, detail="Talep Yevveko'da bulunamadi")

    # CRM lead olustur
    lead = CRMLead(
        yevveko_talep_id=payload.talep_id,
        source="yevveko",
        customer_name=talep_data.get("customer_name"),
        customer_phone=talep_data.get("customer_phone"),
        customer_email=talep_data.get("customer_email"),
        il=talep_data.get("il", "Istanbul"),
        ilce=talep_data.get("ilce", "Bilinmiyor"),
        mahalle=talep_data.get("mahalle"),
        sokak=talep_data.get("sokak"),
        kapi_no=talep_data.get("kapi_no"),
        ada=talep_data.get("ada"),
        parsel=talep_data.get("parsel"),
        bina_alani=talep_data.get("bina_alani"),
        bagimsiz_bolum_sayisi=talep_data.get("bagimsiz_bolum_sayisi"),
        donusum_tipi=talep_data.get("donusum_tipi"),
        status="talep_geldi",
        ilk_arama_deadline=datetime.now(timezone.utc) + timedelta(minutes=30),
    )
    db.add(lead)
    await db.flush()

    # TODO: Bildirim gonder (cagri ajanlarına)

    return {"ok": True, "lead_id": lead.id}
