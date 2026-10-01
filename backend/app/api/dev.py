"""Development-only endpoints for testing without Supabase Auth."""

import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/api/v1/dev", tags=["dev"])

# Only enable in development
DEV_MODE = settings.environment == "development"


class TokenRequest(BaseModel):
    """Request to generate a dev token."""

    user_id: str


class TokenResponse(BaseModel):
    """Response with generated token."""

    token: str


@router.post("/token", response_model=TokenResponse)
async def generate_dev_token(request: TokenRequest) -> TokenResponse:
    """
    Generate a test JWT token for development.

    Only available in development mode.
    """
    if not DEV_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dev endpoints only available in development mode",
        )

    try:
        # Create JWT payload
        now = datetime.now(timezone.utc)
        payload = {
            "sub": request.user_id,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=24)).timestamp()),
            "dev_mode": True,
        }

        # Create token with a test key
        token = jwt.encode(
            payload,
            key="test-secret-key",
            algorithm="HS256",
        )

        return TokenResponse(token=token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate token: {str(e)}",
        )
