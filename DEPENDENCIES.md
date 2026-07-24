# Dependencies Specification — Milestone 2

## 📦 Python Dependencies (`pyproject.toml`)

### Core Framework & Server
- `fastapi` ($\ge 0.115.0$): Web framework.
- `uvicorn[standard]` ($\ge 0.30.6$): ASGI server implementation.

### Database & Drivers
- `sqlalchemy` ($\ge 2.0.35$): Async ORM.
- `asyncpg` ($\ge 0.30.0$): PostgreSQL async driver.
- `motor` ($\ge 3.6.0$): Async MongoDB driver.
- `pymongo` ($\ge 4.9.0$): MongoDB Python client.
- `alembic` ($\ge 1.13.3$): Schema migration tool.

### Authentication & Security
- `python-jose[cryptography]` ($\ge 3.3.0$): JWT token generation/validation.
- `passlib[bcrypt]` ($\ge 1.7.4$): Password hashing algorithm.
- `bcrypt` ($\ge 4.2.0$): Password hashing support.
- `pydantic` ($\ge 2.9.2$): Data validation.
- `pydantic-settings` ($\ge 2.5.2$): Environment settings parsing.

### Development & Testing
- `pytest` ($\ge 8.3.3$): Test runner.
- `pytest-asyncio` ($\ge 0.24.0$): Async test support.
- `pytest-cov` ($\ge 5.0.0$): Code coverage reporting.
- `httpx` ($\ge 0.27.2$): Async HTTP client for test calls.
- `aiosqlite` ($\ge 0.20.0$): In-memory database driver for tests.
