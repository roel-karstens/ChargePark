# AI Development with GitHub Copilot

This repository is designed for efficient AI-assisted development using GitHub Copilot. These guidelines ensure consistency, security, and maintainability regardless of the underlying AI model.

## About This Repository

A production-ready full-stack starter application with:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python + FastAPI + Pydantic
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **Example**: Project management application with CRUD operations

## Architecture

```
React Frontend
      ↓
FastAPI Backend
      ↓
Supabase PostgreSQL + Auth + RLS
```

### Responsibilities

**Frontend**
- User interface and interactions
- Client-side state management
- Authentication UI (login/signup/logout)
- HTTP calls to FastAPI
- Presentation and layout logic

**Backend**
- Business logic
- API endpoints and routing
- Authentication validation
- Authorization and access control
- Data transformation
- Input validation
- External integrations

**Database**
- PostgreSQL persistence
- Authentication (Supabase Auth)
- Row Level Security (RLS) policies
- Schema and migrations

### Security Boundaries

**Frontend MUST NOT contain:**
- Service-role keys
- Database credentials
- Private API keys
- Backend secrets

**Authorization must be enforced server-side:**
- Never rely exclusively on client-side checks
- Always validate authentication on the backend
- Use RLS for database-level access control

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Fast build tooling
- **ESLint**: Code quality
- **Vitest**: Unit and component tests

### Backend
- **Python 3.12+**: Language
- **FastAPI**: Web framework
- **Pydantic**: Data validation
- **Pyright**: Type checking
- **Ruff**: Linting and formatting
- **pytest**: Testing

### Database
- **Supabase**: PostgreSQL + Auth + RLS
- **PostgreSQL 15+**: Relational database

### Deployment
- **Vercel**: Frontend hosting
- **Supabase**: Backend infrastructure
- **GitHub Actions**: CI/CD (future)

## Repository Structure

```
/
├── AGENTS.md                          # This file
├── README.md                          # Getting started
├── .gitignore
├── .editorconfig
│
├── .github/
│   ├── copilot-instructions.md       # Primary Copilot guidance
│   ├── instructions/                 # Path-specific instructions
│   │   ├── frontend.instructions.md
│   │   ├── backend.instructions.md
│   │   ├── database.instructions.md
│   │   └── tests.instructions.md
│   └── prompts/                      # Reusable Copilot prompts
│       ├── implement-feature.prompt.md
│       ├── review.prompt.md
│       ├── security-review.prompt.md
│       ├── database-change.prompt.md
│       └── test-and-review.prompt.md
│
├── frontend/                         # React + TypeScript
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities and helpers
│   │   ├── types/                   # TypeScript types
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Entry point
│   ├── tests/                       # Component tests
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   └── .env.example
│
├── backend/                         # FastAPI + Python
│   ├── app/
│   │   ├── api/                    # API routes
│   │   ├── core/                   # Core utilities (config, auth)
│   │   ├── models/                 # Database models (SQLAlchemy)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # Business logic
│   │   ├── dependencies.py         # FastAPI dependencies
│   │   └── main.py                 # Application entry point
│   ├── tests/                      # API and service tests
│   ├── pyproject.toml
│   └── .env.example
│
├── supabase/                        # Database
│   ├── migrations/
│   │   └── 0001_initial_schema.sql # Initial schema
│   └── seed.sql                     # Optional: seed data
│
├── docs/                            # Documentation
│   ├── architecture.md
│   ├── security.md
│   ├── database.md
│   ├── development.md
│   └── decisions/
│       └── README.md
│
└── scripts/                         # Utility scripts
    ├── test.sh
    └── validate.sh
```

## Example Application

The repository includes a minimal but fully functional project management app:

**Database Schema**: `projects` table
- `id` (UUID primary key)
- `owner_id` (references auth.users)
- `name` (project name)
- `description` (project description)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**API Endpoints**
- `GET /health` — Health check
- `GET /api/v1/projects` — List authenticated user's projects
- `POST /api/v1/projects` — Create new project
- `GET /api/v1/projects/{id}` — Get project details
- `PATCH /api/v1/projects/{id}` — Update project
- `DELETE /api/v1/projects/{id}` — Delete project

**Frontend Features**
- Signup and login with Supabase Auth
- Protected dashboard (requires authentication)
- List, create, edit, and delete projects
- Loading states, error handling, empty states

## Coding Standards

### TypeScript (Frontend)

- Strict type mode always enabled
- No `any` types without justification
- Export types from components that need them
- Use discriminated unions for complex state
- Prefer immutable patterns
- Write meaningful prop types for reusable components

### Python (Backend)

- Type hints on all functions and methods
- Pydantic models for request/response validation
- FastAPI dependency injection for services and auth
- Thin route handlers (2–5 lines of logic)
- Business logic in service layer
- Consistent HTTP status codes
- Descriptive error messages (without exposing internal details)

### SQL (Database)

- All schema changes via migrations
- RLS enabled on all tables with user data
- Explicit ownership rules (owner_id, created_by, etc.)
- Appropriate indexes on foreign keys and search fields
- Constraints to enforce data integrity
- No destructive changes without explicit approval

## Security Requirements

1. **Never commit secrets**
   - Use `.env.example` to document required variables
   - `.env` is in `.gitignore`

2. **Authenticate server-side**
   - Validate JWT tokens on every protected endpoint
   - Use FastAPI's dependency injection
   - Extract `user_id` from token claims

