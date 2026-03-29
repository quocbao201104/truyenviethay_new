const reportService = require("../services/report.service");

const normalizeError = (err) => {
  if (err?.status || err?.statusCode) return err;
  const error = new Error(err?.message || "Loi report.");
  error.status = 500;
  return error;
};

const createReport = async (req, res, next) => {
  try {
    const data = await reportService.createReport({
      reporterId: req.user.id,
      targetId: Number(req.body.target_id),
      targetType: req.body.target_type,
      issueType: req.body.issue_type,
      description: req.body.description?.trim() || null,
    });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const data = await reportService.getReporterReports({
      reporterId: req.user.id,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const getAdminReports = async (req, res, next) => {
  try {
    const data = await reportService.getAdminReports({
      actorId: req.user.id,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      status: req.query.status || null,
      targetType: req.query.target_type || null,
      issueType: req.query.issue_type || null,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const getAdminReportDetail = async (req, res, next) => {
  try {
    const data = await reportService.getAdminReportDetail({
      actorId: req.user.id,
      reportId: Number(req.params.id),
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const updateAdminReport = async (req, res, next) => {
  try {
    const data = await reportService.updateAdminReport({
      actorId: req.user.id,
      reportId: Number(req.params.id),
      status: req.body.status,
      adminNote: req.body.admin_note?.trim() || null,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const getAuthorReports = async (req, res, next) => {
  try {
    const data = await reportService.getAuthorReports({
      actorId: req.user.id,
      actorRole: req.user.role,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      status: req.query.status || null,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const getAuthorReportDetail = async (req, res, next) => {
  try {
    const data = await reportService.getAuthorReportDetail({
      actorId: req.user.id,
      actorRole: req.user.role,
      reportId: Number(req.params.id),
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

const updateAuthorReport = async (req, res, next) => {
  try {
    const data = await reportService.updateAuthorReport({
      actorId: req.user.id,
      actorRole: req.user.role,
      reportId: Number(req.params.id),
      status: req.body.status,
      adminNote: req.body.admin_note?.trim() || null,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(normalizeError(err));
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAdminReports,
  getAdminReportDetail,
  updateAdminReport,
  getAuthorReports,
  getAuthorReportDetail,
  updateAuthorReport,
};
