# 📚 TruyenVietHay — Nền tảng đọc truyện chữ full-stack

<p align="center">
  <img src="frontend/src/assets/images/logo.png" alt="TruyenVietHay logo" width="220">
</p>

<p align="center">
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js" alt="Vue 3"></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite" alt="Vite"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js" alt="Node.js"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.x-000000?logo=express" alt="Express"></a>
  <a href="https://socket.io"><img src="https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io" alt="Socket.io"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql" alt="MySQL"></a>
  <a href="https://opensource.org/licenses/ISC"><img src="https://img.shields.io/badge/License-ISC-4c1.svg" alt="License ISC"></a>
</p>

> TruyenVietHay là nền tảng đọc truyện chữ full-stack tích hợp hệ thống gamification, tu tiên, thương hội và tương tác thời gian thực.

| Môi trường | URL |
| --- | --- |
| Frontend (Production) | [https://truyen-viet-hay.vercel.app](https://truyen-viet-hay.vercel.app) |
| Backend API | [https://truyenviethay-backend-zjfg.onrender.com](https://truyenviethay-backend-zjfg.onrender.com) |

---

## 🚀 Tính Năng Nổi Bật

### 📖 Trải Nghiệm Đọc Truyện
- **Đọc truyện tối ưu:** Giao diện mượt mà, lưu lịch sử, đánh dấu chương, tiếp tục đọc nhanh.
- **Tìm kiếm thông minh:** Lọc theo thể loại, trạng thái, và sắp xếp theo độ hot/mới cập nhật.
- **Tương tác:** Đánh giá, bình luận và theo dõi những bộ truyện yêu thích.

### 🎮 Gamification & Tu Tiên
- **Cảnh giới tu luyện:** Tích lũy EXP để đột phá cảnh giới (Phàm Nhân -> Luyện Khí -> ...). Mỗi cảnh giới có thời hạn thọ nguyên.
- **Hệ thống Nhiệm vụ:** Danh sách nhiệm vụ hằng ngày để nhận thưởng linh thạch và EXP.
- **Hệ thống Thư tín:** Nhận quà tặng và thông báo hệ thống trực tiếp trong Mailbox.
- **Huy hiệu (Badges):** Thu thập và trang bị các danh hiệu độc đáo thể hiện đẳng cấp.

### 🏪 Vạn Giới Thương Hội (Shop) & Túi Đồ
- **Thương Hội:** Sử dụng linh thạch để mua sắm vật phẩm:
    - **Pháp Bảo:** Khung avatar lộng lẫy.
    - **Kỳ Vật:** Các huy hiệu quý hiếm.
    - **Vật Phẩm:** Đan dược tăng EXP (ví dụ: Đan Dược +1000 EXP).
- **Túi Đồ (Inventory):** Quản lý vật phẩm đã sở hữu, trang bị khung avatar, huy hiệu hoặc sử dụng đan dược.

### 💬 Tương Tác Thời Gian Thực
- **World Chat:** Kênh chat chung liên thông toàn giới, hiển thị khung avatar và màu sắc sặc sỡ theo cấp độ.
- **Thông báo Real-time:** Nhận thông báo tức thì khi có chương mới hoặc sự kiện.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:**
    - **Framework:** Vue 3 (Composition API) + TypeScript.
    - **Build Tool:** Vite.
    - **State Management:** Pinia.
    - **UI/UX:** Tailwind CSS, CSS Modules, Framer Motion (concept), Swiper, ApexCharts.
    - **Real-time:** Socket.io client.
- **Backend:**
    - **Runtime:** Node.js 18+.
    - **Framework:** Express.js.
    - **Real-time:** Socket.io.
    - **Security:** JWT, Google OAuth, Helmet, CORS, Rate Limiting.
- **Lưu trữ & Hạ tầng:**
    - **Database:** MySQL 8+ (với hệ thống Index tối ưu).
    - **Caching:** Redis (Upstash) cho socket state & pub/sub.
    - **Media:** Cloudinary lưu trữ ảnh bìa truyện và avatar.
    - **Deployment:** Vercel (Frontend), Render (Backend).

---

## 📦 Cấu Trúc Thư Mục

```text
truyenviethay_new/
├─ backend/
│  ├─ config/          # Cấu hình DB, Cloudinary, Socket, Redis
│  ├─ controllers/     # Xử lý logic nghiệp vụ cho từng module
│  ├─ models/          # Lớp tương tác DB (MySQL Query Builder)
│  ├─ services/        # Business logic tập trung (Gamification, Shop, Chat)
│  ├─ routes/          # Định nghĩa API endpoints
│  ├─ migrations/      # Các script SQL cập nhật cấu trúc DB
│  ├─ jobs/            # Cron jobs xử lý định kỳ (Thống kê, Task)
│  └─ utils/           # Tiện ích bổ trợ (Logger, Auth, Validation)
├─ frontend/
│  ├─ src/
│  │  ├─ modules/      # Module-based architecture (Store + API services)
│  │  ├─ components/   # UI Components dùng chung
│  │  ├─ views/        # Các trang chính của ứng dụng
│  │  ├─ composables/  # Logic dùng chung (useGamification, useSocket)
│  │  └─ assets/       # Styles, images, icons
│  └─ vite.config.ts
└─ README.md
```

---

## 🛠️ Hướng Dẫn Cài Đặt

### Tiền đề
- **Node.js** v18 hoặc mới hơn.
- **MySQL** v8+.
- **Redis** 

### Các bước thực hiện

1. **Clone dự án:**
   ```bash
   git clone https://github.com/quocbao201104/TruyenVietHay.git
   cd TruyenVietHay
   ```

2. **Cấu hình Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Chỉnh sửa .env với thông tin DB, JWT, Cloudinary, Redis
   npm run dev
   ```

3. **Cấu hình Frontend:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Chỉnh sửa VITE_API_URL trỏ về backend
   npm run dev
   ```

---

## 👨‍💻 Tác Giả

- **Bảo Dev** — [baodev.indevs.in](https://baodev.indevs.in)

---

### Phụ lục
- **Deployment:** Hướng dẫn chi tiết tại [DEPLOY.md](./DEPLOY.md).
- **API Docs:** Xem chi tiết định nghĩa trong thư mục `backend/routes`.