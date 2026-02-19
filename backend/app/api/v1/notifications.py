from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.notification import CRMNotification
from app.models.user import CRMUser

router = APIRouter()


@router.get("")
async def list_notifications(
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    query = (
        select(CRMNotification)
        .where(CRMNotification.user_id == current_user.id)
        .order_by(CRMNotification.created_at.desc())
    )

    if unread_only:
        query = query.where(CRMNotification.is_read == False)

    result = await db.execute(query.limit(50))
    notifications = result.scalars().all()

    return {
        "items": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "body": n.body,
                "link": n.link,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ],
        "unread_count": sum(1 for n in notifications if not n.is_read),
    }


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    await db.execute(
        update(CRMNotification)
        .where(
            CRMNotification.id == notification_id,
            CRMNotification.user_id == current_user.id,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    return {"ok": True}


@router.post("/read-all")
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user),
):
    await db.execute(
        update(CRMNotification)
        .where(
            CRMNotification.user_id == current_user.id,
            CRMNotification.is_read == False,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    return {"ok": True}
