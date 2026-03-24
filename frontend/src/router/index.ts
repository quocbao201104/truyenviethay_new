import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const HomeView = () => import("../views/HomeView.vue");
const LoginView = () => import("../views/LoginView.vue");
const RegisterView = () => import("@/views/RegisterView.vue");
const StoryListView = () => import("@/modules/storyText/views/StoryListView.vue");
const StoryAudioView = () => import("@/modules/storyAudio/views/StoryAudioView.vue");
const StoryAudioDetailView = () => import("@/modules/storyAudio/views/StoryAudioDetailView.vue");
const CategoryView = () => import("@/views/CategoryView.vue");
const ProfileView = () => import("@/views/ProfileView.vue");
const ProfileSettingsView = () => import("@/views/ProfileSettingsView.vue");
const AdminUserManagementView = () => import("@/views/admin/AdminUserManagementView.vue");
const AdminStoryManagementView = () => import("@/views/admin/AdminStoryManagementView.vue");
const AdminDashboardView = () => import("@/views/admin/AdminDashboardView.vue");
const SubmitStoryView = () => import("@/views/SubmitStoryView.vue");
const FavoritesView = () => import("@/views/FavoritesView.vue");
const HistoryView = () => import("@/views/HistoryView.vue");
const TopView = () => import("@/views/TopView.vue");
const SearchView = () => import("@/views/SearchView.vue");
const RankingView = () => import("@/views/RankingView.vue");
const TasksView = () => import("@/views/TasksView.vue");
const AuthorProfileView = () => import("@/views/AuthorProfileView.vue");
const FollowedAuthorsView = () => import("@/views/FollowedAuthorsView.vue");

import { useAuthStore } from "@/modules/auth/auth.store";
const StoryDetailView = () => import("@/views/StoryDetailView.vue");
const ChapterView = () => import("@/views/ChapterView.vue");
const AuthorChapterManagementView = () => import("@/views/Author/AuthorChapterManagementView.vue");
const AuthorChapterEditor = () => import("@/views/Author/AuthorChapterEditor.vue");
const AuthorDashboardView = () => import("@/views/Author/AuthorDashboardView.vue");
const AuthorApplyView = () => import("@/views/Author/AuthorApplyView.vue");

