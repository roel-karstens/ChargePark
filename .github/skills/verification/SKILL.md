# Verification Skill

**Philosophy**: "It compiles" is not evidence that the application works. AI must verify the real running system.

This skill teaches how to verify changes using actual runtime evidence rather than static analysis alone.

---

## When to Use This Skill

**Use this skill when:**
- Implementing a feature
- Fixing a bug
- Changing an API endpoint
- Modifying database schemas or RLS policies
- Changing authentication/authorization logic
- Modifying critical business logic
- You need to prove the change actually works

**Do NOT rely solely on:**
- Linting passing
- Tests passing (though tests are necessary)
- TypeScript compilation
- Code review without runtime evidence

---

## Verification Phases

### 1. LAUNCH: Start the application

Before verifying anything, ensure the application is running and healthy.

**Start Backend:**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
🔧 Starting up...
✅ Database tables created successfully
🔐 Setting up RLS policies...
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in 245 ms

➜  Local:   http://localhost:5173/
```

**Environment Variables Required:**
- Backend: `.env` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Frontend: `.env.local` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

### 2. DOCTOR: Verify health

Confirm the system is healthy before testing your change.

**Health Endpoint:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok"}
```

**Frontend Load:**
- Navigate to http://localhost:5173
- Confirm page loads without console errors
- Check browser console (F12) for errors/warnings

**Database Connection:**
```bash
# In backend shell (after starting backend):
python -c "from app.dependencies import engine; print(engine)"
```

Expected output: Engine connected successfully (no exceptions)

**Check Supabase Auth:**
- Supabase project is created
- URL and keys are correct
- RLS is enabled (backend logs should show "Setting up RLS policies")

### 3. DRIVE: Execute the actual change

Interact with the running application to exercise the modified code.

**For API Changes:**

