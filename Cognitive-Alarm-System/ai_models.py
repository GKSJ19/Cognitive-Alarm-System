"""
AI Models for Cognitive Alarm System
Implements machine learning for anomaly detection and pattern recognition
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import joblib
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta


class AnomalyDetector:
    """
    Detects anomalies in sensor data using Isolation Forest algorithm
    """
    
    def __init__(self, contamination: float = 0.1):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def fit(self, data: np.ndarray) -> None:
        """Train the anomaly detector"""
        if len(data) > 0:
            scaled_data = self.scaler.fit_transform(data)
            self.model.fit(scaled_data)
            self.is_fitted = True
    
    def predict(self, data: np.ndarray) -> np.ndarray:
        """
        Predict anomalies (-1 for anomaly, 1 for normal)
        """
        if not self.is_fitted or len(data) == 0:
            return np.ones(len(data))
        
        scaled_data = self.scaler.transform(data)
        return self.model.predict(scaled_data)
    
    def get_anomaly_scores(self, data: np.ndarray) -> np.ndarray:
        """Get anomaly scores for data points"""
        if not self.is_fitted or len(data) == 0:
            return np.zeros(len(data))
        
        scaled_data = self.scaler.transform(data)
        return -self.model.score_samples(scaled_data)
    
    def save(self, filepath: str) -> None:
        """Save model to disk"""
        joblib.dump((self.model, self.scaler, self.is_fitted), filepath)
    
    def load(self, filepath: str) -> None:
        """Load model from disk"""
        self.model, self.scaler, self.is_fitted = joblib.load(filepath)


class PatternLearner:
    """
    Learns patterns in time-series data using clustering
    """
    
    def __init__(self, eps: float = 0.5, min_samples: int = 5):
        self.eps = eps
        self.min_samples = min_samples
        self.scaler = StandardScaler()
        self.patterns = {}
        
    def extract_features(self, data: List[float], window_size: int = 10) -> np.ndarray:
        """Extract statistical features from time-series windows"""
        if len(data) < window_size:
            return np.array([])
        
        features_list = []
        for i in range(len(data) - window_size + 1):
            window = np.array(data[i:i + window_size])
            features = np.array([
                np.mean(window),
                np.std(window),
                np.max(window),
                np.min(window),
                np.max(window) - np.min(window),  # range
                np.percentile(window, 25),
                np.percentile(window, 75)
            ])
            features_list.append(features)
        
        return np.array(features_list) if features_list else np.array([])
    
    def learn_patterns(self, data: List[float], window_size: int = 10) -> Dict:
        """Learn patterns from time-series data"""
        features = self.extract_features(data, window_size)
        
        if len(features) == 0:
            return {"patterns": [], "pattern_count": 0}
        
        scaled_features = self.scaler.fit_transform(features)
        clustering = DBSCAN(eps=self.eps, min_samples=self.min_samples)
        labels = clustering.fit_predict(scaled_features)
        
        self.patterns = {}
        for label in set(labels):
            if label != -1:  # -1 is noise
                pattern_data = features[labels == label]
                self.patterns[label] = {
                    "center": np.mean(pattern_data, axis=0),
                    "std": np.std(pattern_data, axis=0),
                    "count": len(pattern_data)
                }
        
        return {
            "patterns": len(self.patterns),
            "pattern_details": self.patterns,
            "noise_points": np.sum(labels == -1)
        }
    
    def predict_pattern(self, data: List[float], window_size: int = 10) -> Dict:
        """Predict which pattern the data belongs to"""
        if not self.patterns:
            return {"pattern_id": -1, "confidence": 0.0}
        
        features = self.extract_features(data, window_size)
        if len(features) == 0:
            return {"pattern_id": -1, "confidence": 0.0}
        
        latest_feature = features[-1].reshape(1, -1)
        scaled_feature = self.scaler.transform(latest_feature)
        
        min_distance = float('inf')
        best_pattern = -1
        
        for pattern_id, pattern_data in self.patterns.items():
            distance = np.linalg.norm(
                scaled_feature[0] - pattern_data["center"]
            )
            if distance < min_distance:
                min_distance = distance
                best_pattern = pattern_id
        
        confidence = max(0, 1 - min_distance)
        return {
            "pattern_id": best_pattern,
            "confidence": float(confidence),
            "distance": float(min_distance)
        }


class AdaptiveAlarmSystem:
    """
    Adaptive alarm system that learns from user behavior and adjusts settings
    """
    
    def __init__(self):
        self.user_behaviors = []
        self.alarm_history = []
        self.learning_rate = 0.1
        self.snooze_threshold = 3
        
    def record_user_interaction(
        self,
        alarm_id: str,
        action: str,
        timestamp: datetime,
        snooze_duration: Optional[int] = None
    ) -> None:
        """Record user interactions with alarms"""
        interaction = {
            "alarm_id": alarm_id,
            "action": action,  # "dismiss", "snooze", "trigger"
            "timestamp": timestamp,
            "snooze_duration": snooze_duration
        }
        self.user_behaviors.append(interaction)
    
    def predict_snooze_time(self, alarm_id: str) -> int:
        """Predict likely snooze time based on historical behavior"""
        relevant_behaviors = [
            b for b in self.user_behaviors
            if b["alarm_id"] == alarm_id and b["action"] == "snooze"
        ]
        
        if not relevant_behaviors:
            return 5  # Default snooze time in minutes
        
        snooze_times = [b["snooze_duration"] for b in relevant_behaviors]
        predicted = int(np.mean(snooze_times))
        return max(1, predicted)  # At least 1 minute
    
    def should_escalate_alarm(self, alarm_id: str) -> bool:
        """Determine if alarm should escalate based on dismissal patterns"""
        snooze_count = sum(
            1 for b in self.user_behaviors
            if b["alarm_id"] == alarm_id and b["action"] == "snooze"
        )
        
        return snooze_count >= self.snooze_threshold
    
    def get_optimal_alarm_time(self, historical_times: List[datetime]) -> datetime:
        """Find optimal alarm time based on historical snooze patterns"""
        if not historical_times:
            return datetime.now()
        
        # Convert to hours
        hours = [t.hour for t in historical_times]
        # Find most common hour
        hour = max(set(hours), key=hours.count)
        
        next_occurrence = datetime.now().replace(hour=hour, minute=0, second=0)
        if next_occurrence <= datetime.now():
            next_occurrence += timedelta(days=1)
        
        return next_occurrence


class PredictiveAnalytics:
    """
    Provides predictive analytics for alarm system
    """
    
    @staticmethod
    def predict_alarm_effectiveness(
        alarm_history: List[Dict],
        window_days: int = 7
    ) -> Dict:
        """Predict effectiveness of current alarm settings"""
        if not alarm_history:
            return {"effectiveness_score": 0.5, "recommendation": "Insufficient data"}
        
        recent = [
            a for a in alarm_history
            if (datetime.now() - a.get("timestamp", datetime.now())).days <= window_days
        ]
        
        if not recent:
            return {"effectiveness_score": 0.5, "recommendation": "No recent data"}
        
        dismissed_on_time = sum(
            1 for a in recent if a.get("action") == "dismiss"
        )
        snoozed = sum(1 for a in recent if a.get("action") == "snooze")
        
        effectiveness = dismissed_on_time / (len(recent) + 1)
        
        recommendation = "optimal"
        if snoozed > dismissed_on_time:
            recommendation = "increase_intensity"
        elif dismissed_on_time == len(recent):
            recommendation = "can_reduce_intensity"
        
        return {
            "effectiveness_score": float(effectiveness),
            "dismissed_count": dismissed_on_time,
            "snoozed_count": snoozed,
            "recommendation": recommendation
        }
    
    @staticmethod
    def predict_next_alarm_time(
        alarm_times: List[datetime],
        frequency: str = "daily"
    ) -> datetime:
        """Predict next alarm time based on frequency"""
        if not alarm_times:
            return datetime.now() + timedelta(days=1)
        
        last_time = max(alarm_times)
        
        if frequency == "daily":
            return last_time + timedelta(days=1)
        elif frequency == "weekly":
            return last_time + timedelta(weeks=1)
        elif frequency == "monthly":
            return last_time + timedelta(days=30)
        
        return last_time + timedelta(days=1)
