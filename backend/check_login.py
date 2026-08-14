import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import AsyncSessionLocal
from app.models.user_model import User
from app.models.profile_model import UserProfile
from app.models.alarm_model import Alarm, AlarmHistory
from app.models.habit_model import Habit, HabitProgress, ChallengeResult
from app.models.coach_model import CoachAssignment
from sqlalchemy.future import select
from app.utils.password import verify_password

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print(f"Total Users in database: {len(users)}")
        for u in users:
            print(f"- ID: {u.id} | Email: {u.email} | Role: {u.role} | Verified: {u.is_verified} | Active: {u.is_active} | Password Hash Present: {bool(u.hashed_password)}")

if __name__ == "__main__":
    asyncio.run(check())
