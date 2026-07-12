CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "name" varchar
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

ALTER TABLE "alarms" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "alarm_triggers" ADD FOREIGN KEY ("alarm_id") REFERENCES "alarms" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "alarm_triggers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "challenge_attempts" ADD FOREIGN KEY ("alarm_trigger_id") REFERENCES "alarm_triggers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "challenge_attempts" ADD FOREIGN KEY ("challenge_id") REFERENCES "challenges" ("id") DEFERRABLE INITIALLY IMMEDIATE;
