from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_reports_endpoint():
    response = client.get("/reports/1")

    assert response.status_code == 200

    data = response.json()

    assert "user_id" in data
    assert "habit" in data
    assert "challenge_performance" in data
    assert "difficulty_distribution" in data