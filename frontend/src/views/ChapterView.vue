<template>
  <div class="chapter-view-xianxia" :class="{ 'light-aura': !isDarkMode }">
    <div class="fixed top-0 left-0 w-full z-1000">
      <div
        class="h-[3px] bg-linear-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-transform duration-300 progress-bar"
        :style="{ transform: `scaleX(${scrollProgress / 100})` }"
      />
    </div>

    <button 
      class="mobile-bubble-btn" 
      :class="{ 'hide-bubble': isScrollingDown && !isMobileControlOpen }"
      @click="isMobileControlOpen = !isMobileControlOpen"
    >
      <i class="fas" :class="isMobileControlOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'"></i>
    </button>

    <main class="reading-spirit-wrapper">
      <header class="chapter-spirit-header animate-fadeIn">
        <router-link
          :to="`/truyen-chu/${$route.params.storySlug}?tab=chapters`"
          class="story-name-link"
        >
          <i class="fas fa-book-journal-whills mr-2"></i>
          {{ chapter?.truyen?.ten_truyen }}
        </router-link>

        <h1 class="chapter-title-glow" :class="{ 'title-ready': titleReady }">
          {{ chapterTitle }}
        </h1>
        
        <div class="header-divider-spirit">
          <div class="dot"></div>
        </div>
      </header>

      <div 
        class="spirit-control-bar" 
        :class="{ 
          'hide-bar': isScrollingDown && !isMobileControlOpen,
          'mobile-active': isMobileControlOpen 
        }"
      >
        <div class="control-section">
          <button @click="prevChapter" :disabled="!hasPrev" title="Tầng trước">
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="chapter-select-wrapper">
            <select @change="handleSelectChapter" :value="chapter?.slug" class="spirit-select xianxia-dropdown">
              <option
                v-for="c in visibleChapters"
                :key="c.id"
                :value="c.slug"
                class="spirit-option"
              >
                {{ c.tieu_de || `Chương ${c.so_chuong}` }}
              </option>
            </select>
          </div>

          <button @click="nextChapter" :disabled="!hasNext" title="Tầng tiếp">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="control-section settings">
          <div class="font-tools">
            <button @click="decreaseFontSize"><i class="fas fa-minus text-[10px]"></i></button>
            <span class="size-val">{{ fontSize }}</span>
            <button @click="increaseFontSize"><i class="fas fa-plus text-[10px]"></i></button>
          </div>

          <select v-model="fontFamily" class="spirit-select-small xianxia-dropdown">
            <option value="font-serif">Cổ Điển</option>
            <option value="font-sans">Hiện Đại</option>
            <option value="font-mono">Mật Pháp</option>
          </select>

          <button @click="toggleTheme" class="aura-toggle" :title="isDarkMode ? 'Hào quang sáng' : 'U minh tối'">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>

      <article
        v-if="contentReady && isHtml"
        class="spirit-content-body animate-fadeIn"
        :class="fontFamily"
        :style="{ fontSize: fontSize + 'px' }"
        v-html="contentHtml"
      />
      <article
        v-else-if="contentReady"
        class="spirit-content-body animate-fadeIn plain-text"
        :class="fontFamily"
        :style="{ fontSize: fontSize + 'px' }"
        v-text="displayText"
      />
      <div v-else class="chapter-loading-placeholder">
        {{ plainMessage || "Đang tải chương..." }}
      </div>

      <div class="chapter-spirit-footer">
        <button @click="prevChapter" :disabled="!hasPrev" class="btn-nav-spirit prev">
          <i class="fas fa-leaf rotate-180"></i>
          <span>Cấp trước</span>
        </button>

        <button @click="nextChapter" :disabled="!hasNext" class="btn-nav-spirit next">
          <span>Đột phá tiếp</span>
          <i class="fas fa-leaf"></i>
        </button>
      </div>
    </main>

    <button v-show="isScrolled" class="spirit-fab" @click="scrollToTop">
      <i class="fas fa-yin-yang animate-spin-slow"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref, onBeforeUnmount, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { useChapterStore } from "@/modules/storyText/chapter/chapter.store";
