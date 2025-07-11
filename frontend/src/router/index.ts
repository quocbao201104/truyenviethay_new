import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import StoryListView from "@/modules/storyText/views/StoryListView.vue";
import CategoryView from "@/views/CategoryView.vue";
import ProfileView from "@/views/ProfileView.vue";

// Import ProfileSettingsView vì bạn muốn làm việc với trang này
import ProfileSettingsView from "@/views/ProfileSettingsView.vue";

import { useAuthStore } from "@/modules/auth/auth.store";

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
    path: "/the-loai",
    name: "Categories",
    component: CategoryView,
  },
  {
    path: "/the-loai/:id",
    name: "StoriesByCategory",
    component: StoryListView,
    props: true,
  },
  {
    path: "/user/thong-tin-ca-nhan",
    name: "Profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  // BỎ COMMENT ROUTE NÀY để có thể truy cập trang /user/cai-dat-thong-tin
  {
    path: "/user/cai-dat-thong-tin",
    name: "ProfileSettings",
    component: ProfileSettingsView, // Sử dụng component đã import
    meta: { requiresAuth: true },
  },
  // GIỮ NGUYÊN COMMENT TẤT CẢ CÁC ROUTES DƯỚI ĐÂY
  /*
  {
    path: "/user/truyen-theo-doi",
    name: "UserFollowedStories",
    component: () => import("@/views/UserFollowedStoriesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/user/lich-su-doc",
    name: "UserReadingHistory",
    component: () => import("@/views/UserReadingHistoryView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dang-truyen",
    name: "SubmitStory",
    component: () => import("@/views/SubmitStoryView.vue"),
    meta: { requiresAuth: true, requiredRole: ['author', 'admin'] },
  },
  {
    path: "/admin/quan-ly-nguoi-dung",
    name: "AdminManageUsers",
    component: () => import("@/views/AdminManageUsersView.vue"),
    meta: { requiresAuth: true, requiredRole: ['admin'] },
  },
  {
    path: "/admin/quan-ly-truyen",
    name: "AdminManageStories",
    component: () => import("@/views/AdminManageStoriesView.vue"),
    meta: { requiresAuth: true, requiredRole: ['admin'] },
  },
  {
    path: "/user/quan-ly-truyen",
    name: "AuthorManageStories",
    component: () => import("@/views/AuthorManageStoriesView.vue"),
    meta: { requiresAuth: true, requiredRole: ['author'] },
  },
  */
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.matched.some(record => record.meta.requiredRole) ? to.meta.requiredRole : null;

  if (requiresAuth && !authStore.isLoggedIn) {
    next('/dang-nhap');
  } else if (requiresAuth && authStore.isLoggedIn && requiredRole) {
    if (!authStore.user || (Array.isArray(requiredRole) && !requiredRole.includes(authStore.user.role))) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;