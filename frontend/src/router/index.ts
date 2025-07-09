import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";

// Khai báo kiểu rõ ràng cho routes
const routes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/dang-nhap", name: "Login", component: LoginView },
  {
    path: "/dang-ky",
    name: "Register",
    component: () => import("@/views/RegisterView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
