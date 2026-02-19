from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.leads import router as leads_router
from app.api.v1.calls import router as calls_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.reports import router as reports_router
from app.api.v1.franchise import router as franchise_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.sync import router as sync_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(leads_router, prefix="/leads", tags=["Leads"])
api_router.include_router(calls_router, prefix="/calls", tags=["Calls"])
api_router.include_router(appointments_router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(franchise_router, prefix="/franchise", tags=["Franchise"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(sync_router, prefix="/sync", tags=["Sync"])
