# TruyenVietHay - Online Story Reading Platform

TruyenVietHay is a full-featured web application for reading, writing, and managing stories. It provides a platform for authors to publish their work and for readers to engage with content through a rich set of features including gamification (points, levels, rewards), social interactions (comments, likes, ratings), and a personalized reading experience.

## Project Overview

The system is designed to handle a complete ecosystem for online literature:
- **Readers**: Can search, read, follow stories, rate, comment, and earn points/rewards through reading activities.
- **Authors**: Can upload and manage their stories and chapters.
- **Admins**: Have tools to manage users, stories (approval workflow), and system settings.

## Tech Stack

### Backend
- **Language**: JavaScript (ES6+)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using `mysql2` driver)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi, Express Validator
- **Security**: Helmet, XSS-Clean, Rate Limit, CORS
- **File Handling**: Multer (Uploads), Mammoth (.docx support), PDF-Parse (.pdf support)
- **Logging**: Winston, Morgan
- **Scheduling**: Node-cron

### Frontend
- **Framework**: Vue.js 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: TailwindCSS, FontAwesome
- **HTTP Client**: Axios
- **Rich Text Editor**: TinyMCE
- **PWA Support**: Vite PWA Plugin

## System Architecture

The backend follows a **Layered Architecture** (MVC-based):

1.  **Routes Layer** (`/routes`): Defines API endpoints and maps them to controllers.
2.  **Controller Layer** (`/controllers`): Handles incoming HTTP requests, validates input, and orchestrates logic.
3.  **Service Layer** (`/services`): Encapsulates complex business logic (e.g., approval workflows), keeping controllers clean.
4.  **Model Layer** (`/models`): Interacts directly with the MySQL database using raw SQL queries for flexibility and performance.
5.  **Middleware**: Handles cross-cutting concerns like Authentication (`auth.js`), Error Handling, and Logging.

## Main Features

### 1. Authentication & Authorization
- **Role-Based Access Control (RBAC)**: Supports roles such as `user`, `author`, and `admin`.
- **JWT Authentication**: Secure stateless authentication strategy.
- **Profile Management**: Update profile, avatar, and password.

### 2. Core Story Management
- **CRUD Operations**: Create, Read, Update, Delete for Stories and Chapters.
- **Approval Workflow**: Stories submitted by authors go through an admin approval process (`trang_thai_kiem_duyet`).
- **File Support**: Ability to parse content from uploaded `.docx` and `.pdf` files.
- **Categorization**: Stories are organized by categories and tags.

### 3. Gamification & Engagement
- **Point System**: Users earn points for activities.
- **Leveling System**: Users gain XP and level up based on their history and contribution.
- **Rewards**: Redeem points for rewards.
- **Task System**: Daily or achievement-based tasks (`UserTask`).

### 4. Social Interactions
- **Comments**: Readers can discuss stories.
- **Ratings & Reviews**: 5-star rating system.
- **Likes & Follows**: Users can functionality to "like" chapters and "follow" stories to get updates.

### 5. Reading History
- Automatically tracks reading progress (last read chapter) for users.

## API Overview

The API is prefixed with `/api`. Major endpoints include:

- **Auth**: `/api/auth` (Login, Register, Refresh Token)
- **Users**: `/api/user` (Profile), `/api/admin/users` (Management)
- **Stories**: `/api/truyen` (Public & Admin operations), `/api/upload-truyen`
- **Chapters**: `/api/chuong`
- **Categories**: `/api/theloai`
- **Interactions**:
    - `/api/comments`
    - `/api/follow`
    - `/api/like`
    - `/api/ratings`
- **Gamification**:
    - `/api/levels`, `/api/levels/history`
    - `/api/points`
    - `/api/tasks`
    - `/api/rewards`, `/api/user-rewards`
- **Files**: `/api/upload-files` 

## Database Overview

The system uses a **MySQL** database with the following key tables:

- `users_new`: Stores user accounts, roles, and status.
- `stories`: Main story metadata (title, author, status, approval state).
- `chapters`: Content of the stories.
- `categories`: Genre/Category definitions.
- `comments`, `ratings`, `likes`: Social interaction data.
- `follows`: User subscriptions to stories.
- `reading_history`: Tracks what users have read.
- `user_points`, `user_levels`, `user_tasks`: Gamification data.

## Setup & Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server
- npm or yarn

### 1. Database Setup
Create a MySQL database and import the initial schema (if provided in `backend/database` or `backend/sql` - *check project files*). 
Update the connection details in the `.env` file.

### 2. Backend Setup
```bash
cd backend
# Install dependencies
npm install

# Configure Environment Variables
# Copy .env.example to .env and fill in:
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# JWT_SECRET, PORT

# Run Server
npm start
# OR for development
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run Development Server
npm run dev
```

Access the frontend at `http://localhost:5173` and backend at `http://localhost:3000`.

## Folder Structure

```
truyenviethay_new/
├── backend/                # API Server
│   ├── config/             # DB configurations
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth, Upload, Validation
│   ├── models/             # Database queries (SQL)
│   ├── routes/             # API Route definitions
│   ├── services/           # Business logic
│   └── public/             # Static files (uploads)
│
└── frontend/               # Vue.js Client
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application views/pages
    │   ├── stores/         # Pinia state management
    │   └── router/         # Vue Router setup
    └── vite.config.ts      # Vite configuration
```

## Notes
- The project uses a **Hybrid** structure where some complex logic resides in `services`, while simpler CRUD operations may reside directly in `controllers`.
- Authentication relies on **JWT** stored in headers.
- Ensure the `public/uploads*` directories exist and have write permissions for file uploads to work correctly.
