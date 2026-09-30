# Database Change

Use this prompt to implement database schema changes.

## Instructions

You are working on database schema changes for a production application.

### Workflow

**1. INSPECT**
- Examine the current schema
- Review existing migrations
- Check RLS policies
- Identify indexes and constraints
- Understand relationships

**2. DETERMINE MIGRATION**
- What is changing?
- Is it a new table, new column, or modification?
- Are there dependencies?
- How will this affect existing data?

**3. CREATE MIGRATION**
- Write SQL in `supabase/migrations/NNNN_description.sql`
- Number migrations sequentially
- Make migrations idempotent
- Include comments explaining the purpose
- Write clear, formatted SQL

**4. RLS POLICIES**
- Enable RLS on new/modified tables
- Define explicit SELECT, INSERT, UPDATE, DELETE policies
- Consider ownership (owner_id, created_by)
- Test policies with different users
- Document policy intent

**5. INDEXES & CONSTRAINTS**
- Add indexes on foreign keys
- Add indexes on frequently filtered columns
- Add UNIQUE constraints where appropriate
- Add CHECK constraints for valid values
- Add NOT NULL where required

**6. TEST MIGRATION**
- Run migration locally in Supabase
- Verify tables created correctly
- Test RLS with multiple users
- Verify data integrity
- Check indexes are created

**7. UPDATE TESTS**
- Add migration tests if applicable
- Update API tests if schema changes
- Update service tests if queries change
- Test authorization/RLS

**8. UPDATE DOCUMENTATION**
- Update docs/database.md schema section
- Document new tables/columns
- Document RLS policies
- Document relationships

### Migration Template

```sql
-- NNNN_description.sql
-- Description of what this migration does
-- Related to issue #123 if applicable

-- Create table
CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own records" ON table_name
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create records" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_table_name_owner_id ON table_name(owner_id);
```

### Important Rules

- All changes via migrations (no direct schema modifications)
- RLS required on user data tables
- Explicit ownership rules (owner_id or similar)
- Idempotent migrations (safe to run multiple times)
- No destructive changes without explicit approval
- Test locally before committing
- Clear commit messages explaining schema changes
