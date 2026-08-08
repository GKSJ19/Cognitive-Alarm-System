from fastapi import APIRouter

from app.schemas.responses import ApiResponse

router = APIRouter()


@router.get("/health", response_model=ApiResponse[dict[str, str]])
def health_check() -> ApiResponse[dict[str, str]]:
    return ApiResponse(data={"status": "healthy"})
