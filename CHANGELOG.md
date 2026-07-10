# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Milestone 1 Release
### Added
- **Backend:** Initialize FastAPI project structure using modern `pyproject.toml`.
- **Backend:** SQLAlchemy 2.x async integration with `aiosqlite`.
- **Backend:** Database models for User, Role, UserProfile, and RefreshToken.
- **Backend:** Comprehensive JWT authentication and bcrypt password hashing.
- **Backend:** RBAC Middleware enforcing access roles.
- **Backend:** Global exception handling and request logging.
- **Backend:** Startup script to auto-seed database with default users and roles.
- **Frontend:** Initialize React 19 project using Vite and TypeScript.
- **Frontend:** Tailwind CSS configuration for dark-mode UI.
- **Frontend:** Intercepting Axios `apiClient` for seamless JWT handling.
- **Frontend:** `AuthContext` for global session management.
- **Frontend:** Login and Registration pages with animated UI.
- **Frontend:** Protected `AppLayout` with sidebar navigation.
- **Frontend:** Interactive `DashboardPage` utilizing Recharts and dummy data.
- **Documentation:** Complete Milestone 1 documentation package.

### Changed
- N/A - Initial Release.

### Fixed
- N/A - Initial Release.
