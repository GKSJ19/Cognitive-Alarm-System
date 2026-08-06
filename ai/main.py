from challenge_engine import (
    CognitiveChallengeEngine,
    Category,
    Difficulty
)

from wake_up_verification import WakeUpVerification

from habit_score import HabitScore
from behavior_analysis import BehaviorAnalysis
from recommendation_engine import RecommendationEngine
import time

# --------------------------------------------------
# Initialize
# --------------------------------------------------

engine = CognitiveChallengeEngine()
verification = WakeUpVerification(required_correct=2)

print("=" * 60)
print("🧠 Intelligent Cognitive Alarm Platform")
print("=" * 60)

habit = HabitScore()
analysis = BehaviorAnalysis()
recommendation = RecommendationEngine()

# --------------------------------------------------
# Select Challenge Category
# --------------------------------------------------


while True:

    print("\nChoose Challenge Category")
    print("1. Math")
    print("2. Logic")
    print("3. Memory")
    print("4. Word Games")
    print("5. Pattern Recognition")
    print("6. Riddles")
    print("7. Quick Quiz")

    choice = input("\nEnter choice (1-7): ")

    category_map = {
        "1": Category.MATH,
        "2": Category.LOGIC,
        "3": Category.MEMORY,
        "4": Category.WORD_GAMES,
        "5": Category.PATTERN_RECOGNITION,
        "6": Category.RIDDLES,
        "7": Category.QUICK_QUIZ
    }

    if choice in category_map:
        category = category_map[choice]
        break

    print("❌ Invalid choice!")

# --------------------------------------------------
# Select Difficulty
# --------------------------------------------------

while True:

    difficulty_input = input(
        "\nChoose Difficulty (easy / medium / hard): "
    ).lower()

    difficulty_map = {
        "easy": Difficulty.EASY,
        "medium": Difficulty.MEDIUM,
        "hard": Difficulty.HARD
    }

    if difficulty_input in difficulty_map:
        difficulty = difficulty_map[difficulty_input]
        break

    print("❌ Invalid difficulty!")

# --------------------------------------------------
# Wake-up Verification Loop
# --------------------------------------------------

while True:

    challenge = engine.generate(
        category=category,
        difficulty=difficulty
    )

    print("\n" + "=" * 50)
    print("Challenge")
    print("=" * 50)

    start_time = time.time()

    print("Category   :", challenge.category)
    print("Difficulty :", challenge.difficulty)
    print("Question   :", challenge.question)

    if challenge.options:
        print("\nOptions:")
        for i, option in enumerate(challenge.options, start=1):
            print(f"{i}. {option}")

    answer = input("\nYour Answer: ")

    end_time = time.time()

    response_time = round(
        end_time - start_time,
        2
    )

    result = engine.validate(
        challenge,
        answer
    )

    engine.difficulty_manager.record(result)

    analysis.record_attempt(
        is_correct=result.is_correct,
        response_time=response_time,
        xp=result.xp_earned
    )

    verification.update(result.is_correct)

    habit_score = habit.calculate_score(
        is_correct=result.is_correct,
        wakeup_verified=verification.is_verified(),
        response_time=response_time,
        streak=verification.correct_streak
    )

    print("\n" + "-" * 50)

    if result.is_correct:

        print("✅ Correct Answer!")
        print(f"Score : {result.score}")
        print(f"XP Earned : {result.xp_earned}")

        print(f"Habit Score : {habit_score}")
        print(f"Habit Level : {habit.get_level()}")

    else:

        print("❌ Wrong Answer!")
        print("Correct Answer :", challenge.correct_answer)

    print(
        f"\nWake-up Progress : "
        f"{verification.correct_streak}/{verification.required_correct}"
    )

    if verification.is_verified():

        print("\n🎉 Wake-up Verification Successful!")
        print("🔕 Alarm Stopped!")

        print("\nHabit Score :", habit_score)
        print("Habit Level :", habit.get_level())

        recommended = engine.difficulty_manager.recommend(
            category=challenge.category
        )

        print("\nRecommended Next Difficulty :", recommended.value)

        print("\nTotal XP :", engine.difficulty_manager.total_xp)
        print(
            "Success Rate :",
            f"{engine.difficulty_manager.success_rate:.1f}%"
        )

        report = analysis.analyze_user()

        print("\nBehavior Analysis")
        print("-" * 40)

        for key, value in report.items():
            print(f"{key}: {value}")

        recommendations = recommendation.generate_recommendation(
            habit_score,
            report["Success Rate (%)"],
            report["Average Response Time (sec)"]
        )

        print("\nRecommendations")
        print("-" * 40)

        for item in recommendations:
            print("•", item)    

        break

    else:

        print("\n➡ Solve one more challenge to stop the alarm.")