"""
Cognitive Alarm System - Main FastAPI Application
Implements AI-powered alarm management with anomaly detection and pattern learning
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
import numpy as np

from models import (
    Alarm, AlarmCreate, SensorData, UserBehavior, AnomalyReport,
    AlarmHealthResponse, PredictionResponse, ModelTrainingStatus
)
from database import get_db, AlarmORM, SensorDataORM, UserBehaviorORM, AnomalyORM
from ai_models import (
    AnomalyDetector, PatternLearner, AdaptiveAlarmSystem, PredictiveAnalytics
)

# Initialize FastAPI app
app = FastAPI(
    title="Cognitive Alarm System",
    description="AI-powered intelligent alarm system with anomaly detection and pattern learning",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI models
anomaly_detector = AnomalyDetector(contamination=0.1)
pattern_learner = PatternLearner(eps=0.5, min_samples=5)
adaptive_alarm = AdaptiveAlarmSystem()


# ==================== Health & Status ====================

@app.get("/")
def home():
    """Root endpoint"""
    return {
        "message": "Cognitive Alarm System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/status/models")
def get_models_status() -> List[ModelTrainingStatus]:
    """Get status of all AI models"""
    return [
        ModelTrainingStatus(
            model_type="AnomalyDetector",
            is_fitted=anomaly_detector.is_fitted,
            training_samples=0,
            last_trained=None,
            accuracy=None
        ),
        ModelTrainingStatus(
            model_type="PatternLearner",
            is_fitted=bool(pattern_learner.patterns),
            training_samples=len(pattern_learner.patterns),
            last_trained=None,
            accuracy=None
        )
    ]


# ==================== Alarm Management ====================

@app.post("/alarms/create", response_model=Alarm)
def create_alarm(alarm: AlarmCreate, db: Session = Depends(get_db)):
    """Create a new alarm"""
    alarm_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    db_alarm = AlarmORM(
        id=alarm_id,
        title=alarm.title,
        description=alarm.description,
        time=alarm.time,
        frequency=alarm.frequency,
        enabled=alarm.enabled,
        intensity=alarm.intensity,
        created_at=now,
        updated_at=now
    )
    
    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    
    return Alarm(
        id=db_alarm.id,
        title=db_alarm.title,
        description=db_alarm.description,
        time=db_alarm.time,
        frequency=db_alarm.frequency,
        enabled=db_alarm.enabled,
        intensity=db_alarm.intensity,
        created_at=db_alarm.created_at,
        updated_at=db_alarm.updated_at
    )


@app.get("/alarms", response_model=List[Alarm])
def get_alarms(db: Session = Depends(get_db)):
    """Get all alarms"""
    alarms = db.query(AlarmORM).all()
    return [
        Alarm(
            id=a.id,
            title=a.title,
            description=a.description,
            time=a.time,
            frequency=a.frequency,
            enabled=a.enabled,
            intensity=a.intensity,
            created_at=a.created_at,
            updated_at=a.updated_at
        )
        for a in alarms
    ]


@app.get("/alarms/{alarm_id}", response_model=Alarm)
def get_alarm(alarm_id: str, db: Session = Depends(get_db)):
    """Get a specific alarm"""
    db_alarm = db.query(AlarmORM).filter(AlarmORM.id == alarm_id).first()
    
    if not db_alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    return Alarm(
        id=db_alarm.id,
        title=db_alarm.title,
        description=db_alarm.description,
        time=db_alarm.time,
        frequency=db_alarm.frequency,
        enabled=db_alarm.enabled,
        intensity=db_alarm.intensity,
        created_at=db_alarm.created_at,
        updated_at=db_alarm.updated_at
    )


@app.put("/alarms/{alarm_id}", response_model=Alarm)
def update_alarm(
    alarm_id: str,
    alarm: AlarmCreate,
    db: Session = Depends(get_db)
):
    """Update an existing alarm"""
    db_alarm = db.query(AlarmORM).filter(AlarmORM.id == alarm_id).first()
    
    if not db_alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    db_alarm.title = alarm.title
    db_alarm.description = alarm.description
    db_alarm.time = alarm.time
    db_alarm.frequency = alarm.frequency
    db_alarm.enabled = alarm.enabled
    db_alarm.intensity = alarm.intensity
    db_alarm.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_alarm)
    
    return Alarm(
        id=db_alarm.id,
        title=db_alarm.title,
        description=db_alarm.description,
        time=db_alarm.time,
        frequency=db_alarm.frequency,
        enabled=db_alarm.enabled,
        intensity=db_alarm.intensity,
        created_at=db_alarm.created_at,
        updated_at=db_alarm.updated_at
    )


@app.delete("/alarms/{alarm_id}")
def delete_alarm(alarm_id: str, db: Session = Depends(get_db)):
    """Delete an alarm"""
    db_alarm = db.query(AlarmORM).filter(AlarmORM.id == alarm_id).first()
    
    if not db_alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    db.delete(db_alarm)
    db.commit()
    
    return {"message": "Alarm deleted successfully"}


# ==================== Sensor Data & Anomaly Detection ====================

@app.post("/sensors/data")
def record_sensor_data(data: SensorData, db: Session = Depends(get_db)):
    """Record sensor data and check for anomalies"""
    sensor_id = str(uuid.uuid4())
    
    db_sensor = SensorDataORM(
        id=sensor_id,
        sensor_id=data.sensor_id,
        value=data.value,
        timestamp=data.timestamp,
        metadata=str(data.metadata) if data.metadata else None
    )
    
    db.add(db_sensor)
    db.commit()
    
    # Perform anomaly detection
    anomaly_score = anomaly_detector.get_anomaly_scores(np.array([[data.value]]))[0]
    is_anomaly = anomaly_score > 0.5
    
    # Store anomaly result
    anomaly_id = str(uuid.uuid4())
    db_anomaly = AnomalyORM(
        id=anomaly_id,
        sensor_id=data.sensor_id,
        is_anomaly=is_anomaly,
        score=float(anomaly_score),
        timestamp=datetime.utcnow()
    )
    
    db.add(db_anomaly)
    db.commit()
    
    return {
        "sensor_id": data.sensor_id,
        "value": data.value,
        "is_anomaly": is_anomaly,
        "anomaly_score": float(anomaly_score),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/sensors/{sensor_id}/anomalies")
def get_sensor_anomalies(
    sensor_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get anomalies for a sensor in the last N days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    anomalies = db.query(AnomalyORM).filter(
        (AnomalyORM.sensor_id == sensor_id) &
        (AnomalyORM.timestamp >= cutoff_date)
    ).all()
    
    return {
        "sensor_id": sensor_id,
        "time_period_days": days,
        "total_anomalies": len([a for a in anomalies if a.is_anomaly]),
        "anomaly_rate": len([a for a in anomalies if a.is_anomaly]) / max(len(anomalies), 1),
        "anomalies": [
            {
                "timestamp": a.timestamp.isoformat(),
                "score": a.score,
                "is_anomaly": a.is_anomaly
            }
            for a in anomalies
        ]
    }


# ==================== Pattern Learning ====================

@app.post("/patterns/learn")
def learn_patterns(
    sensor_id: str,
    window_size: int = 10,
    db: Session = Depends(get_db)
):
    """Learn patterns from historical sensor data"""
    sensor_data = db.query(SensorDataORM).filter(
        SensorDataORM.sensor_id == sensor_id
    ).order_by(SensorDataORM.timestamp.desc()).limit(100).all()
    
    if not sensor_data:
        raise HTTPException(status_code=404, detail="No sensor data found")
    
    # Extract values in chronological order
    values = [s.value for s in reversed(sensor_data)]
    
    # Learn patterns
    result = pattern_learner.learn_patterns(values, window_size)
    
    return {
        "sensor_id": sensor_id,
        "patterns_found": result["patterns"],
        "noise_points": result["noise_points"],
        "learning_complete": True
    }


@app.get("/patterns/{sensor_id}/predict")
def predict_pattern(
    sensor_id: str,
    window_size: int = 10,
    db: Session = Depends(get_db)
):
    """Predict pattern for current sensor data"""
    sensor_data = db.query(SensorDataORM).filter(
        SensorDataORM.sensor_id == sensor_id
    ).order_by(SensorDataORM.timestamp.desc()).limit(window_size).all()
    
    if not sensor_data:
        raise HTTPException(status_code=404, detail="No sensor data found")
    
    values = [s.value for s in reversed(sensor_data)]
    prediction = pattern_learner.predict_pattern(values, window_size)
    
    return {
        "sensor_id": sensor_id,
        "pattern_id": prediction["pattern_id"],
        "confidence": prediction["confidence"],
        "distance": prediction["distance"]
    }


# ==================== User Behavior & Adaptive Learning ====================

@app.post("/behaviors/record")
def record_user_behavior(
    behavior: UserBehavior,
    db: Session = Depends(get_db)
):
    """Record user behavior with alarms"""
    behavior_id = str(uuid.uuid4())
    
    db_behavior = UserBehaviorORM(
        id=behavior_id,
        alarm_id=behavior.alarm_id,
        action=behavior.action,
        timestamp=behavior.timestamp,
        snooze_duration=behavior.snooze_duration,
        user_id=behavior.user_id
    )
    
    db.add(db_behavior)
    db.commit()
    
    # Update adaptive alarm system
    adaptive_alarm.record_user_interaction(
        behavior.alarm_id,
        behavior.action,
        behavior.timestamp,
        behavior.snooze_duration
    )
    
    return {"behavior_id": behavior_id, "status": "recorded"}


@app.get("/behaviors/{alarm_id}/predict")
def get_alarm_predictions(alarm_id: str) -> PredictionResponse:
    """Get AI predictions for an alarm"""
    snooze_time = adaptive_alarm.predict_snooze_time(alarm_id)
    should_escalate = adaptive_alarm.should_escalate_alarm(alarm_id)
    
    next_alarm = adaptive_alarm.get_optimal_alarm_time([])
    
    return PredictionResponse(
        next_alarm_time=next_alarm,
        predicted_snooze_time=snooze_time,
        should_escalate=should_escalate,
        confidence=0.8
    )


# ==================== Analytics & Health ====================

@app.get("/analytics/alarm/{alarm_id}/health", response_model=AlarmHealthResponse)
def get_alarm_health(alarm_id: str, db: Session = Depends(get_db)):
    """Get health analysis of an alarm"""
    behaviors = db.query(UserBehaviorORM).filter(
        UserBehaviorORM.alarm_id == alarm_id
    ).all()
    
    behavior_list = [
        {
            "action": b.action,
            "timestamp": b.timestamp,
            "snooze_duration": b.snooze_duration
        }
        for b in behaviors
    ]
    
    health = PredictiveAnalytics.predict_alarm_effectiveness(behavior_list)
    
    return AlarmHealthResponse(
        alarm_id=alarm_id,
        effectiveness_score=health["effectiveness_score"],
        recommendation=health["recommendation"],
        dismissed_count=health.get("dismissed_count", 0),
        snoozed_count=health.get("snoozed_count", 0)
    )


@app.get("/analytics/overview")
def get_system_overview(db: Session = Depends(get_db)):
    """Get overall system analytics"""
    total_alarms = db.query(AlarmORM).count()
    active_alarms = db.query(AlarmORM).filter(AlarmORM.enabled == True).count()
    total_behaviors = db.query(UserBehaviorORM).count()
    total_anomalies = db.query(AnomalyORM).filter(AnomalyORM.is_anomaly == True).count()
    
    return {
        "total_alarms": total_alarms,
        "active_alarms": active_alarms,
        "total_behaviors_recorded": total_behaviors,
        "total_anomalies_detected": total_anomalies,
        "system_status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
