<template>
  <div class="dangnhap-container">
    <AppHeader />
    <main class="main-content">
      <!-- Buộc render lại LoginForm khi cần -->
      <LoginForm
        :key="formKey"
        @submit-login="handleApiLogin"
        :server-error="serverError"
        :success-message="successMessage"
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
    const serverError = ref("");
    const successMessage = ref("");
    const router = useRouter();
    const authStore = useAuthStore();
    const formKey = ref(0);

    const handleApiLogin = async (loginData) => {
      serverError.value = "";
      successMessage.value = "";

      try {
        await authStore.login(loginData);
        successMessage.value = "Đăng nhập thành công! Đang chuyển hướng...";
        formKey.value += 1;

        setTimeout(() => {
          router.push("/truyen-chu");
        }, 1500);
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        serverError.value =
          error.message || "Tài khoản hoặc mật khẩu không đúng.";
        formKey.value += 1;
      }
    };

    return {
      serverError,
      successMessage,
      handleApiLogin,
      formKey,
    };
  },
};
</script>

<style scoped>
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
