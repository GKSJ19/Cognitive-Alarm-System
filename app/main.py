from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.database import Base, engine
from app.routes import auth_routes, user_routes, admin_routes
from app.limiter import limiter
from app.firebase import init_firebase

# Creates all tables defined in models.py if they don't already exist.
# NOTE: this does NOT alter existing tables -- if you already have a
# `users` table from Milestone 1, see the migration SQL in README.md.
Base.metadata.create_all(bind=engine)

# No-ops automatically if FIREBASE_CREDENTIALS_PATH isn't set in .env
init_firebase()

app = FastAPI(
    title="Cognitive Alarm System - Auth Service",
    description="Milestones 1-4: authentication, profile management, security hardening, and deployment.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "cognitive-alarm-auth"}


@app.get("/health")
def health_check():
    """Used by deployment platforms (Railway, Docker, etc.) for uptime checks."""
    return {"status": "healthy"}
