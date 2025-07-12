<template>
  <div class="khuVucForm">
    <router-link to="/"><img src="/logo.png" class="login-logo" /></router-link>
    <h2 class="form-title">Đăng Nhập</h2>

    <form @submit.prevent="handleLogin">
      <div class="nhomForm">
        <BaseInput v-model="formData.username" label="Email hoặc Username" type="text" iconClass="fas fa-id-badge" />
        <span class="loi-nho" v-if="errors.username">{{
          errors.username
        }}</span>
      </div>

      <div class="nhomForm">
        <BaseInput v-model="formData.password" label="Mật khẩu" :type="passwordFieldType" iconClass="fas fa-lock">
          <button type="button" class="toggle-password" @click="togglePassword">
            <i :class="[
              'fas',
              passwordFieldType === 'password' ? 'fa-eye-slash' : 'fa-eye',
            ]"></i>
          </button>
        </BaseInput>
        <span class="loi-nho" v-if="errors.password">{{
          errors.password
        }}</span>
      </div>

      <div class="nhomForm forgot-password">
        <div class="remember-me">
          <input type="checkbox" id="remember-me" v-model="formData.rememberMe" />
          <label for="remember-me">Ghi nhớ mật khẩu</label>
        </div>
        <router-link to="/quen-mat-khau">Quên mật khẩu?</router-link>
      </div>

      <button type="submit" class="login-btn ripple">Đăng Nhập</button>
    </form>

    <div class="social-login">
      <p>Hoặc đăng nhập bằng:</p>
      <div class="social-buttons">
        <button class="social-btn facebook-btn ripple">
          <i class="fab fa-facebook-f"></i> Facebook
        </button>
        <button class="social-btn google-btn ripple">
          <i class="fab fa-google"></i> Google
        </button>
      </div>
    </div>

    <p class="login-link">
      Chưa có tài khoản? <router-link to="/dang-ky">Đăng ký ngay</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import BaseInput from "@/components/common/BaseInput.vue";
import { defineProps, defineEmits } from "vue";

// Loại bỏ props serverError và successMessage
const props = defineProps({});

const emit = defineEmits(["submit-login"]);

const formData = reactive({
  username: "",
  password: "",
  rememberMe: false,
});

const errors = reactive({
  username: "",
  password: "",
});

const passwordFieldType = ref("password");

const togglePassword = () => {
  passwordFieldType.value =
    passwordFieldType.value === "password" ? "text" : "password";
};

const validateForm = () => {
  errors.username = !formData.username
    ? "Vui lòng nhập email hoặc username"
    : "";
  errors.password = !formData.password ? "Vui lòng nhập mật khẩu" : "";
  return !errors.username && !errors.password;
};

const handleLogin = () => {
  if (validateForm()) {
    emit("submit-login", { ...formData });
  }
};
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS cũ và thêm/chỉnh sửa CSS cho thông báo */
.khuVucForm {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #4caf50;
  border-radius: 10px;
  background: #1a1d29;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.6s ease-out;
}

.login-logo {
  width: 100px;
  margin: 0 auto 15px;
  display: block;
  transition: transform 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.1);
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 10px;
  text-align: center;
}

.nhomForm {
  margin-bottom: 20px;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #4caf50;
}

.toggle-password i {
  font-size: 1rem;
}

.toggle-password:hover {
  color: #388e3c;
}

.forgot-password {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cccccc;
}

.remember-me input[type="checkbox"] {
  accent-color: #4caf50;
}

.forgot-password a {
  color: #4caf50;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
  color: #388e3c;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(90deg, #388e3c, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.social-login {
  margin: 20px 0;
  text-align: center;
  color: #cccccc;
}

.social-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.social-btn {
  flex-grow: 1;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #4caf50;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: #4caf50;
  color: #1a1a1a;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #cccccc;
}

.login-link a {
  color: #4caf50;
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
  color: #388e3c;
}

/* Các class .loi và .thanh-cong không còn được sử dụng trực tiếp trong template này */
.loi {
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 4px;
  margin-bottom: 15px;
  display: block;
  text-align: center;
}

.loi-nho {
  color: #ff5252;
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
}

.thanh-cong {
  color: #4caf50;
  font-size: 0.9rem;
  margin-top: 4px;
  margin-bottom: 15px;
  display: block;
  text-align: center;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 50%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

@keyframes rippleEffect {
  0% {
    transform: scale(0);
    opacity: 1;
  }

  100% {
    transform: scale(30);
    opacity: 0;
  }
}
</style>