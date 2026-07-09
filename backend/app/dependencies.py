from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database import SessionLocal
from app.security import decode_access_token
from app.models import User
from app.schemas import TokenData

# OAuth2PasswordBearer extracts the Bearer token from the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    """Dependency to provide a database session for each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency to validate the JWT and return the logged-in user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: str = payload.get("sub")
    role: str = payload.get("role")
    
    if user_id_str is None:
        raise credentials_exception
        
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception
        
    token_data = TokenData(user_id=user_id, role=role)
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    return user

class RoleChecker:
    """Dependency to restrict access to users possessing specific roles."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
