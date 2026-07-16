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


def test_google_login_new_user(client):
    """Test that Google login registers a new user correctly."""
    response = client.post(
        "/auth/google",
        json={
            "id_token": "mock_google_user1",
            "email": "google1@example.com",
            "full_name": "Google User One"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "google1@example.com"
    assert data["user"]["full_name"] == "Google User One"
    assert data["user"]["role"] == "user"


def test_google_login_existing_user(client):
    """Test that Google login links to an existing user with matching email."""
    # Register email user first
    client.post(
        "/auth/register",
        json={
            "email": "shared@example.com",
            "password": "password123",
            "full_name": "Shared User",
            "role": "user"
        }
    )
    # Login via Google with same email
    response = client.post(
        "/auth/google",
        json={
            "id_token": "mock_google_shared",
            "email": "shared@example.com",
            "full_name": "Different Name"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "shared@example.com"
    assert data["user"]["full_name"] == "Shared User"  # keeps original full name


def test_apple_login_new_user(client):
    """Test that Apple login registers a new user correctly."""
    response = client.post(
        "/auth/apple",
        json={
            "id_token": "mock_apple_user1",
            "email": "apple1@example.com",
            "full_name": "Apple User One"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "apple1@example.com"
    assert data["user"]["full_name"] == "Apple User One"


def test_apple_login_existing_user(client):
    """Test that Apple login links to an existing user with matching email."""
    client.post(
        "/auth/register",
        json={
            "email": "shared_apple@example.com",
            "password": "password123",
            "full_name": "Shared Apple User",
            "role": "user"
        }
    )
    response = client.post(
        "/auth/apple",
        json={
            "id_token": "mock_apple_shared",
            "email": "shared_apple@example.com",
            "full_name": "Different Name"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "shared_apple@example.com"
    assert data["user"]["full_name"] == "Shared Apple User"


def test_forgot_password_success(client):
    """Test requesting a password reset token for an existing user email."""
    # Register user first
    client.post(
        "/auth/register",
        json={
            "email": "reset_me@example.com",
            "password": "password123",
            "full_name": "Reset User",
            "role": "user"
        }
    )
    response = client.post(
        "/auth/forgot-password",
        json={"email": "reset_me@example.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Password reset instructions sent" in data["message"]
    assert "Demo token:" in data["message"]


def test_forgot_password_nonexistent_email(client):
    """Test requesting password reset for email not registered."""
    response = client.post(
        "/auth/forgot-password",
        json={"email": "notfound@example.com"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "No user registered with this email address"


def test_reset_password_success(client):
    """Test resetting password successfully using a valid token."""
    # Register user first
    client.post(
        "/auth/register",
        json={
            "email": "reset_me@example.com",
            "password": "oldpassword123",
            "full_name": "Reset User",
            "role": "user"
        }
    )
    # Request token
    forgot_resp = client.post(
        "/auth/forgot-password",
        json={"email": "reset_me@example.com"}
    )
    msg = forgot_resp.json()["message"]
    # Extract token
    token = msg.split("Demo token: ")[1].rstrip(")")
    
    # Perform password reset
    reset_resp = client.post(
        "/auth/reset-password",
        json={
            "token": token,
            "new_password": "newsecurepassword123"
        }
    )
    assert reset_resp.status_code == 200
    assert reset_resp.json()["message"] == "Password reset successful"

    # Verify that old login fails and new login succeeds
    login_fail = client.post(
        "/auth/login",
        data={"username": "reset_me@example.com", "password": "oldpassword123"}
    )
    assert login_fail.status_code == 401
    
    login_success = client.post(
        "/auth/login",
        data={"username": "reset_me@example.com", "password": "newsecurepassword123"}
    )
    assert login_success.status_code == 200
    assert "access_token" in login_success.json()


def test_reset_password_invalid_token(client):
    """Test that password reset rejects invalid/expired tokens."""
    response = client.post(
        "/auth/reset-password",
        json={
            "token": "invalid_token_here",
            "new_password": "newsecurepassword123"
        }
    )
    assert response.status_code == 400
    assert "Invalid or expired reset token" in response.json()["detail"]

