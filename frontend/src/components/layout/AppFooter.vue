<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-column about">
        <img src="/src/assets/images/logo.png" alt="Logo" class="footer-logo" />
        <p class="footer-description">
          Nền tảng đọc truyện online thân thiện, đa dạng thể loại, cập nhật mỗi
          ngày.
        </p>
      </div>
      <div class="footer-column">
        <h4 class="footer-title">Liên kết nhanh</h4>
        <ul class="footer-links">
          <li><a href="#">Trang chủ</a></li>
          <li><a href="#">Thể loại</a></li>
          <li><a href="#">Truyện mới</a></li>
          <li><a href="#">Xếp hạng</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-title">Hỗ trợ</h4>
        <ul class="footer-links">
          <li><a href="#">Chính sách</a></li>
          <li><a href="#">Điều khoản</a></li>
          <li><a href="#">Liên hệ</a></li>
          <li><a href="#">Báo lỗi</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-title">Theo dõi</h4>
        <p class="contact-email">📧 contact@truyenviethay.vn</p>
        <div class="social-links">
          <a href="#" aria-label="Facebook"
            ><i class="fab fa-facebook-f"></i
          ></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" aria-label="Instagram"
            ><i class="fab fa-instagram"></i
          ></a>
          <a href="#" aria-label="Discord"><i class="fab fa-discord"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="fade-in">
        &copy; 2025 TruyenVietHay – Cảm ơn bạn đã chọn và đồng hành cùng chúng
        tôi.
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.app-footer {
  background: #1a1d29;
  color: #a3a3a3;
  font-family: "Inter", sans-serif;
  padding: 50px 20px 20px;
  border-top: 4px solid transparent;
  border-image: linear-gradient(to right, #22c55e33, transparent, #22c55e33);
  border-image-slice: 1;
  position: relative;
  overflow: hidden;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 30px;
}

.footer-column {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  width: 120px;
  margin-bottom: 10px;
  transition: transform 0.3s ease, filter 0.3s ease;
}
.footer-logo:hover {
  transform: scale(1.1);
  filter: brightness(1.3);
}

.footer-title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.footer-description {
  font-size: 0.95rem;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #a3a3a3;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.footer-links a:hover {
  color: #22c55e;
  padding-left: 5px;
}
.contact-email {
  font-size: 0.95rem;
  margin-bottom: 10px;
  word-break: break-all;
}
.social-links {
  display: flex;
  gap: 14px;
  margin-top: 8px;
}

.social-links a {
  font-size: 1.4rem;
  color: #a3a3a3;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.social-links a:hover {
  color: #22c55e;
  text-shadow: 0 0 5px #22c55eaa;
}

.footer-bottom {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  font-size: 0.88rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.fade-in {
  animation: fadeIn 1s ease forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 576px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .social-links {
    justify-content: center;
  }
  .footer-links {
    display: inline-block;
    text-align: left;
  }
}
</style>
