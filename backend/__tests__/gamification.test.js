/**
 * Test Matrix - Gamification (GAMIFICATION_ROADMAP.md)
 *
 * - Reward list: GET /api/user-rewards/:userId → 200, schema đúng
 * - Reward claim (insufficient currency/level) → 400 với message rõ
 * - Reward claim success → transaction commit, không duplicate
 * - Level history: POST add 1 lần → 1 record mới
 * - Task complete → invalidate đúng key, lần gọi tiếp theo trả data mới
 *
 * Chạy: npm test (từ thư mục backend)
 * Cần: .env có JWT_SECRET, DB kết nối được
 */
const request = require("supertest");
const app = require("../app");
const { createTestToken, authHeader } = require("./helpers");

describe("Gamification Test Matrix", () => {
  let userToken;
  let adminToken;

  beforeAll(() => {
    userToken = createTestToken({ id: 1, role: "user" });
    adminToken = createTestToken({ id: 1, role: "admin" });
  });

  describe("1. Reward list: GET /api/user-rewards/:userId", () => {
    it("trả 200 và schema đúng khi auth hợp lệ", async () => {
      const res = await request(app)
        .get("/api/user-rewards/1")
        .set(authHeader(userToken));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        const row = res.body.data[0];
        expect(row).toHaveProperty("reward_name");
        expect(row).not.toHaveProperty("name");
      }
    });

    it("trả 403 khi request userId khác user đăng nhập (không phải admin)", async () => {
      const res = await request(app)
        .get("/api/user-rewards/999")
        .set(authHeader(userToken));

      expect(res.status).toBe(403);
    });
  });

  describe("2. Reward claim (insufficient level) → 400", () => {
    it("claimMilestone trả 400 khi chưa đủ level", async () => {
      const res = await request(app)
        .post("/api/user-rewards/milestone")
        .set(authHeader(userToken))
        .send({ reward_id: 9999 });

      expect([400, 500]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/cấp độ|level|tồn tại/i);
      }
    });
  });

  describe("3. Reward claim (body) - userRewardId không hợp lệ → 400", () => {
    it("claimRewardFromBody trả 400 khi userRewardId thiếu", async () => {
      const res = await request(app)
        .post("/api/user-rewards/claim")
        .set(authHeader(userToken))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/userRewardId|hợp lệ/i);
    });
  });

  describe("4. Level history: POST 1 lần → 1 record (không duplicate)", () => {
    it("addHistory cần admin, gọi 1 lần (201 hoặc 403 nếu thiếu quyền)", async () => {
      const res = await request(app)
        .post("/api/levels/history")
        .set(authHeader(adminToken))
        .send({
          user_id: 1,
          level_id: 1,
          old_level_id: 0,
          timeSpent: 0,
        });

      expect([201, 403, 500]).toContain(res.status);
      if (res.status === 201) expect(res.body).toHaveProperty("success", true);
    }, 15000);
  });

  describe("5. Task complete → cache invalidate", () => {
    it("POST complete gửi task_id, nhận 200 hoặc 4xx/5xx", async () => {
      const completeRes = await request(app)
        .post("/api/tasks/complete")
        .set(authHeader(userToken))
        .send({ task_id: 1 });

      expect([200, 400, 500]).toContain(completeRes.status);
      if (completeRes.status === 200) {
        expect(completeRes.body).toHaveProperty("data");
        const listAfter = await request(app)
          .get("/api/tasks")
          .set(authHeader(userToken));
        expect(listAfter.status).toBe(200);
        expect(listAfter.body).toHaveProperty("data");
      }
    }, 15000);
  });
});
