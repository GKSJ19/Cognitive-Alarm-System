"""
Database models for Cognitive Alarm System
"""

from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class AlarmActionEnum(str, Enum):
    DISMISS = "dismiss"
    SNOOZE = "snooze"
    TRIGGER = "trigger"


class AlarmFrequencyEnum(str, Enum):
    ONCE = "once"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class AlarmBase(BaseModel):
    title: str
    description: Optional[str] = None
    time: str  # HH:MM format
    frequency: AlarmFrequencyEnum = AlarmFrequencyEnum.DAILY
    enabled: bool = True
    intensity: int = 5  # 1-10 scale


class AlarmCreate(AlarmBase):
    pass


class Alarm(AlarmBase):
    id: str
    created_at: datetime
    updated_at: datetime
    user_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class SensorData(BaseModel):
    sensor_id: str
    value: float
    timestamp: datetime
    metadata: Optional[Dict] = None


class SensorDataHistory(BaseModel):
    sensor_id: str
    values: List[float]
    timestamps: List[datetime]


class UserBehavior(BaseModel):
    alarm_id: str
    action: AlarmActionEnum
    timestamp: datetime
    snooze_duration: Optional[int] = None  # in minutes
    user_id: Optional[str] = None


class AnomalyReport(BaseModel):
    sensor_id: str
    is_anomaly: bool
    score: float
    timestamp: datetime
    details: Optional[Dict] = None


class PatternInfo(BaseModel):
    pattern_id: int
    confidence: float
    features: Dict


class AlarmHealthResponse(BaseModel):
    alarm_id: str
    effectiveness_score: float
    recommendation: str
    dismissed_count: int
    snoozed_count: int


class PredictionResponse(BaseModel):
    next_alarm_time: datetime
    predicted_snooze_time: int
    should_escalate: bool
    confidence: float


class ModelTrainingStatus(BaseModel):
    model_type: str
    is_fitted: bool
    training_samples: int
    last_trained: Optional[datetime] = None
    accuracy: Optional[float] = None
