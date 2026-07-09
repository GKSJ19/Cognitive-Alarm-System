from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, RoleChecker
from app.models import User

router = APIRouter(prefix="/protected", tags=["Authorization Demo"])

@router.get("/any-auth")
def any_auth(current_user: User = Depends(get_current_user)):
    """Accessible by any logged-in user."""
    return {
        "message": f"Hello {current_user.full_name}, you are authenticated!",
        "role": current_user.role
    }

@router.get("/coach-only")
def coach_only(current_user: User = Depends(RoleChecker(["wellness_coach", "admin"]))):
    """Accessible only by Wellness Coaches or Administrators."""
    return {
        "message": f"Hello {current_user.full_name}, you have accessed a coach/admin protected route.",
        "role": current_user.role
    }

@router.get("/admin-only")
def admin_only(current_user: User = Depends(RoleChecker(["admin"]))):
    """Accessible only by Administrators."""
    return {
        "message": f"Hello {current_user.full_name}, you have accessed an admin-restricted route.",
        "role": current_user.role
    }
