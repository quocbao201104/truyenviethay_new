const db = require("../config/db");

exports.hasLiked = async (userId, truyenId) => {
  const [rows] = await db.query(
    "SELECT 1 FROM thich WHERE user_id = ? AND truyen_id = ? LIMIT 1",
    [userId, truyenId]
  );
  return rows.length > 0;
};

exports.getLuotThich = async (truyenId) => {
  const [rows] = await db.query(
    "SELECT luot_thich FROM truyen_new WHERE id = ?",
    [truyenId]
  );
  return rows[0]?.luot_thich || 0;
};

exports.addLike = async (userId, truyenId) => {
  await db.query(
    "INSERT INTO thich (user_id, truyen_id, ngay_thich) VALUES (?, ?, NOW())",
    [userId, truyenId]
  );
  await db.query(
    "UPDATE truyen_new SET luot_thich = luot_thich + 1 WHERE id = ?",
    [truyenId]
  );
};

exports.removeLike = async (userId, truyenId) => {
  await db.query("DELETE FROM thich WHERE user_id = ? AND truyen_id = ?", [
    userId,
    truyenId,
  ]);
  await db.query(
    "UPDATE truyen_new SET luot_thich = GREATEST(luot_thich - 1, 0) WHERE id = ?",
    [truyenId]
  );
};
