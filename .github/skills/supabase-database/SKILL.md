# Supabase Database Skill

**Use this skill when:**
- Inspecting or designing database schema
- Creating or reviewing migrations
- Analyzing relationships and constraints
- Reviewing Row Level Security (RLS)
- Investigating database errors
- Generating TypeScript types from schema

## Workflow

### 1. Understand the requirement

What data needs to be stored? What relationships exist? Who owns it?

### 2. Inspect the current schema

Use Supabase MCP or read migrations to understand:
- Existing tables and columns
- Primary keys and foreign keys
- Constraints and indexes
- RLS policies
- Relationships

### 3. Plan the change

Determine:
- New tables, columns, or modifications needed
- Data migration strategy (if modifying existing data)
- New constraints or indexes
- New or updated RLS policies

### 4. Create migration

Write SQL in `supabase/migrations/NNNN_description.sql`:
- Make migrations idempotent (`IF NOT EXISTS`, `IF NOT EXISTS` for policies)
- Include both schema and RLS
- Add clear comments explaining the purpose
- Use proper naming conventions

**Template:**
```sql
-- NNNN_description.sql
-- Description of changes and rationale

CREATE TABLE IF NOT EXISTS new_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own records" ON new_table
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create records" ON new_table
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_new_table_owner_id ON new_table(owner_id);
```

### 5. Review schema quality

**Verify:**
- [ ] Primary key is UUID (not serial)
- [ ] Ownership field exists (owner_id, created_by)
- [ ] Foreign keys reference correct tables with CASCADE
- [ ] Timestamps present (created_at, updated_at)
- [ ] UNIQUE constraints prevent duplicates where needed
- [ ] Indexes on foreign keys and filtered columns
- [ ] CHECK constraints for valid values
- [ ] NOT NULL on required fields

### 6. Review RLS

**Verify:**
- [ ] RLS enabled on all tables with user data
- [ ] Explicit SELECT, INSERT, UPDATE, DELETE policies
- [ ] Policies check ownership (auth.uid() = owner_id or similar)
- [ ] No overly permissive policies
- [ ] Policies tested with multiple users in mind

**Pattern: Owner-based access**
```sql
-- SELECT: Users can only read their own records
CREATE POLICY "users_select_own_records" ON table_name
  FOR SELECT USING (auth.uid() = owner_id);

-- INSERT: Users can only create records for themselves
CREATE POLICY "users_insert_own_records" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Users can only update their own records
CREATE POLICY "users_update_own_records" ON table_name
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- DELETE: Users can only delete their own records
CREATE POLICY "users_delete_own_records" ON table_name
  FOR DELETE USING (auth.uid() = owner_id);
```

### 7. Test the migration

- Run migration locally in Supabase
- Verify tables/columns created correctly
- Test RLS with multiple users
- Verify data integrity and indexes
- Check for errors or warnings

### 8. Update related code

Update backend models and schemas:
- SQLAlchemy models in `backend/app/models/`
- Pydantic schemas in `backend/app/schemas/`
- Generate TypeScript types for frontend

### 9. Update documentation

- Update `docs/database.md` schema section
- Document new tables/columns
- Document RLS policies
- Document relationships

## Important Rules

✅ **Do:**
- Make migrations idempotent (safe to run multiple times)
- Include both schema and RLS in migrations
- Test locally before committing
- Review constraints and indexes
- Document policy intent
- Number migrations sequentially (0001, 0002, etc.)

❌ **Don't:**
- Assume data shape is final
- Drop tables/columns without explicit approval
- Create tables without RLS
- Forget ownership fields
- Combine unrelated changes in one migration
- Assume production changes are safe

## Supabase MCP Integration

If Supabase MCP is available, use it to:
- Inspect current schema
- List tables and columns
- Review RLS policies
- Test policies with different users
- Inspect indexes and constraints

Read-only access is preferred for production inspection.

Never execute destructive SQL on production without explicit human approval.

## Common Patterns

### User-owned data
```sql
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)  -- Prevent duplicate names per user
);
```

### Many-to-many relationships
```sql
CREATE TABLE users_groups (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);
```

### Soft deletes
```sql
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  deleted_at timestamp with time zone DEFAULT NULL,
  -- Query: WHERE deleted_at IS NULL to get active records
);
```

### Temporal data
```sql
CREATE TABLE item_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  version integer NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

## Destructive Operations

For operations like DROP TABLE, DROP COLUMN, or data deletions:

1. **Explain** what data will be affected
2. **Identify** how many records (use SELECT COUNT)
3. **Show** example data that will be deleted
4. **Require** explicit human approval before execution
5. **Verify** the operation succeeded
6. **Document** what was deleted and when

Never assume destructive operations are safe.

## See Also

- `docs/database.md` — Database design guide
- `docs/security.md` — Security patterns
- `.github/instructions/database.instructions.md` — Database conventions
- `.github/prompts/database-change.prompt.md` — Migration workflow
