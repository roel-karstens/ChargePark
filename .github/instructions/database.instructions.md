---
applyTo: "supabase/**/*.sql"
---

# Database Instructions

## Migrations

All schema changes go through numbered migrations in `supabase/migrations/`:

```
0001_initial_schema.sql
0002_add_users_table.sql
0003_create_rls_policies.sql
```

### Alternative: Auto-Migrations via Python (SQLAlchemy)

For development/prototyping, this starter also supports auto-creating schema from Python models:

**Pattern**: Tables defined in `backend/app/models/` are auto-created on backend startup.

**When to use**:
- ✅ Development/local testing (zero-friction setup)
- ✅ Rapid prototyping with frequent schema changes
- ✅ Demo/learning projects (like this starter)

**When NOT to use**:
- ❌ Production deployments (no versioning trail)
- ❌ Multi-team environments (schema changes not tracked separately)
- ❌ Complex migrations (need raw SQL control)

**For production**, use Alembic to generate SQL migrations from models:
```bash
alembic revision --autogenerate -m "add tags table"
```

See [ADR-002](../../docs/decisions/ADR-002-auto-migrations-via-python.md) for trade-off analysis.

## Writing Migrations

- Idempotent: Safe to run multiple times
- Include both schema and RLS
- Add comments explaining the purpose
- Test locally before committing
- No destructive changes without approval

```sql
-- 0002_add_tags_table.sql

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only read their own tags
CREATE POLICY "Users can read own tags" ON tags
  FOR SELECT USING (auth.uid() = owner_id);

-- RLS: Users can create tags
CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- RLS: Users can update own tags
CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS: Users can delete own tags
CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_tags_owner_id ON tags(owner_id);
```

## Schema Design

### Primary Keys

Use UUID with `gen_random_uuid()`:

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
```

### Ownership

Every table with user data needs an owner:

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
);
```

### Timestamps

Track creation and updates:

```sql
CREATE TABLE projects (
  ...
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
);
```

### Constraints

Enforce data integrity:

```sql
CREATE TABLE projects (
  ...
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  UNIQUE(owner_id, name),
);
```

## Row Level Security (RLS)

Every table with user data needs RLS:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

Define explicit policies for each operation:

```sql
-- SELECT: Users can read their own projects
CREATE POLICY "Users can read own projects" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

-- INSERT: Users can create projects
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- DELETE: Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = owner_id);
```

## Indexes

Add indexes for:
- Foreign keys
- Search fields
- Frequently filtered columns

```sql
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

## Testing RLS Locally

In Supabase Studio or psql:

```sql
-- Set a specific user
SET request.jwt.claims = '{"sub":"user-uuid","email":"user@example.com"}';

-- Queries now respect RLS
SELECT * FROM projects;  -- Only shows projects owned by that user
```

## No Destructive Changes

Never drop columns or tables without explicit approval:

```sql
-- ✅ Safe: Add column with default
ALTER TABLE projects ADD COLUMN status text DEFAULT 'active';

-- ❌ Unsafe: Drop column
ALTER TABLE projects DROP COLUMN deprecated_field;

-- ❌ Unsafe: Drop table
DROP TABLE projects;
```

If removal is necessary, propose the migration with:
1. Clear reason
2. Backup plan
3. Rollback strategy
