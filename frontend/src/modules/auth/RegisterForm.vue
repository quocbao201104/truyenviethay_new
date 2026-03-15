<template>
  <form @submit.prevent="handleRegister" class="xianxia-form">
    
    <div class="nhomForm">
      <BaseInput v-model="fullName" label="Đạo Hiệu (Họ tên)" iconClass="fas fa-user" />
      <span class="loi" v-if="fullNameError">{{ fullNameError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput v-model="username" label="Tôn Hào (Tên đăng nhập)" iconClass="fas fa-id-badge" />
      <span class="loi" v-if="usernameError">{{ usernameError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput v-model="email" label="Truyền Tin Khí (Email)" type="email" iconClass="fas fa-envelope" />
      <span class="loi" v-if="emailError">{{ emailError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput v-model="phone" label="Liên Lạc Phù (Số điện thoại)" type="tel" iconClass="fas fa-phone" />
      <span class="loi" v-if="phoneError">{{ phoneError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput v-model="password" label="Khẩu Quyết (Mật khẩu)" :type="showPassword ? 'text' : 'password'" iconClass="fas fa-lock">
        <button @click="togglePassword" type="button" class="toggle-password">
          <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </button>
      </BaseInput>
      <span class="loi" v-if="passwordError">{{ passwordError }}</span>
    </div>

    <div class="nhomForm">
      <BaseInput v-model="confirmPassword" label="Xác Nhận Khẩu Quyết" :type="showConfirmPassword ? 'text' : 'password'" iconClass="fas fa-shield-halved">
        <button @click="toggleConfirmPassword" type="button" class="toggle-password">
          <i :class="showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </button>
      </BaseInput>
      <span class="loi" v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
    </div>

    <div class="nhomForm captcha-group">
      <BaseInput v-model="captcha" label="Nhập Phù Văn" iconClass="fas fa-scroll" />
      <div class="captcha-rune-display" @click="refreshCaptcha" title="Tái tạo phù văn">
        {{ captchaCode }}
        <i class="fas fa-sync-alt refresh-icon"></i>
      </div>
    </div>
    <span class="loi" v-if="captchaError">{{ captchaError }}</span>

    <div class="nhomForm terms-group">
      <label class="checkbox-container">
        <input type="checkbox" v-model="terms" />
        <span class="checkmark"></span>
        Ta thuận theo <router-link to="/terms" class="cyan-link">Thiên Đạo Khế Ước</router-link>
      </label>
    </div>
    <span class="loi" v-if="termsError">{{ termsError }}</span>
    
    <button type="submit" class="register-btn-divine ripple">Ngưng Tụ Linh Căn</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./auth.store";
import BaseInput from "@/components/common/BaseInput.vue";

const router = useRouter();
const authStore = useAuthStore();

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
const toggleConfirmPassword = () => (showConfirmPassword.value = !showConfirmPassword.value);

const fullNameError = ref("");
const usernameError = ref("");
const emailError = ref("");
const phoneError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const captchaError = ref("");
const termsError = ref("");

const captchaCode = ref(generateCaptcha());
function generateCaptcha() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha();
  captcha.value = "";
};

const validateForm = () => {
  fullNameError.value = ""; usernameError.value = ""; emailError.value = ""; phoneError.value = "";
  passwordError.value = ""; confirmPasswordError.value = ""; captchaError.value = ""; termsError.value = "";

  if (!fullName.value) { fullNameError.value = "Đạo hữu chưa nhập Đạo Hiệu"; return false; }
  if (!username.value) { usernameError.value = "Đạo hữu chưa nhập Tôn Hào"; return false; }
  if (!/^[a-z0-9]{3,20}$/.test(username.value)) { usernameError.value = "Tôn hào 3-20 ký tự, viết liền không dấu"; return false; }
  if (!email.value) { emailError.value = "Cần có Truyền Tin Khí (Email)"; return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailError.value = "Truyền Tin Khí không có thật"; return false; }
  if (!phone.value) { phoneError.value = "Nhập Liên Lạc Phù (SĐT)"; return false; }
  if (!/^0\d{9}$/.test(phone.value)) { phoneError.value = "Liên Lạc Phù phải 10 số, bắt đầu bằng 0"; return false; }
  if (!password.value) { passwordError.value = "Nhập Khẩu Quyết bảo vệ"; return false; }
  if (password.value.length < 6) { passwordError.value = "Khẩu Quyết phải từ 6 ký tự"; return false; }
  if (password.value !== confirmPassword.value) { confirmPasswordError.value = "Khẩu Quyết xác nhận không khớp"; return false; }
  if (captcha.value.toUpperCase() !== captchaCode.value) { captchaError.value = "Vẽ sai Phù Văn, vui lòng thử lại"; refreshCaptcha(); return false; }
  if (!terms.value) { termsError.value = "Hãy chấp thuận Thiên Đạo Khế Ước để tiếp tục"; return false; }
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
    console.error("Thiên cơ phản phệ:", err);
  }
};
</script>

<style scoped>
/* ===== CUSTOM BASE INPUT BẰNG :DEEP() ===== */
.nhomForm { margin-bottom: 18px; position: relative; }

:deep(.nhomForm input) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: none !important;
  border-bottom: 2px solid rgba(6, 182, 212, 0.3) !important;
  border-radius: 8px 8px 0 0 !important;
  color: #fff !important;
  padding-left: 45px !important;
  transition: all 0.3s ease !important;
}

:deep(.nhomForm input:focus) {
  border-bottom-color: #22d3ee !important;
  box-shadow: 0 10px 15px -10px rgba(34, 211, 238, 0.5) !important;
  background: rgba(6, 182, 212, 0.05) !important;
}

:deep(.nhomForm i) { color: #06b6d4 !important; opacity: 0.8; }
:deep(.nhomForm label) { color: #94a3b8 !important; font-weight: 600; font-size: 0.85rem;}

.toggle-password {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #06b6d4; transition: 0.3s;
}
.toggle-password:hover { color: #22d3ee; filter: drop-shadow(0 0 5px #22d3ee); }

/* ===== CAPTCHA PHÙ VĂN ===== */
.captcha-group { display: flex; gap: 15px; align-items: flex-end; }
.captcha-group .nhomForm { flex: 1; margin-bottom: 0; }
.captcha-rune-display {
  background: rgba(15, 118, 110, 0.2); /* Deep Teal */
  border: 1px dashed rgba(20, 184, 166, 0.5);
  border-radius: 8px;
  font-family: "Courier New", monospace;
  font-size: 1.2rem; font-weight: 900; color: #2dd4bf;
  text-align: center; letter-spacing: 3px;
  user-select: none; cursor: pointer;
  height: 46px; min-width: 140px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s ease; box-shadow: inset 0 0 10px rgba(20, 184, 166, 0.2);
}
.captcha-rune-display:hover { background: rgba(15, 118, 110, 0.4); border-color: #2dd4bf; text-shadow: 0 0 8px #2dd4bf; }
.refresh-icon { margin-left: 8px; font-size: 0.9rem; opacity: 0.7; }

/* ===== ĐIỀU KHOẢN (CHECKBOX) ===== */
.terms-group { display: flex; justify-content: center; margin-top: 10px; }
.checkbox-container {
  display: flex; align-items: center; position: relative; cursor: pointer;
  font-size: 0.85rem; color: #94a3b8; user-select: none; gap: 8px;
}
.checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
.checkmark { height: 18px; width: 18px; background-color: rgba(0,0,0,0.5); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: 0.2s;}
.checkbox-container:hover input ~ .checkmark { border-color: #22d3ee; }
.checkbox-container input:checked ~ .checkmark { background-color: rgba(6, 182, 212, 0.2); border-color: #22d3ee; box-shadow: 0 0 10px rgba(34, 211, 238, 0.4); }
.checkmark:after { content: ""; display: none; width: 5px; height: 10px; border: solid #22d3ee; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.checkbox-container input:checked ~ .checkmark:after { display: block; }

.cyan-link { color: #22d3ee; text-decoration: none; font-weight: 800; transition: 0.3s; }
.cyan-link:hover { color: #fff; text-shadow: 0 0 8px #22d3ee; text-decoration: underline; }

/* ===== BUTTON ===== */
.register-btn-divine {
  width: 100%; padding: 14px; margin-top: 15px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;
  color: #020617; font-size: 1.1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;
  cursor: pointer; transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(6, 182, 212, 0.3);
}

.register-btn-divine:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(34, 211, 238, 0.5);
  background: linear-gradient(135deg, #22d3ee, #60a5fa);
}

/* Lỗi */
.loi { color: #f43f5e; font-size: 0.75rem; display: block; margin-top: 4px; padding-left: 5px; text-shadow: 0 0 5px rgba(244, 63, 94, 0.4); }
.ripple { position: relative; overflow: hidden; }

@media (max-width: 480px) {
  .captcha-group { flex-direction: column; align-items: stretch; gap: 8px; }
  .captcha-rune-display { width: 100%; }
}
</style>