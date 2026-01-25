---
name: Implement Gamification Feature
description: Guide for implementing point/level/reward features
---

# Implement Gamification Feature Skill

This skill provides patterns for implementing gamification features in the TruyenVietHay platform.

## Overview

The gamification system consists of:
- **Points**: Earned through user activities
- **Levels**: XP-based progression system
- **Tasks**: Daily/achievement-based challenges
- **Rewards**: Redeemable items using points

## Database Schema Reference

### user_points
```sql
CREATE TABLE user_points (
  id INT PRIMARY KEY,
  user_id INT,
  points INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  ngay_tao TIMESTAMP,
  ngay_cap_nhat TIMESTAMP
);
```

### user_levels
```sql
CREATE TABLE user_levels (
  id INT PRIMARY KEY,
  user_id INT,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  next_level_xp INT DEFAULT 100,
  ngay_tao TIMESTAMP
);
```

### user_tasks
```sql
CREATE TABLE user_tasks (
  id INT PRIMARY KEY,
  user_id INT,
  task_id INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  ngay_tao TIMESTAMP
);
```

## Common Patterns

### 1. Award Points for Activity

**Backend Service**: `backend/services/points.service.js`

```javascript
const pointsModel = require('../models/points.model');

exports.awardPoints = async (userId, points, reason) => {
  try {
    // Add points to user
    await pointsModel.addPoints(userId, points);
    
    // Log activity
    await pointsModel.logActivity({
      user_id: userId,
      points,
      reason,
      type: 'earned'
    });
    
    return { success: true, points };
  } catch (error) {
    throw new Error('Failed to award points: ' + error.message);
  }
};
```

**Model**: `backend/models/points.model.js`

```javascript
exports.addPoints = async (userId, points) => {
  const [result] = await db.query(
    `UPDATE user_points 
     SET points = points + ?,
         lifetime_points = lifetime_points + ?,
         ngay_cap_nhat = NOW()
     WHERE user_id = ?`,
    [points, points, userId]
  );
  
  // Create record if user doesn't exist
  if (result.affectedRows === 0) {
    await db.query(
      `INSERT INTO user_points (user_id, points, lifetime_points, ngay_tao) 
       VALUES (?, ?, ?, NOW())`,
      [userId, points, points]
    );
  }
  
  return result;
};
```

### 2. Award XP and Handle Level Up

**Service**: `backend/services/levels.service.js`

```javascript
exports.awardXP = async (userId, xp) => {
  // Get current level info
  const level = await levelsModel.getUserLevel(userId);
  
  if (!level) {
    // Initialize user level
    await levelsModel.create({ user_id: userId, xp, level: 1 });
    return { leveledUp: false, currentLevel: 1 };
  }
  
  const newXP = level.xp + xp;
  const nextLevelXP = level.next_level_xp;
  
  if (newXP >= nextLevelXP) {
    // Level up!
    const newLevel = level.level + 1;
    const newNextLevelXP = calculateNextLevelXP(newLevel);
    
    await levelsModel.levelUp(userId, newLevel, newXP, newNextLevelXP);
    
    // Award bonus points for leveling up
    await pointsService.awardPoints(userId, 50, 'Level up bonus');
    
    return { leveledUp: true, currentLevel: newLevel };
  } else {
    // Just add XP
    await levelsModel.addXP(userId, xp);
    return { leveledUp: false, currentLevel: level.level };
  }
};

function calculateNextLevelXP(level) {
  // Example: exponential growth
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
```

### 3. Track Task Completion

**Controller**: `backend/controllers/tasks.controller.js`

