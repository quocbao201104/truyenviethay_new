<template>
  <div class="dangnhap-container">
    <AppHeader />
    <main class="main-content">
      <LoginForm
        :key="formKey"
        @submit-login="handleApiLogin"
      />
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import LoginForm from "@/modules/auth/LoginForm.vue";
import { useAuthStore } from "../modules/auth/auth.store";

export default {
  name: "LoginView",
  components: {
    AppHeader,
    LoginForm,
  },
  setup() {
    // Không cần ref serverError và successMessage ở đây nữa
    const router = useRouter();
    const authStore = useAuthStore();
    const formKey = ref(0); // Vẫn giữ formKey nếu bạn muốn buộc render lại form

    const handleApiLogin = async (loginData) => {
      // Không cần reset serverError và successMessage ở đây nữa
      try {
        await authStore.login(loginData);
        // Toast message đã được xử lý trong auth.store.ts
        formKey.value += 1; // Cập nhật key để reset form nếu cần

        setTimeout(() => {
          router.push("/truyen-chu");
        }, 1500);
      } catch (error) {
        // Lỗi đã được xử lý bằng toast trong auth.store.ts
        // Chỉ console.error để debug nếu cần
        console.error("Lỗi khi đăng nhập:", error);
        formKey.value += 1; // Cập nhật key để reset form nếu cần
      }
    };

    return {
      // Không cần trả về serverError và successMessage nữa
      handleApiLogin,
      formKey,
    };
  },
};
</script>

<style scoped>
/* Giữ nguyên CSS cũ */
.dangnhap-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
}

.main-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}
</style>