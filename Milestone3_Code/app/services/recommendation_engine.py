

class RecommendationEngine:
    """
    Generates personalized recommendations based on the user's analytics.
    """
    @staticmethod
    def generate(user_data: dict, analytics: dict, habit_score: float) -> list[str]:
        recommendations = []
        
        if analytics["is_sleep_deprived"]:
            recommendations.append("Increase sleep duration to at least 7-8 hours.")
            recommendations.append("Sleep earlier to improve morning alertness.")
            
        if analytics["high_snooze_dependency"]:
            recommendations.append("Reduce snooze usage to avoid sleep fragmentation.")
            
        if user_data["accuracy_percent"] < 70:
            recommendations.append("Improve challenge accuracy by practicing more memory puzzles.")
            
        if habit_score < 75:
            recommendations.append("Maintain consistency with your wake-up time to boost your habit score.")
            
        if not recommendations:
            recommendations.append("Great job! Maintain your current excellent habits.")
            
        return recommendations
