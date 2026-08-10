import pytest
from tests.test_protected import get_token_for_user

def test_habit_report_json(client):
    token = get_token_for_user(client, "user_rep@example.com", "password", "Report User", "user")
    response = client.get(
        "/reports/habit?format=json",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["report_name"] == "Habit Performance Report"
    assert "summary" in res_data
    assert "data" in res_data

def test_habit_report_excel(client):
    token = get_token_for_user(client, "user_rep@example.com", "password", "Report User", "user")
    response = client.get(
        "/reports/habit?format=excel",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "content-disposition" in response.headers
    assert response.content is not None

def test_habit_report_pdf(client):
    token = get_token_for_user(client, "user_rep@example.com", "password", "Report User", "user")
    response = client.get(
        "/reports/habit?format=pdf",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "content-disposition" in response.headers
    assert response.content is not None

def test_other_reports(client):
    token = get_token_for_user(client, "user_rep@example.com", "password", "Report User", "user")
    
    # Wake up report
    response = client.get("/reports/wake-up?format=json", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["report_name"] == "Wake-up Patterns & Consistency Report"
    
    # Challenge report
    response = client.get("/reports/challenge-performance?format=json", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["report_name"] == "Cognitive Challenge Performance Report"
    
    # Productivity report
    response = client.get("/reports/productivity?format=json", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["report_name"] == "Productivity & Morning Routine Efficiency Report"
    
    # Sleep report
    response = client.get("/reports/sleep-analytics?format=json", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["report_name"] == "Sleep Schedule Analytics Report"

def test_reports_invalid_format(client):
    token = get_token_for_user(client, "user_rep@example.com", "password", "Report User", "user")
    response = client.get(
        "/reports/habit?format=invalid",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "Invalid format" in response.json()["detail"]

def test_reports_invalid_dates(client):
    token = get_token_for_user(client, "user_rep@example.com", "password", "Report User", "user")
    response = client.get(
        "/reports/habit?start_date=2026-08-10&end_date=2026-08-01",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "end_date cannot be earlier" in response.json()["detail"]
