def get_progress(days_completed, total_days):
    progress = (days_completed / total_days) * 100 if total_days > 0 else 0

    return {
        "Days Completed": days_completed,
        "Total Days": total_days,
        "Progress": f"{progress:.0f}%"
    }