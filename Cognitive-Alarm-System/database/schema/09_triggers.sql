-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trg_users_updated
BEFORE UPDATE
ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_alarms_updated
BEFORE UPDATE
ON alarms
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_platform_settings_updated
BEFORE UPDATE
ON platform_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
