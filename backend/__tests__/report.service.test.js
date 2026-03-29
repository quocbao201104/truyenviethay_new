jest.mock("../models/report.model", () => ({
  findRecentDuplicate: jest.fn(),
  resolveChapterTarget: jest.fn(),
  resolveCommentTarget: jest.fn(),
  resolveNovelTarget: jest.fn(),
  resolveAudioTarget: jest.fn(),
  createReport: jest.fn(),
  getReportById: jest.fn(),
  updateReport: jest.fn(),
}));

jest.mock("../services/notification.services", () => ({
  sendNotification: jest.fn(),
  sendNotificationToAdmins: jest.fn(),
}));

const ReportModel = require("../models/report.model");
const notificationService = require("../services/notification.services");
const ReportService = require("../services/report.service");

describe("ReportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends chapter reports only to the author", async () => {
    ReportModel.findRecentDuplicate.mockResolvedValue(null);
    ReportModel.resolveChapterTarget.mockResolvedValue({
      chapter_id: 22,
      story_title: "Truyen A",
      author_id: 999,
      chapter_title: "Chuong 1",
      chapter_number: 1,
    });
    ReportModel.createReport.mockResolvedValue(91);
    ReportModel.getReportById.mockResolvedValue({
      id: 91,
      target_type: "chapter",
      status: "pending",
    });

    const report = await ReportService.createReport({
      reporterId: 1001,
      targetId: 22,
      targetType: "chapter",
      issueType: "content_error",
      description: "Lap noi dung",
    });

    expect(report).toMatchObject({ id: 91, target_type: "chapter" });
    expect(notificationService.sendNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      999,
      expect.stringContaining("Truyen A"),
      expect.any(Number),
      22,
    );
    expect(notificationService.sendNotificationToAdmins).not.toHaveBeenCalled();
  });

  it("sends comment reports only to admins", async () => {
    ReportModel.findRecentDuplicate.mockResolvedValue(null);
    ReportModel.resolveCommentTarget.mockResolvedValue({
      comment_id: 18,
      story_title: "Truyen B",
    });
    ReportModel.createReport.mockResolvedValue(92);
    ReportModel.getReportById.mockResolvedValue({
      id: 92,
      target_type: "comment",
      status: "pending",
    });

    await ReportService.createReport({
      reporterId: 1001,
      targetId: 18,
      targetType: "comment",
      issueType: "spam",
      description: "Spam link",
    });

    expect(notificationService.sendNotification).not.toHaveBeenCalled();
    expect(notificationService.sendNotificationToAdmins).toHaveBeenCalledTimes(1);
    expect(notificationService.sendNotificationToAdmins).toHaveBeenCalledWith(
      expect.stringContaining("Truyen B"),
      expect.any(Number),
      18,
    );
  });

  it("sends novel reports to the author and admins", async () => {
    ReportModel.findRecentDuplicate.mockResolvedValue(null);
    ReportModel.resolveNovelTarget.mockResolvedValue({
      story_id: 77,
      story_title: "Truyen C",
      author_id: 456,
    });
    ReportModel.createReport.mockResolvedValue(93);
    ReportModel.getReportById.mockResolvedValue({
      id: 93,
      target_type: "novel",
      status: "pending",
    });

    await ReportService.createReport({
      reporterId: 1001,
      targetId: 77,
      targetType: "novel",
      issueType: "copyright",
      description: "Can check ban quyen",
    });

    expect(notificationService.sendNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      456,
      expect.stringContaining("Truyen C"),
      expect.any(Number),
      77,
    );
    expect(notificationService.sendNotificationToAdmins).toHaveBeenCalledTimes(1);
    expect(notificationService.sendNotificationToAdmins).toHaveBeenCalledWith(
      expect.stringContaining("Truyen C"),
      expect.any(Number),
      77,
    );
  });

  it("sends audio reports only to admins", async () => {
    ReportModel.findRecentDuplicate.mockResolvedValue(null);
    ReportModel.resolveAudioTarget.mockResolvedValue({
      story_id: 88,
      story_title: "Truyen D",
      author_id: 654,
    });
    ReportModel.createReport.mockResolvedValue(94);
    ReportModel.getReportById.mockResolvedValue({
      id: 94,
      target_type: "audio",
      status: "pending",
    });

    await ReportService.createReport({
      reporterId: 1001,
      targetId: 88,
      targetType: "audio",
      issueType: "audio_glitch",
      description: "Audio loi",
    });

    expect(notificationService.sendNotification).not.toHaveBeenCalled();
    expect(notificationService.sendNotificationToAdmins).toHaveBeenCalledTimes(1);
    expect(notificationService.sendNotificationToAdmins).toHaveBeenCalledWith(
      expect.stringContaining("Truyen D"),
      expect.any(Number),
      88,
    );
  });

  it("blocks admin detail access to chapter reports", async () => {
    ReportModel.getReportById.mockResolvedValue({
      id: 91,
      target_type: "chapter",
    });

    await expect(
      ReportService.getAdminReportDetail({ actorId: 1002, reportId: 91 }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Report khong ton tai.",
    });
  });
});
