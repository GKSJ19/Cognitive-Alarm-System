"""
Firebase Admin SDK integration -- verifies Google Sign-In ID tokens from
the Flutter app so they can be exchanged for this backend's own JWT.

Firebase is entirely OPTIONAL: if neither FIREBASE_CREDENTIALS_PATH nor
FIREBASE_CREDENTIALS_JSON is set in .env, this module simply never
initializes, and /auth/google returns a clear 503 instead of crashing
the whole app on startup.
"""

import json
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, status

from app.config import settings

_firebase_app = None


def init_firebase():
    """
    Call once, at app startup. Safe to call even when Firebase isn't
    configured -- it just no-ops in that case.
    """
    global _firebase_app

    if settings.FIREBASE_CREDENTIALS_JSON:
        # Cloud deployment path: paste the full service account JSON as a
        # single environment variable (easier than uploading a file).
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
        cred = credentials.Certificate(cred_dict)
    elif settings.FIREBASE_CREDENTIALS_PATH:
        # Local dev path: a file on disk.
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    else:
        return  # Firebase login disabled -- nothing to initialize

    if _firebase_app is None:
        _firebase_app = firebase_admin.initialize_app(cred)


def verify_firebase_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token (sent by Flutter after Google Sign-In)
    against Firebase's servers. Returns the decoded token claims
    (includes at least 'uid' and usually 'email') if valid.
    Raises 401 if invalid/expired, 503 if Firebase isn't configured at all.
    """
    if _firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Sign-In is not configured on this server",
        )

    try:
        return firebase_auth.verify_id_token(id_token)
    except Exception:
        # Covers ExpiredIdTokenError, InvalidIdTokenError, etc. -- all of
        # these mean the same thing to the caller: not a valid token.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google sign-in token",
        )
