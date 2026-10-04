# Prompt: Verify and Ship

**Purpose:** After implementing a change, verify the actual running system works, collect evidence, and report the results clearly.

**When to use:** Invoke after implementing any feature, bug fix, or API change.

---

## Workflow

### 1. UNDERSTAND THE CHANGE

Before running any verification:

- [ ] Summarize what was implemented (what changed, why)
- [ ] Identify the scope: is this frontend-only, backend-only, full-stack?
- [ ] Identify what features are affected
- [ ] Reference the relevant section of [Feature Map](../.github/skills/verification/SKILL.md#feature-map)

### 2. STATIC VALIDATION

Without running the application:

- [ ] Run linting
  ```bash
  cd frontend && npm run lint
  cd backend && ruff check .
  ```
  
- [ ] Run type checking
  ```bash
  cd frontend && npm run type-check
  cd backend && pyright
  ```

- [ ] Run tests
  ```bash
  cd frontend && npm run test
  cd backend && pytest
  ```

- **Report:** ✅ or ❌ for each check with any errors/warnings

### 3. LAUNCH THE APPLICATION

Start all running services:

- [ ] Start backend
  ```bash
  cd backend
  source venv/bin/activate
  python -m uvicorn app.main:app --port 8000 --reload
  ```
  
- [ ] Start frontend
  ```bash
  cd frontend
  npm run dev
  ```

- [ ] Verify health
  ```bash
  curl http://localhost:8000/health
  # Expected: {"status": "ok"}
  ```

- **Report:** ✅ if both services started cleanly

### 4. DRIVE: TEST THE ACTUAL CHANGE

Execute the modified code in the running application.

**For API changes:**

1. Identify the endpoint affected
2. Call it with curl or browser Network tab
3. Verify response status, shape, and content
4. Test error cases (wrong auth, invalid input, ownership)
5. Verify any side effects (database changes, logs)

**For Frontend changes:**

1. Navigate to the affected page/component
2. Exercise the changed behavior
3. Check browser console for errors
4. Check Network tab for API calls
5. Verify the UI displays expected state

**For Database changes:**

1. Connect to Supabase or PostgreSQL
2. Verify schema matches expected state
3. Run test queries
4. Verify constraints and RLS policies
5. Test read/write operations

**For Authentication/Authorization changes:**

1. Test with authorized user (should succeed)
2. Test with unauthorized user (should fail with 403/404)
3. Test with no auth (should fail with 401)
4. Verify ownership checks work correctly

### 5. EVIDENCE: COLLECT PROOF

Document exactly what you tested and what happened.

**API call evidence:**
```bash
# Command run:
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "..."}'

# Response received:
# HTTP/1.1 201 Created
# {"id": "uuid-123", "name": "Test Project", ...}

# ✅ Status code correct
# ✅ Response shape matches schema
# ✅ No errors in backend logs
```

**Frontend test evidence:**
```
✅ Navigated to /projects
✅ Clicked "Create Project"
✅ Entered "Test Project" in name field
✅ Entered "Test Description" in description field
✅ Clicked Submit
✅ Network tab shows: POST /api/v1/projects → 201
✅ Browser console shows: no errors
✅ New project appears in the list immediately
✅ Refreshed page → project still appears
```

**Database evidence:**
```sql
-- Verified in Supabase dashboard:
SELECT * FROM projects ORDER BY created_at DESC LIMIT 1;
-- Result: new project with correct data

-- Verified RLS policy blocks unauthorized access:
-- (signed in as different user)
-- SELECT * FROM projects WHERE id = '<first-user-project-id>';
-- Result: empty (RLS blocked access)
```

### 6. CLEANUP

Stop services and reset state:

- [ ] Stop backend (Ctrl+C)
- [ ] Stop frontend (Ctrl+C)
- [ ] Clean up test data (if necessary)
- [ ] Leave no uncommitted environment changes

---

## Verification Checklist

For the change you implemented, verify:

- [ ] **Code quality**: Linting, type-checking, tests pass
- [ ] **Compilation/build**: No build errors
- [ ] **Backend running**: Health endpoint returns 200
- [ ] **Frontend running**: Loads without console errors
- [ ] **Core feature works**: Test the main changed functionality
- [ ] **Error handling**: Test error cases
- [ ] **Authorization**: Only authorized users can access
- [ ] **Data persistence**: Changes survive a refresh/restart
- [ ] **No side effects**: Didn't break other features
- [ ] **Evidence collected**: Have specific proof of what worked

---

## Report Template

Use this template to report verification results:

```markdown
## Change Summary
[Describe what was implemented]

## Scope
- **Type**: [Frontend / Backend / Database / Full-Stack]
- **Components affected**: [List]
- **Related Feature(s)**: [From Feature Map]

## Static Validation
- Linting: ✅ Pass / ❌ Fail
- Type checking: ✅ Pass / ❌ Fail
- Tests: ✅ Pass (N/N) / ❌ Fail

## Runtime Verification

### Application Health
- Backend: ✅ Running
- Frontend: ✅ Running
- Database: ✅ Connected
- Health check: ✅ 200 OK

### Feature Verification
[For each affected feature in Feature Map]

**Feature: [Name]**
- Test: [What was tested]
- Evidence: [curl output / screenshot / query result]
- Result: ✅ VERIFIED / ❌ FAILED / ⚠️ INCONCLUSIVE

### Error Case Verification
- Missing auth: ✅ Returns 401
- Invalid input: ✅ Returns 422
- Unauthorized access: ✅ Returns 403

### Data Integrity
- Changes persisted: ✅ Yes
- RLS enforced: ✅ Yes
- No stale data: ✅ Confirmed

## Final Result

| Check | Result |
|-------|--------|
| Compiles | ✅ |
| Tests pass | ✅ |
| Static validation | ✅ |
| Feature works in running app | ✅ |
| Authorization enforced | ✅ |
| No side effects | ✅ |

**Overall: ✅ READY TO SHIP**

### Evidence Summary
- Curl commands: [Count]
- API responses verified: [Count]
- Database queries tested: [Count]
- Frontend flows tested: [Count]
- Error cases tested: [Count]

### Not Verified / Limitations
[Any verification steps that were not possible or incomplete]

### Commands to Reproduce
[List exact commands to re-run verification]

---

## What NOT to report as verified:

❌ "Code looks correct" (without running it)  
❌ "Tests pass" (without saying which tests)  
❌ "No errors" (without showing logs)  
❌ "Works in my head" (without evidence)  

## What to report:

✅ "Ran test suite, 24/24 tests pass"  
✅ "Called endpoint, got 201 with expected response"  
✅ "Inspected database, saw new row with correct data"  
✅ "Navigated UI flow, verified all steps worked"  
✅ "RLS policy blocks unauthorized access (tested with 2 users)"  
```

---

## Common Scenarios

### Bug Fix

```markdown
## Change: Fix project deletion not working

## Issue
Users could not delete projects; API returned 500 error.

## Root Cause
Authorization dependency was not injected correctly in delete handler.

## Fix
Added `get_authorized_project` dependency to DELETE endpoint.

## Verification
✅ Called DELETE /api/v1/projects/{id} with valid token
✅ Got 204 No Content
✅ Verified project no longer in database
✅ Verified other user's projects not affected (RLS)
✅ Verified cannot delete with wrong token (403)
✅ Navigated to /projects, deleted project no longer in list

## Result: ✅ READY TO SHIP
```

### New Feature: Pagination

```markdown
## Change: Add pagination to list projects endpoint

## Feature
GET /api/v1/projects now supports ?limit=N&offset=M parameters

## Verification
✅ Ran full test suite: 45/45 tests pass
✅ Backend starts with no errors
✅ Frontend loads without console errors

✅ Tested pagination:
   - GET /api/v1/projects?limit=5&offset=0 returns first 5
   - GET /api/v1/projects?limit=5&offset=5 returns next 5
   - Response includes {"items": [...], "total": N, "limit": 5, "offset": 0}

✅ Tested defaults:
   - GET /api/v1/projects (no params) uses defaults
   - Defaults are limit=25, offset=0

✅ Tested error cases:
   - Negative limit returns 422
   - Non-numeric offset returns 422

✅ Database verified:
   - Query returns correct counts
   - No duplicate results across pages
   - Total count correct

✅ Frontend integration:
   - Projects page loads successfully
   - List shows first page of projects
   - Navigation works (though pagination UI not implemented yet)

## Result: ✅ READY TO SHIP
```

### Database Migration

```markdown
## Change: Add "archived" column to projects

## Migration
Added "archived BOOLEAN DEFAULT false" to projects table

## Verification
✅ Backend started, migration applied successfully
✅ Verified schema: projects table now has archived column
✅ Ran test queries:
   - INSERT with archived=true works
   - INSERT without archived defaults to false
   - SELECT filters work correctly
   - UPDATE archived column works

✅ Verified RLS policies still work:
   - User A cannot see User B's archived projects
   - User A cannot update User B's archived status

✅ Verified no data loss:
   - SELECT COUNT(*) FROM projects: 42 rows (same as before)
   - All existing data preserved

✅ Application layer:
   - API still works (archived param not yet exposed, but doesn't break)
   - Existing endpoints still return projects correctly

## Result: ✅ READY TO SHIP
```

---

## When Verification Fails

If a check fails:

1. **Stop**: Do not proceed to shipping
2. **Diagnose**: Check logs, database, browser console
3. **Understand**: What was the root cause?
4. **Fix**: Update the implementation
5. **Re-verify**: Run the check again
6. **Document**: Note what was wrong and how it was fixed

**Example:**

```markdown
## Issue Found: DELETE returning 500

### Investigation
- Backend log shows: "AttributeError: 'NoneType' object has no attribute 'id'"
- Tracked to: Authorization dependency returning None

### Root Cause
Authorization was not injected in the route handler

### Fix
Added `authorized_project: Project = Depends(get_authorized_project)` to delete handler

### Re-verification
✅ DELETE /api/v1/projects/{id} now returns 204
✅ Database shows project deleted
✅ Other features still work

### Result: ✅ NOW READY TO SHIP
```

---

## Integration with CI/CD

This workflow can be automated:

1. Code is pushed to PR
2. CI runs: linting, type-checking, tests
3. After merge to main, run this verification workflow
4. If all checks pass, create deployment request
5. If any check fails, block deployment and notify team

---

## Key Takeaway

**Never claim a change works without evidence.**

"It compiles" ≠ "It works"  
"Tests pass" ≠ "It works in production"  
"Code looks good" ≠ "It works"  

**Proof comes from the actual running application.**
