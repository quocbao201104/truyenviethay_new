<div align="center">
  <img src="frontend/src/assets/images/logo.png" alt="TruyenVietHay Logo" width="250">
  
  <br />
  <br />

  <p>
    <b>Nền tảng đọc truyện chữ và nghe audio full-stack hiện đại, tối ưu hoá cho trải nghiệm mobile & hiệu năng cao.</b>
  </p>
  
  <p>
    <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3"></a>
    <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"></a>
    <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"></a>
    <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL_8+-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"></a>
    <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"></a>
  </p>
</div>

---

## 📖 Giới thiệu

**TruyenVietHay** là hệ thống web app full-stack tiên tiến được xây dựng nhằm cung cấp trải nghiệm đọc truyện chữ và nghe truyện audio tốt nhất. Dự án đặc biệt chú trọng vào:
- **Tốc độ tải trang & Hiệu năng**: Nhờ kiến trúc nạp nội dung trực tiếp qua CDN độc lập.
- **Trải nghiệm Mobile-first**: Giao diện mượt mà như native app, hỗ trợ PWA.
- **Tương tác thời gian thực**: Chatbox nhóm, thông báo push qua Socket.io.
- **Gamification**: Hệ thống cấp độ, kinh nghiệm, vật phẩm, huy hiệu và cửa hàng tích hợp.
- **Hệ sinh thái Tác giả**: Trang cá nhân, bảng xếp hạng phân tích, công cụ quản lý truyện chuyên nghiệp.

---

## 🌟 Tính năng nổi bật

### 📚 Trải nghiệm Đọc Truyện & Nghe Audio
- **Đọc truyện chữ**: Giao diện tuỳ biến bám sát nhu cầu (màu nền, font, cỡ chữ), tự động lưu vị trí (Continue Reading), tải trước chương (prefetch caching).
- **Nghe truyện audio**: Trình phát HTML5 trực tiếp từ CDN, hệ thống playlist nhóm theo cụm, lưu tiến độ nghe chính xác tới từng giây (đồng bộ cả LocalStorage & Backend Database).
- **Kiến trúc phân tán**: Metadata lấy cực nhanh qua API, toàn bộ nội dung chương (JSON) và MP3 được kéo độc lập qua CDN giúp tiết kiệm băng thông và tăng tốc xử lý cho server.

### 🎮 Gamification & Tương tác
- **Hệ thống nhiệm vụ & Cấp bậc**: Đọc truyện/nghe audio tích luỹ điểm kinh nghiệm (EXP), thăng cấp nhận quà hệ thống.
- **Shop & Túi đồ (Inventory)**: Đổi vật phẩm bằng Tu Vi / Linh Thạch ảo.
- **Tương tác mạng xã hội**: Đánh giá đa chiều (rating), bình luận đa cấp, follow tác giả/truyện yêu thích.
- **Hòm thư tĩnh (Mailbox)**: Nhận thưởng hệ thống và cập nhật thông báo riêng cá nhân.

### ✍️ Dành cho Tác giả
- Hồ sơ tác giả chuyên nghiệp, hiển thị công khai.
- Bảng xếp hạng tác giả với huy hiệu (badge) vinh danh.
- Dashboard thống kê cụ thể: Số lượt đọc, tổng truyện, biểu đồ followers.

### 🛡️ Quản trị (Admin Moderation)
- Quản lý duyệt xuất bản truyện/chương nhanh chóng.
- Hệ thống Redis Cache lớp ứng dụng gia tăng hiệu suất admin dashboard.
- Xoá mềm (Soft Delete) giúp phân biệt truyện ẩn/xoá và đảm bảo an toàn truy xuất.

---

## 🏗️ Kiến trúc Hệ thống

1. **Phân phối Nội dung (Content Delivery)**
   - Backend API phụ trách trả về Header truyện hoặc Hash Metadata.
   - Frontend dùng thông tin Hash build thành request trỏ URL tải file tĩnh về từ CDN Cloudflare/AWS S3.
2. **Xử lý Ảnh & Media**
   - Ảnh tĩnh (Avatar, Bìa truyện, Badge, Vật phẩm) stream qua Cloudinary Image API.
3. **Background Jobs (Cron Tasks)**
   - Thư viện `node-cron` kết hợp **Redis** xử lý hàng loạt tiến trình nặng: Cập nhật View Count định kì gộp theo batch, thông kê Daily Stats, Reconcile Aggregates (tổng hợp lại dữ liệu), Cleanup Notifications/History, tính điểm thưởng và Ranking tác giả hằng đêm.

---

## 💻 Công nghệ Sử dụng

