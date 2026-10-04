# Verification Maintenance Skill

**Purpose**: Keep the Verification Skill and Feature Map from becoming stale as the application evolves.

---

## When to Use This Skill

Run this skill when:
- Adding a new feature or endpoint
- Removing or changing existing features
- Modifying API contracts or responses
- Changing authentication/authorization behavior
- Updating the database schema
- Fixing bugs that changed expected behavior
- Quarterly review (even if no changes)

---

## Maintenance Workflow

### 1. INSPECT: Understand current application state

**List all API endpoints:**

```bash
# Look at backend router files
grep -r "router.get\|router.post\|router.patch\|router.delete" backend/app/api/

# Example output:
# backend/app/api/health.py: router.get("/health")
# backend/app/api/projects.py: router.get("", response_model=List[ProjectResponse])
# backend/app/api/projects.py: router.post("", response_model=ProjectResponse)
# backend/app/api/projects.py: router.get("/{id}", response_model=ProjectResponse)
# backend/app/api/projects.py: router.patch("/{id}", response_model=ProjectResponse)
# backend/app/api/projects.py: router.delete("/{id}", status_code=204)
```

**Check database schema:**

```bash
# Connect to Supabase or PostgreSQL
# Then run:
\dt                          # list tables
\d projects                  # show projects table schema
SELECT tablename FROM information_schema.tables WHERE table_schema = 'public';
```

**Review authentication setup:**

```bash
# Look for auth configuration
cat backend/app/core/auth.py
# Check for:
# - JWT validation
# - Token extraction
# - User ID extraction from claims
```

**Check RLS policies:**

```bash
# In Supabase dashboard or psql:
SELECT * FROM pg_policies WHERE tablename = 'projects';

# Or manually:
SELECT schemaname, tablename, policyname, qual FROM pg_policies;
```

**Scan frontend routes:**

```bash
# Look at page components
ls -la frontend/src/pages/

# Check what user flows exist
grep -r "useQuery\|useMutation\|GET\|POST\|PATCH\|DELETE" frontend/src/pages/
```

### 2. COMPARE: Identify what's missing from the Verification Skill

For each endpoint found:

```
Endpoint: GET /api/v1/projects
├─ Is it documented in [Feature Map](verification/SKILL.md#feature-map)?
├─ Does it have evidence criteria defined?
├─ Are all response codes documented?
└─ Is the verification procedure clear?
```

Create a quick audit:

```markdown
## Audit Results

Endpoints that EXIST and ARE documented:
- ✅ GET /health
- ✅ GET /api/v1/projects
- ✅ POST /api/v1/projects
- ✅ GET /api/v1/projects/{id}
- ✅ PATCH /api/v1/projects/{id}
- ✅ DELETE /api/v1/projects/{id}

Endpoints that EXIST but are NOT documented:
- ❌ (none)

Endpoints that ARE documented but no longer EXIST:
- ❌ (none)

Features that have CHANGED:
- ⚠️ (none documented as changes)
```

### 3. LIVE VERIFY: Test current behavior

If practical, verify the application actually behaves as documented:

```bash
# Start the application
cd backend && python -m uvicorn app.main:app --port 8000 --reload &
cd frontend && npm run dev &

# Verify key features work
curl http://localhost:8000/health
# → Should return {"status": "ok"}

# Test a protected endpoint without auth
curl http://localhost:8000/api/v1/projects
# → Should return 401 Unauthorized

# Test with auth
# (requires getting a real token from Supabase or dev mode)
```

### 4. UPDATE: Modify the Verification Skill

If the audit found discrepancies:

**New Endpoint:**
1. Add section to Feature Map
2. Define "What it does"
3. Define evidence criteria (the ✅ checks)
4. Write "How to verify" steps
5. Add response examples

**Changed Endpoint:**
1. Update "What it does" if behavior changed
2. Update evidence criteria if expectations changed
3. Update "How to verify" if process changed
4. Note the change date

**Removed Endpoint:**
1. Remove the feature section
2. Update Feature Map summary if applicable

**Example update (new endpoint):**

```markdown
#### List Projects (Paginated) ← NEW in v0.2.0
**What it does:** Fetches projects with pagination support.

**Evidence that proves it works:**
- ✅ GET `/api/v1/projects?limit=10&offset=0` returns 200 OK
- ✅ Response includes `{"items": [...], "total": N}`
- ✅ Pagination parameters are respected
- ✅ Missing pagination params use defaults

**How to verify:**
\`\`\`bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8000/api/v1/projects?limit=5&offset=0"

# Expected response:
# {
#   "items": [...],
#   "total": 25,
#   "limit": 5,
#   "offset": 0
# }
\`\`\`
```

### 5. REGRESSION TEST: Verify nothing broke

After updating the skill:

