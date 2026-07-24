def test_register_and_login(client):
    r = client.post("/auth/register", json={
        "username": "alice", "email": "alice@example.com", "password": "Passw0rd!",
    })
    assert r.status_code == 201

    r = client.post("/auth/login", json={"email": "alice@example.com", "password": "Passw0rd!"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_register_duplicate_email_rejected(client):
    client.post("/auth/register", json={
        "username": "dup1", "email": "dup@example.com", "password": "Passw0rd!",
    })
    r = client.post("/auth/register", json={
        "username": "dup2", "email": "dup@example.com", "password": "Passw0rd!",
    })
    assert r.status_code == 400


def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "username": "bob", "email": "bob@example.com", "password": "Passw0rd!",
    })
    r = client.post("/auth/login", json={"email": "bob@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_refresh_flow_rotates_token(client):
    client.post("/auth/register", json={
        "username": "carol", "email": "carol@example.com", "password": "Passw0rd!",
    })
    login = client.post("/auth/login", json={
        "email": "carol@example.com", "password": "Passw0rd!",
    }).json()

    r = client.post("/auth/refresh", json={"refresh_token": login["refresh_token"]})
    assert r.status_code == 200
    new_tokens = r.json()
    assert new_tokens["access_token"] != login["access_token"]

    # The old refresh token should now be revoked (rotated) -- reusing it must fail.
    r2 = client.post("/auth/refresh", json={"refresh_token": login["refresh_token"]})
    assert r2.status_code == 401


def test_logout_revokes_refresh_token(client):
    client.post("/auth/register", json={
        "username": "dave", "email": "dave@example.com", "password": "Passw0rd!",
    })
    login = client.post("/auth/login", json={
        "email": "dave@example.com", "password": "Passw0rd!",
    }).json()

    headers = {"Authorization": f"Bearer {login['access_token']}"}
    r = client.post("/auth/logout", json={"refresh_token": login["refresh_token"]}, headers=headers)
    assert r.status_code == 204

    r2 = client.post("/auth/refresh", json={"refresh_token": login["refresh_token"]})
    assert r2.status_code == 401
