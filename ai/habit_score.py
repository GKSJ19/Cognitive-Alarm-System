class HabitScore:
    """
    Calculates a user's habit score based on
    challenge performance and wake-up behavior.
    """

    def __init__(self):
        self.score = 0

    def calculate_score(
        self,
        is_correct,
        wakeup_verified,
        response_time,
        streak
    ):
        score = 0

        # 40 Marks - Correct Answer
        if is_correct:
            score += 40

        # 30 Marks - Wake-up Verification
        if wakeup_verified:
            score += 30

        # 20 Marks - Response Time
        if response_time <= 5:
            score += 20
        elif response_time <= 10:
            score += 15
        elif response_time <= 20:
            score += 10
        else:
            score += 5

        # 10 Marks - Consecutive Success Streak
        if streak >= 5:
            score += 10
        elif streak >= 3:
            score += 7
        elif streak >= 1:
            score += 5

        self.score = score
        return score

    def get_level(self):
        """
        Returns the user's habit level.
        """

        if self.score >= 90:
            return "Excellent"

        elif self.score >= 75:
            return "Good"

        elif self.score >= 60:
            return "Average"

        return "Needs Improvement"