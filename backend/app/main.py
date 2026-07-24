import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time, logging

app = FastAPI(title="ICAP Backend")

_allowed_origins = [
    o.strip() for o in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"error": "Too many requests"})

app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)
app.add_middleware(SlowAPIMiddleware)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("icap")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response

# --- Import routers (needed for include_router calls below) ---
from app.routers import (
    users, alarms, challenges, difficulty, verification,
    behavior, habit, recommendation, notification, analytics, report, admin
)

# --- Import models and create tables that don't exist yet ---
from app.core.database import Base, engine
from app.models import (
    user, password_reset_token, alarm, alarm_trigger, challenge,
    challenge_attempt, notification as notification_model, sleep_log, habit_score,
    recommendation as recommendation_model, goal_metric, report as report_model,
    audit_log, coach_assignment, platform_setting,
)

Base.metadata.create_all(bind=engine)

# --- Register routers ---
app.include_router(users.router, prefix="/users", tags=["User"])
app.include_router(alarms.router, prefix="/alarms", tags=["Alarm"])
app.include_router(challenges.router, prefix="/challenges", tags=["Challenge"])
app.include_router(difficulty.router, prefix="/difficulty", tags=["Adaptive Difficulty"])
app.include_router(verification.router, prefix="/verify", tags=["Verification"])
app.include_router(behavior.router, prefix="/behavior", tags=["Behavior Analytics"])
app.include_router(habit.router, prefix="/habit", tags=["Habit Scoring"])
app.include_router(recommendation.router, prefix="/recommend", tags=["Recommendation"])
app.include_router(notification.router, prefix="/notify", tags=["Notification"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(report.router, prefix="/reports", tags=["Report"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"message": "ICAP Gateway is running"}