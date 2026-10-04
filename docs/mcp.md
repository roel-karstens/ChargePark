# MCP (Model Context Protocol) Integration

This repository supports MCP integrations to extend Copilot's capabilities with external tools and services.

## What is MCP?

MCP allows Copilot to interact with external systems:
- Inspect and modify data in external services
- Execute queries and commands
- Access specialized tools
- Integrate with development infrastructure

Think: **"What external tools can the AI use?"**

## MCP Integrations

### Supabase MCP

**Purpose:** Query and manage Supabase PostgreSQL database.

**Capabilities:**
- Inspect database schema (tables, columns, constraints)
- List tables and indexes
- Review RLS policies
- Test queries
- Inspect migrations

**When to use:**
- Inspecting current schema
- Understanding relationships
- Reviewing RLS policies
- Investigating database errors
- Verifying migrations applied

**Permissions:**
- Prefer read-only for production
- Write access for development
- Never execute destructive SQL without approval

**Setup:**
1. Get Supabase credentials from project settings
2. Configure MCP server with connection details
3. Test connection: Can inspect schema?

**Security:**
- Service role key (secret) — backend/server only
- Anon key (public) — frontend-safe
- Store credentials in environment variables
- Never commit credentials to git

**Read-only mode (production inspection):**
```
database_url = postgresql://user:pass@host/db
read_only = true
```

**Write mode (development):**
```
database_url = postgresql://user:pass@host/db
read_only = false
```

**Do not:**
- Execute destructive SQL automatically
- Assume production is safe to modify
- Make schema changes without approval

---

### Vercel MCP

**Purpose:** Manage deployments and inspect deployment status.

**Capabilities:**
- List projects and deployments
- Get deployment status and logs
- View build output
- Inspect environment configuration
- Create preview deployments
- Manage environment variables

**When to use:**
- Creating preview deployments
- Debugging deployment failures
- Checking deployment status
- Inspecting build logs
- Managing environment variables
- Smoke testing deployed version

**Permissions:**
- Prefer read-only for production
- Write access to preview/staging only
- Never auto-deploy to production

**Setup:**
1. Generate Vercel API token from account settings
2. Configure MCP with token
3. Test access: Can list projects?

**Security:**
- API token is sensitive — store in environment
- Never commit tokens to git
- Rotate tokens regularly
- Limit to staging/preview access in production

**Do not:**
- Auto-deploy to production
- Expose API token in logs
- Modify production environment without approval

---

### Browser / Chrome DevTools MCP

**Purpose:** Inspect and debug running frontend application.

**Capabilities:**
- Open browser to running application
- Inspect console (errors, logs)
- Inspect network tab (requests, responses, status codes)
- Inspect DOM elements
- Take screenshots
- Check authentication state
- Verify API calls

**When to use:**
- Reproducing bugs
- Debugging frontend issues
- Verifying API integration
- Testing error states
- Verifying authentication
- Checking browser console

**Workflow:**
1. Start development server (npm run dev)
2. Open browser to http://localhost:5173
3. Reproduce issue
4. Inspect console, network, DOM
5. Identify root cause
6. Implement fix
7. Verify with browser tools

**Do not:**
- Guess based on source code when runtime evidence available
- Assume requests are working without network inspection
- Assume components render without visual verification

**Security:**
- Browser access is development-only
- Don't weaken application security for debugging
- Treat browser inspection as development tool
- Production debugging different from local debugging

---

### GitHub MCP (Optional)

**Purpose:** Interact with GitHub repositories, issues, pull requests.

**Capabilities:**
- Read issues and PRs
- Create issues
- Comment on issues
- Get branch information
- Read file content

**When to use:**
- Creating or updating issues
- Adding comments to PRs
- Retrieving requirement details
- Understanding issue context

**Permissions:**
- Prefer read-only for public information
- Write to issues/comments if needed
- Never auto-merge PRs
- Never auto-delete branches

**Setup:**
1. Generate GitHub personal access token
2. Configure MCP with token
3. Test access: Can read issues?

**Security:**
- Token is sensitive — store in environment
- Never commit tokens to git
- Limit permissions to minimum needed
- Use fine-grained tokens when available

**Do not:**
- Auto-merge PRs without review
- Auto-delete branches
- Modify repository settings
- Manage team access

---

## Integration Priority

