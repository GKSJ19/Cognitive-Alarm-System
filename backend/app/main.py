from fastapi import FastAPI

from app.database import Base
from app.database import engine

from app.models.user_profile import UserProfile
from app.models.verification import Verification
from app.routers import user_profile
from app.routers import verification
from app.routers import evaluation
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Cognitive Alarm Platform",
    version="1.0.0"
)

app.include_router(user_profile.router)
app.include_router(verification.router)


app.include_router(evaluation.router)
@app.get("/")
def home():

    return {
        "message":"Intelligent Cognitive Alarm Platform API Running Successfully"
    }