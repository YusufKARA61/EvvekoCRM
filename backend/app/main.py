import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, func

from app.config import get_settings
from app.api.v1 import api_router

settings = get_settings()
logger = logging.getLogger("evvekocrm.sync")

# Uploads klasorunu uygulama baslamadan once olustur
os.makedirs(settings.upload_dir, exist_ok=True)


async def auto_sync_yevveko():
    """Her 60 saniyede evveko_db'den yeni talepleri kontrol eder."""
    from app.database import async_session
    from app.models.lead import CRMLead
    from app.services.yevveko_db_sync import fetch_talepler_from_yevveko

    await asyncio.sleep(5)  # Uygulama baslayana kadar bekle
    logger.info("Yevveko otomatik sync basladi (60sn aralikla)")

    while True:
        try:
            async with async_session() as db:
                result = await db.execute(
                    select(func.coalesce(func.max(CRMLead.yevveko_talep_id), 0))
                )
                last_id = result.scalar() or 0

                talepler = await fetch_talepler_from_yevveko(since_id=last_id)
                created = 0

                for talep in talepler:
                    existing = await db.execute(
                        select(CRMLead).where(
                            CRMLead.yevveko_talep_id == talep["talep_id"]
                        )
                    )
                    if existing.scalar_one_or_none():
                        continue

                    created_at = talep.get("created_at")
                    deadline = (created_at + timedelta(minutes=30)) if created_at else (datetime.now() + timedelta(minutes=30))

                    lead = CRMLead(
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
                    db.add(lead)
                    created += 1

                if created > 0:
                    await db.commit()
                    logger.info(f"Otomatik sync: {created} yeni talep eklendi")

        except Exception as e:
            logger.error(f"Otomatik sync hatasi: {e}")

        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(auto_sync_yevveko())
    yield
    task.cancel()


app = FastAPI(
    title="EvvekoCRM API",
    description="Evveko Franchise Yonetim CRM API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploads)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": "EvvekoCRM"}
