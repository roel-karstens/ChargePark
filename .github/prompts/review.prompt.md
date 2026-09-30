# Code Review

Use this prompt to perform a senior engineering review of code changes.

## Instructions

Review the provided code changes for correctness, architecture, security, and maintainability.

### Review Criteria

**Correctness**
- Does the code work as intended?
- Are edge cases handled?
- Is error handling appropriate?
- Are there logic errors?

**Architecture**
- Does it follow established patterns?
- Is responsibility properly separated?
- Are dependencies minimal?
- Is the API contract clear?
- Are types correct?

**Security**
- Is authentication properly validated?
- Is authorization properly checked?
- Are secrets exposed?
- Is input properly validated?
- Is sensitive data logged?
- Is RLS correctly configured?

**Maintainability**
- Is code easy to understand?
- Are names clear and descriptive?
- Is duplication avoided?
- Are tests meaningful?
- Is documentation updated?

**Testing**
- Are tests meaningful (not brittle)?
- Is coverage appropriate?
- Are happy paths and error paths tested?
- Is auth/authz tested?

**Quality**
- Is there unnecessary complexity?
- Are there unnecessary dependencies?
- Is there dead code?
- Are there unrelated changes?

### Output

Provide:
1. Summary of changes
2. Any issues found (security, correctness, architecture)
3. Recommendations for improvement
4. Approval or request for changes

### Important

- Do NOT modify code unless explicitly asked
- Focus on correctness and security
- Be specific about issues and recommendations
