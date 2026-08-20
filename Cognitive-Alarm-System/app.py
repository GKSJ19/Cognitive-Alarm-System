"""
Intelligent Cognitive Alarm Platform - Main FastAPI Application
AI-powered wake-up optimization with adaptive cognitive challenges
"""

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import json

# Import custom modules
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user, get_coach_user, User, Token, UserRole
)
from enhanced_models import (
    UserRegister, UserLogin, UserProfile, UserProfileCreate, UserInfo,
    HabitCreate, Habit, HabitProgress, AlarmCreate, Alarm,
    ChallengeCreate, Challenge, ChallengeResponse, ChallengeResult,
    WakeUpStats, HabitScore, BehaviorAnalytics, Recommendation,
    UserDashboard, CoachDashboard, AdminDashboard,
    HabitReport, WakeUpReport, ChallengePerformanceReport
)
from enhanced_database import (
    get_db, UserORM, UserProfileORM, HabitORM, HabitProgressORM,
    AlarmORM, ChallengeORM, ChallengeResultORM, WakeUpVerificationORM,
    WakeUpStatsORM, HabitScoreORM, BehaviorAnalyticsORM,
    RecommendationORM, DifficultyAdjustmentORM
)
from challenge_engine import ChallengeEngine
from analytics_engine import BehaviorAnalyzer, HabitScoreCalculator, RecommendationEngine

