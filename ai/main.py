from challenge_engine import ChallengeEngine

engine = ChallengeEngine()

print("=" * 50)
print("🧠 Intelligent Cognitive Alarm Platform")
print("=" * 50)

# -------------------------
# Challenge Type
# -------------------------

while True:

    print("\nChoose Challenge Type")
    print("1. Math")
    print("2. Memory")
    print("3. Logic")

    choice = input("\nEnter choice (1-3): ")

    if choice == "1":
        challenge_type = "math"
        break

    elif choice == "2":
        challenge_type = "memory"
        break

    elif choice == "3":
        challenge_type = "logic"
        break

    else:
        print("❌ Invalid choice!")

# -------------------------
# Difficulty
# -------------------------
while True:

    print("\nChoose Challenge Type")
    print("1. Math")
    print("2. Memory")
    print("3. Logic")

    choice = input("Enter choice (1-3): ")

    if choice == "1":
        challenge_type = "math"
        break

    elif choice == "2":
        challenge_type = "memory"
        break

    elif choice == "3":
        challenge_type = "logic"
        break

    else:
        print("Invalid choice!")

# -------------------------
# Difficulty
# -------------------------
while True:

    print("\nChoose Difficulty (Easy / Medium / Hard): ")
    difficulty = input("Enter difficulty: ")

    if difficulty.lower() in ["easy", "medium", "hard"]:
        break

    print("❌ Invalid difficulty!")

# -------------------------
# Generate Challenge
# -------------------------

challenge = engine.generate_challenge(
    challenge_type,
    difficulty
)

print("\nChallenge")
print("----------------------")
print("Type:", challenge["type"])
print("Difficulty:", challenge["difficulty"])
print("Question:", challenge["question"])

answer = input("\nYour Answer: ")

if str(answer).strip().lower() == str(challenge["answer"]).strip().lower():

    print("\n✅ Correct!")
    print("Alarm Stopped.")

else:

    print("\n❌ Wrong Answer!")
    print("Alarm Continues.")
    print("Correct Answer:", challenge["answer"])