from app.services.habit_service import HabitService

def test_habit_score_calculation():
    # Test 1: Easy Challenge, 10s, Correct, 1st attempt
    # Base: 40, Penalty: 10 * 0.5 = 5, Bonus: 5 => 40 - 5 + 5 = 40
    score1 = HabitService.calculate_habit_score('easy', 10.0, True, 1)
    assert score1 == 40.0, f"Expected 40.0, got {score1}"

    # Test 2: Medium Challenge, 20s, Correct, 1st attempt
    # Base: 60, Penalty: 20 * 0.5 = 10, Bonus: 5 => 60 - 10 + 5 = 55
    score2 = HabitService.calculate_habit_score('medium', 20.0, True, 1)
    assert score2 == 55.0, f"Expected 55.0, got {score2}"

    # Test 3: Hard Challenge, 18s, Correct, 1st attempt
    # Base: 80, Penalty: 18 * 0.5 = 9, Bonus: 5 => 80 - 9 + 5 = 76
    score3 = HabitService.calculate_habit_score('hard', 18.0, True, 1)
    assert score3 == 76.0, f"Expected 76.0, got {score3}"

    # Test 4: Hard Challenge, 18s, Correct, 2nd attempt (no bonus)
    # Base: 80, Penalty: 18 * 0.5 = 9 => 80 - 9 = 71
    score4 = HabitService.calculate_habit_score('hard', 18.0, True, 2)
    assert score4 == 71.0, f"Expected 71.0, got {score4}"

    # Test 5: Incorrect answer => score = 0
    score5 = HabitService.calculate_habit_score('hard', 5.0, False, 1)
    assert score5 == 0.0, f"Expected 0.0, got {score5}"

    # Test 6: Extreme time taken penalty capped at 0 (never negative)
    score6 = HabitService.calculate_habit_score('easy', 200.0, True, 2)
    assert score6 == 0.0, f"Expected 0.0, got {score6}"

    print("All Habit Score calculation unit tests passed successfully!")

if __name__ == "__main__":
    test_habit_score_calculation()
