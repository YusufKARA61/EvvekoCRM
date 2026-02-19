from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class CRMLead(Base, TimestampMixin):
    __tablename__ = "crm_leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Yevveko baglantisi
    yevveko_talep_id: Mapped[Optional[int]] = mapped_column(Integer, unique=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="yevveko")
    source_detail: Mapped[Optional[str]] = mapped_column(Text)

    # Musteri bilgileri
    customer_name: Mapped[Optional[str]] = mapped_column(String(200))
    customer_phone: Mapped[Optional[str]] = mapped_column(String(20))
    customer_email: Mapped[Optional[str]] = mapped_column(String(255))

    # Lokasyon
    il: Mapped[Optional[str]] = mapped_column(String(100))
    ilce: Mapped[str] = mapped_column(String(100), nullable=False)
    mahalle: Mapped[Optional[str]] = mapped_column(String(100))
    sokak: Mapped[Optional[str]] = mapped_column(String(200))
    kapi_no: Mapped[Optional[str]] = mapped_column(String(50))
    ada: Mapped[Optional[str]] = mapped_column(String(50))
    parsel: Mapped[Optional[str]] = mapped_column(String(50))

    # Bina bilgileri
    bina_alani: Mapped[Optional[float]] = mapped_column(Float)
    bagimsiz_bolum_sayisi: Mapped[Optional[int]] = mapped_column(Integer)
    bina_yasi: Mapped[Optional[int]] = mapped_column(Integer)
    riskli_yapi_durumu: Mapped[Optional[str]] = mapped_column(String(20))
    donusum_tipi: Mapped[Optional[str]] = mapped_column(String(50))

    # Arama script verileri
    karar_verici: Mapped[Optional[str]] = mapped_column(String(200))
    karar_verici_tipi: Mapped[Optional[str]] = mapped_column(String(50))
    whatsapp_grubu_var: Mapped[Optional[bool]] = mapped_column(Boolean)
    toplanti_yapilabilir: Mapped[Optional[bool]] = mapped_column(Boolean)
    niyet: Mapped[Optional[str]] = mapped_column(String(30))
    ek_notlar: Mapped[Optional[str]] = mapped_column(Text)

    # Siniflandirma
    lead_sinif: Mapped[Optional[str]] = mapped_column(String(1))
    toplanti_uygunluk_skoru: Mapped[int] = mapped_column(Integer, default=0)

    # CRM Pipeline Durumu
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="talep_geldi"
    )
    sub_status: Mapped[Optional[str]] = mapped_column(String(50))

    # Atama
    assigned_franchise_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_franchise_offices.id", ondelete="SET NULL")
    )
    assigned_agent_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_users.id", ondelete="SET NULL")
    )

    # SLA
    ilk_arama_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    ilk_arama_yapildi_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Kapanis
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    assigned_franchise = relationship("FranchiseOffice", lazy="selectin")
    assigned_agent = relationship("CRMUser", lazy="selectin")
    call_logs = relationship("CRMCallLog", back_populates="lead", lazy="dynamic")
    appointments = relationship("CRMAppointment", back_populates="lead", lazy="dynamic")

    @property
    def lokasyon(self) -> str:
        parts = [self.il, self.ilce, self.mahalle]
        return " / ".join(p for p in parts if p)

    @property
    def adres(self) -> str:
        parts = [self.sokak, self.kapi_no]
        return " ".join(p for p in parts if p)
