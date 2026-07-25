from fastapi import Depends, FastAPI

from .database import Base, engine
from .dependencies import require_api_key
from .routers import api_keys

# Creates api_keys.db + the api_keys table on first run (dev-friendly).
# In production, use Alembic migrations instead of this — see README.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Brain O'Clock — API Key Service",
    description="Issues and validates API keys for the Cognitive Alarm Platform backend.",
    version="1.0.0",
)

app.include_router(api_keys.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "brain-oclock-api-key-service"}


@app.get(
    "/protected-example",
    tags=["Example"],
    dependencies=[Depends(require_api_key)],
)
def protected_example():
    """
    Demo of a protected route. Any real route (alarms, habits, profile...)
    can be locked down the same way — just add
    `dependencies=[Depends(require_api_key)]` to its decorator.
    """
    return {"message": "You're authenticated! This route required a valid X-API-Key."}
