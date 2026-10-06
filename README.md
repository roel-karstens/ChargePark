# AI-Ready Full-Stack Starter

A production-quality, AI-assisted full-stack starter repository with React + FastAPI + Supabase. Designed for efficient GitHub Copilot-powered development.

## 🎯 Overview

This is a complete, reusable foundation for building modern web applications:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: FastAPI + Python 3.12+
- **Database**: Supabase PostgreSQL + Auth + RLS
- **Example App**: Project management with full CRUD operations
- **AI-Ready**: Comprehensive instructions for GitHub Copilot

The repository is **model-agnostic** — works with any GitHub Copilot model (Claude, OpenAI, or others).

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│      React Frontend (Vite)      │
│     - TypeScript                │
│     - Components                │
│     - Authentication UI         │
└──────────────┬──────────────────┘
               │ HTTP Calls
               ↓
┌─────────────────────────────────┐
│   FastAPI Backend (Python)      │
│     - API Endpoints             │
│     - Business Logic            │
│     - Authentication/AuthZ      │
└──────────────┬──────────────────┘
               │ SQL Queries
               ↓
┌─────────────────────────────────┐
│  Supabase PostgreSQL            │
│     - Auth                      │
│     - Row Level Security (RLS)  │
│     - Data Persistence          │
└─────────────────────────────────┘
```

**Key Rule**: Frontend never accesses private keys or database directly. All access through authenticated FastAPI.

## ✨ Code Quality

This repository emphasizes **SOLID principles** and **DRY (Don't Repeat Yourself)**:

- **S**ingle Responsibility: Each service, component, and function has one purpose
- **O**pen/Closed: Extensible through composition, not modification
- **L**iskov Substitution: Proper type safety with TypeScript and Python type hints
- **I**nterface Segregation: Minimal, focused props and parameters
- **D**ependency Inversion: Dependency injection in FastAPI, prop drilling avoided in React

### Recent Improvements

✅ **Backend**: UUID conversion consolidated into `ProjectService._normalize_uuid()`  
✅ **Backend**: Authorization logic extracted into `get_authorized_project()` dependency  
✅ **Frontend**: Error display unified in `ErrorAlert` component  
✅ **Frontend**: Loading state management consolidated in `useLoadingState()` hook  
✅ **Frontend**: Dev configuration centralized in `config/dev.ts`  
✅ **Tests**: Duplicate fixtures removed, added reusable `test_project` fixture

No breaking changes — all improvements maintain backward compatibility.

## 📁 Repository Structure

```
/
├── AGENTS.md                          # AI development guide
├── README.md                          # This file
├── .gitignore
├── .editorconfig
│
├── .github/
│   ├── copilot-instructions.md       # Copilot primary guidance
│   ├── instructions/                 # Path-specific instructions
│   │   ├── frontend.instructions.md
│   │   ├── backend.instructions.md
│   │   ├── database.instructions.md
│   │   └── tests.instructions.md
│   └── prompts/                      # Reusable prompts
│       ├── implement-feature.prompt.md
│       ├── review.prompt.md
│       ├── security-review.prompt.md
│       ├── database-change.prompt.md
│       └── test-and-review.prompt.md
│
├── frontend/                         # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities (API client, auth)
│   │   ├── types/                   # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   └── .env.example
│
├── backend/                         # FastAPI + Python
│   ├── app/
│   │   ├── api/                    # API routes
│   │   ├── core/                   # Core config, auth
│   │   ├── models/                 # Database models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── services/               # Business logic
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── tests/
│   ├── pyproject.toml
│   └── .env.example
│
├── supabase/                        # Database
│   ├── migrations/
│   │   └── 0001_initial_schema.sql
│   └── seed.sql
│
├── docs/                            # Documentation
│   ├── architecture.md
│   ├── security.md
│   ├── database.md
│   ├── development.md
│   └── decisions/
│       └── README.md
│
└── scripts/
    ├── test.sh
    └── validate.sh
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Supabase account (free tier available)

### 1. Clone and Setup

```bash
git clone <repository>
cd ai_fullstack_starter
```

### 2. Supabase Project Setup