# Initialize FastAPI app
app = FastAPI(
    title="Intelligent Cognitive Alarm Platform",
    description="AI-powered intelligent alarm system with cognitive challenges",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Authentication Endpoints ====================

@app.post("/api/auth/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(UserORM).filter(UserORM.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if not UserRole.is_valid_role(user_data.role):
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Create user
    user_id = str(uuid.uuid4())
    new_user = UserORM(
        user_id=user_id,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    
    # Create default profile
    profile_id = str(uuid.uuid4())
    profile = UserProfileORM(
        profile_id=profile_id,
        user_id=user_id,
        timezone="UTC",
        preferred_wake_up_time="06:30"
    )
    db.add(profile)
    db.commit()
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "message": "User registered successfully"
    }


@app.post("/api/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and get access token"""
    user = db.query(UserORM).filter(UserORM.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(
        data={
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 30 * 60
    }


# ==================== User Profile Endpoints ====================

@app.post("/api/profile/setup")
def setup_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup user profile after registration"""
    profile = db.query(UserProfileORM).filter(
        UserProfileORM.user_id == current_user.user_id
    ).first()
    
    if not profile:
        profile = UserProfileORM(
            profile_id=str(uuid.uuid4()),
            user_id=current_user.user_id
        )
        db.add(profile)
    
    profile.timezone = profile_data.timezone
    profile.preferred_wake_up_time = profile_data.preferred_wake_up_time
    profile.sleep_duration = profile_data.sleep_duration
    profile.difficulty_preference = profile_data.difficulty_preference
    profile.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Profile updated successfully",
        "profile": UserProfile(
            user_id=current_user.user_id,
            timezone=profile.timezone,
            preferred_wake_up_time=profile.preferred_wake_up_time,
            sleep_duration=profile.sleep_duration,
            difficulty_preference=profile.difficulty_preference,
            created_at=profile.created_at
        )
    }


@app.get("/api/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile"""
    user = db.query(UserORM).filter(UserORM.user_id == current_user.user_id).first()
    profile = db.query(UserProfileORM).filter(
        UserProfileORM.user_id == current_user.user_id
    ).first()
    
    return UserInfo(
        user_id=user.user_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        profile=UserProfile(
            user_id=profile.user_id,
            timezone=profile.timezone,
            preferred_wake_up_time=profile.preferred_wake_up_time,
            sleep_duration=profile.sleep_duration,
            difficulty_preference=profile.difficulty_preference,
            created_at=profile.created_at
        ) if profile else None,
        created_at=user.created_at
    )


# ==================== Habit Management Endpoints ====================

@app.post("/api/habits/create")
def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new habit"""
    habit_id = str(uuid.uuid4())
    
    new_habit = HabitORM(
        habit_id=habit_id,
        user_id=current_user.user_id,
        name=habit_data.name,
        description=habit_data.description,
        category=habit_data.category,
        goal=habit_data.goal,
        frequency=habit_data.frequency,
        is_active=True
    )
    
    db.add(new_habit)
    db.commit()
    
    return Habit(
        habit_id=new_habit.habit_id,
        user_id=new_habit.user_id,
        name=new_habit.name,
        description=new_habit.description,
        category=new_habit.category,
        goal=new_habit.goal,
        frequency=new_habit.frequency,
        is_active=new_habit.is_active,
        created_at=new_habit.created_at
    )


@app.get("/api/habits")
def get_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user habits"""
    habits = db.query(HabitORM).filter(HabitORM.user_id == current_user.user_id).all()
    
    return [
        Habit(
            habit_id=h.habit_id,
            user_id=h.user_id,
            name=h.name,
            description=h.description,
            category=h.category,
            goal=h.goal,
            frequency=h.frequency,
            is_active=h.is_active,
            created_at=h.created_at
        )
        for h in habits
    ]


@app.post("/api/habits/{habit_id}/log-progress")
def log_habit_progress(
    habit_id: str,
    completed: bool,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log daily habit progress"""
    habit = db.query(HabitORM).filter(
        HabitORM.habit_id == habit_id,
        HabitORM.user_id == current_user.user_id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Check if already logged today
    existing = db.query(HabitProgressORM).filter(
        HabitProgressORM.habit_id == habit_id,
        HabitProgressORM.date == today
    ).first()
    
    if existing:
        existing.completed = completed
        existing.notes = notes
    else:
        progress = HabitProgressORM(
            progress_id=str(uuid.uuid4()),
            habit_id=habit_id,
            date=today,
            completed=completed,
            notes=notes
        )
        db.add(progress)
    
    db.commit()
    
    return {"message": "Progress logged successfully"}


# ==================== Alarm Management Endpoints ====================

@app.post("/api/alarms/create")
def create_alarm(
    alarm_data: AlarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new alarm"""
    alarm_id = str(uuid.uuid4())
    
    new_alarm = AlarmORM(
        alarm_id=alarm_id,
        user_id=current_user.user_id,
        title=alarm_data.title,
        alarm_time=alarm_data.alarm_time,
        alarm_type=alarm_data.alarm_type.value,
        days=alarm_data.days if alarm_data.days else None,
        enabled=alarm_data.enabled,
        intensity=alarm_data.intensity,
        description=alarm_data.description
    )
    
    db.add(new_alarm)
    db.commit()
    
    return Alarm(
        alarm_id=new_alarm.alarm_id,
        user_id=new_alarm.user_id,
        title=new_alarm.title,
        alarm_time=new_alarm.alarm_time,
        alarm_type=new_alarm.alarm_type,
        days=new_alarm.days,
        enabled=new_alarm.enabled,
        intensity=new_alarm.intensity,
        description=new_alarm.description,
        created_at=new_alarm.created_at
    )


@app.get("/api/alarms")
def get_alarms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user alarms"""
    alarms = db.query(AlarmORM).filter(AlarmORM.user_id == current_user.user_id).all()
    
    return [
        Alarm(
            alarm_id=a.alarm_id,
            user_id=a.user_id,
            title=a.title,
            alarm_time=a.alarm_time,
            alarm_type=a.alarm_type,
            days=a.days,
            enabled=a.enabled,
            intensity=a.intensity,
            description=a.description,
            created_at=a.created_at
        )
        for a in alarms
    ]


# ==================== Challenge Endpoints ====================

@app.post("/api/challenges/generate")
def generate_challenge(
    alarm_id: str,
    challenge_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a cognitive challenge for an alarm"""
    
    # Get user profile for difficulty preference
    profile = db.query(UserProfileORM).filter(
        UserProfileORM.user_id == current_user.user_id
    ).first()
    
    difficulty = profile.difficulty_preference if profile else "medium"
    
    # Generate challenge using challenge engine
    challenge_data = ChallengeEngine.generate_challenge(challenge_type, difficulty)
    
    challenge_id = str(uuid.uuid4())
    new_challenge = ChallengeORM(
        challenge_id=challenge_id,
        alarm_id=alarm_id,
        user_id=current_user.user_id,
        challenge_type=challenge_data.get("type"),
        difficulty=challenge_data.get("difficulty"),
        content=challenge_data.get("question"),
        correct_answer=challenge_data.get("answer"),
        hints=json.dumps(challenge_data.get("hints", [])),
        time_limit=challenge_data.get("time_limit", 60)
    )
    
    db.add(new_challenge)
    db.commit()
    
    return {
        "challenge_id": challenge_id,
        "question": challenge_data.get("question"),
        "challenge_type": challenge_data.get("type"),
        "difficulty": challenge_data.get("difficulty"),
        "time_limit": challenge_data.get("time_limit"),
        "hints_available": len(challenge_data.get("hints", []))
    }


@app.post("/api/challenges/{challenge_id}/verify")
def verify_challenge(
    challenge_id: str,
    response: ChallengeResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify a challenge response"""
    challenge = db.query(ChallengeORM).filter(
        ChallengeORM.challenge_id == challenge_id,
        ChallengeORM.user_id == current_user.user_id
    ).first()
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Check answer
    is_correct = response.user_answer.lower().strip() == challenge.correct_answer.lower().strip()
    
    # Calculate points
    points = ChallengeEngine.calculate_points(
        is_correct,
        response.time_taken,
        challenge.time_limit,
        challenge.difficulty
    )
    
    # Save result
    result_id = str(uuid.uuid4())
    result = ChallengeResultORM(
        result_id=result_id,
        challenge_id=challenge_id,
        user_answer=response.user_answer,
        is_correct=is_correct,
        time_taken=response.time_taken,
        hint_used=response.hint_used,
        points_earned=points
    )
    
    db.add(result)
    db.commit()
    
    return {
        "is_correct": is_correct,
        "points_earned": points,
        "message": "Correct! Great job waking up!" if is_correct else "Incorrect. Try again!"
    }


# ==================== Wake-Up Statistics Endpoints ====================

@app.post("/api/wake-up/record")
def record_wake_up(
    wake_up_data: Dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record wake-up event"""
    stat_id = str(uuid.uuid4())
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    stat = WakeUpStatsORM(
        stat_id=stat_id,
        user_id=current_user.user_id,
        date=today,
        alarm_id=wake_up_data.get("alarm_id"),
        scheduled_time=wake_up_data.get("scheduled_time"),
        actual_wake_time=wake_up_data.get("actual_wake_time"),
        snoozed=wake_up_data.get("snoozed", False),
        snooze_count=wake_up_data.get("snooze_count", 0),
        challenge_completed=wake_up_data.get("challenge_completed", False),
        challenge_score=wake_up_data.get("challenge_score"),
        productivity_score=wake_up_data.get("productivity_score")
    )
    
    db.add(stat)
    db.commit()
    
    return {"message": "Wake-up recorded successfully"}


@app.get("/api/wake-up/stats")
def get_wake_up_stats(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wake-up statistics for user"""
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    stats = db.query(WakeUpStatsORM).filter(
        WakeUpStatsORM.user_id == current_user.user_id,
        WakeUpStatsORM.date >= start_date
    ).all()
    
    stat_list = [
        {
            "date": s.date,
            "scheduled_time": s.scheduled_time,
            "actual_wake_time": s.actual_wake_time,
            "snoozed": s.snoozed,
            "snooze_count": s.snooze_count,
            "challenge_completed": s.challenge_completed,
            "productivity_score": s.productivity_score
        }
        for s in stats
    ]
    
    # Analyze patterns
    analyzer = BehaviorAnalyzer()
    snooze_analysis = analyzer.analyze_snooze_patterns(stat_list)
    wake_up_analysis = analyzer.analyze_wake_up_patterns(stat_list)
    
    return {
        "stats": stat_list,
        "snooze_patterns": snooze_analysis,
        "wake_up_patterns": wake_up_analysis
    }


# ==================== Analytics & Scoring Endpoints ====================

@app.get("/api/analytics/habit-score")
def get_habit_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current habit score"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get data
    wake_up_stats = db.query(WakeUpStatsORM).filter(
        WakeUpStatsORM.user_id == current_user.user_id,
        WakeUpStatsORM.date >= (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    ).all()
    
    challenge_results = db.query(ChallengeResultORM).filter(
        ChallengeORM.user_id == current_user.user_id
    ).join(ChallengeORM).all()
    
    habits = db.query(HabitORM).filter(
        HabitORM.user_id == current_user.user_id,
        HabitORM.is_active == True
    ).all()
    
    habit_progress = []
    for habit in habits:
        progress = db.query(HabitProgressORM).filter(
            HabitProgressORM.habit_id == habit.habit_id,
            HabitProgressORM.date >= (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        ).all()
        habit_progress.extend([{"completed": p.completed} for p in progress])
    
    # Calculate scores
    calculator = HabitScoreCalculator()
    habit_score = calculator.generate_daily_habit_score(
        [{"snoozed": s.snoozed, "snooze_count": s.snooze_count, 
          "scheduled_time": s.scheduled_time, "actual_wake_time": s.actual_wake_time} for s in wake_up_stats],
        [{"is_correct": c.is_correct, "time_taken": c.time_taken} for c in challenge_results],
        habit_progress
    )
    
    return habit_score


@app.get("/api/analytics/behavior")
def get_behavior_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get behavioral analytics"""
    wake_up_stats = db.query(WakeUpStatsORM).filter(
        WakeUpStatsORM.user_id == current_user.user_id,
        WakeUpStatsORM.date >= (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    ).all()
    
    challenge_results = db.query(ChallengeResultORM).filter(
        ChallengeORM.user_id == current_user.user_id
    ).join(ChallengeORM).all()
    
    analyzer = BehaviorAnalyzer()
    
    stat_dicts = [{
        "snoozed": s.snoozed,
        "snooze_count": s.snooze_count,
        "scheduled_time": s.scheduled_time,
        "actual_wake_time": s.actual_wake_time,
        "challenge_completed": s.challenge_completed
    } for s in wake_up_stats]
    
    challenge_dicts = [{
        "type": c.challenge.challenge_type,
        "difficulty": c.challenge.difficulty,
        "is_correct": c.is_correct,
        "time_taken": c.time_taken
    } for c in challenge_results]
    
    snooze_patterns = analyzer.analyze_snooze_patterns(stat_dicts)
    wake_up_patterns = analyzer.analyze_wake_up_patterns(stat_dicts)
    challenge_perf = analyzer.analyze_challenge_performance(challenge_dicts)
    
    return {
        "snooze_patterns": snooze_patterns,
        "wake_up_patterns": wake_up_patterns,
        "challenge_performance": challenge_perf
    }


@app.get("/api/recommendations")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized recommendations"""
    # Get habit score
    today = datetime.now().strftime("%Y-%m-%d")
    score = db.query(HabitScoreORM).filter(
        HabitScoreORM.user_id == current_user.user_id,
        HabitScoreORM.date == today
    ).first()
    
    habit_score_dict = {
        "wake_up_consistency": score.wake_up_consistency if score else 0,
        "challenge_completion": score.challenge_completion if score else 0,
        "snooze_reduction": score.snooze_reduction if score else 0,
        "sleep_adherence": score.sleep_adherence if score else 0,
        "total_habit_score": score.total_habit_score if score else 0
    } if score else {}
    
    # Get challenge performance
    challenge_results = db.query(ChallengeResultORM).filter(
        ChallengeORM.user_id == current_user.user_id
    ).join(ChallengeORM).all()
    
    analyzer = BehaviorAnalyzer()
    challenge_perf = analyzer.analyze_challenge_performance([{
        "type": c.challenge.challenge_type,
        "difficulty": c.challenge.difficulty,
        "is_correct": c.is_correct,
        "time_taken": c.time_taken
    } for c in challenge_results])
    
    # Generate recommendations
    engine = RecommendationEngine()
    recommendations = engine.generate_recommendations(
        {},
        habit_score_dict,
        challenge_perf
    )
    
    return {"recommendations": recommendations}


# ==================== Dashboard Endpoints ====================

@app.get("/api/dashboard/user")
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user dashboard data"""
    alarms = db.query(AlarmORM).filter(AlarmORM.user_id == current_user.user_id).all()
    active_alarms = [a for a in alarms if a.enabled]
    
    today = datetime.now().strftime("%Y-%m-%d")
    habit_score = db.query(HabitScoreORM).filter(
        HabitScoreORM.user_id == current_user.user_id,
        HabitScoreORM.date == today
    ).first()
    
    wake_up_stats = db.query(WakeUpStatsORM).filter(
        WakeUpStatsORM.user_id == current_user.user_id,
        WakeUpStatsORM.date == today
    ).all()
    
    success_count = sum(1 for s in wake_up_stats if s.actual_wake_time and not s.snoozed)
    
    return {
        "total_alarms": len(alarms),
        "active_alarms": len(active_alarms),
        "habit_score": habit_score.total_habit_score if habit_score else 0,
        "wake_up_success_rate": (success_count / len(wake_up_stats) * 100) if wake_up_stats else 0,
        "today_wake_ups": len(wake_up_stats)
    }


@app.get("/api/dashboard/coach", dependencies=[Depends(get_coach_user)])
def get_coach_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wellness coach dashboard"""
    # Get all users (if admin) or assigned users (if coach)
    if current_user.role == "administrator":
        users = db.query(UserORM).all()
    else:
        users = db.query(UserORM).filter(UserORM.role == "user").all()
    
    total_users = len(users)
    
    # Calculate average habit scores
    today = datetime.now().strftime("%Y-%m-%d")
    scores = db.query(HabitScoreORM).filter(HabitScoreORM.date == today).all()
    avg_score = sum(s.total_habit_score for s in scores) / len(scores) if scores else 0
    
    return {
        "total_users": total_users,
        "avg_habit_score": round(avg_score, 2),
        "active_today": sum(1 for u in users if u.is_active),
        "system_status": "operational"
    }


@app.get("/api/dashboard/admin", dependencies=[Depends(get_admin_user)])
def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard"""
    total_users = db.query(UserORM).count()
    total_alarms = db.query(AlarmORM).count()
    active_users = db.query(UserORM).filter(UserORM.is_active == True).count()
    total_challenges = db.query(ChallengeORM).count()
    
    return {
        "total_users": total_users,
        "total_alarms": total_alarms,
        "active_users": active_users,
        "total_challenges": total_challenges,
        "system_status": "operational",
        "version": "2.0.0"
    }


# ==================== Health & Info Endpoints ====================

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Intelligent Cognitive Alarm Platform",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "name": "Intelligent Cognitive Alarm Platform",
        "version": "2.0.0",
        "docs": "/api/docs",
        "api_status": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
