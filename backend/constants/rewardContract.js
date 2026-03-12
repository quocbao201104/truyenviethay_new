/**
 * Reward System Contract
 * Status và source phải khớp với DB schema (user_rewards.status, user_rewards.source)
 */

/** user_rewards.status: vòng đời instance */
const REWARD_STATUS = Object.freeze({
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  CLAIMED: 'claimed',
  USED: 'used',
  EXPIRED: 'expired',
});

/** user_rewards.source: nguồn cấp quà */
const REWARD_SOURCE = Object.freeze({
  TASK: 'task',
  LEVEL: 'level',
  EVENT: 'event',
  ADMIN: 'admin',
  SHOP: 'shop',
  SYSTEM: 'system',
  COMPENSATION: 'compensation',
  ADMIN_MANUAL: 'admin_manual',
});

/** rewards.reward_type */
const REWARD_TYPE = Object.freeze({
  EXP: 'exp',
  CURRENCY: 'currency',
  POINT: 'point',
  BADGE: 'badge',
  TITLE: 'title',
  BUFF: 'buff',
  ITEM: 'item',
  EVENT: 'event',
});

module.exports = {
  REWARD_STATUS,
  REWARD_SOURCE,
  REWARD_TYPE,
};
