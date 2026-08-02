from behavior_analysis import BehaviorAnalysis

analysis = BehaviorAnalysis()

analysis.record_attempt(
    is_correct=True,
    response_time=5.2,
    xp=20
)

analysis.record_attempt(
    is_correct=False,
    response_time=12.5,
    xp=0
)

analysis.record_attempt(
    is_correct=True,
    response_time=6.3,
    xp=25
)

print("\nBehavior Analysis Report")
print("-" * 30)

report = analysis.analyze_user()

for key, value in report.items():
    print(f"{key}: {value}")