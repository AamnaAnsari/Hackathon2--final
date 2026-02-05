# Todo App - Hackathon II
## Project Overview
This is a monorepo using GitHub Spec-Kit for spec-driven development.
## Spec-Kit Structure
- /specs/overview.md - Project overview
- /specs/features/ - Feature specs
- /specs/api/ - API endpoint and MCP tool specs
- /specs/database/ - Schema and model specs
- /specs/ui/ - Component and page specs
## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: @specs/features/task-crud.md
3. Update specs if requirements change
## Commands
- Frontend: cd frontend && npm run dev
- Backend: cd backend && uvicorn main:app --reload
