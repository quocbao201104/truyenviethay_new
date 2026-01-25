---
name: Debug API Request
description: Systematic approach to debugging failed API requests
---

# Debug API Request Skill

This skill helps you systematically debug API request failures in the TruyenVietHay application.

## When to Use

- API endpoint returns errors
- Frontend can't communicate with backend
- Unexpected response format
- Authentication/authorization issues

## Debugging Steps

### 1. Identify the Problem Layer

Determine where the issue originates:

#### Frontend Issues
- Check browser console for errors
- Inspect Network tab (Status code, Request/Response)
- Verify service method is correctly importing axios
- Check if `VITE_API_BASE_URL` is set

#### Backend Issues
- Check backend terminal for errors
- Review Morgan HTTP logs
- Check Winston logs in `backend/logs/`
- Verify route is registered in `index.js`

#### Database Issues
- Check MySQL connection in `.env`
- Verify table/column names
- Look for SQL syntax errors in logs

### 2. Frontend Debugging

**Check the Service Call**:
```typescript
// In browser console or add temporary logging
console.log('Calling API:', endpoint);
console.log('Payload:', data);

try {
  const response = await service.method();
  console.log('Response:', response);
} catch (error) {
  console.error('Error:', error.response?.data);
}
```

**Verify Axios Configuration**:
```typescript
// Check headers
import axios from 'axios';

axios.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});
```

**Common Frontend Issues**:
- ❌ Wrong endpoint URL
- ❌ Missing authentication token
- ❌ CORS error (check backend CORS config)
- ❌ Network error (backend not running)

### 3. Backend Debugging

**Add Logging to Controller**:
```javascript
exports.handler = async (req, res, next) => {
  console.log('=== DEBUG ===');
  console.log('Body:', req.body);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('User:', req.user);
  
  try {
    // Your code
  } catch (error) {
    console.error('Error in handler:', error);
    next(error);
  }
};
```

**Check Middleware**:
- Verify authentication middleware is working
- Check if authorization roles are correct
- Ensure validation middleware isn't blocking requests

**Common Backend Issues**:
- ❌ Route not registered
- ❌ Middleware blocking request
- ❌ Missing try-catch
- ❌ Database query error

### 4. Database Debugging

**Test Query Directly**:
```javascript
// In model file, add logging
exports.query = async (param) => {
  const sql = 'SELECT * FROM table WHERE column = ?';
  console.log('SQL:', sql);
  console.log('Params:', [param]);
  
  try {
    const [rows] = await db.query(sql, [param]);
    console.log('Result rows:', rows.length);
    return rows;
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
};
```

**Run Query in MySQL**:
```bash
mysql -u username -p database_name

# Manually test the query
SELECT * FROM table WHERE column = 'value';
```

**Common Database Issues**:
- ❌ Table doesn't exist
- ❌ Column name typo (remember Vietnamese names)
- ❌ SQL syntax error
- ❌ Foreign key constraint violation

### 5. Check Response Format

Ensure response follows project standard:

**Success Response**:
```javascript
{
  success: true,
  data: {...},
  message: "Success message"
}
```

**Error Response**:
```javascript
{
  success: false,
  error: "Error description",
  message: "User-friendly message"
}
```

### 6. Authentication Debugging

**Verify JWT Token**:
```javascript
// In auth middleware, add logging
const token = req.headers.authorization?.split(' ')[1];
console.log('Token:', token);

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Decoded:', decoded);
} catch (error) {
  console.error('JWT Error:', error.message);
}
```

**Check Token in Frontend**:
```typescript
// In browser console
localStorage.getItem('token'); // If using localStorage
// Or check request headers in Network tab
```

## Quick Diagnostics Checklist

### Is the backend running?
```bash
# Check if server is running
curl http://localhost:3000/api/health
# OR
netstat -an | findstr 3000
```

### Is the database connected?
- Check backend startup logs for "Database connected"
- Test connection in MySQL Workbench

### Is CORS configured?
Check `backend/index.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Are routes registered?
Search in `backend/index.js`:
```javascript
app.use('/api/endpoint', router);
```

### Is the HTTP method correct?
- GET for fetching data
- POST for creating
- PUT/PATCH for updating
- DELETE for removing

## Common Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User doesn't have permission (role check) |
| 404 | Not Found | Route doesn't exist, or resource not in DB |
| 500 | Server Error | Unhandled exception, DB error |

## Tools

### Browser DevTools
- **Console**: JavaScript errors
- **Network**: Request/response details
- **Application**: Local storage, cookies

### Backend Logging
- **Morgan**: HTTP request logs (console)
- **Winston**: Application logs (`backend/logs/`)

### Database Tools
- **MySQL Workbench**: Visual query tool
- **Command line**: Direct SQL access

### API Testing
- **Postman**: REST client
- **Thunder Client**: VS Code extension
- **curl**: Command line HTTP client

## Example Debug Session

**Problem**: Story creation fails with 500 error

**Step 1 - Frontend**:
- Checked Network tab: 500 Internal Server Error
- Payload looks correct

**Step 2 - Backend**:
- Checked backend logs: "Column 'trang_thai_kiem_duyet' cannot be null"
- Issue: Missing default value in query

**Step 3 - Fix**:
```javascript
// In model, add default value
const [result] = await db.query(
  'INSERT INTO stories (title, author_id, trang_thai_kiem_duyet) VALUES (?, ?, ?)',
  [title, authorId, 'cho_duyet'] // Added default status
);
```

**Step 4 - Test**:
- Retest API call
- Success! Story created with pending status
