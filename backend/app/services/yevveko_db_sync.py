"""
Yevveko evveko_db veritabanından dogrudan talep verilerini ceken servis.
Ayni sunucuda oldugu icin API yerine direkt DB baglantisi kullanir.
"""

from datetime import datetime, timedelta

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import get_settings

settings = get_settings()

# evveko_db icin ayri bir async engine
yevveko_engine = create_async_engine(settings.yevveko_database_url, echo=False)
yevveko_session = async_sessionmaker(yevveko_engine, class_=AsyncSession, expire_on_commit=False)


async def fetch_talepler_from_yevveko(since_id: int = 0) -> list[dict]:
    """evveko_db'den talepleri dogrudan SQL ile ceker."""
    query = text("""
        SELECT
            t.id,
            u.first_name,
            u.last_name,
            u.phone_number,
            u.email,
            t.ilce,
            t.mahalle,
            t.sokak,
            t.kapi_no,
            t.ada,
            t.parsel,
            t.bina_alani,
            t.bagimsiz_bolum_sayisi,
            t.donusum_tipi,
            t.inceleme_durumu,
            t.created_at
        FROM kentsel_donusum_talebi t
        LEFT JOIN tbl_users u ON t.user_id = u.user_id
        WHERE t.id > :since_id
        ORDER BY t.id ASC
    """)

    async with yevveko_session() as session:
        result = await session.execute(query, {"since_id": since_id})
        rows = result.fetchall()

    talepler = []
    for row in rows:
        first_name = row.first_name or ""
        last_name = row.last_name or ""
        customer_name = f"{first_name} {last_name}".strip() or None

        talepler.append({
            "talep_id": row.id,
            "customer_name": customer_name,
            "customer_phone": row.phone_number,
            "customer_email": row.email,
            "ilce": row.ilce or "Bilinmiyor",
            "mahalle": row.mahalle,
            "sokak": row.sokak,
            "kapi_no": row.kapi_no,
            "ada": row.ada,
            "parsel": row.parsel,
            "bina_alani": row.bina_alani,
            "bagimsiz_bolum_sayisi": row.bagimsiz_bolum_sayisi,
            "donusum_tipi": row.donusum_tipi,
            "inceleme_durumu": row.inceleme_durumu,
            "created_at": row.created_at,
        })

    return talepler


async def fetch_single_talep(talep_id: int) -> dict | None:
    """evveko_db'den tek bir talep ceker."""
    query = text("""
        SELECT
            t.id,
            u.first_name,
            u.last_name,
            u.phone_number,
            u.email,
            t.ilce,
            t.mahalle,
            t.sokak,
            t.kapi_no,
            t.ada,
            t.parsel,
            t.bina_alani,
            t.bagimsiz_bolum_sayisi,
            t.donusum_tipi,
            t.inceleme_durumu,
            t.created_at
        FROM kentsel_donusum_talebi t
        LEFT JOIN tbl_users u ON t.user_id = u.user_id
        WHERE t.id = :talep_id
    """)

    async with yevveko_session() as session:
        result = await session.execute(query, {"talep_id": talep_id})
        row = result.fetchone()

    if not row:
        return None

    first_name = row.first_name or ""
    last_name = row.last_name or ""
    customer_name = f"{first_name} {last_name}".strip() or None

    return {
        "talep_id": row.id,
        "customer_name": customer_name,
        "customer_phone": row.phone_number,
        "customer_email": row.email,
        "ilce": row.ilce or "Bilinmiyor",
        "mahalle": row.mahalle,
        "sokak": row.sokak,
        "kapi_no": row.kapi_no,
        "ada": row.ada,
        "parsel": row.parsel,
        "bina_alani": row.bina_alani,
        "bagimsiz_bolum_sayisi": row.bagimsiz_bolum_sayisi,
        "donusum_tipi": row.donusum_tipi,
        "inceleme_durumu": row.inceleme_durumu,
        "created_at": row.created_at,
    }
