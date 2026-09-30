# Architecture

## System Overview

This is a three-tier architecture:

```
Frontend              Backend              Database
───────────           ───────             ────────
React + TS            FastAPI             Supabase
Vite                  Python 3.12+        PostgreSQL
TypeScript            Pydantic            Auth + RLS
ESLint               Ruff + Pyright
Vitest                pytest
```

## Responsibilities

### Frontend (React + TypeScript)

**What it does:**
- Renders the user interface
- Captures user interactions
- Manages client-side state
- Authenticates users (via Supabase Auth UI)
- Calls FastAPI endpoints
- Displays loading, error, and empty states

**What it does NOT:**
- Access the database directly
- Store or use private API keys
- Enforce authorization (server does)
- Run business logic

**Key files:**
- `src/components/` — Reusable React components
- `src/pages/` — Full page components
- `src/hooks/` — Custom React hooks
- `src/lib/api.ts` — API client
- `src/lib/auth.ts` — Supabase Auth integration

### Backend (FastAPI + Python)

**What it does:**
- Serves RESTful API endpoints
- Validates authentication (JWT from Supabase)
- Enforces authorization (ownership checks)
- Implements business logic
- Validates input (Pydantic)
- Returns consistent error responses

**What it does NOT:**
- Trust client-side authorization
- Accept unvalidated input
- Expose internal implementation details

**Key files:**
- `app/api/` — API route handlers
- `app/services/` — Business logic
- `app/schemas/` — Pydantic request/response models
- `app/models/` — SQLAlchemy database models
- `app/core/auth.py` — JWT validation

### Database (Supabase PostgreSQL)

**What it does:**
- Persists data
- Enforces RLS policies (database-level access control)
- Handles authentication (Supabase Auth)
- Provides authentication for backend

**What it does NOT:**
- Expose data without RLS
- Allow unauthenticated access
- Execute business logic

**Key components:**
- `auth.users` table (managed by Supabase)
- `projects` table (user data)
- RLS policies on all tables

## Data Flow

### Authentication Flow

```
1. User signs up/logs in in React → Supabase Auth
                                        ↓
2. Supabase returns JWT token to React
                                        ↓
3. React stores token in browser (e.g., cookie or localStorage)
                                        ↓
4. React includes token in HTTP headers for API calls
                        ↓
5. FastAPI validates token with Supabase
                        ↓
6. FastAPI extracts user_id from token claims
                        ↓
7. FastAPI uses user_id to enforce authorization
```

### Project CRUD Flow

```
Frontend                Backend              Database
────────────            ──────────          ────────
GET /projects ──────────→
   [user_id in JWT]
                      Validate JWT
                      Extract user_id
                        ↓
                  SELECT * FROM projects
                  WHERE owner_id = user_id
                        ↓ (with RLS)
                        ↓
        ←──────────── [project list]
[Display projects]
```

## API Specification

### Base URL
- Development: `http://localhost:8000`
- Production: `https://api.example.com`

### Authentication

All endpoints (except `/health`) require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

The token comes from Supabase Auth in the frontend.

### Endpoints

#### Health Check
```
GET /health

Response: 200 OK
{
  "status": "ok"
}
```

#### Projects

```
GET /api/v1/projects
→ List authenticated user's projects
← 200: [{ id, owner_id, name, description, created_at, updated_at }, ...]
← 401: Unauthorized (no token)

POST /api/v1/projects
→ Create new project
← 201: { id, owner_id, name, description, created_at, updated_at }
← 400: Bad request (validation error)
← 401: Unauthorized

GET /api/v1/projects/{id}
→ Get project details
← 200: { id, owner_id, name, description, created_at, updated_at }
← 404: Not found
← 403: Forbidden (not owner)
← 401: Unauthorized

PATCH /api/v1/projects/{id}
→ Update project
← 200: { id, owner_id, name, description, created_at, updated_at }
← 400: Bad request
← 403: Forbidden (not owner)
← 404: Not found
← 401: Unauthorized

DELETE /api/v1/projects/{id}
→ Delete project
← 204: No content
← 403: Forbidden (not owner)
← 404: Not found
← 401: Unauthorized
```

## Security Boundaries

### Trust Boundaries

**Trusted:**
- Supabase Auth (generates tokens)
- Backend (validates tokens, enforces auth/authz)
- Database RLS (enforces row-level access)

**Not Trusted:**
- Frontend (user can modify local code, storage, cookies)
- Client input (always validate on server)

### What the Frontend Cannot Do

- Access service-role keys
- Access database credentials
- Make direct database queries
- Bypass authentication
- Assume authorization succeeded

### What the Backend MUST Do

- Validate every JWT
- Extract user_id from token
- Check resource ownership before returning
- Validate all input
- Never trust client authorization

### What RLS MUST Do

- Prevent unauthorized SELECT
- Prevent unauthorized INSERT
- Prevent unauthorized UPDATE
- Prevent unauthorized DELETE
- Be explicit and testable

## Error Handling

### HTTP Status Codes

```
200 OK
201 Created (POST)
204 No Content (DELETE)

400 Bad Request (validation, client error)
401 Unauthorized (missing/invalid auth)
403 Forbidden (authenticated but no permission)
404 Not Found (resource doesn't exist)
422 Unprocessable Entity (Pydantic validation)

500 Internal Server Error (unexpected error)
```

### Error Response Format

```json
{
  "detail": "Resource not found"
}
```

Or for validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Scalability Considerations

### Stateless Backend

- All state in database (PostgreSQL)
- No in-memory session storage
- Easy to scale horizontally
- Can deploy multiple instances

### Database

- PostgreSQL can handle millions of rows
- Indexes on foreign keys
- RLS doesn't significantly impact performance
- Connection pooling via Supabase

### Frontend

- Built with Vite (fast)
- Code splitting for large apps
- Can be deployed to CDN

## Testing Strategy

### Unit Tests
- Service methods in isolation
- Input validation
- Business logic

### Integration Tests
- Full API endpoint flow
- Authentication/authorization
- Database queries

### Component Tests
- React component rendering
- User interactions
- Loading/error states

### E2E Tests (future)
- Complete user workflows
- Signup → Login → Create Project

## Deployment

### Frontend
- Build with `npm run build`
- Deploy to Vercel
- Environment variables in `.env`

### Backend
- Build with `python -m pip install -e .`
- Deploy to Vercel, Heroku, Railway, etc.
- Environment variables on platform

### Database
- Supabase handles deployment
- Migrations run via SQL editor
- RLS policies version-controlled

## Monitoring & Observability

### Logging
- Backend logs to stdout
- Errors logged with context
- Never log sensitive data

### Health Checks
- `GET /health` for uptime monitoring

### Metrics (future)
- Request latency
- Error rates
- Database query performance
