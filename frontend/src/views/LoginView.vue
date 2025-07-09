<template>
  <div class="dangnhap-container">
    <AppHeader />
    <main class="main-content">
      <!-- THAY ĐỔI: Thêm :key="formKey" để buộc component render lại -->
      <LoginForm 
        :key="formKey"
        @submitLogin="handleApiLogin"
        :serverError="serverError"
        :successMessage="successMessage"
      />
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from "@/components/layout/AppHeader.vue";
import LoginForm from "@/modules/auth/LoginForm.vue";
import { useAuthStore } from '@/modules/auth/auth.store';

export default {
  name: 'LoginView',
  components: {
    AppHeader,
    LoginForm,
  },
  setup() {
    const serverError = ref('');
    const successMessage = ref('');
    const router = useRouter();
    const authStore = useAuthStore();
    
    // THAY ĐỔI: Thêm một "key" để điều khiển việc render lại
    const formKey = ref(0);

    const handleApiLogin = async (loginData) => {
      serverError.value = '';
      successMessage.value = '';

      try {
        await authStore.login(loginData);
        
        successMessage.value = 'Đăng nhập thành công! Đang chuyển hướng...';
        
        // Buộc component render lại để hiển thị thông báo thành công
        formKey.value += 1;

        setTimeout(() => {
          router.push('/');
        }, 1500);

      } catch (error) {
        serverError.value = error.message || "Tài khoản hoặc mật khẩu không đúng.";
        
        // Buộc component render lại để hiển thị thông báo lỗi
        formKey.value += 1;
      }
    };

    return {
      serverError,
      successMessage,
      handleApiLogin,
      formKey, // Trả về key để template có thể sử dụng
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