from challenge_engine import (
    CognitiveChallengeEngine,
    Category,
    Difficulty
)

from wake_up_verification import WakeUpVerification

# --------------------------------------------------
# Initialize
# --------------------------------------------------

engine = CognitiveChallengeEngine()
verification = WakeUpVerification(required_correct=2)

print("=" * 60)
print("🧠 Intelligent Cognitive Alarm Platform")
print("=" * 60)

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

    print("Category   :", challenge.category)
    print("Difficulty :", challenge.difficulty)
    print("Question   :", challenge.question)

    if challenge.options:
        print("\nOptions:")
        for i, option in enumerate(challenge.options, start=1):
            print(f"{i}. {option}")

    answer = input("\nYour Answer: ")

    result = engine.validate(
        challenge,
        answer
    )

    engine.difficulty_manager.record(result)

    verification.update(result.is_correct)

    print("\n" + "-" * 50)

    if result.is_correct:

        print("✅ Correct Answer!")
        print(f"Score : {result.score}")
        print(f"XP Earned : {result.xp_earned}")

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

        recommended = engine.difficulty_manager.recommend(
            category=challenge.category
        )

        print("\nRecommended Next Difficulty :", recommended.value)

        print("\nTotal XP :", engine.difficulty_manager.total_xp)
        print(
            "Success Rate :",
            f"{engine.difficulty_manager.success_rate:.1f}%"
        )

        break

    else:

        print("\n➡ Solve one more challenge to stop the alarm.")