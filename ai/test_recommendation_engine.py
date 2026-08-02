from recommendation_engine import RecommendationEngine

engine = RecommendationEngine()

recommendations = engine.generate_recommendation(
    habit_score=82,
    success_rate=75,
    average_response_time=6
)

print("\nPersonalized Recommendations")
print("-" * 35)

for recommendation in recommendations:
    print("•", recommendation)