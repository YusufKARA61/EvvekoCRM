"""
Seed data script - Ilk kurulumda calistirilir.
Kullanim: python seed.py
"""
import asyncio

from sqlalchemy import select

from app.database import engine, async_session, Base
from app.models import *  # noqa: F403
from app.services.auth_service import hash_password


async def seed():
    # Tablolari olustur
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # --- ROLLER ---
        roles_data = [
            ("merkez_admin", "Merkez Admin", "Tum yetkilere sahip super yonetici"),
            ("merkez_cagri", "Merkez Cagri Ekibi", "Cagri merkezi ajanlari - ilk arama ve siniflandirma"),
            ("merkez_satis", "Merkez Satis/Pazarlama", "Satis ve pazarlama ekibi - lead takibi"),
            ("franchise_yonetici", "Bayi Yoneticisi", "Franchise ofis yoneticisi - randevu onay ve ekip yonetimi"),
            ("franchise_saha", "Bayi Saha Ekibi", "Franchise saha ekibi - toplanti ve rapor"),
        ]

        for name, display_name, description in roles_data:
            existing = await db.execute(
                select(CRMRole).where(CRMRole.name == name)
            )
            if not existing.scalar_one_or_none():
                db.add(CRMRole(
                    name=name,
                    display_name=display_name,
                    description=description,
                ))

        await db.flush()

        # --- ADMIN KULLANICI ---
        existing_admin = await db.execute(
            select(CRMUser).where(CRMUser.email == "admin@evveko.com")
        )
        if not existing_admin.scalar_one_or_none():
            admin = CRMUser(
                email="admin@evveko.com",
                password_hash=hash_password("admin123"),
                first_name="Evveko",
                last_name="Admin",
                phone="+905001234567",
            )
            db.add(admin)
            await db.flush()

            # Admin rolunu ata
            admin_role = await db.execute(
                select(CRMRole).where(CRMRole.name == "merkez_admin")
            )
            role = admin_role.scalar_one()
            db.add(CRMUserRole(user_id=admin.id, role_id=role.id))

        # --- DEMO CAGRI AJANI ---
        existing_agent = await db.execute(
            select(CRMUser).where(CRMUser.email == "cagri@evveko.com")
        )
        if not existing_agent.scalar_one_or_none():
            agent = CRMUser(
                email="cagri@evveko.com",
                password_hash=hash_password("cagri123"),
                first_name="Ahmet",
                last_name="Yilmaz",
                phone="+905001234568",
            )
            db.add(agent)
            await db.flush()

            cagri_role = await db.execute(
                select(CRMRole).where(CRMRole.name == "merkez_cagri")
            )
            role = cagri_role.scalar_one()
            db.add(CRMUserRole(user_id=agent.id, role_id=role.id))

        # --- DEMO FRANCHISE OFIS ---
        existing_office = await db.execute(
            select(FranchiseOffice).where(FranchiseOffice.code == "FO-IST-01")
        )
        if not existing_office.scalar_one_or_none():
            office = FranchiseOffice(
                name="Evveko Kadikoy Ofisi",
                code="FO-IST-01",
                il="Istanbul",
                ilce="Kadikoy",
                address="Caferaga Mah. Moda Cad. No:15",
                phone="+902161234567",
                email="kadikoy@evveko.com",
                territory_ilceler=["Kadikoy", "Uskudar", "Atasehir"],
                is_active=True,
            )
            db.add(office)
            await db.flush()

            # Bayi yoneticisi
            existing_manager = await db.execute(
                select(CRMUser).where(CRMUser.email == "bayi@evveko.com")
            )
            if not existing_manager.scalar_one_or_none():
                manager = CRMUser(
                    email="bayi@evveko.com",
                    password_hash=hash_password("bayi123"),
                    first_name="Mehmet",
                    last_name="Demir",
                    phone="+905001234569",
                    franchise_office_id=office.id,
                )
                db.add(manager)
                await db.flush()

                franchise_role = await db.execute(
                    select(CRMRole).where(CRMRole.name == "franchise_yonetici")
                )
                role = franchise_role.scalar_one()
                db.add(CRMUserRole(user_id=manager.id, role_id=role.id))

                office.manager_id = manager.id

        # --- SISTEM AYARLARI ---
        settings_data = [
            ("sla_first_call_minutes", "30", "Ilk arama icin SLA suresi (dakika)"),
            ("appointment_confirmation_hours", "2", "Randevu onay penceresi (saat)"),
            ("report_deadline_hours", "24", "Rapor teslim suresi (saat)"),
            ("working_hours_start", "09:00", "Calisma saati baslangic"),
            ("working_hours_end", "18:00", "Calisma saati bitis"),
        ]

        for key, value, desc in settings_data:
            existing = await db.execute(
                select(CRMSetting).where(CRMSetting.key == key)
            )
            if not existing.scalar_one_or_none():
                db.add(CRMSetting(key=key, value=value, description=desc))

        # --- HAKEDIS ORANLARI ---
        rates_data = [
            ("toplanti_ucreti", 500.00, "Toplanti basina ucret (TL)"),
            ("kesif_rapor", 750.00, "Kesif/rapor tamamlama ucreti (TL)"),
            ("teklif_asamasi_bonus", 2000.00, "Teklif asamasina gecis bonusu (TL)"),
            ("kapanis_komisyon", 15000.00, "Anlasmasi kapanan proje komisyonu (TL)"),
        ]

        for event_type, amount, desc in rates_data:
            existing = await db.execute(
                select(CRMRevenueRate).where(CRMRevenueRate.event_type == event_type)
            )
            if not existing.scalar_one_or_none():
                db.add(CRMRevenueRate(
                    event_type=event_type,
                    amount=amount,
                    description=desc,
                ))

        # --- ILK ARAMA SCRIPT ---
        existing_script = await db.execute(
            select(CRMCallScript).where(CRMCallScript.call_type == "ilk_arama")
        )
        if not existing_script.scalar_one_or_none():
            db.add(CRMCallScript(
                name="Standart Ilk Arama Scripti",
                call_type="ilk_arama",
                is_active=True,
                sections=[
                    {
                        "order": 1,
                        "title": "Giris",
                        "script_text": "Merhaba, ben [ISIM] Evveko'dan ariyorum. Kentsel donusum talebi icin basvurunuz bize ulasti.",
                        "data_fields": [],
                    },
                    {
                        "order": 2,
                        "title": "Konum Dogrulama",
                        "script_text": "Binanizin tam adresini dogrulayabilir miyiz?",
                        "data_fields": ["konum_detay"],
                    },
                    {
                        "order": 3,
                        "title": "Bina Bilgileri",
                        "script_text": "Binada kac daire/bagimsiz bolum var? Binanin yakasik yasi nedir?",
                        "data_fields": ["daire_sayisi", "bina_yasi"],
                    },
                    {
                        "order": 4,
                        "title": "Riskli Yapi",
                        "script_text": "Riskli yapi tespiti var mi? Surecte mi?",
                        "data_fields": ["riskli_yapi_durumu"],
                    },
                    {
                        "order": 5,
                        "title": "Karar Verici",
                        "script_text": "Karar verici kim? Yonetici/temsilci/kac kisi?",
                        "data_fields": ["karar_verici", "karar_verici_tipi"],
                    },
                    {
                        "order": 6,
                        "title": "Iletisim & Niyet",
                        "script_text": "WhatsApp grubunuz var mi? Toplanti yapilabilir mi? Amac: Bilgi/Toplanti/Teklif?",
                        "data_fields": ["whatsapp_grubu", "niyet"],
                    },
                ],
                scoring_rules={
                    "daire_sayisi_min": 6,
                    "bina_yasi_min": 20,
                    "niyet_toplanti_bonus": 30,
                    "niyet_teklif_bonus": 40,
                    "whatsapp_var_bonus": 10,
                    "karar_verici_belli_bonus": 15,
                },
            ))

        await db.commit()
        print("Seed data basariyla olusturuldu!")


if __name__ == "__main__":
    asyncio.run(seed())
