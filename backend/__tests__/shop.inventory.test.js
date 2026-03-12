/**
 * Test Matrix - Shop + Inventory (SHOP_INVENTORY_ROADMAP.md Phase 1 + 3)
 *
 * Phase 1: Buy validation (quantity, itemId)
 * Phase 3: Integration - catalog, transactions, inventory, equip
 *
 * Chạy: npm test (từ thư mục backend)
 * Cần: .env có JWT_SECRET, DB kết nối được
 */
const request = require("supertest");
const app = require("../app");
const { createTestToken, authHeader } = require("./helpers");

describe("Shop + Inventory Test Matrix (Phase 1)", () => {
  let userToken;

  beforeAll(() => {
    userToken = createTestToken({ id: 1, role: "user" });
  });

  describe("POST /api/shop/buy - validation", () => {
    it("trả 400 khi quantity = -1", async () => {
      const res = await request(app)
        .post("/api/shop/buy")
        .set(authHeader(userToken))
        .send({ itemId: 1, quantity: -1 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("trả 400 khi quantity = 0", async () => {
      const res = await request(app)
        .post("/api/shop/buy")
        .set(authHeader(userToken))
        .send({ itemId: 1, quantity: 0 });

      expect(res.status).toBe(400);
    });

    it("trả 400 khi quantity > 999", async () => {
      const res = await request(app)
        .post("/api/shop/buy")
        .set(authHeader(userToken))
        .send({ itemId: 1, quantity: 1000 });

      expect(res.status).toBe(400);
    });

    it("trả 400 khi itemId thiếu", async () => {
      const res = await request(app)
        .post("/api/shop/buy")
        .set(authHeader(userToken))
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
    });

    it("trả 400 khi itemId = 0", async () => {
      const res = await request(app)
        .post("/api/shop/buy")
        .set(authHeader(userToken))
        .send({ itemId: 0, quantity: 1 });

      expect(res.status).toBe(400);
    });

    it("trả 401 khi không có token", async () => {
      const res = await request(app)
        .post("/api/shop/buy")
        .send({ itemId: 1, quantity: 1 });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/shop/items - catalog", () => {
    it("trả 200 và data array", async () => {
      const res = await request(app).get("/api/shop/items");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/shop/transactions - auth", () => {
    it("trả 200 khi có token, có meta pagination", async () => {
      const res = await request(app)
        .get("/api/shop/transactions?limit=5&offset=0")
        .set(authHeader(userToken));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty("meta");
      expect(res.body.meta).toMatchObject({ total: expect.any(Number), limit: 5, offset: 0 });
    });

    it("trả 401 khi không có token", async () => {
      const res = await request(app).get("/api/shop/transactions");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/inventory/items - auth", () => {
    it("trả 200 khi có token, có meta pagination", async () => {
      const res = await request(app)
        .get("/api/inventory/items?limit=10&offset=0")
        .set(authHeader(userToken));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty("meta");
      expect(res.body.meta).toMatchObject({ total: expect.any(Number), limit: 10, offset: 0 });
    });

    it("trả 401 khi không có token", async () => {
      const res = await request(app).get("/api/inventory/items");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/inventory/equip-item - validation", () => {
    it("trả 400 khi thiếu inventoryId", async () => {
      const res = await request(app)
        .post("/api/inventory/equip-item")
        .set(authHeader(userToken))
        .send({});

      expect(res.status).toBe(400);
    });

    it("trả 400 khi inventoryId invalid (item không tồn tại)", async () => {
      const res = await request(app)
        .post("/api/inventory/equip-item")
        .set(authHeader(userToken))
        .send({ inventoryId: 999999 });

      expect([400, 500]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
