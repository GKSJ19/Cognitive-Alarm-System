

from sklearn.preprocessing import MinMaxScaler


class HabitScoringEngine:
    """
    Calculates habit score based on weighted metrics:
    - 35% Wake-up Consistency
    - 25% Challenge Completion
    - 20% Snooze Reduction
    - 20% Sleep Schedule Adherence
    """
    @staticmethod
    def calculate_score(user_data: dict) -> tuple[float, str]:
        # Using MinMaxScaler to normalize values (simulated application of sklearn)
        scaler = MinMaxScaler(feature_range=(0, 100))
        
        # 1. Snooze Reduction (0 snoozes = 100%, 5+ snoozes = 0%)
        snooze_raw = min(5, user_data['snooze_count'])
        # Scale 0-5 to 0-100
        scaled_snoozes = scaler.fit_transform([[0], [snooze_raw], [5]])
        snooze_score = 100.0 - float(scaled_snoozes[1][0])
        
        # 2. Sleep Schedule Adherence (8 hours = 100%)
        sleep_score = min(100.0, (user_data['sleep_duration_hours'] / 8.0) * 100)
        
        # 3. Challenge Completion (Accuracy % represents this)
        challenge_score = user_data['accuracy_percent']
        
        # 4. Wake-up Consistency (Simulated baseline of 80% for demonstration)
        consistency_score = 80.0
        
        # Apply Weights
        habit_score = (
            (consistency_score * 0.35) +
            (challenge_score * 0.25) +
            (snooze_score * 0.20) +
            (sleep_score * 0.20)
        )
        habit_score = round(habit_score, 2)
        
        # Classification
        if habit_score >= 90:
            classification = "Excellent"
        elif habit_score >= 75:
            classification = "Good"
        elif habit_score >= 60:
            classification = "Average"
        else:
            classification = "Needs Improvement"
            
        return habit_score, classification
