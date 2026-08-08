# Testing Guide

Quality assurance is a critical part of the ICAP development lifecycle. The backend utilizes `pytest` to execute automated test suites.

## Prerequisites
Ensure you have installed the application with development dependencies.

```bash
cd backend
pip install -e .[dev]
```

## Running Tests

To run the full backend test suite:
```bash
pytest
```

To run tests with output verbosity:
```bash
pytest -v
```

## Milestone 1 Test Coverage
For Milestone 1, automated testing focuses heavily on the backend architecture:
- **`test_health.py`**: Verifies application liveness and CORS configurations.
- **`test_auth.py`**: Validates the JWT generation, verification, and bcrypt hashing implementation.
- **`test_users.py`**: Verifies CRUD operations for the User models and RBAC dependency execution.

*Frontend automated testing (Jest/React Testing Library) is scheduled for implementation in a future milestone.*
