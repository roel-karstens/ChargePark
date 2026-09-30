# Architecture Decision Records (ADRs)

This directory documents important architecture decisions.

## Format

Each decision is a markdown file with:

```markdown
# ADR-00X: Decision Title

## Status
Accepted | Proposed | Rejected | Superseded

## Context
Why was this decision needed?

## Decision
What did we decide?

## Rationale
Why this decision?

## Consequences
What are the trade-offs?

## Alternatives Considered
What else did we consider?
```

## Example Decisions

### ADR-001: Use Supabase for Backend Database

**Status**: Accepted

**Context**: Need a database with built-in authentication and RLS.

**Decision**: Use Supabase PostgreSQL.

**Rationale**:
- Managed PostgreSQL (no ops)
- Built-in authentication (Supabase Auth)
- Row Level Security (database-level access control)
- Free tier available for development
- Good Copilot/AI integration

**Consequences**:
- Vendor lock-in (limited to Supabase)
- Supabase pricing model (may increase with scale)
- Less control over infrastructure

**Alternatives**:
- AWS RDS: More control, more cost, more ops
- Firebase: Less control over data, vendor lock-in, harder to add backend

### ADR-002: FastAPI for Backend

**Status**: Accepted

**Context**: Need a Python web framework for backend API.

**Decision**: Use FastAPI.

**Rationale**:
- Modern Python framework
- Built-in async/await support
- Automatic API documentation (Swagger)
- Strong typing (Pydantic)
- Good performance
- Large community

**Consequences**:
- Python async complexity
- Less mature than Django/Flask for some features
- Smaller ecosystem than Django

**Alternatives**:
- Django: More batteries-included, steeper learning curve
- Flask: Lightweight but less structure
- Starlette: Lower-level, more control

### ADR-003: React + TypeScript for Frontend

**Status**: Accepted

**Context**: Need a modern JavaScript UI framework.

**Decision**: Use React with TypeScript.

**Rationale**:
- React: Large community, good tooling, component model
- TypeScript: Type safety, better IDE support, catches bugs
- Vite: Fast build tool, modern development experience

**Consequences**:
- JavaScript bundle size (mitigated with code splitting)
- TypeScript learning curve
- Npm dependency management

**Alternatives**:
- Vue: Lighter, easier to learn
- Angular: More structured, steeper learning curve
- Svelte: Smaller bundles, smaller community

### ADR-004: RLS for Authorization

**Status**: Accepted

**Context**: Need database-level access control that can't be bypassed.

**Decision**: Enable Row Level Security (RLS) on all tables with user data.

**Rationale**:
- Defense in depth: Acts as fallback if backend auth fails
- Database-level enforcement (can't be bypassed by app logic)
- Supabase integrates RLS with Auth

**Consequences**:
- RLS policies need to be tested
- Slight performance overhead (negligible in practice)
- More complex to reason about

**Alternatives**:
- Application-level only: Faster but less secure
- Manual queries with WHERE clauses: Easier to bypass

## Adding New Decisions

When making architectural decisions:

1. Create a new file: `ADR-00X-title.md`
2. Use the format above
3. Make sure it's clear and concise
4. Discuss with team before accepting

## Important Decisions Made

1. **ADR-001**: Supabase PostgreSQL
2. **ADR-002**: FastAPI backend
3. **ADR-003**: React + TypeScript frontend
4. **ADR-004**: RLS for authorization
5. **ADR-005**: Pydantic for validation
6. **ADR-006**: Vite for frontend build
7. **ADR-007**: Pytest for backend tests
8. **ADR-008**: Vitest for frontend tests
9. **ADR-009**: Model-agnostic AI instructions
10. **ADR-010**: GitHub Copilot as primary development tool
