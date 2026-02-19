import asyncio
from datetime import datetime, timezone

from app.tasks.celery_app import celery_app


@celery_app.task
def check_sla_breaches():
    """SLA ihlali olan leadleri kontrol eder ve bildirim gonderir."""
    asyncio.run(_check_sla_breaches())


async def _check_sla_breaches():
    from sqlalchemy import and_, select

    from app.database import async_session
    from app.models.lead import CRMLead
    from app.models.notification import CRMNotification
    from app.models.user import CRMUser, CRMUserRole, CRMRole

    now = datetime.now(timezone.utc)

    async with async_session() as db:
        # SLA ihlali olan leadler
        result = await db.execute(
            select(CRMLead).where(
                and_(
                    CRMLead.ilk_arama_deadline < now,
                    CRMLead.ilk_arama_yapildi_at.is_(None),
                    CRMLead.status == "talep_geldi",
                )
            )
        )
        breached_leads = result.scalars().all()

        if not breached_leads:
            return

        # Merkez admin ve cagri ajanlarini bul
        admin_role = await db.execute(
            select(CRMRole).where(CRMRole.name.in_(["merkez_admin", "merkez_cagri"]))
        )
        role_ids = [r.id for r in admin_role.scalars().all()]

        if role_ids:
            users_result = await db.execute(
                select(CRMUser.id).join(CRMUserRole).where(
                    CRMUserRole.role_id.in_(role_ids)
                )
            )
            user_ids = [uid for (uid,) in users_result.all()]

            for lead in breached_leads:
                for user_id in user_ids:
                    db.add(CRMNotification(
                        user_id=user_id,
                        type="sla_warning",
                        title="SLA Ihlali!",
                        body=f"Lead #{lead.id} ({lead.ilce}) icin ilk arama suresi asildi.",
                        link=f"/merkez/leads/{lead.id}",
                    ))

        await db.commit()
