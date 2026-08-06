from ai_service import AIService

service = AIService()

print("=" * 60)
print("AI SERVICE TEST")
print("=" * 60)

# ------------------------------------
# Generate Challenge
# ------------------------------------

challenge = service.generate_challenge(
    category="math",
    difficulty="easy"
)

print("\nChallenge Generated")
print("-" * 30)
print("Category   :", challenge.category)
print("Difficulty :", challenge.difficulty)
print("Question   :", challenge.question)

if challenge.options:
    print("Options:")
    for option in challenge.options:
        print("-", option)

# ------------------------------------
# User Answer
# ------------------------------------

answer = input("\nEnter your answer: ")

result = service.validate_answer(
    challenge,
    answer
)

print("\nValidation")
print("-" * 30)

if result.is_correct:
    print("✅ Correct")
else:
    print("❌ Wrong")
    print("Correct Answer:", challenge.correct_answer)

# ------------------------------------
# Wake-up Verification
# ------------------------------------

verified = service.verify(result.is_correct)

print("\nWake-up Verified:", verified)

# ------------------------------------
# Record Behaviour
# ------------------------------------

service.record_behavior(
    is_correct=result.is_correct,
    response_time=5,
    xp=result.xp_earned
)

# ------------------------------------
# Habit Score
# ------------------------------------

habit_score = service.calculate_habit_score(
    is_correct=result.is_correct,
    response_time=5
)

print("\nHabit Score:", habit_score)

# ------------------------------------
# Behaviour Report
# ------------------------------------

report = service.behavior_report()

print("\nBehaviour Report")
print("-" * 30)

for key, value in report.items():
    print(f"{key}: {value}")

# ------------------------------------
# Recommendation
# ------------------------------------

recommendations = service.get_recommendations(
    habit_score
)

print("\nRecommendations")
print("-" * 30)

for recommendation in recommendations:
    print("•", recommendation)