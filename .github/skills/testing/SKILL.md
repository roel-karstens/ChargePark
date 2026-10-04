# Testing Skill

**Use this skill when:**
- Writing tests for new functionality
- Debugging failing tests
- Improving test coverage
- Running validation before deployment
- Investigating production issues
- Ensuring regressions don't occur

## Testing Philosophy

- Write tests for **behavior**, not implementation
- **Meaningful coverage** is better than 100% coverage
- **Never remove tests** to make validation pass
- **Bug fixes include regression tests**
- Avoid **brittle tests** that break with refactoring
- Test **happy paths and error paths**
- Test **authentication and authorization**

## Backend Testing (pytest)

### Run Tests

```bash
cd backend

# Run all tests
pytest

# Run with output
pytest -v

# Run specific test file
pytest tests/test_projects.py

# Run specific test
pytest tests/test_projects.py::test_create_project

# Run with coverage
pytest --cov=app

# Watch mode (requires pytest-watch)
pip install pytest-watch
ptw
```

### Test Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Fixtures and setup
│   ├── test_projects.py         # API endpoint tests
│   ├── test_project_service.py  # Service logic tests
│   └── fixtures/
│       └── projects.py          # Reusable test data
```

### Fixtures (conftest.py)

Fixtures provide reusable test setup:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies import get_db

@pytest.fixture
def client():
    """Provide test client."""
    return TestClient(app)

@pytest.fixture
def auth_headers():
    """Provide valid auth headers."""
    token = jwt.encode(
        {"sub": "test-user-123"},
        "secret",
        algorithm="HS256"
    )
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def db():
    """Provide test database."""
    # Setup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    yield db
    
    # Cleanup
    db.close()
```

### Service Tests

Test business logic in isolation:

```python
# tests/test_project_service.py
import pytest
from app.services.project import ProjectService
from app.models.project import Project

@pytest.fixture
def service(db):
    return ProjectService(db)

def test_create_project(service):
    """Should create a project with owner."""
    result = service.create(
        owner_id="user-123",
        name="My Project",
        description="A test project"
    )
    assert result.id is not None
    assert result.owner_id == "user-123"
    assert result.name == "My Project"

def test_list_projects_filters_by_owner(service):
    """Should only return projects owned by user."""
    service.create(owner_id="user-123", name="Project 1")
    service.create(owner_id="user-456", name="Project 2")
    
    result = service.list_by_owner("user-123")
    assert len(result) == 1
    assert result[0].name == "Project 1"

def test_delete_project_not_found(service):
    """Should return False if project doesn't exist."""
    result = service.delete("nonexistent-id")
    assert result is False
```

### API Endpoint Tests

Test endpoints with authentication and authorization:

```python
# tests/test_projects.py
import pytest
from fastapi.testclient import TestClient

def test_list_projects_requires_auth(client):
    """GET /api/v1/projects should require authentication."""
    response = client.get("/api/v1/projects")
    assert response.status_code == 401

def test_list_projects_returns_user_projects(client, auth_headers):
    """GET /api/v1/projects should return user's projects."""
    response = client.get("/api/v1/projects", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_project_with_valid_data(client, auth_headers):
    """POST /api/v1/projects should create a project."""
    data = {"name": "New Project", "description": "Description"}
    response = client.post(
        "/api/v1/projects",
        json=data,
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["name"] == "New Project"

def test_create_project_missing_name(client, auth_headers):
    """POST /api/v1/projects should reject missing name."""
    response = client.post(
        "/api/v1/projects",
        json={"description": "No name"},
        headers=auth_headers
    )
    assert response.status_code == 422  # Validation error

def test_get_project_forbidden_if_not_owner(client, auth_headers, db):
    """GET /api/v1/projects/{id} should return 403 if not owner."""
    # Create project as different user
    other_project = Project(
        owner_id="other-user",
        name="Other Project"
    )
    db.add(other_project)
    db.commit()
    
    # Try to get as different user
    response = client.get(
        f"/api/v1/projects/{other_project.id}",
        headers=auth_headers  # Different user
    )
    assert response.status_code == 403

def test_delete_project_returns_204(client, auth_headers, db):
    """DELETE /api/v1/projects/{id} should return 204 No Content."""
    # Create project
    project = Project(owner_id="test-user-123", name="Delete Me")
    db.add(project)
    db.commit()
    
    # Delete it
    response = client.delete(
        f"/api/v1/projects/{project.id}",
        headers=auth_headers
    )
    assert response.status_code == 204
    assert response.content == b""
```

