---
applyTo: "**/*.{test,spec}.{ts,tsx},**/tests/**/*.py"
---

# Testing Instructions

## Philosophy

- Write tests for behavior, not implementation
- Meaningful coverage is better than 100% coverage
- Never remove tests to make validation pass
- Bug fixes should include regression tests
- Avoid brittle tests that break with refactoring

## Backend Tests (pytest)

### Structure

```
tests/
  __init__.py
  conftest.py              # Fixtures and configuration
  test_projects.py         # API endpoint tests
  test_project_service.py  # Service logic tests
  fixtures/
    projects.py            # Reusable test data
```

### Service Tests

Test business logic in isolation:

```python
# tests/test_project_service.py
import pytest
from app.services.project import ProjectService
from app.schemas.project import ProjectCreate

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
```

### API Tests

Test endpoints with authentication:

```python
# tests/test_projects.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    """Return authorization headers for tests."""
    return {"Authorization": "Bearer test-token"}

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

def test_create_project_requires_auth(client):
    """POST /api/v1/projects should require authentication."""
    response = client.post(
        "/api/v1/projects",
        json={"name": "New Project"}
    )
    assert response.status_code == 401

def test_cannot_access_other_user_project(client, auth_headers):
    """Users should not access projects they don't own."""
    # Create project as one user, try to access as another
    response = client.get(
        "/api/v1/projects/other-users-project-id",
        headers=auth_headers
    )
    assert response.status_code == 403
```

### Fixtures

Define reusable test data:

```python
# tests/conftest.py
import pytest
from app.models.project import Project

@pytest.fixture
def sample_project(db):
    """Create a sample project for testing."""
    project = Project(
        owner_id="user-123",
        name="Test Project",
        description="A test project"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@pytest.fixture
def auth_headers():
    """Return valid auth headers."""
    return {"Authorization": "Bearer valid-test-token"}
```

## Frontend Tests (Vitest)

### Component Tests

Test component behavior:

```typescript
// components/ProjectForm/ProjectForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectForm } from './ProjectForm';

describe('ProjectForm', () => {
  it('renders form with title input', () => {
    const { getByLabelText } = render(
      <ProjectForm onSubmit={vi.fn()} />
    );
    expect(getByLabelText('Project Name')).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn();
    render(<ProjectForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'New Project' }
    });
    fireEvent.click(screen.getByText('Create'));
    
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'New Project',
      description: ''
    });
  });

  it('shows error message on validation failure', () => {
    render(<ProjectForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('Create'));
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

### Hook Tests

Test custom hooks:

```typescript
// hooks/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('useProjects', () => {
  it('loads projects on mount', async () => {
    vi.mocked(api.get).mockResolvedValue([
      { id: '1', name: 'Project 1' }
    ]);

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Project 1');
  });

  it('handles errors', async () => {
    vi.mocked(api.get).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });
});
```

### Integration Tests

Test user interactions across components:

```typescript
// pages/Projects.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Projects } from './Projects';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('Projects page', () => {
  it('allows user to create a project', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    vi.mocked(api.post).mockResolvedValue({
      id: '1',
      name: 'New Project'
    });

    render(<Projects />);

    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'New Project' }
    });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });
});
```

## Coverage Goals

Aim for meaningful coverage:

- **Services**: 80%+ coverage (core business logic)
- **API endpoints**: 70%+ coverage (auth, validation, key flows)
- **Components**: 60%+ coverage (complex UI, interactions)
- **Utilities**: 90%+ coverage (reusable helpers)

**Never target 100% coverage** if it means writing brittle tests.

## Never Claim Tests Passed Unless Executed

Always run tests before claiming they pass:

```bash
# Frontend
npm run test

# Backend
pytest
```

If tests fail, fix the code. Do not modify tests to make them pass.

## Regression Tests

When fixing a bug, add a test that reproduces it:

```python
def test_project_update_requires_ownership(client, auth_headers):
    """
    Regression test for bug #42: Users could update projects they didn't own.
    """
    # Create project as user-123
    other_user_project_id = "other-user-project-id"
    
    # Try to update as different user
    response = client.patch(
        f"/api/v1/projects/{other_user_project_id}",
        json={"name": "Hacked"},
        headers=auth_headers
    )
    
    # Should be forbidden
    assert response.status_code == 403
```

## Test Organization

- One test file per module/component
- Related tests in same `describe` block
- Clear test names that describe behavior
- Use `# Arrange, Act, Assert` comments for clarity
