-- Migration: Milestone 3 (Account Lockout, Password Reset, Audit Logging)
-- Run in pgAdmin's Query Tool against alarm_app_db, after migration.sql
-- and migration_firebase.sql have already been applied.

-- 1. Account lockout fields on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- 2. password_reset_tokens and audit_logs tables are brand new -- these
--    will be created automatically by create_all() the next time the
--    server starts. Included here for reference only:
--
-- CREATE TABLE password_reset_tokens (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id),
--     token VARCHAR(255) UNIQUE NOT NULL,
--     expires_at TIMESTAMPTZ NOT NULL,
--     used BOOLEAN NOT NULL DEFAULT FALSE,
--     created_at TIMESTAMPTZ DEFAULT now()
-- );
--
-- CREATE TABLE audit_logs (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER REFERENCES users(id),
--     action VARCHAR(50) NOT NULL,
--     detail TEXT,
--     ip_address VARCHAR(64),
--     created_at TIMESTAMPTZ DEFAULT now()
-- );

-- 3. Performance indexes on frequently queried columns (per Milestone 3 plan)
-- IMPORTANT: run steps 1-2 first, then START THE SERVER ONCE (so create_all()
-- creates the new audit_logs / password_reset_tokens tables), THEN come back
-- and run this section 3 separately -- these CREATE INDEX statements will
-- fail if the tables don't exist yet.
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_action_created ON audit_logs(action, created_at);

-- Verify:
-- \d users
-- \d audit_logs
-- \d password_reset_tokens
