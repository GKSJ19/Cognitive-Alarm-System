from app.models import User, UserRole


def _register_and_login(client, username, email, password="Passw0rd!"):
    client.post("/auth/register", json={"username": username, "email": email, "password": password})
    return client.post("/auth/login", json={"email": email, "password": password}).json()


def _promote_to_admin(db_session_factory, email):
    db = db_session_factory()
    user = db.query(User).filter(User.email == email).first()
    user.role = UserRole.admin
    db.commit()
    db.close()


def test_admin_routes_blocked_for_normal_user(client):
    login = _register_and_login(client, "greg", "greg@example.com")
    headers = {"Authorization": f"Bearer {login['access_token']}"}
    r = client.get("/admin/users", headers=headers)
    assert r.status_code == 403


def test_admin_routes_require_auth(client):
    r = client.get("/admin/users")
    assert r.status_code == 401


def test_admin_can_list_and_manage_users(client, db_session_factory):
    _register_and_login(client, "helen", "helen@example.com")
    _promote_to_admin(db_session_factory, "helen@example.com")

    # Role is baked into the JWT at login -- must log in again after promotion.
    fresh_login = client.post("/auth/login", json={
        "email": "helen@example.com", "password": "Passw0rd!",
    }).json()
    headers = {"Authorization": f"Bearer {fresh_login['access_token']}"}

    r = client.get("/admin/users", headers=headers)
    assert r.status_code == 200
    users = r.json()
    assert isinstance(users, list)
    assert len(users) >= 1

    target_id = users[0]["id"]

    r2 = client.patch(f"/admin/users/{target_id}/status", headers=headers, json={"is_active": False})
    assert r2.status_code == 200
    assert r2.json()["is_active"] is False

    r3 = client.patch(f"/admin/users/{target_id}/role", headers=headers, json={"role": "wellness_coach"})
    assert r3.status_code == 200
    assert r3.json()["role"] == "wellness_coach"
