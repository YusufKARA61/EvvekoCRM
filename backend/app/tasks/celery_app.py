from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "evvekocrm",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Istanbul",
    enable_utc=True,
)

# Periyodik gorevler
celery_app.conf.beat_schedule = {
    # Her dakika: Yevveko'dan yeni talepler
    "sync-yevveko-talepler": {
        "task": "app.tasks.sync_tasks.sync_new_talepler",
        "schedule": 60.0,
    },
    # Her 5 dakika: SLA ihlali kontrolu
    "check-sla-breaches": {
        "task": "app.tasks.sla_tasks.check_sla_breaches",
        "schedule": 300.0,
    },
    # Her gun gece yarisi: KPI snapshot
    "daily-kpi-snapshot": {
        "task": "app.tasks.kpi_tasks.daily_kpi_snapshot",
        "schedule": crontab(hour=0, minute=5),
    },
}

# Task modulleri
celery_app.autodiscover_tasks(["app.tasks"])
