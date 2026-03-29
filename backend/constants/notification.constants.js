// constants/notification.constants.js

const NOTIFY_TYPES = {
  // Interaction (1-10)
  MENTION: 1,
  CHAT_REPLY: 2,
  COMMENT_REPLY: 3,

  // Story and moderation (11-20)
  NEW_CHAPTER: 11,
  BOOK_APPROVED: 12,
  CHAPTER_REJECTED: 13,
  CHAPTER_REPORT_AUTHOR: 14,
  CHAPTER_REPORT_ADMIN: 15,
  COMMENT_REPORT_ADMIN: 16,
  NOVEL_REPORT_AUTHOR: 17,
  NOVEL_REPORT_ADMIN: 18,
  AUDIO_REPORT_ADMIN: 19,

  // System (21-30)
  GIFT_LINH_THACH: 21,
  MAINTENANCE: 22,
};

const CATEGORY_MAP = {
  interaction: [1, 2, 3],
  story: [11, 12, 13],
  system: [14, 15, 16, 17, 18, 19, 21, 22],
};

module.exports = { NOTIFY_TYPES, CATEGORY_MAP };
