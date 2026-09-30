# Security Guidelines

## Principles

1. **Defense in depth**: Multiple layers of security
2. **Least privilege**: Users only access what they need
3. **Fail secure**: Deny by default, allow explicitly
4. **Server-side trust**: Never trust client-side security
5. **Secrets protected**: Environment-based, never committed

## Authentication

### Supabase Auth

We use Supabase's managed authentication service.

**Signup/Login**
- Users sign up with email/password via Supabase Auth UI
- Supabase manages password hashing
- Supabase generates JWT tokens

**JWT Tokens**
- Issued by Supabase
- Contain `sub` (subject/user_id) claim
- Short-lived (configurable, usually 1 hour)
- Signed and verified

**Frontend**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get session
const { data, error } = await supabase.auth.getSession();
// data.session.access_token is the JWT
```

**Backend**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPCredentials = Depends(security)
) -> str:
    """Extract and validate JWT."""
    token = credentials.credentials
    try:
        # Verify with Supabase
        payload = decode_jwt(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
        return user_id
    except Exception:
        raise HTTPException(status_code=401)
```

## Authorization

### Server-Side Checks

Always verify resource ownership before returning data:

```python
# BAD - trusts client
@router.get("/{project_id}")
async def get_project(project_id: str):
    project = db.query(Project).filter(Project.id == project_id).first()
    return project

# GOOD - verifies ownership
@router.get("/{project_id}")
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404)
    if project.owner_id != user_id:
        raise HTTPException(status_code=403)  # Forbidden
    return project
```

### HTTP Status Codes

- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but no permission

Example:
```python
# User not logged in
if not user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")

# User logged in but doesn't own resource
if project.owner_id != user_id:
    raise HTTPException(status_code=403, detail="Forbidden")
```

## Database Security

### Row Level Security (RLS)

Every table with user data has RLS enabled.

**Enable RLS**
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

**Write Explicit Policies**

For `projects` table owned by user:

```sql
-- SELECT: Users can only read their own projects
CREATE POLICY "users_select_own_projects" ON projects
  FOR SELECT
  USING (auth.uid() = owner_id);

-- INSERT: Users can only create projects for themselves
CREATE POLICY "users_insert_own_projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Users can only update their own projects
CREATE POLICY "users_update_own_projects" ON projects
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- DELETE: Users can only delete their own projects
CREATE POLICY "users_delete_own_projects" ON projects
  FOR DELETE
  USING (auth.uid() = owner_id);
```

**Test RLS Locally**

```sql
-- Set user context
SET request.jwt.claims = '{"sub":"user-uuid"}';

-- This should only show projects owned by user-uuid
SELECT * FROM projects;
```

### Never Commit Database Credentials

- Service-role key is in `.env` (in `.gitignore`)
- Never use service-role key in frontend
- Only use anon key in frontend
- Only use service-role key in backend (if needed at all)

### SQL Injection Prevention

Always use parameterized queries (SQLAlchemy/Pydantic handle this):

```python
# GOOD - SQLAlchemy handles escaping
user = db.query(Project).filter(Project.id == project_id).first()

# BAD - vulnerable to SQL injection (don't do this)
user = db.execute(f"SELECT * FROM projects WHERE id = {project_id}")
```

## Input Validation

### Pydantic Validation

Validate all request data with Pydantic:

```python
from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

@router.post("/api/v1/projects")
async def create_project(
    data: ProjectCreate,
    user_id: str = Depends(get_current_user)
):
    # data is already validated
    project = Project(
        owner_id=user_id,
        name=data.name,
        description=data.description
    )
    db.add(project)
    db.commit()
    return project
```

### Whitelist Allowed Fields

Never allow arbitrary field updates:

```python
# GOOD - only allow specific fields
class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

@router.patch("/{project_id}")
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    user_id: str = Depends(get_current_user)
):
    project = get_and_verify_ownership(project_id, user_id)
    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    db.commit()
    return project
```

## Secrets Management

### Environment Variables

**Frontend (.env.local)**
- Only public variables (VITE_*)
- Safe to commit as `.env.example`
- Example:
  ```
  VITE_SUPABASE_URL=https://project.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  VITE_API_URL=http://localhost:8000
  ```

**Backend (.env)**
- NEVER commit (in `.gitignore`)
- Contains service-role key
- Example:
  ```
  SUPABASE_URL=https://project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
  ```

### Never Hardcode Secrets

```python
# BAD
API_KEY = "sk_live_abc123..."

# GOOD
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    api_key: str
    class Config:
        env_file = ".env"
settings = Settings()
```

### Never Log Secrets

```python
# BAD
logger.info(f"User {user_id} with token {token} logged in")

# GOOD
logger.info(f"User {user_id} logged in")
```

## HTTPS & Transport Security

### Production

- Always use HTTPS (not HTTP)
- Set `Secure` flag on cookies
- Set `SameSite=Strict` on cookies
- Use HSTS headers

### Development

- HTTP is okay for localhost
- Use HTTPS on deployed environments

## API Security

### CORS

Configure CORS carefully:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # dev frontend
        "https://example.com"      # production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting

Consider rate limiting for:
- Login attempts
- API endpoints
- File uploads

(Can be added via FastAPI middleware or Vercel config)

## Security Checklist

- [ ] No secrets in code
- [ ] No secrets in git history
- [ ] JWT validated on every protected endpoint
- [ ] User ownership checked on GET (if needed), always on POST/PATCH/DELETE
- [ ] RLS enabled on all tables with user data
- [ ] RLS policies tested
- [ ] Input validated with Pydantic
- [ ] Error messages don't reveal internals
- [ ] Sensitive data not logged
- [ ] No direct database access from frontend
- [ ] Service-role key never in frontend code
- [ ] HTTPS in production
- [ ] Secure cookies (Secure, HttpOnly, SameSite)

## Reporting Security Issues

Do not open public issues for security vulnerabilities.

Contact: [security email or form]

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)
