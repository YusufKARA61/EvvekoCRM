from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, require_permission
from app.models.call_log import CRMCallLog
from app.models.lead import CRMLead
from app.models.activity import CRMActivity
from app.models.user import CRMUser
from app.schemas.call import CallLogCreateRequest, CallLogResponse
from app.utils.permissions import Permission

router = APIRouter()


@router.get("", response_model=list[CallLogResponse])
async def list_calls(
    lead_id: Optional[int] = None,
    call_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    query = select(CRMCallLog).order_by(CRMCallLog.created_at.desc())

    if lead_id:
        query = query.where(CRMCallLog.lead_id == lead_id)
    if call_type:
        query = query.where(CRMCallLog.call_type == call_type)

    result = await db.execute(query.limit(100))
    return result.scalars().all()


@router.post("", response_model=CallLogResponse, status_code=201)
async def create_call_log(
    request: CallLogCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.CALLS_MAKE)
    ),
):
    # Lead kontrol
    lead_result = await db.execute(
        select(CRMLead).where(CRMLead.id == request.lead_id)
    )
    lead = lead_result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead bulunamadi")

    call_log = CRMCallLog(
        **request.model_dump(),
        caller_id=current_user.id,
    )
    db.add(call_log)

    # Ilk arama ise lead'i guncelle
    if request.call_type == "ilk_arama" and request.result_code == "baglanti_kuruldu":
        lead.ilk_arama_yapildi_at = datetime.now(timezone.utc)
        if lead.status == "talep_geldi":
            lead.status = "merkez_arandi"

        # Siniflandirma sonucu
        if request.lead_sinif_cikti:
            lead.lead_sinif = request.lead_sinif_cikti
        if request.toplanti_uygunluk_skoru is not None:
            lead.toplanti_uygunluk_skoru = request.toplanti_uygunluk_skoru

        # Script verilerini lead'e kaydet
        if request.script_data:
            sd = request.script_data
            if "karar_verici" in sd:
                lead.karar_verici = sd["karar_verici"]
            if "whatsapp_grubu" in sd:
                lead.whatsapp_grubu_var = sd["whatsapp_grubu"]
            if "bina_yasi" in sd:
                lead.bina_yasi = sd["bina_yasi"]
            if "niyet" in sd:
                lead.niyet = sd["niyet"]

    # Aktivite kaydi
    db.add(CRMActivity(
        lead_id=lead.id,
        actor_id=current_user.id,
        activity_type="call",
        title=f"Arama yapildi ({request.call_type})",
        description=f"Sonuc: {request.result_code}",
        metadata={"call_type": request.call_type, "result": request.result_code},
    ))

    await db.flush()
    await db.refresh(call_log)
    return call_log