| Phân lớp (Tier) | Stack & Thư viện Chính |
|--|--|
| **Frontend** | Vue 3 (Composition API), TypeScript, Vite, Tailwind CSS 4, Pinia, Vue Router, Socket.io Client, Vite PWA, ApexCharts |
| **Backend** | Node.js 20, Express, Socket.io, AWS SDK v3 (S3 client cho R2), Cloudinary, Multer, Winston |
| **Database & Cache** | MySQL 8+, Redis, `ioredis` |
| **Bảo mật & Tối ưu** | JWT Auth, Google OAuth, bcrypt, Joi, Helmet, CORS, Rate-limit, Gzip Compression |

---

## 🛠️ Cài đặt & Chạy Local Dev

Hỗ trợ Setup qua Docker (Full stack) hoặc kết nối trực tiếp đến Database máy chủ qua Port-forwarding. 
Chi tiết hướng dẫn đầy đủ vui lòng xem tại: 📘 [docs/LOCAL_DOCKER_DEV.md](./docs/LOCAL_DOCKER_DEV.md)

### Yêu cầu nền tảng
- **Node.js**: v20+
- **Docker & Docker Compose**

### 1. Dựng Local Database & Cache
```bash
# Khởi động cụm MySQL + Redis + Adminer bằng Docker profiles:
docker compose --profile local-db up -d mysql redis adminer

# Thiết lập file môi trường cấu hình kết nối ứng với Docker local
cp backend/.env.docker.example backend/.env
```

### 2. Cấu hình & Chạy Backend
```bash
cd backend
npm install
npm run dev
# Server API chạy mặc định ở http://localhost:3000
```

### 3. Cấu hình & Chạy Frontend
```bash
cd frontend
npm install
npm run dev
# Vite Server chạy ở http://localhost:5173 và tự động proxy `/api` sang backend.
```

---

## 🔑 Biến Môi Trường (.env)

Hệ thống cung cấp sẵn các file thư viện `.env.*.example`. Các nhóm biến quan trọng cần chú ý khi tự host:

### Backend
- **Core Info**: `PORT`, `NODE_ENV`, `CLIENT_URL`, `BASE_URL`
- **Database**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **Tương tác**: `REDIS_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`
- **Lưu trữ Cứng (Storage/CDN)**: Cụm `R2_*` cấu hình cho Cloudflare R2 bucket và `CLOUDINARY_*` cấu hình cho Ảnh tĩnh.

### Frontend
- **End-points**: `VITE_API_URL` (Domain Backend), `VITE_APP_IMAGE_URL` (Domain xử lý Ảnh), `VITE_CDN_BASE_URL` (Domain Cloudflare CDN phát JSON/Audio).

---

## 🚀 Môi trường Triển khai & Vận hành (Production)

| Dịch vụ | Domain Truy cập (Tham khảo) |
|---|---|
| **Frontend App** | `https://truyenviethay.id.vn` |
| **Backend API** | `https://api.truyenviethay.id.vn` |
| **Audio Truyền Media** | `https://audio.truyenviethay.id.vn` |
| **Content Truyện chữ** | `https://cdn.truyenviethay.id.vn` |

> 📚 **Tài liệu Deploy chuyên sâu cho Ubuntu/VPS:** Từng bước thiết lập Web Server Xem tại 📖 [DEPLOY.md](./DEPLOY.md)

---

## 📝 Cấu trúc Thư mục Chính

```text
truyenviethay_new/
├── backend/          # Toàn bộ mã nguồn Node.js
│   ├── config/       # Trình khởi tạo kết nối DB, Redis, R2...
│   ├── controllers/  # Tiếp nhận & Phản hồi HTTP Lifecycle 
│   ├── jobs/         # Danh sách các tiến trình chạy ngầm
│   ├── migrations/   # Quản lý Database schemas & Table Updates
│   ├── models/       # Thao tác CSDL (Thường dùng Query thô tối ưu hoá)
│   └── services/     # Chứa tầng Logic, tương tác lưu trữ File, User Auth
│
├── frontend/         # Toàn bộ mã Vue.js
│   ├── public/       # Thư mục gốc PWA, Logo, manifest...
│   └── src/          
│       ├── components/ # Khối UI độc lập, Layouts tổng
│       ├── modules/    # Stores trung tâm thao tác dữ liệu
│       ├── views/      # Giao diện Trang Ứng dụng
│       └── utils/      # Client CDN builder, Axios Interceptors
│
├── docker-compose.yml# File Orchestration để Run Development Environment
├── DEPLOY.md         # Document hướng dẫn Live App System
└── README.md         # File thuyết minh giới thiệu (bạn đang đọc)
```

<div align="center">
  <p><i>Phát triển bởi ❤️ và sự cẩn trọng tỉ mỉ dành cho nền tảng di động số.</i></p>
</div>
