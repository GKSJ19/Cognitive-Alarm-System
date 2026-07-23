def challenge_report(attempted, completed, total_score):
    success_rate = (completed / attempted) * 100 if attempted > 0 else 0
    average_score = total_score / completed if completed > 0 else 0

    return {
        "Challenges Attempted": attempted,
        "Challenges Completed": completed,
        "Success Rate": f"{success_rate:.0f}%",
        "Average Score": round(average_score, 2)
    }