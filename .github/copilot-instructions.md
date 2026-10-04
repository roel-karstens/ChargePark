# GitHub Copilot Instructions

## Project Overview

**AI-Ready Full-Stack Starter**
- React + TypeScript frontend (Vite, ESLint, Vitest)
- FastAPI + Python backend (Pydantic, Ruff, Pyright, pytest)
- Supabase PostgreSQL + Auth + Row Level Security
- Authentication: Supabase email/password
- Example: Project management CRUD app

## Architecture

```
React Frontend → FastAPI Backend → Supabase PostgreSQL
                                  + Auth + RLS
```

**Critical Rule**: Frontend MUST NEVER access database or private keys. All access through authenticated FastAPI.

## AI Development Layer

This repository includes specialized infrastructure for AI-assisted development with GitHub Copilot.

**Read this first:** [`docs/ai-development.md`](../../docs/ai-development.md)

### Key Components

**MCP Integrations** (`docs/mcp.md`)
- Optional external tools: Supabase, Vercel, Browser, GitHub
- Extend Copilot's capabilities
- Read-only preferred for production

**Skills** (`.github/skills/`)
- Specialized task-specific knowledge
- Use when performing specific types of work
- Examples: **verification**, database schema, frontend debugging, deployment, security review, testing

**Agents** (`.github/agents/`)
- Specialized responsibilities: architect, database, security-reviewer, code-reviewer
- Invoke for expert analysis and review
- Delegate complex work

**Prompts** (`.github/prompts/`)
- Explicit user workflows
- **verify-and-ship** — Post-implementation verification (use after implementing!)
- implement-feature, review, security-review, database-change, test-and-review

### How It Works

```
Global Instructions (this file)
    ├─ Verification Philosophy: "Prove It Works"
    ├─ Development Principles
    ├─ Security Requirements
    └─ Code Quality Standards
         ↓
Skills: Specialized Knowledge
    ├─ verification/ ← Use after implementing any change
    ├─ verification-maintenance/ ← Keep Feature Map in sync
    ├─ supabase-database/
    ├─ frontend-debugging/
    ├─ frontend-design/
    ├─ deployment/
    ├─ security-review/
    └─ testing/
         ↓
Agents: Specialized Roles
    ├─ architect/ ← Design decisions
    ├─ database/ ← Schema and migrations
    ├─ security-reviewer/ ← Security audit
    └─ code-reviewer/ ← Code quality review
         ↓
Prompts: User Workflows
    ├─ implement-feature.prompt.md
    ├─ verify-and-ship.prompt.md ← After implementation
    ├─ review.prompt.md
    ├─ security-review.prompt.md
    ├─ database-change.prompt.md
    └─ test-and-review.prompt.md
         ↓
MCP: External Tools (optional)
    ├─ Supabase
    ├─ Vercel
    ├─ Browser
    └─ GitHub
```

The system is **model-agnostic**: works with Claude, OpenAI, or any Copilot model.

## Responsibilities

**Frontend**
- UI and user interactions
- Client-side state
- Authentication UI
- HTTP calls to `/api/v1/*` endpoints
- Loading/error/empty states

**Backend**
- Business logic in services
- API endpoints (thin handlers)
- Authentication validation
- Authorization (server-side)
- Data transformation and validation
- External integrations

**Database**
- PostgreSQL persistence
- Supabase Auth integration
- Row Level Security policies
- Schema and migrations only

## Verification: Prove It Works

**Core Philosophy**: "It compiles" is NOT evidence that the application works.

Every meaningful change must be verified against the actual running system with clear evidence. Use the [**Verification Skill**](./.github/skills/verification/SKILL.md) to:

1. **LAUNCH** the application (backend, frontend, database)
2. **DOCTOR** verify it's healthy
3. **DRIVE** exercise the changed code
4. **EVIDENCE** collect proof (curl responses, screenshots, database queries)
5. **CLEANUP** stop services and reset state

### Evidence-Based Verification

For each change, distinguish between:

- ✅ **Static validation**: Code compiles, lints, type-checks (necessary but not sufficient)
- ✅ **Unit tests**: Functions work in isolation (good for logic, not integration)
- ✅ **Integration tests**: Components work together (better, but still not running system)
- ✅ **Runtime verification**: Real HTTP calls, real database, real user flows (the proof that matters)

### What Counts as Evidence

**Backend API changes:**
- HTTP request and response (status code, body shape)
- Database state after the operation
- Error cases tested (wrong auth, invalid input, authorization violations)

**Frontend changes:**
- Screenshots or video of the user flow
- Browser console showing no errors
- Network tab showing correct API calls
- Final UI state matching expectations

**Database changes:**
- Schema inspection (CREATE TABLE output)
- Query results from affected tables
- RLS policy verification (if applicable)
- Before/after data comparison

**Authorization/Authentication:**
- Authorized user can access resource
- Unauthorized user gets 401/403
- Ownership checks prevent cross-user access
- Different user cannot see/modify another's data

