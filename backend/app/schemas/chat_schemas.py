from pydantic import BaseModel
from typing import Optional, List

class MessageCreate(BaseModel):
    receiver_id: str
    message: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    message: str
    is_read: bool
    read_at: Optional[str] = None
    deleted_by_sender: bool = False
    deleted_by_receiver: bool = False
    created_at: str

class ChatUserSimple(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    profile_picture: Optional[str] = None
    is_online: bool = True

class ConversationResponse(BaseModel):
    other_user: ChatUserSimple
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    updated_at: str

class ContactResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    profile_picture: Optional[str] = None
    relationship: str # "coach", "client", "admin"
