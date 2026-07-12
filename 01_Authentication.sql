CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "email" varchar UNIQUE,
  "password_hash" varchar,
  "auth_provider" varchar,
  "google_id" varchar,
  "role" varchar,
  "goal_type" varchar,
  "preferred_wake_time" time,
  "sleep_duration_mins" int,
  "timezone" varchar,
  "difficulty_pref" varchar,
  "is_active" boolean,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "password_reset_tokens" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "token" varchar,
  "expires_at" timestamp,
  "used" boolean,
  "created_at" timestamp
);

CREATE TABLE "coach_assignments" (
  "id" uuid PRIMARY KEY,
  "coach_id" uuid,
  "user_id" uuid,
  "assigned_at" timestamp
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY,
  "admin_id" uuid,
  "target_user_id" uuid,
  "action" varchar,
  "details" text,
  "created_at" timestamp
);

CREATE TABLE "platform_settings" (
  "id" uuid PRIMARY KEY,
  "key" varchar,
  "value" text,
  "value_type" varchar,
  "description" text,
  "updated_by" uuid,
  "updated_at" timestamp
);

ALTER TABLE "password_reset_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "coach_assignments" ADD FOREIGN KEY ("coach_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "coach_assignments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("admin_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "platform_settings" ADD FOREIGN KEY ("updated_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