Create a new Supabase project at [supabase.com](https://supabase.com) and get your credentials from project settings.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local

# Add your Supabase credentials to .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:8000
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies with uv (recommended) or pip
uv pip install -e ".[dev]"
# or
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env

# Add Supabase credentials
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # NEVER expose this
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your URL and keys from the project settings
3. (Optional) For production with PostgreSQL:
   - Go to project settings → Database → Connection Pooler
   - Select "Session mode"
   - Copy the connection string and add to backend `.env`:
     ```
     DATABASE_URL=postgresql://user:password@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
     ```

**Database tables are created automatically on startup** — no manual migrations needed! 🎉

### 5. Run Development Servers (with Auto-Migration)

**Backend** (from `backend/` directory):
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Runs at http://localhost:8000
# Automatically creates tables and RLS policies on startup!
```

**Frontend** (from `frontend/` directory):
```bash
npm run dev
# Runs at http://localhost:5173
```

## 📚 Environment Variables

### Frontend (.env.local)

```
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:8000
```

These are **public** (prefixed with `VITE_`) and safe to commit as `.env.example`.

### Backend (.env)

```
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ENVIRONMENT=development
# Optional: PostgreSQL connection (auto-migration, production Supabase)
# If set, backend uses PostgreSQL. Otherwise falls back to SQLite.
DATABASE_URL=postgresql://user:password@host:5432/postgres
```

The `.env` file is in `.gitignore` — **never commit it**.

### Development Features

**Dev Auth Mode** (Frontend only, requires `ENVIRONMENT=development` in backend):
- Green "🚀 Development Mode" button on login page
- Generates mock JWT tokens without Supabase rate limiting
- Useful for testing authentication flows during development

**Auto-Migration** (Backend on startup):
- Creates database tables from SQLAlchemy models
- Enables Row Level Security (RLS) on PostgreSQL
- Configures policies for owner-based access control
- Creates performance indexes
- Works on first startup, idempotent on subsequent runs

## 🔐 Security

### Key Principles

1. **Frontend never accesses private keys**
   - Never commit `.env` with secrets
   - Never import service-role keys in frontend code

2. **Server-side authentication**
   - All protected endpoints validate JWT
   - User ID extracted from token claims
   - 401 for missing/invalid auth, 403 for insufficient permissions

3. **Database-level security**
   - Row Level Security (RLS) enabled on all tables
   - Explicit policies for SELECT, INSERT, UPDATE, DELETE
   - Users only access their own data

4. **Input validation**
   - Pydantic validation on all requests
   - Whitelisted fields
   - Type and constraint validation

5. **Error handling**
   - Log errors for debugging
   - Never expose stack traces to clients
   - Generic error messages to users

See [docs/security.md](docs/security.md) for detailed security guidelines.

## 💻 Development

### Frontend

**Run dev server:**
```bash
cd frontend
npm run dev
```

**Lint and format:**
```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run type-check    # TypeScript
```

**Run tests:**
```bash
npm run test          # Vitest
npm run test:ui       # Test UI
```

**Build for production:**
```bash
npm run build
```

### Backend

**Run dev server:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Lint and format:**
```bash
ruff check .          # Check
ruff format .         # Format
ruff check --fix .    # Fix issues
```

**Type checking:**
```bash
pyright
```

**Run tests:**
```bash
pytest                # All tests
pytest -v             # Verbose
pytest -k test_name   # Specific test
pytest --cov          # With coverage
```

**Code quality:**
```bash
python -m pytest --cov=app tests/
```

### Database

**Schema is managed automatically via SQLAlchemy models** — no manual SQL migrations for tables!

To add new tables:
1. Create a new model in `backend/app/models/`
2. Import it in `backend/app/models/__init__.py`
3. Restart the backend — it auto-creates the table on startup

**For custom SQL operations** (indexes, triggers, etc.):
1. Add SQL to `backend/app/main.py` in the RLS setup section
2. Restart the backend

**View schema:**
```bash
# Supabase dashboard → Table Editor
# or
psql postgresql://user:password@host:5432/postgres  # Using pooler connection
```

## 🧪 Testing

### Backend (pytest)

```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest -k test_projects   # Run specific tests
pytest --cov              # With coverage report
```

### Frontend (Vitest)

```bash
cd frontend
npm run test              # Run tests
npm run test:ui           # Interactive test UI
npm run test:watch        # Watch mode
```

## ✅ Validation

Run the complete validation suite before committing:

```bash
# Backend
cd backend
ruff check .
ruff format --check .
pyright
pytest

# Frontend
cd frontend
npm run lint
npm run type-check
npm run test
npm run build
```

Or use the convenience script:
```bash
./scripts/validate.sh
```

## 🔗 API

### Health Check

```
GET /health
→ { "status": "ok" }
```

### Projects (Example)

All endpoints require authentication (Bearer token).

```
GET    /api/v1/projects              # List your projects
POST   /api/v1/projects              # Create project
GET    /api/v1/projects/{id}         # Get project
PATCH  /api/v1/projects/{id}         # Update project
DELETE /api/v1/projects/{id}         # Delete project
```

See [docs/architecture.md](docs/architecture.md) for full API docs.

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`
4. Deploy

### Backend

Options:
- **Vercel**: Deploy as serverless function
- **Heroku**: `git push heroku main`
- **Railway**: Connect Git repository
- **Render**: Connect Git repository

Set environment variables on your hosting platform (never commit `.env`).

## 🤖 AI-Assisted Development

This repository includes a **modern GitHub Copilot AI development layer** with specialized agents, skills, and MCP integrations.

### Agents (Specialized Expertise)

Four specialized agents handle different responsibilities:

| Agent | Purpose |
|-------|---------|
| **architect** | Analyze requirements, design solutions, identify trade-offs |
| **database** | Schema design, migrations, RLS policies, diagnostics |
| **security-reviewer** | Vulnerability detection, severity classification, hardening |
| **code-reviewer** | Code quality, correctness, architecture, maintainability |

### Skills (Specialized Knowledge)

Eleven domain-specific skills encode best practices and workflows:

| Skill | Focus |
|-------|-------|
| **verification** ⭐ | Evidence-based runtime verification + visual verification for UI |
| **verification-maintenance** | Keep Feature Map current as app evolves |
| **design-review** ⭐ NEW | Visual quality audit (hierarchy, spacing, colors, accessibility) |
| **component-testing** ⭐ NEW | Patterns for testing component variations, states, accessibility |
| **responsive-verification** ⭐ NEW | Systematic mobile/tablet/desktop testing with screenshots |
| **supabase-database** | Schema, migrations, RLS, security patterns |
| **frontend-debugging** | Browser tools, console, network inspection |
| **frontend-design** ⭐ ENHANCED | Components, accessibility, design direction workflow |
| **deployment** | Build, preview, verification, smoke tests |
| **security-review** | Auth, authz, secrets, vulnerabilities |
| **testing** | Unit tests, integration tests, validation workflows |

**⭐ P1 PHASE**: Added **component-testing** and **responsive-verification** skills. Enhanced **frontend-design** with design direction workflow (establish visual strategy before coding).

### MCP Integrations (Optional)

Optional Model Context Protocol integrations enhance Copilot's capabilities:

- **Supabase MCP**: Inspect database schema, manage RLS policies, test migrations
- **Vercel MCP**: Monitor deployments, view logs, manage environment variables
- **Browser/DevTools MCP**: Inspect running app, debug issues in real-time
- **GitHub MCP**: Interact with issues, PRs, and repository

See [docs/ai-development.md](docs/ai-development.md) for complete guide.

### Using Copilot with Agents & Skills

**Copilot Chat Prompts** (in `.github/prompts/`):
- `verify-and-ship.prompt.md` — **Use after implementing** to verify changes work
- `implement-feature.prompt.md` — Building new features
- `review.prompt.md` — Code review
- `security-review.prompt.md` — Security audits
- `database-change.prompt.md` — Schema migrations
- `test-and-review.prompt.md` — Testing and validation

**Agent References**:
- Ask Copilot to invoke agents for specialized tasks:
  - "Use the architect agent to design this feature"
  - "Have the database agent review this schema"
  - "Ask the security-reviewer to check for vulnerabilities"

**Skill References**:
- Request skill guidance when working on specific areas:
  - "Use the frontend-design skill for this component"
  - "Apply the testing skill to verify this"
  - "Reference the security-review skill for this endpoint"

**Inline Completions**:
- Copilot follows `.github/copilot-instructions.md` (global) and path-specific instructions
- Leverages skills automatically when you're working in relevant domains

### Best Practices

1. **Be specific**: Describe requirements, not just "add a feature"
2. **Reference code**: Point to existing patterns to follow
3. **Ask for validation**: Always request tests, linting, type checking
4. **Review diffs**: Check against security and architecture guidelines
5. **Use agents for complexity**: Delegate architecture/security decisions to specialists

See [AGENTS.md](AGENTS.md) and [docs/ai-development.md](docs/ai-development.md) for complete guides.

## 📖 Documentation

**AI & Verification (New):**
- [docs/verification.md](docs/verification.md) — **Verification-first philosophy** (start here!)
- [.github/skills/verification/SKILL.md](.github/skills/verification/SKILL.md) — How to verify changes
- [.github/skills/verification-maintenance/SKILL.md](.github/skills/verification-maintenance/SKILL.md) — Keep verification current
- [.github/prompts/verify-and-ship.prompt.md](.github/prompts/verify-and-ship.prompt.md) — Post-implementation workflow

**AI Development:**
- [AGENTS.md](AGENTS.md) — Complete AI development guide
- [docs/ai-development.md](docs/ai-development.md) — AI development layer architecture and workflows
- [docs/mcp.md](docs/mcp.md) — Model Context Protocol integrations setup

**Application:**
- [docs/architecture.md](docs/architecture.md) — System architecture
- [docs/security.md](docs/security.md) — Security guidelines
- [docs/database.md](docs/database.md) — Database schema and migrations
- [docs/development.md](docs/development.md) — Development setup and workflow

## 📋 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18+ |
| | TypeScript | 5+ |
| | Vite | 4+ |
| | ESLint | Latest |
| | Vitest | Latest |
| **Backend** | Python | 3.12+ |
| | FastAPI | 0.100+ |
| | Pydantic | 2+ |
| | Pyright | Latest |
| | Ruff | Latest |
| | pytest | 7+ |
| **Database** | Supabase | Latest |
| | PostgreSQL | 15+ |
| **Deployment** | Vercel | - |

## 📝 License

[Choose a license]

## 🤝 Contributing

This is a starter repository. For a specific project:

1. Fork or clone this repository
2. Update `package.json`, `pyproject.toml`, README as needed
3. Replace example app with your actual application
4. Follow the development workflow in AGENTS.md

## ❓ Questions?

Refer to:
- [AGENTS.md](AGENTS.md) for AI development workflow
- [docs/development.md](docs/development.md) for setup help
- [docs/security.md](docs/security.md) for security questions