import { saveReadingHistory } from "@/modules/history/history.service";
import { useAuthStore } from "@/modules/auth/auth.store";
import { getChapterBySlug, getChapterById, type Chapter } from "@/modules/storyText/chapter/chapter.service";
import { buildChapterCdnUrl } from "@/utils/chapterCdn";
import { formatChapterContent } from "@/utils/chapterFormat";
import { defaultOgImage, toCanonicalUrl, truncateText } from "@/seo/site";
import { buildArticleSchema } from "@/seo/schema";

const route = useRoute();
const router = useRouter();
const store = useChapterStore();

const chapterMeta = shallowRef<Chapter | null>(null);
const chapter = computed(() => chapterMeta.value);
const chapterList = computed(() => store.chapterList);

const fontSize = ref(Number(localStorage.getItem('reading-font-size')) || 22);
const fontFamily = ref(localStorage.getItem('reading-font-family') || "font-serif");
const isDarkMode = ref(localStorage.getItem('reading-theme') !== 'light');

const chapterContent = shallowRef<string>("");
const contentHtml = shallowRef<string>("");
const plainMessage = shallowRef<string>("");
const contentLoaded = ref(false);
const contentReady = ref(false);
const titleReady = ref(false);
let activeRequestId = 0;

// Mobile Bubble State
const isMobileControlOpen = ref(false);

const scrollProgress = ref(0);
const isScrolled = ref(false);
const lastScrollTop = ref(0);
const isScrollingDown = ref(false);

// View Tracking logic
const isViewCounted = ref(false);
let viewTimer: ReturnType<typeof setTimeout> | null = null;

const triggerViewIncrement = () => {
  if (isViewCounted.value || !chapter.value?.id || !contentLoaded.value) return;
  isViewCounted.value = true;
  store.incrementView(chapter.value.id);
  if (viewTimer) clearTimeout(viewTimer);
};

const startViewTimer = () => {
  if (viewTimer) clearTimeout(viewTimer);
  isViewCounted.value = false;
  viewTimer = setTimeout(() => {
    triggerViewIncrement();
  }, 15000); // 15 seconds
};

watch([fontSize, fontFamily], () => {
  localStorage.setItem('reading-font-size', fontSize.value.toString());
  localStorage.setItem('reading-font-family', fontFamily.value);
});

watch(isDarkMode, (newValue) => {
  localStorage.setItem('reading-theme', newValue ? 'dark' : 'light');
});

// Tự động đóng bong bóng khi cuộn xuống
watch(isScrollingDown, (down) => {
  if (down) isMobileControlOpen.value = false;
});

const increaseFontSize = () => { if (fontSize.value < 40) fontSize.value += 2; };
const decreaseFontSize = () => { if (fontSize.value > 14) fontSize.value -= 2; };
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };

const chapterTitle = computed(() => {
  if (!chapter.value?.tieu_de) return "";
  return chapter.value.tieu_de.replace(/<\/?[^>]+(>|$)/g, "").trim();
});

const chapterCanonicalPath = computed(() => {
  const storySlug = chapter.value?.truyen?.slug || (route.params.storySlug as string);
  const chapterSlug = chapter.value?.slug || (route.params.chapterSlug as string);
  if (!storySlug || !chapterSlug) return route.path;
  return `/truyen-chu/${storySlug}/${chapterSlug}`;
});

const chapterCanonicalUrl = computed(() => toCanonicalUrl(chapterCanonicalPath.value));

const chapterMetaTitle = computed(() => {
  const chapterName = chapterTitle.value || "Đọc chương truyện";
  const storyName = chapter.value?.truyen?.ten_truyen;
  if (!storyName) return `${chapterName} | TruyenVietHay`;
  return `${chapterName} - ${storyName} | TruyenVietHay`;
});

const chapterMetaDescription = computed(() => {
  const storyName = chapter.value?.truyen?.ten_truyen || "truyện chữ";
  const text = chapterContent.value || plainMessage.value || "";
  const excerpt = truncateText(text.replace(/\s+/g, " ").trim(), 145);
  return excerpt || `Đọc ${chapterTitle.value || "chương mới"} của ${storyName} tại TruyenVietHay.`;
});

