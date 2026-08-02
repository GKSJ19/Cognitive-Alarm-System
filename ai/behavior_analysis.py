"""
Behavior Analysis

Tracks and analyzes user behaviour.
"""

class BehaviorAnalysis:

    def __init__(self):
        self.total_challenges = 0
        self.correct_answers = 0
        self.wrong_answers = 0
        self.total_response_time = 0.0
        self.total_xp = 0

    def record_attempt(self, is_correct, response_time, xp):
        """
        Records the result of one challenge.
        """

        self.total_challenges += 1

        if is_correct:
            self.correct_answers += 1
        else:
            self.wrong_answers += 1

        self.total_response_time += response_time
        self.total_xp += xp

    def success_rate(self):
        """
        Returns the percentage of correct answers.
        """

        if self.total_challenges == 0:
            return 0

        return round(
            (self.correct_answers / self.total_challenges) * 100,
            2
        )

    def average_response_time(self):
        """
        Returns the average response time.
        """

        if self.total_challenges == 0:
            return 0

        return round(
            self.total_response_time / self.total_challenges,
            2
        )

    def analyze_user(self):
        """
        Returns the user's behaviour statistics.
        """

        return {
            "Total Challenges": self.total_challenges,
            "Correct Answers": self.correct_answers,
            "Wrong Answers": self.wrong_answers,
            "Success Rate (%)": self.success_rate(),
            "Average Response Time (sec)": self.average_response_time(),
            "Total XP": self.total_xp
        }