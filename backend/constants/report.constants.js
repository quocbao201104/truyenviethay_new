const REPORT_TARGET_TYPES = {
  CHAPTER: "chapter",
  COMMENT: "comment",
  NOVEL: "novel",
  AUDIO: "audio",
};

const REPORT_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  RESOLVED: "resolved",
  REJECTED: "rejected",
};

const REPORT_ISSUE_TYPES = {
  [REPORT_TARGET_TYPES.CHAPTER]: [
    "content_error",
    "missing_content",
    "wrong_chapter",
    "copyright",
    "other",
  ],
  [REPORT_TARGET_TYPES.COMMENT]: [
    "spam",
    "harassment",
    "hate_speech",
    "spoiler_abuse",
    "other",
  ],
  [REPORT_TARGET_TYPES.NOVEL]: [
    "wrong_metadata",
    "content_violation",
    "copyright",
    "translation_quality",
    "other",
  ],
  [REPORT_TARGET_TYPES.AUDIO]: [
    "audio_glitch",
    "wrong_audio",
    "sync_error",
    "missing_audio",
    "copyright",
    "other",
  ],
};

const AUTHOR_ALLOWED_STATUSES = [
  REPORT_STATUSES.PROCESSING,
  REPORT_STATUSES.RESOLVED,
];

module.exports = {
  REPORT_TARGET_TYPES,
  REPORT_STATUSES,
  REPORT_ISSUE_TYPES,
  AUTHOR_ALLOWED_STATUSES,
};
