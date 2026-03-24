import { prefetchStoryAudioBySlug, prefetchAudioStories } from "@/modules/storyAudio/storyAudio.service";
import { prefetchPublicStories, prefetchStoryBySlug } from "@/modules/storyText/story.service";

const warmedKeys = new Set<string>();

const warmOnce = (key: string, loader: () => Promise<void>) => {
  if (warmedKeys.has(key)) return;

  warmedKeys.add(key);

  void loader().catch(() => {
    // Keep prefetch best-effort and retryable on the next interaction.
    warmedKeys.delete(key);
  });
};

export const prefetchStoryListExperience = () => {
  warmOnce("route:story-list", async () => {
    await Promise.all([
      import("@/modules/storyText/views/StoryListView.vue").then(() => undefined),
      prefetchPublicStories({ page: 1, limit: 20 }),
    ]);
  });
};

export const prefetchAudioListExperience = () => {
  warmOnce("route:audio-list", async () => {
    await Promise.all([
      import("@/modules/storyAudio/views/StoryAudioView.vue").then(() => undefined),
      prefetchAudioStories({ page: 1, limit: 10 }),
    ]);
  });
};

export const prefetchSearchExperience = () => {
  warmOnce("route:search", async () => {
    await import("@/views/SearchView.vue").then(() => undefined);
  });
};

export const prefetchStoryDetailExperience = (slug?: string | null) => {
  if (!slug) return;

  warmOnce(`route:story-detail:${slug}`, async () => {
    await Promise.all([
      import("@/views/StoryDetailView.vue").then(() => undefined),
      prefetchStoryBySlug(slug),
    ]);
  });
};

export const prefetchAudioDetailExperience = (slug?: string | null) => {
  if (!slug) return;

  warmOnce(`route:audio-detail:${slug}`, async () => {
    await Promise.all([
      import("@/modules/storyAudio/views/StoryAudioDetailView.vue").then(() => undefined),
      prefetchStoryAudioBySlug(slug),
    ]);
  });
};
