# .agent Directory

This directory contains AI agent configuration, workflows, skills, and rules tailored specifically for the **TruyenVietHay** project.

## Purpose

The `.agent/` directory provides:
- **Specialized agents** for different development roles
- **Reusable workflows** for common development tasks
- **Skills** for complex operations
- **Project rules** to enforce best practices and security

## Structure

```
.agent/
├── ARCHITECTURE.md       # System architecture overview
├── README.md            # This file
│
├── agents/              # Specialized AI agents
│   ├── backend-developer.md
│   ├── frontend-developer.md
│   ├── database-admin.md
│   └── code-reviewer.md
│
├── workflows/           # Step-by-step guides for common tasks
│   ├── dev.md
│   ├── add-api-endpoint.md
│   ├── add-frontend-page.md
│   └── database-migration.md
│
├── skills/              # Complex operation guides
│   ├── debug-api-request/
│   │   └── SKILL.md
│   └── implement-gamification/
│       └── SKILL.md
│
└── rules/               # Project constraints and standards
    ├── security.md
    ├── code-quality.md
    └── database.md
```

## Quick Start

### For AI Assistants

1. **Read ARCHITECTURE.md first** to understand the project structure
2. **Select appropriate agent** based on the task:
   - Backend work → `agents/backend-developer.md`
   - Frontend work → `agents/frontend-developer.md`
   - Database changes → `agents/database-admin.md`
   - Code review → `agents/code-reviewer.md`
3. **Follow relevant workflows** for structured tasks
4. **Use skills** for complex operations
5. **Enforce rules** from the `rules/` directory

### For Developers

Browse workflows and skills for guidance on:
- Setting up development environment
- Adding new features
- Debugging issues
- Database migrations

## Agents

### Backend Developer
**File**: `agents/backend-developer.md`

Specializes in:
- Express.js API development
- MySQL database operations
- Business logic implementation
- Security and authentication

### Frontend Developer
**File**: `agents/frontend-developer.md`

Specializes in:
- Vue 3 component development
- TypeScript implementation
- Pinia state management
- UI/UX with TailwindCSS

### Database Administrator
**File**: `agents/database-admin.md`

Specializes in:
- MySQL schema design
- Query optimization
- Migrations
- Data integrity

### Code Reviewer
**File**: `agents/code-reviewer.md`

Ensures:
- Code quality standards
- Security best practices
- Performance optimization
- Consistent coding style

## Workflows

### /dev
**File**: `workflows/dev.md`

Start both backend and frontend development servers.

```bash
# Usage: Just type /dev
```

### /add-api-endpoint
**File**: `workflows/add-api-endpoint.md`

Complete guide for adding new API endpoints following the layered architecture (routes → controllers → services → models).

### /add-frontend-page
**File**: `workflows/add-frontend-page.md`

Step-by-step guide for creating new Vue.js pages with routing, state management, and API integration.

### /database-migration
**File**: `workflows/database-migration.md`

Safe database migration process with backup and rollback procedures.

## Skills

### Debug API Request
**File**: `skills/debug-api-request/SKILL.md`

Systematic debugging approach for:
- Frontend-backend communication issues
- API errors and unexpected responses
- Authentication/authorization problems
- Database query failures

### Implement Gamification
**File**: `skills/implement-gamification/SKILL.md`

Patterns for implementing:
- Point awarding system
- Level and XP progression
- Task completion tracking
- Reward redemption

## Rules

### Security
**File**: `rules/security.md`

Enforces:
- SQL injection prevention (parameterized queries)
- Authentication/authorization requirements
- Input validation
- File upload security
- Password hashing
- Environment variable usage

### Code Quality
**File**: `rules/code-quality.md`

Standards for:
- File and function naming conventions
- Code organization (layered architecture)
- Response format consistency
- Error handling patterns
- TypeScript usage (frontend)
- Documentation requirements

### Database
**File**: `rules/database.md`

Guidelines for:
- Table and column naming (Vietnamese conventions)
- Index strategy
- Query optimization
- Transaction usage
- Migration process
- Data integrity constraints

## Key Project Patterns

### Backend API Response
```javascript
// Success
{
  success: true,
  data: {...},
  message: "Success message"
}

// Error
{
  success: false,
  error: "Error description",
  message: "User-friendly message"
}
```

### Frontend Service Pattern
```typescript
// In *.service.ts
import axios from 'axios';

export default {
  async fetchData() {
    const response = await axios.get('/api/endpoint');
    return response.data.data;
  }
};
```

### Database Query Pattern
```javascript
// Models use parameterized queries
const [rows] = await db.query(
  'SELECT * FROM table WHERE column = ?',
  [param]
);
```

## Important Naming Conventions

### Vietnamese Database Columns
This project uses Vietnamese naming for certain database columns:

- `ngay_tao` = creation date
- `ngay_cap_nhat` = update date
- `trang_thai_kiem_duyet` = approval status
  - Values: `cho_duyet` (pending), `da_duyet` (approved), `tu_choi` (rejected)

**Always follow existing naming patterns when adding new columns.**

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm start           # Production mode
npm run dev         # Development mode with nodemon
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
```

## Environment Configuration

### Backend `.env`
```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=truyenviethay
JWT_SECRET=your-strong-secret-key
PORT=3000
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js, MySQL |
| **Frontend** | Vue 3, TypeScript, Vite, TailwindCSS |
| **State** | Pinia |
| **Auth** | JWT |
| **Validation** | Joi, Express Validator |
| **File Upload** | Multer, Mammoth, PDF-Parse |
| **Logging** | Winston, Morgan |

## Contributing

When adding new agents, workflows, skills, or rules:

1. **Follow existing format** - Use YAML frontmatter where applicable
2. **Be specific** - Tailor content to this project, not generic advice
3. **Include examples** - Show code patterns from this codebase
4. **Keep it practical** - Focus on real development scenarios
5. **Update this README** - Add new additions to the appropriate section

## Maintenance

### When to Update

- **Agents**: When role responsibilities change
- **Workflows**: When development processes evolve
- **Skills**: When new complex features are added
- **Rules**: When coding standards are updated
- **ARCHITECTURE.md**: When tech stack or architecture changes

### Regular Reviews

Review and update `.agent/` contents:
- After major refactoring
- When onboarding new team members
- When adopting new technologies
- Quarterly for general maintenance

## Getting Help

If you're an AI assistant:
1. Read `ARCHITECTURE.md` for project context
2. Consult relevant agent documentation
3. Follow workflows for structured tasks
4. Enforce rules from `rules/` directory
5. Use skills for complex operations

If you're a developer:
- Browse workflows for task guidance
- Check skills for complex feature implementation
- Review rules for coding standards
- Refer to ARCHITECTURE.md for system overview

---

**Last Updated**: 2026-01-20  
**Project**: TruyenVietHay - Vietnamese Online Story Platform  
**Purpose**: Structured AI assistance and development guidelines
