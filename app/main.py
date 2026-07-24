from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.database import Base, engine
from app.routes import auth_routes, user_routes, admin_routes
from app.limiter import limiter

# Creates all tables defined in models.py if they don't already exist.
# NOTE: this does NOT alter existing tables -- if you already have a
# `users` table from Milestone 1, see the migration SQL in README.md.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cognitive Alarm System - Auth Service",
    description="Milestone 2: profile expansion, access hardening, and admin APIs.",
    version="0.3.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "auth", "milestone": 2}
