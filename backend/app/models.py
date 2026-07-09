import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func, Uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"

    # Uuid type automatically handles UUID in PostgreSQL and CHAR(32)/String in SQLite
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
