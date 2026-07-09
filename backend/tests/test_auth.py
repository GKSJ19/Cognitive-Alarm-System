def test_register_user_success(client):
    """Test successful user registration."""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword",
            "full_name": "Test User",
            "role": "user"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert data["role"] == "user"
    assert "id" in data
    assert "password_hash" not in data  # password hash should not leak in output

def test_register_user_duplicate_email(client):
    """Test that duplicate email registration is rejected with 400 Bad Request."""
    client.post(
        "/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password123",
            "full_name": "First User",
            "role": "user"
        }
    )
    response = client.post(
        "/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password456",
            "full_name": "Second User",
            "role": "user"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_register_user_invalid_role(client):
    """Test that registering with an unrecognized role triggers a Pydantic validation error (422)."""
    response = client.post(
        "/auth/register",
        json={
            "email": "invalid_role@example.com",
            "password": "password123",
            "full_name": "Invalid Role User",
            "role": "superadmin"  # invalid role
        }
    )
    assert response.status_code == 422

def test_register_user_short_password(client):
    """Test that registering with a short password triggers a Pydantic validation error (422)."""
    response = client.post(
        "/auth/register",
        json={
            "email": "short_pwd@example.com",
            "password": "123",  # too short
            "full_name": "Short Pwd User",
            "role": "user"
        }
    )
    assert response.status_code == 422

def test_login_success(client):
    """Test successful user login and access token retrieval."""
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "correctpassword",
            "full_name": "Login User",
            "role": "user"
        }
    )
    # OAuth2 login endpoint accepts form data (username, password)
    response = client.post(
        "/auth/login",
        data={
            "username": "login@example.com",
            "password": "correctpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    """Test that login attempts with incorrect credentials fail with 401 Unauthorized."""
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "correctpassword",
            "full_name": "Login User",
            "role": "user"
        }
    )
    # Incorrect password
    response = client.post(
        "/auth/login",
        data={
            "username": "login@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

    # Incorrect email
    response = client.post(
        "/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "correctpassword"
        }
    )
    assert response.status_code == 401

def test_get_current_user_success(client):
    """Test fetching current logged in user details using a valid access token."""
    client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "password": "correctpassword",
            "full_name": "Me User",
            "role": "user"
        }
    )
    login_response = client.post(
        "/auth/login",
        data={
            "username": "me@example.com",
            "password": "correctpassword"
        }
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["full_name"] == "Me User"

def test_get_current_user_unauthorized(client):
    """Test that fetching current user details fails without a token."""
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_logout_success(client):
    """Test standard logout endpoint handles validation properly."""
    client.post(
        "/auth/register",
        json={
            "email": "logout@example.com",
            "password": "correctpassword",
            "full_name": "Logout User",
            "role": "user"
        }
    )
    login_response = client.post(
        "/auth/login",
        data={
            "username": "logout@example.com",
            "password": "correctpassword"
        }
    )
    token = login_response.json()["access_token"]

    response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "detail" in response.json()
