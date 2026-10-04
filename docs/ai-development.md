# AI-Assisted Development Guide

This repository is structured for efficient AI-assisted development with GitHub Copilot.

## Architecture Overview

The AI development layer consists of several interconnected concepts:

```
┌─────────────────────────────────────────────────────────┐
│ Global Instructions & Repository Principles             │
│ (.github/copilot-instructions.md)                       │
│                                                          │
│ - Engineering standards                                 │
│ - Responsibility separation (frontend/backend/DB)       │
│ - Security principles                                   │
│ - Type safety requirements                              │
│ - Development workflow                                  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ MCP: External Tools & Services                          │
│ (docs/mcp.md)                                           │
│                                                          │
│ - Supabase database access                              │
│ - Vercel deployments                                    │
│ - Browser/DevTools debugging                            │
│ - GitHub integration                                    │
│                                                          │
│ Think: "What tools can the AI use?"                     │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Skills: Specialized Knowledge & Workflows               │
│ (.github/skills/)                                       │
│                                                          │
│ - supabase-database/ — Schema, migrations, RLS          │
│ - frontend-debugging/ — Browser, console, network       │
│ - deployment/ — Build, preview, verification            │
│ - security-review/ — Vulnerabilities, hardening         │
│ - testing/ — Unit, integration, validation              │
│                                                          │
│ Think: "How should the AI perform this task?"           │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Agents: Specialized Responsibilities                    │
│ (.github/agents/)                                       │
│                                                          │
│ - architect — Architecture analysis, design             │
│ - database — Schema, migrations, diagnostics            │
│ - security-reviewer — Vulnerability identification      │
│ - code-reviewer — Quality, correctness, conventions     │
│                                                          │
│ Think: "What specialized role is the AI performing?"    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Prompts: Explicit User Workflows                        │
│ (.github/prompts/)                                      │
│                                                          │
│ - implement-feature.prompt — Feature implementation     │
│ - review.prompt — Code review                           │
│ - security-review.prompt — Security audit               │
│ - database-change.prompt — Migration workflow            │
│ - test-and-review.prompt — Full validation              │
│                                                          │
│ Think: "What explicit workflow does the user want?"     │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

### MCP (Model Context Protocol)

**MCP provides external capabilities.**

Examples:
- Query Supabase database schema
- Inspect Vercel deployment status
- Open browser and inspect runtime
- Read GitHub issues

**You** decide:
- Which MCPs to enable
- What credentials to provide
- How much access to grant

See: `docs/mcp.md`

### Skills

**Skills encode specialized knowledge.**

When should you use a skill?
- Reviewing database schema → `supabase-database` skill
- Debugging frontend → `frontend-debugging` skill
- Preparing deployment → `deployment` skill
- Auditing security → `security-review` skill
- Testing changes → `testing` skill

Skills:
- Are task-specific
- Explain workflows and best practices
- Reference patterns and examples
- Often leverage MCP capabilities
- Can be referenced when relevant

See: `.github/skills/`

### Agents

**Agents represent specialized responsibilities.**

When should you use an agent?
- Need architecture analysis → `architect` agent
- Designing database changes → `database` agent
- Reviewing for security issues → `security-reviewer` agent
- Reviewing code quality → `code-reviewer` agent

Agents:
- Specialize in specific domains
- Draw on relevant skills
- Provide focused expertise
- Can be invoked as subagents
- Keep count small (avoid artificial agents)

See: `.github/agents/`

### Prompts

**Prompts provide explicit user workflows.**

When should you use a prompt?
- Implementing a feature → Use `implement-feature.prompt`
- Reviewing code → Use `review.prompt`
- Auditing security → Use `security-review.prompt`
- Creating migrations → Use `database-change.prompt`
- Running full validation → Use `test-and-review.prompt`

Prompts:
- Are user-triggered workflows
- Guide through steps
- Call on appropriate agents and skills
- Can be customized
- Live in `.github/prompts/`

### Path-specific Instructions

**Instructions guide code patterns by file type.**

Files:
- `.github/instructions/backend.instructions.md` — Python, FastAPI patterns
- `.github/instructions/frontend.instructions.md` — React, TypeScript patterns
- `.github/instructions/database.instructions.md` — SQL, RLS, migrations
- `.github/instructions/tests.instructions.md` — Test patterns

These apply automatically when editing files in matching paths.

---

## Recommended Workflows

### 1. Implementing a New Feature

```
User Request
     ↓
Read: .github/prompts/implement-feature.prompt.md
     ↓
1. Understand requirement
2. Inspect existing code
3. Architect can help: .github/agents/architect.agent.md
4. Plan implementation
5. Implement (guided by path-specific instructions)
6. Run: .github/prompts/test-and-review.prompt.md
7. Use: .github/agents/code-reviewer.agent.md
8. Use: .github/agents/security-reviewer.agent.md
9. Deploy (guided by: .github/skills/deployment/)
```

### 2. Debugging Frontend Issue

```
Issue: "Feature X doesn't work"
     ↓
Use: .github/skills/frontend-debugging/
     ↓
1. Start dev server
2. Use Browser MCP (if available): inspect console, network
3. Reproduce the issue
4. Collect evidence
5. Identify root cause
6. Implement minimal fix
7. Verify with Browser MCP
```

### 3. Designing Database Schema

```
Requirement: "Add user preferences table"
     ↓
Use: .github/agents/database.agent.md
     ↓
Also use: .github/skills/supabase-database/
And: .github/prompts/database-change.prompt.md
     ↓
