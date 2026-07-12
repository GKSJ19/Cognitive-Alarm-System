-- =====================================================
-- USERS
-- =====================================================

INSERT INTO users
(
    name,
    email,
    password_hash,
    auth_provider,
    role,
    goal_type,
    preferred_wake_time,
    sleep_duration_mins,
    timezone,
    difficulty_pref
)
VALUES

('Admin User',
'admin@alarm.ai',
'admin123',
'email',
'admin',
'study',
'06:00',
480,
'Asia/Kolkata',
'medium'),

('Venu Aravind',
'venu@gmail.com',
'password123',
'email',
'user',
'study',
'05:30',
420,
'Asia/Kolkata',
'medium'),

('John David',
'john@gmail.com',
'password123',
'google',
'user',
'work',
'06:30',
450,
'Asia/Kolkata',
'easy'),

('Priya',
'priya@gmail.com',
'password123',
'email',
'wellness_coach',
'fitness',
'05:00',
480,
'Asia/Kolkata',
'hard');
