import pytest

@pytest.mark.asyncio
async def test_end_to_end_workflow(client):
    # 1. Register User
    res = await client.post("/api/v1/auth/register", json={
        "email": "integration@test.com",
        "password": "Password123!",
        "full_name": "Integration User"
    })
    assert res.status_code == 201 or res.status_code == 400 # 400 if already exists
    
    # 2. Login
    res = await client.post("/api/v1/auth/login", data={
        "username": "integration@test.com",
        "password": "Password123!"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Fetch Dashboard Stats (Before)
    res = await client.get("/api/v1/dashboard/stats", headers=headers)
    assert res.status_code == 200
    
    # 4. Create Alarm
    res = await client.post("/api/v1/alarms/", headers=headers, json={
        "time": "07:00:00",
        "days": "Mon,Tue",
        "active": True,
        "challenge_type": "math",
        "difficulty": "easy"
    })
    assert res.status_code == 201
    alarm_id = res.json()["data"]["id"]

    # 5. Generate Challenge
    res = await client.post("/api/v1/challenges/generate", headers=headers, json={
        "alarm_id": alarm_id
    })
    assert res.status_code == 200
    challenge = res.json()["data"]
    
    # 6. Submit Challenge
    res = await client.post("/api/v1/challenges/submit", headers=headers, json={
        "challenge_id": challenge["challenge_id"],
        "answer": "dummy_answer",
        "time_taken_seconds": 10
    })
    assert res.status_code == 200
    
    # 7. Fetch Progress Summary
    res = await client.get("/api/v1/progress/summary", headers=headers)
    assert res.status_code == 200
