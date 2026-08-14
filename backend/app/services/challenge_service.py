import os
import sys
import uuid
import random
import hmac
import hashlib
from datetime import datetime
from typing import Dict, Any, Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# Ensure ai_ml directory is in sys.path to access AI Challenge & Scoring Models
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
AI_ML_DIR = os.path.join(PROJECT_ROOT, "Cognitive-Alarm-System", "ai_ml")
AI_ML_SRC = os.path.join(AI_ML_DIR, "src")
AI_ML_PIPELINES = os.path.join(AI_ML_DIR, "pipelines")

for p in (AI_ML_DIR, AI_ML_SRC, AI_ML_PIPELINES):
    if os.path.exists(p) and p not in sys.path:
        sys.path.append(p)

# Try importing AI/ML models from Cognitive-Alarm-System engine
try:
    from reinforcement import get_difficulty_for_user, process_attempt, rating_to_difficulty, DEFAULT_USER_RATING
except ImportError:
    # Fallback default stubs if standalone
    DEFAULT_USER_RATING = 1000
    def rating_to_difficulty(rating: float) -> str:
        return "Medium"
    def process_attempt(user_rating: float, difficulty_level: str, is_correct: bool, completion_time_seconds: float) -> dict:
        return {"previous_rating": user_rating, "new_rating": user_rating + (10 if is_correct else -10), "next_difficulty": "Medium"}

from app.models.alarm_model import Alarm, AlarmHistory
from app.models.habit_model import ChallengeResult
from app.services.habit_service import HabitService
from app.schemas.alarm_schemas import CognitiveChallengeResponse, ChallengeVerifyRequest, ChallengeVerifyResponse, AvailableChallengeOption

SECRET_KEY = "icap_cognitive_engine_secret_key"

