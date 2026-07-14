from challenge_engine import ChallengeEngine


class AlarmLogic:
    """
    Controls the AI workflow after an alarm is triggered.
    """

    def __init__(self):
        self.challenge_engine = ChallengeEngine()

    def trigger_alarm(self):
        print("🔔 Alarm Triggered!")

        challenge = self.challenge_engine.generate_math_problem()

        print("Challenge:")
        print(challenge)

        return challenge

    def validate_answer(self, user_answer, correct_answer):
        if str(user_answer) == str(correct_answer):
            print("✅ Correct Answer")
            return True

        print("❌ Wrong Answer")
        return False