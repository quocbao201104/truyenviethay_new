/**
 * Mailbox System Contract
 */

const MAIL_STATUS = Object.freeze({
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
});

const ATTACHMENT_STATUS = Object.freeze({
    PENDING: 'pending',
    CLAIMED: 'claimed',
    EXPIRED: 'expired',
});

const MAIL_TYPE = Object.freeze({
    REWARD: 'reward',
    ANNOUNCEMENT: 'announcement',
    COMPENSATION: 'compensation',
    SYSTEM: 'system',
});

module.exports = {
    MAIL_STATUS,
    ATTACHMENT_STATUS,
    MAIL_TYPE,
};
