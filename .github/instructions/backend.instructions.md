---
applyTo: "backend/**/*.py"
---

# Backend Development Instructions

## Technology Stack

- Python 3.12+
- FastAPI web framework
- Pydantic for validation
- SQLAlchemy for database (via Supabase)
- pytest for tests
- Pyright for type checking
- Ruff for linting

## Python Guidelines

- Type hints on all functions and methods
- Docstrings for public functions
- Return types specified
- Prefer `from __future__ import annotations` for forward references
- Use `|` syntax for union types (Python 3.10+)

## Project Structure

```
app/
  api/
    __init__.py
    projects.py        # Project endpoints
    health.py          # Health check
  core/
    __init__.py
    auth.py            # Authentication logic
    config.py          # Configuration
  models/
    __init__.py
    project.py         # SQLAlchemy models
  schemas/
    __init__.py
    project.py         # Pydantic schemas
  services/
    __init__.py
    project.py         # Business logic
  dependencies.py      # FastAPI dependencies
  main.py              # Application entry point
```

## Route Handlers (Thin)

Keep handlers simple (2–5 lines):

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.project import ProjectCreate, ProjectRead
from app.services.project import ProjectService
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.get("", response_model=list[ProjectRead])
async def list_projects(
    user_id: str = Depends(get_current_user),
    service: ProjectService = Depends(),
) -> list[ProjectRead]:
    return await service.list_by_owner(user_id)

@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    user_id: str = Depends(get_current_user),
    service: ProjectService = Depends(),
) -> ProjectRead:
    return await service.create(owner_id=user_id, **data.dict())
```

## Services (Business Logic)

Encapsulate logic in services:

```python
from app.models.project import Project
from app.schemas.project import ProjectCreate

class ProjectService:
    def __init__(self, db):
        self.db = db

    async def list_by_owner(self, owner_id: str) -> list[Project]:
        """List all projects owned by the user."""
        return await self.db.query(Project).filter(
            Project.owner_id == owner_id
        ).all()

    async def create(
        self,
        owner_id: str,
        name: str,
        description: str | None = None,
    ) -> Project:
        """Create a new project."""
        project = Project(owner_id=owner_id, name=name, description=description)
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project
```

## Authentication & Authorization

### Get Current User

Use FastAPI dependency injection:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    """Extract user ID from JWT token."""
    try:
        token = credentials.credentials
        # Verify with Supabase or your auth provider
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return user_id
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
```

### Check Ownership

Always verify resource ownership before returning/modifying:

```python
@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user),
    service: ProjectService = Depends(),
) -> ProjectRead:
    project = await service.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if project.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return project
```

## Pydantic Schemas

Use for request/response validation:

```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

class ProjectRead(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## Error Handling

Return appropriate HTTP status codes:

```python
# 400: Bad request (validation)
raise HTTPException(status_code=400, detail="Invalid input")

# 401: Unauthorized (missing/invalid auth)
raise HTTPException(status_code=401, detail="Unauthorized")

# 403: Forbidden (authenticated but no permission)
raise HTTPException(status_code=403, detail="Forbidden")

# 404: Not found
raise HTTPException(status_code=404, detail="Not found")

# 409: Conflict (e.g., duplicate)
raise HTTPException(status_code=409, detail="Already exists")

# 422: Unprocessable entity (Pydantic validation)
# (FastAPI handles this automatically)

# 500: Internal server error (log and return generic message)
logger.error("Unexpected error", exc_info=True)
raise HTTPException(status_code=500, detail="Internal server error")
```

## Testing (pytest)

- Unit tests for services
- Integration tests for endpoints
- Test auth and authorization

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_list_projects_requires_auth(client):
    """List projects should require authentication."""
    response = client.get("/api/v1/projects")
    assert response.status_code == 401

def test_list_projects_returns_user_projects(client, auth_headers):
    """Authenticated user should see their projects."""
    response = client.get("/api/v1/projects", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 0
```

## Logging

- Log errors for debugging
- Never log sensitive data (passwords, tokens, user details)
- Use appropriate log levels

```python
import logging

logger = logging.getLogger(__name__)

logger.error("Failed to create project", exc_info=True)
logger.info("Project created", extra={"project_id": project_id})
```

## Build and Validation

- Type checking: `pyright`
- Linting: `ruff check`
- Formatting: `ruff format`
- Tests: `pytest`

All must pass before committing.

## Environment Variables

Use `.env.example` to document required variables. Load with `pydantic-settings`:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    database_url: str

    class Config:
        env_file = ".env"

settings = Settings()
```

Never log or expose these values.
