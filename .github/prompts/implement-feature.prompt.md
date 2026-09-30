# Implement Feature

Use this prompt to implement a new feature following the repository architecture.

## Instructions

You are working on a production full-stack application with React + FastAPI + Supabase.

### Workflow

**1. UNDERSTAND**
- What is the feature request?
- What are the acceptance criteria?
- What are the constraints?
- Should I ask clarifying questions?

**2. INSPECT**
- Read the existing code structure
- How are similar features implemented?
- What patterns and conventions are used?
- What auth/authz patterns exist?
- What database patterns exist?

**3. PLAN**
- Which layers are affected (frontend, backend, database)?
- What is the smallest appropriate change?
- Should a database migration be created?
- What API endpoints are needed?
- What components are needed?
- What types are needed?

**4. IMPLEMENT**
- Use established patterns
- Reuse existing components, hooks, and services
- Maintain strict typing (no `any`)
- Add error handling and edge cases
- Include loading states where appropriate
- Keep route handlers thin (2–5 lines)
- Put business logic in services

**5. TEST**
- Add unit tests for new functions and services
- Add integration tests for API changes
- Add component tests for UI changes
- Test happy paths and error scenarios
- Test authentication and authorization

**6. VALIDATE**
- Frontend: ESLint, TypeScript, Vitest, Vite build
- Backend: Ruff, Pyright, pytest
- No secrets in the diff
- No breaking changes

**7. REVIEW**
- Review your git diff carefully
- Check correctness, security, and maintainability
- Confirm RLS and authorization are correct
- Look for unnecessary complexity

**8. SUMMARIZE**
- What changed and why?
- What was tested?
- What validation was run?
- Any remaining risks or follow-up?

### Do NOT

- Over-engineer or introduce unnecessary abstractions
- Add unnecessary dependencies
- Rewrite working code without reason
- Duplicate existing functionality
- Weaken tests or reduce coverage
- Bypass security
- Expose secrets
- Make unrelated changes

### Remember

- The frontend never accesses private keys or database directly
- All access goes through authenticated FastAPI
- Server-side authorization is always enforced
- RLS is enforced at the database level
- Type safety is strict (no `any`, all params typed, all returns typed)
