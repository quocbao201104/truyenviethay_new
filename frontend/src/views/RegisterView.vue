<template>
  <div class="dangky-container portal-cosmic-bg">
    <div class="portal-nebula-glow"></div>
    <div class="portal-particles"></div>

    <main class="main-content">
      <div class="khuVucForm glass-panel-cyan animate-slideUp">
        <router-link to="/">
          <img src="/logo.png" alt="Logo" class="login-logo pulse-glow" />
        </router-link>
        <h2 class="form-title-divine">TRÚC CƠ KHỞI NGUYÊN</h2>
        <p class="form-subtitle">Ngưng tụ linh căn, bước lên Đạp Tiên Lộ</p>

        <RegisterForm :key="formKey" />
        
        <div class="social-login-array">
          <div class="divider-cyan">
            <span>MƯỢN LỰC THIÊN ĐẠO</span>
          </div>
          <div class="google-signin-container">
            <LazyGoogleLoginButton :callback="onGoogleCallback" />
          </div>
        </div>
        
        <p class="login-link-rune">
          Đã có tiên tịch?
          <router-link to="/dang-nhap" class="text-cyan-link">Quy Vị Tiên Môn</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import LazyGoogleLoginButton from "@/modules/auth/components/LazyGoogleLoginButton.vue";
import RegisterForm from "@/modules/auth/RegisterForm.vue";
import { useAuthStore } from "@/modules/auth/auth.store";

const router = useRouter();
const authStore = useAuthStore();
const formKey = ref(0);

const onGoogleCallback = async (response) => {
    if (response.credential) {
        try {
            await authStore.googleLogin(response.credential);
            setTimeout(() => {
                router.push("/truyen-chu");
            }, 1500);
        } catch (error) {
            console.error("Thiên cơ nhiễu loạn (Register Page)", error);
        }
    }
};
</script>

<style scoped>
/* ===== BACKGROUND (TINH TRẦN HƯ KHÔNG) ===== */
.dangky-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #020617; 
  color: #f8fafc;
  font-family: 'Be Vietnam Pro', sans-serif;
  position: relative;
  overflow: hidden;
}

.portal-nebula-glow {
  position: absolute;
  top: 20%; left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw; height: 80vw;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%);
  filter: blur(60px);
  z-index: 0; pointer-events: none;
}

.portal-particles {
  position: absolute; inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.15) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px);
  background-size: 120px 120px, 180px 180px;
  animation: cosmicDrift 30s linear infinite;
  z-index: 0; pointer-events: none;
}

@keyframes cosmicDrift { 0% { transform: translateY(0); } 100% { transform: translateY(-50px); } }

.main-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding: 40px 20px;
}

/* ===== GLASSMORPHISM CARD ===== */
.glass-panel-cyan {
  width: 100%;
  max-width: 480px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(6, 182, 212, 0.08);
}

/* Logo */
.login-logo { width: 90px; margin: 0 auto 20px; display: block; transition: all 0.4s; }
.pulse-glow { filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5)); }
.login-logo:hover { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.8)); }

/* Headers */
.form-title-divine {
  font-size: 1.8rem; font-weight: 900; letter-spacing: 2px;
  text-align: center; margin: 0 0 8px;
  background: linear-gradient(135deg, #fff 20%, #22d3ee 80%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(6, 182, 212, 0.4));
}

.form-subtitle { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-bottom: 25px; letter-spacing: 1px; text-transform: uppercase;}

/* Divider */
.social-login-array { margin: 25px 0 15px; }
.divider-cyan { display: flex; align-items: center; margin-bottom: 20px; }
.divider-cyan::before, .divider-cyan::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent); }
.divider-cyan span { padding: 0 15px; font-size: 0.75rem; font-weight: 800; color: #22d3ee; letter-spacing: 0.1em; text-transform: uppercase; }

.google-signin-container { display: flex; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); }

/* Links */
.login-link-rune { text-align: center; font-size: 0.9rem; color: #94a3b8; margin-top: 25px; }
.text-cyan-link { color: #22d3ee; font-weight: 800; text-decoration: none; transition: 0.3s; margin-left: 5px; }
.text-cyan-link:hover { color: #fff; text-shadow: 0 0 10px #22d3ee; }

@keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
.animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

@media (max-width: 480px) { .glass-panel-cyan { padding: 30px 20px; } .form-title-divine { font-size: 1.5rem; } }
</style>
