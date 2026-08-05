from unittest.mock import patch


def test_google_signin_rejects_invalid_token(client):
    """
    With Firebase configured (as it is in this environment), a fake/invalid
    token should be rejected with 401, not crash the server.
    """
    r = client.post("/auth/google", json={"firebase_id_token": "fake-token"})
    assert r.status_code == 401


def test_google_signin_creates_new_user(client):
    """
    Mocks Firebase's verification step (since we can't call Google's real
    servers in a test) to confirm the find-or-create + token-issuing logic
    works correctly once a token IS successfully verified.
    """
    fake_decoded_token = {"uid": "firebase-uid-123", "email": "newgoogleuser@example.com"}

    with patch("app.routes.auth_routes.verify_firebase_token", return_value=fake_decoded_token):
        r = client.post("/auth/google", json={"firebase_id_token": "fake-but-valid-looking-token"})

    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data

    # Calling it again with the same uid should log in the SAME user, not
    # create a second one.
    with patch("app.routes.auth_routes.verify_firebase_token", return_value=fake_decoded_token):
        r2 = client.post("/auth/google", json={"firebase_id_token": "fake-but-valid-looking-token"})
    assert r2.status_code == 200

    headers = {"Authorization": f"Bearer {r2.json()['access_token']}"}
    me = client.get("/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "newgoogleuser@example.com"


def test_google_signin_links_existing_email_account(client):
    """
    If a user already registered with email/password, a later Google
    Sign-In with the SAME email should link to that existing account,
    not create a duplicate.
    """
    client.post("/auth/register", json={
        "username": "existinguser", "email": "linked@example.com", "password": "Passw0rd!",
    })

    fake_decoded_token = {"uid": "firebase-uid-456", "email": "linked@example.com"}
    with patch("app.routes.auth_routes.verify_firebase_token", return_value=fake_decoded_token):
        r = client.post("/auth/google", json={"firebase_id_token": "fake-token"})

    assert r.status_code == 200
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    me = client.get("/users/me", headers=headers)
    assert me.json()["username"] == "existinguser"  # linked to the ORIGINAL account
