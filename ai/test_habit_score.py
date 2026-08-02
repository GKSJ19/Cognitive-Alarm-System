from habit_score import HabitScore

habit = HabitScore()

score = habit.calculate_score(
    is_correct=True,
    wakeup_verified=True,
    response_time=6,
    streak=4
)

print("Habit Score :", score)
print("Level :", habit.get_level())