from enum import Enum
from functools import wraps
from typing import Callable

from fastapi import HTTPException, status


class Permission(str, Enum):
    # Lead yonetimi
    LEADS_VIEW_ALL = "leads.view_all"
    LEADS_VIEW_OWN_OFFICE = "leads.view_own_office"
    LEADS_CLASSIFY = "leads.classify"
    LEADS_ASSIGN = "leads.assign"

    # Arama
    CALLS_MAKE = "calls.make"
    CALLS_VIEW_ALL = "calls.view_all"

    # Randevu
    APPOINTMENTS_CREATE = "appointments.create"
    APPOINTMENTS_CONFIRM = "appointments.confirm"
    APPOINTMENTS_VIEW_ALL = "appointments.view_all"

    # Rapor
    REPORTS_SUBMIT = "reports.submit"
    REPORTS_VIEW_ALL = "reports.view_all"
    REPORTS_VIEW_INTERNAL = "reports.view_internal"

    # Franchise
    FRANCHISE_MANAGE = "franchise.manage"
    FRANCHISE_VIEW_ALL = "franchise.view_all"

    # Kullanici
    USERS_MANAGE = "users.manage"
    USERS_MANAGE_OWN_TEAM = "users.manage_own_team"

    # KPI
    KPI_VIEW_ALL = "kpi.view_all"
    KPI_VIEW_OWN_OFFICE = "kpi.view_own_office"

    # Gelir
    REVENUE_VIEW_ALL = "revenue.view_all"
    REVENUE_VIEW_OWN = "revenue.view_own"
    REVENUE_APPROVE = "revenue.approve"

    # Ayarlar
    SETTINGS_MANAGE = "settings.manage"

    # Fiyat/taahhut
    PRICING_GIVE = "pricing.give"


# Rol bazli izinler
ROLE_PERMISSIONS: dict[str, list[Permission]] = {
    "merkez_admin": list(Permission),  # Tum izinler
    "merkez_cagri": [
        Permission.LEADS_VIEW_ALL,
        Permission.LEADS_CLASSIFY,
        Permission.CALLS_MAKE,
        Permission.CALLS_VIEW_ALL,
        Permission.APPOINTMENTS_CREATE,
        Permission.APPOINTMENTS_VIEW_ALL,
        Permission.REPORTS_VIEW_ALL,
        Permission.REPORTS_VIEW_INTERNAL,
    ],
    "merkez_satis": [
        Permission.LEADS_VIEW_ALL,
        Permission.LEADS_ASSIGN,
        Permission.APPOINTMENTS_CREATE,
        Permission.APPOINTMENTS_VIEW_ALL,
        Permission.REPORTS_VIEW_ALL,
        Permission.REPORTS_VIEW_INTERNAL,
        Permission.FRANCHISE_VIEW_ALL,
        Permission.KPI_VIEW_ALL,
        Permission.REVENUE_VIEW_ALL,
        Permission.PRICING_GIVE,
    ],
    "franchise_yonetici": [
        Permission.LEADS_VIEW_OWN_OFFICE,
        Permission.APPOINTMENTS_CONFIRM,
        Permission.REPORTS_SUBMIT,
        Permission.USERS_MANAGE_OWN_TEAM,
        Permission.KPI_VIEW_OWN_OFFICE,
        Permission.REVENUE_VIEW_OWN,
    ],
    "franchise_saha": [
        Permission.LEADS_VIEW_OWN_OFFICE,
        Permission.REPORTS_SUBMIT,
    ],
}


def get_user_permissions(role_names: list[str]) -> set[Permission]:
    permissions = set()
    for role_name in role_names:
        role_perms = ROLE_PERMISSIONS.get(role_name, [])
        permissions.update(role_perms)
    return permissions


def has_permission(role_names: list[str], permission: Permission) -> bool:
    return permission in get_user_permissions(role_names)