1. Understand requirement
2. Inspect current schema (Supabase MCP)
3. Design new schema
4. Plan RLS policies
5. Create migration SQL
6. Review constraints and indexes
7. Test locally
8. Document changes
```

### 4. Security Review

```
Changes to review
     ↓
Use: .github/agents/security-reviewer.agent.md
     ↓
Also use: .github/skills/security-review/
     ↓
1. Understand what changed
2. Identify sensitive areas
3. Apply security checklist
4. Look for patterns
5. Verify with evidence
6. Classify severity
7. Provide specific fixes
```

### 5. Code Review

```
Code to review
     ↓
Use: .github/agents/code-reviewer.agent.md
     ↓
1. Understand requirements
2. Review diff
3. Check correctness
4. Check architecture
5. Check maintainability
6. Check complexity
7. Check testing
8. Check conventions
9. Provide feedback
```

### 6. Full Validation & Deployment

```
Ready to deploy
     ↓
Use: .github/prompts/test-and-review.prompt.md
     ↓
1. Run all validation (linting, types, tests, build)
2. Review git diff
3. Check security
4. Check architecture
5. Create preview (Vercel MCP)
6. Test preview (Browser MCP)
7. Get approval
8. Deploy
```

---

## Model Independence

This system is **model-agnostic**.

It works with any AI model that GitHub Copilot uses:
- Claude
- OpenAI (GPT)
- Gemini
- Others

**Do not:**
- Assume specific model capabilities
- Use model-specific features
- Rely on specific reasoning patterns
- Make model-specific claims

**Do:**
- Use evidence and tools
- Verify claims with code and tests
- Reference standards and patterns
- Use MCP capabilities

---

## Permissions & Safety

### Database

**Read-only for production:**
- Inspect schema
- Review RLS policies
- Test queries

**Never automatic:**
- DROP TABLE
- DELETE data
- Destructive migrations
- Production schema changes

**Always:**
- Require explicit approval
- Identify affected data
- Explain consequences
- Provide rollback plan

### Deployment

**Never automatic:**
- Production deployment
- Environment configuration changes
- Credential rotation

**Always:**
- Run validation first
- Create preview first
- Test preview thoroughly
- Get human approval
- Document deployment

### Secrets

**Never:**
- Print secrets
- Log secrets
- Expose credentials
- Commit .env files

**Always:**
- Use environment variables
- Store in `.env` (not in git)
- Document in `.env.example`
- Rotate compromised credentials

### Browser

Browser access is **development-only**.

**Do not:**
- Weaken application security for debugging
- Assume production issues are same as local
- Trust unverified runtime behavior

---

## Getting Started

### 1. Explore the Structure

```bash
cd .github/
ls -la

# You'll see:
# - copilot-instructions.md (global rules)
# - agents/ (specialized agents)
# - skills/ (specialized knowledge)
# - prompts/ (user workflows)
# - instructions/ (path-specific patterns)
```

### 2. Read the Guides

- **Start here:** `.github/copilot-instructions.md`
- **Global patterns:** `docs/architecture.md`, `docs/security.md`
- **MCP:** `docs/mcp.md`
- **How to debug:** `.github/skills/frontend-debugging/SKILL.md`
- **Database changes:** `.github/skills/supabase-database/SKILL.md`

### 3. Set Up MCP (Optional)

While not required, MCP makes AI much more capable:

- **Supabase:** Can inspect database schema
- **Vercel:** Can check deployment status
- **Browser:** Can debug runtime issues
- **GitHub:** Can read issues/PRs

See: `docs/mcp.md`

### 4. Use Skills When Relevant

When working on a task, reference the relevant skill:

```
"I need to add a new table. Let me consult the supabase-database skill."

"The feature isn't working. Let me use the frontend-debugging skill."

"Let me run through the testing skill to validate."
```

### 5. Invoke Agents for Expertise

When you need specialized input:

```
"@architect: Can you analyze how to implement saved dashboards?"

"@database: Design the schema for user preferences."

"@security-reviewer: Is this code secure?"

"@code-reviewer: Is this code quality acceptable?"
```

### 6. Use Prompts for Workflows

When you have a clear workflow in mind:

```
"Use the implement-feature prompt to add saved dashboards."

"Run the test-and-review prompt before deploying."

"Use the security-review prompt to audit the changes."
```

---

## Frequently Asked Questions

### Can I use this without MCP?

Yes. MCP is optional and makes things easier, but the system works without it.

### How do I invoke an agent?

It depends on your Copilot client:
- **Copilot Chat:** Mention by name: `@architect`, `@database`, etc.
- **Inline Copilot:** Use prompts in `.github/prompts/`
- **Command line:** Reference in custom instructions

### Can I create my own agents?

Yes, but keep the count small. Add only if there's a clear, distinct responsibility.

### Can I modify the skills?

Yes. The skills are guides; adapt them to your project's needs.

### What if I don't like this structure?

The structure is a recommendation. You can:
- Ignore parts you don't find useful
- Modify instructions to match your preferences
- Add or remove agents/skills
- Create your own workflows

### Is there a specific model I should use?

No. The system is model-agnostic. Use whatever GitHub Copilot provides.

---

## See Also

- `.github/copilot-instructions.md` — Global engineering standards
- `docs/mcp.md` — External tools and services
- `.github/skills/` — Specialized knowledge
- `.github/agents/` — Specialized roles
- `.github/prompts/` — User workflows
- `.github/instructions/` — Path-specific patterns
- `docs/architecture.md` — System design
- `docs/security.md` — Security practices
- `docs/database.md` — Database design

---

**Last updated:** October 2026

This guide is designed for GitHub Copilot with any underlying model. It emphasizes evidence-based decision making, tool use, and adherence to established engineering practices.
