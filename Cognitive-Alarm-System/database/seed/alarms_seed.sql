-- =====================================================
-- ALARMS
-- =====================================================

INSERT INTO alarms
(
    user_id,
    time,
    alarm_type,
    label
)
SELECT
    id,
    '05:30',
    'daily',
    'Morning Alarm'
FROM users
WHERE email='venu@gmail.com';

INSERT INTO alarms
(
    user_id,
    time,
    alarm_type,
    label
)
SELECT
    id,
    '06:00',
    'daily',
    'Workout Alarm'
FROM users
WHERE email='priya@gmail.com';
