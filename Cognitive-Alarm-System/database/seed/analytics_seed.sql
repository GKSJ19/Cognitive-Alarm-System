-- =====================================================
-- SLEEP LOGS
-- =====================================================

INSERT INTO sleep_logs
(
    user_id,
    date,
    sleep_start,
    sleep_end,
    duration_mins,
    source
)
SELECT
    id,
    CURRENT_DATE,
    CURRENT_DATE + TIME '22:30',
    CURRENT_DATE + INTERVAL '1 day' + TIME '05:30',
    420,
    'manual'
FROM users
WHERE email='venu@gmail.com';

-- =====================================================
-- HABIT SCORES
-- =====================================================

INSERT INTO habit_scores
(
    user_id,
    date,
    wake_consistency_score,
    challenge_success_score,
    snooze_reduction_score,
    sleep_adherence_score,
    total_score
)
SELECT
    id,
    CURRENT_DATE,
    92,
    95,
    90,
    88,
    91
FROM users
WHERE email='venu@gmail.com';

-- =====================================================
-- GOAL METRICS
-- =====================================================

INSERT INTO goal_metrics
(
    user_id,
    date,
    goal_type,
    metric_label,
    metric_value
)
SELECT
    id,
    CURRENT_DATE,
    'study',
    'Wake Before 6 AM',
    24
FROM users
WHERE email='venu@gmail.com';

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================

INSERT INTO recommendations
(
    user_id,
    message,
    category
)
SELECT
    id,
    'Sleep before 10:30 PM for better consistency.',
    'sleep'
FROM users
WHERE email='venu@gmail.com';

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

INSERT INTO notifications
(
    user_id,
    type,
    message,
    sent_at
)
SELECT
    id,
    'progress',
    'Welcome to Intelligent Cognitive Alarm Platform',
    CURRENT_TIMESTAMP
FROM users;

-- =====================================================
-- REPORTS
-- =====================================================

INSERT INTO reports
(
    user_id,
    report_type,
    format,
    file_url
)
SELECT
    id,
    'sleep',
    'pdf',
    'reports/week1_sleep_report.pdf'
FROM users;
