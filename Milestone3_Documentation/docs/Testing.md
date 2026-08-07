# Testing & Validation

---

## 1. Unit Testing
Individual components (Engines) were tested in isolation using `pytest`.

| Test ID | Module | Scenario | Expected Result | Status |
|---------|--------|----------|-----------------|--------|
| TC01 | AdaptiveEngine | Success Rate 90%, Level Easy | New Level: Medium | PASS |
| TC02 | AdaptiveEngine | Success Rate 40%, Level Hard | New Level: Medium | PASS |
| TC03 | ScoringEngine | 0 Snoozes, 8 hours sleep | Score > 90 (Excellent) | PASS |
| TC04 | ScoringEngine | 5 Snoozes, 4 hours sleep | Score < 60 (Needs Imp) | PASS |
| TC05 | AnalyticsEngine| Sleep 6.0 hours | `is_sleep_deprived`: True | PASS |

---

## 2. API Integration Testing
FastAPI's `TestClient` was utilized to test the integration of the routes, verifying HTTP status codes (200 OK, 404 Not Found) and Pydantic schema validation. 
- Calling `/api/dashboard?user_id=invalid` successfully returns a `404 Not Found` handled seamlessly by the web framework.
