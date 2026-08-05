from app.models import User, UserRole


def _register(client, username, email, password="Passw0rd!"):
    return client.post("/auth/register", json={"username": username, "email": email, "password": password})


def _login(client, email, password="Passw0rd!"):
    return client.post("/auth/login", json={"email": email, "password": password})


# ---------- Account lockout ----------

def test_account_locks_after_max_failed_attempts(client):
    _register(client, "locktest", "locktest@example.com", "CorrectPass1")

    # MAX_FAILED_LOGIN_ATTEMPTS defaults to 5 -- fail 5 times
    for _ in range(5):
        r = client.post("/auth/login", json={"email": "locktest@example.com", "password": "wrong"})
        assert r.status_code == 401

    # 6th attempt, even with the CORRECT password, should now be locked out
    r = client.post("/auth/login", json={"email": "locktest@example.com", "password": "CorrectPass1"})
    assert r.status_code == 403
    assert "locked" in r.json()["detail"].lower()


def test_successful_login_resets_failed_attempt_counter(client, db_session_factory):
    _register(client, "resettest", "resettest@example.com", "CorrectPass1")

    # Fail twice, then succeed
    client.post("/auth/login", json={"email": "resettest@example.com", "password": "wrong"})
    client.post("/auth/login", json={"email": "resettest@example.com", "password": "wrong"})
    r = client.post("/auth/login", json={"email": "resettest@example.com", "password": "CorrectPass1"})
    assert r.status_code == 200

    db = db_session_factory()
    user = db.query(User).filter(User.email == "resettest@example.com").first()
    assert user.failed_login_attempts == 0
    db.close()


# ---------- Password reset ----------

def test_password_reset_full_flow(client):
    _register(client, "resetflow", "resetflow@example.com", "OldPassword1")

    # Request a reset -- dev mode returns the token directly
    r = client.post("/auth/password-reset/request", json={"email": "resetflow@example.com"})
    assert r.status_code == 202
    reset_token = r.json()["dev_reset_token"]

    # Confirm with the new password
    r2 = client.post("/auth/password-reset/confirm", json={
        "reset_token": reset_token, "new_password": "NewPassword1",
    })
    assert r2.status_code == 200

    # Old password no longer works
    r3 = _login(client, "resetflow@example.com", "OldPassword1")
    assert r3.status_code == 401

    # New password works
    r4 = _login(client, "resetflow@example.com", "NewPassword1")
    assert r4.status_code == 200


def test_password_reset_token_is_single_use(client):
    _register(client, "singleuse", "singleuse@example.com", "OldPassword1")
    reset_token = client.post(
        "/auth/password-reset/request", json={"email": "singleuse@example.com"}
    ).json()["dev_reset_token"]

    r1 = client.post("/auth/password-reset/confirm", json={
        "reset_token": reset_token, "new_password": "NewPassword1",
    })
    assert r1.status_code == 200

    # Reusing the same token should fail
    r2 = client.post("/auth/password-reset/confirm", json={
        "reset_token": reset_token, "new_password": "AnotherPassword1",
    })
    assert r2.status_code == 400


def test_password_reset_request_does_not_leak_account_existence(client):
    r = client.post("/auth/password-reset/request", json={"email": "doesnotexist@example.com"})
    assert r.status_code == 202
    assert "dev_reset_token" not in r.json()  # no token generated for a non-existent account


# ---------- Audit logs ----------

def test_audit_logs_require_admin(client):
    _register(client, "notadmin", "notadmin@example.com")
    login = _login(client, "notadmin@example.com").json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    r = client.get("/admin/audit-logs", headers=headers)
    assert r.status_code == 403


def test_audit_logs_record_login_events(client, db_session_factory):
    _register(client, "auditme", "auditme@example.com", "CorrectPass1")
    client.post("/auth/login", json={"email": "auditme@example.com", "password": "wrong"})
    client.post("/auth/login", json={"email": "auditme@example.com", "password": "CorrectPass1"})

    db = db_session_factory()
    user = db.query(User).filter(User.email == "auditme@example.com").first()
    user.role = UserRole.admin
    db.commit()
    db.close()

    fresh_login = _login(client, "auditme@example.com", "CorrectPass1").json()
    headers = {"Authorization": f"Bearer {fresh_login['access_token']}"}

    r = client.get("/admin/audit-logs", headers=headers)
    assert r.status_code == 200
    actions = [entry["action"] for entry in r.json()]
    assert "login_failed" in actions
    assert "login_success" in actions
