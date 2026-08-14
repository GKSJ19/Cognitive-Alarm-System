from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.models.notification_model import BroadcastNotification, NotificationRead
from app.models.user_model import User
from app.schemas.notification_schemas import NotificationCreate, NotificationListResponse, NotificationResponse

class NotificationService:

    @staticmethod
    async def create_notification(db: AsyncSession, admin_user: User, req: NotificationCreate) -> BroadcastNotification:
        notification = BroadcastNotification(
            title=req.title.strip(),
            message=req.message.strip(),
            priority=req.priority or "normal",
            created_by_id=admin_user.id,
            created_by_name=admin_user.full_name or "Administrator"
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    @staticmethod
    async def get_all_notifications_admin(db: AsyncSession) -> list[dict]:
        res = await db.execute(select(BroadcastNotification).order_by(desc(BroadcastNotification.created_at)))
        notifications = res.scalars().all()
        return [n.to_dict(is_read=True) for n in notifications]

    @staticmethod
    async def get_notifications_for_user(db: AsyncSession, user_id: str) -> NotificationListResponse:
        # Fetch all broadcast notifications sorted by newest first
        res = await db.execute(select(BroadcastNotification).order_by(desc(BroadcastNotification.created_at)))
        broadcasts = res.scalars().all()

        # Fetch read IDs for user
        read_res = await db.execute(select(NotificationRead.notification_id).where(NotificationRead.user_id == user_id))
        read_ids = set(read_res.scalars().all())

        notifications_list = []
        unread_count = 0

        for b in broadcasts:
            is_read = b.id in read_ids
            if not is_read:
                unread_count += 1
            notifications_list.append(
                NotificationResponse(
                    id=b.id,
                    title=b.title,
                    message=b.message,
                    priority=b.priority,
                    created_by_id=b.created_by_id,
                    created_by_name=b.created_by_name,
                    created_at=b.created_at.isoformat() if b.created_at else "",
                    is_read=is_read
                )
            )

        return NotificationListResponse(
            notifications=notifications_list,
            unread_count=unread_count
        )

    @staticmethod
    async def mark_as_read(db: AsyncSession, user_id: str, notification_id: str) -> bool:
        # Check if already read
        existing = await db.execute(
            select(NotificationRead).where(
                NotificationRead.user_id == user_id,
                NotificationRead.notification_id == notification_id
            )
        )
        if existing.scalars().first():
            return True

        read_record = NotificationRead(user_id=user_id, notification_id=notification_id)
        db.add(read_record)
        await db.commit()
        return True

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: str) -> bool:
        res = await db.execute(select(BroadcastNotification.id))
        all_ids = res.scalars().all()

        read_res = await db.execute(select(NotificationRead.notification_id).where(NotificationRead.user_id == user_id))
        existing_read_ids = set(read_res.scalars().all())

        to_add = []
        for nid in all_ids:
            if nid not in existing_read_ids:
                to_add.append(NotificationRead(user_id=user_id, notification_id=nid))

        if to_add:
            db.add_all(to_add)
            await db.commit()
        return True
