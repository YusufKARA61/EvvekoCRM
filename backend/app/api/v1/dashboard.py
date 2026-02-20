from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.lead import CRMLead
from app.models.appointment import CRMAppointment
from app.models.meeting_report import CRMMeetingReport
from app.models.user import CRMUser
from app.schemas.dashboard import DashboardStats, FranchiseDashboardStats

router = APIRouter()


@router.get("/merkez", response_model=DashboardStats)
async def merkez_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    today = date.today()

    # Toplam lead
    total = (await db.execute(select(func.count(CRMLead.id)))).scalar() or 0

    # Bugunun leadleri
    bugun = (await db.execute(
        select(func.count(CRMLead.id)).where(
            func.date(CRMLead.created_at) == today
        )
    )).scalar() or 0

    # Bekleyen aramalar (talep_geldi statusunde)
    bekleyen = (await db.execute(
        select(func.count(CRMLead.id)).where(CRMLead.status == "talep_geldi")
    )).scalar() or 0

    # SLA ihlali (deadline gecmis ama aranmamis)
    sla = (await db.execute(
        select(func.count(CRMLead.id)).where(
            and_(
                CRMLead.ilk_arama_deadline < datetime.now(),
                CRMLead.ilk_arama_yapildi_at.is_(None),
                CRMLead.status == "talep_geldi",
            )
        )
    )).scalar() or 0

    # Bugunun randevulari
    randevular = (await db.execute(
        select(func.count(CRMAppointment.id)).where(
            CRMAppointment.scheduled_date == today
        )
    )).scalar() or 0

    # Bekleyen raporlar (tamamlandi ama rapor yok)
    # Basitlestirilmis sorgu
    bekleyen_rapor = (await db.execute(
        select(func.count(CRMAppointment.id)).where(
            and_(
                CRMAppointment.status == "tamamlandi",
                ~CRMAppointment.id.in_(
                    select(CRMMeetingReport.appointment_id)
                ),
            )
        )
    )).scalar() or 0

    # Toplantiya donusum orani
    toplanti_count = (await db.execute(
        select(func.count(CRMLead.id)).where(
            CRMLead.status.in_(["toplanti_planlandi", "toplanti_yapildi", "teklif_asamasi", "kapanis_basarili"])
        )
    )).scalar() or 0
    donusum_orani = round((toplanti_count / total * 100), 1) if total > 0 else 0.0

    # Aylik kapanis
    aylik = (await db.execute(
        select(func.count(CRMLead.id)).where(
            and_(
                CRMLead.status == "kapanis_basarili",
                func.extract("month", CRMLead.closed_at) == today.month,
                func.extract("year", CRMLead.closed_at) == today.year,
            )
        )
    )).scalar() or 0

    return DashboardStats(
        toplam_lead=total,
        bugunun_leadleri=bugun,
        bekleyen_aramalar=bekleyen,
        sla_ihlali=sla,
        bugunun_randevulari=randevular,
        bekleyen_raporlar=bekleyen_rapor,
        toplantiya_donusum_orani=donusum_orani,
        aylik_kapanis=aylik,
    )


@router.get("/bayi", response_model=FranchiseDashboardStats)
async def bayi_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    office_id = current_user.franchise_office_id
    if not office_id:
        return FranchiseDashboardStats()

    # Bekleyen randevular
    bekleyen = (await db.execute(
        select(func.count(CRMAppointment.id)).where(
            and_(
                CRMAppointment.franchise_office_id == office_id,
                CRMAppointment.status.in_(["beklemede", "onaylandi"]),
            )
        )
    )).scalar() or 0

    # Onay bekleyen
    onay = (await db.execute(
        select(func.count(CRMAppointment.id)).where(
            and_(
                CRMAppointment.franchise_office_id == office_id,
                CRMAppointment.status == "beklemede",
            )
        )
    )).scalar() or 0

    return FranchiseDashboardStats(
        bekleyen_randevular=bekleyen,
        onay_bekleyen=onay,
    )
