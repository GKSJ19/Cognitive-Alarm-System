from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db, AsyncSessionLocal
from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import decode_token

from app.models.user_model import User
from app.schemas.chat_schemas import (
    MessageCreate,
    MessageResponse,
    ConversationResponse,
    ContactResponse
)
from app.services.chat_service import ChatService
from app.services.chat_websocket_manager import chat_ws_manager

router = APIRouter(prefix="/chat", tags=["Direct Messaging System"])

@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all direct messaging conversations for the current user."""
    return await ChatService.get_conversations(db, current_user)

@router.get("/available-contacts", response_model=list[ContactResponse])
async def get_available_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve list of users available for starting new direct chat (Admin<->Coach, Coach<->Client)."""
    return await ChatService.get_available_contacts(db, current_user)

@router.get("/messages/{other_user_id}", response_model=list[MessageResponse])
async def get_message_history(
    other_user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get full message history with a specific user and auto-mark unread messages as read."""
    try:
        return await ChatService.get_message_history(db, current_user, other_user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    req: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a direct message to an authorized recipient."""
    try:
        return await ChatService.send_message(db, current_user, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/messages/{message_id}/delete-for-me", response_model=dict)
async def delete_message_for_me(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific message for current user only."""
    try:
        await ChatService.delete_message_for_user(db, current_user, message_id)
        return {"message": "Message deleted for user", "id": message_id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/messages/{other_user_id}/read", response_model=dict)
async def mark_messages_read(
    other_user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all unread messages from other_user_id as read."""
    await ChatService.mark_messages_read(db, current_user, other_user_id)
    return {"message": "Messages marked as read", "other_user_id": other_user_id}

@router.websocket("/ws")
async def chat_websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """Real-time WebSocket connection for instant chat messages and typing indicators."""
    payload = decode_token(token)

    if not payload or "sub" not in payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload["sub"]
    await chat_ws_manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "TYPING":
                receiver_id = data.get("receiver_id")
                is_typing = data.get("is_typing", True)
                if receiver_id:
                    await chat_ws_manager.send_personal_message(
                        {
                            "type": "USER_TYPING",
                            "sender_id": user_id,
                            "is_typing": is_typing
                        },
                        receiver_id
                    )
            elif event_type == "SEND_MESSAGE":
                receiver_id = data.get("receiver_id")
                message_text = data.get("message")
                if receiver_id and message_text:
                    async with AsyncSessionLocal() as db:
                        res = await db.execute(select(User).where(User.id == user_id))
                        sender_user = res.scalars().first()
                        if sender_user:
                            await ChatService.send_message(db, sender_user, MessageCreate(receiver_id=receiver_id, message=message_text))

    except WebSocketDisconnect:
        chat_ws_manager.disconnect(user_id, websocket)
    except Exception:
        chat_ws_manager.disconnect(user_id, websocket)
