# Frontend Debugging Skill

**Use this skill when:**
- The application is not behaving as expected
- Users report UI issues or errors
- A feature is not working in the browser
- Network requests are failing
- Authentication or loading states are incorrect
- Investigating performance problems
- Reproducing bugs

## Workflow

### 1. Reproduce the issue

- Start the development server
- Follow the steps to reproduce
- Note what you see vs what's expected
- Understand the exact conditions

**Development server:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 2. Collect evidence

Use browser DevTools or Browser MCP to inspect:

**Console (browser.console)**
- [ ] Are there error messages?
- [ ] Are there warnings?
- [ ] What is the error type and stack trace?
- [ ] Are there JavaScript errors or TypeScript errors?

**Network (browser.network)**
- [ ] What API calls are being made?
- [ ] What are the HTTP status codes (200, 401, 403, 404, 500)?
- [ ] Are requests failing or timing out?
- [ ] What are the response payloads?
- [ ] Are Authorization headers present?

**Page inspection (browser.page)**
- [ ] Take screenshots to see the exact state
- [ ] Inspect element structure
- [ ] Check CSS classes and styles
- [ ] Verify component rendering

**Runtime behavior**
- [ ] Is the app loading?
- [ ] Are loading states showing?
- [ ] Are error states showing?
- [ ] Is authentication working?
- [ ] What is the user's auth state?

### 3. Identify likely causes

Common issues:

**Network/API**
- Backend not running or responding
- Wrong API URL in `.env.local`
- Missing authentication token
- API endpoint returning error status
- CORS issues

**Authentication**
- Token not being sent
- Token expired
- Supabase credentials missing
- Invalid token format

**State management**
- State not updating correctly
- Loading state stuck
- Error not being displayed
- Data not being displayed

**Frontend logic**
- Component not rendering
- Event handlers not firing
- Conditional rendering wrong
- Props not being passed

**Environment**
- Wrong environment variables
- Frontend/backend mismatch
- Development vs production configuration
- Supabase connection issue

### 4. Implement smallest fix

- Make the minimal change to fix the issue
- Don't refactor or optimize
- Focus on correctness

### 5. Test the fix

**Reproduce issue again:**
- [ ] Follow the same steps
- [ ] Verify the issue is gone
- [ ] Check console for errors
- [ ] Check network requests
- [ ] Verify loading/error states

**Regression testing:**
- [ ] Related features still work
- [ ] No new errors introduced
- [ ] Authentication still works
- [ ] Other API calls still work

### 6. Verify with browser tools

If Browser MCP is available, use it to:
- Take final screenshot confirming fix
- Verify console is clean
- Verify network requests are correct
- Verify no unhandled errors

## Browser MCP Integration

If a Browser/Chrome DevTools MCP is available, use it to:
- **Open the application** — Launch http://localhost:5173
- **Inspect console** — Get error messages and logs
- **Inspect network** — See all HTTP requests and responses
- **Take screenshots** — Capture the exact state
- **Inspect elements** — Check DOM structure
- **Check authentication** — Verify token and auth state
- **Check localStorage** — See stored data

### Don't just guess

When runtime evidence is available, **always use it**:

❌ **Bad:** "I think the API call might be failing"
✅ **Good:** "The network tab shows the API returned 401 Unauthorized"

❌ **Bad:** "The token might be missing"
✅ **Good:** "The Authorization header in the network request is empty"

❌ **Bad:** "Maybe the component isn't rendering"
✅ **Good:** "The component is rendering but the error state is displayed"

## Common Debugging Patterns

### API Request Failed

1. **Check network tab**
   - Is the request being made?
   - What is the URL and method?
   - What status code is returned?

2. **Check response**
   - What is the error message?
   - Is it 401 (auth), 403 (permission), 404 (not found), 500 (server)?

3. **Check headers**
   - Is Authorization header present?
   - Is it in correct format: `Bearer <token>`?
   - Is CORS enabled on backend?

4. **Check backend**
   - Is the backend running?
   - Does the endpoint exist?
   - Are dependencies correct?

### Authentication Not Working

1. **Check console**
   - Are there auth errors?
   - Is Supabase configured?

2. **Check browser storage**
   - Is token stored?
   - Is it in localStorage, sessionStorage, or cookies?

3. **Check Supabase**
   - Are credentials correct?
   - Is user signed in?

4. **Check authorization**
   - Is token being sent in requests?
   - Is backend validating it?

### Component Not Rendering

1. **Check console**
   - Are there React errors?
   - Are there TypeScript type errors?

2. **Inspect element**
   - Is the DOM element present?
   - Is it hidden by CSS?
   - Is it inside a conditional that's false?

3. **Check props and state**
   - Are props being passed correctly?
   - Is state being set?
   - Are dependencies correct?

### Loading State Stuck

1. **Check network**
   - Is the API request still pending?
   - Is it hanging indefinitely?

2. **Check backend**
   - Is the backend responding?
   - Is there an error in the backend?

3. **Check timeout**
   - Is there a timeout set?
   - Should there be?

## Tools and Commands

**View backend logs:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Watch for errors in the output
```

**Check backend health:**
```bash
curl http://localhost:8000/health
# Should return {"status": "ok"}
```

**Check API endpoint:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/projects
# Should return project list or auth error
```

## Checklist

When debugging frontend issues:

- [ ] Start both frontend and backend
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Verify authentication token is present
- [ ] Verify API responses
- [ ] Verify loading/error states
- [ ] Take screenshots
- [ ] Reproduce the issue consistently
- [ ] Make minimal fix
- [ ] Verify fix works
- [ ] Check for regressions

## See Also

- `docs/development.md` — Setup and running
- `docs/architecture.md` — Frontend-backend interaction
- `.github/instructions/frontend.instructions.md` — Frontend patterns
- `.github/skills/deployment/SKILL.md` — If issue is in deployed environment
