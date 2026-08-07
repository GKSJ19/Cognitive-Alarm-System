from fastapi import FastAPI

from app.routers.dashboard import router as dashboard_router

app = FastAPI(
    title="Intelligent Cognitive Alarm Platform - Milestone 3",
    description="Clean, modular APIs for Analytics, Habit Scoring, and Recommendations",
    version="1.0.0"
)

app.include_router(dashboard_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # Run the application locally
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
