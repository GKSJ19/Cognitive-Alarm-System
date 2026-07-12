-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    email VARCHAR(160) NOT NULL UNIQUE,

    password_hash VARCHAR(255),

    auth_provider auth_provider
    DEFAULT 'email',

    google_id VARCHAR(255),

    role user_role
    DEFAULT 'user',

    goal_type goal_type
    DEFAULT 'study',

    preferred_wake_time TIME,

    sleep_duration_mins INTEGER,

    timezone VARCHAR(60)
    DEFAULT 'Asia/Kolkata',

    difficulty_pref difficulty_level
    DEFAULT 'medium',

    is_active BOOLEAN
    DEFAULT TRUE,

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP
);