**Tier 1 (Most Useful):**
- Browser/DevTools MCP — Runtime debugging
- Supabase MCP — Schema inspection
- Deployment MCP (Vercel) — Deployment status

**Tier 2 (Helpful):**
- GitHub MCP — Issue context

**Tier 3 (Future):**
- Other development services

---

## Local Setup Checklist

Before using MCP integrations:

**Browser/DevTools:**
- [ ] Is development server running?
- [ ] Can browser open http://localhost:5173?
- [ ] Can DevTools inspect console/network?

**Supabase:**
- [ ] Do you have Supabase credentials?
- [ ] Is SUPABASE_URL set?
- [ ] Is DATABASE_URL set (optional)?
- [ ] Can you connect to database?

**Vercel:**
- [ ] Do you have Vercel API token?
- [ ] Is token stored in environment?
- [ ] Can you list projects?

**GitHub:**
- [ ] Do you have GitHub token (if needed)?
- [ ] Is token stored securely?
- [ ] Can you read issues?

---

## MCP Configuration

Store MCP configurations in environment variables or `.env` (not committed):

```bash
# .env (NOT committed)

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:pass@host:5432/db

# Vercel
VERCEL_API_TOKEN=your-token

# GitHub (if using)
GITHUB_TOKEN=your-token

# Browser/DevTools (local)
DEV_SERVER_URL=http://localhost:5173
```

Do NOT commit `.env` to git. Use `.env.example` to document what's needed.

---

## Recommended Workflows

### Frontend Debugging Workflow
1. Start dev server: `npm run dev`
2. Browser MCP: Open http://localhost:5173
3. Reproduce issue in browser
4. Browser MCP: Inspect console and network
5. Identify root cause
6. Implement fix in code
7. Browser MCP: Verify fix

### Database Migration Workflow
1. Architect designs schema
2. Database agent creates migration SQL
3. Supabase MCP: Inspect current schema (read-only)
4. Apply migration to development
5. Supabase MCP: Verify schema change
6. Test in backend
7. Commit migration
8. Deploy to production (separate step)

### Deployment Workflow
1. Local build: `npm run build` (frontend), tests pass (backend)
2. Vercel MCP: Create preview deployment
3. Browser MCP: Test in preview
4. Verify API integration works
5. Vercel MCP: Check logs, status
6. Human: Approve production deployment
7. Manual: Deploy to production (not automated)

---

## Safety Principles

### Destructive Operations

For destructive operations (DROP TABLE, DELETE data, etc.):

1. **Require explicit approval**
   - Explain what will happen
   - Show affected data count
   - Get human confirmation

2. **Verify before execution**
   - Confirm command one more time
   - Check backup exists
   - Understand rollback plan

3. **Document the change**
   - Record what was deleted
   - Document when and why
   - Keep audit trail

### Production vs Development

**Production:**
- Prefer read-only access
- No destructive operations without approval
- No automatic deployments
- Use separate credentials
- Extra verification steps

**Development:**
- More permissive access
- Faster iteration
- Easier testing
- Same security patterns

### Permissions Philosophy

**Principle:** Least privilege

- Only request permissions needed
- Use read-only by default
- Upgrade to write only when necessary
- Review permissions regularly
- Revoke unused credentials

---

## Limitations

MCP integrations have limitations:

1. **Service availability** — External service might be down
2. **Rate limits** — May hit API rate limits
3. **Permission constraints** — Can only do what permissions allow
4. **Network issues** — Connection problems
5. **Credential expiration** — Tokens expire

Handle these gracefully:
- Provide clear error messages
- Fall back to alternative approaches
- Retry with exponential backoff
- Document workarounds

---

## Model Independence

MCP integrations are **model-agnostic**.

They work with:
- Claude
- OpenAI
- Gemini
- Any GitHub Copilot model

Do not assume a specific underlying model.

---

## Next Steps

1. **Set up MCP servers** (optional but recommended)
2. **Configure credentials** in environment
3. **Test connections** before relying on them
4. **Use skills** that reference MCP capabilities
5. **Invoke agents** that leverage MCP tools

---

## See Also

- `docs/ai-development.md` — How MCP, Skills, Agents work together
- `.github/skills/` — Skills that use MCP
- `.github/agents/` — Agents that use MCP
- `.github/copilot-instructions.md` — Repository principles
