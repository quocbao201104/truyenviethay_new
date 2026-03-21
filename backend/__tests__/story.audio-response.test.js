jest.mock("../models/story.model", () => ({
  getBySlug: jest.fn(),
  getById: jest.fn(),
  getAudioPartsByStoryId: jest.fn(),
  getAudioProgressByUserAndStory: jest.fn(),
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
const cache = require("../utils/cache");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("audio story response", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the story description and linked copyright owner for audio detail", async () => {
    StoryModel.getBySlug.mockResolvedValue({
      id: 12,
      slug: "truyen-audio-mau",
      ten_truyen: "Truyen Audio Mau",
      tac_gia: "Tac Gia",
      anh_bia: "/cover.jpg",
      mo_ta: "Mo ta goc cua truyen trong truyen_new.",
      has_audio: 1,
      audio_status: "READY",
      source_type: "partner",
      source_partner_id: 7,
    });
    StoryModel.getAudioPartsByStoryId.mockResolvedValue([
      {
        id: 1,
        video_id: 99,
        truyen_id: 12,
        part_number: 1,
        audio_url: "https://audio.example/1.mp3",
        duration_seconds: 120,
        created_at: "2026-03-21 10:00:00",
        youtube_video_id: "abc123",
        youtube_playlist_id: "pl123",
        video_title: "Tap 1",
        video_raw_title: "Tap 1 raw",
        video_index: 1,
        video_duration_seconds: 120,
        process_status: "done",
        thumbnail: "https://img.example/thumb.jpg",
      },
    ]);
    StoryModel.getPartnerById.mockResolvedValue({
      id: 7,
      name: "Kenh Audio Mau",
      youtube_url: "https://youtube.com/@kenhaudiomau",
    });

    const req = { params: { slug: "truyen-audio-mau" }, user: null };
    const res = createResponse();

    await storyController.getStoryAudioBySlug(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.story.mo_ta).toBe("Mo ta goc cua truyen trong truyen_new.");
    expect(payload.story.copyright_holder).toEqual({
      id: 7,
      name: "Kenh Audio Mau",
      url: "https://youtube.com/@kenhaudiomau",
    });
    expect(cache.getOrSet).toHaveBeenCalledTimes(2);
    expect(cache.getOrSet.mock.calls[0][0]).toBe("storyAudio:meta:id:12");
    expect(cache.getOrSet.mock.calls[1][0]).toBe("storyAudio:playlist:id:12");
  });
});
