import numpy as np
import pandas as pd


class BehavioralAnalyticsEngine:
    """
    Generates behavioral statistics utilizing Pandas and NumPy for analysis.
    """
    @staticmethod
    def analyze_behavior(user_data: dict) -> dict:
        # Load into pandas for analysis
        df = pd.DataFrame([user_data])
        
        # Calculate statistics
        avg_sleep = np.mean(df['sleep_duration_hours'])
        avg_snooze = np.mean(df['snooze_count'])
        avg_accuracy = np.mean(df['accuracy_percent'])
        
        return {
            "average_sleep_hours": round(avg_sleep, 2),
            "average_snooze_count": round(avg_snooze, 2),
            "average_accuracy": round(avg_accuracy, 2),
            "is_sleep_deprived": bool(avg_sleep < 7.0),
            "high_snooze_dependency": bool(avg_snooze > 2)
        }
