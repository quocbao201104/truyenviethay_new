---
description: Add a new API endpoint to the backend
---

# Add New API Endpoint

This workflow guides you through creating a new API endpoint following the project's layered architecture.

## Steps

### 1. Define the Route

Create or modify the route file in `backend/routes/`:

**Example**: `backend/routes/feature.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/feature.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoint
router.get('/public-data', controller.getPublicData);

// Protected endpoint (logged in users only)
router.post('/create', authenticate, controller.createItem);

// Admin-only endpoint
router.delete('/:id', authenticate, authorize(['admin']), controller.deleteItem);

module.exports = router;
```

### 2. Register the Route

Add the route to `backend/index.js`:

```javascript
const featureRoutes = require('./routes/feature.routes');
app.use('/api/feature', featureRoutes);
```

### 3. Create Controller

Create controller file in `backend/controllers/`:

**Example**: `backend/controllers/feature.controller.js`

```javascript
const model = require('../models/feature.model');
// Or use service for complex logic
// const service = require('../services/feature.service');

exports.getPublicData = async (req, res, next) => {
  try {
    const data = await model.fetchAll();
    res.status(200).json({
      success: true,
      data,
      message: 'Data fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Validate input (use Joi or Express Validator)
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const result = await model.create({ name, description });
    res.status(201).json({
      success: true,
      data: result,
      message: 'Item created successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await model.delete(id);
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

### 4. Create Model

Create model file in `backend/models/`:

**Example**: `backend/models/feature.model.js`

```javascript
const db = require('../config/db.config');

exports.fetchAll = async () => {
  const [rows] = await db.query('SELECT * FROM table_name');
  return rows;
};

exports.create = async (data) => {
  const { name, description } = data;
  const [result] = await db.query(
    'INSERT INTO table_name (name, description, ngay_tao) VALUES (?, ?, NOW())',
    [name, description]
  );
  return { id: result.insertId, name, description };
};

exports.delete = async (id) => {
  const [result] = await db.query('DELETE FROM table_name WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
```

### 5. (Optional) Add Service Layer

If business logic is complex, create a service in `backend/services/`:

**Example**: `backend/services/feature.service.js`

```javascript
const model = require('../models/feature.model');

exports.processComplexLogic = async (data) => {
  // Multi-step operations
  // Approval workflows
  // Gamification calculations
  // etc.
  const step1 = await model.fetchAll();
  const step2 = processData(step1, data);
  return await model.create(step2);
};
```

### 6. Add Validation (Optional but Recommended)

Create validator in `backend/validators/`:

**Example**: `backend/validators/feature.validator.js`

```javascript
const Joi = require('joi');

exports.createSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional()
});
```

Use in controller:
```javascript
const { createSchema } = require('../validators/feature.validator');

const { error, value } = createSchema.validate(req.body);
if (error) {
  return res.status(400).json({ success: false, error: error.message });
}
```

### 7. Test the Endpoint

Test using Postman, Thunder Client, or curl:

```bash
# GET request
curl http://localhost:3000/api/feature/public-data

# POST request
curl -X POST http://localhost:3000/api/feature/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test","description":"Test description"}'

# DELETE request
curl -X DELETE http://localhost:3000/api/feature/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Checklist

- [ ] Route defined in `/routes`
- [ ] Route registered in `index.js`
- [ ] Controller created with error handling
- [ ] Model created with parameterized queries
- [ ] Service layer added if needed
- [ ] Input validation implemented
- [ ] Authentication/authorization applied if needed
- [ ] Endpoint tested manually
- [ ] Response follows standard format

## Notes

- Always use parameterized queries to prevent SQL injection
- Use try-catch in controllers and pass errors to `next()`
- Follow Vietnamese naming in database columns
- Return consistent response format
