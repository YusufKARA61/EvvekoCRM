import asyncio
from datetime import date, timedelta

from app.tasks.celery_app import celery_app


@celery_app.task
def daily_kpi_snapshot():
    """Gunluk KPI snapshot'i olusturur."""
    asyncio.run(_daily_kpi_snapshot())


async def _daily_kpi_snapshot():
    from sqlalchemy import and_, func, select

    from app.database import async_session
    from app.models.kpi import CRMKPISnapshot
    from app.models.lead import CRMLead
    from app.models.appointment import CRMAppointment
    from app.models.meeting_report import CRMMeetingReport
    from app.models.franchise import FranchiseOffice

    yesterday = date.today() - timedelta(days=1)

    async with async_session() as db:
        # Merkez geneli KPI
        total_leads = (await db.execute(
            select(func.count(CRMLead.id)).where(
                func.date(CRMLead.created_at) == yesterday
            )
        )).scalar() or 0

        sla_ok = (await db.execute(
            select(func.count(CRMLead.id)).where(
                and_(
                    func.date(CRMLead.created_at) == yesterday,
                    CRMLead.ilk_arama_yapildi_at.isnot(None),
                    CRMLead.ilk_arama_yapildi_at <= CRMLead.ilk_arama_deadline,
                )
            )
        )).scalar() or 0

        merkez_kpi = CRMKPISnapshot(
            snapshot_date=yesterday,
            entity_type="merkez",
            entity_id=None,
            toplam_lead=total_leads,
            sla_icinde_arama=sla_ok,
            sla_uyum_orani=(sla_ok / total_leads * 100) if total_leads > 0 else 0,
        )
        db.add(merkez_kpi)

        # Her franchise ofis icin KPI
        offices = (await db.execute(select(FranchiseOffice))).scalars().all()

        for office in offices:
            randevu_total = (await db.execute(
                select(func.count(CRMAppointment.id)).where(
                    and_(
                        CRMAppointment.franchise_office_id == office.id,
                        CRMAppointment.scheduled_date == yesterday,
                    )
                )
            )).scalar() or 0

            gelmedi = (await db.execute(
                select(func.count(CRMAppointment.id)).where(
                    and_(
                        CRMAppointment.franchise_office_id == office.id,
                        CRMAppointment.scheduled_date == yesterday,
                        CRMAppointment.status == "gelmedi",
                    )
                )
            )).scalar() or 0

            office_kpi = CRMKPISnapshot(
                snapshot_date=yesterday,
                entity_type="franchise",
                entity_id=office.id,
                randevu_toplam=randevu_total,
                gelmedi_sayisi=gelmedi,
                gelmedi_orani=(gelmedi / randevu_total * 100) if randevu_total > 0 else 0,
            )
            db.add(office_kpi)

        await db.commit()