3. **Authorize with RLS**
   - Enable RLS on all tables
   - Define explicit SELECT, INSERT, UPDATE, DELETE policies
   - Test policies before deployment

4. **Validate input**
   - Use Pydantic for request validation
   - Whitelist allowed fields
   - Validate data types and constraints

5. **Avoid sensitive logging**
   - Do not log passwords, tokens, or sensitive user data
   - Log sufficient detail for debugging without exposing secrets

6. **Use HTTPS in production**
   - Set secure cookie flags
   - Use environment-aware settings

## Testing Requirements

### Backend (pytest)

- Unit tests for services and utilities
- API integration tests for key endpoints
- Authentication and authorization tests
- Test happy paths and error cases
- Aim for meaningful coverage, not 100%

### Frontend (Vitest)

- Component tests for complex UI
- Hook tests for custom logic
- User interaction tests for critical flows
- Integration tests for page-level features
- Avoid brittle implementation-detail tests

**Never remove tests to make validation pass.**

## Database Migration Rules

1. Create a new migration file for each change
2. Migrations are numbered sequentially: `0001_`, `0002_`, etc.
3. Write migrations to be idempotent (safe to run multiple times if needed)
4. Include both up and down logic for reversibility
5. Test migrations locally before committing
6. Add comments explaining the purpose and RLS implications
7. No destructive changes (drop table, drop column) without explicit approval

## Definition of Done

A feature is complete when:

1. ✅ Code follows established patterns
2. ✅ Tests pass (unit, integration, component)
3. ✅ Linting passes (ESLint, Ruff)
4. ✅ Type checking passes (Pyright, TypeScript)
5. ✅ Builds succeed (Vite, backend)
6. ✅ Security review passes (no secrets, proper auth/authz)
7. ✅ No unnecessary dependencies introduced
8. ✅ No breaking changes to public APIs
9. ✅ Documentation updated if needed
10. ✅ Git diff is reviewed for correctness

## AI Development Workflow

Follow this workflow for every feature, bug fix, or change:

### 1. UNDERSTAND

- Read the feature request or issue carefully
- Identify acceptance criteria
- Clarify scope and constraints
- Ask questions if anything is ambiguous

### 2. INSPECT

- Examine existing code related to the change
- Review relevant schemas, types, and services
- Check authentication and authorization patterns
- Look for similar implementations to reuse
- Study the test structure

### 3. PLAN

- Identify affected layers (frontend, backend, database)
- List the smallest, most appropriate changes
- Consider existing patterns and conventions
- Plan database migrations if needed
- Sketch the API contract if building endpoints

### 4. IMPLEMENT

- Write code using established patterns
- Reuse existing components, hooks, and services
- Prefer composition and small functions
- Maintain strict typing
- Add error handling and edge cases
- Include loading states where appropriate

### 5. TEST

- Add unit tests for new functions/services
- Add integration tests for API changes
- Add component tests for UI changes
- Test happy paths and error scenarios
- Verify authentication/authorization

### 6. VALIDATE

- Run linting (ESLint for frontend, Ruff for backend)
- Run type checking (TypeScript, Pyright)
- Run tests (Vitest for frontend, pytest for backend)
- Run builds (Vite, FastAPI)
- Check for unused imports
- Verify no secrets in the diff

### 7. REVIEW

- Review your own git diff carefully
- Check for correctness, security, and maintainability
- Look for unnecessary complexity or dead code
- Verify tests actually test the feature
- Confirm RLS and authorization are correct
- Check for performance issues

### 8. SUMMARIZE

- Write a clear summary of what changed
- Explain why changes were made
- Note any limitations or known issues
- List validation steps executed
- Describe remaining risks or follow-up work

## What AI Should NOT Do

- **Over-engineer**: Use simple solutions
- **Introduce unnecessary abstractions**: Add only when proven necessary
- **Add unnecessary dependencies**: Prefer built-in or minimal libraries
- **Rewrite working code**: Change only what's needed for the feature
- **Duplicate functionality**: Reuse existing code
- **Weaken tests**: Never remove tests or reduce coverage
- **Bypass security**: Always enforce auth/authz
- **Expose secrets**: Never include credentials in code or logs
- **Make unrelated changes**: Stay focused on the feature

## Using This Repository with GitHub Copilot

### Copilot Chat

Use the [GitHub Copilot Chat](https://docs.github.com/en/copilot/using-github-copilot/prompt-templates) prompts in `.github/prompts/`:

- `implement-feature.prompt.md` — For building new features
- `review.prompt.md` — For code review
- `security-review.prompt.md` — For security audits
- `database-change.prompt.md` — For schema migrations
- `test-and-review.prompt.md` — For testing and validation

### Inline Copilot Completions

Copilot will follow the guidelines in `.github/copilot-instructions.md` and path-specific instruction files automatically.

### Best Practices

1. **Be specific**: Describe what you're building, not just "add a feature"
2. **Reference code**: Point Copilot to existing patterns to follow
3. **Request validation**: Always ask to "run validation" before claiming done
4. **Review diffs**: Check Copilot's changes against security and architecture guidelines
5. **Test first**: Ask for tests before implementation when appropriate

## Model Independence

These instructions are **model-agnostic** and work equally well with:
- Claude
- OpenAI (GPT)
- Other supported GitHub Copilot models

Do not assume capabilities or behavior of a specific model. The repository setup and instructions are designed to be compatible with any AI model Copilot uses.

---

**Last updated**: September 2026
