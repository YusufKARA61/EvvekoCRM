from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, require_permission
from app.models.appointment import CRMAppointment
from app.models.meeting_report import CRMMeetingReport
from app.models.activity import CRMActivity
from app.models.user import CRMUser
from app.schemas.report import MeetingReportCreateRequest, MeetingReportResponse
from app.utils.permissions import Permission

router = APIRouter()


def calculate_completeness(report: CRMMeetingReport) -> int:
    """Rapor tamlik puanini hesapla (0-100)."""
    score = 0
    if report.meeting_type:
        score += 10
    if report.katilimci_sayisi and report.katilimci_sayisi > 0:
        score += 15
    if report.karar_durumu:
        score += 15
    if report.sonraki_adimlar:
        score += 15
    if report.sunum_yapildi:
        score += 10
    if report.ozet and len(report.ozet) > 20:
        score += 15
    if report.fotograflar and len(report.fotograflar) > 0:
        score += 10
    if report.saha_ziyareti_yapildi and report.bina_durumu:
        score += 10
    return min(score, 100)


@router.get("", response_model=list[MeetingReportResponse])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    query = select(CRMMeetingReport).order_by(CRMMeetingReport.created_at.desc())

    if current_user.is_franchise and current_user.franchise_office_id:
        query = query.where(
            CRMMeetingReport.franchise_office_id == current_user.franchise_office_id
        )

    result = await db.execute(query.limit(100))
    return result.scalars().all()


@router.post("", response_model=MeetingReportResponse, status_code=201)
async def create_report(
    request: MeetingReportCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(
        require_permission(Permission.REPORTS_SUBMIT)
    ),
):
    # Randevu kontrol
    appt_result = await db.execute(
        select(CRMAppointment).where(CRMAppointment.id == request.appointment_id)
    )
    appointment = appt_result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")

    # Zaten rapor var mi
    existing = await db.execute(
        select(CRMMeetingReport).where(
            CRMMeetingReport.appointment_id == request.appointment_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu randevu icin zaten rapor mevcut")

    now = datetime.now(timezone.utc)
    report = CRMMeetingReport(
        **request.model_dump(),
        lead_id=appointment.lead_id,
        franchise_office_id=appointment.franchise_office_id,
        submitted_by_id=current_user.id,
        submitted_at=now,
    )

    # Gec mi?
    if appointment.scheduled_date:
        from datetime import timedelta
        deadline = datetime.combine(
            appointment.scheduled_date, appointment.scheduled_time
        ).replace(tzinfo=timezone.utc) + timedelta(hours=24)
        report.rapor_deadline = deadline
        report.gec_mi = now > deadline

    # Tamlik puani hesapla
    report.tamlik_puani = calculate_completeness(report)

    db.add(report)

    # Aktivite kaydi
    db.add(CRMActivity(
        lead_id=appointment.lead_id,
        franchise_office_id=appointment.franchise_office_id,
        actor_id=current_user.id,
        activity_type="report_submitted",
        title="Toplanti raporu girildi",
        description=f"Tamlik puani: {report.tamlik_puani}%",
    ))

    await db.flush()
    await db.refresh(report)
    return report


@router.get("/{report_id}", response_model=MeetingReportResponse)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    result = await db.execute(
        select(CRMMeetingReport).where(CRMMeetingReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Rapor bulunamadi")
    return report
