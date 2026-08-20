"""
Database initialization and session management
"""

from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./alarm_system.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class AlarmORM(Base):
    __tablename__ = "alarms"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    time = Column(String)
    frequency = Column(String, default="daily")
    enabled = Column(Boolean, default=True)
    intensity = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, nullable=True)


class SensorDataORM(Base):
    __tablename__ = "sensor_data"
    
    id = Column(String, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metadata = Column(Text, nullable=True)


class UserBehaviorORM(Base):
    __tablename__ = "user_behaviors"
    
    id = Column(String, primary_key=True, index=True)
    alarm_id = Column(String, index=True)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    snooze_duration = Column(Integer, nullable=True)
    user_id = Column(String, nullable=True)


class AnomalyORM(Base):
    __tablename__ = "anomalies"
    
    id = Column(String, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    is_anomaly = Column(Boolean)
    score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
