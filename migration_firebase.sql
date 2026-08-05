-- Migration: Add Firebase / Google Sign-In support
-- Run this in pgAdmin's Query Tool against alarm_app_db, AFTER the
-- Milestone 2 migration.sql has already been applied.

-- 1. Add firebase_uid column -- links a user record to their Firebase identity
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- 2. hashed_password must become nullable -- Google-only users have no password
ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;

-- Verify:
-- \d users
