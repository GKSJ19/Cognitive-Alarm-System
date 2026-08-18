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
from app.utils.password import hash_password

async def fix():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        default_hash = hash_password("Password123!")
        
        for u in users:
            if not u.hashed_password:
                u.hashed_password = default_hash
                u.is_verified = True
                u.is_active = True
                print(f"[OK] Set password for user {u.email}")
            else:
                # Also reset password hash to Password123! so all accounts are easily testable
                u.hashed_password = default_hash
                u.is_verified = True
                u.is_active = True
                print(f"[OK] Reset password for user {u.email}")
        
        await db.commit()
        print("All users updated successfully with password 'Password123!'")

if __name__ == "__main__":
    asyncio.run(fix())