1. Identify the affected endpoint from [Feature Map](#feature-map)
2. Call the endpoint with real HTTP requests
3. Use `curl`, Postman, or browser network tools
4. Verify the response matches expected behavior

**For Frontend Changes:**

1. Identify the affected user flow
2. Manually navigate through the flow in the browser
3. Inspect browser console (F12 → Console tab) for errors
4. Inspect network tab (F12 → Network tab) for request/response details
5. Verify the visible UI matches expectations

**For Database Changes:**

1. Connect to Supabase PostgreSQL (use dashboard or CLI)
2. Execute test queries against the changed tables
3. Verify constraints, indexes, and RLS policies are present
4. Test read/write permissions for different user scenarios

**For Authentication/Authorization:**

1. Sign in as a test user
2. Verify JWT token is present and valid
3. Test that unauthorized access is blocked (401/403 responses)
4. Test that ownership checks work correctly

### 4. EVIDENCE: Collect proof

Document exactly what you verified and what the results were.

**API Evidence:**
- Request URL
- Request method and headers
- Request body (if any)
- Response status code
- Response body (relevant fields only)
- Timestamp or log entry

**Frontend Evidence:**
- User flow description
- Screenshots or console output
- Network requests (status codes, response shapes)
- No errors in browser console
- Expected UI state achieved

**Database Evidence:**
- Schema inspection (CREATE TABLE statement)
- Query results showing data integrity
- RLS policy verification
- Constraint validation

**Authentication Evidence:**
- Token inspection (decoder such as jwt.io if needed)
- Successful auth flow from signup/login
- Protected endpoint returns 401 for missing auth
- Protected endpoint returns 403 for wrong ownership
- User can only access their own data

### 5. CLEANUP: Stop and reset

When done verifying, clean up processes and restore state.

**Stop Backend:**
```bash
# Press Ctrl+C in the backend terminal
```

**Stop Frontend:**
```bash
# Press Ctrl+C in the frontend terminal
```

**Reset Test Data (if needed):**
```bash
# If you created test data in Supabase, delete it:
# Use Supabase dashboard → Table Editor → select test row → Delete
# or use a cleanup script
```

**Restore Environment:**
- Do NOT commit `.env` files
- Do NOT leave uncommitted test data in production databases
- Do NOT leave backend/frontend processes running

---

## Feature Map

This section documents all user-facing and system-level features. For each feature, it describes exactly what evidence proves the feature works.

### Authentication & Authorization

#### Sign Up (New User)
**What it does:** Creates a new user account via Supabase Auth.

**Evidence that proves it works:**
- ✅ Email and password are accepted
- ✅ User receives confirmation email (if required by Supabase settings)
- ✅ User can sign in immediately after
- ✅ JWT token is returned in response
- ✅ User can access `/api/v1/projects` with token
- ✅ User data is stored in `auth.users` table

**How to verify:**
```bash
# 1. Navigate to http://localhost:5173/auth
# 2. Click "Sign Up"
# 3. Enter email: testuser+TIMESTAMP@example.com
# 4. Enter password: TestPassword123!
# 5. Submit
# 6. Check browser Network tab → POST /auth/v1/signup → status 200
# 7. Browser console should show no errors
# 8. Check Supabase dashboard → Auth Users → new user appears
```

#### Sign In (Existing User)
**What it does:** Authenticates user and returns JWT token.

**Evidence that proves it works:**
- ✅ Email and password are accepted
- ✅ JWT token is returned
- ✅ Token can be used for subsequent API calls
- ✅ Wrong password returns 401

**How to verify:**
```bash
# 1. Navigate to http://localhost:5173/auth
# 2. Click "Sign In"
# 3. Use valid credentials
# 4. Check browser Network tab → POST /auth/v1/signin → status 200
# 5. Check localStorage → has supabase session data
# 6. Confirm can access /projects page
```

#### Session Persistence
**What it does:** User stays logged in after page refresh.

**Evidence that proves it works:**
- ✅ User stays authenticated after full page refresh (F5)
- ✅ Token is restored from localStorage/cookie
- ✅ Protected pages load without re-authentication

**How to verify:**
```bash
# 1. Sign in
# 2. Navigate to /projects
# 3. Press F5 (full page refresh)
# 4. Verify /projects page loads without redirect to /auth
# 5. Verify user is still logged in
```

#### Sign Out
**What it does:** Clears session and revokes token.

**Evidence that proves it works:**
- ✅ Sign Out button available on authenticated pages
- ✅ Clicking Sign Out redirects to /auth
- ✅ Subsequent API calls return 401 Unauthorized
- ✅ localStorage session data is cleared

**How to verify:**
```bash
# 1. Navigate to /projects while signed in
# 2. Click "Sign Out" button
# 3. Verify redirect to /auth page
# 4. Check browser console → no errors
# 5. Check Network tab → POST /auth/v1/logout
```

### Projects CRUD

#### List Projects
**What it does:** Fetches all projects owned by the authenticated user.

**Evidence that proves it works:**
- ✅ GET `/api/v1/projects` returns 200 OK
- ✅ Response is JSON array of projects
- ✅ Each project has: id, name, description, owner_id, created_at, updated_at
- ✅ Only user's own projects are returned (RLS check)
- ✅ Other users' projects are NOT visible

**How to verify:**
```bash
# With auth token from Sign In:
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/v1/projects

# Expected response:
# [
#   {
#     "id": "uuid",
#     "name": "Project 1",
#     "description": "...",
#     "owner_id": "user-uuid",
#     "created_at": "...",
#     "updated_at": "..."
#   }
# ]

# Or use browser Network tab:
# 1. Sign in
# 2. Navigate to /projects
# 3. Check Network tab → GET /api/v1/projects → status 200
# 4. Inspect response preview
```

#### Create Project
**What it does:** Creates a new project for the authenticated user.

**Evidence that proves it works:**
- ✅ POST `/api/v1/projects` with name returns 201 Created
- ✅ Response includes new project with id and timestamps
- ✅ Project is owned by the authenticated user
- ✅ Project appears in "List Projects" result
- ✅ Database `projects` table has new row

**How to verify:**
```bash
# Using curl:
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test Description"}'

# Expected response: 201 with project object

# Or use frontend:
# 1. Sign in
# 2. Navigate to /projects
# 3. Click "Create Project"
# 4. Enter name and description
# 5. Submit
# 6. Check Network tab → POST /api/v1/projects → 201
# 7. New project appears in list
# 8. Refresh page → project still appears
```

#### Get Project Detail
**What it does:** Fetches a single project by ID (if owned by user).

**Evidence that proves it works:**
- ✅ GET `/api/v1/projects/{id}` returns 200 OK
- ✅ Response has correct project data
- ✅ Accessing other user's project returns 404
- ✅ Missing ID returns 404

**How to verify:**
```bash
# Using curl:
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8000/api/v1/projects/<PROJECT_ID>

# Expected: 200 with project
# Accessing non-existent ID → 404
# Accessing other user's project → 404 (RLS)
```

#### Update Project
**What it does:** Updates project name/description (if owned by user).

**Evidence that proves it works:**
- ✅ PATCH `/api/v1/projects/{id}` returns 200 OK
- ✅ Response has updated data
- ✅ Database shows updated values
- ✅ Updating other user's project returns 404
- ✅ List shows updated values immediately

**How to verify:**
```bash
# Using curl:
curl -X PATCH http://localhost:8000/api/v1/projects/<ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Expected: 200 with updated project
# Verify in Supabase dashboard projects table
```

#### Delete Project
**What it does:** Deletes a project (if owned by user).

**Evidence that proves it works:**
- ✅ DELETE `/api/v1/projects/{id}` returns 204 No Content
- ✅ Project no longer appears in List Projects
- ✅ Project no longer exists in database
- ✅ Deleting other user's project returns 404
- ✅ Refresh page → deletion persists

**How to verify:**
```bash
# Using curl:
curl -X DELETE http://localhost:8000/api/v1/projects/<ID> \
  -H "Authorization: Bearer <TOKEN>"

# Expected: 204 No Content

# Verify deletion:
# 1. GET /api/v1/projects → project missing
# 2. Supabase dashboard projects table → row gone
# 3. Refresh browser → still gone
```

### Row Level Security (RLS)

#### Projects RLS Enforcement
**What it does:** Database enforces that users only see/modify their own projects.

**Evidence that proves it works:**
- ✅ User A cannot see User B's projects (even with User B's project ID)
- ✅ User A cannot update User B's project
- ✅ User A cannot delete User B's project
- ✅ RLS policies are enabled on `projects` table
- ✅ Queries with wrong `auth.uid()` return empty results

