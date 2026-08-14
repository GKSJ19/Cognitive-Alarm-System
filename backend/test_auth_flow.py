import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine, Base, AsyncSessionLocal
from app.models.user_model import User
from app.models.profile_model import UserProfile
from app.models.alarm_model import Alarm, AlarmHistory
from app.models.habit_model import Habit, HabitProgress, ChallengeResult
from app.models.coach_model import CoachAssignment
from app.services.auth_service import AuthService
from app.schemas.auth_schemas import RegisterRequest, LoginRequest, SocialLoginRequest

async def test_auth():
    print("=== Testing Authentication Engine & Login System ===")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        test_email = f"authtest_{uuid.uuid4().hex[:6]}@example.com"
        test_pass = "Password123!"

        # 1. Register User
        reg_req = RegisterRequest(
            email=test_email,
            full_name="Auth Test User",
            password=test_pass,
            confirm_password=test_pass,
            role="user"
        )
        reg_res = await AuthService.register_user(db, reg_req)
        print(f"[OK] Registration: {reg_res['message']}")

        # 2. Login User
        login_req = LoginRequest(email=test_email, password=test_pass)
        login_res = await AuthService.login_user(db, login_req)
        print(f"[OK] Login Success for {test_email}:")
        print(f"    - Access Token: {login_res['access_token'][:30]}...")
        print(f"    - User Role: {login_res['user'].role}")

        # 3. Test Refresh Token
        refresh_res = await AuthService.refresh_tokens(db, login_res['refresh_token'])
        print(f"[OK] Token Refresh Success:")
        print(f"    - New Access Token: {refresh_res['access_token'][:30]}...")

        # 4. Social Login (Google / Apple)
        social_req = SocialLoginRequest(
            provider="google",
            identity_token="mock_token_123",
            email=f"google_{uuid.uuid4().hex[:6]}@example.com",
            full_name="Google Test User"
        )
        social_res = await AuthService.social_login_user(db, social_req)
        print(f"[OK] Social Login Success for {social_res['user'].email}")

        # 5. Verify existing seed users can log in
        seed_login_req = LoginRequest(email="test123@gmail.com", password="Password123!")
        seed_res = await AuthService.login_user(db, seed_login_req)
        print(f"[OK] Seed User Login Success (test123@gmail.com): Role={seed_res['user'].role}")

        print("=== All Auth System Tests Passed Successfully! ===")

if __name__ == "__main__":
    asyncio.run(test_auth())
