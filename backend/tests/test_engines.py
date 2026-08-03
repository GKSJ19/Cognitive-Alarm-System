import pytest
from app.models import Alarm, UserProfile, ChallengeCategory, Challenge, ChallengeResult, AlarmHistory
from datetime import time

def register_and_login(client, email, password):
    """Helper to register and login a user, returning their access token."""
    client.post(
        "/auth/register",
        json={"email": email, "password": password, "full_name": "Test User", "role": "user"}
    )
    res = client.post("/auth/login", data={"username": email, "password": password})
    return res.json()["access_token"]

def test_behavioral_analytics_on_dismiss(client, db_session):
    """Verify that dismissing an alarm tracks user behavior, calculates sleep duration, and generates habit scores."""
    token = register_and_login(client, "test_behavior@example.com", "password123")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create user profile preferred times
    client.put(
        "/profile",
        json={"preferred_sleep_time": "22:30", "preferred_wakeup_time": "07:00"},
        headers=headers
    )

    # 2. Create alarm
    alarm_res = client.post(
        "/alarms",
        json={
            "title": "Work Alarm",
            "alarm_time": "07:00:00",
            "repeat_type": "daily",
            "is_smart_adaptive": False
        },
        headers=headers
    )
    alarm_id = alarm_res.json()["id"]

    # 3. Dismiss alarm
    dismiss_res = client.post(
        "/alarms/dismiss",
        json={
            "alarm_id": alarm_id,
            "wake_time": "07:15",
            "solved": True,
            "solve_time": 25,
            "snooze_count": 2
        },
        headers=headers
    )
    assert dismiss_res.status_code == 201
    assert dismiss_res.json()["snooze_count"] == 2

    # 4. Check behavioral analytics history
    history_res = client.get("/behavioral-analytics/history", headers=headers)
    assert history_res.status_code == 200
    logs = history_res.json()
    assert len(logs) == 1
    assert logs[0]["snooze_count"] == 2
    assert logs[0]["wake_up_delay"] == 900  # 15 mins = 900s
    assert logs[0]["sleep_duration"] == 8.75  # 22:30 to 07:15 = 8.75 hours

    # 5. Check behavioral analytics summary
    summary_res = client.get("/behavioral-analytics/summary", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["average_snooze_count"] == 2.0
    assert summary["average_wake_up_delay_seconds"] == 900.0
    assert summary["challenge_completion_rate"] == 100.0
    assert summary["average_sleep_duration_hours"] == 8.75


def test_habit_scoring_and_recommendation(client, db_session):
    """Verify habit scores and auto-recommendation generation are triggered."""
    token = register_and_login(client, "test_scores@example.com", "password123")
    headers = {"Authorization": f"Bearer {token}"}

    # Setup profile
    client.put(
        "/profile",
        json={"preferred_sleep_time": "23:00", "preferred_wakeup_time": "07:00"},
        headers=headers
    )

    # Setup alarm
    alarm_res = client.post(
        "/alarms",
        json={"title": "Scores Alarm", "alarm_time": "07:00:00"},
        headers=headers
    )
    alarm_id = alarm_res.json()["id"]

    # Log dismissal
    client.post(
        "/alarms/dismiss",
        json={
            "alarm_id": alarm_id,
            "wake_time": "07:02",
            "solved": True,
            "solve_time": 5,
            "snooze_count": 0
        },
        headers=headers
    )

    # 1. Fetch current scores
    scores_res = client.get("/habit-scoring/current", headers=headers)
    assert scores_res.status_code == 200
    scores = scores_res.json()
    # wake_up_consistency: delay 2 mins (120s) -> 100.0
    # snooze_reduction: 0 snoozes -> 100.0
    # sleep_adherence: wake 07:02 vs pref 07:00 -> diff 2 mins -> 100.0 - 4.0 = 96.0
    # challenge_completion: 100%
    assert scores["wake_up_consistency"] == 100.0
    assert scores["snooze_reduction"] == 100.0
    assert scores["challenge_completion"] == 100.0
    assert scores["sleep_adherence"] == 96.0
    assert scores["overall_score"] > 90.0

    # 2. Fetch history
    history_res = client.get("/habit-scoring/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1

    # 3. Check recommendations
    recs_res = client.get("/recommendations", headers=headers)
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert len(recs) >= 1  # Should generate early rise or productivity tips
    rec_id = recs[0]["id"]

    # Mark as read
    read_res = client.patch(f"/recommendations/{rec_id}/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True


def test_adaptive_difficulty(client, db_session):
    """Verify that Adaptive Difficulty increases challenge difficulty based on performance."""
    token = register_and_login(client, "test_adaptive@example.com", "password123")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a smart adaptive alarm with "easy" difficulty
    alarm_res = client.post(
        "/alarms",
        json={
            "title": "Smart Alarm",
            "alarm_time": "06:30:00",
            "is_smart_adaptive": True,
            "difficulty": "easy",
            "challenge_type": "math"
        },
        headers=headers
    )
    alarm_id = alarm_res.json()["id"]

    # Seed challenge category & challenges
    math_cat = ChallengeCategory(name="Math Problems", description="Math")
    db_session.add(math_cat)
    db_session.commit()

    ch1 = Challenge(category_id=math_cat.id, question_text="1+1", difficulty="easy", correct_answer="2")
    ch2 = Challenge(category_id=math_cat.id, question_text="2+2", difficulty="easy", correct_answer="4")
    ch3 = Challenge(category_id=math_cat.id, question_text="3+3", difficulty="easy", correct_answer="6")
    db_session.add_all([ch1, ch2, ch3])
    db_session.commit()

    # Log 3 consecutive fast & highly accurate challenge submissions (e.g. solve_time=3, attempt_count=1)
    for ch in [ch1, ch2, ch3]:
        submit_res = client.post(
            "/challenges/submit",
            json={
                "challenge_id": str(ch.id),
                "answer": ch.correct_answer,
                "alarm_id": alarm_id,
                "solve_time": 3,
                "attempt_count": 1,
                "snooze_count": 0
            },
            headers=headers
        )
        assert submit_res.status_code == 200
        assert submit_res.json()["is_correct"] is True

    # 2. Check if alarm difficulty was bumped to "medium"
    import uuid
    alarm_db = db_session.query(Alarm).filter(Alarm.id == uuid.UUID(alarm_id)).first()
    assert alarm_db.difficulty == "medium"

    # 3. Check difficulty history logs
    diff_history_res = client.get("/adaptive-difficulty/history", headers=headers)
    assert diff_history_res.status_code == 200
    history = diff_history_res.json()
    assert len(history) == 1
    assert history[0]["previous_difficulty"] == "easy"
    assert history[0]["new_difficulty"] == "medium"


def test_dashboard_summary(client, db_session):
    """Verify the dashboard compiles all trends, history, scores, and statistics."""
    token = register_and_login(client, "test_dashboard@example.com", "password123")
    headers = {"Authorization": f"Bearer {token}"}

    # Setup alarm and log some dismissal and challenge submission
    alarm_res = client.post(
        "/alarms",
        json={"title": "Dashboard Alarm", "alarm_time": "08:00:00", "difficulty": "medium"},
        headers=headers
    )
    alarm_id = alarm_res.json()["id"]

    # Seed challenge category & challenge
    math_cat = ChallengeCategory(name="Math Problems", description="Math")
    db_session.add(math_cat)
    db_session.commit()
    ch = Challenge(category_id=math_cat.id, question_text="5+5", difficulty="medium", correct_answer="10")
    db_session.add(ch)
    db_session.commit()

    # Submit solve
    client.post(
        "/challenges/submit",
        json={
            "challenge_id": str(ch.id),
            "answer": "10",
            "alarm_id": alarm_id,
            "solve_time": 8,
            "attempt_count": 1,
            "snooze_count": 1
        },
        headers=headers
    )

    # Fetch dashboard summary
    dash_res = client.get("/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()

    assert dash_data["current_scores"] is not None
    assert len(dash_data["score_trends"]) >= 1
    assert dash_data["challenge_stats"]["total_solved"] == 1
    assert dash_data["challenge_stats"]["avg_solve_time_seconds"] == 8.0
    assert "Math Problems" in dash_data["challenge_stats"]["category_breakdown"]
    assert len(dash_data["sleep_trends"]) >= 1
    assert len(dash_data["wake_up_history"]) >= 1
    assert dash_data["wake_up_history"][0]["snooze_count"] == 1
    assert dash_data["progress_report"]["this_week_average_score"] > 0
    assert len(dash_data["recommendations"]) >= 1
