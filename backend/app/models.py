import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Time, Integer, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(120), unique=True, index=True, nullable=True)
    apple_id = Column(String(120), unique=True, index=True, nullable=True)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


    # Relationship to Alarms (cascade delete ensures orphans are cleaned up)
    alarms = relationship("Alarm", back_populates="owner", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    profile_photo = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    occupation = Column(String(100), nullable=True)
    timezone = Column(String(50), default="UTC")
    preferred_wakeup_time = Column(String(20), nullable=True)
    preferred_sleep_time = Column(String(20), nullable=True)
    bio = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")

from sqlalchemy import Column, String, Boolean, DateTime, Time, Integer, Float, ForeignKey, func, Uuid

class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    alarm_time = Column(Time, nullable=False)
    repeat_type = Column(String(20), default="daily")  # once, daily, weekdays, weekends, custom
    custom_days = Column(String(50), nullable=True)     # e.g. "MON,WED,FRI"
    challenge_type = Column(String(50), default="math") # math, memory, logic, etc.
    volume = Column(Integer, default=80)
    vibration = Column(Boolean, default=True)
    snooze_enabled = Column(Boolean, default=True)
    snooze_duration = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    is_smart_adaptive = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # New fields mapping to React Native frontend
    repeat_days = Column(String(50), nullable=True)     # e.g. "1,2,3,4,5"
    ringtone = Column(String(100), default="cyber_alarm.mp3")
    challenge_required = Column(Boolean, default=True)
    difficulty = Column(String(20), default="medium")   # easy, medium, hard

    owner = relationship("User", back_populates="alarms")

    @property
    def alarm_id(self):
        return self.id



class ChallengeCategory(Base):
    __tablename__ = "challenge_categories"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    challenges = relationship("Challenge", back_populates="category", cascade="all, delete-orphan")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    category_id = Column(Uuid, ForeignKey("challenge_categories.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(String(500), nullable=False)
    difficulty = Column(String(50), nullable=False)     # easy, medium, hard
    correct_answer = Column(String(200), nullable=False)
    additional_data = Column(String(1000), nullable=True) # JSON details (options, arrays, etc.)
    created_at = Column(DateTime, server_default=func.now())

    category = relationship("ChallengeCategory", back_populates="challenges")
    attempts = relationship("ChallengeAttempt", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    challenge_id = Column(Uuid, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answer_submitted = Column(String(200), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    attempt_time = Column(DateTime, server_default=func.now())

    challenge = relationship("Challenge", back_populates="attempts")
    user = relationship("User")


class ChallengeResult(Base):
    __tablename__ = "challenge_results"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    alarm_id = Column(Uuid, ForeignKey("alarms.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(Uuid, ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True)
    score = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    completion_time = Column(Integer, nullable=False)   # in seconds
    total_attempts = Column(Integer, nullable=False)
    solved_at = Column(DateTime, server_default=func.now())

    alarm = relationship("Alarm")
    user = relationship("User")
    challenge = relationship("Challenge")


class AlarmHistory(Base):
    __tablename__ = "alarm_histories"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    alarm_id = Column(Uuid, ForeignKey("alarms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wake_time = Column(String(20), nullable=False)
    solved = Column(Boolean, default=True)
    solve_time = Column(Integer, default=0)
    dismissed_at = Column(DateTime, server_default=func.now())

    alarm = relationship("Alarm")
    user = relationship("User")

    @property
    def history_id(self):
        return self.id