**How to verify:**
```bash
# Create two test users
# User A: testA@example.com
# User B: testB@example.com

# User A creates a project
# User B signs in with different token
# User B tries to access User A's project:
curl -H "Authorization: Bearer <USER_B_TOKEN>" \
  http://localhost:8000/api/v1/projects/<USER_A_PROJECT_ID>
# Expected: 404 (RLS blocks the query)

# Verify RLS policies in Supabase dashboard:
# 1. Go to project
# 2. Database → Table Editor → projects
# 3. Security → Row Level Security → Enable RLS if not enabled
# 4. Inspect policies:
#    - users_select_own_projects
#    - users_insert_own_projects
#    - users_update_own_projects
#    - users_delete_own_projects
```

### Error Handling

#### Missing Authentication
**What it does:** Requests without Bearer token are rejected.

**Evidence that proves it works:**
- ✅ GET `/api/v1/projects` without token returns 401 Unauthorized
- ✅ Response includes error message
- ✅ Frontend redirects to /auth page

**How to verify:**
```bash
# Try without auth header:
curl http://localhost:8000/api/v1/projects
# Expected: 401 Unauthorized

# Try with invalid token:
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8000/api/v1/projects
# Expected: 401 Unauthorized
```

#### Invalid Input
**What it does:** Requests with invalid data are rejected.

**Evidence that proves it works:**
- ✅ Missing required fields → 422 Unprocessable Entity
- ✅ Invalid field types → 422
- ✅ Empty name → 422
- ✅ Response includes error detail

**How to verify:**
```bash
# Try creating project without name:
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'
# Expected: 422 with validation error

# Try with wrong data type:
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": 123}'
# Expected: 422
```

---

## Verification Checklist

Use this checklist when verifying a change:

- [ ] Backend is running and healthy (`GET /health` returns 200)
- [ ] Frontend is running and loads without console errors
- [ ] Database is connected and RLS policies are enabled
- [ ] All relevant features from Feature Map are tested
- [ ] Authentication flow works end-to-end
- [ ] Ownership/authorization checks work (RLS + backend validation)
- [ ] Error cases are handled correctly
- [ ] Expected side effects are present (database mutations, logs, etc.)
- [ ] No new console errors or warnings
- [ ] Response shapes match API schema
- [ ] Changes don't break existing features

