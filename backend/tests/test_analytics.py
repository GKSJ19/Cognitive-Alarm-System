from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_analytics_endpoint():
    response = client.get("/analytics/1")

    assert response.status_code == 200

    data = response.json()

    assert "user_id" in data
    assert "total_challenges" in data
    assert "successful_challenges" in data
    assert "success_rate" in data
    assert "average_score" in data
    assert "habit_score" in data
    assert "habit_grade" in data