"""Project API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.dependencies import get_db
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project import ProjectService

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def list_projects(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProjectRead]:
    """List authenticated user's projects."""
    service = ProjectService(db)
    return service.list_by_owner(user_id)  # type: ignore


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectRead:
    """Create a new project."""
    service = ProjectService(db)
    return service.create(  # type: ignore
        owner_id=user_id,
        name=data.name,
        description=data.description,
    )


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectRead:
    """Get project details."""
    service = ProjectService(db)
    project = service.get_by_id(project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if str(project.owner_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    return project


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectRead:
    """Update a project."""
    service = ProjectService(db)
    project = service.get_by_id(project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if str(project.owner_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    updated = service.update(
        project_id=project_id,
        name=data.name,
        description=data.description,
    )

    return updated  # type: ignore


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a project."""
    service = ProjectService(db)
    project = service.get_by_id(project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if str(project.owner_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    service.delete(project_id)
