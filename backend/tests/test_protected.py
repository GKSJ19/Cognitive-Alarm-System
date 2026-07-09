from datetime import timedelta
from app.security import create_access_token

def get_token_for_user(client, email, password, full_name, role):
    """Utility helper to register a user and log them in to get an access token."""
    client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role
        }
    )
    response = client.post(
        "/auth/login",
        data={"username": email, "password": password}
    )
    return response.json()["access_token"]

def test_any_auth_user(client):
    """Test that any authenticated user can access basic protected route."""
    token = get_token_for_user(client, "user@example.com", "password", "User", "user")
    response = client.get("/protected/any-auth", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["role"] == "user"

def test_any_auth_unauthorized(client):
    """Test that access to protected route is denied without token."""
    response = client.get("/protected/any-auth")
    assert response.status_code == 401

def test_coach_only_by_coach(client):
    """Test that wellness coach can access coach protected route."""
    token = get_token_for_user(client, "coach@example.com", "password", "Coach", "wellness_coach")
    response = client.get("/protected/coach-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["role"] == "wellness_coach"

def test_coach_only_by_admin(client):
    """Test that administrator can access coach protected route."""
    token = get_token_for_user(client, "admin@example.com", "password", "Admin", "admin")
    response = client.get("/protected/coach-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_coach_only_by_user(client):
    """Test that basic user is forbidden from coach protected route."""
    token = get_token_for_user(client, "user@example.com", "password", "User", "user")
    response = client.get("/protected/coach-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

def test_admin_only_by_admin(client):
    """Test that administrator can access admin restricted route."""
    token = get_token_for_user(client, "admin@example.com", "password", "Admin", "admin")
    response = client.get("/protected/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_admin_only_by_coach(client):
    """Test that wellness coach is forbidden from admin restricted route."""
    token = get_token_for_user(client, "coach@example.com", "password", "Coach", "wellness_coach")
    response = client.get("/protected/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

def test_invalid_token(client):
    """Test that tampered/invalid token format is rejected with 401."""
    response = client.get("/protected/any-auth", headers={"Authorization": "Bearer invalid_token_xyz"})
    assert response.status_code == 401

def test_expired_token(client):
    """Test that expired token is rejected with 401."""
    # Register user first to ensure they exist
    reg_response = client.post(
        "/auth/register",
        json={
            "email": "exp@example.com",
            "password": "password",
            "full_name": "Expired User",
            "role": "user"
        }
    )
    user_id = reg_response.json()["id"]
    
    # Generate token that expired 5 minutes ago
    expired_token = create_access_token(
        data={"sub": user_id, "role": "user"},
        expires_delta=timedelta(minutes=-5)
    )
    
    response = client.get("/protected/any-auth", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401
