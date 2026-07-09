import pytest

def register_and_login(client, email, password):
    """Helper to register and login a user, returning their access token."""
    client.post(
        "/auth/register",
        json={"email": email, "password": password, "full_name": "Test User", "role": "user"}
    )
    res = client.post("/auth/login", data={"username": email, "password": password})
    return res.json()["access_token"]

def test_create_alarm_success(client):
    """Test successful creation of a repeating daily alarm with custom configurations."""
    token = register_and_login(client, "alarm_creator@example.com", "password123")
    response = client.post(
        "/alarms",
        json={
            "title": "Morning Wakeup",
            "alarm_time": "07:30:00",
            "repeat_type": "daily",
            "volume": 85,
            "vibration": True,
            "snooze_enabled": True,
            "snooze_duration": 10,
            "is_smart_adaptive": True
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Morning Wakeup"
    assert data["alarm_time"] == "07:30:00"
    assert data["repeat_type"] == "daily"
    assert data["volume"] == 85
    assert data["vibration"] is True
    assert data["snooze_enabled"] is True
    assert data["snooze_duration"] == 10
    assert data["is_smart_adaptive"] is True
    assert "id" in data
    assert "user_id" in data

def test_create_alarm_invalid_volume(client):
    """Test that setting alarm volume above 100 triggers validation error (422)."""
    token = register_and_login(client, "val_vol@example.com", "password123")
    response = client.post(
        "/alarms",
        json={"title": "Loud Alarm", "alarm_time": "08:00:00", "volume": 120},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_create_alarm_invalid_snooze(client):
    """Test that setting snooze duration below 1 minute triggers validation error (422)."""
    token = register_and_login(client, "val_snooze@example.com", "password123")
    response = client.post(
        "/alarms",
        json={"title": "Short Snooze", "alarm_time": "08:00:00", "snooze_duration": 0},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_create_alarm_custom_missing_days(client):
    """Test that choosing 'custom' repeat type without listing custom days triggers validation error (422)."""
    token = register_and_login(client, "val_custom@example.com", "password123")
    response = client.post(
        "/alarms",
        json={"title": "Custom Alarm", "alarm_time": "08:00:00", "repeat_type": "custom"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_create_alarm_custom_success(client):
    """Test successful custom repeating alarm creation with specified day names."""
    token = register_and_login(client, "val_custom_ok@example.com", "password123")
    response = client.post(
        "/alarms",
        json={
            "title": "Custom Days Alarm",
            "alarm_time": "08:00:00",
            "repeat_type": "custom",
            "custom_days": "MON,WED,FRI"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert response.json()["custom_days"] == "MON,WED,FRI"

def test_get_alarms_list(client):
    """Test that users can only retrieve lists of alarms they own."""
    token1 = register_and_login(client, "user1@example.com", "password123")
    token2 = register_and_login(client, "user2@example.com", "password123")

    # Create 2 alarms for user1
    client.post(
        "/alarms",
        json={"title": "User 1 Alarm A", "alarm_time": "06:00:00"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    client.post(
        "/alarms",
        json={"title": "User 1 Alarm B", "alarm_time": "07:00:00"},
        headers={"Authorization": f"Bearer {token1}"}
    )

    # Create 1 alarm for user2
    client.post(
        "/alarms",
        json={"title": "User 2 Alarm A", "alarm_time": "08:00:00"},
        headers={"Authorization": f"Bearer {token2}"}
    )

    # Fetch user 1 alarms
    res1 = client.get("/alarms", headers={"Authorization": f"Bearer {token1}"})
    assert res1.status_code == 200
    assert len(res1.json()) == 2
    assert {a["title"] for a in res1.json()} == {"User 1 Alarm A", "User 1 Alarm B"}

    # Fetch user 2 alarms
    res2 = client.get("/alarms", headers={"Authorization": f"Bearer {token2}"})
    assert res2.status_code == 200
    assert len(res2.json()) == 1
    assert res2.json()[0]["title"] == "User 2 Alarm A"

def test_alarm_crud_ownership_protection(client):
    """Test that users are blocked with 403 Forbidden when trying to access or manipulate alarms belonging to others."""
    token1 = register_and_login(client, "owner@example.com", "password123")
    token2 = register_and_login(client, "attacker@example.com", "password123")

    # Owner creates alarm
    create_res = client.post(
        "/alarms",
        json={"title": "My Private Alarm", "alarm_time": "09:00:00"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    alarm_id = create_res.json()["id"]

    # Attacker tries to read owner's alarm
    read_res = client.get(f"/alarms/{alarm_id}", headers={"Authorization": f"Bearer {token2}"})
    assert read_res.status_code == 403

    # Attacker tries to update owner's alarm
    update_res = client.put(
        f"/alarms/{alarm_id}",
        json={"title": "Hacked Title"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert update_res.status_code == 403

    # Attacker tries to toggle owner's alarm
    toggle_res = client.patch(f"/alarms/{alarm_id}/toggle", headers={"Authorization": f"Bearer {token2}"})
    assert toggle_res.status_code == 403

    # Attacker tries to delete owner's alarm
    delete_res = client.delete(f"/alarms/{alarm_id}", headers={"Authorization": f"Bearer {token2}"})
    assert delete_res.status_code == 403

    # Owner updates own alarm successfully
    owner_update = client.put(
        f"/alarms/{alarm_id}",
        json={"title": "My Updated Alarm", "alarm_time": "10:00:00"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert owner_update.status_code == 200
    assert owner_update.json()["title"] == "My Updated Alarm"
    assert owner_update.json()["alarm_time"] == "10:00:00"

    # Owner toggles own alarm successfully
    owner_toggle = client.patch(f"/alarms/{alarm_id}/toggle", headers={"Authorization": f"Bearer {token1}"})
    assert owner_toggle.status_code == 200
    assert owner_toggle.json()["is_active"] is False

    # Owner deletes own alarm successfully
    owner_delete = client.delete(f"/alarms/{alarm_id}", headers={"Authorization": f"Bearer {token1}"})
    assert owner_delete.status_code == 204

    # Verify deleted and not found anymore
    get_res = client.get(f"/alarms/{alarm_id}", headers={"Authorization": f"Bearer {token1}"})
    assert get_res.status_code == 404
