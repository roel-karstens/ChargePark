# Security Review

Use this prompt to perform a security audit of code changes.

## Instructions

Review the provided changes for security issues and vulnerabilities.

### Security Checklist

**Authentication**
- Are JWTs properly validated?
- Is authentication required on protected endpoints?
- Are expired tokens rejected?
- Is the token payload verified?

**Authorization**
- Are resources checked for ownership?
- Is user ID from token used (not from request)?
- Are permission checks before returning data?
- Is RLS correctly configured?

**Input Validation**
- Are all inputs validated?
- Is validation on the server-side?
- Are constraints enforced?
- Is SQL injection possible?

**Secrets Management**
- Are environment variables used for secrets?
- Are secrets in `.env`?
- Are secrets ever logged?
- Are secrets in comments?
- Are service-role keys exposed?

**Data Protection**
- Is sensitive data (passwords, tokens) logged?
- Is RLS enforcing row-level access?
- Are soft deletes or cascades handled correctly?
- Is user data properly isolated?

**API Security**
- Are HTTP methods correct?
- Are status codes appropriate?
- Are error messages generic (no internal details)?
- Is rate limiting considered?
- Is CORS configured?

**Database**
- Is RLS enabled on sensitive tables?
- Are RLS policies correct and tested?
- Are foreign key constraints in place?
- Are indexes on sensitive columns?

**External Integrations**
- Are external APIs called securely?
- Are API keys protected?
- Are requests/responses validated?
- Are timeouts set?

### Output

Provide:
1. Security issues found (critical, high, medium, low)
2. Specific recommendations for each issue
3. Code examples for fixes if applicable
4. Overall security assessment

### Critical Issues

If found, escalate immediately:
- Private keys exposed
- Authentication bypassed
- Authorization bypassed
- SQL injection possible
- Secrets in logs
- Sensitive data leaked
