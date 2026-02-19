from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, require_permission
from app.models.appointment import CRMAppointment
from app.models.lead import CRMLead
from app.models.activity import CRMActivity
from app.models.user import CRMUser
from app.schemas.appointment import (
    AppointmentConfirmRequest,
    AppointmentCreateRequest,
    AppointmentResponse,
)
from app.utils.permissions import Permission

router = APIRouter()


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    lead_id: Optional[int] = None,
    franchise_office_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    query = select(CRMAppointment).order_by(CRMAppointment.scheduled_date.desc())

    # Franchise sadece kendi ofisini gorur
    if current_user.is_franchise and current_user.franchise_office_id:
        query = query.where(
            CRMAppointment.franchise_office_id == current_user.franchise_office_id
        )

    if lead_id:
        query = query.where(CRMAppointment.lead_id == lead_id)
    if franchise_office_id:
        query = query.where(CRMAppointment.franchise_office_id == franchise_office_id)
    if status_filter:
        query = query.where(CRMAppointment.status == status_filter)

    result = await db.execute(query.limit(100))
    return result.scalars().all()


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    request: AppointmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.APPOINTMENTS_CREATE)
    ),
):
    # Lead kontrol
    lead_result = await db.execute(
        select(CRMLead).where(CRMLead.id == request.lead_id)
    )
    lead = lead_result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead bulunamadi")

    appointment = CRMAppointment(
        **request.model_dump(),
        created_by_id=current_user.id,
        # 2 saat onay penceresi
        confirmation_deadline=datetime.now(timezone.utc) + timedelta(hours=2),
    )
    db.add(appointment)

    # Lead durumunu guncelle
    lead.status = "toplanti_planlandi"
    lead.assigned_franchise_id = request.franchise_office_id

    # Aktivite kaydi
    db.add(CRMActivity(
        lead_id=lead.id,
        actor_id=current_user.id,
        activity_type="appointment_created",
        title="Randevu olusturuldu",
        description=f"Tarih: {request.scheduled_date} {request.scheduled_time}",
    ))

    await db.flush()
    await db.refresh(appointment)
    return appointment


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(
        select(CRMAppointment).where(CRMAppointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")
    return appointment


@router.post("/{appointment_id}/confirm")
async def confirm_appointment(
    appointment_id: int,
    request: AppointmentConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.APPOINTMENTS_CONFIRM)
    ),
):
    result = await db.execute(
        select(CRMAppointment).where(CRMAppointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")

    if appointment.status != "beklemede":
        raise HTTPException(status_code=400, detail="Randevu zaten onaylanmis veya iptal edilmis")

    # Alternatif saat onerildiyse
    if request.alternative_date or request.alternative_time:
        if request.alternative_date:
            appointment.scheduled_date = request.alternative_date
        if request.alternative_time:
            appointment.scheduled_time = request.alternative_time
        appointment.status = "onaylandi"
    else:
        appointment.status = "onaylandi"

    appointment.confirmed_at = datetime.now(timezone.utc)
    appointment.confirmed_by_id = current_user.id

    if request.notes:
        appointment.notes = (appointment.notes or "") + f"\nOnay notu: {request.notes}"

    # Aktivite
    db.add(CRMActivity(
        lead_id=appointment.lead_id,
        actor_id=current_user.id,
        activity_type="appointment_confirmed",
        title="Randevu onaylandi",
    ))

    await db.flush()
    return {"ok": True, "status": "onaylandi"}


@router.post("/{appointment_id}/complete")
async def complete_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(
        select(CRMAppointment).where(CRMAppointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")

    appointment.status = "tamamlandi"

    # Lead durumunu guncelle
    lead_result = await db.execute(
        select(CRMLead).where(CRMLead.id == appointment.lead_id)
    )
    lead = lead_result.scalar_one_or_none()
    if lead:
        lead.status = "toplanti_yapildi"

    await db.flush()
    return {"ok": True, "status": "tamamlandi"}


@router.post("/{appointment_id}/no-show")
async def mark_no_show(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(
        select(CRMAppointment).where(CRMAppointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")

    appointment.status = "gelmedi"

    db.add(CRMActivity(
        lead_id=appointment.lead_id,
        actor_id=current_user.id,
        activity_type="no_show",
        title="Randevuya gelinmedi",
    ))

    await db.flush()
    return {"ok": True, "status": "gelmedi"}
