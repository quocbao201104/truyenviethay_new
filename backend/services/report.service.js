const ReportModel = require("../models/report.model");
const {
  REPORT_TARGET_TYPES,
  REPORT_STATUSES,
  REPORT_ISSUE_TYPES,
  AUTHOR_ALLOWED_STATUSES,
} = require("../constants/report.constants");
const notificationService = require("./notification.services");
const { NOTIFY_TYPES } = require("../constants/notification.constants");

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureIssueTypeAllowed = (targetType, issueType) => {
  const allowed = REPORT_ISSUE_TYPES[targetType] || [];
  if (!allowed.includes(issueType)) {
    throw createError("issue_type khong hop le voi target_type nay.", 400);
  }
};

const buildChapterAuthorMessage = (target) =>
  `Chuong "${target.chapter_title || `Chuong ${target.chapter_number || target.chapter_id}`}" trong truyen ${target.story_title} vua bi report.`;

const buildNovelAuthorMessage = (target) =>
  `Truyen ${target.story_title} vua bi report boi nguoi dung.`;

const buildNovelAdminMessage = (target) =>
  `Co report moi cho truyen ${target.story_title}.`;

const buildCommentAdminMessage = (target) =>
  `Co report moi cho binh luan trong truyen ${target.story_title}.`;

const buildAudioAdminMessage = (target) =>
  `Co report moi cho audio cua truyen ${target.story_title}.`;

const resolveTargetOrThrow = async ({ targetType, targetId }) => {
  if (targetType === REPORT_TARGET_TYPES.CHAPTER) {
    const target = await ReportModel.resolveChapterTarget(targetId);
    if (!target) throw createError("Chuong khong ton tai.", 404);
    return target;
  }

  if (targetType === REPORT_TARGET_TYPES.COMMENT) {
    const target = await ReportModel.resolveCommentTarget(targetId);
    if (!target) throw createError("Binh luan khong ton tai.", 404);
    return target;
  }

  if (targetType === REPORT_TARGET_TYPES.NOVEL) {
    const target = await ReportModel.resolveNovelTarget(targetId);
    if (!target) throw createError("Truyen khong ton tai.", 404);
    return target;
  }

  if (targetType === REPORT_TARGET_TYPES.AUDIO) {
    const target = await ReportModel.resolveAudioTarget(targetId);
    if (!target) throw createError("Audio khong ton tai.", 404);
    return target;
  }

  throw createError("target_type chua duoc ho tro.", 400);
};

const maybeSetResolutionMeta = (status, actorId) => {
  if (status === REPORT_STATUSES.RESOLVED || status === REPORT_STATUSES.REJECTED) {
    return {
      resolvedBy: actorId,
      resolvedAt: new Date(),
    };
  }

  return {
    resolvedBy: null,
    resolvedAt: null,
  };
};

