import pytest
from tests.test_protected import get_token_for_user

def test_dashboard_admin_access(client):
    # Admin can access
    admin_token = get_token_for_user(client, "admin@example.com", "password", "Admin", "admin")
    response = client.get("/dashboard/admin", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    
    # Coach cannot access
    coach_token = get_token_for_user(client, "coach@example.com", "password", "Coach", "wellness_coach")
    response = client.get("/dashboard/admin", headers={"Authorization": f"Bearer {coach_token}"})
    assert response.status_code == 403
    
    # User cannot access
    user_token = get_token_for_user(client, "user@example.com", "password", "User", "user")
    response = client.get("/dashboard/admin", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403

def test_dashboard_coach_access(client):
    # Coach can access
    coach_token = get_token_for_user(client, "coach@example.com", "password", "Coach", "wellness_coach")
    response = client.get("/dashboard/coach", headers={"Authorization": f"Bearer {coach_token}"})
    assert response.status_code == 200
    
    # Admin can access
    admin_token = get_token_for_user(client, "admin@example.com", "password", "Admin", "admin")
    response = client.get("/dashboard/coach", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    
    # User cannot access
    user_token = get_token_for_user(client, "user@example.com", "password", "User", "user")
    response = client.get("/dashboard/coach", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403

def test_dashboard_coach_user_detail_access(client):
    # Create a user to get their UUID
    reg_response = client.post(
        "/auth/register",
        json={
            "email": "client@example.com",
            "password": "password",
            "full_name": "Client User",
            "role": "user"
        }
    )
    user_id = reg_response.json()["id"]
    
    # Coach can access client details
    coach_token = get_token_for_user(client, "coach2@example.com", "password", "Coach2", "wellness_coach")
    response = client.get(f"/dashboard/coach/user/{user_id}", headers={"Authorization": f"Bearer {coach_token}"})
    assert response.status_code == 200
    assert response.json()["user_id"] == user_id
    
    # Admin can access client details
    admin_token = get_token_for_user(client, "admin2@example.com", "password", "Admin2", "admin")
    response = client.get(f"/dashboard/coach/user/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert response.json()["user_id"] == user_id
    
    # Basic user cannot access client details
    user_token = get_token_for_user(client, "user2@example.com", "password", "User2", "user")
    response = client.get(f"/dashboard/coach/user/{user_id}", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403
