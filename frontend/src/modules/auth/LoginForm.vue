<template>
  <div class="khuVucForm cosmic-glass-panel">
    <router-link to="/"><img src="/logo.png" class="login-logo pulse-glow" /></router-link>
    <h2 class="form-title-divine">QUY VỊ TIÊN MÔN</h2>
    <p class="form-subtitle">Đánh thức thần thức, kết nối vạn giới</p>

    <form @submit.prevent="handleLogin" class="xianxia-form">
      <div class="nhomForm">
        <BaseInput v-model="formData.username" label="Linh Ấn (Username)" type="text" iconClass="fas fa-id-badge" />
        <span class="loi-nho" v-if="errors.username">{{ errors.username }}</span>
      </div>

      <div class="nhomForm">
        <BaseInput v-model="formData.password" label="Khẩu Quyết" :type="passwordFieldType" iconClass="fas fa-lock">
          <button type="button" class="toggle-password" @click="togglePassword">
            <i :class="['fas', passwordFieldType === 'password' ? 'fa-eye-slash' : 'fa-eye']"></i>
          </button>
        </BaseInput>
        <span class="loi-nho" v-if="errors.password">{{ errors.password }}</span>
      </div>

      <div class="nhomForm forgot-password">
        <div class="remember-me">
          <input type="checkbox" id="remember-me" v-model="formData.rememberMe" />
          <label for="remember-me">Khắc ghi thần thức</label>
        </div>
        <router-link to="/quen-mat-khau" class="cyan-link">Quên khẩu quyết?</router-link>
      </div>

      <button type="submit" class="login-btn-divine ripple">Tiến Nhập Vạn Giới</button>
    </form>

    <div class="social-login-array">
      <div class="divider-cyan">
        <span>MƯỢN LỰC THIÊN ĐẠO</span>
      </div>
      <div class="google-signin-container">
        <GoogleLogin :callback="onGoogleCallback" />
      </div>
    </div>

    <p class="login-link-rune">
      Chưa có tiên tịch? <router-link to="/dang-ky" class="cyan-link-bold">Trúc Cơ Khởi Nguyên</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import BaseInput from "@/components/common/BaseInput.vue";

const emit = defineEmits(["submit-login", "submit-google-login"]);

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
  passwordFieldType.value = passwordFieldType.value === "password" ? "text" : "password";
};

const validateForm = () => {
  errors.username = !formData.username ? "Đạo hữu chưa nhập Linh Ấn" : "";
  errors.password = !formData.password ? "Đạo hữu chưa nhập Khẩu Quyết" : "";
  return !errors.username && !errors.password;
};

const handleLogin = () => {
  if (validateForm()) {
    emit("submit-login", { ...formData });
  }
};

const onGoogleCallback = (response) => {
  if (response.credential) {
    emit("submit-google-login", response.credential);
  }
};
</script>

<style scoped>
/* ===== GLASSMORPHISM PANEL ===== */
.cosmic-glass-panel {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(6, 182, 212, 0.08);
  animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.login-logo { width: 90px; margin: 0 auto 20px; display: block; transition: all 0.4s; }
.pulse-glow { filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5)); }
.login-logo:hover { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(34, 211, 238, 0.9)); }

.form-title-divine {
  font-size: 1.8rem; font-weight: 900; letter-spacing: 2px;
  text-align: center; margin: 0 0 8px;
  background: linear-gradient(135deg, #fff 20%, #22d3ee 80%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(6, 182, 212, 0.4));
}

.form-subtitle { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-bottom: 25px; letter-spacing: 1px; text-transform: uppercase;}

/* ===== CUSTOM BASE INPUT BẰNG :DEEP() ===== */
.nhomForm { margin-bottom: 20px; position: relative; }

:deep(.nhomForm input) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: none !important;
  border-bottom: 2px solid rgba(6, 182, 212, 0.3) !important;
  border-radius: 8px 8px 0 0 !important;
  color: #fff !important;
  padding-left: 45px !important; /* Dành chỗ cho icon */
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

.forgot-password { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
.remember-me { display: flex; align-items: center; gap: 8px; color: #94a3b8; }
.remember-me input[type="checkbox"] { accent-color: #06b6d4; width: 16px; height: 16px; cursor: pointer; }

.cyan-link { color: #22d3ee; text-decoration: none; transition: 0.3s; }
.cyan-link:hover { color: #fff; text-shadow: 0 0 8px #22d3ee; }
.cyan-link-bold { color: #22d3ee; text-decoration: none; font-weight: 800; margin-left: 5px; transition: 0.3s;}
.cyan-link-bold:hover { color: #fff; text-shadow: 0 0 10px #22d3ee; }

/* ===== BUTTON ===== */
.login-btn-divine {
  width: 100%; padding: 14px; margin-top: 10px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;
  color: #020617; font-size: 1.1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;
  cursor: pointer; transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(6, 182, 212, 0.3);
}

.login-btn-divine:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(34, 211, 238, 0.5);
  background: linear-gradient(135deg, #22d3ee, #60a5fa);
}

/* ===== DIVIDER ===== */
.social-login-array { margin: 25px 0 15px; }
.divider-cyan { display: flex; align-items: center; margin-bottom: 20px; }
.divider-cyan::before, .divider-cyan::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent); }
.divider-cyan span { padding: 0 15px; font-size: 0.75rem; font-weight: 800; color: #22d3ee; letter-spacing: 0.1em; text-transform: uppercase; }

.google-signin-container { display: flex; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); }
.login-link-rune { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 0.9rem; border-top: 1px dashed rgba(6, 182, 212, 0.2); padding-top: 20px; }
.loi-nho { color: #f43f5e; font-size: 0.8rem; display: block; margin-top: 6px; text-shadow: 0 0 5px rgba(244, 63, 94, 0.5); }

@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.ripple { position: relative; overflow: hidden; }
</style>