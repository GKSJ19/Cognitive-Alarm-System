-- Migration for Milestone 2 (Profile Expansion, Access Hardening & Admin APIs)
-- Run this in pgAdmin's Query Tool against your existing alarm_app_db database.
--
-- WHY THIS IS NEEDED: your `users` table already exists from Milestone 1.
-- SQLAlchemy's Base.metadata.create_all() only creates tables that don't
-- exist yet -- it will NOT add new columns to a table that's already there.
-- So we add the new columns manually with ALTER TABLE.

-- 1. Add the new role value ('wellness_coach') to the existing role enum type.
--    (The enum type is named after the Python class, lowercased: "userrole")
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'wellness_coach';

-- 2. Add is_active (for admin activate/deactivate)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Add habit / wake-up profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_wake_up_time TIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sleep_duration_minutes INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS difficulty_preference VARCHAR(20) DEFAULT 'medium';
ALTER TABLE users ADD COLUMN IF NOT EXISTS productivity_goals TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS habit_preferences JSON;

-- 4. The refresh_tokens table is brand new, so create_all() WILL create it
--    automatically the first time you run the server -- no manual SQL needed
--    for this one. Included here for reference only:
--
-- CREATE TABLE refresh_tokens (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id),
--     token VARCHAR(255) UNIQUE NOT NULL,
--     expires_at TIMESTAMPTZ NOT NULL,
--     revoked BOOLEAN NOT NULL DEFAULT FALSE,
--     created_at TIMESTAMPTZ DEFAULT now()
-- );

-- Verify the changes:
-- \d users
-- \d refresh_tokens
