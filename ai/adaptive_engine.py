"""
Adaptive Difficulty Engine

Adjusts challenge difficulty according to
user performance and wake-up consistency.
"""

class AdaptiveEngine:

    def calculate_difficulty(self, score):

        if score >= 90:
            return "Expert"

        elif score >= 75:
            return "Hard"

        elif score >= 50:
            return "Medium"

        return "Easy"