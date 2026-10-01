#!/usr/bin/env python3
"""
Initialize database and add test data
"""
import sys
import uuid
from pathlib import Path
from datetime import datetime, timezone

# Add backend to path (scripts is one level deep)
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.dependencies import engine
from app.models.project import Base, Project
from app.dependencies import SessionLocal

# Create all tables
print("📦 Initializing database schema...")
Base.metadata.create_all(bind=engine)
print("✅ Database schema created")

# Create a test user ID (in Supabase, this would be a real user UUID)
test_user_id = uuid.uuid4()

# Create session
db = SessionLocal()

try:
    
    # Create test projects
    projects_data = [
        {
            "name": "Website Redesign",
            "description": "Complete redesign of the company website with modern UI/UX",
        },
        {
            "name": "Mobile App MVP",
            "description": "Build minimum viable product for iOS and Android",
        },
        {
            "name": "Database Migration",
            "description": "Migrate legacy database to PostgreSQL with zero downtime",
        },
        {
            "name": "API Documentation",
            "description": "Complete API documentation with interactive examples",
        },
    ]
    
    print(f"\n📝 Creating test projects for user: {test_user_id}")
    print("-" * 60)
    
    for data in projects_data:
        project = Project(
            id=uuid.uuid4(),
            owner_id=test_user_id,
            name=data["name"],
            description=data["description"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(project)
        print(f"  ✓ {data['name']}")
    
    db.commit()
    print("\n✅ All projects created successfully!")
    
    # Query and display
    print("\n" + "=" * 60)
    print("📊 DATABASE CONTENT (projects table)")
    print("=" * 60)
    
    projects = db.query(Project).all()
    print(f"\n✅ Found {len(projects)} project(s):\n")
    
    for i, project in enumerate(projects, 1):
        print(f"  Project {i}:")
        print(f"    ID:          {project.id}")
        print(f"    Owner ID:    {project.owner_id}")
        print(f"    Name:        {project.name}")
        print(f"    Description: {project.description}")
        print(f"    Created:     {project.created_at}")
        print(f"    Updated:     {project.updated_at}")
        print()
    
    print("=" * 60)
    print("\n🌐 APP URLS:")
    print("  • Frontend: http://localhost:5173")
    print("  • Backend:  http://localhost:8000")
    print("  • API Docs: http://localhost:8000/docs")
    
    print("\n💡 TIP: Test the API directly at http://localhost:8000/docs")
    print("   You can see all the projects and test endpoints interactively!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    sys.exit(1)
finally:
    db.close()
