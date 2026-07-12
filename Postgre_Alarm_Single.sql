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

CREATE TABLE "alarms" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "time" time,
  "alarm_type" varchar,
  "days_of_week" varchar,
  "is_active" boolean,
  "label" varchar,
  "created_at" timestamp
);

CREATE TABLE "alarm_triggers" (
  "id" uuid PRIMARY KEY,
  "alarm_id" uuid,
  "user_id" uuid,
  "triggered_at" timestamp,
  "dismissed_at" timestamp,
  "verification_status" varchar,
  "snooze_count" int,
  "total_attempts" int
);

CREATE TABLE "challenges" (
  "id" uuid PRIMARY KEY,
  "type" varchar,
  "goal_type" varchar,
  "difficulty" varchar,
  "question" text,
  "correct_answer" text,
  "source" varchar,
  "embedding_ref" varchar,
  "created_at" timestamp
);

CREATE TABLE "challenge_attempts" (
  "id" uuid PRIMARY KEY,
  "alarm_trigger_id" uuid,
  "challenge_id" uuid,
  "attempt_number" int,
  "is_correct" boolean,
  "time_taken_seconds" int,
  "answered_at" timestamp
);

CREATE TABLE "sleep_logs" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "date" date,
  "sleep_start" timestamp,
  "sleep_end" timestamp,
  "duration_mins" int,
  "source" varchar
);

CREATE TABLE "goal_metrics" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "date" date,
  "goal_type" varchar,
  "metric_label" varchar,
  "metric_value" decimal
);

CREATE TABLE "habit_scores" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "date" date,
  "wake_consistency_score" decimal,
  "challenge_success_score" decimal,
  "snooze_reduction_score" decimal,
  "sleep_adherence_score" decimal,
  "total_score" decimal
);

CREATE TABLE "recommendations" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "message" text,
  "category" varchar,
  "is_read" boolean,
  "created_at" timestamp
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "type" varchar,
  "message" text,
  "sent_at" timestamp,
  "read_at" timestamp
);

CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "report_type" varchar,
  "format" varchar,
  "file_url" text,
  "generated_at" timestamp
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY,
  "admin_id" uuid,
  "target_user_id" uuid,
  "action" varchar,
  "details" text,
  "created_at" timestamp
);

CREATE TABLE "coach_assignments" (
  "id" uuid PRIMARY KEY,
  "coach_id" uuid,
  "user_id" uuid,
  "assigned_at" timestamp
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

ALTER TABLE "alarms" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "alarm_triggers" ADD FOREIGN KEY ("alarm_id") REFERENCES "alarms" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "alarm_triggers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "challenge_attempts" ADD FOREIGN KEY ("alarm_trigger_id") REFERENCES "alarm_triggers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "challenge_attempts" ADD FOREIGN KEY ("challenge_id") REFERENCES "challenges" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sleep_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "goal_metrics" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "habit_scores" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "recommendations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("admin_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "coach_assignments" ADD FOREIGN KEY ("coach_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "coach_assignments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "platform_settings" ADD FOREIGN KEY ("updated_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
