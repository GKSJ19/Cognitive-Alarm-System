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