---

## Common Verification Patterns

### Full-Stack API Change

1. **Start both servers** (backend, frontend, ensure DB is reachable)
2. **Make the code change**
3. **Hit the endpoint** with curl or browser Network tab
4. **Verify response**: status code, body shape, headers
5. **Verify side effects**: database changes, logs, other endpoints affected
6. **Test error cases**: wrong auth, invalid input, ownership violations
7. **Verify from frontend** if this endpoint is called by UI
8. **Document evidence**: curl output, screenshots, logs

### Database Schema Change

1. **Start backend** (which auto-creates tables)
2. **Connect to Supabase** (dashboard or `psql`)
3. **Inspect schema**: `\d table_name` or dashboard
4. **Run test queries** against changed table
5. **Verify RLS policies** are present and working
6. **Test write operations** if schema affects constraints
7. **Verify no stale data** breaks queries
8. **Document evidence**: schema output, query results

### Frontend Component Change

1. **Start frontend** (`npm run dev`)
2. **Navigate to affected component**
3. **Exercise the behavior** (click, type, scroll, etc.)
4. **Inspect browser console** (F12 → Console) for errors
5. **Inspect Network tab** (F12 → Network) for API calls
6. **Inspect rendered state** (F12 → Elements/Inspector)
7. **Test error cases** (network failure, wrong data, etc.)
8. **Verify responsive** on mobile (browser DevTools device mode)
9. **Document evidence**: screenshots, console output, network details

### Authentication/Authorization Change

1. **Create 2+ test users**
2. **Test positive flow** (authorized action succeeds)
3. **Test negative flow** (unauthorized action fails with 403 or 404)
4. **Test ownership** (user A cannot modify user B's data)
5. **Test token expiry** (if applicable)
6. **Verify RLS policies** block database-level violations
7. **Verify 401 vs 403** returned appropriately
8. **Document evidence**: token contents, request/response pairs, policy statements

---

## Tools and Commands Reference

### Backend Verification Tools

```bash
# Check backend health
curl http://localhost:8000/health

# Call any GET endpoint
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/v1/projects

# Call POST/PATCH/DELETE endpoints
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# View backend logs
# (look in terminal where you ran `python -m uvicorn app.main:app`)

# Connect to PostgreSQL (if using Supabase)
psql postgresql://user:password@host/database
# Then: SELECT * FROM public.projects;
```

### Frontend Verification Tools

```bash
# Open browser developer tools
# F12 or right-click → Inspect

# Console tab: look for errors/warnings
# Network tab: inspect API calls, status codes, response shapes
# Elements tab: inspect rendered DOM, CSS state

# Check localStorage for auth token
# In console: localStorage.getItem('sb-token') or similar
```

### Database Verification Tools

```bash
# Supabase Dashboard (easiest):
# 1. Go to https://app.supabase.com
# 2. Select project
# 3. Database → Table Editor
# 4. Browse/edit tables directly

# Or use psql:
# Connect to your PostgreSQL database
# \dt → list tables
# \d projects → show projects schema
# SELECT * FROM projects; → query data
# SELECT * FROM policies WHERE tablename = 'projects'; → show RLS policies
```

---

## When Verification Fails

If verification uncovers a failure:

1. **Don't modify the code to hide the failure** — fix the root cause
2. **Document what failed** and the exact reproduction steps
3. **Inspect logs** (backend console, browser console) for clues
4. **Isolate the failure** — is it authentication, authorization, data, or logic?
5. **Check assumptions** — is the test data correct? Is the user authenticated?
6. **Fix the issue** and re-verify
7. **Update Feature Map** if the expected behavior changed

---

## Maintenance

The Feature Map should be updated when:
- New endpoints are added
- Existing endpoints change behavior
- Features are removed
- Authorization/RLS changes
- Error handling changes

See [verification-maintenance SKILL](/verification-maintenance/SKILL.md) for how to keep this skill and the Feature Map up to date.
