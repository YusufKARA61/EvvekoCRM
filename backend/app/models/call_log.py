from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CRMCallLog(Base):
    __tablename__ = "crm_call_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_leads.id", ondelete="CASCADE"), nullable=False
    )
    caller_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_users.id"), nullable=False
    )

    call_type: Mapped[str] = mapped_column(String(30), nullable=False)
    call_direction: Mapped[str] = mapped_column(String(10), default="outbound")

    # Zamanlama
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)

    # Sonuc
    result_code: Mapped[str] = mapped_column(String(30), nullable=False)

    # Script verileri
    script_data: Mapped[Optional[dict]] = mapped_column(JSONB)

    # Siniflandirma ciktisi
    lead_sinif_cikti: Mapped[Optional[str]] = mapped_column(String(1))
    toplanti_uygunluk_skoru: Mapped[Optional[int]] = mapped_column(Integer)

    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    lead = relationship("CRMLead", back_populates="call_logs")
    caller = relationship("CRMUser", lazy="selectin")
