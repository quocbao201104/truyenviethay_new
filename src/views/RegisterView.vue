<template>
  <div class="dangky-container">
    <AppHeader />
    <main class="main-content">
      <div class="khuVucForm">
        <router-link to="/">
          <img src="/logo.png" alt="Logo" class="login-logo" />
        </router-link>
        <h2 class="form-title">Đăng Ký Tài Khoản</h2>

        <RegisterForm :key="formKey" />
        <div class="social-login">
          <p>Hoặc đăng ký bằng:</p>
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
// Không cần import useAuthStore hay useAppToast ở đây vì logic hiển thị toast đã ở trong store

const router = useRouter();
const formKey = ref(0);
// Không cần ref successMessage và serverError ở đây nữa

// Các hàm handleRegisterSuccess và handleRegisterError không còn cần thiết
// vì việc hiển thị thông báo đã được auth.store xử lý.
// Chúng ta chỉ cần chuyển hướng người dùng sau khi đăng ký thành công
// (logic chuyển hướng này nên được đặt ở nơi gọi RegisterForm hoặc sau khi RegisterForm hoàn thành submit).
// Trong trường hợp này, RegisterForm sẽ gọi authStore.register(), và authStore sẽ hiển thị toast.
// Việc chuyển hướng về trang đăng nhập có thể được xử lý trực tiếp trong handleRegister của RegisterForm
// hoặc thông qua một sự kiện sau khi gọi authStore thành công nếu bạn muốn RegisterView kiểm soát.

// Để giữ RegisterView đơn giản, RegisterForm sẽ xử lý việc gọi store và chuyển hướng.
// Do đó, các hàm handleRegisterSuccess và handleRegisterError sẽ được loại bỏ hoàn toàn.
// formKey.value++ vẫn giữ để reset form nếu cần.
</script>

<style>
/* Import Google Fonts cho typography */
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

/* Container chính */
.dangky-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
}

/* Nội dung chính */
.main-content {
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

/* Container form */
.khuVucForm {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  padding: 20px;
  background: #1a1d29;
  border: 2px solid #4caf50;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.6s ease-out;
}

/* Logo */
.login-logo {
  width: 100px;
  margin: 0 auto 10px;
  display: block;
  transition: transform 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.1);
}

/* Tiêu đề form */
.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: #4caf50;
  /* Xanh lá */
  margin-bottom: 15px;
  text-align: center;
}

/* Nhóm form */
.nhomForm {
  margin-bottom: 15px;
}

/* Dấu * bắt buộc */
.batBuoc {
  color: #d32f2f;
  /* Đỏ */
}

/* Nhóm captcha */
.captcha-group {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.captcha-group .input-group {
  flex: 1;
}

.captcha-display {
  padding: 10px;
  background: #4caf50;
  /* Nền xanh lá */
  border-radius: 8px;
  font-family: "Courier New", monospace;
  font-size: 1rem;
  color: #fff;
  text-align: center;
  letter-spacing: 2px;
  user-select: none;
  cursor: pointer;
  height: 44px;
  /* Cho chiều cao bằng input */
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-display:hover {
  background: #388e3c;
  /* Xanh lá đậm hơn khi hover */
}

.refresh-icon {
  margin-left: 6px;
  font-size: 0.8rem;
}

/* Nhóm điều khoản */
.terms-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #cccccc;
  /* Xám nhạt */
  justify-content: center;
  margin-bottom: 15px;
}

.terms-group input[type="checkbox"] {
  margin: 0;
  accent-color: #4caf50;
  /* Checkbox xanh lá */
}

.terms-group a {
  color: #4caf50;
  /* Xanh lá */
  text-decoration: none;
}

.terms-group a:hover {
  color: #388e3c;
  /* Xanh lá đậm hơn khi hover */
  text-decoration: underline;
}

/* Nút Đăng ký */
.login-btn {
  width: 85%;
  margin: 0 auto;
  display: block;
  padding: 12px;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  /* Gradient xanh lá */
  border: none;
  border-radius: 8px;
  color: #1a1a1a;
  /* Chữ đen */
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

/* Đăng ký mạng xã hội */
.social-login {
  margin: 15px 0;
  text-align: center;
}

.social-login p {
  font-size: 0.9rem;
  color: #cccccc;
  /* Xám nhạt */
  margin-bottom: 10px;
}

.social-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.social-btn {
  width: 40%;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #4caf50;
  /* Viền xanh lá */
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffffff;
}

.social-btn:hover {
  background: #4caf50;
  /* Nền xanh lá khi hover */
  color: #1a1a1a;
  /* Chữ đen */
}

/* Liên kết Đăng nhập */
.login-link {
  text-align: center;
  font-size: 0.9rem;
  color: #cccccc;
  /* Xám nhạt */
  margin-top: 15px;
}

.login-link a {
  color: #4caf50;
  /* Xanh lá */
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  color: #388e3c;
  /* Xanh lá đậm hơn khi hover */
  text-decoration: underline;
}

/* Thông báo lỗi */
.loi {
  color: #d32f2f;
  /* Đỏ cho lỗi */
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
  text-align: center;
}

.success-message,
.error-message {
  text-align: center;
  margin-top: 10px;
  font-weight: 500;
}

.success-message {
  color: #4caf50;
}

.error-message {
  color: #f44336;
}

/* Hiệu ứng slide lên */
@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .khuVucForm {
    padding: 15px;
  }

  .form-title {
    font-size: 1.8rem;
  }

  .captcha-group {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}
</style>