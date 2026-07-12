CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "name" varchar
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

ALTER TABLE "sleep_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "goal_metrics" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "habit_scores" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "recommendations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
