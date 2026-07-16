import pytest
import uuid
from app.seed import seed_database
from app.models import Challenge, ChallengeCategory, ChallengeAttempt, ChallengeResult, AlarmHistory, Alarm

def register_and_login(client, email, password):
    """Helper to register and login a user, returning their access token."""
    client.post(
        "/auth/register",
        json={"email": email, "password": password, "full_name": "Test User", "role": "user"}
    )
    res = client.post("/auth/login", data={"username": email, "password": password})
    return res.json()["access_token"]

@pytest.fixture(autouse=True)
def setup_seed(db_session):
    """Ensure categories and challenges are seeded in the test database."""
    seed_database(db_session)

def test_get_categories(client):
    """Test retrieving seeded challenge categories."""
    token = register_and_login(client, "tester@example.com", "password")
    res = client.get("/challenges/categories", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    names = [c["name"] for c in res.json()]
    assert "Math Problems" in names
    assert "Logic Puzzles" in names
    assert "Riddles" in names
    assert "Quick Quiz" in names
    assert len(names) == 7

def test_generate_procedural_challenges(client):
    """Test generating procedural Math, Memory, and Pattern challenges."""
    token = register_and_login(client, "tester@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    # Retrieve categories to get IDs
    cats = client.get("/challenges/categories", headers=headers).json()
    math_cat = next(c for c in cats if c["name"] == "Math Problems")
    memory_cat = next(c for c in cats if c["name"] == "Memory Challenges")
    pattern_cat = next(c for c in cats if c["name"] == "Pattern Recognition")

    # Math Easy
    res = client.get(f"/challenges/generate?category_id={math_cat['id']}&difficulty=easy", headers=headers)
    assert res.status_code == 200
    assert res.json()["difficulty"] == "easy"
    assert res.json()["category_id"] == math_cat["id"]
    assert "category_name" in res.json()
    assert res.json()["category_name"] == "Math Problems"

    # Memory Medium
    res = client.get(f"/challenges/generate?category_id={memory_cat['id']}&difficulty=medium", headers=headers)
    assert res.status_code == 200
    assert "Memorize" in res.json()["question_text"]
    assert res.json()["difficulty"] == "medium"

    # Pattern Hard
    res = client.get(f"/challenges/generate?category_id={pattern_cat['id']}&difficulty=hard", headers=headers)
    assert res.status_code == 200
    assert "?" in res.json()["question_text"]

def test_generate_seeded_challenges(client):
    """Test generating pre-seeded static Logic, Riddle, and Quiz challenges."""
    token = register_and_login(client, "tester@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    cats = client.get("/challenges/categories", headers=headers).json()
    riddle_cat = next(c for c in cats if c["name"] == "Riddles")

    res = client.get(f"/challenges/generate?category_id={riddle_cat['id']}&difficulty=easy", headers=headers)
    assert res.status_code == 200
    assert res.json()["difficulty"] == "easy"
    # Verify correct_answer is NOT returned in client payload
    assert "correct_answer" not in res.json()

def test_submit_challenge_math_success(client, db_session):
    """Test submitting a correct answer to a generated Math challenge."""
    token = register_and_login(client, "solver@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    # Generate a math challenge
    cats = client.get("/challenges/categories", headers=headers).json()
    math_cat = next(c for c in cats if c["name"] == "Math Problems")
    gen_res = client.get(f"/challenges/generate?category_id={math_cat['id']}&difficulty=medium", headers=headers)
    challenge_id = gen_res.json()["id"]

    # Read answer from DB directly
    db_chal = db_session.query(Challenge).filter(Challenge.id == uuid.UUID(challenge_id)).first()
    correct_ans = db_chal.correct_answer

    # Submit answer
    sub_res = client.post(
        "/challenges/submit",
        headers=headers,
        json={
            "challenge_id": challenge_id,
            "answer": correct_ans,
            "solve_time": 10,
            "attempt_count": 2
        }
    )
    assert sub_res.status_code == 200
    data = sub_res.json()
    assert data["is_correct"] is True
    assert data["score"] > 20
    assert data["accuracy"] == 0.5
    assert data["correct_answer"] == correct_ans

    # Verify ChallengeResult and ChallengeAttempt logged
    attempts = db_session.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == uuid.UUID(challenge_id)).all()
    assert len(attempts) == 1
    assert attempts[0].is_correct is True

    result = db_session.query(ChallengeResult).filter(ChallengeResult.challenge_id == uuid.UUID(challenge_id)).first()
    assert result is not None
    assert result.score == data["score"]

def test_submit_challenge_incorrect(client, db_session):
    """Test submitting an incorrect answer."""
    token = register_and_login(client, "incorrect@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    cats = client.get("/challenges/categories", headers=headers).json()
    math_cat = next(c for c in cats if c["name"] == "Math Problems")
    gen_res = client.get(f"/challenges/generate?category_id={math_cat['id']}&difficulty=easy", headers=headers)
    challenge_id = gen_res.json()["id"]

    # Submit wrong answer
    sub_res = client.post(
        "/challenges/submit",
        headers=headers,
        json={
            "challenge_id": challenge_id,
            "answer": "wrong_value",
            "solve_time": 5,
            "attempt_count": 1
        }
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["is_correct"] is False

    # Check attempt is logged as incorrect
    attempts = db_session.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == uuid.UUID(challenge_id)).all()
    assert len(attempts) == 1
    assert attempts[0].is_correct is False

def test_avoid_repeating_recent_questions(client, db_session):
    """Test that generated challenges avoid questions recently solved."""
    token = register_and_login(client, "repeater@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    cats = client.get("/challenges/categories", headers=headers).json()
    riddle_cat = next(c for c in cats if c["name"] == "Riddles")

    # Generate one riddle
    res1 = client.get(f"/challenges/generate?category_id={riddle_cat['id']}&difficulty=easy", headers=headers)
    id1 = res1.json()["id"]

    # Solve it
    db_chal = db_session.query(Challenge).filter(Challenge.id == uuid.UUID(id1)).first()
    client.post(
        "/challenges/submit",
        headers=headers,
        json={"challenge_id": id1, "answer": db_chal.correct_answer, "solve_time": 2, "attempt_count": 1}
    )

    # Generate a second riddle, should be different
    res2 = client.get(f"/challenges/generate?category_id={riddle_cat['id']}&difficulty=easy", headers=headers)
    id2 = res2.json()["id"]
    assert id1 != id2

def test_alarm_dismissal_and_history(client, db_session):
    """Test dismissing alarm logs history correctly."""
    token = register_and_login(client, "dismiss@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    # Create alarm
    alarm_res = client.post(
        "/alarms",
        json={"title": "Morning Wakeup", "alarm_time": "07:30:00", "volume": 85},
        headers=headers
    )
    alarm_id = alarm_res.json()["alarm_id"]

    # Dismiss alarm directly
    dismiss_res = client.post(
        "/alarms/dismiss",
        json={"alarm_id": alarm_id, "wake_time": "07:35", "solved": True, "solve_time": 15},
        headers=headers
    )
    assert dismiss_res.status_code == 201
    assert "history_id" in dismiss_res.json()

    # Verify history returned
    hist_res = client.get("/alarms/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) == 1
    assert hist_res.json()[0]["alarm_id"] == alarm_id