// Rules & Legal Views
const PrivacyView = () => import("@/views/Rules/PrivacyView.vue");
const TermsView = () => import("@/views/Rules/TermsView.vue");
const CopyrightView = () => import("@/views/Rules/CopyrightView.vue");
const ContactView = () => import("@/views/Rules/ContactView.vue");
const routes: Array<RouteRecordRaw> = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/dang-nhap", name: "Login", component: LoginView },
  {
    path: "/dang-ky",
    name: "Register",
    component: RegisterView,
  },
  {
    path: "/truyen-chu",
    name: "StoryList",
    component: StoryListView,
  },
  {
    path: "/truyen-audio",
    name: "StoryAudioList",
    component: StoryAudioView,
  },
  {
    path: "/truyen-audio/:slug",
    name: "StoryAudioDetail",
    component: StoryAudioDetailView,
  },
  {
    path: "/the-loai",
    name: "Categories",
    component: CategoryView,
  },
  {
    path: "/the_loai/:id",
    name: "StoriesByCategory",
    component: StoryListView,
    props: true,
  },
  {
    path: "/truyen-chu/:slug",
    name: "StoryDetail",
    component: StoryDetailView,
  },
  {
    path: "/truyen-tranh",
    redirect: { name: "StoryAudioList" },
  },
  {
    path: "/truyen-tranh/:slug",
    redirect: { name: "StoryAudioList" },
  },
  {
    path: "/truyen-chu/:storySlug/:chapterSlug",
    name: "ChapterRead",
    component: ChapterView,
  },
  {
    path: "/user/thong-tin-ca-nhan",
    name: "Profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/user/cai-dat-thong-tin",
    name: "ProfileSettings",
    component: ProfileSettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/user/truyen-theo-doi",
    name: "Favorites",
    component: FavoritesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/nhiem-vu",
    name: "Tasks",
    component: TasksView,
    meta: { requiresAuth: true },
  },
  {
    path: "/user/lich-su-doc",
    name: "History",
    component: HistoryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/user/tac-gia-theo-doi",
    name: "FollowedAuthors",
    component: FollowedAuthorsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/truyen-hot",
    name: "TopView",
    component: TopView,
  },
  {
    path: "/xep-hang",
    name: "Ranking",
    component: RankingView,
  },
  {
    path: "/tac-gia/:authorId",
    name: "AuthorProfile",
    component: AuthorProfileView,
  },
  {
    path: "/tim-kiem",
    name: "SearchView",
    component: SearchView,
  },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiredRole: ["admin"] },
  },
  {
    path: "/admin/quan-ly-nguoi-dung",
    name: "AdminManageUsers",
    component: AdminUserManagementView,
    meta: { requiresAuth: true, requiredRole: ["admin"] },
  },
  {
    path: "/user/quan-ly-truyen",
    name: "AuthorStoryManagement",
    component: AuthorDashboardView,
    meta: { requiresAuth: true, requiredRole: ["author", "admin"] },
  },
  {
    path: "/user/dashboard",
    name: "AuthorDashboard",
    component: AuthorDashboardView,
    meta: { requiresAuth: true, requiredRole: ["author", "admin"] },
  },
  {
    path: "/admin/quan-ly-truyen", // New route for Admin Story Management
    name: "AdminManageStories",
    component: AdminStoryManagementView,
    meta: { requiresAuth: true, requiredRole: ["admin"] },
  },
  {
    path: "/dang-truyen/:id?",
    name: "SubmitStory",
    component: SubmitStoryView,
    meta: { requiresAuth: true, requiredRole: ["author", "admin"] },
  },
  {
      path: "/author/story/:storyId/chapters",
      name: "AuthorChapterManagement",
      component: AuthorChapterManagementView,
      meta: { requiresAuth: true, requiredRole: ["author", "admin"] },
  },
  {
      path: "/author/story/:storyId/chapter/add",
      name: "AuthorAddChapter",
      component: AuthorChapterEditor,
      meta: { requiresAuth: true, requiredRole: ["author", "admin"] },
  },
  {
      path: "/author/story/:storyId/chapter/:chapterId/edit",
      name: "AuthorEditChapter",
      component: AuthorChapterEditor,
      meta: { requiresAuth: true, requiredRole: ["author", "admin"] },
  },
  {
    path: "/user/dang-ky-tac-gia",
    name: "AuthorApply",
    component: AuthorApplyView,
    meta: { requiresAuth: true },
  },
  // Rules & Legal Routes
  {
    path: "/chinh-sach-bao-mat",
    name: "Privacy",
    component: PrivacyView,
  },
  {
    path: "/dieu-khoan-su-dung",
    name: "Terms",
    component: TermsView,
  },
  {
    path: "/ban-quyen",
    name: "Copyright",
    component: CopyrightView,
  },
  {
    path: "/lien-he",
    name: "Contact",
    component: ContactView,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (to.name === "StoryDetail" || to.name === "StoryAudioDetail" || to.name === "ChapterRead") {
      return { top: 0 };
    }

    return false; // giữ scroll cho list
  },
});

router.afterEach((to, from) => {
  if (to.name === "ChapterRead") return;
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const app = document.getElementById("app");
    if (app) app.scrollTop = 0;
  });
});

router.beforeEach(async (to, from, next) => {
  // FIX: Blur active element (button/link) before navigation to prevent
  // browser from restoring scroll position to that element on the new page.
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const authStore = useAuthStore();
  
  // Wait for initialization IF it hasn't happened yet
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  const isAuthPage = to.name === "Login" || to.name === "Register";
  if (isAuthPage && authStore.isLoggedIn) {
    return next({
      name: from.fullPath === "/truyen-chu" ? "StoryList" : "Home",
      query: { toast: "already_logged_in" },
    });
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRoles = to.meta.requiredRole as string[] | undefined;

  if (requiresAuth && !authStore.isLoggedIn) {
     // If initialization finished and we are NOT logged in, then redirect
     next({ name: "Login", query: { toast: "session_expired" } });
  } else if (requiresAuth && authStore.isLoggedIn && requiredRoles) {
    if (!authStore.user || !requiredRoles.includes(authStore.user.role)) {
      next({ name: "Home", query: { toast: "unauthorized" } });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
