def get_alarm_statistics(created, completed, missed, snoozed):
    return {
        "Created": created,
        "Completed": completed,
        "Missed": missed,
        "Snoozed": snoozed
    }