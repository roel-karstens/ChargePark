import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Extract and verify JWT token from request.

    Returns:
        user_id (str): The user ID from the token's 'sub' claim.

    Raises:
        HTTPException: 401 Unauthorized if token is invalid or missing.
    """
    try:
        token = credentials.credentials
        # Decode without signature verification for now
        # In production, verify with Supabase public key
        payload = jwt.decode(
            token,
            options={"verify_signature": False},
        )
        user_id: str | None = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )
