<template>
  <form @submit.prevent="handleRegister">
    <div class="nhomForm">
      <BaseInput
        v-model="fullName"
        label="Họ và tên"
        iconClass="fas fa-user"
      />
      <span class="loi" v-if="fullNameError">{{ fullNameError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput
        v-model="username"
        label="Tên đăng nhập"
        iconClass="fas fa-id-badge"
      />
      <span class="loi" v-if="usernameError">{{ usernameError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        iconClass="fas fa-envelope"
      />
      <span class="loi" v-if="emailError">{{ emailError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput
        v-model="phone"
        label="Số điện thoại"
        type="tel"
        iconClass="fas fa-phone"
      />
      <span class="loi" v-if="phoneError">{{ phoneError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput
        v-model="password"
        label="Mật khẩu"
        :type="showPassword ? 'text' : 'password'"
        iconClass="fas fa-lock"
      >
        <button @click="togglePassword" type="button" class="toggle-password">
          <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </button>
      </BaseInput>
      <span class="loi" v-if="passwordError">{{ passwordError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput
        v-model="confirmPassword"
        label="Xác nhận mật khẩu"
        :type="showConfirmPassword ? 'text' : 'password'"
        iconClass="fas fa-lock"
      >
        <button @click="toggleConfirmPassword" type="button" class="toggle-password">
          <i :class="showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </button>
      </BaseInput>
      <span class="loi" v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
    </div>

    <div class="nhomForm captcha-group">
      <BaseInput
        v-model="captcha"
        label="Mã xác thực"
        iconClass="fas fa-shield-alt"
      />
      <div class="captcha-display" @click="refreshCaptcha">
        {{ captchaCode }}
        <i class="fas fa-sync-alt refresh-icon"></i>
      </div>
    </div>
    <span class="loi" v-if="captchaError">{{ captchaError }}</span>

    <div class="nhomForm terms-group">
      <label>
        <input type="checkbox" v-model="terms" />
        Tôi đồng ý với
        <router-link to="/terms">điều khoản dịch vụ</router-link>.
      </label>
    </div>
    <span class="loi" v-if="termsError">{{ termsError }}</span>
    
    <button type="submit" class="login-btn ripple">Đăng Ký Ngay</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./auth.store";
import BaseInput from "@/components/common/BaseInput.vue";
// Không cần defineEmits(["submit-success", "submit-error"]); nữa

const router = useRouter();
const authStore = useAuthStore();
// Loại bỏ emit vì RegisterForm sẽ tự xử lý việc gọi store và chuyển hướng

const fullName = ref("");
const username = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const captcha = ref("");
const terms = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const togglePassword = () => (showPassword.value = !showPassword.value);
const toggleConfirmPassword = () =>
  (showConfirmPassword.value = !showConfirmPassword.value);

const fullNameError = ref("");
const usernameError = ref("");
const emailError = ref("");
const phoneError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const captchaError = ref("");
const termsError = ref("");
// Loại bỏ errorMessage vì thông báo lỗi sẽ do toast xử lý

const captchaCode = ref(generateCaptcha());
function generateCaptcha() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha();
  captcha.value = "";
};

const validateForm = () => {
  fullNameError.value = "";
  usernameError.value = "";
  emailError.value = "";
  phoneError.value = "";
  passwordError.value = "";
  confirmPasswordError.value = "";
  captchaError.value = "";
  termsError.value = "";
  // errorMessage.value = ""; // Loại bỏ dòng này

  if (!fullName.value) {
    fullNameError.value = "Nhập họ và tên";
    return false;
  }
  if (!username.value) {
    usernameError.value = "Nhập tên đăng nhập";
    return false;
  }
  if (!/^[a-z0-9]{3,20}$/.test(username.value)) {
    usernameError.value = "Tên đăng nhập 3-20 ký tự, không dấu, không hoa";
    return false;
  }
  if (!email.value) {
    emailError.value = "Nhập email";
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = "Email không hợp lệ";
    return false;
  }
  if (!phone.value) {
    phoneError.value = "Nhập số điện thoại";
    return false;
  }
  if (!/^0\d{9}$/.test(phone.value)) {
    phoneError.value = "SĐT phải 10 số và bắt đầu bằng 0";
    return false;
  }
  if (!password.value) {
    passwordError.value = "Nhập mật khẩu";
    return false;
  }
  if (password.value.length < 6) {
    passwordError.value = "Mật khẩu tối thiểu 6 ký tự";
    return false;
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = "Mật khẩu không khớp";
    return false;
  }
  if (captcha.value.toUpperCase() !== captchaCode.value) {
    captchaError.value = "Mã xác thực sai";
    refreshCaptcha();
    return false;
  }
  if (!terms.value) {
    termsError.value = "Cần đồng ý điều khoản";
    return false;
  }
  return true;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  try {
    await authStore.register({
      full_name: fullName.value,
      username: username.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      gender: "other", 
    });
    setTimeout(() => {
      router.push("/dang-nhap");
    }, 1500);
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
  }
};
</script>

<style scoped>
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
</style>