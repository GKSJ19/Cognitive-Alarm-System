# Alarm & Challenge Service API Documentation

This document outlines the REST API endpoints available in the Alarm & Challenge Service for Milestone 4.

## Base URL
All endpoints are relative to: `http://localhost:8002/api/v1`
(Or `http://localhost/api/v1` if routed through the Nginx Gateway).

## Authentication
All endpoints require a Bearer token in the `Authorization` header.
Format: `Authorization: Bearer <JWT_TOKEN>`

---

## Alarm Endpoints

### 1. Get All Alarms
**Endpoint:** `GET /alarms`
**Description:** Retrieves a list of all active and inactive alarms for the authenticated user.
**Response (200 OK):**
```json
[
  {
    "id": "string",
    "user_id": "string",
    "label": "Morning Alarm",
    "time": "07:30",
    "alarm_type": "weekday",
    "days_active": [1, 2, 3, 4, 5],
    "is_active": true,
    "sound_name": "default",
    "snooze_duration": 5,
    "vibration": true,
    "snooze_enabled": true,
    "difficulty": "Medium"
  }
]
```

### 2. Create Alarm
**Endpoint:** `POST /alarms`
**Description:** Creates a new alarm for the authenticated user.
**Request Body:**
```json
{
  "label": "Morning Alarm",
  "time": "07:30",
  "alarm_type": "weekday",
  "days_active": [1, 2, 3, 4, 5],
  "is_active": true,
  "sound_name": "default",
  "snooze_duration": 5,
  "vibration": true,
  "snooze_enabled": true,
  "difficulty": "Medium"
}
```
**Response (201 Created):** Returns the created alarm object including its `id`.

### 3. Update Alarm
**Endpoint:** `PUT /alarms/{alarm_id}`
**Description:** Updates an existing alarm.
**Request Body:** (Same as Create Alarm payload, but fields are optional).
**Response (200 OK):** Returns the updated alarm object.

### 4. Delete Alarm
**Endpoint:** `DELETE /alarms/{alarm_id}`
**Description:** Deletes an alarm.
**Response (200 OK):** `{"detail": "Alarm deleted successfully"}`

---

## Challenge Endpoints

### 1. Generate Challenge
**Endpoint:** `GET /challenges/generate`
**Description:** Generates a new cognitive challenge based on the requested difficulty.
**Query Parameters:**
- `difficulty` (string): The requested difficulty level (`Easy`, `Medium`, `Hard`).
**Response (200 OK):**
```json
{
  "challenge_id": "string",
  "question": "What is 15 + 27?",
  "difficulty": "Medium",
  "type": "math"
}
```

### 2. Verify Challenge
**Endpoint:** `POST /challenges/verify`
**Description:** Submits an answer for a generated challenge to verify its correctness.
**Request Body:**
```json
{
  "challenge_id": "string",
  "answer": "42"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Challenge passed!"
}
```
