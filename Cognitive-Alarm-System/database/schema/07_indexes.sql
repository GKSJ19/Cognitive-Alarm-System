-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_alarm_user
ON alarms(user_id);

CREATE INDEX idx_alarm_time
ON alarms(time);

CREATE INDEX idx_alarm_type
ON alarms(alarm_type);

CREATE INDEX idx_trigger_alarm
ON alarm_triggers(alarm_id);

CREATE INDEX idx_trigger_user
ON alarm_triggers(user_id);

CREATE INDEX idx_challenge_type
ON challenges(type);

CREATE INDEX idx_challenge_difficulty
ON challenges(difficulty);

CREATE INDEX idx_challenge_goal
ON challenges(goal_type);

CREATE INDEX idx_attempt_trigger
ON challenge_attempts(alarm_trigger_id);

CREATE INDEX idx_attempt_challenge
ON challenge_attempts(challenge_id);

CREATE INDEX idx_sleep_user
ON sleep_logs(user_id);

CREATE INDEX idx_sleep_date
ON sleep_logs(date);

CREATE INDEX idx_habit_user
ON habit_scores(user_id);

CREATE INDEX idx_goal_user
ON goal_metrics(user_id);

CREATE INDEX idx_recommend_user
ON recommendations(user_id);

CREATE INDEX idx_notification_user
ON notifications(user_id);

CREATE INDEX idx_report_user
ON reports(user_id);

CREATE INDEX idx_audit_admin
ON audit_logs(admin_id);

CREATE INDEX idx_audit_target
ON audit_logs(target_user_id);

CREATE INDEX idx_coach
ON coach_assignments(coach_id);

CREATE INDEX idx_coach_user
ON coach_assignments(user_id);

CREATE INDEX idx_setting_key
ON platform_settings(setting_key);
