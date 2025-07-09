const notificationService = require("../services/notification.sevices");
const db = require("../config/db");
const StoryModel = require("../models/story.model");
// Duyệt chương và gửi thông báo
const approveChapter = async (chapter_id, action) => {
  try {
    const [rows] = await db.query(
      `SELECT c.truyen_id, c.trang_thai AS trang_thai_kiem_duyet, t.user_id, t.ten_truyen AS ten_truyen
       FROM chuong c
       JOIN truyen_new t ON c.truyen_id = t.id
       WHERE c.id = ?`,
      [chapter_id]
    );
    const chapter = rows[0];
    if (!chapter) {
      return { success: false, message: "Không tìm thấy chương." };
    }

    const { truyen_id, user_id, trang_thai_kiem_duyet, ten_truyen } = chapter;

    if (action === "duyet" && trang_thai_kiem_duyet === "da_duyet") {
      return { success: false, message: "Chương đã được duyệt trước đó." };
    }

    if (action === "tu_choi" && trang_thai_kiem_duyet === "tu_choi") {
      return { success: false, message: "Chương đã bị từ chối trước đó." };
    }

    const newStatus = action === "duyet" ? "da_duyet" : "tu_choi";
    await db.query("UPDATE chuong SET trang_thai = ? WHERE id = ?", [
      newStatus,
      chapter_id,
    ]);

    // Gửi thông báo cho tác giả
    const contentForAuthor =
      action === "duyet"
        ? `Chương của bạn trong truyện ${ten_truyen} đã được duyệt thành công.`
        : `Chương của bạn trong truyện ${ten_truyen} đã bị từ chối.`;

    await notificationService.sendNotification(
      user_id,
      contentForAuthor,
      truyen_id
    );

    // Gửi thông báo
    await notificationService.notifyFollowersAboutChapterUpdate(
      truyen_id,
      ten_truyen,
      action
    );

    return {
      success: true,
      message: `Chương đã ${action === "duyet" ? "được duyệt" : "bị từ chối"} và đã gửi thông báo.`,
    };
  } catch (error) {
    console.error("Error approving/rejecting chapter:", error);
    throw error;
  }
};

module.exports = {
  approveChapter,
};
