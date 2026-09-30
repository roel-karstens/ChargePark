# Development Guide

## Prerequisites

- **Node.js**: 18 or later
- **Python**: 3.12 or later
- **npm**: Latest version
- **Supabase account**: Free tier at [supabase.com](https://supabase.com)

## Project Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose region closest to you
4. Wait for project to initialize
5. Copy credentials from Project Settings → API

You'll need:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Clone Repository

```bash
git clone <repository>
cd ai_fullstack_starter
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=xxx
# VITE_API_URL=http://localhost:8000
```

**First time only:**
```bash
npm install
```

**Start dev server:**
```bash
npm run dev
# Open http://localhost:5173
```

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies with uv (recommended)
pip install uv
uv pip install -e ".[dev]"

# Or with pip
pip install -e ".[dev]"

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=xxx
# SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Start dev server:**
```bash
fastapi dev app/main.py
# Runs at http://localhost:8000
# Auto-reloads on file changes
```

### 5. Database Setup

In Supabase SQL Editor:

1. Copy contents of `supabase/migrations/0001_initial_schema.sql`
2. Paste into SQL Editor
3. Click "Execute"
4. Verify tables are created

## Development Workflow

### Frontend

```bash
cd frontend

# Development server (auto-reload)
npm run dev

# Lint (ESLint)
npm run lint

# Format code (Prettier)
npm run format

# Type checking (TypeScript)
npm run type-check

# Run tests (Vitest)
npm run test

# Run tests with UI
npm run test:ui

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
cd backend

# Development server (auto-reload)
fastapi dev app/main.py

# Lint (Ruff - check)
ruff check .

# Format code (Ruff)
ruff format .

# Fix issues (Ruff)
ruff check --fix .

# Type checking (Pyright)
pyright

# Run tests (pytest)
pytest

# Run specific tests
pytest -v tests/test_projects.py

# Run with coverage
pytest --cov=app tests/

# Run in watch mode
pytest-watch
```

### Database

**Run a migration:**
1. Create `supabase/migrations/NNNN_description.sql`
2. Copy SQL to Supabase SQL Editor
3. Execute

**Test RLS locally:**
```sql
-- In Supabase SQL Editor or psql
SET request.jwt.claims = '{"sub":"user-uuid"}';
SELECT * FROM projects;
```

**Reset database (dev only):**
```sql
DROP TABLE IF EXISTS projects CASCADE;
-- Recreate from migrations
```

## Code Quality

### Before Committing

**Frontend:**
```bash
cd frontend
npm run lint
npm run type-check
npm run test
npm run build  # Should succeed
```

**Backend:**
```bash
cd backend
ruff check .
ruff format --check .
pyright
pytest
```

**Use this script to run everything:**
```bash
./scripts/validate.sh
```

### Fixing Issues

**Frontend:**
```bash
npm run lint -- --fix  # Fix ESLint issues
npm run format         # Format with Prettier
```

**Backend:**
```bash
ruff format .          # Format code
ruff check --fix .     # Fix fixable issues
```

## Git Workflow

### Branches

- `main` — Production-ready code
- `dev` — Development branch (if used)
- `feature/xyz` — Feature branches

### Commits

Write clear commit messages:

```
✨ Add project dashboard

- Create ProjectDashboard component
- Add projects API endpoints
- Add RLS policies for projects
- Add tests for CRUD operations
```

### Pull Requests

Before opening a PR:
1. Run full validation
2. Write clear description
3. Reference related issues
4. Request review

## Testing

### Adding Tests

**Backend (pytest):**
```python
# tests/test_projects.py
def test_create_project(client, auth_headers):
    response = client.post(
        "/api/v1/projects",
        json={"name": "Test"},
        headers=auth_headers
    )
    assert response.status_code == 201
```

**Frontend (Vitest):**
```typescript
// src/components/ProjectForm.test.tsx
import { render, screen } from '@testing-library/react';
import { ProjectForm } from './ProjectForm';

it('renders form', () => {
  render(<ProjectForm onSubmit={vi.fn()} />);
  expect(screen.getByText('Create Project')).toBeInTheDocument();
});
```

### Running Tests

```bash
# Backend
cd backend
pytest -v

# Frontend
cd frontend
npm run test
```

### Coverage Goals

- Services: 80%+ coverage
- API endpoints: 70%+ coverage
- Components: 60%+ coverage
- Utilities: 90%+ coverage

Never reduce coverage to make validation pass.

## Debugging

### Frontend

**React DevTools:**
```bash
# Install browser extension
# Open DevTools → Components tab
```

**Network requests:**
```bash
# Open DevTools → Network tab
# See all API calls
```

**Console logging:**
```typescript
console.log('value:', value);
console.error('error:', error);
```

### Backend

**Print debugging:**
```python
print(f"User ID: {user_id}")  # Shows in terminal
```

**Logging:**
```python
import logging
logger = logging.getLogger(__name__)
logger.info("Project created", extra={"project_id": project_id})
logger.error("Error:", exc_info=True)
```

**FastAPI docs:**
- Automatic Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

### Frontend

**Vercel:**
```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

**Manual build:**
```bash
npm run build
# Output in dist/
```

### Backend

**Deployment options:**
1. **Vercel** (serverless)
2. **Heroku** (`git push heroku main`)
3. **Railway** (Git integration)
4. **Render** (Git integration)

**Build locally:**
```bash
python -m pip install -e .
```

**Set environment variables** on hosting platform.

## Troubleshooting

### Frontend won't start

```bash
# Clear cache
rm -rf node_modules .vite
npm install
npm run dev
```

### Backend won't start

```bash
# Activate venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Reinstall dependencies
pip install -e ".[dev]"

fastapi dev app/main.py
```

### Database connection error

```bash
# Check .env has correct credentials
cat .env | grep SUPABASE

# Test connection
psql <connection-string>
```

### Tests failing

```bash
# Backend
pytest -v  # See what failed
pytest -k test_name --pdb  # Debug specific test

# Frontend
npm run test:ui  # Interactive UI
```

### RLS issues

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'projects';

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test with specific user
SET request.jwt.claims = '{"sub":"user-123"}';
SELECT * FROM projects;
```

## Performance

### Frontend

- Use `npm run build` to check bundle size
- Use Lighthouse in DevTools
- Monitor Network tab for slow requests

### Backend

- Use `pytest --cov` to find untested code
- Check database indexes
- Monitor query performance

### Database

- Add indexes on frequently queried columns
- Check for slow queries in Supabase dashboard
- Use `EXPLAIN ANALYZE` in SQL Editor

## Security Checklist

- [ ] No secrets in `.env.example`
- [ ] No `.env` files committed
- [ ] JWT validation on all protected endpoints
- [ ] Ownership checks on all modifications
- [ ] RLS policies tested
- [ ] Input validated with Pydantic
- [ ] No sensitive data logged
- [ ] HTTPS in production
- [ ] Service-role key never in frontend

## Resources

- [React documentation](https://react.dev)
- [FastAPI documentation](https://fastapi.tiangolo.com)
- [Supabase documentation](https://supabase.com/docs)
- [PostgreSQL documentation](https://www.postgresql.org/docs)
- [TypeScript handbook](https://www.typescriptlang.org/docs)
- [Python guide](https://docs.python.org/3)
