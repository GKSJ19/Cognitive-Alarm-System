"""
Behavioral Analytics Engine
Analyzes user patterns, habits, and wake-up behavior for recommendations
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import statistics


class BehaviorAnalyzer:
    """Analyzes user behavior patterns"""
    
    @staticmethod
    def analyze_snooze_patterns(wake_up_stats: List[Dict]) -> Dict:
        """Analyze snooze behavior patterns"""
        if not wake_up_stats:
            return {"average_snooze": 0, "snooze_frequency": 0, "trend": "stable"}
        
        snoozed = [s for s in wake_up_stats if s.get("snoozed", False)]
        snooze_counts = [s.get("snooze_count", 0) for s in snoozed]
        
        average_snooze = statistics.mean(snooze_counts) if snooze_counts else 0
        snooze_frequency = len(snoozed) / len(wake_up_stats) if wake_up_stats else 0
        
        # Determine trend
        recent_snoozed = sum(1 for s in wake_up_stats[-7:] if s.get("snoozed", False))
        older_snoozed = sum(1 for s in wake_up_stats[-14:-7] if s.get("snoozed", False))
        
        trend = "increasing" if recent_snoozed > older_snoozed else "decreasing" if recent_snoozed < older_snoozed else "stable"
        
        return {
            "average_snooze": round(average_snooze, 2),
            "snooze_frequency": round(snooze_frequency, 2),
            "snooze_count_range": f"{min(snooze_counts) if snooze_counts else 0}-{max(snooze_counts) if snooze_counts else 0}",
            "trend": trend
        }
    
    @staticmethod
    def analyze_wake_up_patterns(wake_up_stats: List[Dict]) -> Dict:
        """Analyze wake-up behavior patterns"""
        if not wake_up_stats:
            return {"success_rate": 0, "consistency": 0, "peak_hours": []}
        
        successful = [s for s in wake_up_stats if s.get("actual_wake_time")]
        success_rate = len(successful) / len(wake_up_stats) if wake_up_stats else 0
        
        # Calculate consistency (how close to scheduled time)
        time_diffs = []
        for stat in successful:
            try:
                scheduled = datetime.strptime(stat.get("scheduled_time", "00:00"), "%H:%M")
                actual = datetime.strptime(stat.get("actual_wake_time", "00:00"), "%H:%M")
                diff = abs((actual - scheduled).total_seconds()) / 60  # minutes
                time_diffs.append(diff)
            except:
                pass
        
        consistency = 100 - (statistics.mean(time_diffs) if time_diffs else 100)
        consistency = max(0, min(100, consistency))
        
        # Find peak wake-up hours
        hours = []
        for stat in successful:
            try:
                hour = int(stat.get("actual_wake_time", "00:00").split(":")[0])
                hours.append(hour)
            except:
                pass
        
        peak_hours = sorted(set(hours), key=lambda h: hours.count(h), reverse=True)[:3]
        
        return {
            "success_rate": round(success_rate * 100, 2),
            "consistency_score": round(consistency, 2),
            "peak_wake_up_hours": peak_hours,
            "avg_time_variance_minutes": round(statistics.mean(time_diffs), 2) if time_diffs else 0
        }
    
    @staticmethod
    def analyze_challenge_performance(challenge_results: List[Dict]) -> Dict:
        """Analyze challenge completion performance"""
        if not challenge_results:
            return {"accuracy": 0, "avg_time": 0, "by_type": {}, "by_difficulty": {}}
        
        # Overall accuracy
        correct = sum(1 for c in challenge_results if c.get("is_correct", False))
        accuracy = correct / len(challenge_results) if challenge_results else 0
        
        # Average time
        times = [c.get("time_taken", 0) for c in challenge_results]
        avg_time = statistics.mean(times) if times else 0
        
        # By type
        by_type = {}
        for challenge_type in ["math", "logic", "memory", "word", "pattern", "riddle", "quiz"]:
            type_results = [c for c in challenge_results if c.get("type") == challenge_type]
            if type_results:
                type_correct = sum(1 for c in type_results if c.get("is_correct", False))
                by_type[challenge_type] = {
                    "count": len(type_results),
                    "accuracy": round(type_correct / len(type_results), 2)
                }
        
        # By difficulty
        by_difficulty = {}
        for difficulty in ["beginner", "easy", "medium", "hard", "expert"]:
            diff_results = [c for c in challenge_results if c.get("difficulty") == difficulty]
            if diff_results:
                diff_correct = sum(1 for c in diff_results if c.get("is_correct", False))
                by_difficulty[difficulty] = {
                    "count": len(diff_results),
                    "accuracy": round(diff_correct / len(diff_results), 2)
                }
        
        return {
            "accuracy": round(accuracy, 2),
            "avg_time_seconds": round(avg_time, 2),
            "total_challenges": len(challenge_results),
            "by_type": by_type,
            "by_difficulty": by_difficulty
        }
    
    @staticmethod
    def analyze_productivity_correlation(wake_up_stats: List[Dict], productivity_scores: List[float]) -> float:
        """Analyze correlation between wake-up performance and productivity"""
        if not wake_up_stats or not productivity_scores or len(wake_up_stats) != len(productivity_scores):
            return 0.0
        
        # Calculate wake-up success (1 if no snooze, 0 if snoozed)
        success_scores = [0 if s.get("snoozed", False) else 1 for s in wake_up_stats]
        
        # Simple correlation
        if not success_scores or sum(success_scores) == 0:
            return 0.0
        
        mean_success = statistics.mean(success_scores)
        mean_productivity = statistics.mean(productivity_scores)
        
        numerator = sum((success_scores[i] - mean_success) * (productivity_scores[i] - mean_productivity) 
                       for i in range(len(success_scores)))
        denominator = (sum((s - mean_success) ** 2 for s in success_scores) ** 0.5) * \
                     (sum((p - mean_productivity) ** 2 for p in productivity_scores) ** 0.5)
        
        correlation = numerator / denominator if denominator != 0 else 0.0
        return round(max(0, correlation), 2)
    
    @staticmethod
    def calculate_habit_consistency(habit_progress: List[Dict]) -> float:
        """Calculate habit consistency score (0-100)"""
        if not habit_progress:
            return 0.0
        
        total_days = len(habit_progress)
        completed_days = sum(1 for p in habit_progress if p.get("completed", False))
        
        consistency = (completed_days / total_days) * 100 if total_days > 0 else 0
        return round(consistency, 2)


class HabitScoreCalculator:
    """Calculates habit scores using weighted model"""
    
    # Weighted Scoring Model
    WEIGHTS = {
        "wake_up_consistency": 0.35,
        "challenge_completion": 0.25,
        "snooze_reduction": 0.20,
        "sleep_adherence": 0.20
    }
    
    @staticmethod
    def calculate_wake_up_consistency_score(wake_up_stats: List[Dict]) -> float:
        """Calculate wake-up consistency score (0-100)"""
        if not wake_up_stats:
            return 0.0
        
        # Success rate (no snooze)
        no_snooze = sum(1 for s in wake_up_stats if not s.get("snoozed", False))
        success_rate = (no_snooze / len(wake_up_stats)) * 100 if wake_up_stats else 0
        
        return round(min(100, success_rate), 2)
    
    @staticmethod
    def calculate_challenge_completion_score(challenge_results: List[Dict]) -> float:
        """Calculate challenge completion score (0-100)"""
        if not challenge_results:
            return 0.0
        
        completed = sum(1 for c in challenge_results if c.get("is_correct", False))
        completion_rate = (completed / len(challenge_results)) * 100 if challenge_results else 0
        
        return round(min(100, completion_rate), 2)
    
    @staticmethod
    def calculate_snooze_reduction_score(wake_up_stats: List[Dict]) -> float:
        """Calculate snooze reduction score (0-100)"""
        if len(wake_up_stats) < 2:
            return 100.0
        
        recent = wake_up_stats[-7:]
        older = wake_up_stats[-14:-7]
        
        if not older:
            return 100.0
        
        recent_snooze_avg = statistics.mean([s.get("snooze_count", 0) for s in recent])
        older_snooze_avg = statistics.mean([s.get("snooze_count", 0) for s in older])
        
        if older_snooze_avg == 0:
            return 100.0
        
        reduction = ((older_snooze_avg - recent_snooze_avg) / older_snooze_avg) * 100
        reduction = max(-100, min(100, reduction))  # Clamp to -100 to 100
        
        return round(50 + (reduction / 2), 2)  # Map to 0-100
    
    @staticmethod
    def calculate_sleep_adherence_score(habit_progress: List[Dict]) -> float:
        """Calculate sleep schedule adherence score (0-100)"""
        if not habit_progress:
            return 0.0
        
        completed = sum(1 for p in habit_progress if p.get("completed", False))
        adherence = (completed / len(habit_progress)) * 100 if habit_progress else 0
        
        return round(min(100, adherence), 2)
    
    @staticmethod
    def calculate_total_habit_score(
        wake_up_consistency: float,
        challenge_completion: float,
        snooze_reduction: float,
        sleep_adherence: float
    ) -> float:
        """Calculate total habit score using weighted model"""
        
        total_score = (
            wake_up_consistency * HabitScoreCalculator.WEIGHTS["wake_up_consistency"] +
            challenge_completion * HabitScoreCalculator.WEIGHTS["challenge_completion"] +
            snooze_reduction * HabitScoreCalculator.WEIGHTS["snooze_reduction"] +
            sleep_adherence * HabitScoreCalculator.WEIGHTS["sleep_adherence"]
        )
        
        return round(min(100, total_score), 2)
    
    @staticmethod
    def generate_daily_habit_score(
        wake_up_stats: List[Dict],
        challenge_results: List[Dict],
        habit_progress: List[Dict]
    ) -> Dict:
        """Generate complete daily habit score"""
        
        wake_up_consistency = HabitScoreCalculator.calculate_wake_up_consistency_score(wake_up_stats)
        challenge_completion = HabitScoreCalculator.calculate_challenge_completion_score(challenge_results)
        snooze_reduction = HabitScoreCalculator.calculate_snooze_reduction_score(wake_up_stats)
        sleep_adherence = HabitScoreCalculator.calculate_sleep_adherence_score(habit_progress)
        
        total_score = HabitScoreCalculator.calculate_total_habit_score(
            wake_up_consistency,
            challenge_completion,
            snooze_reduction,
            sleep_adherence
        )
        
        return {
            "wake_up_consistency": wake_up_consistency,
            "challenge_completion": challenge_completion,
            "snooze_reduction": snooze_reduction,
            "sleep_adherence": sleep_adherence,
            "total_habit_score": total_score,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }


class RecommendationEngine:
    """Generates personalized recommendations"""
    
    @staticmethod
    def generate_recommendations(
        user_analytics: Dict,
        habit_score: Dict,
        challenge_performance: Dict
    ) -> List[Dict]:
        """Generate personalized recommendations"""
        
        recommendations = []
        
        # Sleep recommendations
        if habit_score.get("sleep_adherence", 100) < 50:
            recommendations.append({
                "category": "sleep",
                "title": "Improve Sleep Schedule",
                "description": "You're not maintaining a consistent sleep schedule. Try setting a bedtime and following it daily.",
                "action": "schedule_bedtime_reminder",
                "confidence": 0.95,
                "priority": "high"
            })
        
        # Wake-up recommendations
        wake_up_consistency = habit_score.get("wake_up_consistency", 100)
        if wake_up_consistency < 60:
            recommendations.append({
                "category": "wake_up",
                "title": "Improve Wake-Up Success",
                "description": "You're having trouble waking up on time. Consider earlier alarms or changing your challenge difficulty.",
                "action": "adjust_alarm_settings",
                "confidence": 0.90,
                "priority": "high"
            })
        
        # Challenge recommendations
        challenge_accuracy = challenge_performance.get("accuracy", 0)
        if challenge_accuracy < 0.5:
            recommendations.append({
                "category": "cognitive",
                "title": "Reduce Challenge Difficulty",
                "description": "You're struggling with current challenge difficulty. Try easier challenges to build confidence.",
                "action": "lower_difficulty",
                "confidence": 0.85,
                "priority": "medium"
            })
        elif challenge_accuracy > 0.85:
            recommendations.append({
                "category": "cognitive",
                "title": "Increase Challenge Difficulty",
                "description": "Great job! You're performing very well. Time to challenge yourself with harder puzzles.",
                "action": "increase_difficulty",
                "confidence": 0.90,
                "priority": "medium"
            })
        
        # Snooze recommendations
        snooze_reduction = habit_score.get("snooze_reduction", 100)
        if snooze_reduction < 40:
            recommendations.append({
                "category": "habit",
                "title": "Reduce Snoozing",
                "description": "You're snoozing frequently. Try setting your alarm 10 minutes earlier and get up immediately.",
                "action": "snooze_reduction_strategy",
                "confidence": 0.88,
                "priority": "high"
            })
        
        # Productivity recommendations
        if habit_score.get("total_habit_score", 0) > 80:
            recommendations.append({
                "category": "productivity",
                "title": "Maintain Your Success",
                "description": "Excellent work! Keep up your current routine and consider new productivity goals.",
                "action": "celebrate_success",
                "confidence": 0.92,
                "priority": "low"
            })
        
        return sorted(recommendations, key=lambda r: r["priority"] == "high", reverse=True)
    
    @staticmethod
    def suggest_difficulty_adjustment(challenge_performance: Dict) -> Optional[Dict]:
        """Suggest difficulty adjustment"""
        
        accuracy = challenge_performance.get("accuracy", 0.5)
        avg_time = challenge_performance.get("avg_time_seconds", 0)
        
        if accuracy > 0.90 and avg_time < 30:
            return {
                "current": "medium",
                "suggested": "hard",
                "reason": "Excellent performance with fast completion times",
                "confidence": 0.92
            }
        elif accuracy < 0.50:
            return {
                "current": "medium",
                "suggested": "easy",
                "reason": "Below 50% accuracy - reduce difficulty to build confidence",
                "confidence": 0.88
            }
        elif accuracy < 0.70:
            return {
                "current": "hard",
                "suggested": "medium",
                "reason": "Moderate performance - try medium difficulty",
                "confidence": 0.85
            }
        
        return None
