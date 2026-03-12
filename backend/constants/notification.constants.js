// constants/notification.constants.js

const NOTIFY_TYPES = {
    // Nhóm 1: Tương tác (1-10)
    MENTION: 1,
    CHAT_REPLY: 2,
    COMMENT_REPLY: 3,

    // Nhóm 2: Truyện mới (11-20)
    NEW_CHAPTER: 11,
    CHAPTER_REJECTED: 13,
    BOOK_APPROVED: 12,

    // Nhóm 3: Hệ thống (21-30)
    GIFT_LINH_THACH: 21,
    MAINTENANCE: 22
};

const CATEGORY_MAP = {
    interaction: [1, 2, 3],
    story: [11, 12, 13],
    system: [21, 22]
};

module.exports = { NOTIFY_TYPES, CATEGORY_MAP };
