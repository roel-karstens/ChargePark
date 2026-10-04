# Verification-First Development

**Philosophy**: "It compiles" is NOT evidence that the application works.

This document explains the verification-first approach integrated into this repository, inspired by [pstack](https://github.com/backnotprop/pstack) by poteto/Lauren Tan.

---

## Problem This Solves

Traditional AI development workflows often fall into this trap:

```
AI implements feature → Tests pass → Code review approves → Deploy
     ↑
  "It compiles, tests pass, code looks good..."
  
But then: ❌ Frontend doesn't call endpoint correctly
         ❌ RLS policy blocks legitimate access
         ❌ Authorization check is missing
         ❌ Database schema doesn't match expectations
         ❌ Performance is terrible in production
```

The issue: **Static validation and unit tests are NOT the same as the real system actually working.**

Verification-first flips this on its head:

```
AI implements feature → Start real app → Test with curl/browser → Verify database 
                     → Verify authorization → Verify no side effects → EVIDENCE!
                     
        ✅ Proof that it works
```

---

## Core Principles

### 1. "Prove It Works"

Every feature must be verified on the actual running application with the real database, real authentication, and real network requests.

**What counts as proof:**
- ✅ Curl request and response (real HTTP)
- ✅ Database query showing actual data (real persistence)
- ✅ Screenshot of working UI (real behavior)
- ✅ Authorization test with different users (real security)
- ✅ Test showing RLS policy blocks unauthorized access (real database security)

**What does NOT count:**
- ❌ "Tests pass" (no link to running app)
- ❌ "Code looks correct" (no execution)
- ❌ "No type errors" (no runtime verification)
- ❌ "Manual testing" with no evidence (no reproducibility)

### 2. "Test Behavior, Not Implementation"

Focus on verifying the **actual outcome** the user experiences, not the internal code details.

**Instead of:** "Let me check the dependency injection"  
**Verify:** "Does the endpoint return 201 when creating a project?"

**Instead of:** "Let me trace through the authorization logic"  
**Verify:** "Can user A see user B's projects? (Should be no)"

**Instead of:** "Let me check the schema definition"  
**Verify:** "Can I successfully insert a project and retrieve it?"

### 3. "Fix Root Causes, Not Symptoms"

When verification fails, understand and fix the actual problem.

**Bad:** Comment out the authorization check to make tests pass  
**Good:** Understand why authorization failed and fix the actual logic

**Bad:** Change the test to expect a different response  
**Good:** Fix the code to return the correct response

### 4. "Sequence Work into Verifiable Units"

Each change should be small enough to verify completely before moving to the next.

**Bad:** Implement 10 new features at once, then try to verify they all work together  
**Good:** Implement and verify each feature independently, then verify they work together

---

## The Verification Workflow

### Phase 1: LAUNCH

Start the real application:

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Both should start without errors
```

### Phase 2: DOCTOR

Verify the system is healthy:

```bash
# Health check
curl http://localhost:8000/health
→ {"status": "ok"}

# Frontend loads
curl http://localhost:5173/
→ HTML document (no 500 error)

# Database connected
# (check backend logs show "Database tables created successfully")
```

### Phase 3: DRIVE

Exercise the actual changed code:

```bash
# Example: Create a project
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "..."}'
→ {"id": "...", "name": "Test", ...}
```

### Phase 4: EVIDENCE

Collect and document proof:

```bash
# ✅ API returned 201 Created
# ✅ Response includes project with all fields
# ✅ Project appears in database
# ✅ Only owner can see it (verified with different user)
# ✅ Non-owner gets 404 (RLS working)
```

### Phase 5: CLEANUP

Stop services and reset state:

```bash
# Ctrl+C in both terminals
# Delete test data from Supabase if needed
```

---

## Using the Verification Skill

The [Verification Skill](./.github/skills/verification/SKILL.md) documents exactly how to verify the application works.

**When to use it:** After implementing any meaningful change.

**What it covers:**
- How to start the application
- How to verify it's healthy
- What constitutes evidence for each feature
- Common verification patterns
- Feature map with all user-facing features
- How to collect proof

**How to use it:**

1. Implement your feature
2. Run static validation (linting, type-checking, tests)
3. **Read the verification skill** to understand what evidence you need
4. **Start the application**
5. **Exercise the feature** in the real running app
6. **Collect evidence** (curl commands, database queries, screenshots)
7. **Document results** following the evidence template
8. **Only then claim it works**

---

## Feature Map Concept

The Verification Skill includes a **Feature Map** that documents:

- What each user-facing feature does
- What evidence proves it works
- How to test it (exact curl commands, UI steps)
- Error cases to test
- Authorization/RLS requirements

**Example:**

```markdown
#### Create Project
**What it does:** Creates a new project for the authenticated user.

**Evidence that proves it works:**
- ✅ POST /api/v1/projects returns 201 Created
- ✅ Response includes project with id and timestamps
- ✅ Project is owned by authenticated user
- ✅ Project appears in GET /api/v1/projects result
- ✅ Project persists after page refresh

