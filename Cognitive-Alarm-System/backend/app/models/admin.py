from sqlalchemy import Boolean, Column, Enum, ForeignKey, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import SettingValueType


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), nullable=False, unique=True)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    used = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="password_reset_tokens")


class CoachAssignment(Base):
    __tablename__ = "coach_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    coach_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    coach = relationship("User", foreign_keys=[coach_id], back_populates="assigned_users")
    user = relationship("User", foreign_keys=[user_id], back_populates="coach_assignments")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(150), nullable=False)
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    admin = relationship("User", foreign_keys=[admin_id], back_populates="audit_logs")
    target_user = relationship("User", foreign_keys=[target_user_id])


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    setting_key = Column(String(100), nullable=False, unique=True)
    setting_value = Column(Text, nullable=True)
    value_type = Column(Enum(SettingValueType), nullable=False, server_default="string")
    description = Column(Text, nullable=True)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    updated_by_user = relationship("User", back_populates="platform_settings")
