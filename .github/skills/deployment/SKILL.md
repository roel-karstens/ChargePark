# Deployment Skill

**Use this skill when:**
- Building the application for deployment
- Creating a preview deployment
- Debugging deployment issues
- Verifying production readiness
- Inspecting deployment logs
- Configuring environment variables
- Testing post-deployment

## Workflow

### 1. Prepare for deployment

**Validate locally:**
- Frontend builds without errors
- Backend tests pass
- TypeScript type checking passes
- Linting passes
- No secrets in code

### 2. Build the application

**Frontend build:**
```bash
cd frontend
npm run build
# Should complete without errors
# Outputs to frontend/dist/
```

**Backend:**
```bash
cd backend
# Verify dependencies are specified in pyproject.toml
# No hardcoded secrets in code
```

**Backend testing:**
```bash
cd backend
pytest
# All tests must pass
```

### 3. Review environment configuration

**Frontend (.env.local or deployed):**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_API_URL` — Backend API URL (not localhost)

**Backend (.env or deployed):**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role (production: keep secret)
- `DATABASE_URL` — Optional PostgreSQL connection (Supabase uses this)
- `ENVIRONMENT` — development or production

**Verify:**
- [ ] All required variables present
- [ ] No localhost URLs in production
- [ ] Supabase credentials correct
- [ ] CORS origins correct
- [ ] API URL points to deployed backend

### 4. Create preview deployment (if using Vercel)

**Using Vercel MCP (if available):**
- Connect repository to Vercel
- Deploy frontend as preview
- Deploy backend as preview API
- Verify preview environment variables

**Manual preview:**
- Push branch to GitHub
- Vercel automatically creates preview
- Get preview URL
- Test in preview environment

### 5. Verify preview deployment

**Frontend:**
- [ ] Application loads
- [ ] No console errors
- [ ] CSS and assets load
- [ ] Images display correctly

**API connectivity:**
- [ ] Frontend can reach backend
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Data loads correctly

**Basic functionality:**
- [ ] Sign up/login works
- [ ] Can create resources
- [ ] Can read resources
- [ ] Can update resources
- [ ] Can delete resources
- [ ] Loading states appear
- [ ] Error states appear

### 6. Inspect deployment

If Vercel MCP available, inspect:
- Build logs
- Deployment status
- Environment variables (without exposing values)
- Build output
- Errors and warnings

### 7. Smoke tests

**Run quick functional tests:**
```bash
# Test backend is running
curl https://api.example.com/health

# Test API endpoint (use test token)
curl -H "Authorization: Bearer <test-token>" \
  https://api.example.com/api/v1/projects
```

**Test frontend features:**
- [ ] Signup creates account
- [ ] Login succeeds
- [ ] Dashboard loads
- [ ] Can create project
- [ ] Can view projects
- [ ] Can update project
- [ ] Can delete project
- [ ] Logout works

### 8. Production deployment

**Never automatic** — requires explicit human approval:

1. Review deployment checklist
2. Verify preview works correctly
3. Confirm all tests pass
4. Review environment variables (don't print secrets)
5. Verify rollback plan exists
6. **Get explicit approval** before production deploy
7. Deploy to production
8. Monitor for errors

**Post-deployment:**
- [ ] Health endpoint responds
- [ ] Basic functionality works
- [ ] No errors in logs
- [ ] Response times acceptable
- [ ] Database queries working
- [ ] Authentication working

## Vercel MCP Integration

If Vercel MCP is available, use it to:
- List projects and deployments
- Get deployment status
- View build logs
- Inspect environment variables (read-only, no secrets)
- Create preview deployments

**Prefer:**
- Read-only access to production
- Write access to preview deployments only
- No automatic production deployments

**Never:**
- Execute destructive operations without approval
- Expose API keys or secrets
- Deploy to production automatically

## Environment Variables

**Supabase credentials (from project settings):**
- `SUPABASE_URL` — Found in API settings
- `SUPABASE_ANON_KEY` — Public key (safe in frontend)
- `SUPABASE_SERVICE_ROLE_KEY` — Secret (backend/server only)

**Vercel configuration:**
- Set environment variables in Vercel dashboard
- Preview environment separate from production
- Secret values never shown in logs

**Best practice:**
- Store secrets in Vercel dashboard
- Never commit `.env` to git
- Use `.env.example` to document structure
- Verify secrets are set before deploying

## Common Deployment Issues

### Build fails
- [ ] Check build logs
- [ ] Verify all dependencies installed
- [ ] Verify TypeScript types correct
- [ ] Verify no hardcoded paths
- [ ] Verify environment variables set

### API connectivity fails
- [ ] Check backend is deployed
- [ ] Check backend URL correct
- [ ] Check CORS configured
- [ ] Check firewall/network
- [ ] Check authentication

### Authentication fails
- [ ] Check Supabase credentials
- [ ] Check token format
- [ ] Check RLS policies
- [ ] Check environment variables

### Database errors
- [ ] Check migrations ran
- [ ] Check RLS policies
- [ ] Check connection URL
- [ ] Check user permissions

## Deployment Checklist

**Before deployment:**
- [ ] Frontend builds without errors
- [ ] Backend tests all pass
- [ ] TypeScript strict mode passes
- [ ] Linting passes
- [ ] No secrets in code
- [ ] No hardcoded localhost URLs
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] RLS policies verified
- [ ] Preview deployment tested

**After deployment:**
- [ ] Health check passes
- [ ] Authentication works
- [ ] Can perform CRUD operations
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Logs show no errors

## See Also

- `docs/development.md` — Local setup
- `.github/instructions/backend.instructions.md` — Backend patterns
- `.github/instructions/frontend.instructions.md` — Frontend patterns
- `.github/skills/frontend-debugging/SKILL.md` — If deployment test fails