```bash
# Run the full test suite
cd backend && pytest

# Run linting
cd backend && ruff check .
cd frontend && npm run lint

# Manually verify critical paths still work
# (see verification SKILL → Feature Map → Verification Checklist)
```

### 6. DOCUMENT: Record what changed

Update or create a MAINTENANCE_LOG if needed:

```markdown
## Verification Skill Maintenance Log

### 2026-10-04: Post-initial implementation review
- Status: ✅ All documented features verified
- Endpoints: 6/6 match documentation
- RLS policies: 4/4 present and working
- Next review: 2026-11-04

### 2026-10-11: Added pagination feature
- Added: "List Projects (Paginated)" to Feature Map
- Updated: "How to verify" section with limit/offset params
- Tested: New pagination parameters work correctly
- Next review: 2026-11-11
```

---

## When to Add or Remove Features

### Add to Feature Map when:
- New endpoint is merged to main
- New user flow is enabled
- New error case is introduced
- New authorization rule is added

### Remove from Feature Map when:
- Endpoint is deleted
- Feature is deprecated and removed
- User flow is no longer supported

### Don't remove when:
- Endpoint is temporarily unavailable (add to "Known Limitations" instead)
- Feature is behind a flag (document the flag)
- Feature is only for certain user types (document the conditions)

---

## Quarterly Review

Even if no code changed, review quarterly:

1. **Run the Feature Map verification checks** against the live application
2. **Verify all curl commands still work** and return expected responses
3. **Test critical user flows** in the browser
4. **Check for any new endpoints** that aren't documented
5. **Verify RLS policies** are still present and correct
6. **Document any drift** between documentation and reality

---

## Decision Tree

```
Are you making a change?
│
├─ YES: Is it a code change?
│  │
│  ├─ YES (API endpoint, auth logic, RLS policy)
│  │  └─→ Change implementation
│  │  └─→ Update Feature Map
│  │  └─→ Run verification checks
│  │  └─→ Confirm tests pass
│  │
│  └─ NO (documentation update only)
│     └─→ Update Feature Map only
│
└─ NO: Just doing maintenance
   └─→ Run audit
   └─→ Verify critical paths
   └─→ Update Feature Map if drift detected
```

---

## What NOT to Do

❌ **Do NOT** modify application code just to hide a verification failure.  
→ Fix the actual root cause instead.

❌ **Do NOT** delete features from the Feature Map without removing the code.  
→ Keep documentation in sync with implementation.

❌ **Do NOT** add features to the Feature Map without verifying they actually work.  
→ Verification is evidence-based, not aspirational.

❌ **Do NOT** skip verification because the change "looks correct".  
→ Prove it works on the running system.

---

## Tools and Resources

**Check current endpoints:**
```bash
# Grep backend routes
grep -r "@router\.\(get\|post\|patch\|delete\)" backend/app/api/

# Or inspect SwaggerUI (if Supabase/FastAPI auto-docs available)
# http://localhost:8000/docs
```

**Inspect database schema:**
```bash
# Connect to Supabase
# Database → Table Editor → select table
# Security → Row Level Security → review policies
```

**Verify RLS policies:**
```sql
-- In Supabase SQL editor or psql:
SELECT schemaname, tablename, policyname, QUAL, WITH_CHECK 
FROM pg_policies 
WHERE tablename = 'projects';
```

**Check application logs:**
```bash
# Backend startup logs show:
# ✅ Database tables created successfully
# 🔐 Setting up RLS policies...
# Both should appear on every startup
```

---

## Examples of Maintenance

### Example 1: New endpoint added

**What changed:** Team added `GET /api/v1/projects/{id}/collaborators`

**Maintenance steps:**
1. Grep and find the new endpoint
2. Check swagger docs or code to understand what it returns
3. Add section to Feature Map: "List Project Collaborators"
4. Define evidence: response shape, access control, error cases
5. Write curl verification command
6. Test it works
7. Update MAINTENANCE_LOG

### Example 2: Endpoint behavior changed

**What changed:** `GET /api/v1/projects` now returns paginated results instead of all projects

**Maintenance steps:**
1. Notice the response shape changed
2. Update Feature Map "List Projects" section
3. Update evidence criteria (if total/limit fields changed)
4. Update curl commands with new params
5. Re-run verification
6. Document "Changed in v0.2.0" in Feature Map
7. Update MAINTENANCE_LOG

### Example 3: RLS policy was fixed

**What changed:** RLS policy `users_insert_own_projects` was buggy, now fixed

**Maintenance steps:**
1. Update evidence in Feature Map "Projects RLS Enforcement"
2. Re-verify the fixed behavior (another user cannot insert to your projects)
3. Document the date of the fix
4. Update MAINTENANCE_LOG with "RLS fix verification passed"

---

## Integration with Verification Skill

After maintaining the Feature Map:
- Other AI agents can reference the updated Feature Map
- They know exactly what to verify
- They have clear evidence criteria
- They can tell when verification passes or fails
