# GitHub Copilot Instructions

## Project Overview

**AI-Ready Full-Stack Starter**
- React + TypeScript frontend (Vite, ESLint, Vitest)
- FastAPI + Python backend (Pydantic, Ruff, Pyright, pytest)
- Supabase PostgreSQL + Auth + Row Level Security
- Authentication: Supabase email/password
- Example: Project management CRUD app

## Architecture

```
React Frontend → FastAPI Backend → Supabase PostgreSQL
                                  + Auth + RLS
```

**Critical Rule**: Frontend MUST NEVER access database or private keys. All access through authenticated FastAPI.

## AI Development Layer

This repository includes specialized infrastructure for AI-assisted development with GitHub Copilot.

**Read this first:** [`docs/ai-development.md`](../../docs/ai-development.md)

### Key Components

**MCP Integrations** (`docs/mcp.md`)
- Optional external tools: Supabase, Vercel, Browser, GitHub
- Extend Copilot's capabilities
- Read-only preferred for production

**Skills** (`.github/skills/`)
- Specialized task-specific knowledge
- Use when performing specific types of work
- Examples: database schema, frontend debugging, deployment, security review, testing

**Agents** (`.github/agents/`)
- Specialized responsibilities: architect, database, security-reviewer, code-reviewer
- Invoke for expert analysis and review
- Delegate complex work

**Prompts** (`.github/prompts/`)
- Explicit user workflows
- Example: implement-feature, review, security-review, test-and-review

### How It Works

```
Global Instructions (this file)
    ↓
MCP: External Tools (Supabase, Vercel, Browser)
    ↓
Skills: Specialized Knowledge (database, debugging, deployment, security, testing)
    ↓
Agents: Specialized Roles (architect, database, security-reviewer, code-reviewer)
    ↓
Prompts: User Workflows (implement-feature, review, test-and-review)
```

The system is **model-agnostic**: works with Claude, OpenAI, or any Copilot model.

## Responsibilities

**Frontend**
- UI and user interactions
- Client-side state
- Authentication UI
- HTTP calls to `/api/v1/*` endpoints
- Loading/error/empty states

**Backend**
- Business logic in services
- API endpoints (thin handlers)
- Authentication validation
- Authorization (server-side)
- Data transformation and validation
- External integrations

**Database**
- PostgreSQL persistence
- Supabase Auth integration
- Row Level Security policies
- Schema and migrations only

## Development Principles

### 1. Inspect Before Modifying

Read existing code first:
- How are components structured?
- What patterns are used?
- Where is similar logic already implemented?
- What authentication/authorization patterns exist?

### 2. Reuse Existing Patterns

- Reuse components, hooks, and services
- Follow naming conventions
- Match code style
- Use existing error handling

### 3. Prefer Minimal Changes

- Smallest change that solves the problem
- No unnecessary refactoring
- No speculative abstractions
- No dead code

### 4. Maintain Strict Typing

**TypeScript (Frontend)**
- No `any` types
- All function parameters typed
- All return types specified
- Discriminated unions for complex state
- Export types for reusable components

**Python (Backend)**
- Type hints on all functions
- Pydantic models for validation
- FastAPI dependency injection
- Return types on all functions

### 5. Write Tests

- Add tests for new functionality
- Cover happy paths and error cases
- Component tests for UI changes
- Integration tests for API changes
- Unit tests for services

### 6. Run Validation

Before finishing:
- Frontend: ESLint, TypeScript, Vitest, Vite build
- Backend: Ruff, Pyright, pytest, build

Do NOT claim tests passed unless you actually ran them.

## Security Requirements

### 1. Never Commit Secrets

- `.env` is in `.gitignore`
- Use `.env.example` to document variables
- Distinguish public (VITE_*) and secret variables
- Never log sensitive data

### 2. Authenticate Server-Side

- Validate JWT on every protected endpoint
- Extract `user_id` from token
- Use FastAPI dependency injection
- Return 401 for missing/invalid tokens
- Return 403 for insufficient permissions

### 3. Enforce Authorization

**Backend**
- Check user ownership of resources
- Verify permissions before returning data
- Use consistent error responses

**Database**
- Enable RLS on all tables
- Define explicit policies for SELECT, INSERT, UPDATE, DELETE
- Test policies before deployment

### 4. Validate Input

- Use Pydantic for all requests
- Whitelist allowed fields
- Validate types, lengths, formats
- Return 422 for validation errors

### 5. Protect API Endpoints

- All data endpoints require authentication
- POST/PATCH/DELETE require ownership
- Return appropriate HTTP status codes
- Avoid revealing internal details in errors

### 6. Secure Error Handling

- Log errors for debugging
- Never expose stack traces to clients
- Never reveal database structure
- Return generic error messages

## Code Quality

### Frontend

**Components**
- Single responsibility
- Reusable with clear props
- Handle loading/error/empty states
- Accessible (labels, ARIA)
- No business logic (belongs in hooks/services)

**Types**
- Discriminated unions for state
- Exported from components that need them
- No `unknown` or `any`

**Hooks**
- Encapsulate stateful logic
- Clear dependencies
- Proper cleanup

**Testing**
- Component tests for complexity
- User interaction tests for flows
- Avoid brittle implementation tests

### Backend

**Routes**
- 2–5 lines of logic per handler
- Validate input with Pydantic
- Call services for business logic
- Return appropriate status codes

**Services**
- Encapsulate business logic
- Take dependencies as arguments
- No database queries in handlers
- Return typed responses

**Models & Schemas**
- Pydantic for requests/responses
- SQLAlchemy for database models
- Clear separation of concerns

**Testing**
- Unit tests for services
- Integration tests for endpoints
- Test auth and authorization
- Test error cases

### Database

- All changes via migrations
- RLS on tables with user data
- Explicit ownership rules
- Indexes on foreign keys
- Constraints for data integrity
- No destructive changes without approval

## Model Independence

These instructions work with ANY GitHub Copilot model:
- Claude
- OpenAI (GPT)
- Other supported models

Do not assume capabilities of a specific model.

## When to Ask for Help

- Ambiguous requirements
- Architectural decisions
- Security concerns
- Large refactorings
- External integrations
- Performance issues
