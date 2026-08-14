from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NotificationCreate(BaseModel):
    title: str
    message: str
    priority: Optional[str] = "normal"

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    priority: str
    created_by_id: str
    created_by_name: str
    created_at: str
    is_read: bool = False

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
