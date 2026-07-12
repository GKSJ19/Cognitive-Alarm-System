-- ============================================================
-- AUTHENTICATION & ADMIN MANAGEMENT
-- ============================================================

CREATE TABLE password_reset_tokens
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token VARCHAR(255) NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    used BOOLEAN
    DEFAULT FALSE,

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reset_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE coach_assignments
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    coach_id UUID NOT NULL,

    user_id UUID NOT NULL,

    assigned_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coach
    FOREIGN KEY(coach_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_assigned_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE audit_logs
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    admin_id UUID NOT NULL,

    action VARCHAR(150) NOT NULL,

    target_user_id UUID,

    details TEXT,

    created_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin
    FOREIGN KEY(admin_id)
    REFERENCES users(id),

    CONSTRAINT fk_target
    FOREIGN KEY(target_user_id)
    REFERENCES users(id)
);

CREATE TABLE platform_settings
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    setting_key VARCHAR(100) NOT NULL UNIQUE,

    setting_value TEXT,

    value_type setting_value_type
    DEFAULT 'string',

    description TEXT,

    updated_by UUID,

    updated_at TIMESTAMPTZ
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_platform_admin
    FOREIGN KEY(updated_by)
    REFERENCES users(id)
);
