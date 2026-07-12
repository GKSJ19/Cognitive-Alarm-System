-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE auth_provider AS ENUM
(
    'email',
    'google'
);

CREATE TYPE user_role AS ENUM
(
    'user',
    'wellness_coach',
    'admin'
);

CREATE TYPE goal_type AS ENUM
(
    'study',
    'work',
    'fitness'
);

CREATE TYPE difficulty_level AS ENUM
(
    'beginner',
    'easy',
    'medium',
    'hard',
    'expert'
);

CREATE TYPE alarm_type AS ENUM
(
    'daily',
    'weekday',
    'weekend',
    'one_time',
    'smart_adaptive'
);

CREATE TYPE challenge_type AS ENUM
(
    'math',
    'logic',
    'memory',
    'word_game',
    'pattern',
    'riddle',
    'quiz'
);

CREATE TYPE verification_status AS ENUM
(
    'pending',
    'in_progress',
    'passed',
    'failed'
);

CREATE TYPE notification_type AS ENUM
(
    'bedtime_reminder',
    'wake_reminder',
    'habit_alert',
    'progress'
);

CREATE TYPE report_type AS ENUM
(
    'habit',
    'wakeup',
    'challenge',
    'productivity',
    'sleep'
);

CREATE TYPE report_format AS ENUM
(
    'pdf',
    'excel'
);

CREATE TYPE sleep_source AS ENUM
(
    'manual',
    'apple_healthkit',
    'google_fit'
);

CREATE TYPE challenge_source AS ENUM
(
    'question_bank',
    'ai_generated'
);

CREATE TYPE setting_value_type AS ENUM
(
    'string',
    'number',
    'boolean',
    'json'
);
