-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW user_progress_summary AS
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT a.id) AS alarm_count,
    MAX(h.total_score) AS latest_score,
    COUNT(DISTINCT r.id) AS report_count
FROM users u
LEFT JOIN alarms a
    ON u.id = a.user_id
LEFT JOIN habit_scores h
    ON u.id = h.user_id
LEFT JOIN reports r
    ON u.id = r.user_id
GROUP BY u.id, u.name, u.email;
