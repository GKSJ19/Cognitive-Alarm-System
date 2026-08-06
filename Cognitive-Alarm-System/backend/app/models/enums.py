import enum


class AuthProvider(str, enum.Enum):
    email = "email"
    google = "google"


class UserRole(str, enum.Enum):
    user = "user"
    wellness_coach = "wellness_coach"
    admin = "admin"


class GoalType(str, enum.Enum):
    study = "study"
    work = "work"
    fitness = "fitness"


class DifficultyLevel(str, enum.Enum):
    beginner = "beginner"
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"


class AlarmType(str, enum.Enum):
    daily = "daily"
    weekday = "weekday"
    weekend = "weekend"
    one_time = "one_time"
    smart_adaptive = "smart_adaptive"


class ChallengeType(str, enum.Enum):
    math = "math"
    logic = "logic"
    memory = "memory"
    word_game = "word_game"
    pattern = "pattern"
    riddle = "riddle"
    quiz = "quiz"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    passed = "passed"
    failed = "failed"


class NotificationType(str, enum.Enum):
    bedtime_reminder = "bedtime_reminder"
    wake_reminder = "wake_reminder"
    habit_alert = "habit_alert"
    progress = "progress"
    streak_milestone = "streak_milestone"
    challenge_result = "challenge_result"
    coach_message = "coach_message"
    system_alert = "system_alert"
    weekly_summary = "weekly_summary"


class NotificationChannel(str, enum.Enum):
    in_app = "in_app"
    push = "push"
    email = "email"


class NotificationPriority(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"
    critical = "critical"


class NotificationStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    delivered = "delivered"
    read = "read"
    failed = "failed"


class AnalyticsEventType(str, enum.Enum):
    alarm_triggered = "alarm_triggered"
    alarm_dismissed = "alarm_dismissed"
    alarm_snoozed = "alarm_snoozed"
    challenge_started = "challenge_started"
    challenge_passed = "challenge_passed"
    challenge_failed = "challenge_failed"
    login = "login"
    logout = "logout"
    habit_logged = "habit_logged"
    sleep_logged = "sleep_logged"
    notification_sent = "notification_sent"
    notification_read = "notification_read"


class BiReportType(str, enum.Enum):
    daily_active_users = "daily_active_users"
    weekly_retention = "weekly_retention"
    alarm_success_rate = "alarm_success_rate"
    challenge_completion = "challenge_completion"
    sleep_quality_trend = "sleep_quality_trend"
    habit_adherence = "habit_adherence"
    notification_engagement = "notification_engagement"
    platform_overview = "platform_overview"


class ReportType(str, enum.Enum):
    habit = "habit"
    wakeup = "wakeup"
    challenge = "challenge"
    productivity = "productivity"
    sleep = "sleep"


class ReportFormat(str, enum.Enum):
    pdf = "pdf"
    excel = "excel"


class SleepSource(str, enum.Enum):
    manual = "manual"
    apple_healthkit = "apple_healthkit"
    google_fit = "google_fit"


class ChallengeSource(str, enum.Enum):
    question_bank = "question_bank"
    ai_generated = "ai_generated"


class SettingValueType(str, enum.Enum):
    string = "string"
    integer = "integer"
    boolean = "boolean"
    json = "json"
