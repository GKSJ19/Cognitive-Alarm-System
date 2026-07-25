"""
Intelligent Cognitive Alarm Platform — Single-File Backend (Milestones 1 & 2)
FastAPI + SQLAlchemy (PostgreSQL, SQLite fallback) + JWT auth.

Run:
  pip install "fastapi[all]" sqlalchemy psycopg2-binary "passlib[bcrypt]" "python-jose[cryptography]" pydantic-settings
  export DATABASE_URL="postgresql+psycopg2://user:pass@localhost:5432/cogalarm"   # optional; defaults to sqlite
  export SECRET_KEY="change-me"
  uvicorn main:app --reload --port 8000

Docs: http://localhost:8000/docs
"""
from __future__ import annotations

import os, uuid, random, json, secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Literal

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import (
    create_engine, Column, String, Boolean, DateTime, ForeignKey, Integer, Float, JSON, Text,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

# ---------- Config ----------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cogalarm.db")
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Use String UUID for cross-db compatibility
def UUIDCol():
    return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

# ---------- Models ----------
class User(Base):
    __tablename__ = "users"
    id = UUIDCol()
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    alarms = relationship("Alarm", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    id = UUIDCol()
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_wake_time = Column(String, default="07:00")
    sleep_duration_goal = Column(Float, default=8.0)
    timezone = Column(String, default="UTC")
    difficulty_preference = Column(String, default="easy")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="profile")

class Alarm(Base):
    __tablename__ = "alarms"
    id = UUIDCol()
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    alarm_time = Column(String, nullable=False)  # "HH:MM"
    days = Column(String, nullable=False, default="DAILY")  # DAILY / WEEKDAYS / MON,TUE,...
    challenge_type = Column(String, nullable=False, default="MATH")  # MATH/RIDDLE/MEMORY/LOGIC
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="alarms")

class ChallengeQuestion(Base):
    __tablename__ = "challenge_questions"
    id = UUIDCol()
    type = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    question_data = Column(JSON, nullable=False)
    correct_answer = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"
    id = UUIDCol()
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(String(36), nullable=True)
    challenge_type = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    correct = Column(Boolean, nullable=False)
    time_taken = Column(Float, default=0.0)
    attempted_at = Column(DateTime, default=datetime.utcnow)

