-- ============================================================
-- ANALYTICS & REPORTING MODULE
-- ============================================================

CREATE TABLE sleep_logs
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    date DATE NOT NULL,

    sleep_start TIMESTAMPTZ,

    sleep_end TIMESTAMPTZ,

    duration_mins INTEGER,

    source sleep_source
    DEFAULT 'manual',

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sleep_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE habit_scores
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    date DATE NOT NULL,

    wake_consistency_score NUMERIC(5,2),

    challenge_success_score NUMERIC(5,2),

    snooze_reduction_score NUMERIC(5,2),

    sleep_adherence_score NUMERIC(5,2),

    total_score NUMERIC(5,2),

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_habit_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE goal_metrics
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    date DATE,

    goal_type goal_type,

    metric_label VARCHAR(100),

    metric_value NUMERIC,

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_goal_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE recommendations
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    message TEXT NOT NULL,

    category VARCHAR(60),

    is_read BOOLEAN
    DEFAULT FALSE,

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommend_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE notifications
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    type notification_type,

    message TEXT,

    sent_at TIMESTAMPTZ,

    read_at TIMESTAMPTZ,

    CONSTRAINT fk_notification_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE reports
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    report_type report_type,

    format report_format,

    file_url TEXT,

    generated_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
