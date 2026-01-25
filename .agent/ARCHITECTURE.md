# TruyenVietHay - System Architecture

## Project Summary

TruyenVietHay is a full-stack online story reading platform built for Vietnamese users. It enables authors to publish stories, readers to engage with content, and admins to manage the system through an approval workflow and gamification features.

## Tech Stack

### Backend (Node.js/Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MySQL (using `mysql2`)
- **Security**: JWT authentication, Helmet, XSS-Clean, Rate Limiting, CORS
- **File Processing**: Multer (uploads), Mammoth (.docx), PDF-Parse (.pdf)
- **Logging**: Winston, Morgan
- **Validation**: Joi, Express Validator
- **Scheduling**: Node-cron for background tasks

### Frontend (Vue 3/TypeScript)
- **Framework**: Vue.js 3 with TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia stores
- **Routing**: Vue Router
- **Styling**: TailwindCSS, FontAwesome icons
- **HTTP Client**: Axios
- **Rich Editor**: TinyMCE
- **PWA**: Vite PWA Plugin

## Architecture Patterns

### Backend: Layered Architecture (MVC)

```
┌─────────────────────────────────────────┐
│           Routes Layer                  │ (/routes)
│  API Endpoint Definitions               │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│        Controller Layer                 │ (/controllers)
│  Request Handling, Input Validation     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│         Service Layer                   │ (/services)
│  Business Logic, Approval Workflows     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│          Model Layer                    │ (/models)
│  Direct MySQL Database Access (Raw SQL) │
└─────────────────────────────────────────┘
```

**Cross-Cutting Concerns**: Middleware (`/middleware`) handles authentication, validation, file uploads, and error handling.

### Frontend: Module-Based Vue Architecture

```
/src
├── modules/          # Feature modules (story, chapter, user, etc.)
│   ├── <feature>/
│   │   ├── *.vue         # Feature components
│   │   ├── *.service.ts  # API calls
│   │   └── *.store.ts    # Pinia state management
│
├── components/       # Shared/reusable components
├── views/            # Top-level page views
├── layouts/          # Layout wrappers
├── router/           # Vue Router configuration
└── store/            # Global Pinia stores
```

## Core Business Domains

### 1. **Authentication & Authorization**
- **Role-based access**: `user`, `author`, `admin`
- JWT-based stateless authentication
- Profile and password management

### 2. **Story & Chapter Management**
- CRUD operations for stories and chapters
- **Approval workflow**: Stories require admin approval (`trang_thai_kiem_duyet`)
- File upload support (.docx, .pdf parsing)
- Categorization via categories and tags
- Slug-based URLs for SEO

### 3. **Gamification System**
- **Points**: Earned through reading activities
- **Levels**: XP-based user progression
- **Rewards**: Point redemption system
- **Tasks**: Daily/achievement-based challenges

### 4. **Social Engagement**
- Comments and discussions
- 5-star rating system
- Likes on chapters
- Story follows for notifications

### 5. **Reading History**
- Auto-tracking of reading progress
- Last read chapter persistence
- Personalized recommendations

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `users_new` | User accounts, roles, authentication |
| `stories` | Story metadata, approval status |
| `chapters` | Story content |
| `categories` | Genre/category definitions |
| `comments`, `ratings`, `likes` | Social interactions |
| `follows` | User story subscriptions |
| `reading_history` | Progress tracking |
| `user_points`, `user_levels`, `user_tasks` | Gamification data |

## API Structure

Base URL: `/api`

**Core Endpoints**:
- `/api/auth` - Authentication (login, register, refresh)
- `/api/user` - User profile management
- `/api/truyen` - Story operations
- `/api/chuong` - Chapter operations
- `/api/theloai` - Categories
- `/api/comments`, `/api/ratings`, `/api/like`, `/api/follow` - Social features
- `/api/levels`, `/api/points`, `/api/tasks`, `/api/rewards` - Gamification
- `/api/upload-files`, `/api/upload-truyen` - File uploads
- `/api/admin/*` - Admin-only endpoints

## Development Workflow

### Backend Development
1. Start with routes definition (`/routes`)
2. Create controller logic (`/controllers`)
3. Extract complex business logic to services (`/services`)
4. Implement database queries in models (`/models`)
5. Add validation via middleware/validators

### Frontend Development
1. Define route in `/router`
2. Create view component in `/views`
3. Build feature modules in `/modules/<feature>`
4. Add API service methods (`*.service.ts`)
5. Manage state with Pinia stores (`*.store.ts`)
6. Create reusable components in `/components`

## Security Considerations

- **Authentication**: JWT tokens (stored in headers, not localStorage for security)
- **Authorization**: Role-based access control at route level
- **Input Validation**: All inputs validated via Joi/Express Validator
- **XSS Protection**: XSS-Clean middleware
- **Rate Limiting**: Prevent API abuse
- **CORS**: Configured for specific origins
- **SQL Injection**: Using parameterized queries in models

## File Upload Strategy

- **Uploads Directory**: `backend/public/uploads*`
- **Permissions**: Must have write access
- **Supported Formats**: Images (avatars), .docx, .pdf (story content)
- **Processing**: Mammoth for .docx, PDF-Parse for .pdf

## Deployment Notes

### Environment Variables Required
**Backend (.env)**:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `PORT` (default: 3000)

**Frontend (.env)**:
- `VITE_API_BASE_URL` (backend URL)

### Build Process
- **Backend**: `npm start` (production) or `npm run dev` (development with nodemon)
- **Frontend**: `npm run dev` (development), `npm run build` (production)

### Production Checklist
- [ ] MySQL database created and schema imported
- [ ] Environment variables configured
- [ ] Upload directories created with write permissions
- [ ] CORS origins updated for production domain
- [ ] JWT_SECRET is strong and random
- [ ] Rate limits configured appropriately
- [ ] Logs directory is writable
- [ ] TinyMCE API key configured (if required)

## Common Patterns

### Backend API Response Format
```javascript
// Success
{ success: true, data: {...}, message: "..." }

// Error
{ success: false, error: "...", message: "..." }
```

### Frontend Service Pattern
```typescript
// In *.service.ts
import axios from 'axios';

export const someService = {
  async getData() {
    const response = await axios.get('/api/endpoint');
    return response.data;
  }
};
```

### Frontend Store Pattern
```typescript
// In *.store.ts
import { defineStore } from 'pinia';

export const useSomeStore = defineStore('some', {
  state: () => ({ ... }),
  actions: { ... }
});
```

## Testing Strategy

- **Backend**: Jest + Supertest for API testing
- **Frontend**: Component testing (framework to be added)
- **Manual**: Browser testing for UI/UX flows

## Known Technical Debt

- Typo in backend directory: `/ultils` should be `/utils`
- No test scripts configured in package.json
- Mixed use of services and controller-only logic
- No automated deployment pipeline configured
