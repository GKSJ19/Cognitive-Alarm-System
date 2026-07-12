-- ============================================================
-- ALARM & CHALLENGE MODULE
-- ============================================================

CREATE TABLE alarms
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    time TIME NOT NULL,

    alarm_type alarm_type
    DEFAULT 'daily',

    days_of_week SMALLINT[],

    is_active BOOLEAN
    DEFAULT TRUE,

    label VARCHAR(100),

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alarm_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE alarm_triggers
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    alarm_id UUID NOT NULL,

    user_id UUID NOT NULL,

    triggered_at TIMESTAMPTZ,

    dismissed_at TIMESTAMPTZ,

    verification_status verification_status
    DEFAULT 'pending',

    snooze_count INTEGER
    DEFAULT 0,

    total_attempts INTEGER
    DEFAULT 0,

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trigger_alarm
    FOREIGN KEY(alarm_id)
    REFERENCES alarms(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_trigger_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE challenges
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    type challenge_type NOT NULL,

    goal_type goal_type,

    difficulty difficulty_level,

    question TEXT NOT NULL,

    correct_answer TEXT NOT NULL,

    source challenge_source
    DEFAULT 'question_bank',

    embedding_ref VARCHAR(120),

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_attempts
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    alarm_trigger_id UUID NOT NULL,

    challenge_id UUID NOT NULL,

    attempt_number INTEGER
    DEFAULT 1,

    is_correct BOOLEAN
    DEFAULT FALSE,

    time_taken_seconds INTEGER,

    answered_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attempt_trigger
    FOREIGN KEY(alarm_trigger_id)
    REFERENCES alarm_triggers(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_attempt_challenge
    FOREIGN KEY(challenge_id)
    REFERENCES challenges(id)
);