class ChallengeService:

    @staticmethod
    def _create_token(challenge_id: str, correct_answer: str, challenge_type: str, difficulty: str) -> str:
        """Create HMAC token to securely verify answer without client tampering"""
        raw_msg = f"{challenge_id}:{correct_answer.strip().lower()}:{challenge_type}:{difficulty}"
        signature = hmac.new(SECRET_KEY.encode(), raw_msg.encode(), hashlib.sha256).hexdigest()
        return f"{raw_msg}:{signature}"

    @staticmethod
    def _verify_token(token: str, user_answer: str) -> Tuple[bool, str, str, str]:
        """Verify user answer against signed HMAC token"""
        try:
            parts = token.split(":")
            if len(parts) != 5:
                return False, "", "", ""
            challenge_id, expected_ans, c_type, diff, signature = parts
            raw_msg = f"{challenge_id}:{expected_ans}:{c_type}:{diff}"
            expected_sig = hmac.new(SECRET_KEY.encode(), raw_msg.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected_sig, signature):
                return False, "", "", ""

            is_correct = user_answer.strip().lower() == expected_ans.strip().lower()
            return is_correct, challenge_id, c_type, diff
        except Exception:
            return False, "", "", ""

    @staticmethod
    def _generate_math_challenge(difficulty: str) -> Tuple[str, str, str, Optional[List[str]]]:
        diff_lower = difficulty.lower()
        if diff_lower in ["beginner", "easy"]:
            a = random.randint(10, 50)
            b = random.randint(5, 30)
            op = random.choice(["+", "-"])
            ans = a + b if op == "+" else a - b
            prompt = f"Solve: {a} {op} {b}"
            instructions = "Calculate the result to silence the alarm."
        elif diff_lower in ["hard", "expert"]:
            a = random.randint(12, 40)
            b = random.randint(6, 18)
            c = random.randint(5, 25)
            ans = a * b - c
            prompt = f"Solve: ({a} × {b}) - {c}"
            instructions = "Perform multi-step arithmetic quickly."
        else: # medium
            a = random.randint(15, 75)
            b = random.randint(15, 60)
            c = random.randint(2, 9)
            ans = (a + b) * c
            prompt = f"Solve: ({a} + {b}) × {c}"
            instructions = "Solve the equation."

        # Generate options for UI convenience
        correct_str = str(ans)
        options = [correct_str]
        while len(options) < 4:
            fake_ans = str(ans + random.choice([-10, -5, -2, -1, 1, 2, 5, 10, 12]))
            if fake_ans not in options:
                options.append(fake_ans)
        random.shuffle(options)

        return prompt, instructions, correct_str, options

    @staticmethod
    def _generate_memory_challenge(difficulty: str) -> Tuple[str, str, str, Optional[List[str]]]:
        diff_lower = difficulty.lower()
        length = 4 if diff_lower in ["beginner", "easy"] else (6 if diff_lower in ["hard", "expert"] else 5)
        sequence = "".join([str(random.randint(0, 9)) for _ in range(length)])
        prompt = f"Memorize this code: {'-'.join(list(sequence))}"
        instructions = f"Remember the {length}-digit sequence."
        return prompt, instructions, sequence, None

    @staticmethod
    def _generate_word_challenge(difficulty: str) -> Tuple[str, str, str, Optional[List[str]]]:
        word_bank = {
            "easy": ["BRAIN", "ALARM", "SLEEP", "SMART", "WAKEUP", "LIGHT"],
            "medium": ["COGNITIVE", "DISMISS", "SCHEDULE", "ROUTINE", "REINFORCE"],
            "hard": ["NEUROPLASTICITY", "CHALLENGE", "CONSISTENCY", "INTELLIGENCE"]
        }
        category = "easy" if difficulty.lower() in ["beginner", "easy"] else ("hard" if difficulty.lower() in ["hard", "expert"] else "medium")
        word = random.choice(word_bank[category])
        letters = list(word)
        random.shuffle(letters)
        scrambled = "-".join(letters)
        prompt = f"Unscramble: {scrambled}"
        instructions = "Re-arrange the letters to spell the original word."
        return prompt, instructions, word, None

    @staticmethod
    def _generate_pattern_challenge(difficulty: str) -> Tuple[str, str, str, Optional[List[str]]]:
        step = random.randint(3, 9)
        start = random.randint(2, 20)
        seq = [start + i * step for i in range(4)]
        ans = start + 4 * step
        prompt = f"Complete the pattern: {seq[0]}, {seq[1]}, {seq[2]}, {seq[3]}, ?"
        instructions = "Identify the logical sequence and enter the next number."
        correct_str = str(ans)
        options = [correct_str]
        while len(options) < 4:
            fake = str(ans + random.choice([-step, step, -2, 2, 5]))
            if fake not in options:
                options.append(fake)
        random.shuffle(options)
        return prompt, instructions, correct_str, options

    @staticmethod
    async def get_available_challenges_for_alarm(db: AsyncSession, user_id: str, alarm_id: str) -> List[AvailableChallengeOption]:
        """
        Generate available AI Cognitive Challenges for user selection.
        Returns cards for Math, Memory, Pattern Recognition, and Word/Logic Puzzle.
        """
        res = await db.execute(select(Alarm).where(Alarm.alarm_id == alarm_id, Alarm.user_id == user_id))
        alarm = res.scalars().first()
        difficulty = alarm.difficulty if alarm and alarm.difficulty else "medium"

        try:
            numeric_uid = abs(hash(user_id)) % 10000 + 1
            ai_diff_data = get_difficulty_for_user(numeric_uid)
            suggested_diff = ai_diff_data.get("next_difficulty", difficulty)
            if suggested_diff:
                difficulty = suggested_diff
        except Exception:
            pass

        challenge_types = [
            ("math", "Math Challenge", "30s", "Solve arithmetic equations to sharpen analytical focus.", ChallengeService._generate_math_challenge),
            ("memory", "Memory Challenge", "45s", "Recall numeric sequence patterns to stimulate short-term memory.", ChallengeService._generate_memory_challenge),
            ("pattern", "Pattern Recognition", "40s", "Complete logical sequences to boost cognitive reasoning.", ChallengeService._generate_pattern_challenge),
            ("word", "Logic & Word Puzzle", "50s", "Unscramble cognitive keywords to trigger linguistic awareness.", ChallengeService._generate_word_challenge),
        ]

        options_list = []
        for c_type, label, est_time, desc, gen_fn in challenge_types:
            c_id = str(uuid.uuid4())
            prompt, instructions, correct_ans, opts = gen_fn(difficulty)
            token = ChallengeService._create_token(c_id, correct_ans, c_type, difficulty)
            options_list.append(
                AvailableChallengeOption(
                    challenge_id=c_id,
                    alarm_id=alarm_id,
                    challenge_type=c_type,
                    difficulty=difficulty,
                    estimated_time=est_time,
                    description=desc,
                    prompt=prompt,
                    instructions=instructions,
                    options=opts,
                    timer_seconds=45,
                    verification_token=token
                )
            )

        return options_list

    @staticmethod
    async def get_challenge_for_alarm(db: AsyncSession, user_id: str, alarm_id: str) -> CognitiveChallengeResponse:
        """
        Request AI Cognitive Challenge for an alarm ringing event.
        Determines user's Elo rating, AI challenge type recommendation, and generates challenge.
        """
        res = await db.execute(select(Alarm).where(Alarm.alarm_id == alarm_id, Alarm.user_id == user_id))
        alarm = res.scalars().first()
        if not alarm:
            alarm_type = "math"
            difficulty = "medium"
        else:
            alarm_type = alarm.challenge_type or "math"
            difficulty = alarm.difficulty or "medium"

        try:
            numeric_uid = abs(hash(user_id)) % 10000 + 1
            ai_diff_data = get_difficulty_for_user(numeric_uid)
            suggested_diff = ai_diff_data.get("next_difficulty", difficulty)
            if suggested_diff:
                difficulty = suggested_diff
        except Exception:
            pass

        challenge_id = str(uuid.uuid4())
        c_type = alarm_type.lower()

        if c_type == "memory":
            prompt, instructions, correct_ans, options = ChallengeService._generate_memory_challenge(difficulty)
        elif c_type == "word" or c_type == "writing":
            prompt, instructions, correct_ans, options = ChallengeService._generate_word_challenge(difficulty)
        elif c_type == "pattern":
            prompt, instructions, correct_ans, options = ChallengeService._generate_pattern_challenge(difficulty)
        else:
            c_type = "math"
            prompt, instructions, correct_ans, options = ChallengeService._generate_math_challenge(difficulty)

        token = ChallengeService._create_token(challenge_id, correct_ans, c_type, difficulty)

        return CognitiveChallengeResponse(
            challenge_id=challenge_id,
            alarm_id=alarm_id,
            challenge_type=c_type,
            difficulty=difficulty,
            prompt=prompt,
            instructions=instructions,
            options=options,
            timer_seconds=45,
            verification_token=token
        )


    @staticmethod
    async def verify_challenge_solution(
        db: AsyncSession,
        user_id: str,
        alarm_id: str,
        req: ChallengeVerifyRequest
    ) -> ChallengeVerifyResponse:
        """
        Validate submitted challenge solution, update Honor Score, replay Elo rating, and log dismissal.
        """
        is_correct, challenge_id, c_type, difficulty = ChallengeService._verify_token(req.verification_token, req.user_answer)

        # Elo rating update simulation
        numeric_uid = abs(hash(user_id)) % 10000 + 1
        elo_update = process_attempt(
            user_rating=DEFAULT_USER_RATING,
            difficulty_level=difficulty or "Medium",
            is_correct=is_correct,
            completion_time_seconds=req.time_taken_seconds
        )
        next_diff = elo_update.get("next_difficulty", difficulty or "Medium")

        earned_score = 0.0
        total_honor_score = 0.0

        if is_correct:
            # 1. Calculate earned Honor Score
            earned_score = HabitService.calculate_habit_score(
                difficulty=difficulty,
                time_taken_seconds=req.time_taken_seconds,
                is_correct=True,
                attempts=req.attempts
            )

            # 2. Record Challenge Result in DB
            c_result = ChallengeResult(
                user_id=user_id,
                challenge_id=req.challenge_id,
                challenge_type=c_type or "math",
                difficulty=difficulty or "medium",
                time_taken_seconds=req.time_taken_seconds,
                is_correct=True,
                attempts=req.attempts,
                habit_score=earned_score,
                completed_at=datetime.utcnow()
            )
            db.add(c_result)

            # 3. Log Alarm History Dismissal in DB
            res = await db.execute(select(Alarm).where(Alarm.alarm_id == alarm_id, Alarm.user_id == user_id))
            alarm = res.scalars().first()
            now_str = datetime.utcnow().strftime("%H:%M")
            if alarm:
                history_entry = AlarmHistory(
                    alarm_id=alarm_id,
                    wake_time=now_str,
                    solved=True,
                    solve_time=int(req.time_taken_seconds),
                    dismissed_at=datetime.utcnow()
                )
                db.add(history_entry)

            await db.commit()

            # 4. Fetch updated total Honor Score
            total_honor_score = await HabitService.get_latest_habit_score(db, user_id)
            message = "Challenge completed successfully! Alarm silenced."
        else:
            message = "Incorrect answer. Solve the cognitive challenge to silence the alarm!"
            total_honor_score = await HabitService.get_latest_habit_score(db, user_id)

        return ChallengeVerifyResponse(
            is_correct=is_correct,
            message=message,
            attempts=req.attempts,
            time_taken_seconds=req.time_taken_seconds,
            earned_score=earned_score,
            total_honor_score=total_honor_score,
            next_difficulty=next_diff,
            challenge_id=req.challenge_id,
            completed_at=datetime.utcnow()
        )
