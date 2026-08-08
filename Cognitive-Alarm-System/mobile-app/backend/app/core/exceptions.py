from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApplicationError(Exception):
    """Base application-level exception."""

    status_code = status.HTTP_400_BAD_REQUEST
    code = "application_error"

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(ApplicationError):
    """Resource not found."""

    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ForbiddenError(ApplicationError):
    """Access denied."""

    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"


def error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": {"code": code, "message": message}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(ApplicationError)
    async def application_error_handler(
        request: Request, exc: ApplicationError
    ) -> JSONResponse:
        return error_response(exc.code, exc.message, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": "validation_error",
                    "message": "Request validation failed",
                },
                "details": exc.errors(),
            },
        )
