<!-- src/App.vue -->
<template>
  <div v-if="authStore.isInitialLoading" class="app-loading">
    <div class="loader-container">
      <div class="loader"></div>
      <p>Đang tải dữ liệu...</p>
    </div>
  </div>
  <MainLayout v-else>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </MainLayout>
</template>

<script setup>
import MainLayout from "./layouts/MainLayout.vue";
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from "@unhead/vue";
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/modules/auth/auth.store';
import { useSocket } from '@/composables/useSocket';
import {
  defaultOgImage,
  getFirstQueryValue,
  sanitizeRouteQuery,
  toCanonicalUrl,
  toCanonicalUrlWithQuery,
  toPositiveInteger,
} from "@/seo/site";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { connect, disconnect } = useSocket();
const { showSuccessToast, showErrorToast, showWarningToast } = useAppToast();

const baseTitle = "TruyenVietHay";
const defaultDescription =
  "Đọc truyện chữ và nghe truyện audio miễn phí tại TruyenVietHay. Cập nhật chương mới mỗi ngày.";
const noIndexRouteNames = new Set([
  "Login",
  "Register",
  "Profile",
  "ProfileSettings",
  "Favorites",
  "Tasks",
  "History",
  "FollowedAuthors",
  "AdminDashboard",
  "AdminManageUsers",
  "AdminManageStories",
  "AuthorStoryManagement",
  "AuthorDashboard",
  "SubmitStory",
  "AuthorChapterManagement",
  "AuthorAddChapter",
  "AuthorEditChapter",
  "AuthorApply",
  "SearchView",
  "NotFound",
]);

const routeFallbackTitle = computed(() => {
  const titleMap = {
    Home: "Đọc Truyện Chữ & Nghe Truyện Audio Miễn Phí",
    StoryList: "Truyện Chữ Mới Cập Nhật",
    StoryAudioList: "Truyện Audio Mới Cập Nhật",
    Categories: "Thể Loại Truyện",
    TopView: "Truyện Hot",
    Ranking: "Bảng Xếp Hạng Truyện",
  };

  const routeName = String(route.name || "");
  const pageTitle = titleMap[routeName];
  return pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
});

const shouldIndexRoute = computed(() => {
  const routeName = String(route.name || "");
  return !noIndexRouteNames.has(routeName);
});

const routeSeoPolicy = computed(() => {
  const routeName = String(route.name || "");
  const sanitizedQuery = sanitizeRouteQuery(route.query || {});
  const page = toPositiveInteger(sanitizedQuery.page, 1);

  if (routeName === "SearchView") {
    return {
      canonicalHref: toCanonicalUrl("/tim-kiem"),
      robots: "noindex, follow",
    };
  }

  if (routeName === "StoryAudioList") {
    const hasFilterQuery =
      Boolean(getFirstQueryValue(sanitizedQuery.sort)) ||
      Boolean(getFirstQueryValue(sanitizedQuery.status)) ||
      Boolean(getFirstQueryValue(sanitizedQuery.genres));

    const canonicalQuery = {};
    if (page > 1) canonicalQuery.page = page;

    return {
      canonicalHref: toCanonicalUrlWithQuery("/truyen-audio", canonicalQuery),
      robots: hasFilterQuery || page > 1 ? "noindex, follow" : "index, follow",
    };
  }

  if (routeName === "Categories") {
    const rawCategories = getFirstQueryValue(sanitizedQuery.categories);
    const selectedCategories = rawCategories
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isInteger(value) && value > 0);

    const hasSortQuery =
      Boolean(getFirstQueryValue(sanitizedQuery.sort)) &&
      getFirstQueryValue(sanitizedQuery.sort) !== "thoi_gian_cap_nhat";

    const hasSingleCategory = selectedCategories.length === 1;
    const hasMultiCategory = selectedCategories.length > 1;

    const canonicalQuery = {};
    if (hasSingleCategory) canonicalQuery.categories = selectedCategories[0];
    if (page > 1) canonicalQuery.page = page;

    return {
      canonicalHref: toCanonicalUrlWithQuery("/the-loai", canonicalQuery),
      robots: hasSortQuery || hasMultiCategory || page > 1 ? "noindex, follow" : "index, follow",
    };
  }

  if (routeName === "StoriesByCategory") {
    const categoryId = Number.parseInt(String(route.params.id || ""), 10);
    const canonicalQuery = Number.isInteger(categoryId) && categoryId > 0
      ? { categories: categoryId }
      : {};

    return {
      canonicalHref: toCanonicalUrlWithQuery("/the-loai", canonicalQuery),
      robots: "noindex, follow",
    };
  }

  return {
    canonicalHref: toCanonicalUrl(route.path || "/"),
    robots: shouldIndexRoute.value ? "index, follow" : "noindex, follow",
  };
});

const canonicalUrl = computed(() => routeSeoPolicy.value.canonicalHref);
const robotsMeta = computed(() => routeSeoPolicy.value.robots);

useHead(() => ({
  title: routeFallbackTitle.value,
  htmlAttrs: { lang: "vi" },
  link: [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
  meta: [
    {
      name: "description",
      content: defaultDescription,
    },
    {
      name: "robots",
      content: robotsMeta.value,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:site_name",
      content: baseTitle,
    },
    {
      property: "og:locale",
      content: "vi_VN",
    },
    {
      property: "og:title",
      content: routeFallbackTitle.value,
    },
    {
      property: "og:description",
      content: defaultDescription,
    },
    {
      property: "og:url",
      content: canonicalUrl.value,
    },
    {
      property: "og:image",
      content: defaultOgImage,
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: routeFallbackTitle.value,
    },
    {
      name: "twitter:description",
      content: defaultDescription,
    },
    {
      name: "twitter:image",
      content: defaultOgImage,
    },
  ],
}));

// Initialize socket when user is logged in
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    connect();
  } else {
    disconnect();
  }
}, { immediate: true });

watch(() => route.query.toast, (toastType) => {
  if (!toastType) return;

  const toastMap = {
    'session_expired': { type: 'error', msg: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
    'unauthorized': { type: 'error', msg: 'Bạn không có quyền truy cập trang này.' },
    'already_logged_in': { type: 'warning', msg: 'Bạn đang đăng nhập. Vội thế nhà bạn có cỗ à.' },
  };

  const notification = toastMap[toastType];
  if (notification) {
     if (notification.type === 'error') showErrorToast(notification.msg);
     else if (notification.type === 'warning') showWarningToast(notification.msg);
     else showSuccessToast(notification.msg);
     
     // Remove query param to clean URL
     const query = { ...route.query };
     delete query.toast;
     router.replace({ query }); 
  }
});
</script>

<style>
/* Reset CSS */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background: var(--app-bg);
}

#app {
  font-family: 'Be Vietnam Pro', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: transparent;
  color: var(--app-text);
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

/* Premium Loading Screen */
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--app-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-container {
  text-align: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--app-accent);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  margin-bottom: 1rem;
}

.loader-container p {
  color: var(--app-accent);
  font-weight: 500;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Global Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
