def _register_and_login(client, username, email, password="Passw0rd!"):
    client.post("/auth/register", json={"username": username, "email": email, "password": password})
    return client.post("/auth/login", json={"email": email, "password": password}).json()["access_token"]


def test_me_requires_auth(client):
    r = client.get("/users/me")
    assert r.status_code == 401


def test_me_with_valid_token(client):
    token = _register_and_login(client, "erin", "erin@example.com")
    r = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "erin@example.com"
    assert r.json()["is_active"] is True


def test_update_profile(client):
    token = _register_and_login(client, "frank", "frank@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    r = client.put("/users/me", headers=headers, json={"username": "frankie"})
    assert r.status_code == 200
    assert r.json()["username"] == "frankie"


def test_update_habits(client):
    token = _register_and_login(client, "grace", "grace@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    r = client.put("/users/me/habits", headers=headers, json={
        "sleep_duration_minutes": 420,
        "difficulty_preference": "hard",
        "timezone": "Asia/Kolkata",
        "habit_preferences": {"snooze_limit": 2},
    })
    assert r.status_code == 200
    body = r.json()
    assert body["sleep_duration_minutes"] == 420
    assert body["difficulty_preference"] == "hard"
    assert body["timezone"] == "Asia/Kolkata"
    assert body["habit_preferences"]["snooze_limit"] == 2
