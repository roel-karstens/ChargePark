# Database

## Overview

- **Database**: PostgreSQL 15+ (managed by Supabase)
- **ORM**: SQLAlchemy (backend)
- **Migrations**: SQL files in `supabase/migrations/`
- **Access Control**: Row Level Security (RLS)
- **Authentication**: Supabase Auth

## Schema

### auth.users (Supabase Managed)

```sql
-- Managed by Supabase Auth
-- id: UUID
-- email: text
-- email_confirmed_at: timestamp
-- ...
```

Users sign up/login through Supabase Auth. This table is managed by Supabase.

### projects

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)
);
```

**Columns:**
- `id`: Primary key (UUID)
- `owner_id`: Foreign key to `auth.users` (who owns this project)
- `name`: Project name (unique per user)
- `description`: Project description (optional)
- `created_at`: Timestamp created
- `updated_at`: Timestamp last updated

**Constraints:**
- Primary key on `id`
- Foreign key `owner_id` → `auth.users.id` (CASCADE on delete)
- UNIQUE on `(owner_id, name)` (can't have duplicate names per user)

**Indexes:**
- Primary key index on `id`
- Foreign key index on `owner_id` (for RLS)

## Migrations

All schema changes go through numbered migrations in `supabase/migrations/`.

### Creating a Migration

1. Create file: `supabase/migrations/NNNN_description.sql`
2. Write SQL
3. Test locally
4. Commit to git

**Example: Create projects table**

File: `supabase/migrations/0001_initial_schema.sql`

```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_select_own_projects" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "users_insert_own_projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "users_update_own_projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "users_delete_own_projects" ON projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### Naming Conventions

- Tables: `lowercase`, `plural` (projects, users, tags)
- Columns: `lowercase`, `snake_case` (owner_id, created_at)
- Indexes: `idx_tablename_columns` (idx_projects_owner_id)
- Constraints: `constraint_type_table_columns` (fk_projects_owner_id)

### Migration Best Practices

✅ **Do:**
- Make migrations idempotent (`CREATE TABLE IF NOT EXISTS`)
- Include comments explaining the purpose
- Add both schema and RLS in same migration
- Test locally before committing
- Number migrations sequentially (0001, 0002, etc.)

❌ **Don't:**
- Drop tables without explicit approval
- Drop columns without explicit approval
- Combine multiple unrelated changes
- Make destructive changes
- Assume data shape won't change

## Row Level Security (RLS)

### Why RLS?

RLS is database-level access control. Even if an attacker:
- Bypasses authentication
- Gets a database connection
- Writes SQL manually

RLS prevents them from accessing other users' data.

### Enabling RLS

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

### Writing Policies

**Pattern: Owner-based access**

```sql
-- SELECT
CREATE POLICY "users_select_own_projects" ON projects
  FOR SELECT
  USING (auth.uid() = owner_id);

-- INSERT
CREATE POLICY "users_insert_own_projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- UPDATE
CREATE POLICY "users_update_own_projects" ON projects
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- DELETE
CREATE POLICY "users_delete_own_projects" ON projects
  FOR DELETE
  USING (auth.uid() = owner_id);
```

**Reading the policy:**
- `FOR SELECT USING (...)` - Allow SELECT if condition is true
- `FOR INSERT WITH CHECK (...)` - Allow INSERT if condition is true
- `FOR UPDATE USING (...) WITH CHECK (...)` - Allow UPDATE if both true
- `FOR DELETE USING (...)` - Allow DELETE if condition is true

### Testing RLS

In Supabase SQL Editor or psql:

```sql
-- Set user context
SET request.jwt.claims = '{"sub":"user-123"}';

-- Test SELECT (should only show user-123's projects)
SELECT * FROM projects;

-- Test INSERT
INSERT INTO projects (owner_id, name)
VALUES ('user-123', 'New Project');

-- Test UPDATE (should work only on own projects)
UPDATE projects SET name = 'Updated' WHERE id = 'project-id';

-- Test DELETE
DELETE FROM projects WHERE id = 'project-id';

-- Switch to different user
SET request.jwt.claims = '{"sub":"user-456"}';

-- Queries now use user-456's context
SELECT * FROM projects;  -- Should not see user-123's projects
```

## Indexes

### When to Add

- Foreign keys (for joins)
- Frequently filtered columns
- Sort columns (for ORDER BY)
- Search fields

### Examples

```sql
-- Foreign key
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Sort
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Composite (if needed)
CREATE INDEX idx_projects_owner_created ON projects(owner_id, created_at DESC);
```

### Performance

- Indexes speed up queries
- Indexes slow down writes (INSERT/UPDATE/DELETE)
- RLS doesn't significantly impact index performance

## Constraints

### Foreign Keys

```sql
-- Require owner to exist in auth.users
owner_id uuid NOT NULL REFERENCES auth.users(id)

-- Delete projects when user is deleted
owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE

-- Prevent delete (will error if user has projects)
owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT
```

### Unique Constraints

```sql
-- No duplicate names per user
UNIQUE(owner_id, name)

-- No duplicate emails
UNIQUE(email)
```

### Check Constraints

```sql
-- Only specific values
status text CHECK (status IN ('active', 'archived'))

-- Value ranges
priority int CHECK (priority >= 0 AND priority <= 5)
```

### NOT NULL

```sql
-- Required field
name text NOT NULL

-- Optional field
description text
```

## Seeding Data

Optional: Seed development database with sample data.

File: `supabase/seed.sql`

```sql
-- Insert test users
INSERT INTO auth.users (id, email)
VALUES ('user-123', 'user1@example.com');

-- Insert test projects
INSERT INTO projects (owner_id, name, description)
VALUES (
  'user-123',
  'Test Project',
  'This is a test project'
);
```

## Local Development

### Connect to Supabase

```bash
# Get connection string from Supabase dashboard
# Project Settings → Database → Connection String

psql postgresql://[user]:[password]@[host]:[port]/[database]
```

### View Schema

```sql
-- List tables
\dt

-- Describe table
\d projects

-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- View indexes
SELECT * FROM pg_indexes WHERE tablename = 'projects';
```

### Run Migrations Locally

Copy migration SQL and run in psql or Supabase SQL Editor.

### Reset Database (Development Only)

```sql
-- WARNING: This deletes all data!
-- Only for development, never production!

DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS auth.users CASCADE;

-- Then re-run migrations
```

## Backups

Supabase automatically backs up your database.

For production, ensure:
- Automated backups are enabled
- Backup retention is appropriate
- Backups are tested regularly

## Scaling

PostgreSQL can handle:
- Millions of rows
- Thousands of connections
- High query load

Supabase provides:
- Connection pooling
- Read replicas (paid)
- Automated scaling (via connection pool)
