from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy.exc import IntegrityError


def register_exception_handlers(app):
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors(), "body": exc.body},
        )

    @app.exception_handler(JWTError)
    async def jwt_exception_handler(request: Request, exc: JWTError):
        return JSONResponse(status_code=401, content={"detail": "Invalid authentication token"})

    @app.exception_handler(IntegrityError)
    async def integrity_exception_handler(request: Request, exc: IntegrityError):
        return JSONResponse(status_code=400, content={"detail": str(exc.orig)})