useHead(() => ({
  title: chapterMetaTitle.value,
  link: [
    {
      rel: "canonical",
      href: chapterCanonicalUrl.value,
    },
  ],
  meta: [
    { name: "description", content: chapterMetaDescription.value },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: chapterMetaTitle.value },
    { property: "og:description", content: chapterMetaDescription.value },
    { property: "og:url", content: chapterCanonicalUrl.value },
    { property: "og:image", content: defaultOgImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: chapterMetaTitle.value },
    { name: "twitter:description", content: chapterMetaDescription.value },
    { name: "twitter:image", content: defaultOgImage },
  ],
  script: chapter.value?.slug && chapter.value?.truyen?.slug
    ? [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildArticleSchema({
              chapterTitle: chapterTitle.value || (route.params.chapterSlug as string) || "Đọc chương",
              chapterSlug: chapter.value.slug,
              storyName: chapter.value.truyen?.ten_truyen || "",
              storySlug: chapter.value.truyen.slug,
            }),
          ),
        },
      ]
    : [],
}));

const isHtml = computed(() => /<\/?[a-z][\s\S]*>/i.test(chapterContent.value || ""));
const displayText = computed(() => chapterContent.value || plainMessage.value);

const updateContentHtml = () => {
  contentHtml.value = isHtml.value ? (chapterContent.value || "") : "";
};

const showContentLater = () => {
  contentReady.value = false;
  const run = () => {
    contentReady.value = true;
  };
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(run);
  } else {
    requestAnimationFrame(run);
  }
};

const scheduleTitleReady = () => {
  titleReady.value = false;
  requestAnimationFrame(() => {
    titleReady.value = true;
  });
};

let scrollRafId = 0;
const handleScroll = () => {
  if (scrollRafId) return;
  scrollRafId = requestAnimationFrame(() => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollProgress.value = height > 0 ? (winScroll / height) * 100 : 0;
    isScrolled.value = winScroll > 600;

    if (winScroll > lastScrollTop.value && winScroll > 150) {
        isScrollingDown.value = true;
    } else {
        isScrollingDown.value = false;
    }
    
    // Trigger view if scrolled significantly (300px)
    if (contentLoaded.value && winScroll > 300 && !isViewCounted.value) {
      triggerViewIncrement();
    }

    lastScrollTop.value = winScroll <= 0 ? 0 : winScroll;
    scrollRafId = 0;
  });
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
const resetScrollPosition = () => {
  window.scrollTo({ top: 0, behavior: "auto" });
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  const app = document.getElementById("app");
  if (app) app.scrollTop = 0;
  scrollProgress.value = 0;
  isScrolled.value = false;
  isScrollingDown.value = false;
  lastScrollTop.value = 0;
};

const currentIndex = computed(() => {
    if (!chapter.value || chapterList.value.length === 0) return -1;
    return chapterList.value.findIndex(c => c.id === chapter.value?.id);
});

const hasPrev = computed(() => !!chapter.value?.navigation?.prev_slug || currentIndex.value > 0);
const hasNext = computed(() => !!chapter.value?.navigation?.next_slug || (currentIndex.value >= 0 && currentIndex.value < chapterList.value.length - 1));
const visibleChapters = computed(() => {
  const list = chapterList.value;
  if (list.length <= 220) return list;
  const idx = currentIndex.value;
  if (idx < 0) return list.slice(0, 220);
  const start = Math.max(0, idx - 110);
  const end = Math.min(list.length, idx + 110);
  return list.slice(start, end);
});

const navigateToChapter = (chapterSlug: string) => {
    router.push(`/truyen-chu/${route.params.storySlug}/${chapterSlug}`);
    isMobileControlOpen.value = false; // Đóng menu sau khi chọn chương
};

const prevChapter = () => {
  if (chapter.value?.navigation?.prev_slug) navigateToChapter(chapter.value.navigation.prev_slug);
  else if (hasPrev.value) navigateToChapter(chapterList.value[currentIndex.value - 1].slug);
};

const nextChapter = () => {
  if (chapter.value?.navigation?.next_slug) navigateToChapter(chapter.value.navigation.next_slug);
  else if (hasNext.value) navigateToChapter(chapterList.value[currentIndex.value + 1].slug);
};

const handleSelectChapter = (event: Event) => navigateToChapter((event.target as HTMLSelectElement).value);

