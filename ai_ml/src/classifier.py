"""
Prediction Model (classifier.py)

Covers the diagram's "Prediction Models" requirement:
wake-up success prediction / oversleep-snooze risk prediction.

Uses XGBoost to predict whether a user is at HIGH risk of oversleeping
or excessive snoozing on a given day, based on their recent behavior
pattern (avg snooze count, wake-up confirmation rate, challenge accuracy,
sleep duration).

TRAINING DATA NOTE:
Real logged data currently only covers 5 users with 1 log entry each --
not enough history to train a meaningful classifier (XGBoost needs many
labeled examples to learn real patterns, not just apply a fixed formula).
This module trains on SYNTHETIC labeled data instead, clearly marked as
such below. Once more real multi-day logs accumulate (via data_ingest.py /
MongoDB), swap `generate_synthetic_training_data()` for a real feature
extraction + labeling pipeline built from actual historical logs --
the model training/prediction code itself won't need to change.
"""

import os
import random
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

random.seed(42)
np.random.seed(42)

FEATURE_NAMES = [
    "avg_snooze_count",
    "wake_up_confirmation_rate",
    "challenge_accuracy_rate",
    "sleep_duration",
]

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "snooze_predictor.joblib")


# ---------------------------------------------------------------------------
# SYNTHETIC LABELED TRAINING DATA
# (clearly marked as synthetic -- see module docstring for why)
# ---------------------------------------------------------------------------

def generate_synthetic_training_data(n_samples: int = 500) -> pd.DataFrame:
    """
    Generates synthetic (avg_snooze_count, wake_up_confirmation_rate,
    challenge_accuracy_rate, sleep_duration) -> risk_label rows.

    Label logic (ground truth used only to generate synthetic data,
    not part of the model itself):
      HIGH risk (1) if avg_snooze_count is high AND wake-up confirmation
      is low AND sleep_duration is off the healthy 7-9hr range.
      LOW risk (0) otherwise.

    The model learns this pattern from the generated examples rather
    than having the rule hardcoded -- that's the point of using a
    classifier instead of another formula like habit_scoring.py.
    """
    rows = []
    for _ in range(n_samples):
        avg_snooze = round(np.random.exponential(scale=1.2), 2)
        avg_snooze = min(avg_snooze, 6.0)

        wake_confirm_rate = round(np.clip(np.random.normal(0.75, 0.25), 0, 1), 2)
        accuracy_rate = round(np.clip(np.random.normal(0.75, 0.2), 0, 1), 2)
        sleep_duration = round(np.random.normal(7.3, 1.1), 2)
        sleep_duration = max(3.0, min(sleep_duration, 11.0))

        sleep_off_range = sleep_duration < 6.5 or sleep_duration > 9.5

        risk_score = (
            (avg_snooze / 6.0) * 0.4
            + (1 - wake_confirm_rate) * 0.35
            + (0.25 if sleep_off_range else 0.0)
        )
        # small noise so the boundary isn't perfectly clean (more realistic)
        risk_score += np.random.normal(0, 0.05)

        label = 1 if risk_score > 0.45 else 0

        rows.append({
            "avg_snooze_count": avg_snooze,
            "wake_up_confirmation_rate": wake_confirm_rate,
            "challenge_accuracy_rate": accuracy_rate,
            "sleep_duration": sleep_duration,
            "high_risk": label,
        })

    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# TRAINING
# ---------------------------------------------------------------------------

def train_model(save: bool = True) -> XGBClassifier:
    """
    Trains an XGBoost classifier on synthetic labeled data and
    (optionally) saves it to ai_ml/models/snooze_predictor.joblib.
    """
    df = generate_synthetic_training_data(n_samples=800)

    X = df[FEATURE_NAMES]
    y = df["high_risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Validation accuracy on synthetic hold-out set: {acc:.3f}\n")
    print(classification_report(y_test, preds, target_names=["low_risk", "high_risk"]))

    if save:
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        print(f"\nModel saved to {MODEL_PATH}")

    return model


# ---------------------------------------------------------------------------
# PREDICTION (real usage entry point)
# ---------------------------------------------------------------------------

def load_model() -> XGBClassifier:
    """Loads the trained model from disk, training it first if not found."""
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    print("No saved model found -- training a new one first.")
    return train_model(save=True)


def predict_risk_for_user(user_id: int) -> dict:
    """
    Full pipeline version: pulls a user's real feature data via
    data_ingest.py + features.py, then predicts oversleep/snooze risk.
    """
    import sys
    # classifier.py lives in ai_ml/src/, while data_ingest.py and
    # features.py live in ai_ml/pipelines/ -- a sibling folder, not
    # the same one, so we need to go up one level then into pipelines/.
    ai_ml_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pipelines_dir = os.path.join(ai_ml_dir, "pipelines")
    if pipelines_dir not in sys.path:
        sys.path.append(pipelines_dir)

    from data_ingest import build_user_context
    from features import analyze_snooze_pattern, analyze_wakeup_behavior, analyze_challenge_completion

    context = build_user_context(user_id=user_id)
    logs = context.get("logs", [])
    attempts = context.get("challenge_attempts", [])
    profile = context.get("profile") or {}

    snooze_stats = analyze_snooze_pattern(logs)
    wakeup_stats = analyze_wakeup_behavior(logs)
    challenge_stats = analyze_challenge_completion(attempts)
    sleep_duration = profile.get("sleep_duration", 7.5)  # neutral default if missing

    feature_row = pd.DataFrame([{
        "avg_snooze_count": snooze_stats["avg_snooze_count"],
        "wake_up_confirmation_rate": wakeup_stats["confirmation_rate"],
        "challenge_accuracy_rate": challenge_stats["accuracy_rate"],
        "sleep_duration": sleep_duration,
    }])

    model = load_model()
    risk_label = model.predict(feature_row)[0]
    risk_probability = model.predict_proba(feature_row)[0][1]  # P(high_risk)

    return {
        "user_id": user_id,
        "risk_label": "high_risk" if risk_label == 1 else "low_risk",
        "risk_probability": round(float(risk_probability), 3),
        "features_used": feature_row.iloc[0].to_dict(),
    }


if __name__ == "__main__":
    print("=== Prediction Model: Training (Synthetic Data) ===\n")
    train_model(save=True)

    print("\n=== Prediction Model: Demo on Real Users (1-5) ===\n")
    for user_id in range(1, 6):
        result = predict_risk_for_user(user_id)
        print(f"User {result['user_id']}: {result['risk_label']} "
              f"(P(high_risk)={result['risk_probability']})")
        print(f"  Features: {result['features_used']}\n")