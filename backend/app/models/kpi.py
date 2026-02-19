from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CRMKPISnapshot(Base):
    __tablename__ = "crm_kpi_snapshots"
    __table_args__ = (
        UniqueConstraint("snapshot_date", "entity_type", "entity_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    entity_type: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_id: Mapped[Optional[int]] = mapped_column(Integer)

    # Merkez KPI
    toplam_lead: Mapped[int] = mapped_column(Integer, default=0)
    sla_icinde_arama: Mapped[int] = mapped_column(Integer, default=0)
    sla_uyum_orani: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    toplantiya_donusum: Mapped[int] = mapped_column(Integer, default=0)
    toplantiya_donusum_orani: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    sahte_bos_lead: Mapped[int] = mapped_column(Integer, default=0)
    sahte_bos_orani: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))

    # Ofis KPI
    randevu_toplam: Mapped[int] = mapped_column(Integer, default=0)
    randevu_katilim: Mapped[int] = mapped_column(Integer, default=0)
    gelmedi_sayisi: Mapped[int] = mapped_column(Integer, default=0)
    gelmedi_orani: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    rapor_zamaninda: Mapped[int] = mapped_column(Integer, default=0)
    rapor_tamlik_ortalama: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    toplantidan_teklif: Mapped[int] = mapped_column(Integer, default=0)
    toplantidan_teklif_orani: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    memnuniyet_ortalama: Mapped[Optional[float]] = mapped_column(Numeric(3, 2))

    # Finansal
    kazanilan_gelir: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
