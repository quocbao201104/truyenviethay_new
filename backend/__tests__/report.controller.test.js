const request = require("supertest");
const { createTestToken, authHeader } = require("./helpers");

describe("report routes", () => {
  let userToken;
  let adminToken;
  let authorToken;
  let reportService;
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    userToken = createTestToken({ id: 1001, role: "user" });
    adminToken = createTestToken({ id: 1002, role: "admin" });
    authorToken = createTestToken({ id: 1003, role: "author" });
  });

  beforeEach(() => {
    jest.resetModules();
    jest.doMock("../services/report.service", () => ({
      createReport: jest.fn(),
      getReporterReports: jest.fn(),
      getAdminReports: jest.fn(),
      getAdminReportDetail: jest.fn(),
      updateAdminReport: jest.fn(),
      getAuthorReports: jest.fn(),
      getAuthorReportDetail: jest.fn(),
      updateAuthorReport: jest.fn(),
    }));

    reportService = require("../services/report.service");
    app = require("../app");
  });

  it("creates a chapter report and routes notifications to author and admins", async () => {
    reportService.createReport.mockResolvedValue({
      id: 91,
      reporter_id: 1001,
      target_id: 22,
      target_type: "chapter",
      issue_type: "content_error",
      description: "Lap noi dung",
      status: "pending",
    });

    const res = await request(app)
      .post("/api/reports")
      .set(authHeader(userToken))
      .send({
        target_id: 22,
        target_type: "chapter",
        issue_type: "content_error",
        description: "Lap noi dung",
      });

    expect(res.status).toBe(201);
    expect(reportService.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reporterId: 1001,
        targetId: 22,
        targetType: "chapter",
        issueType: "content_error",
        description: "Lap noi dung",
      })
    );
    expect(res.body).toMatchObject({
      success: true,
      data: {
        id: 91,
        target_type: "chapter",
        status: "pending",
      },
    });
  });

  it("creates a comment report and routes notifications only to admins", async () => {
    reportService.createReport.mockResolvedValue({
      id: 92,
      reporter_id: 1001,
      target_id: 18,
      target_type: "comment",
      issue_type: "spam",
      description: "Spam link",
      status: "pending",
    });

    const res = await request(app)
      .post("/api/reports")
      .set(authHeader(userToken))
      .send({
        target_id: 18,
        target_type: "comment",
        issue_type: "spam",
        description: "Spam link",
      });

    expect(res.status).toBe(201);
    expect(reportService.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reporterId: 1001,
        targetId: 18,
        targetType: "comment",
        issueType: "spam",
      })
    );
    expect(res.body.data).toMatchObject({
      id: 92,
      target_type: "comment",
      issue_type: "spam",
    });
  });

  it("rejects a duplicate cooldown report for the same user and target", async () => {
    reportService.createReport.mockRejectedValue(
      Object.assign(new Error("Ban da report noi dung nay trong 10 phut qua."), {
        status: 429,
      })
    );

    const res = await request(app)
      .post("/api/reports")
      .set(authHeader(userToken))
      .send({
        target_id: 22,
        target_type: "chapter",
        issue_type: "content_error",
      });

    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({
      success: false,
      message: "Ban da report noi dung nay trong 10 phut qua.",
    });
  });

  it("allows admins to update any report status", async () => {
    reportService.updateAdminReport.mockResolvedValue({
      id: 91,
      status: "resolved",
      admin_note: "Da xu ly",
    });

    const res = await request(app)
      .patch("/api/admin/reports/91")
      .set(authHeader(adminToken))
      .send({ status: "resolved", admin_note: "Da xu ly" });

    expect(res.status).toBe(200);
    expect(reportService.updateAdminReport).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 1002,
        reportId: 91,
        status: "resolved",
        adminNote: "Da xu ly",
      })
    );
    expect(res.body).toMatchObject({
      success: true,
      data: { id: 91, status: "resolved" },
    });
  });

  it("allows authors to update only chapter reports for owned stories", async () => {
    reportService.updateAuthorReport.mockResolvedValue({
      id: 91,
      status: "processing",
      admin_note: "Dang xem",
    });

    const res = await request(app)
      .patch("/api/author/reports/91")
      .set(authHeader(authorToken))
      .send({ status: "processing", admin_note: "Dang xem" });

    expect(res.status).toBe(200);
    expect(reportService.updateAuthorReport).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 1003,
        actorRole: "author",
        reportId: 91,
        status: "processing",
        adminNote: "Dang xem",
      })
    );
  });

  it("rejects author access to comment reports", async () => {
    reportService.getAuthorReportDetail.mockRejectedValue(
      Object.assign(new Error("Ban khong co quyen truy cap report nay."), {
        status: 403,
      })
    );

    const res = await request(app)
      .get("/api/author/reports/33")
      .set(authHeader(authorToken));

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      message: "Ban khong co quyen truy cap report nay.",
    });
  });
});
