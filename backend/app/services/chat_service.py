from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc
from sqlalchemy.orm import selectinload
from app.models.chat_model import DirectMessage
from app.models.user_model import User
from app.models.coach_model import CoachAssignment
from app.schemas.chat_schemas import (
    MessageCreate,
    MessageResponse,
    ConversationResponse,
    ContactResponse,
    ChatUserSimple
)
from app.services.chat_websocket_manager import chat_ws_manager

class ChatService:

    @staticmethod
    async def verify_chat_permission(db: AsyncSession, user_a: User, user_b_id: str) -> User:
        """Verify if user_a is authorized to chat with user_b_id based on role and coach assignment."""
        res = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == user_b_id))
        user_b = res.scalars().first()
        if not user_b:
            raise ValueError("Target user not found")

        # 1. Admin can message all users and coaches
        if user_a.role == "admin":
            if user_b.role in ["coach", "user", "admin"]:
                return user_b

        # 2. Coach can message assigned clients and admins
        if user_a.role == "coach":
            if user_b.role == "admin":
                return user_b
            if user_b.role == "user":
                assign_res = await db.execute(
                    select(CoachAssignment).where(
                        CoachAssignment.coach_id == user_a.id,
                        CoachAssignment.user_id == user_b.id,
                        CoachAssignment.status == "active"
                    )
                )
                if not assign_res.scalars().first():
                    raise ValueError("Wellness Coach can only message assigned clients.")
                return user_b
            raise ValueError("Wellness Coach can only message assigned clients and administrators.")

        # 3. User can ONLY message their assigned Wellness Coach
        if user_a.role == "user":
            if user_b.role == "coach":
                assign_res = await db.execute(
                    select(CoachAssignment).where(
                        CoachAssignment.coach_id == user_b.id,
                        CoachAssignment.user_id == user_a.id,
                        CoachAssignment.status == "active"
                    )
                )
                if not assign_res.scalars().first():
                    raise ValueError("User can only message their assigned Wellness Coach.")
                return user_b
            raise ValueError("Users are only permitted to message their assigned Wellness Coach.")

        raise ValueError("Direct messaging is not permitted.")

    @staticmethod
    async def send_message(db: AsyncSession, current_user: User, req: MessageCreate) -> MessageResponse:
        receiver = await ChatService.verify_chat_permission(db, current_user, req.receiver_id)

        msg = DirectMessage(
            sender_id=current_user.id,
            receiver_id=receiver.id,
            message=req.message.strip(),
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)

        msg_dict = msg.to_dict()

        # Real-time WebSocket push to receiver
        await chat_ws_manager.send_personal_message(
            {
                "type": "NEW_MESSAGE",
                "message": msg_dict,
                "sender_name": current_user.full_name,
                "sender_role": current_user.role
            },
            receiver.id
        )

        return MessageResponse(**msg_dict)

    @staticmethod
    async def get_available_contacts(db: AsyncSession, current_user: User) -> List[ContactResponse]:
        contacts: List[ContactResponse] = []

        def get_pic(u: User) -> Optional[str]:
            return u.profile.profile_photo if getattr(u, 'profile', None) else None

        if current_user.role == "admin":
            # Admin can message all Coaches & Users
            res = await db.execute(select(User).options(selectinload(User.profile)).where(User.id != current_user.id, User.role.in_(["coach", "user"])))
            users = res.scalars().all()
            for u in users:
                contacts.append(ContactResponse(
                    id=u.id,
                    full_name=u.full_name,
                    email=u.email,
                    role=u.role,
                    profile_picture=get_pic(u),
                    relationship="coach" if u.role == "coach" else "client"
                ))

        elif current_user.role == "coach":
            # Coach can message assigned Clients + all Admins
            admin_res = await db.execute(select(User).options(selectinload(User.profile)).where(User.role == "admin"))
            admins = admin_res.scalars().all()
            for a in admins:
                contacts.append(ContactResponse(
                    id=a.id, full_name=a.full_name, email=a.email, role=a.role,
                    profile_picture=get_pic(a), relationship="admin"
                ))

            client_res = await db.execute(
                select(User).options(selectinload(User.profile)).join(CoachAssignment, CoachAssignment.user_id == User.id).where(
                    CoachAssignment.coach_id == current_user.id,
                    CoachAssignment.status == "active"
                )
            )
            clients = client_res.scalars().all()
            for c in clients:
                contacts.append(ContactResponse(
                    id=c.id, full_name=c.full_name, email=c.email, role=c.role,
                    profile_picture=get_pic(c), relationship="client"
                ))

        elif current_user.role == "user":
            # User can ONLY message their assigned Wellness Coach
            coach_res = await db.execute(
                select(User).options(selectinload(User.profile)).join(CoachAssignment, CoachAssignment.coach_id == User.id).where(
                    CoachAssignment.user_id == current_user.id,
                    CoachAssignment.status == "active"
                )
            )
            coaches = coach_res.scalars().all()
            for ch in coaches:
                contacts.append(ContactResponse(
                    id=ch.id, full_name=ch.full_name, email=ch.email, role=ch.role,
                    profile_picture=get_pic(ch), relationship="coach"
                ))

        return contacts

    @staticmethod
    async def get_conversations(db: AsyncSession, current_user: User) -> List[ConversationResponse]:
        # Fetch all messages involving current_user
        stmt = select(DirectMessage).where(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.deleted_by_sender == False),
                and_(DirectMessage.receiver_id == current_user.id, DirectMessage.deleted_by_receiver == False)
            )
        ).order_by(desc(DirectMessage.created_at))

        res = await db.execute(stmt)
        messages = res.scalars().all()

        # Group by partner user_id
        partner_last_msg = {}
        partner_unread = {}

        for m in messages:
            partner_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
            if partner_id not in partner_last_msg:
                partner_last_msg[partner_id] = m
                partner_unread[partner_id] = 0

            if m.receiver_id == current_user.id and not m.is_read:
                partner_unread[partner_id] += 1

        conversations = []
        for partner_id, last_m in partner_last_msg.items():
            user_res = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == partner_id))
            partner_user = user_res.scalars().first()
            if not partner_user:
                continue

            pic = partner_user.profile.profile_photo if getattr(partner_user, 'profile', None) else None

            conversations.append(ConversationResponse(
                other_user=ChatUserSimple(
                    id=partner_user.id,
                    full_name=partner_user.full_name,
                    email=partner_user.email,
                    role=partner_user.role,
                    profile_picture=pic,
                    is_online=chat_ws_manager.is_user_online(partner_user.id)
                ),
                last_message=MessageResponse(**last_m.to_dict()),
                unread_count=partner_unread[partner_id],
                updated_at=last_m.created_at.isoformat() if last_m.created_at else ""
            ))



        # Sort conversations newest first
        conversations.sort(key=lambda c: c.updated_at, reverse=True)
        return conversations

    @staticmethod
    async def get_message_history(db: AsyncSession, current_user: User, other_user_id: str) -> List[MessageResponse]:
        await ChatService.verify_chat_permission(db, current_user, other_user_id)

        stmt = select(DirectMessage).where(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_user_id, DirectMessage.deleted_by_sender == False),
                and_(DirectMessage.sender_id == other_user_id, DirectMessage.receiver_id == current_user.id, DirectMessage.deleted_by_receiver == False)
            )
        ).order_by(DirectMessage.created_at.asc())

        res = await db.execute(stmt)
        messages = res.scalars().all()

        # Auto-mark unread messages as read
        now = datetime.utcnow()
        to_commit = False
        for m in messages:
            if m.receiver_id == current_user.id and not m.is_read:
                m.is_read = True
                m.read_at = now
                to_commit = True

        if to_commit:
            await db.commit()
            # Push read receipt to original sender
            await chat_ws_manager.send_personal_message(
                {
                    "type": "MESSAGES_READ",
                    "read_by_id": current_user.id,
                    "other_user_id": other_user_id
                },
                other_user_id
            )

        return [MessageResponse(**m.to_dict()) for m in messages]

    @staticmethod
    async def mark_messages_read(db: AsyncSession, current_user: User, other_user_id: str) -> bool:
        stmt = select(DirectMessage).where(
            DirectMessage.sender_id == other_user_id,
            DirectMessage.receiver_id == current_user.id,
            DirectMessage.is_read == False
        )
        res = await db.execute(stmt)
        unread_msgs = res.scalars().all()

        if unread_msgs:
            now = datetime.utcnow()
            for m in unread_msgs:
                m.is_read = True
                m.read_at = now
            await db.commit()

            await chat_ws_manager.send_personal_message(
                {
                    "type": "MESSAGES_READ",
                    "read_by_id": current_user.id,
                    "other_user_id": other_user_id
                },
                other_user_id
            )

        return True

    @staticmethod
    async def delete_message_for_user(db: AsyncSession, current_user: User, message_id: str) -> bool:
        res = await db.execute(select(DirectMessage).where(DirectMessage.id == message_id))
        msg = res.scalars().first()
        if not msg:
            raise ValueError("Message not found")

        if msg.sender_id == current_user.id:
            msg.deleted_by_sender = True
        elif msg.receiver_id == current_user.id:
            msg.deleted_by_receiver = True
        else:
            raise ValueError("Not authorized to delete this message.")

        await db.commit()
        return True
