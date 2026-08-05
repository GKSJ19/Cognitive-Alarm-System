"""
Basic security test pass, per the Milestone 3 evaluation criteria:
token expiry behavior, SQL-injection checks, input sanitization, and
permission-boundary tests.
"""

from datetime import timedelta
from app.auth import create_access_token


def _register_and_login(client, username, email, password="Passw0rd!"):
    client.post("/auth/register", json={"username": username, "email": email, "password": password})
    return client.post("/auth/login", json={"email": email, "password": password}).json()


# ---------- SQL injection ----------

def test_login_is_not_vulnerable_to_sql_injection(client):
    """
    SQLAlchemy's query builder parameterizes all values automatically, so
    a classic injection payload should just be treated as a literal string
    that doesn't match any real user -- not cause a crash or bypass auth.
    """
    payload = {"email": "' OR '1'='1", "password": "' OR '1'='1"}
    r = client.post("/auth/login", json=payload)
    assert r.status_code in (401, 422)  # rejected as invalid creds/format, never a 500 or a bypass


def test_register_username_with_special_characters_is_handled_safely(client):
    r = client.post("/auth/register", json={
        "username": "robert'); DROP TABLE users;--",
        "email": "sqltest@example.com",
        "password": "Passw0rd!",
    })
    # Should either succeed (treated as a literal, weird-but-valid username)
    # or be cleanly rejected -- never crash the server.
    assert r.status_code in (201, 400, 422)

    # Confirm the users table is still intact regardless of outcome above
    r2 = client.post("/auth/login", json={"email": "sqltest@example.com", "password": "Passw0rd!"})
    assert r2.status_code in (200, 401)


# ---------- Token expiry ----------

def test_expired_access_token_is_rejected(client):
    _register_and_login(client, "expiretest", "expiretest@example.com")

    # Manually mint a token that's already expired
    expired_token = create_access_token(
        data={"user_id": 1, "role": "user"}, expires_delta=timedelta(seconds=-10)
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 401


def test_malformed_token_is_rejected(client):
    headers = {"Authorization": "Bearer not.a.real.token"}
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 401


def test_token_with_wrong_type_claim_is_rejected(client):
    """
    A refresh token should never work as an access token, even if someone
    tries to pass one in the Authorization header directly.
    """
    from app.auth import generate_refresh_token
    fake_refresh, _ = generate_refresh_token()
    headers = {"Authorization": f"Bearer {fake_refresh}"}
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 401  # not a valid JWT at all, since it's an opaque string


# ---------- Input sanitization ----------

def test_registration_rejects_invalid_email_format(client):
    r = client.post("/auth/register", json={
        "username": "bademail", "email": "not-an-email", "password": "Passw0rd!",
    })
    assert r.status_code == 422  # Pydantic's EmailStr validation catches this


def test_registration_rejects_missing_fields(client):
    r = client.post("/auth/register", json={"email": "incomplete@example.com"})
    assert r.status_code == 422


# ---------- Permission boundaries ----------

def test_user_cannot_escalate_own_role_via_profile_update(client):
    """
    /users/me only accepts username/email updates -- there's no way to
    pass a role field through this endpoint, even if a malicious client
    tries to include one in the request body.
    """
    login = _register_and_login(client, "escalatetest", "escalate@example.com")
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    r = client.put("/users/me", headers=headers, json={
        "username": "stillescalate", "role": "admin",  # extra field, should be ignored
    })
    assert r.status_code == 200
    assert r.json()["role"] == "user"  # unchanged despite the attempted injection


def test_user_cannot_access_other_users_data_via_admin_routes(client):
    login = _register_and_login(client, "boundarytest", "boundary@example.com")
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    r = client.get("/admin/users", headers=headers)
    assert r.status_code == 403

    r2 = client.patch("/admin/users/1/role", headers=headers, json={"role": "admin"})
    assert r2.status_code == 403
