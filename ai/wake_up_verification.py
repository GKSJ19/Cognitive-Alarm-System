class WakeUpVerification:
    """
    Verifies that the user is awake by requiring
    multiple consecutive correct answers.
    """

    def __init__(self, required_correct=2):
        self.required_correct = required_correct
        self.correct_streak = 0

    def update(self, is_correct):
        if is_correct:
            self.correct_streak += 1
        else:
            self.correct_streak = 0

    def is_verified(self):
        return self.correct_streak >= self.required_correct

    def reset(self):
        self.correct_streak = 0

    def status(self):
        return {
            "correct_streak": self.correct_streak,
            "required": self.required_correct
        }