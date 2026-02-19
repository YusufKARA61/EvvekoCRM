from app.models.user import CRMUser, CRMRole, CRMUserRole
from app.models.franchise import FranchiseOffice
from app.models.lead import CRMLead
from app.models.call_log import CRMCallLog
from app.models.appointment import CRMAppointment
from app.models.meeting_report import CRMMeetingReport
from app.models.satisfaction import CRMSatisfactionCall
from app.models.kpi import CRMKPISnapshot
from app.models.revenue import CRMRevenueEvent, CRMRevenueRate
from app.models.activity import CRMActivity
from app.models.notification import CRMNotification
from app.models.settings import CRMSetting, CRMCallScript

__all__ = [
    "CRMUser", "CRMRole", "CRMUserRole",
    "FranchiseOffice",
    "CRMLead",
    "CRMCallLog",
    "CRMAppointment",
    "CRMMeetingReport",
    "CRMSatisfactionCall",
    "CRMKPISnapshot",
    "CRMRevenueEvent", "CRMRevenueRate",
    "CRMActivity",
    "CRMNotification",
    "CRMSetting", "CRMCallScript",
]
