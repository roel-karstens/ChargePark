"""Project service containing business logic."""

from datetime import datetime
from uuid import UUID

from app.models.project import Project


class ProjectService:
    """Service for project operations."""

    def __init__(self, db):
        self.db = db

    @staticmethod
    def _normalize_uuid(value: UUID | str) -> UUID:
        """Convert string to UUID if needed.
        
        Args:
            value: UUID or string representation of UUID.
            
        Returns:
            UUID object.
        """
        return UUID(value) if isinstance(value, str) else value

    def list_by_owner(self, owner_id: UUID | str) -> list[Project]:
        """
        List all projects owned by a user.

        Args:
            owner_id: The owner's user ID.

        Returns:
            List of projects owned by the user.
        """
        owner_id = self._normalize_uuid(owner_id)

        projects = self.db.query(Project).filter(Project.owner_id == owner_id).all()
        return projects

    def get_by_id(self, project_id: UUID | str) -> Project | None:
        """
        Get a project by ID.

        Args:
            project_id: The project ID.

        Returns:
            The project, or None if not found.
        """
        project_id = self._normalize_uuid(project_id)
        return self.db.query(Project).filter(Project.id == project_id).first()

    def create(
        self,
        owner_id: UUID | str,
        name: str,
        description: str | None = None,
    ) -> Project:
        """
        Create a new project.

        Args:
            owner_id: The owner's user ID.
            name: Project name.
            description: Project description (optional).

        Returns:
            The created project.
        """
        owner_id = self._normalize_uuid(owner_id)
        project = Project(
            owner_id=owner_id,
            name=name,
            description=description,
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(
        self,
        project_id: UUID | str,
        name: str | None = None,
        description: str | None = None,
    ) -> Project | None:
        """
        Update a project.

        Args:
            project_id: The project ID.
            name: New project name (optional).
            description: New project description (optional).

        Returns:
            The updated project, or None if not found.
        """
        project_id = self._normalize_uuid(project_id)
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return None

        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        project.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: UUID | str) -> bool:
        """
        Delete a project.

        Args:
            project_id: The project ID.

        Returns:
            True if deleted, False if not found.
        """
        project_id = self._normalize_uuid(project_id)
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False

        self.db.delete(project)
        self.db.commit()
        return True
