import asyncio
import os
import sys
import uuid
from sqlalchemy.future import select

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine, Base, AsyncSessionLocal
from app.models.user_model import User
from app.models.profile_model import UserProfile
from app.models.alarm_model import Alarm, AlarmHistory
from app.models.habit_model import Habit, HabitProgress, ChallengeResult
from app.models.coach_model import CoachAssignment
from app.services.challenge_service import ChallengeService
from app.services.habit_service import HabitService
from app.schemas.alarm_schemas import ChallengeVerifyRequest

async def run_integration_test():
    print("=== Testing Cognitive Challenge Engine Integration ===")

    # Initialize tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Cleanup existing test user if present
        existing_res = await db.execute(select(User).where(User.email.like("cognitive_test%")))
        for old_u in existing_res.scalars().all():
            await db.delete(old_u)
        await db.commit()

        # Create test user
        test_email = f"cognitive_test_{uuid.uuid4().hex[:6]}@example.com"
        test_user = User(
            email=test_email,
            full_name="Cognitive Test User",
            hashed_password="hashed_test_pass",
            role="user"
        )
        db.add(test_user)
        await db.commit()
        await db.refresh(test_user)
        print(f"[OK] Created Test User: {test_user.id} ({test_user.full_name})")

        # Create test alarm
        test_alarm = Alarm(
            user_id=test_user.id,
            title="Morning Cognitive Alarm",
            alarm_time="07:30",
            challenge_required=True,
            challenge_type="math",
            difficulty="medium"
        )
        db.add(test_alarm)
        await db.commit()
        await db.refresh(test_alarm)
        print(f"[OK] Created Test Alarm: {test_alarm.alarm_id} ({test_alarm.title})")

        # 1. Request AI Challenge from Engine
        challenge = await ChallengeService.get_challenge_for_alarm(db, test_user.id, test_alarm.alarm_id)
        print(f"[OK] Generated AI Cognitive Challenge:")
        print(f"    - Type: {challenge.challenge_type.upper()}")
        print(f"    - Difficulty: {challenge.difficulty}")
        print(f"    - Prompt: {challenge.prompt}")
        print(f"    - Token Length: {len(challenge.verification_token)}")

        # Decode correct answer from token for automated verification test
        token_parts = challenge.verification_token.split(":")
        correct_ans = token_parts[1]
        print(f"    - Expected Answer: {correct_ans}")

        # 2. Test Incorrect Solution Submission
        wrong_req = ChallengeVerifyRequest(
            challenge_id=challenge.challenge_id,
            user_answer="wrong_ans_999",
            time_taken_seconds=12.0,
            attempts=1,
            verification_token=challenge.verification_token
        )
        wrong_res = await ChallengeService.verify_challenge_solution(db, test_user.id, test_alarm.alarm_id, wrong_req)
        print(f"[OK] Verified Incorrect Answer Response: is_correct={wrong_res.is_correct}, message='{wrong_res.message}'")
        assert wrong_res.is_correct == False, "Wrong answer should fail verification"

        # 3. Test Correct Solution Submission & Honor Score Calculation
        correct_req = ChallengeVerifyRequest(
            challenge_id=challenge.challenge_id,
            user_answer=correct_ans,
            time_taken_seconds=8.5,
            attempts=2,
            verification_token=challenge.verification_token
        )
        correct_res = await ChallengeService.verify_challenge_solution(db, test_user.id, test_alarm.alarm_id, correct_req)
        print(f"[OK] Verified Correct Answer Response:")
        print(f"    - is_correct: {correct_res.is_correct}")
        print(f"    - Earned Score: +{correct_res.earned_score}")
        print(f"    - Total Honor Score: {correct_res.total_honor_score}")
        print(f"    - Next Difficulty (Elo): {correct_res.next_difficulty}")
        assert correct_res.is_correct == True, "Correct answer should pass verification"
        assert correct_res.earned_score > 0, "Earned score should be > 0"

        # 4. Verify Challenge History Logging
        history = await HabitService.get_challenge_history(db, test_user.id)
        print(f"[OK] Challenge History Records: {len(history)} entry logged")
        assert len(history) >= 1, "Challenge history should contain recorded attempt"

        # Cleanup test user & alarm
        await db.delete(test_alarm)
        await db.delete(test_user)
        await db.commit()
        print("=== All Integration Tests Passed Successfully! ===")

if __name__ == "__main__":
    asyncio.run(run_integration_test())
