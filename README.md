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

### 2. Frontend Setup

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
3. Run migrations in Supabase SQL Editor or psql:

```sql
-- Copy the contents of supabase/migrations/0001_initial_schema.sql
-- and run in Supabase SQL Editor
```

### 5. Run Development Servers

**Backend** (from `backend/` directory):
```bash
fastapi dev app/main.py
# Runs at http://localhost:8000
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
```

The `.env` file is in `.gitignore` — **never commit it**.

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
fastapi dev app/main.py
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

**Create a migration:**
```bash
# Create supabase/migrations/0002_your_migration.sql
# Write SQL changes
# Deploy via Supabase dashboard or psql
```

**View schema:**
```bash
# Supabase dashboard → SQL Editor
# or
psql postgresql://user:password@db.supabase.co:5432/postgres
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

## 🤖 GitHub Copilot Workflow

This repository is optimized for AI-assisted development.

### Using Copilot Chat

Use the prompts in `.github/prompts/`:

1. **Implement a feature**
   - Use `implement-feature.prompt.md`
   - Copilot will follow the UNDERSTAND → INSPECT → PLAN → IMPLEMENT workflow

2. **Review code**
   - Use `review.prompt.md`
   - Get feedback on correctness, architecture, security

3. **Security audit**
   - Use `security-review.prompt.md`
   - Check for vulnerabilities and compliance

4. **Database changes**
   - Use `database-change.prompt.md`
   - Create migrations with RLS policies

5. **Test and validate**
   - Use `test-and-review.prompt.md`
   - Run full validation suite

### Inline Completions

Copilot will follow:
- `.github/copilot-instructions.md` (global)
- `.github/instructions/*.instructions.md` (path-specific)

Just start typing and Copilot will suggest completions following the patterns.

### Best Practices

1. **Be specific**: Describe what you want, not just "add a feature"
2. **Reference code**: Point to existing patterns to follow
3. **Ask for validation**: Always request validation before claiming done
4. **Review diffs**: Check Copilot's changes against security guidelines
5. **Test first**: Ask for tests before implementation

See [AGENTS.md](AGENTS.md) for complete AI development guide.

## 📖 Documentation

- [AGENTS.md](AGENTS.md) — Complete AI development guide
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