class AlarmTriggerSession(Base):
    __tablename__ = "alarm_trigger_sessions"
    id = UUIDCol()
    alarm_id = Column(String(36), ForeignKey("alarms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(String(36), nullable=False)
    attempts = Column(Integer, default=0)
    dismissed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    dismissed_at = Column(DateTime, nullable=True)

Base.metadata.create_all(bind=engine)

# ---------- Auth ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def hash_password(p): return pwd_context.hash(p)
def verify_password(p, h): return pwd_context.verify(p, h)

def create_access_token(sub: str):
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    cred_exc = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if not uid: raise cred_exc
    except JWTError:
        raise cred_exc
    user = db.query(User).filter(User.id == uid).first()
    if not user: raise cred_exc
    return user

# ---------- Schemas ----------
class RegisterIn(BaseModel):
    email: EmailStr; password: str = Field(min_length=6); full_name: str

class LoginIn(BaseModel):
    email: EmailStr; password: str

class TokenOut(BaseModel):
    access_token: str; token_type: str = "bearer"; user_id: str; email: str; full_name: str

class UserOut(BaseModel):
    id: str; email: str; full_name: str; role: str
    class Config: from_attributes = True

class ProfileIn(BaseModel):
    preferred_wake_time: Optional[str] = None
    sleep_duration_goal: Optional[float] = None
    timezone: Optional[str] = None
    difficulty_preference: Optional[str] = None

class ProfileOut(ProfileIn):
    id: str; user_id: str
    class Config: from_attributes = True

class AlarmIn(BaseModel):
    alarm_time: str
    days: str = "DAILY"
    challenge_type: Literal["MATH","RIDDLE","MEMORY","LOGIC"] = "MATH"
    is_active: bool = True

class AlarmOut(AlarmIn):
    id: str; user_id: str; created_at: datetime
    class Config: from_attributes = True

class ChallengeOut(BaseModel):
    challenge_id: str
    type: str
    difficulty: str
    question: dict
    instructions: str

class ValidateIn(BaseModel):
    challenge_id: str
    user_answer: str

class AttemptIn(BaseModel):
    challenge_id: str
    correct: bool
    time_taken: float

class DismissIn(BaseModel):
    user_answer: str
    time_taken: float = 0.0

# ---------- Challenge generation ----------
RIDDLES = [
    ("I speak without a mouth and hear without ears. What am I?", "echo"),
    ("The more you take, the more you leave behind. What are they?", "footsteps"),
    ("What has keys but can't open locks?", "piano"),
    ("What has to be broken before you can use it?", "egg"),
    ("I'm tall when I'm young, and short when I'm old. What am I?", "candle"),
    ("What month of the year has 28 days?", "all"),
    ("What is full of holes but still holds water?", "sponge"),
    ("What question can you never answer yes to?", "are you asleep"),
    ("What has a head and a tail but no body?", "coin"),
    ("What gets wetter the more it dries?", "towel"),
    ("What has cities but no houses, forests but no trees?", "map"),
    ("What can travel around the world while staying in a corner?", "stamp"),
]

DIFFICULTY_RANGES = {
    "beginner": (1, 10), "easy": (10, 50), "medium": (20, 200),
    "hard": (100, 999), "expert": (500, 9999),
}

def gen_math(difficulty: str):
    lo, hi = DIFFICULTY_RANGES.get(difficulty, (10, 50))
    a, b = random.randint(lo, hi), random.randint(lo, hi)
    op = random.choice(["+", "-", "*"] if difficulty in ("medium","hard","expert") else ["+", "-"])
    expr = f"{a} {op} {b}"
    ans = eval(expr)
    return {"question": f"{expr} = ?"}, str(ans)

def gen_riddle(difficulty: str):
    q, a = random.choice(RIDDLES)
    return {"question": q}, a.lower()

def gen_memory(difficulty: str):
    n = {"beginner":3,"easy":4,"medium":5,"hard":6,"expert":8}.get(difficulty,5)
    digits = "".join(str(random.randint(0,9)) for _ in range(n))
    return {"question": f"Memorize these digits: {digits}", "digits": digits, "display_ms": 3000}, digits

def gen_logic(difficulty: str):
    # sequences n*(n+1)
    start = random.randint(1, 4)
    seq = [i*(i+1) for i in range(start, start+4)]
    nxt = (start+4)*(start+5)
    return {"question": f"What comes next? {', '.join(map(str, seq))}, ?"}, str(nxt)

GENERATORS = {"MATH": gen_math, "RIDDLE": gen_riddle, "MEMORY": gen_memory, "LOGIC": gen_logic}

def make_challenge(db: Session, ctype: str, difficulty: str) -> ChallengeQuestion:
    ctype = ctype.upper()
    gen = GENERATORS.get(ctype, gen_math)
    qdata, ans = gen(difficulty)
    row = ChallengeQuestion(type=ctype, difficulty=difficulty, question_data=qdata, correct_answer=str(ans))
    db.add(row); db.commit(); db.refresh(row)
    return row

INSTRUCTIONS = {
    "MATH": "Solve the equation and enter the numeric answer.",
    "RIDDLE": "Read the riddle and type the one-word answer.",
    "MEMORY": "Memorize the digits, then type them back in order.",
    "LOGIC": "Identify the pattern and enter the next number.",
}

# ---------- App ----------
app = FastAPI(title="Cognitive Alarm API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Auth
@app.post("/api/auth/register", response_model=TokenOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(email=body.email, full_name=body.full_name, hashed_password=hash_password(body.password))
    db.add(user); db.flush()
    db.add(Profile(user_id=user.id))
    db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id), user_id=user.id, email=user.email, full_name=user.full_name)

@app.post("/api/auth/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    return TokenOut(access_token=create_access_token(user.id), user_id=user.id, email=user.email, full_name=user.full_name)

# Users / Profile
@app.get("/api/users/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@app.get("/api/users/profile", response_model=ProfileOut)
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prof = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not prof:
        prof = Profile(user_id=user.id); db.add(prof); db.commit(); db.refresh(prof)
    return prof

@app.put("/api/users/profile", response_model=ProfileOut)
def update_profile(body: ProfileIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prof = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not prof:
        prof = Profile(user_id=user.id); db.add(prof)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(prof, k, v)
    db.commit(); db.refresh(prof); return prof

# Alarms
@app.post("/api/alarms", response_model=AlarmOut)
def create_alarm(body: AlarmIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = Alarm(user_id=user.id, **body.model_dump())
    db.add(a); db.commit(); db.refresh(a); return a

@app.get("/api/alarms", response_model=List[AlarmOut])
def list_alarms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Alarm).filter(Alarm.user_id == user.id).order_by(Alarm.alarm_time).all()

@app.put("/api/alarms/{alarm_id}", response_model=AlarmOut)
def update_alarm(alarm_id: str, body: AlarmIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == user.id).first()
    if not a: raise HTTPException(404, "Alarm not found")
    for k, v in body.model_dump().items(): setattr(a, k, v)
    db.commit(); db.refresh(a); return a

@app.delete("/api/alarms/{alarm_id}")
def delete_alarm(alarm_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == user.id).first()
    if not a: raise HTTPException(404, "Alarm not found")
    db.delete(a); db.commit(); return {"ok": True}

# Challenges
@app.get("/api/challenges/random", response_model=ChallengeOut)
def random_challenge(difficulty: str = "easy", type: str = "math",
                     user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = make_challenge(db, type.upper(), difficulty.lower())
    return ChallengeOut(challenge_id=q.id, type=q.type, difficulty=q.difficulty,
                        question=q.question_data, instructions=INSTRUCTIONS[q.type])

@app.post("/api/challenges/validate")
def validate_challenge(body: ValidateIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(ChallengeQuestion).filter(ChallengeQuestion.id == body.challenge_id).first()
    if not q: raise HTTPException(404, "Challenge not found")
    correct = body.user_answer.strip().lower() == q.correct_answer.strip().lower()
    return {"correct": correct, "correct_answer": q.correct_answer if not correct else None}

@app.post("/api/challenges/attempt")
def record_attempt(body: AttemptIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(ChallengeQuestion).filter(ChallengeQuestion.id == body.challenge_id).first()
    if not q: raise HTTPException(404, "Challenge not found")
    att = ChallengeAttempt(user_id=user.id, challenge_id=q.id, challenge_type=q.type,
                           difficulty=q.difficulty, correct=body.correct, time_taken=body.time_taken)
    db.add(att); db.commit(); return {"ok": True, "attempt_id": att.id}

@app.get("/api/challenges/history")
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(ChallengeAttempt).filter(ChallengeAttempt.user_id == user.id)\
        .order_by(ChallengeAttempt.attempted_at.desc()).limit(100).all()
    total = len(rows)
    correct = sum(1 for r in rows if r.correct)
    avg_time = (sum(r.time_taken for r in rows) / total) if total else 0
    return {
        "accuracy": (correct/total*100) if total else 0,
        "average_time": avg_time,
        "total_attempts": total,
        "attempts": [{"id": r.id, "type": r.challenge_type, "difficulty": r.difficulty,
                      "correct": r.correct, "time_taken": r.time_taken,
                      "attempted_at": r.attempted_at.isoformat()} for r in rows]
    }

# Alarm trigger flow
@app.get("/api/alarms/trigger/{alarm_id}", response_model=ChallengeOut)
def trigger_alarm(alarm_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == user.id).first()
    if not alarm: raise HTTPException(404, "Alarm not found")
    prof = db.query(Profile).filter(Profile.user_id == user.id).first()
    difficulty = (prof.difficulty_preference if prof else "easy") or "easy"
    q = make_challenge(db, alarm.challenge_type, difficulty)
    session = AlarmTriggerSession(alarm_id=alarm.id, user_id=user.id, challenge_id=q.id, attempts=0)
    db.add(session); db.commit()
    return ChallengeOut(challenge_id=q.id, type=q.type, difficulty=q.difficulty,
                        question=q.question_data, instructions=INSTRUCTIONS[q.type])

@app.post("/api/alarms/dismiss/{alarm_id}")
def dismiss_alarm(alarm_id: str, body: DismissIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(AlarmTriggerSession).filter(
        AlarmTriggerSession.alarm_id == alarm_id,
        AlarmTriggerSession.user_id == user.id,
        AlarmTriggerSession.dismissed == False,
    ).order_by(AlarmTriggerSession.started_at.desc()).first()
    if not session: raise HTTPException(404, "No active trigger session")
    q = db.query(ChallengeQuestion).filter(ChallengeQuestion.id == session.challenge_id).first()
    session.attempts += 1
    correct = body.user_answer.strip().lower() == q.correct_answer.strip().lower()
    db.add(ChallengeAttempt(user_id=user.id, challenge_id=q.id, challenge_type=q.type,
                            difficulty=q.difficulty, correct=correct, time_taken=body.time_taken))
    if correct:
        session.dismissed = True
        session.dismissed_at = datetime.utcnow()
        db.commit()
        return {"dismissed": True, "correct": True, "attempts": session.attempts}
    if session.attempts >= 3:
        db.commit()
        return {"dismissed": False, "correct": False, "attempts": session.attempts,
                "message": "Max attempts reached. Alarm will continue.",
                "can_snooze": True, "can_retry": True}
    db.commit()
    return {"dismissed": False, "correct": False, "attempts": session.attempts,
            "remaining": 3 - session.attempts}

@app.get("/")
def root():
    return {"name": "Cognitive Alarm API", "docs": "/docs"}
