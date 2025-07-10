<template>
  <div class="dangky-container">
    <AppHeader />
    <main class="main-content">
      <div class="khuVucForm">
        <router-link to="/">
          <img src="/logo.png" alt="Logo" class="login-logo" />
        </router-link>
        <h2 class="form-title">Đăng Ký Tài Khoản</h2>

        <RegisterForm
          :key="formKey"
          @submit-success="handleRegisterSuccess"
          @submit-error="handleRegisterError"
        />

        <p v-if="successMessage" class="success-message">
          {{ successMessage }}
        </p>
        <p v-if="serverError" class="error-message">
          {{ serverError }}
        </p>

        <p class="login-link">
          Đã có tài khoản?
          <router-link to="/dang-nhap">Đăng nhập ngay</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import RegisterForm from "@/modules/auth/RegisterForm.vue";

const router = useRouter();
const formKey = ref(0);
const successMessage = ref("");
const serverError = ref("");

const handleRegisterSuccess = (msg) => {
  successMessage.value = msg;
  serverError.value = "";
  formKey.value++; // reset lại form

  setTimeout(() => {
    router.push("/dang-nhap");
  }, 1500);
};

const handleRegisterError = (msg) => {
  serverError.value = msg;
  successMessage.value = "";
  formKey.value++;
};
</script>

<style scoped>
.dangky-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.khuVucForm {
  max-width: 420px;
  width: 100%;
  background: #1a1d29;
  border: 2px solid #4caf50;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.login-logo {
  width: 100px;
  display: block;
  margin: 0 auto 12px;
  transition: 0.3s;
}

.login-logo:hover {
  transform: scale(1.05);
}

.form-title {
  text-align: center;
  color: #4caf50;
  font-size: 1.8rem;
  margin-bottom: 16px;
}

.login-link {
  text-align: center;
  font-size: 0.9rem;
  margin-top: 15px;
}

.login-link a {
  color: #4caf50;
  text-decoration: none;
  font-weight: 500;
}

.success-message {
  text-align: center;
  margin-top: 10px;
  color: #4caf50;
  font-weight: 500;
}

.error-message {
  text-align: center;
  margin-top: 10px;
  color: #f44336;
  font-weight: 500;
}
</style>
