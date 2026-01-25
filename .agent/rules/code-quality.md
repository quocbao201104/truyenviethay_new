# Code Quality Rules

## Project Conventions

### Backend

#### File Naming
- **Routes**: `feature.routes.js`
- **Controllers**: `feature.controller.js`
- **Models**: `feature.model.js`
- **Services**: `feature.service.js`
- Use lowercase with dots as separators

#### Function Naming
- **Controllers**: `exports.handlerName`
- **Models**: `exports.queryName`
- Use camelCase for function names
- Be descriptive (e.g., `getUserById` not `get`)

#### Database Naming
- **Tables**: Lowercase, plural (e.g., `stories`, `users_new`)
- **Columns**: Follow existing Vietnamese conventions
  - `ngay_tao` = creation date
  - `ngay_cap_nhat` = update date
  - `trang_thai_kiem_duyet` = approval status
- **DO NOT** mix English and Vietnamese inconsistently

#### Response Format
All API responses must follow this format:

**Success**:
```javascript
{
  success: true,
  data: {...},
  message: "Success message"
}
```

**Error**:
```javascript
{
  success: false,
  error: "Error description",
  message: "User-friendly message"
}
```

#### Error Handling
**RULE**: All async controllers must use try-catch and pass errors to `next()`.

```javascript
exports.handler = async (req, res, next) => {
  try {
    // Your code
    res.json({ success: true, data });
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
};
```

### Frontend

#### File Naming
- **Components**: PascalCase (e.g., `StoryCard.vue`)
- **Views**: PascalCase with `View` suffix (e.g., `StoryDetailView.vue`)
- **Services**: camelCase with `.service.ts` (e.g., `story.service.ts`)
- **Stores**: camelCase with `.store.ts` (e.g., `story.store.ts`)
- **Types**: camelCase with `.types.ts` (e.g., `story.types.ts`)

#### Component Structure
**RULE**: Use Composition API with `<script setup>` for all new components.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props
defineProps<{ title: string }>();

// Emits
const emit = defineEmits<{
  (e: 'update', value: string): void;
}>();

// State
const data = ref([]);

// Computed
const count = computed(() => data.value.length);

// Lifecycle
onMounted(() => {
  // Initialize
});
</script>

<template>
  <div>
    <!-- Template -->
  </div>
</template>

<style scoped>
/* Scoped styles */
</style>
```

#### TypeScript
**RULE**: Define interfaces for all data structures.

```typescript
interface Story {
  id: number;
  title: string;
  slug: string;
  trang_thai_kiem_duyet: 'cho_duyet' | 'da_duyet' | 'tu_choi';
}

// Use in props
defineProps<{
  story: Story;
}>();
```

#### State Management
**RULE**: Use Pinia stores for shared state, not props drilling.

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStoryStore = defineStore('story', () => {
  const stories = ref<Story[]>([]);
  
  async function fetch() {
    // Fetch data
  }
  
  return { stories, fetch };
});
```

## Code Organization

### Backend Layers

**RULE**: Respect the layered architecture.

1. **Routes**: Only route definitions, no business logic
2. **Controllers**: Request handling, validation, response formatting
3. **Services**: Complex business logic, multi-step operations
4. **Models**: Database queries only

**When to use Services**:
- Approval workflows
- Multi-table operations
- Gamification calculations
- Complex transformations

**When NOT to use Services**:
- Simple CRUD operations
- Direct database queries
- One-step operations

### Frontend Module Structure

**RULE**: Organize features in `/modules` directory.

```
modules/
├── story/
│   ├── StoryCard.vue
│   ├── StoryList.vue
│   ├── story.service.ts
│   ├── story.store.ts
│   └── story.types.ts
```

Benefits:
- Co-location of related code
- Clear feature boundaries
- Easier to maintain

## Performance

### Backend

**RULE**: Optimize database queries.

- Add indexes for columns in WHERE/ORDER BY clauses
- Use LIMIT for large result sets
- Avoid SELECT * (specify columns)
- Use transactions for multi-step operations

```javascript
// Good: Paginated results
const [rows] = await db.query(
  'SELECT id, title, author FROM stories LIMIT ? OFFSET ?',
  [limit, offset]
);

// Bad: Unbounded results
const [rows] = await db.query('SELECT * FROM stories');
```

### Frontend

**RULE**: Lazy load routes.

```typescript
{
  path: '/story/:slug',
  component: () => import('@/views/StoryDetailView.vue')
}
```

**RULE**: Use computed properties for derived state.

```typescript
const filteredStories = computed(() => 
  stories.value.filter(s => s.trang_thai_kiem_duyet === 'da_duyet')
);
```

## Documentation

### Code Comments

**RULE**: Comment complex logic, not obvious code.

```javascript
// ❌ Bad: Obvious
// Get user by ID
const user = await model.getUserById(id);

// ✅ Good: Explains WHY
// Award bonus points if user levels up 3+ levels at once
if (levelDiff >= 3) {
  await pointsService.awardPoints(userId, 100, 'Multi-level bonus');
}
```

### Function Documentation

For complex functions, add JSDoc:

```javascript
/**
 * Calculate next level XP requirement using exponential growth
 * @param {number} level - Current level
 * @returns {number} XP required for next level
 */
function calculateNextLevelXP(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
```

## Git Commits

**RULE**: Write meaningful commit messages.

**Good**:
- `Add user authentication middleware`
- `Fix SQL injection in story search`
- `Optimize story list query with pagination`

**Bad**:
- `fix bug`
- `update code`
- `changes`

## Testing

**RULE**: Write tests for critical features (when testing is set up).

Priority for testing:
1. Authentication/authorization
2. Payment/points transactions
3. Approval workflows
4. Data integrity operations

## Checklist for Code Review

Before submitting for review:

- [ ] Code follows naming conventions
- [ ] No hardcoded values (use env vars or constants)
- [ ] Error handling implemented
- [ ] No console.log statements (use proper logging)
- [ ] TypeScript types defined (frontend)
- [ ] Parameterized queries (backend)
- [ ] Response format consistent
- [ ] No code duplication
- [ ] Comments for complex logic
- [ ] Git commit message is meaningful
