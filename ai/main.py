from challenge_engine import ChallengeEngine


def get_challenge_type():
    """Get a valid challenge type from the user."""

    while True:
        print("\nChoose Challenge Type")
        print("1. Math")
        print("2. Memory")
        print("3. Logic")

        choice = input("\nEnter choice (1-3): ").strip()

        if choice == "1":
            return "math"

        elif choice == "2":
            return "memory"

        elif choice == "3":
            return "logic"

        else:
            print("❌ Invalid choice! Please enter 1, 2, or 3.")


def get_difficulty():
    """Get a valid difficulty level from the user."""

    while True:
        difficulty = input(
            "\nChoose Difficulty (Easy / Medium / Hard): "
        ).strip().lower()

        if difficulty in ["easy", "medium", "hard"]:
            return difficulty

        print("❌ Invalid difficulty! Please enter Easy, Medium, or Hard.")


def check_answer(user_answer, correct_answer):
    """Compare the user's answer with the correct answer."""

    return str(user_answer).strip().lower() == str(correct_answer).strip().lower()


def main():

    engine = ChallengeEngine()

    print("=" * 50)
    print("🧠 Intelligent Cognitive Alarm Platform")
    print("=" * 50)

    challenge_type = get_challenge_type()
    difficulty = get_difficulty()

    challenge = engine.generate_challenge(
        challenge_type,
        difficulty
    )

    print("\nChallenge")
    print("-" * 30)
    print("Type:", challenge["type"])
    print("Difficulty:", challenge["difficulty"])
    print("Question:", challenge["question"])

    answer = input("\nYour Answer: ")

    if check_answer(answer, challenge["answer"]):

        print("\n✅ Correct!")
        print("Alarm Stopped.")

    else:

        print("\n❌ Wrong Answer!")
        print("Alarm Continues.")
        print("Correct Answer:", challenge["answer"])


if __name__ == "__main__":
    main()