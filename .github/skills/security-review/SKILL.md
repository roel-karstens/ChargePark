# Security Review Skill

**Use this skill when:**
- Reviewing code for security vulnerabilities
- Implementing authentication or authorization
- Handling sensitive data
- Integrating external services
- Designing database access
- Creating API endpoints
- Auditing existing features

## Review Checklist

### Authentication

- [ ] JWT tokens properly validated
- [ ] Authentication required on all protected endpoints
- [ ] Expired tokens are rejected
- [ ] Token payload verified with Supabase
- [ ] Invalid tokens return 401
- [ ] Token extraction doesn't trust client input
- [ ] No hardcoded credentials

**Verify:**
```python
# ✅ Good: Uses FastAPI dependency to extract and validate
async def get_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user),  # Validates JWT
):
    ...

# ❌ Bad: Trusts user_id from request
async def get_project(
    project_id: UUID,
    user_id: str,  # Can be spoofed!
):
    ...
```

### Authorization

- [ ] Resource ownership checked before returning data
- [ ] User ID extracted from token (not from request)
- [ ] Permission checks happen on server
- [ ] Insufficient permissions return 403
- [ ] Not found and forbidden are distinguished (404 vs 403)
- [ ] No privilege escalation possible
- [ ] Batch operations check ownership of each item

**Verify:**
```python
# ✅ Good: Checks ownership before returning
project = db.query(Project).filter(Project.id == project_id).first()
if not project:
    raise HTTPException(status_code=404)
if project.owner_id != user_id:  # From token
    raise HTTPException(status_code=403)

# ❌ Bad: Doesn't check ownership
project = db.query(Project).filter(Project.id == project_id).first()
return project  # Any user can access!
```

### Database Security (RLS)

- [ ] RLS enabled on all user data tables
- [ ] RLS policies are explicit (not permissive)
- [ ] SELECT policies prevent unauthorized reads
- [ ] INSERT policies prevent unauthorized writes
- [ ] UPDATE policies prevent unauthorized updates
- [ ] DELETE policies prevent unauthorized deletes
- [ ] Policies use `auth.uid()` for ownership checks
- [ ] No overly broad `USING (true)` policies

**Verify:**
```sql
-- ✅ Good: Explicit ownership-based policy
CREATE POLICY "users_select_own_projects" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

-- ❌ Bad: Too permissive
CREATE POLICY "anyone_can_read" ON projects
  FOR SELECT USING (true);
```

### Input Validation

- [ ] All inputs validated on server
- [ ] Pydantic schemas used for request validation
- [ ] String lengths validated
- [ ] Email format validated
- [ ] Numeric ranges validated
- [ ] Enums used for fixed choices
- [ ] SQL injection prevented (ORM used)
- [ ] Type coercion handled safely

**Verify:**
```python
# ✅ Good: Pydantic validation
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

# ❌ Bad: No validation
@router.post("/projects")
async def create_project(data: dict):
    # Dangerous: can have any shape
    ...
```

### Secrets Management

- [ ] No hardcoded secrets in code
- [ ] Secrets stored in `.env` (not committed)
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` documents variables
- [ ] Secrets never logged
- [ ] Service-role keys never exposed to frontend
- [ ] API keys scoped to least privileges
- [ ] Secrets never in comments
- [ ] Secrets never in error messages
- [ ] No test secrets in production

**Verify:**
```python
# ✅ Good: Uses environment variable
service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# ❌ Bad: Hardcoded
service_role_key = "sk_live_abc123..."

# ❌ Bad: Logged
logging.warning(f"Token: {token}")  # Don't do this
```

### Data Protection

- [ ] Sensitive data not logged unnecessarily
- [ ] Passwords never stored in plain text
- [ ] Tokens not stored permanently
- [ ] User data properly isolated
- [ ] PII not exposed in error messages
- [ ] Data encrypted in transit (HTTPS)
- [ ] User data deleted on account deletion (CASCADE)
- [ ] Soft deletes considered if needed

**Verify:**
```python
# ✅ Good: No sensitive data in logs
logger.info(f"User {user_id} authenticated")  # Safe

# ❌ Bad: Exposes token
logger.info(f"Token: {token}")  # Never do this

