# Security Rules

## SQL Injection Prevention

**RULE**: Always use parameterized queries. Never concatenate user input into SQL strings.

### ❌ FORBIDDEN
```javascript
// NEVER DO THIS
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);
```

### ✅ REQUIRED
```javascript
// ALWAYS USE PARAMETERIZED QUERIES
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

## Authentication

**RULE**: All routes that modify data or access user-specific information must use the `authenticate` middleware.

### Required for:
- User profile operations
- Story/chapter creation, update, deletion
- Comments, ratings, follows
- Gamification actions

### Implementation
```javascript
const { authenticate, authorize } = require('../middleware/auth');

// Logged-in users only
router.post('/endpoint', authenticate, controller.handler);

// Admin only
router.delete('/endpoint', authenticate, authorize(['admin']), controller.handler);
```

## Input Validation

**RULE**: Validate all user inputs before processing.

### Use Joi or Express Validator
```javascript
const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ 
    success: false, 
    error: error.details[0].message 
  });
}
```

## File Uploads

**RULE**: Validate file types, sizes, and sanitize filenames.

### Required Checks
- File type whitelist (e.g., only .jpg, .png, .pdf, .docx)
- Maximum file size limit
- Sanitize filenames (remove special characters)
- Store outside web root or validate access

```javascript
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({...}),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

## Environment Variables

**RULE**: Never hardcode sensitive data. Use environment variables.

### Required in .env
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (must be strong and random)
- API keys (TinyMCE, etc.)

### ❌ FORBIDDEN
```javascript
const secret = 'my-secret-key'; // NEVER hardcode
```

### ✅ REQUIRED
```javascript
const secret = process.env.JWT_SECRET;
```

## Password Security

**RULE**: Always hash passwords with bcrypt. Never store plain text.

```javascript
const bcrypt = require('bcrypt');

// Hash password before storing
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, user.password_hash);
```

## CORS Configuration

**RULE**: Configure CORS to only allow trusted origins.

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Rate Limiting

**RULE**: Apply rate limiting to authentication and sensitive endpoints.

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});

router.post('/login', loginLimiter, authController.login);
```

## Error Handling

**RULE**: Never expose sensitive error details to clients in production.

```javascript
// Development
if (process.env.NODE_ENV === 'development') {
  res.status(500).json({ error: error.message, stack: error.stack });
} else {
  // Production - generic message
  res.status(500).json({ error: 'Internal server error' });
}
```

## Checklist for New Endpoints

Before deploying any new API endpoint:

- [ ] Parameterized queries used (no SQL injection)
- [ ] Authentication middleware applied if needed
- [ ] Authorization checks for role-based access
- [ ] Input validation implemented
- [ ] Error handling with try-catch
- [ ] No sensitive data in error messages
- [ ] Rate limiting on sensitive operations
- [ ] CORS configured properly