const fetchChapterMeta = async (chapterSlug: string, storySlug: string) => {
  try {
    return await getChapterBySlug(chapterSlug, storySlug);
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 && /^\d+$/.test(chapterSlug)) {
      return await getChapterById(Number(chapterSlug));
    }
    throw err;
  }
};

const loadData = async () => {
  const chapterSlug = route.params.chapterSlug as string;
  const storySlug = route.params.storySlug as string;
  if (chapterSlug && storySlug) {
    // Reset scroll ngay khi chuyển chương để tránh giữ vị trí cũ (đặc biệt khi đang ở cuối trang)
    resetScrollPosition();

    const requestId = ++activeRequestId;
    chapterContent.value = "";
    contentHtml.value = "<p>Đang tải chương...</p>";
    plainMessage.value = "Đang tải chương...";
    contentLoaded.value = false;
    contentReady.value = false;
    if (viewTimer) clearTimeout(viewTimer);
    isViewCounted.value = false;

    try {
      const meta = await fetchChapterMeta(chapterSlug, storySlug);
      if (requestId !== activeRequestId) return;
      chapterMeta.value = meta;
      scheduleTitleReady();

      if (meta) {
        // Save reading history for logged in user
        if (useAuthStore().isLoggedIn) {
          saveReadingHistory(meta.truyen_id, meta.id).catch(err => {
            console.error("Failed to save reading history:", err);
          });
        }
        if (chapterList.value.length === 0 || chapterList.value[0].truyen_id !== meta.truyen_id) {
          await store.fetchChapterList(meta.truyen_id);
        }
      }

      let rawContent = "";
      if (meta?.truyen_id && meta?.id) {
        const cdnUrl = buildChapterCdnUrl(meta.truyen_id, meta.id, meta.content_hash || meta.updated_at);
        const r = await fetch(cdnUrl, { cache: "force-cache" });
        if (!r.ok) throw new Error(`CDN fetch failed (${r.status})`);
        const json = await r.json();
        rawContent = json?.content || "";
      } else if (meta?.content) {
        rawContent = meta.content;
      }

      if (requestId !== activeRequestId) return;
      chapterContent.value = formatChapterContent(rawContent);
      plainMessage.value = "";
      updateContentHtml();
      contentLoaded.value = true;
      showContentLater();
      startViewTimer();

      // Prefetch next chapter in background (warm CDN cache)
      const nextSlug = meta?.navigation?.next_slug;
      if (nextSlug) {
        getChapterBySlug(nextSlug, storySlug)
          .then((nextMeta) => {
            if (nextMeta?.truyen_id && nextMeta?.id) {
              const nextUrl = buildChapterCdnUrl(
                nextMeta.truyen_id,
                nextMeta.id,
                nextMeta.content_hash || nextMeta.updated_at
              );
              fetch(nextUrl, { cache: "force-cache" }).catch(() => {});
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      if (requestId !== activeRequestId) return;
      chapterContent.value = "";
      const status = err?.response?.status;
      contentLoaded.value = false;
      if (viewTimer) clearTimeout(viewTimer);
      if (status === 404) {
        contentHtml.value = "<p>Chương không tồn tại hoặc đã bị ẩn.</p>";
        plainMessage.value = "Chương không tồn tại hoặc đã bị ẩn.";
      } else {
        contentHtml.value = "<p>Không thể tải nội dung chương. Vui lòng thử lại.</p>";
        plainMessage.value = "Không thể tải nội dung chương. Vui lòng thử lại.";
      }
      contentReady.value = true;
      console.error("Chapter load error:", err?.message || err);
    } finally {
      if (requestId === activeRequestId) {
        // No-op: contentHtml already set to final state
      }
    }
  }
};

onMounted(() => {
  loadData();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  if (viewTimer) clearTimeout(viewTimer);
  if (scrollRafId) cancelAnimationFrame(scrollRafId);
});

watch(() => [route.params.chapterSlug, route.params.storySlug], () => {
  loadData();
});
</script>

<style scoped>
/* Typography */
.font-serif { font-family: 'Merriweather', serif; }
.font-sans { font-family: 'Be Vietnam Pro', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.chapter-view-xianxia {
  background: #111927;
  color: var(--app-text-muted);
  min-height: 100vh;
  transition: background-color 0.35s ease, color 0.35s ease;
}

.progress-bar {
  width: 100%;
  transform-origin: left center;
  will-change: transform;
}

.reading-spirit-wrapper {
  max-width: 820px;
  margin: auto;
  padding: 88px 28px 72px;
}

/* Header Spirit */
.chapter-spirit-header {
  text-align: center;
  margin-bottom: 38px;
}

.story-name-link {
  font-size: 0.8rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #63deb7;
  font-weight: 800;
  text-decoration: none;
  opacity: 0.76;
}

.chapter-title-glow {
  font-size: 2.05rem;
  font-weight: 900;
  margin-top: 15px;
  line-height: 1.3;
  color: #f6fbff;
  filter: none;
  font-size-adjust: 0.52;
  min-height: 2.8rem;
  max-width: 17ch;
  margin-left: auto;
  margin-right: auto;
}
.chapter-title-glow.title-ready {
  filter: none;
}

.header-divider-spirit {
  height: 1px; width: 150px; background: linear-gradient(90deg, transparent, rgba(99, 222, 183, 0.75), transparent);
  margin: 25px auto; position: relative;
}
.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 6px; height: 6px; background: #63deb7; box-shadow: none;
}

/* CONTROL BAR - DESKTOP FIX */
.spirit-control-bar {
  position: sticky;
  top: 70px; /* Đẩy xuống để không bị Header chính đè */
  z-index: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(19, 27, 42, 0.86);
  backdrop-filter: none;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  margin-bottom: 38px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 18px rgba(3, 8, 18, 0.14);
}

.spirit-control-bar.hide-bar {
  transform: translateY(-120px);
  opacity: 0;
}

.control-section { display: flex; align-items: center; gap: 10px; }
.control-section button {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(12, 18, 29, 0.8); border: 1px solid rgba(148, 163, 184, 0.12); color: var(--app-text-subtle);
  display: flex; align-items: center; justify-content: center;
}
.control-section button:hover:not(:disabled) { border-color: rgba(99, 222, 183, 0.28); color: #63deb7; }
.control-section button:disabled { opacity: 0.2; }

.spirit-select {
  background: transparent; color: #f8fafc; font-size: 0.85rem; font-weight: 700;
  border: none; max-width: 180px; outline: none; cursor: pointer;
}

.xianxia-dropdown option { background-color: #131b2c !important; color: #cbd5e1 !important; padding: 10px; }

.font-tools {
  display: flex; align-items: center; gap: 8px;
  background: rgba(12, 18, 29, 0.92); padding: 2px 10px; border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.14);
}
.size-val { font-size: 0.75rem; font-weight: 800; color: #63deb7; min-width: 20px; text-align: center; }

.spirit-select-small {
  background: rgba(12, 18, 29, 0.92); border: 1px solid rgba(148, 163, 184, 0.14); border-radius: 999px;
  padding: 6px 12px; color: var(--app-text-muted); font-size: 0.7rem; font-weight: 700;
}

/* MOBILE RESPONSIVE - THANH BAR BONG BÓNG */
.mobile-bubble-btn {
  display: none; /* Ẩn trên desktop */
}

@media (max-width: 640px) {
  /* Bong bóng rút gọn */
  .mobile-bubble-btn {
    display: flex; position: fixed; 
    bottom: 30px; 
    left: 20px; /* [FIX] Đổi từ right: 20px sang left: 20px để tránh đè bong bóng chat */
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(19, 27, 42, 0.96); border: 1px solid rgba(99, 222, 183, 0.24); color: #63deb7;
    z-index: 1001; align-items: center; justify-content: center;
    box-shadow: var(--app-shadow-1);
    transition: all 0.3s ease;
  }
  
  .mobile-bubble-btn.hide-bubble { transform: scale(0); opacity: 0; }

  /* Thanh Bar ngang nổi khi bấm vào bong bóng */
  .spirit-control-bar {
    position: fixed; top: auto; bottom: 90px;
    left: 50%; /* Căn giữa màn hình */
    width: 92%; max-width: 400px;
    flex-direction: column; /* Chia làm 2 dòng */
    padding: 12px 15px; border-radius: 24px; gap: 0;
    
    /* Hiệu ứng ẩn */
    transform: translateX(-50%) translateY(30px) scale(0.9);
    transform-origin: bottom right;
    opacity: 0; pointer-events: none;
    
    background: rgba(19, 27, 42, 0.97);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow-2);
  }

  /* Trạng thái mở */
  .spirit-control-bar.mobile-active {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1; pointer-events: auto;
  }

  .spirit-control-bar.hide-bar { transform: translateX(-50%) translateY(50px); opacity: 0; }

  /* Dòng 1: Chuyển chương */
  .control-section {
    width: 100%; justify-content: space-between;
  }

  /* Rút gọn chữ chương bị dài */
  .chapter-select-wrapper {
    flex: 1; margin: 0 10px; overflow: hidden; display: flex; justify-content: center;
  }
  .spirit-select {
    width: 100%; max-width: 100%; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Dòng 2: Cài đặt (Chia đều hàng ngang) */
  .settings {
    display: flex !important; flex-direction: row;
    width: 100%; justify-content: space-between;
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .font-tools { width: auto; justify-content: center; }
  .spirit-select-small { width: auto; text-align: center; }
}

/* Content Body */
.spirit-content-body {
  max-width: 64ch;
  margin: 0 auto;
  line-height: 2.08;
  color: #d8e4f0;
  text-align: left;
  content-visibility: auto;
  contain: layout paint;
  contain-intrinsic-size: 1000px;
  min-height: 40vh;
}
.spirit-content-body.plain-text { white-space: pre-line; }
.spirit-content-body :deep(p) { margin-bottom: 3rem; text-indent: 1.5em; }
.spirit-content-body :deep(p:first-of-type) { text-indent: 0; }
.spirit-content-body :deep(br + br) { line-height: 2.4; }

.font-serif.spirit-content-body {
  font-size-adjust: 0.52;
  letter-spacing: 0.01em;
}

.font-sans.spirit-content-body {
  letter-spacing: 0.01em;
}

.font-mono.spirit-content-body {
  line-height: 1.9;
}

@media (min-width: 1024px) {
  .spirit-content-body { text-align: justify; }
}

.chapter-loading-placeholder {
  min-height: 40vh;
  padding: 12px 0;
  opacity: 0.76;
  max-width: 64ch;
  margin: 0 auto;
}

/* Footer Nav */
.chapter-spirit-footer {
  display: flex; justify-content: space-between; margin-top: 84px;
  padding-top: 28px; border-top: 1px solid rgba(148, 163, 184, 0.14);
  max-width: 64ch;
  margin-left: auto;
  margin-right: auto;
}
.btn-nav-spirit {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px;
  border-radius: 999px; font-weight: 800; font-size: 0.78rem;
  text-transform: uppercase; transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; border: none; cursor: pointer;
}
.btn-nav-spirit.prev { background: rgba(19, 27, 42, 0.94); border: 1px solid rgba(148, 163, 184, 0.14); color: var(--app-text-muted); }
.btn-nav-spirit.next { background: linear-gradient(135deg, #46c89c, #5fd7ad); color: #08111a; }

/* FAB */
.spirit-fab {
  position: fixed; bottom: 90px; right: 20px;
  width: 50px; height: 50px; border-radius: 50%;
  background: rgba(19, 27, 42, 0.94); border: 1px solid rgba(99, 222, 183, 0.24); color: #63deb7;
  font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  box-shadow: var(--app-shadow-1);
}

/* LIGHT MODE */
.light-aura { background: #eef3f8; color: #334155; }
.light-aura .chapter-title-glow { color: #0f172a; }
.light-aura .spirit-control-bar { background: rgba(255,255,255,0.92); border-color: rgba(148, 163, 184, 0.26); box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08); }
.light-aura .spirit-content-body { color: #243142; }
.light-aura .story-name-link { color: #0f766e; }
.light-aura .spirit-select,
.light-aura .spirit-select-small,
.light-aura .control-section button,
.light-aura .font-tools,
.light-aura .btn-nav-spirit.prev,
.light-aura .spirit-fab,
.light-aura .mobile-bubble-btn {
  color: #334155;
  background: rgba(255,255,255,0.92);
  border-color: rgba(148, 163, 184, 0.22);
}

.light-aura .size-val {
  color: #0f766e;
}

@media (prefers-reduced-transparency: reduce) {
  .spirit-control-bar { backdrop-filter: none; }
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 1s ease-out; }
.animate-spin-slow { animation: spin 12s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