### Common Mistakes to Avoid

❌ "It compiles, so it works"  
→ Run the app and test actual behavior

❌ "Tests pass" (without checking what tests)  
→ Run the full test suite and report numbers

❌ "Code looks correct"  
→ Execute it and verify the output

❌ "I fixed the bug" (without reproducing the bug first)  
→ Demonstrate the failure, then show it's fixed

✅ **Instead**: "Here's the curl request I ran, here's the response, here's the database row I verified, here's the browser screenshot"

---

## Development Principles

### 1. Inspect Before Modifying

Read existing code first:
- How are components structured?
- What patterns are used?
- Where is similar logic already implemented?
- What authentication/authorization patterns exist?

### 2. Reuse Existing Patterns

- Reuse components, hooks, and services
- Follow naming conventions
- Match code style
- Use existing error handling

### 3. Prefer Minimal Changes

- Smallest change that solves the problem
- No unnecessary refactoring
- No speculative abstractions
- No dead code

### 4. Maintain Strict Typing

**TypeScript (Frontend)**
- No `any` types
- All function parameters typed
- All return types specified
- Discriminated unions for complex state
- Export types for reusable components

**Python (Backend)**
- Type hints on all functions
- Pydantic models for validation
- FastAPI dependency injection
- Return types on all functions

### 5. Write Tests

- Add tests for new functionality
- Cover happy paths and error cases
- Component tests for UI changes
- Integration tests for API changes
- Unit tests for services

### 6. Verify the Change Works

After implementation, use the [**Verification Skill**](./.github/skills/verification/SKILL.md) to prove the change works:

**Static Validation** (necessary but not sufficient):
- Frontend: `npm run lint`, `npm run type-check`, `npm run test`
- Backend: `ruff check .`, `pyright`, `pytest`

**Runtime Verification** (the real proof):
- Start backend: `python -m uvicorn app.main:app --port 8000`
- Start frontend: `npm run dev`
- Call the affected endpoint with curl or browser
- Verify database state with Supabase dashboard
- Test error cases (wrong auth, invalid input, authorization)
- Confirm no side effects to other features

**Evidence to Collect**:
- API response codes and shapes (curl output)
- Database queries showing data integrity
- Browser screenshots or console output
- Test data before/after comparison

Only claim the change works if you've verified it on the running system with evidence.

---



### 1. Never Commit Secrets

- `.env` is in `.gitignore`
- Use `.env.example` to document variables
- Distinguish public (VITE_*) and secret variables
- Never log sensitive data

### 2. Authenticate Server-Side

- Validate JWT on every protected endpoint
- Extract `user_id` from token
- Use FastAPI dependency injection
- Return 401 for missing/invalid tokens
- Return 403 for insufficient permissions

### 3. Enforce Authorization

**Backend**
- Check user ownership of resources
- Verify permissions before returning data
- Use consistent error responses

**Database**
- Enable RLS on all tables
- Define explicit policies for SELECT, INSERT, UPDATE, DELETE
- Test policies before deployment

### 4. Validate Input

- Use Pydantic for all requests
- Whitelist allowed fields
- Validate types, lengths, formats
- Return 422 for validation errors

### 5. Protect API Endpoints

- All data endpoints require authentication
- POST/PATCH/DELETE require ownership
- Return appropriate HTTP status codes
- Avoid revealing internal details in errors

### 6. Secure Error Handling

- Log errors for debugging
- Never expose stack traces to clients
- Never reveal database structure
- Return generic error messages

## Code Quality

### Frontend

**Components**
- Single responsibility
- Reusable with clear props
- Handle loading/error/empty states
- Accessible (labels, ARIA)
- No business logic (belongs in hooks/services)

**Types**
- Discriminated unions for state
- Exported from components that need them
- No `unknown` or `any`

**Hooks**
- Encapsulate stateful logic
- Clear dependencies
- Proper cleanup

**Testing**
- Component tests for complexity
- User interaction tests for flows
- Avoid brittle implementation tests

### Backend

**Routes**
- 2–5 lines of logic per handler
- Validate input with Pydantic
- Call services for business logic
- Return appropriate status codes

**Services**
- Encapsulate business logic
- Take dependencies as arguments
- No database queries in handlers
- Return typed responses

**Models & Schemas**
- Pydantic for requests/responses
- SQLAlchemy for database models
- Clear separation of concerns

**Testing**
- Unit tests for services
- Integration tests for endpoints
- Test auth and authorization
- Test error cases

### Database

- All changes via migrations
- RLS on tables with user data
- Explicit ownership rules
- Indexes on foreign keys
- Constraints for data integrity
- No destructive changes without approval

## Model Independence

These instructions work with ANY GitHub Copilot model:
- Claude
- OpenAI (GPT)
- Other supported models

Do not assume capabilities of a specific model.

## When to Ask for Help

- Ambiguous requirements
- Architectural decisions
- Security concerns
- Large refactorings
- External integrations
- Performance issues
