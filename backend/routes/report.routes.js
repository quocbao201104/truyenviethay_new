const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { reportLimiter } = require("../middleware/rateLimiters");
const {
  validateCreateReport,
  validateListReports,
  validateReportIdParam,
  validateAdminUpdateReport,
  validateAuthorUpdateReport,
} = require("../validators/report.validator");

router.post("/reports", authenticateToken, reportLimiter, validateCreateReport, reportController.createReport);
router.get("/reports/mine", authenticateToken, validateListReports, reportController.getMyReports);

router.get(
  "/admin/reports",
  authenticateToken,
  authorizeRoles("admin"),
  validateListReports,
  reportController.getAdminReports
);
router.get(
  "/admin/reports/:id",
  authenticateToken,
  authorizeRoles("admin"),
  validateReportIdParam,
  reportController.getAdminReportDetail
);
router.patch(
  "/admin/reports/:id",
  authenticateToken,
  authorizeRoles("admin"),
  validateAdminUpdateReport,
  reportController.updateAdminReport
);

router.get(
  "/author/reports",
  authenticateToken,
  authorizeRoles("author", "admin"),
  validateListReports,
  reportController.getAuthorReports
);
router.get(
  "/author/reports/:id",
  authenticateToken,
  authorizeRoles("author", "admin"),
  validateReportIdParam,
  reportController.getAuthorReportDetail
);
router.patch(
  "/author/reports/:id",
  authenticateToken,
  authorizeRoles("author", "admin"),
  validateAuthorUpdateReport,
  reportController.updateAuthorReport
);

module.exports = router;
