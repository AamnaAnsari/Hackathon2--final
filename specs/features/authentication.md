# Feature: Authentication
## Stack
- Better Auth (Frontend)
- JWT Tokens (Shared Secret)
## Flow
1. User logs in on Frontend -> Gets JWT
2. Frontend sends JWT in Header "Authorization: Bearer <token>"
3. Backend verifies JWT secret and extracts User ID
