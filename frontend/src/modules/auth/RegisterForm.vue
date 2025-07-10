<template>
  <form @submit.prevent="handleRegister">
    <p id="register-error" class="loi" v-if="errorMessage">
      {{ errorMessage }}
    </p>

    <!-- Họ và tên -->
    <BaseInput v-model="fullName" label="Họ và tên" iconClass="fas fa-user" />
    <span class="loi" v-if="fullNameError">{{ fullNameError }}</span>

    <!-- Tên đăng nhập -->
    <BaseInput
      v-model="username"
      label="Tên đăng nhập"
      iconClass="fas fa-id-badge"
    />
    <span class="loi" v-if="usernameError">{{ usernameError }}</span>

    <!-- Email -->
    <BaseInput
      v-model="email"
      label="Email"
      type="email"
      iconClass="fas fa-envelope"
    />
    <span class="loi" v-if="emailError">{{ emailError }}</span>

    <!-- Số điện thoại -->
    <BaseInput
      v-model="phone"
      label="Số điện thoại"
      type="tel"
      iconClass="fas fa-phone"
    />
    <span class="loi" v-if="phoneError">{{ phoneError }}</span>

    <!-- Mật khẩu -->
    <BaseInput
      v-model="password"
      label="Mật khẩu"
      :type="showPassword ? 'text' : 'password'"
      iconClass="fas fa-lock"
    >
      <button @click="togglePassword" type="button">
        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
    </BaseInput>
    <span class="loi" v-if="passwordError">{{ passwordError }}</span>

    <!-- Xác nhận mật khẩu -->
    <BaseInput
      v-model="confirmPassword"
      label="Xác nhận mật khẩu"
      :type="showConfirmPassword ? 'text' : 'password'"
      iconClass="fas fa-lock"
    >
      <button @click="toggleConfirmPassword" type="button">
        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
    </BaseInput>
    <span class="loi" v-if="confirmPasswordError">{{
      confirmPasswordError
    }}</span>

    <!-- Captcha -->
    <div class="nhomForm captcha-group">
      <BaseInput
        v-model="captcha"
        label="Mã xác thực"
        iconClass="fas fa-shield-alt"
      />
      <span class="loi" v-if="captchaError">{{ captchaError }}</span>
      <div class="captcha-display" @click="refreshCaptcha">
        {{ captchaCode }}
        <i class="fas fa-sync-alt refresh-icon"></i>
      </div>
    </div>

    <!-- Điều khoản -->
    <div class="nhomForm terms-group">
      <label>
        <input type="checkbox" v-model="terms" />
        Tôi đồng ý với
        <router-link to="/terms">điều khoản dịch vụ</router-link>.
      </label>
      <span class="loi" v-if="termsError">{{ termsError }}</span>
    </div>

    <p class="loi" v-if="errorMessage">{{ errorMessage }}</p>

    <button type="submit" class="login-btn ripple">Đăng Ký Ngay</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./auth.store";

// Component input dùng chung
import BaseInput from "@/components/common/BaseInput.vue";

const router = useRouter();
const authStore = useAuthStore();

// Form data
const fullName = ref("");
const username = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const captcha = ref("");
const terms = ref(false);

// Toggle password visibility
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const togglePassword = () => (showPassword.value = !showPassword.value);
const toggleConfirmPassword = () =>
  (showConfirmPassword.value = !showConfirmPassword.value);

// Error states
const fullNameError = ref("");
const usernameError = ref("");
const emailError = ref("");
const phoneError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const captchaError = ref("");
const termsError = ref("");
const errorMessage = ref("");

// Captcha
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

const handleRegister = async () => {
  // Reset errors
  fullNameError.value = "";
  usernameError.value = "";
  emailError.value = "";
  phoneError.value = "";
  passwordError.value = "";
  confirmPasswordError.value = "";
  captchaError.value = "";
  termsError.value = "";
  errorMessage.value = "";

  // Validation
  if (!fullName.value) return (fullNameError.value = "Nhập họ và tên");
  if (!username.value) return (usernameError.value = "Nhập tên đăng nhập");
  if (!/^[a-z0-9]{3,20}$/.test(username.value))
    return (usernameError.value = "Tên đăng nhập không hợp lệ");

  if (!email.value) return (emailError.value = "Nhập email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
    return (emailError.value = "Email không hợp lệ");

  if (!phone.value) return (phoneError.value = "Nhập số điện thoại");
  if (!/^0\d{9}$/.test(phone.value))
    return (phoneError.value = "SĐT phải 10 số và bắt đầu bằng 0");

  if (!password.value) return (passwordError.value = "Nhập mật khẩu");
  if (password.value.length < 6)
    return (passwordError.value = "Mật khẩu tối thiểu 6 ký tự");

  if (!confirmPassword.value)
    return (confirmPasswordError.value = "Xác nhận mật khẩu");
  if (password.value !== confirmPassword.value)
    return (confirmPasswordError.value = "Mật khẩu không khớp");

  if (!captcha.value) return (captchaError.value = "Nhập mã xác thực");
  if (captcha.value !== captchaCode.value) {
    captchaError.value = "Mã xác thực sai";
    refreshCaptcha();
    return;
  }

  if (!terms.value) return (termsError.value = "Cần đồng ý điều khoản");

  try {
    await authStore.register({
      full_name: fullName.value,
      username: username.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      gender: "other",
    });

    errorMessage.value = "Đăng ký thành công!";
    setTimeout(() => router.push("/dang-nhap"), 1000);
  } catch (err) {
    errorMessage.value = err?.message || "Đăng ký thất bại";
  }
};
</script>
