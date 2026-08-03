from datetime import datetime, time, timedelta
import math
from typing import List

def parse_time_to_minutes(time_str: str) -> int:
    """Converts HH:MM or HH:MM:SS format to minutes from midnight."""
    parts = time_str.split(":")
    if len(parts) >= 2:
        return int(parts[0]) * 60 + int(parts[1])
    return 0

def calculate_time_difference_minutes(t1_str: str, t2_str: str) -> int:
    """Calculates difference in minutes between t2 and t1 (t2 - t1), assuming t2 is after t1.
    Handles crossing midnight (e.g. t1='23:00', t2='07:00' -> 480 mins).
    """
    m1 = parse_time_to_minutes(t1_str)
    m2 = parse_time_to_minutes(t2_str)
    if m2 < m1:  # crossed midnight
        return (24 * 60 - m1) + m2
    return m2 - m1

def get_sleep_duration_hours(bedtime_str: str, wakeup_str: str) -> float:
    """Calculates sleep duration in hours from bedtime and wake up time."""
    try:
        minutes = calculate_time_difference_minutes(bedtime_str, wakeup_str)
        return round(minutes / 60.0, 2)
    except Exception:
        return 8.0  # default fallback

def get_standard_deviation(values: List[float]) -> float:
    """Calculates standard deviation of a list of floats."""
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)
