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
const { getOrSet } = require("../utils/cache");

const ORIGINAL_AUDIO_PUBLIC_BASE_URL = process.env.AUDIO_PUBLIC_BASE_URL;
const restoreAudioPublicBaseUrl = () => {
  if (ORIGINAL_AUDIO_PUBLIC_BASE_URL === undefined) {
    delete process.env.AUDIO_PUBLIC_BASE_URL;
    return;
  }
  process.env.AUDIO_PUBLIC_BASE_URL = ORIGINAL_AUDIO_PUBLIC_BASE_URL;
};

const expectAudioCacheLayers = (storyId) => {
  expect(getOrSet).toHaveBeenCalledTimes(2);
  const cacheCalls = getOrSet.mock.calls.map(([key, ttl, fetchFn]) => ({
    key,
    ttl,
    hasFetchFn: typeof fetchFn === "function",
  }));

  expect(cacheCalls).toEqual(
    expect.arrayContaining([
      {
        key: `storyAudio:meta:id:${storyId}`,
        ttl: 120,
        hasFetchFn: true,
      },
      {
        key: `storyAudio:playlist:id:${storyId}`,
        ttl: 1800,
        hasFetchFn: true,
      },
    ]),
  );
};

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("audio story response", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restoreAudioPublicBaseUrl();
  });

  afterAll(() => {
    restoreAudioPublicBaseUrl();
  });

  it("returns the story description and linked copyright owner for audio detail by slug", async () => {
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
      {
        id: 2,
        video_id: 99,
        truyen_id: 12,
        part_number: 2,
        audio_url: null,
        r2_key: "audio/story-12/part-2.mp3",
        duration_seconds: 95,
        created_at: "2026-03-21 10:05:00",
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
    expectAudioCacheLayers(12);
    const payload = res.json.mock.calls[0][0];
    expect(payload.story).toMatchObject({
      id: 12,
      slug: "truyen-audio-mau",
      ten_truyen: "Truyen Audio Mau",
      tac_gia: "Tac Gia",
      mo_ta: "Mo ta goc cua truyen trong truyen_new.",
      has_audio: true,
      audio_status: "READY",
      source_type: "partner",
      source_partner_id: 7,
      copyright_holder: {
        id: 7,
        name: "Kenh Audio Mau",
        url: "https://youtube.com/@kenhaudiomau",
      },
    });
    expect(payload.audio).toMatchObject({
      total_videos: 1,
      total_parts: 2,
      total_duration_seconds: 215,
    });
    expect(payload.audio.videos[0].parts[1].audio_url).toBe(
      "https://audio.truyenviethay.id.vn/audio/story-12/part-2.mp3"
    );
  });

  it("returns the same audio contract when loading by id", async () => {
    StoryModel.getById.mockResolvedValue({
      id: 31,
      slug: "truyen-audio-id",
      ten_truyen: "Truyen Audio Id",
      tac_gia: "Tac Gia Id",
      anh_bia: "/cover-id.jpg",
      mo_ta: "Mo ta theo id.",
      has_audio: 1,
      audio_status: "READY",
      source_type: "partner",
      source_partner_id: 3,
    });
    StoryModel.getAudioPartsByStoryId.mockResolvedValue([
      {
        id: 10,
        video_id: 501,
        truyen_id: 31,
        part_number: 1,
        audio_url: null,
        r2_key: "audio/story-31/part-1.mp3",
        duration_seconds: 88,
        created_at: "2026-03-22 10:00:00",
        youtube_video_id: "yt-501",
        youtube_playlist_id: "pl-501",
        video_title: "Video 501",
        video_raw_title: "Video 501 raw",
        video_index: 1,
        video_duration_seconds: 180,
        process_status: "done",
        thumbnail: "https://img.example/thumb-501.jpg",
      },
    ]);
    StoryModel.getPartnerById.mockResolvedValue({
      id: 3,
      name: "Kenh Audio Id",
      youtube_url: null,
    });
    StoryModel.getAudioProgressByUserAndStory.mockResolvedValue({
      user_id: 55,
      truyen_id: 31,
      last_part_id: 10,
      updated_at: "2026-03-23 08:00:00",
      part_number: 1,
      audio_url: null,
      r2_key: "audio/progress/user-55/story-31-part-1.mp3",
      video_id: 501,
      youtube_video_id: "yt-501",
      video_index: 1,
    });

    const req = { params: { id: "31" }, user: { id: 55 } };
    const res = createResponse();

    await storyController.getStoryAudioById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expectAudioCacheLayers(31);
    const payload = res.json.mock.calls[0][0];
    expect(payload.story).toMatchObject({
      id: 31,
      slug: "truyen-audio-id",
      ten_truyen: "Truyen Audio Id",
      tac_gia: "Tac Gia Id",
      mo_ta: "Mo ta theo id.",
      has_audio: true,
      audio_status: "READY",
      source_type: "partner",
      source_partner_id: 3,
      copyright_holder: {
        id: 3,
        name: "Kenh Audio Id",
        url: null,
      },
    });
    expect(payload.audio).toMatchObject({
      total_videos: 1,
      total_parts: 1,
      total_duration_seconds: 88,
    });
    expect(payload.audio.videos[0].parts[0].audio_url).toBe(
      "https://audio.truyenviethay.id.vn/audio/story-31/part-1.mp3"
    );
    expect(payload.progress.audio_url).toBe(
      "https://audio.truyenviethay.id.vn/audio/progress/user-55/story-31-part-1.mp3"
    );
  });

  it("uses AUDIO_PUBLIC_BASE_URL when building fallback audio urls", async () => {
    process.env.AUDIO_PUBLIC_BASE_URL = "https://media.example.com";

    StoryModel.getBySlug.mockResolvedValue({
      id: 44,
      slug: "truyen-audio-env",
      ten_truyen: "Truyen Audio Env",
      tac_gia: "Tac Gia Env",
      anh_bia: "/cover-env.jpg",
      mo_ta: "Mo ta env.",
      has_audio: 1,
      audio_status: "READY",
      source_type: "partner",
      source_partner_id: 9,
    });
    StoryModel.getAudioPartsByStoryId.mockResolvedValue([
      {
        id: 12,
        video_id: 707,
        truyen_id: 44,
        part_number: 1,
        audio_url: null,
        r2_key: "audio/story-44/part-1.mp3",
        duration_seconds: 101,
        created_at: "2026-03-24 10:00:00",
        youtube_video_id: "yt-707",
        youtube_playlist_id: "pl-707",
        video_title: "Video 707",
        video_raw_title: "Video 707 raw",
        video_index: 1,
        video_duration_seconds: 101,
        process_status: "done",
        thumbnail: "https://img.example/thumb-707.jpg",
      },
    ]);
    StoryModel.getPartnerById.mockResolvedValue({
      id: 9,
      name: "Kenh Audio Env",
      youtube_url: null,
    });

    const req = { params: { slug: "truyen-audio-env" }, user: null };
    const res = createResponse();

    await storyController.getStoryAudioBySlug(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.audio.videos[0].parts[0].audio_url).toBe(
      "https://media.example.com/audio/story-44/part-1.mp3"
    );
  });
});