### Testing Patterns

**Error cases:**
```python
def test_update_project_not_found(client, auth_headers):
    """Should return 404 if project doesn't exist."""
    response = client.patch(
        "/api/v1/projects/nonexistent",
        json={"name": "Updated"},
        headers=auth_headers
    )
    assert response.status_code == 404
```

**Authorization:**
```python
def test_only_owner_can_update(client, auth_headers, db):
    """Should return 403 if not owner."""
    other_project = Project(owner_id="other", name="Other")
    db.add(other_project)
    db.commit()
    
    response = client.patch(
        f"/api/v1/projects/{other_project.id}",
        json={"name": "Hacked"},
        headers=auth_headers  # Different user
    )
    assert response.status_code == 403
```

**Validation:**
```python
def test_project_name_required(client, auth_headers):
    """Should reject empty name."""
    response = client.post(
        "/api/v1/projects",
        json={"name": ""},
        headers=auth_headers
    )
    assert response.status_code == 422
```

## Frontend Testing (Vitest)

### Run Tests

```bash
cd frontend

# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run specific test
npm run test -- ComponentName.test.tsx
```

### Component Tests

```typescript
// tests/ProjectForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectForm } from '../components/ProjectForm';

describe('ProjectForm', () => {
  test('should render form fields', () => {
    render(
      <ProjectForm
        onCreate={async () => {}}
        isLoading={false}
      />
    );
    
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  test('should call onCreate when form submitted', async () => {
    const onCreate = vi.fn();
    render(
      <ProjectForm onCreate={onCreate} isLoading={false} />
    );
    
    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: 'Test Project' }
    });
    fireEvent.click(screen.getByText(/create/i));
    
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith('Test Project', '');
    });
  });

  test('should show error message', () => {
    render(
      <ProjectForm
        onCreate={async () => {}}
        isLoading={false}
        error="Failed to create"
      />
    );
    
    expect(screen.getByText(/failed to create/i)).toBeInTheDocument();
  });
});
```

## Validation Commands

### Backend Validation

```bash
cd backend

# Type checking (strict mode)
pyright

# Linting and formatting
ruff check .
ruff format --check .

# Tests
pytest -v

# All checks
pyright && ruff check . && pytest
```

### Frontend Validation

```bash
cd frontend

# Type checking (strict mode)
npm run type-check

# Linting
npm run lint

# Tests
npm run test

# Build
npm run build

# All checks
npm run type-check && npm run lint && npm run test && npm run build
```

## Interpreting Failures

**pytest failures:**
```
FAILED tests/test_projects.py::test_create_project
AssertionError: assert 401 == 201
```
→ Authentication missing or invalid

**Type errors:**
```
error: Expression of type "str" cannot be assigned to return type "int"
```
→ Return type mismatch; check function implementation

**Linting errors:**
```
error: Unused import "xyz"
```
→ Remove unused imports

**Validation errors:**
```
error: "name" is not a valid field for "ProjectCreate"
```
→ Check Pydantic schema definition

## Test Checklist

When adding new functionality:

- [ ] Write tests for happy path
- [ ] Write tests for error cases
- [ ] Write tests for authorization
- [ ] Write tests for validation
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Coverage is meaningful (not 100% required)
- [ ] Tests verify actual behavior (not implementation)

## See Also

- `.github/instructions/tests.instructions.md` — Test conventions
- `.github/prompts/test-and-review.prompt.md` — Full validation workflow
- `docs/development.md` — Running tests locally
