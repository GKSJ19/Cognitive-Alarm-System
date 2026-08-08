# Authentication Module Design

Phase 1 defines the authentication boundary. Phase 2 will implement the complete module.

## Responsibilities

- User registration and credential login
- JWT access tokens and refresh-token rotation
- Secure HTTP-only cookie transport for refresh tokens
- Logout and token revocation
- Forgot-password and reset-password flows
- Email verification
- OAuth provider readiness
- Role assignment integration with the Admin module

## Service Contracts

- `AuthService.register_user`
- `AuthService.authenticate_user`
- `AuthService.refresh_session`
- `AuthService.logout`
- `AuthService.request_password_reset`
- `AuthService.reset_password`
- `AuthService.verify_email`

## Security Decisions

- Passwords are hashed with bcrypt through Passlib.
- Access tokens are short-lived JWTs.
- Refresh tokens are stored hashed and rotated.
- Sensitive auth state travels through secure HTTP-only cookies.
- Auth routers delegate all business rules to services.
- Repositories own persistence queries.
