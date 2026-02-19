import asyncio
from datetime import datetime, timedelta, timezone

from app.tasks.celery_app import celery_app


@celery_app.task
def sync_new_talepler():
    """Yevveko API'den yeni talepleri ceker ve CRM'e ekler."""
    asyncio.run(_sync_new_talepler())


async def _sync_new_talepler():
    from sqlalchemy import func, select

    from app.database import async_session
    from app.models.lead import CRMLead
    from app.services.yevveko_client import YevvekoClient

    client = YevvekoClient()

    async with async_session() as db:
        # Son sync edilen talep ID'sini bul
        result = await db.execute(
            select(func.max(CRMLead.yevveko_talep_id))
        )
        last_id = result.scalar() or 0

        # Yeni talepleri cek
        talepler = await client.get_new_talepler(since_id=last_id)

        for talep in talepler:
            talep_id = talep.get("id")
            if not talep_id:
                continue

            # Zaten var mi
            existing = await db.execute(
                select(CRMLead).where(CRMLead.yevveko_talep_id == talep_id)
            )
            if existing.scalar_one_or_none():
                continue

            lead = CRMLead(
                yevveko_talep_id=talep_id,
                source="yevveko",
                customer_name=talep.get("customer_name"),
                customer_phone=talep.get("customer_phone"),
                il=talep.get("il", "Istanbul"),
                ilce=talep.get("ilce", "Bilinmiyor"),
                mahalle=talep.get("mahalle"),
                sokak=talep.get("sokak"),
                kapi_no=talep.get("kapi_no"),
                ada=talep.get("ada"),
                parsel=talep.get("parsel"),
                bina_alani=talep.get("bina_alani"),
                bagimsiz_bolum_sayisi=talep.get("bagimsiz_bolum_sayisi"),
                donusum_tipi=talep.get("donusum_tipi"),
                status="talep_geldi",
                ilk_arama_deadline=datetime.now(timezone.utc) + timedelta(minutes=30),
            )
            db.add(lead)

        await db.commit()
