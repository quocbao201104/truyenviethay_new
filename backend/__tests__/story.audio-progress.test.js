jest.mock("../models/story.model", () => ({
  getBySlug: jest.fn(),
  getById: jest.fn(),
  getAudioPartsByStoryId: jest.fn(),
  getAudioProgressByUserAndStory: jest.fn(),
  getAudioPartByIdAndStory: jest.fn(),
  saveAudioProgress: jest.fn(),
  getPartnerById: jest.fn(),
}));

jest.mock("../models/category.model", () => ({}));
jest.mock("../services/story.services", () => ({}));
jest.mock("../models/follow.model", () => ({}));
jest.mock("../models/readingState.model", () => ({}));
jest.mock("../models/inventory.model", () => ({}));
jest.mock("../utils/slugify", () => jest.fn());
jest.mock("../config/db", () => ({}));
jest.mock("../utils/cache", () => ({
  getOrSet: jest.fn(async (_key, _ttl, fetchFn) => fetchFn()),
  invalidate: jest.fn(),
}));

const StoryModel = require("../models/story.model");
const storyController = require("../controllers/story.controller");

const ORIGINAL_AUDIO_PUBLIC_BASE_URL = process.env.AUDIO_PUBLIC_BASE_URL;
const restoreAudioPublicBaseUrl = () => {
  if (ORIGINAL_AUDIO_PUBLIC_BASE_URL === undefined) {
    delete process.env.AUDIO_PUBLIC_BASE_URL;
    return;
  }
  process.env.AUDIO_PUBLIC_BASE_URL = ORIGINAL_AUDIO_PUBLIC_BASE_URL;
};

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("audio story progress writes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restoreAudioPublicBaseUrl();
  });

  afterAll(() => {
    restoreAudioPublicBaseUrl();
  });

  it("rejects a part that does not belong to the story", async () => {
    StoryModel.getById.mockResolvedValue({
      id: 12,
      slug: "story-12",
    });
    StoryModel.getAudioPartByIdAndStory.mockResolvedValue(null);

    const req = {
      params: { id: "12" },
      body: { last_part_id: "99" },
      user: { id: 7 },
    };
    const res = createResponse();

    await storyController.saveStoryAudioProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(StoryModel.saveAudioProgress).not.toHaveBeenCalled();
  });

  it("returns saved progress for a valid story and part pair", async () => {
    StoryModel.getById.mockResolvedValue({
      id: 12,
      slug: "story-12",
    });
    const getAudioPartSpy = StoryModel.getAudioPartByIdAndStory.mockResolvedValue({
      id: 21,
      truyen_id: 12,
      video_id: 501,
      part_number: 2,
      audio_url: null,
    });
    const saveProgressSpy = StoryModel.saveAudioProgress.mockResolvedValue({
      user_id: 7,
      truyen_id: 12,
      last_part_id: 21,
      updated_at: "2026-03-24 08:00:00",
      part_number: 2,
      audio_url: null,
      r2_key: "audio/progress/user-7/story-12-part-2.mp3",
      video_id: 501,
      youtube_video_id: "yt-501",
      video_index: 1,
    });

    const req = {
      params: { id: "12" },
      body: { last_part_id: "21" },
      user: { id: 7 },
    };
    const res = createResponse();

    await storyController.saveStoryAudioProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(getAudioPartSpy).toHaveBeenCalledWith(21, 12);
    expect(saveProgressSpy).toHaveBeenCalledWith(7, 12, 21);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      progress: {
        user_id: 7,
        truyen_id: 12,
        last_part_id: 21,
        updated_at: "2026-03-24 08:00:00",
        part_number: 2,
        audio_url: "https://audio.truyenviethay.id.vn/audio/progress/user-7/story-12-part-2.mp3",
        video_id: 501,
        youtube_video_id: "yt-501",
        video_index: 1,
      },
    });
  });

  it("rejects invalid ids before hitting persistence", async () => {
    const req = {
      params: { id: "12abc" },
      body: { last_part_id: "21xyz" },
      user: { id: 7 },
    };
    const res = createResponse();

    await storyController.saveStoryAudioProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(StoryModel.getById).not.toHaveBeenCalled();
    expect(StoryModel.getAudioPartByIdAndStory).not.toHaveBeenCalled();
    expect(StoryModel.saveAudioProgress).not.toHaveBeenCalled();
  });

  it("rejects oversized numeric ids before hitting persistence", async () => {
    const hugeId = "9".repeat(309);
    const req = {
      params: { id: hugeId },
      body: { last_part_id: hugeId },
      user: { id: 7 },
    };
    const res = createResponse();

    await storyController.saveStoryAudioProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(StoryModel.getById).not.toHaveBeenCalled();
    expect(StoryModel.getAudioPartByIdAndStory).not.toHaveBeenCalled();
    expect(StoryModel.saveAudioProgress).not.toHaveBeenCalled();
  });

  it.each([null, true, false, []])(
    "rejects non-string coercion values before hitting persistence: %p",
    async (badValue) => {
      const req = {
        params: { id: badValue },
        body: { last_part_id: badValue },
        user: { id: 7 },
      };
      const res = createResponse();

      await storyController.saveStoryAudioProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(StoryModel.getById).not.toHaveBeenCalled();
      expect(StoryModel.getAudioPartByIdAndStory).not.toHaveBeenCalled();
      expect(StoryModel.saveAudioProgress).not.toHaveBeenCalled();
    },
  );

  it("uses AUDIO_PUBLIC_BASE_URL when returning saved progress fallback urls", async () => {
    process.env.AUDIO_PUBLIC_BASE_URL = "https://media.example.com";

    StoryModel.getById.mockResolvedValue({
      id: 12,
      slug: "story-12",
    });
    StoryModel.getAudioPartByIdAndStory.mockResolvedValue({
      id: 21,
      truyen_id: 12,
      video_id: 501,
      part_number: 2,
      audio_url: null,
    });
    StoryModel.saveAudioProgress.mockResolvedValue({
      user_id: 7,
      truyen_id: 12,
      last_part_id: 21,
      updated_at: "2026-03-24 08:00:00",
      part_number: 2,
      audio_url: null,
      r2_key: "audio/progress/user-7/story-12-part-2.mp3",
      video_id: 501,
      youtube_video_id: "yt-501",
      video_index: 1,
    });

    const req = {
      params: { id: "12" },
      body: { last_part_id: "21" },
      user: { id: 7 },
    };
    const res = createResponse();

    await storyController.saveStoryAudioProgress(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      progress: {
        user_id: 7,
        truyen_id: 12,
        last_part_id: 21,
        updated_at: "2026-03-24 08:00:00",
        part_number: 2,
        audio_url: "https://media.example.com/audio/progress/user-7/story-12-part-2.mp3",
        video_id: 501,
        youtube_video_id: "yt-501",
        video_index: 1,
      },
    });
  });
});
