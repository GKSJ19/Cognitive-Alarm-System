from challenge_engine import ChallengeEngine


class CognitiveAlarmAI:
    """
    Main AI workflow for the Cognitive Alarm Platform.
    """

    def __init__(self):
        self.challenge_engine = ChallengeEngine()

    def start_alarm(self):
        print("=" * 50)
        print("🧠 Intelligent Cognitive Alarm Platform")
        print("=" * 50)

        challenge = self.challenge_engine.generate_math_problem()

        print("\nAlarm Triggered!")
        print("Solve the following challenge to dismiss the alarm.\n")

        print(challenge["question"])

        answer = int(input("\nYour Answer: "))

        if answer == challenge["answer"]:
            print("\n✅ Alarm Dismissed!")
            print("Good Morning 🌞")

        else:
            print("\n❌ Incorrect Answer!")
            print("Alarm Continues Ringing 🔔")


if __name__ == "__main__":
    app = CognitiveAlarmAI()
    app.start_alarm()