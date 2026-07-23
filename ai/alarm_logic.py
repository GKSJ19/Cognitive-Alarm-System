from challenge_engine import (
    CognitiveChallengeEngine,
    Category,
    Difficulty
)


class AlarmLogic:
    """
    Handles the AI workflow when an alarm is triggered.
    """

    def __init__(self):
        self.engine = CognitiveChallengeEngine()

    def trigger_alarm(
        self,
        category=Category.MATH,
        difficulty=Difficulty.EASY
    ):

        print("\n🔔 Alarm Triggered!")

        challenge = self.engine.generate(
            category=category,
            difficulty=difficulty
        )

        return challenge

    def validate_answer(self, challenge, user_answer):

        result = self.engine.validate(
            challenge,
            user_answer
        )

        return result