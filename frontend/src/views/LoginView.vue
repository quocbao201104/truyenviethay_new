<template>
  <div class="dangnhap-container portal-cosmic-bg">
    <div class="portal-nebula-glow"></div>
    <div class="portal-particles"></div>

    <main class="main-content">
      <LoginForm
        :key="formKey"
        @submit-login="handleApiLogin"
        @submit-google-login="handleApiGoogleLogin"
      />
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import LoginForm from "@/modules/auth/LoginForm.vue";
import { useAuthStore } from "../modules/auth/auth.store";

export default {
  name: "LoginView",
  components: {
    LoginForm,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const formKey = ref(0);

    const handleApiLogin = async (loginData) => {
      try {
        await authStore.login(loginData);
        formKey.value += 1; 

        setTimeout(() => {
          router.push("/truyen-chu");
        }, 1500);
      } catch (error) {
        console.error("Thiên cơ nhiễu loạn:", error);
        formKey.value += 1;
      }
    };

    const handleApiGoogleLogin = async (token) => {
        try {
            await authStore.googleLogin(token);
            setTimeout(() => {
                router.push("/truyen-chu");
            }, 1500);
        } catch (error) {
            console.error("Mượn lực Thiên Đạo thất bại", error);
        }
    };

    return {
      handleApiLogin,
      handleApiGoogleLogin,
      formKey,
    };
  },
};
</script>

<style scoped>

/* ===== BACKGROUND (TINH TRẦN HƯ KHÔNG) ===== */
.dangnhap-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #020617; /* Midnight Blue sâu thẳm */
  color: #f8fafc;
  font-family: 'Be Vietnam Pro', sans-serif;
  position: relative;
  overflow: hidden;
}

.portal-nebula-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw; height: 80vw;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 60%);
  filter: blur(70px);
  z-index: 0;
  pointer-events: none;
}

.portal-particles {
  position: absolute; inset: 0;
  background-image: 
    radial-gradient(circle at 70% 30%, rgba(34, 211, 238, 0.15) 1px, transparent 1px),
    radial-gradient(circle at 10% 70%, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px);
  background-size: 150px 150px, 100px 100px;
  animation: cosmicDrift 25s linear infinite;
  z-index: 0; pointer-events: none;
}

@keyframes cosmicDrift { 0% { transform: translateY(0); } 100% { transform: translateY(-50px); } }

.main-content {
  position: relative;
  z-index: 10;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}
</style>
