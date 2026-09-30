import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Project(Base):
    """Project database model."""

    __tablename__ = "projects"

    id: Column = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Note: In production with Supabase, this references auth.users(id)
    # For local testing with SQLite, we just store the UUID string
    owner_id: Column = Column(
        UUID(as_uuid=True),
        nullable=False,
    )
    name: Column = Column(String(255), nullable=False)
    description: Column = Column(Text, nullable=True)
    created_at: Column = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Column = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
