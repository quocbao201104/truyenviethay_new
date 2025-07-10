import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import StoryListView from "@/modules/storyText/views/StoryListView.vue";
import CategoryView from "@/views/CategoryView.vue"; // Import CategoryView

// Khai báo kiểu rõ ràng cho routes
const routes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/dang-nhap", name: "Login", component: LoginView },
  {
    path: "/dang-ky",
    name: "Register",
    component: () => import("@/views/RegisterView.vue"),
  },
  {
    path: "/truyen-chu",
    name: "StoryList",
    component: StoryListView,
  },
  {
    path: "/the-loai", // Định nghĩa đường dẫn cho trang thể loại
    name: "Categories",
    component: CategoryView, // Sử dụng component CategoryView
  },
  // Thêm route cho lọc truyện theo thể loại nếu bạn muốn link từ CategoryCard
  {
    path: "/the-loai/:id",
    name: "StoriesByCategory",
    component: () => import("@/modules/storyText/views/StoryListView.vue"), // Hoặc một view mới để hiển thị truyện theo thể loại
    props: true, // Để truyền id từ route params vào component
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;