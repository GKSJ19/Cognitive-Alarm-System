from fastapi import FastAPI
from app.database import Base, engine
from app.routes import auth_routes

# Creates all tables defined in models.py if they don't already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cognitive Alarm System - Auth Service",
    description="Milestone 1: user registration and login with JWT.",
    version="0.1.0",
)

app.include_router(auth_routes.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "auth", "milestone": 1}