# ❌ Bad: Exposes password
logger.debug(f"Password: {password}")  # Never do this
```

### API Security

- [ ] POST used for state changes (not GET)
- [ ] DELETE returns 204 No Content (not 200)
- [ ] PATCH used for partial updates (not PUT)
- [ ] HTTP methods match intent
- [ ] Rate limiting considered
- [ ] Error messages generic (no internal details)
- [ ] Stack traces never sent to client
- [ ] CORS properly configured

**Verify:**
```python
# ✅ Good: Appropriate status codes
@router.delete("/{id}")
async def delete_project(...) -> None:
    ...
    return None  # 204 No Content

# ❌ Bad: Wrong method for mutation
@router.get("/projects", params={"delete_id": ...})
async def delete_project():  # GET shouldn't modify state!
    ...
```

### CORS Configuration

- [ ] CORS origins explicitly defined
- [ ] No `allow_origins=["*"]` in production
- [ ] Credentials allowed only with specific origins
- [ ] Frontend origin matches deployment URL
- [ ] Preflight requests handled

**Verify:**
```python
# ✅ Good: Specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",  # Production
        "http://localhost:5173",  # Development
    ],
    allow_credentials=True,
)

# ❌ Bad: Too permissive
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dangerous
)
```

### Database Constraints

- [ ] Foreign key constraints present
- [ ] ON DELETE CASCADE for owned data
- [ ] ON DELETE RESTRICT for shared data
- [ ] UNIQUE constraints prevent duplicates
- [ ] CHECK constraints enforce valid values
- [ ] NOT NULL on required columns
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently filtered columns

### External Integrations

- [ ] External APIs called securely
- [ ] API keys never exposed
- [ ] Requests validated before sending
- [ ] Responses validated before trusting
- [ ] Timeouts set to prevent hanging
- [ ] Error handling for external service failures
- [ ] No credentials passed in URL

### Dependencies

- [ ] Third-party packages reviewed
- [ ] No unvetted dependencies
- [ ] Known vulnerabilities checked
- [ ] Packages kept updated
- [ ] Minimal dependencies used
- [ ] License compliance checked

### Production Configuration

- [ ] HTTPS enabled
- [ ] Secure cookie flags set
- [ ] HSTS header set (if applicable)
- [ ] X-Frame-Options header set
- [ ] Content-Security-Policy headers set
- [ ] No debugging enabled
- [ ] Logging doesn't expose secrets
- [ ] Monitoring and alerting configured

## Severity Levels

**Critical** (fix immediately):
- Authentication bypassed
- Authorization bypassed
- Secrets exposed
- SQL injection possible
- RLS allows unauthorized access
- Sensitive data leaked

**High** (fix before release):
- Missing authentication
- Missing authorization
- Weak validation
- Insecure defaults
- Information disclosure

**Medium** (fix soon):
- Hardening recommendations
- Weak cryptography
- Missing security headers
- Inadequate logging

**Low** (nice to have):
- Code quality
- Documentation
- Best practices

## Pattern: Secure CRUD Endpoint

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.dependencies import get_db
from app.schemas.project import ProjectCreate, ProjectRead

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

# Authentication required
@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,  # Validated with Pydantic
    user_id: str = Depends(get_current_user),  # From token
    db: Session = Depends(get_db),
) -> ProjectRead:
    """Create project for authenticated user."""
    project = Project(
        owner_id=user_id,  # Always use user_id from token
        name=data.name,
        description=data.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# Authorization check on read
@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user),  # From token
    db: Session = Depends(get_db),
) -> ProjectRead:
    """Get project only if owner."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if str(project.owner_id) != user_id:  # Check ownership
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    return project

# Authorization check on update
@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    user_id: str = Depends(get_current_user),  # From token
    db: Session = Depends(get_db),
) -> ProjectRead:
    """Update project only if owner."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if str(project.owner_id) != user_id:  # Check ownership
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    if data.name:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    
    db.commit()
    db.refresh(project)
    return project

# Authorization check on delete
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user),  # From token
    db: Session = Depends(get_db),
) -> None:
    """Delete project only if owner."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if str(project.owner_id) != user_id:  # Check ownership
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    db.delete(project)
    db.commit()
```

## See Also

- `docs/security.md` — Security guidelines
- `.github/instructions/backend.instructions.md` — Backend patterns
- `.github/prompts/security-review.prompt.md` — Standalone review prompt
