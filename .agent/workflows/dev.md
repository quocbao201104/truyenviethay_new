---
description: Start both backend and frontend development servers
---

# Start Development Environment

This workflow starts both the backend API server and the frontend Vite dev server for local development.

## Steps

### 1. Start Backend Server

Navigate to the backend directory and start the server:

```bash
cd backend
npm run dev
```

**Expected Output**: 
- Server running on `http://localhost:3000`
- Database connection successful
- API ready to accept requests

**Note**: If you see `EADDRINUSE` error, port 3000 is already in use. Kill the existing process:
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
- Linux/Mac: `lsof -ti:3000 | xargs kill`

### 2. Start Frontend Server

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

**Expected Output**:
- Vite dev server running on `http://localhost:5173`
- Hot module replacement enabled
- Open browser automatically or manually navigate to the URL

## Prerequisites

- Node.js installed (v18+ recommended)
- MySQL database running and configured
- `.env` files configured in both `backend/` and `frontend/`
- Dependencies installed (`npm install` in both directories)

## Troubleshooting

### Backend won't start
- Check `.env` database credentials
- Ensure MySQL is running
- Verify port 3000 is available

### Frontend won't start
- Check if backend URL is configured in `frontend/.env`
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors

### API calls failing
- Verify backend is running
- Check CORS configuration
- Inspect browser network tab for errors
