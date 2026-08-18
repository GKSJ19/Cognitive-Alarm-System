from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user_model import User
from app.schemas.notification_schemas import NotificationCreate, NotificationResponse, NotificationListResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notification Broadcast Management"])

@router.post("/broadcast", response_model=dict, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(["admin"]))])
async def publish_notification(
    req: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to create and publish a system-wide notification to users and coaches."""
    notif = await NotificationService.create_notification(db, current_user, req)
    return notif.to_dict(is_read=True)

@router.get("/admin-list", response_model=list[dict], dependencies=[Depends(RoleChecker(["admin"]))])
async def get_admin_notifications(
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to fetch all published broadcast notifications."""
    return await NotificationService.get_all_notifications_admin(db)

@router.get("", response_model=NotificationListResponse)
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all broadcast notifications for authenticated user or coach with read status and unread count badge."""
    return await NotificationService.get_notifications_for_user(db, current_user.id)

@router.post("/{notification_id}/read", response_model=dict)
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a specific notification as read by current user/coach."""
    await NotificationService.mark_as_read(db, current_user.id, notification_id)
    return {"message": "Notification marked as read", "notification_id": notification_id}

@router.post("/read-all", response_model=dict)
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all broadcast notifications as read for current user/coach."""
    await NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read"}
