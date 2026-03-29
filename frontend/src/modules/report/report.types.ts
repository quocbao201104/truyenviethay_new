export type ReportTargetType = "chapter" | "comment" | "novel" | "audio";
export type ReportStatus = "pending" | "processing" | "resolved" | "rejected";

export interface ReportTargetSummary {
  id: number;
  type: ReportTargetType;
  story_id?: number | null;
  story_title?: string | null;
  author_id?: number | null;
  chapter_title?: string | null;
  chapter_number?: number | null;
  comment_excerpt?: string | null;
}

export interface ReportRecord {
  id: number;
  reporter_id: number;
  reporter_name?: string | null;
  target_id: number;
  target_type: ReportTargetType;
  issue_type: string;
  description?: string | null;
  status: ReportStatus;
  admin_note?: string | null;
  resolved_by?: number | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  target?: ReportTargetSummary | null;
}

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ReportListResponse {
  success: boolean;
  data: ReportRecord[];
  pagination: ReportPagination;
}

export interface ReportDetailResponse {
  success: boolean;
  data: ReportRecord;
}

export interface CreateReportPayload {
  target_id: number;
  target_type: ReportTargetType;
  issue_type: string;
  description?: string | null;
}

export interface UpdateReportPayload {
  status: ReportStatus;
  admin_note?: string | null;
}

export interface IssueOption {
  value: string;
  label: string;
  description: string;
}

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  chapter: "chương",
  comment: "bình luận",
  novel: "truyện",
  audio: "audio",
};

export const REPORT_ISSUE_OPTIONS: Record<ReportTargetType, IssueOption[]> = {
  chapter: [
    { value: "content_error", label: "Sai nội dung", description: "Nội dung sai, lặp hoặc thiếu logic." },
    { value: "missing_content", label: "Thiếu nội dung", description: "Chương bị cắt, trống hoặc mất đoạn." },
    { value: "wrong_chapter", label: "Sai chương", description: "Tiêu đề hoặc số chương không khớp nội dung." },
    { value: "copyright", label: "Bản quyền", description: "Có dấu hiệu vi phạm bản quyền hoặc nguồn." },
    { value: "other", label: "Khác", description: "Vấn đề khác cần mô tả thêm." },
  ],
  comment: [
    { value: "spam", label: "Spam", description: "Quảng cáo, link rác hoặc lặp nội dung." },
    { value: "harassment", label: "Quấy rối", description: "Công kích cá nhân hoặc xúc phạm người khác." },
    { value: "hate_speech", label: "Thù ghét", description: "Nội dung kích động thù ghét hoặc phân biệt." },
    { value: "spoiler_abuse", label: "Spoiler xấu", description: "Tiết lộ phá trải nghiệm theo cách xấu." },
    { value: "other", label: "Khác", description: "Vấn đề khác cần mô tả thêm." },
  ],
  novel: [
    { value: "wrong_metadata", label: "Sai thông tin", description: "Tên truyện, tác giả, thể loại hoặc mô tả chưa đúng." },
    { value: "content_violation", label: "Nội dung vi phạm", description: "Truyện có nội dung cần moderator xem lại." },
    { value: "copyright", label: "Bản quyền", description: "Có dấu hiệu vi phạm bản quyền hoặc đăng lại trái phép." },
    { value: "translation_quality", label: "Chất lượng dịch", description: "Bản dịch quá lỗi hoặc gây hiểu sai nghiêm trọng." },
    { value: "other", label: "Khác", description: "Vấn đề khác cần mô tả thêm." },
  ],
  audio: [
    { value: "audio_glitch", label: "Lỗi âm thanh", description: "Audio rè, nhỏ, méo tiếng hoặc không phát ổn định." },
    { value: "wrong_audio", label: "Sai audio", description: "Audio không khớp với truyện hoặc tập đang nghe." },
    { value: "sync_error", label: "Sai thứ tự", description: "Danh sách phát, tập hoặc cụm audio bị lệch thứ tự." },
    { value: "missing_audio", label: "Thiếu audio", description: "Truyện có audio nhưng thiếu tập hoặc không phát được." },
    { value: "copyright", label: "Bản quyền", description: "Audio có dấu hiệu vi phạm bản quyền hoặc nguồn." },
    { value: "other", label: "Khác", description: "Vấn đề khác cần mô tả thêm." },
  ],
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Từ chối",
};

export const REPORT_ISSUE_LABELS: Record<ReportTargetType, Record<string, string>> = {
  chapter: Object.fromEntries(REPORT_ISSUE_OPTIONS.chapter.map((option) => [option.value, option.label])),
  comment: Object.fromEntries(REPORT_ISSUE_OPTIONS.comment.map((option) => [option.value, option.label])),
  novel: Object.fromEntries(REPORT_ISSUE_OPTIONS.novel.map((option) => [option.value, option.label])),
  audio: Object.fromEntries(REPORT_ISSUE_OPTIONS.audio.map((option) => [option.value, option.label])),
};

export const getReportIssueLabel = (targetType: ReportTargetType, issueType: string) =>
  REPORT_ISSUE_LABELS[targetType]?.[issueType] || issueType;
