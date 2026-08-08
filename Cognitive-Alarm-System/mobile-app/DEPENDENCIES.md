# Dependencies

This document outlines the core third-party dependencies utilized in Milestone 1 to build the platform.

## Backend Dependencies
Defined in `pyproject.toml`.

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | >=0.115.0 | High-performance async web framework for building APIs. |
| `uvicorn` | >=0.30.6 | ASGI web server implementation. |
| `sqlalchemy` | >=2.0.35 | Modern Python SQL toolkit and Object Relational Mapper. |
| `aiosqlite` | >=0.20.0 | Async IO driver for SQLite database. |
| `alembic` | >=1.13.3 | Database migration tool for SQLAlchemy. |
| `pydantic` | >=2.9.2 | Data validation and settings management. |
| `python-jose` | >=3.3.0 | JSON Web Token implementation for Python. |
| `passlib[bcrypt]` | >=1.7.4 | Password hashing toolkit. |

## Frontend Dependencies
Defined in `package.json`.

| Package | Purpose |
|---------|---------|
| `react` (v19) | Core UI library. |
| `react-router-dom` | Declarative routing for Single Page Applications. |
| `axios` | Promise-based HTTP client for the browser. |
| `tailwindcss` | Utility-first CSS framework for rapid UI development. |
| `recharts` | Composable charting library built on React components. |
| `framer-motion` | Production-ready motion library for React animations. |
| `lucide-react` | Beautiful and consistent icon toolkit. |
| `clsx` & `tailwind-merge` | Utility tools for merging and constructing dynamic CSS class names without style conflicts. |