```javascript
exports.completeTask = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.id;
    
    // Check if task already completed
    const existing = await tasksModel.getUserTask(userId, taskId);
    if (existing && existing.completed) {
      return res.status(400).json({
        success: false,
        error: 'Task already completed'
      });
    }
    
    // Get task details
    const task = await tasksModel.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Mark task as completed
    await tasksModel.completeTask(userId, taskId);
    
    // Award rewards
    await pointsService.awardPoints(userId, task.points_reward, `Completed task: ${task.name}`);
    await levelsService.awardXP(userId, task.xp_reward);
    
    res.status(200).json({
      success: true,
      message: 'Task completed!',
      data: {
        points: task.points_reward,
        xp: task.xp_reward
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 4. Redeem Rewards

**Service**: `backend/services/rewards.service.js`

```javascript
exports.redeemReward = async (userId, rewardId) => {
  const db = require('../config/db.config');
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get reward details
    const [rewards] = await connection.query(
      'SELECT * FROM rewards WHERE id = ?',
      [rewardId]
    );
    
    if (rewards.length === 0) {
      throw new Error('Reward not found');
    }
    
    const reward = rewards[0];
    
    // Check user points
    const [userPoints] = await connection.query(
      'SELECT points FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    if (!userPoints[0] || userPoints[0].points < reward.points_cost) {
      throw new Error('Insufficient points');
    }
    
    // Deduct points
    await connection.query(
      `UPDATE user_points 
       SET points = points - ?,
           ngay_cap_nhat = NOW()
       WHERE user_id = ?`,
      [reward.points_cost, userId]
    );
    
    // Grant reward to user
    await connection.query(
      `INSERT INTO user_rewards (user_id, reward_id, ngay_tao) 
       VALUES (?, ?, NOW())`,
      [userId, rewardId]
    );
    
    await connection.commit();
    
    return {
      success: true,
      reward,
      remainingPoints: userPoints[0].points - reward.points_cost
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

## Activity Point Values

Recommended point values for common activities:

| Activity | Points | XP |
|----------|--------|-----|
| Read a chapter | 5 | 10 |
| Complete a story | 20 | 50 |
| Write a comment | 10 | 15 |
| Rate a story | 5 | 10 |
| Daily login | 10 | 5 |
| Share a story | 15 | 20 |
| Author: Publish chapter | 50 | 100 |
| Author: Story approved | 100 | 200 |

## Integration Points

### When to Award Points/XP

1. **Reading Activity** - In `reading_history` controller:
```javascript
// After recording history
await pointsService.awardPoints(userId, 5, 'Read chapter');
await levelsService.awardXP(userId, 10);
```

2. **Social Interaction** - In `comments`/`ratings` controller:
```javascript
// After creating comment
await pointsService.awardPoints(userId, 10, 'Posted comment');
```

3. **Author Actions** - In story approval workflow:
```javascript
// After admin approves story
await pointsService.awardPoints(authorId, 100, 'Story approved');
await levelsService.awardXP(authorId, 200);
```

## Frontend Integration

### Display User Points/Level

**Component**: `UserStatsWidget.vue`

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/store/user.store';

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchGamificationStats();
});
</script>

<template>
  <div class="stats-widget">
    <div class="stat">
      <i class="fas fa-coins"></i>
      <span>{{ userStore.points }} Points</span>
    </div>
    <div class="stat">
      <i class="fas fa-star"></i>
      <span>Level {{ userStore.level }}</span>
    </div>
    <div class="progress-bar">
      <div 
        class="progress" 
        :style="{ width: `${userStore.xpProgress}%` }"
      ></div>
    </div>
  </div>
</template>
```

## Best Practices

1. **Use Transactions**: For operations that modify multiple tables (points + levels)
2. **Validate First**: Check user exists, has enough points, etc.
3. **Log Everything**: Keep audit trail of point transactions
4. **Prevent Abuse**: Check for duplicate completions, rate limit
5. **Balance Carefully**: Don't make rewards too easy or too hard

## Testing

```javascript
// Test awarding points
await pointsService.awardPoints(1, 50, 'Test');
// Check: user_points table updated correctly

// Test level up
await levelsService.awardXP(1, 1000);
// Check: level increased, next_level_xp recalculated

// Test reward redemption
await rewardsService.redeemReward(1, 1);
// Check: points deducted, user_rewards record created
```
