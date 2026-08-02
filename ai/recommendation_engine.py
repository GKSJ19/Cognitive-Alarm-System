"""
Recommendation Engine

Provides personalized recommendations
based on user behaviour.
"""

class RecommendationEngine:

    def generate_recommendation(
        self,
        habit_score,
        success_rate,
        average_response_time
    ):
        """
        Generates personalized recommendations
        based on the user's performance.
        """

        recommendations = []

        # Habit Score
        if habit_score >= 90:
            recommendations.append(
                "Excellent! You have a very healthy wake-up routine."
            )

        elif habit_score >= 75:
            recommendations.append(
                "Good job! Stay consistent to improve further."
            )

        elif habit_score >= 60:
            recommendations.append(
                "Your performance is average. Try reducing snooze time."
            )

        else:
            recommendations.append(
                "Your wake-up habit needs improvement. Try sleeping earlier."
            )

        # Success Rate
        if success_rate < 60:
            recommendations.append(
                "Practice more cognitive challenges to improve accuracy."
            )

        elif success_rate >= 90:
            recommendations.append(
                "Excellent accuracy! Keep challenging yourself."
            )

        # Response Time
        if average_response_time > 15:
            recommendations.append(
                "Try answering more quickly to improve alertness."
            )

        elif average_response_time <= 5:
            recommendations.append(
                "Great response speed! You are highly alert."
            )

        return recommendations