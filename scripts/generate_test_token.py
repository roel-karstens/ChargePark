#!/usr/bin/env python3
"""
Generate a test JWT token for API testing
"""
import jwt
from datetime import datetime, timedelta, timezone

# Use the same user_id from the test data we created
USER_ID = "5b4b4ba2-ad71-44c8-8e6a-fee9313eee5c"

# Create JWT token with a test key
payload = {
    "sub": USER_ID,
    "iat": datetime.now(timezone.utc),
    "exp": datetime.now(timezone.utc) + timedelta(hours=24),
}

# Create token with a dummy key (backend will decode without verifying signature)
token = jwt.encode(payload, key="test-secret-key", algorithm="HS256")

print("🔐 TEST JWT TOKEN")
print("=" * 70)
print(f"\nToken: {token}")
print("\n" + "=" * 70)
print("\nHow to use in API docs:")
print("1. Go to http://localhost:8000/docs")
print("2. Click the 🔒 lock icon (Authorize)")
print("3. Paste the token above in the 'value' field")
print("4. Click 'Authorize'")
print("5. Now you can test all endpoints!")
print("\nOr add to curl request:")
print(f'  curl -H "Authorization: Bearer {token}" \\')
print('    http://localhost:8000/api/v1/projects')
