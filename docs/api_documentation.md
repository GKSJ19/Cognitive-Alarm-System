# API Documentation

This document describes all the API endpoints provided by the Intelligent Cognitive Alarm System, detailing inputs, parameters, and response structures.

---

## 1. Authentication & Security Routes (`/auth`)

### Register User
* **URL:** `/auth/register`
* **Method:** `POST`
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe",
    "role": "user"  // "user", "wellness_coach", or "admin"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "id": "uuid-v4-string",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2026-08-07T12:00:00Z",
    "updated_at": "2026-08-07T12:00:00Z"
  }
  ```

### User Login
* **URL:** `/auth/login`
* **Method:** `POST`
* **Request Body (Form Data):**
  * `username` (email)
  * `password`
* **Response (200 OK):**
  ```json
  {
    "access_token": "jwt_access_token_string",
    "refresh_token": "jwt_refresh_token_string",
    "token_type": "bearer",
    "user": { ...user_response_object }
  }
  ```

---

## 2. Dashboard Router (`/dashboard`)

### Unified Summary
* **URL:** `/dashboard/summary`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):** User's personal habit score trends, challenge accuracy, recent sleep metrics, and active wellness recommendations.

### Admin Dashboard (Admin Only)
* **URL:** `/dashboard/admin`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <admin_token>`
* **Response (200 OK):**
  ```json
  {
    "total_users": 150,
    "total_alarms": 320,
    "system_avg_habit_score": 78.45,
    "system_avg_snooze_count": 1.24,
    "system_avg_wake_up_delay_seconds": 184.2,
    "system_avg_sleep_duration_hours": 7.34,
    "challenge_category_breakdown": {
      "Math Problems": 1520,
      "Memory Challenges": 940,
      "Pattern Recognition": 650
    },
    "active_users_count": 48
  }
  ```

### Coach Dashboard (Coach & Admin Only)
* **URL:** `/dashboard/coach`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <coach_token>`
* **Response (200 OK):**
  ```json
  {
    "total_clients": 2,
    "clients": [
      {
        "id": "uuid-string",
        "full_name": "John Doe",
        "email": "user@example.com",
        "is_active": true,
        "latest_score": 85.5,
        "avg_score": 79.2,
        "created_at": "2026-08-07T12:00:00Z"
      }
    ]
  }
  ```

### Coach Client Detail (Coach & Admin Only)
* **URL:** `/dashboard/coach/user/{user_id}`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <coach_token>`
* **Response (200 OK):** Returns profile attributes and detailed dashboard metrics of the selected client user.

### System Statistics
* **URL:** `/dashboard/statistics`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):** Aggregated metrics of snooze count by weekday, challenge solve speed, and adherence distribution.

---

## 3. Reports & Export System (`/reports`)

All report routes accept the following query parameters:
* `start_date` (Optional): Start range (`YYYY-MM-DD`, default: 7 days ago)
* `end_date` (Optional): End range (`YYYY-MM-DD`, default: today)
* `format` (Optional): Target export format (`json`, `pdf`, `excel`, default: `json`)

If `format` is `pdf` or `excel`, the API returns a downloadable binary file with appropriate response headers (`Content-Disposition: attachment; filename=...`).

### Habit Performance Report
* **URL:** `/reports/habit`
* **Method:** `GET`
* **Response (JSON example):**
  ```json
  {
    "report_name": "Habit Performance Report",
    "start_date": "2026-08-01",
    "end_date": "2026-08-07",
    "summary": {
      "total_tracked_days": 7,
      "average_wake_up_consistency": 85.0,
      "average_challenge_completion": 100.0,
      "average_snooze_reduction": 90.0,
      "average_sleep_adherence": 80.0,
      "average_overall_score": 88.5
    },
    "data": [
      {
        "date": "2026-08-07",
        "wake_up_consistency": 90.0,
        "challenge_completion": 100.0,
        "snooze_reduction": 95.0,
        "sleep_adherence": 85.0,
        "overall_score": 92.5
      }
    ]
  }
  ```

### Wake-up Patterns Report
* **URL:** `/reports/wake-up`
* **Method:** `GET`

### Cognitive Challenge Performance Report
* **URL:** `/reports/challenge-performance`
* **Method:** `GET`

### Productivity Report
* **URL:** `/reports/productivity`
* **Method:** `GET`

### Sleep Schedule Analytics Report
* **URL:** `/reports/sleep-analytics`
* **Method:** `GET`