const ReportService = {
  async createReport({ reporterId, targetId, targetType, issueType, description = null }) {
    ensureIssueTypeAllowed(targetType, issueType);

    const duplicate = await ReportModel.findRecentDuplicate({
      reporterId,
      targetId,
      targetType,
      cooldownMinutes: 10,
    });

    if (duplicate) {
      throw createError("Ban da report noi dung nay trong 10 phut qua.", 429);
    }

    const target = await resolveTargetOrThrow({ targetType, targetId });

    const reportId = await ReportModel.createReport({
      reporterId,
      targetId,
      targetType,
      issueType,
      description,
    });

    try {
      if (targetType === REPORT_TARGET_TYPES.CHAPTER) {
        if (target.author_id) {
          await notificationService.sendNotification(
            target.author_id,
            buildChapterAuthorMessage(target),
            NOTIFY_TYPES.CHAPTER_REPORT_AUTHOR,
            targetId
          );
        }
      } else if (targetType === REPORT_TARGET_TYPES.COMMENT) {
        await notificationService.sendNotificationToAdmins(
          buildCommentAdminMessage(target),
          NOTIFY_TYPES.COMMENT_REPORT_ADMIN,
          targetId
        );
      } else if (targetType === REPORT_TARGET_TYPES.NOVEL) {
        if (target.author_id) {
          await notificationService.sendNotification(
            target.author_id,
            buildNovelAuthorMessage(target),
            NOTIFY_TYPES.NOVEL_REPORT_AUTHOR,
            targetId
          );
        }

        await notificationService.sendNotificationToAdmins(
          buildNovelAdminMessage(target),
          NOTIFY_TYPES.NOVEL_REPORT_ADMIN,
          targetId
        );
      } else if (targetType === REPORT_TARGET_TYPES.AUDIO) {
        await notificationService.sendNotificationToAdmins(
          buildAudioAdminMessage(target),
          NOTIFY_TYPES.AUDIO_REPORT_ADMIN,
          targetId
        );
      }
    } catch (notifyError) {
      console.error("report notification error:", notifyError);
    }

    return ReportModel.getReportById(reportId);
  },

  async getReporterReports({ reporterId, page = 1, limit = 20 }) {
    return ReportModel.getReporterReports({ reporterId, page, limit });
  },

  async getAdminReports({ actorId, page = 1, limit = 20, status = null, targetType = null, issueType = null }) {
    return ReportModel.getAdminReports({ page, limit, status, targetType, issueType });
  },

  async getAdminReportDetail({ actorId, reportId }) {
    const report = await ReportModel.getReportById(reportId);
    if (!report) throw createError("Report khong ton tai.", 404);
    if (report.target_type === REPORT_TARGET_TYPES.CHAPTER) {
      throw createError("Report khong ton tai.", 404);
    }
    return report;
  },

  async updateAdminReport({ actorId, reportId, status, adminNote = null }) {
    const report = await ReportModel.getReportById(reportId);
    if (!report) throw createError("Report khong ton tai.", 404);
    if (report.target_type === REPORT_TARGET_TYPES.CHAPTER) {
      throw createError("Report khong ton tai.", 404);
    }

    const resolution = maybeSetResolutionMeta(status, actorId);
    return ReportModel.updateReport({
      reportId,
      status,
      adminNote,
      resolvedBy: resolution.resolvedBy,
      resolvedAt: resolution.resolvedAt,
    });
  },

  async getAuthorReports({ actorId, actorRole, page = 1, limit = 20, status = null }) {
    if (actorRole === "admin") {
      return ReportModel.getAdminReports({ page, limit, status });
    }

    return ReportModel.getAuthorReports({
      authorId: actorId,
      page,
      limit,
      status,
    });
  },

  async getAuthorReportDetail({ actorId, actorRole, reportId }) {
    if (actorRole === "admin") {
      return this.getAdminReportDetail({ actorId, reportId });
    }

    const report = await ReportModel.getAuthorReportById({
      reportId,
      authorId: actorId,
    });

    if (!report) {
      throw createError("Ban khong co quyen truy cap report nay.", 403);
    }

    return report;
  },

  async updateAuthorReport({ actorId, actorRole, reportId, status, adminNote = null }) {
    if (actorRole === "admin") {
      return this.updateAdminReport({ actorId, reportId, status, adminNote });
    }

    if (!AUTHOR_ALLOWED_STATUSES.includes(status)) {
      throw createError("Tac gia khong duoc cap nhat trang thai nay.", 403);
    }

    const report = await ReportModel.getAuthorReportById({
      reportId,
      authorId: actorId,
    });

    if (!report) {
      throw createError("Ban khong co quyen cap nhat report nay.", 403);
    }

    const resolution = maybeSetResolutionMeta(status, actorId);
    return ReportModel.updateReport({
      reportId,
      status,
      adminNote,
      resolvedBy: resolution.resolvedBy,
      resolvedAt: resolution.resolvedAt,
    });
  },
};

module.exports = ReportService;
