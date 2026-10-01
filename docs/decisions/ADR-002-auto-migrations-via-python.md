# ADR-002: Auto-Migrations via Python (SQLAlchemy) vs SQL Migrations

## Status
**Accepted** (with caveats — see trade-offs)

## Context
- User requirement: "this repo should create that table when I spin it up"
- Established pattern in AGENTS.md and instructions: "All schema changes via migrations" (SQL files in `supabase/migrations/`)
- Challenge: Manual SQL migrations require explicit deployment steps; auto-migrations provide zero-friction setup

## Decision
Implement auto-migrations via Python/SQLAlchemy in `backend/app/main.py`:
- Tables created on backend startup via `Base.metadata.create_all(bind=engine)`
- RLS policies configured via direct SQL execution during startup
- Idempotent operations (safe to re-run on every startup)
- Works in both development (SQLite) and production (Supabase PostgreSQL)

## Rationale
1. **Developer Experience**: New developers just run the backend; tables auto-create
2. **Reduced Setup Friction**: No manual SQL migration steps needed
3. **Compatibility**: Works offline with SQLite or with Supabase PostgreSQL
4. **Reliability**: Python code is versioned with application code (always in sync)

## Consequences
### Benefits
- ✅ Zero-configuration schema setup on startup
- ✅ Guaranteed schema consistency (code + DB in sync)
- ✅ Works in both SQLite and PostgreSQL modes
- ✅ RLS policies auto-configured without manual SQL

### Trade-offs
- ⚠️ Deviates from documented pattern (AGENTS.md, instructions state "all changes via migrations")
- ⚠️ Schema versioning is implicit in Python code, not explicit in migration files
- ⚠️ Audit trail: Hard to see "when was this schema change deployed" without commit history
- ⚠️ Database team (if exists) may not be able to manage schema independently

## Recommendations
1. **Keep current approach** for development velocity, BUT:
   - Document the auto-migration pattern clearly (done in README.md)
   - Update instruction files to include this pattern as an option
   
2. **For production deployments**, consider:
   - Generating SQL migration files from SQLAlchemy models (tools: Alembic)
   - Maintaining both: Python models (source of truth) + SQL migrations (deployment trail)
   - Use Alembic for explicit versioning: `alembic revision --autogenerate`

3. **Add to future guidance**:
   - Update `.github/instructions/database.instructions.md` to include "Auto-migration via SQLAlchemy" as an option
   - Link to Alembic docs for more sophisticated migration needs

## Alternatives Considered
1. **Pure SQL Migrations** (current pattern)
   - Pro: Explicit versioning, standard in industry
   - Con: Requires manual deployment, more setup friction
   
2. **Hybrid: Python models + Alembic auto-versioning**
   - Pro: Best of both (auto + explicit versioning)
   - Con: Additional tool/complexity, Alembic learning curve
   
3. **Database-first (Supabase Schema Editor)**
   - Pro: Visual schema management
   - Con: Not version-controlled, diverges from code

## Decision Makers
- Auto-migrations enable the "spin it up" experience the user requested
- Trade-off is acceptable for this starter template (learning/demo focused)
- Production deployments should consider Alembic for better versioning

---

**Related Issues**:
- User requirement: auto-create tables on startup
- Existing pattern: SQL migrations in `supabase/migrations/`
- Implementation: `backend/app/main.py` (lines 12-70)
