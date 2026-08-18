from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.MONGODB_DB_NAME]
    
    # Milestone 4 Performance Optimization: Add indexing for alarm scheduling and challenge queries
    await db.db["alarms"].create_index([("user_id", 1)])
    await db.db["alarms"].create_index([("is_active", 1), ("time", 1)])
    await db.db["challenges"].create_index([("user_id", 1)])
    await db.db["challenges"].create_index([("created_at", -1)])
    
    print(f"Connected to MongoDB database {settings.MONGODB_DB_NAME} and initialized indexes")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("MongoDB connection closed")

def get_db():
    return db.db
