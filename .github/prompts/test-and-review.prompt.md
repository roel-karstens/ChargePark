# Test and Review

Use this prompt to run all validation and then review changes.

## Instructions

Run full validation suite and then review the changes.

### Validation Steps

**Backend**
```bash
cd backend
ruff check .
ruff format --check .
pyright
pytest -v
```

**Frontend**
```bash
cd frontend
npm run lint
npm run type-check
npm run test
npm run build
```

### Report Results

For each validation step, report:
- ✅ PASSED or ❌ FAILED
- Count of issues (if any)
- Sample failures (if any)

**Do NOT claim success if any validation failed.**

If validation fails:
1. Report the exact error
2. Do not fix automatically (ask first)
3. Provide clear error output

### Code Review

After validation passes:

1. **Review git diff**
   - What changed?
   - Is change minimal and focused?
   - Are there unrelated changes?

2. **Security check**
   - Are secrets exposed?
   - Is auth/authz correct?
   - Is input validated?
   - Is RLS correct?

3. **Architecture check**
   - Are patterns followed?
   - Is responsibility separated?
   - Are types correct?
   - Is code quality maintained?

4. **Testing check**
   - Are tests meaningful?
   - Do tests cover the feature?
   - Are auth/authz tested?

### Final Summary

Report:
1. Validation results (all steps, all passed/failed)
2. Any issues found in code review
3. Approval status
4. Any remaining concerns or follow-up work

### Remember

- ALWAYS run validation
- NEVER claim tests passed unless executed
- NEVER approve if validation failed
- Report exact validation output