**How to verify:**
[curl command showing exact request and expected response]
```

**Keep the Feature Map updated** as features change. Use the [verification-maintenance skill](./.github/skills/verification-maintenance/SKILL.md) to keep it current.

---

## Common Verification Patterns

### Backend API Change

```
1. Make code change
2. Backend running? curl GET /health → 200 OK
3. Call the endpoint: curl POST /api/v1/projects → Check status code
4. Verify response shape matches API contract
5. Check database: new row exists with correct data
6. Verify side effects: other endpoints still work
7. Test error cases: 401 without auth, 403 for wrong ownership
8. Document: curl command + response + database query result
```

### Frontend Component Change

```
1. Make code change
2. Frontend running? Navigate to page → Loads without console errors
3. Exercise the component: click buttons, type text, etc.
4. Check Network tab: correct API calls made
5. Check browser console: no errors or warnings
6. Verify UI state: displays correctly
7. Test error cases: API failure, empty data, etc.
8. Document: screenshot + network details + console state
```

### Database Schema Change

```
1. Make migration
2. Backend starts: shows "Creating database tables"
3. Connect to Supabase: verify table has correct schema
4. Run test queries: INSERT, UPDATE, SELECT, DELETE work
5. Verify RLS policies present: run as different users
6. Test constraints: try violating constraints, verify they fail
7. Verify no data loss: SELECT COUNT(*) same as before
8. Document: schema output + query results + RLS policy names
```

### Authorization/RLS Change

```
1. Make code change
2. Create 2+ test users
3. User A: Create a resource
4. User B: Try to access User A's resource
5. Verify User B gets 404 or 403 (not 200)
6. Verify database SELECT returns empty (RLS blocking)
7. User A: Can still access own resource (200 OK)
8. Document: requests from both users + responses + RLS policy checked
```

---

## Evidence Templates

Use these templates to document verification results:

### API Evidence

```bash
# Command I ran:
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}'

# Response I received:
# HTTP/1.1 201 Created
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "name": "Test Project",
#   "owner_id": "user-uuid",
#   "created_at": "2026-10-04T12:34:56Z"
# }

# ✅ Verification Results:
# - Status code: 201 (correct)
# - Response includes all required fields
# - Project created in database (verified via dashboard)
# - Only this user can see it (verified with different token)
```

### Frontend Evidence

```
✅ Navigation: Clicked "Create Project" button
✅ Form: Entered "Test" in name field, "Desc" in description
✅ Submission: Clicked Submit button
✅ Network: POST /api/v1/projects → 201 Created
✅ Console: No errors (F12 → Console is clean)
✅ UI: Project appears in list immediately
✅ Persistence: Refreshed page (F5) → project still there

Screenshot attached: [link or embedded image]
```

### Database Evidence

```sql
-- Verified schema:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects';

-- Result:
-- id | uuid | false
-- name | text | false
-- description | text | true
-- owner_id | uuid | false
-- created_at | timestamp | false
-- updated_at | timestamp | false

-- ✅ All columns present and correct types

-- Verified RLS policy:
SELECT policyname, qual FROM pg_policies 
WHERE tablename = 'projects' AND policyname = 'users_select_own_projects';

-- Result:
-- users_select_own_projects | (auth.uid() = owner_id)

-- ✅ RLS policy correctly restricts to owner_id
```

---

## When to Use This Approach

Use verification-first for:
- ✅ Backend API changes
- ✅ Frontend UI changes
- ✅ Database schema changes
- ✅ Authorization/RLS changes
- ✅ Bug fixes (especially critical/security bugs)
- ✅ Integration changes

Use it regardless of:
- Team size (works for solo or teams)
- Deployment frequency (CI/CD or manual)
- Model used (Claude, GPT, etc.)

---

## Integration with AI Workflows

When using GitHub Copilot with this repo:

1. **Implement the feature** (normal coding)
2. **Run static validation** (linting, tests)
3. **Follow the [verify-and-ship prompt]** (./.github/prompts/verify-and-ship.prompt.md)
4. **Use the [Verification Skill]** (./.github/skills/verification/SKILL.md)
5. **Collect evidence** and document results
6. **Report: Ready to Ship** only when verification complete

---

## What This Is NOT

This approach is **NOT**:
- ❌ Manual testing for every change (automatable parts should be automated)
- ❌ Perfectionistic (just enough verification to be confident)
- ❌ Replacing unit tests (tests are still necessary)
- ❌ Only for production (use throughout development)
- ❌ Time-consuming (well-structured verification is fast)

This approach **IS**:
- ✅ Pragmatic (prove what matters)
- ✅ Evidence-based (show, don't tell)
- ✅ Efficient (quick feedback loop)
- ✅ Adaptable (works for all tech stacks)
- ✅ AI-friendly (can be automated and documented clearly)

---

## Key Takeaway

**"It compiles" is not evidence.**

Real evidence comes from the real running system actually doing what it should do.

Use the Verification Skill, follow the Feature Map, and collect evidence for every meaningful change.

When someone (human or AI) claims a change works, your response should be:

> "Great! Show me the proof: 
> - What curl request did you run?
> - What was the response?
> - What did the database show?
> - Who did you test it with?"

Not: "Cool, looks good!" (without evidence)

---

## Resources

- [Verification Skill](./.github/skills/verification/SKILL.md) — How to verify changes
- [Verification Maintenance Skill](./.github/skills/verification-maintenance/SKILL.md) — Keep verification current
- [Verify and Ship Prompt](./.github/prompts/verify-and-ship.prompt.md) — Verification workflow
- [Feature Map](./.github/skills/verification/SKILL.md#feature-map) — What features exist and how to test them
- [pstack on GitHub](https://github.com/backnotprop/pstack) — Original inspiration for this philosophy

---

**Last Updated:** October 2026
