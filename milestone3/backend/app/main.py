from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    from app.core.database import db
    if db.db is not None:
        roles_count = await db.db["roles"].count_documents({})
        if roles_count == 0:
            await db.db["roles"].insert_many([
                {"name": "user", "description": "Standard user"},
                {"name": "wellness_coach", "description": "Wellness coach"},
                {"name": "admin", "description": "Administrator"}
            ])

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to AI Intelligent Cognitive Alarm Platform API"}
