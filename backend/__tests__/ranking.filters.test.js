jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

jest.mock("../utils/cache", () => ({
  getOrSet: jest.fn(async (_key, _ttl, fetchFn) => fetchFn()),
  invalidate: jest.fn(),
}));

jest.mock("../models/category.model", () => ({
  getByStoryIds: jest.fn(async () => new Map()),
}));

const db = require("../config/db");
const StoryModel = require("../models/story.model");
const RatingModel = require("../models/rating.model");

describe("ranking text-only filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds a chapter requirement when fetching public stories for Tan Tu Bang", async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);

    await StoryModel._getPublicStoriesCore({
      page: 1,
      limit: 10,
      min_days_ago: 30,
      sort_by: "luot_xem",
      order: "DESC",
      require_text_chapters: true,
    });

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[0][0]).toContain("tn.so_luong_chuong > 0");
    expect(db.query.mock.calls[1][0]).toContain("tn.so_luong_chuong > 0");
  });

  it("filters top-rated stories to items that have chapters", async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);

    await RatingModel.getAllTopRatedStories({ page: 1, limit: 8 });

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[0][0]).toContain("t.so_luong_chuong > 0");
    expect(db.query.mock.calls[1][0]).toContain("t.so_luong_chuong > 0");
  });

  it("filters hot stories to text stories and caps the result size at 10", async () => {
    db.query.mockResolvedValueOnce([[]]);

    const result = await StoryModel.getHotStories(50);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("so_luong_chuong > 0");
    expect(db.query.mock.calls[0][1]).toEqual([10]);
    expect(result.pagination.limit).toBe(10);
  });
});
