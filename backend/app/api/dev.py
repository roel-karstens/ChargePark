"""Development-only endpoints for testing without Supabase Auth."""

import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.dependencies import get_db
from app.models.project import Project
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/dev", tags=["dev"])

# Only enable in development
DEV_MODE = settings.environment == "development"


class TokenRequest(BaseModel):
    """Request to generate a dev token."""

    user_id: str


class TokenResponse(BaseModel):
    """Response with generated token."""

    token: str


class ProjectDebugInfo(BaseModel):
    """Debug info for a project."""
    
    id: str
    name: str
    owner_id: str
    created_at: str


class UserInfo(BaseModel):
    """Current user info."""
    
    user_id: str



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


@router.get("/debug/projects", response_model=list[ProjectDebugInfo])
async def debug_all_projects(db: Session = Depends(get_db)) -> list[ProjectDebugInfo]:
    """
    DEBUG ENDPOINT: Show all projects with owner_ids (no filtering).
    
    Only available in development mode.
    """
    if not DEV_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dev endpoints only available in development mode",
        )
    
    projects = db.query(Project).all()
    return [
        ProjectDebugInfo(
            id=str(project.id),
            name=project.name,
            owner_id=str(project.owner_id),
            created_at=project.created_at.isoformat() if project.created_at else "N/A",
        )
        for project in projects
    ]


@router.get("/debug/me", response_model=UserInfo)
async def debug_current_user(user_id: str = Depends(get_current_user)) -> UserInfo:
    """
    DEBUG ENDPOINT: Get current authenticated user's ID.
    
    Only available in development mode.
    """
    if not DEV_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dev endpoints only available in development mode",
        )
    
    return UserInfo(user_id=user_id)


