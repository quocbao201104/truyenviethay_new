# TruyenVietHay

<p align="center">
  <img src="frontend/src/assets/images/logo.png" alt="TruyenVietHay logo" width="220">
</p>

<p align="center">
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js" alt="Vue 3"></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite" alt="Vite"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js" alt="Node.js"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.x-000000?logo=express" alt="Express"></a>
  <a href="https://socket.io"><img src="https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io" alt="Socket.io"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql" alt="MySQL"></a>
</p>

TruyenVietHay là nền tảng đọc truyện chữ full-stack với trọng tâm là hiệu năng đọc chương, trải nghiệm mobile, gamification, author profile/ranking và tương tác thời gian thực.

## Môi trường hiện tại

| Thành phần | URL |
| --- | --- |
| Frontend | [https://truyenviethay.id.vn](https://truyenviethay.id.vn) |
| Backend API | [https://api.truyenviethay.id.vn](https://api.truyenviethay.id.vn) |
| CDN chương | [https://cdn.truyenviethay.id.vn](https://cdn.truyenviethay.id.vn) |

## Kiến trúc hiện tại

### 1. Metadata qua API, nội dung chương qua CDN

Đây là thay đổi quan trọng nhất so với tài liệu cũ.

Luồng đọc chương hiện tại:

1. Frontend gọi API backend để lấy metadata chương qua slug.
2. Backend trả về metadata như `id`, `truyen_id`, `content_url`, `content_hash`, `content_length`, điều hướng trước/sau.
3. Frontend tự build URL CDN dạng `https://cdn.../chapters/{storyId}/{chapterId}.json?v={content_hash}`.
4. Frontend `fetch()` trực tiếp file JSON chương từ CDN với `cache: "force-cache"`.
5. Frontend có prefetch chương tiếp theo để làm ấm cache.

Điều này giúp:

- giảm tải backend khi đọc chương
- tận dụng cache CDN cho nội dung ít thay đổi
- dễ version hóa nội dung bằng `content_hash`
- backend chỉ giữ metadata, không phải stream toàn bộ nội dung chương cho mọi request đọc

### 2. Backend lưu metadata, storage chương nằm ngoài database

Khi tác giả tạo hoặc cập nhật chương:

- backend upload JSON chương đã gzip lên R2/S3-compatible storage
- lưu `content_url`, `content_hash`, `content_length` trong bảng `chuong`
- frontend dùng metadata đó để tải từ CDN/public bucket

File triển khai chính:

- [backend/services/r2ChapterStorage.service.js](C:/Users/Admin/Downloads/web/truyenviethay_new/backend/services/r2ChapterStorage.service.js)
- [frontend/src/utils/chapterCdn.ts](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/utils/chapterCdn.ts)
- [frontend/src/views/ChapterView.vue](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/ChapterView.vue)

### 3. Ảnh vẫn đi qua image base / Cloudinary

- Ảnh bìa, avatar, badge, shop item hiện vẫn theo hướng Cloudinary / image base.
- Frontend lấy qua `VITE_APP_IMAGE_URL` hoặc fallback `VITE_API_URL`.

### 4. Redis + cron jobs là phần lõi của vận hành

Backend hiện không chỉ là REST API. Nó còn chạy:

- socket server cho notification/chat
- Redis cache app-level
- Redis state cho online presence / chat / queue
- cron jobs cho:
  - sync view
  - daily stats
  - author ranking
  - notification cleanup
  - reward/inventory expiration
  - history cleanup
  - reconcile aggregates

## Tính năng chính

### Đọc truyện

- đọc truyện tối ưu cho mobile
- chapter metadata qua API, chapter content qua CDN
- lịch sử đọc và continue reading
- prefetch chương tiếp theo
- sắp xếp/lọc/trạng thái/truyện hot/top/thể loại

### Author system

- hồ sơ tác giả công khai
- follow tác giả
- phòng chat riêng theo tác giả
- bảng xếp hạng tác giả
- thống kê views/story/follower

### Tương tác

- follow truyện
- like truyện
- rating truyện
- comment/reply
- soft delete comment

### Gamification

- level / exp / rewards
- mailbox
- badges
- inventory
- shop

### Admin & moderation

- duyệt truyện/chương
- ranking và dashboard
- cache admin
- soft delete truyện bằng `truyen_new.is_deleted`

## Công nghệ sử dụng

### Frontend

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- ApexCharts
- Swiper
- Socket.io Client
- Vite PWA

### Backend

- Node.js 20
- Express
- MySQL 8+
- Redis / Upstash Redis
- Socket.io
- JWT + Google OAuth
- Cloudinary
- AWS SDK S3 client cho R2/S3-compatible object storage
- node-cron

## Cấu trúc thư mục

```text
truyenviethay_new/
├─ backend/
│  ├─ app.js
│  ├─ index.js
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ migrations/
│  ├─ jobs/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  └─ utils/
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ composables/
│  │  ├─ config/
│  │  ├─ modules/
│  │  ├─ utils/
│  │  └─ views/
│  ├─ vite.config.ts
│  └─ vercel.json
├─ DEPLOY.md
└─ README.md
```

## Biến môi trường quan trọng

### Backend

Tối thiểu nên có:

- `PORT`
- `NODE_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `REDIS_URL`
- `BASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `R2_ENDPOINT`
- `R2_REGION`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BASE_URL`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`

### Frontend

- `VITE_API_URL`
- `VITE_APP_IMAGE_URL`
- `VITE_CDN_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Chạy local

### Docker dev stack

Cách nhanh và ổn định nhất cho local dev hiện tại là chạy backend/frontend trên máy local, còn MySQL + Redis bằng Docker.

Tại root project:

```bash
docker compose up -d mysql redis adminer
cp backend/.env.docker.example backend/.env
```

Mặc định:

- MySQL: `127.0.0.1:3307`
- Redis: `127.0.0.1:6380`
- Adminer: `http://localhost:8080`

Sau khi stack lên, chạy migration:

```bash
docker compose exec -T mysql sh -lc 'for f in /migrations/[0-9][0-9]_*.sql; do echo "Applying $f"; mysql -h127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$f"; done'
docker compose exec -T mysql sh -lc 'mysql -h127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < /migrations/create_story_views.sql'
```

Xem hướng dẫn đầy đủ tại [docs/LOCAL_DOCKER_DEV.md](C:/Users/Admin/Downloads/web/truyenviethay_new/docs/LOCAL_DOCKER_DEV.md).

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend chạy mặc định ở `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev chạy ở `http://localhost:5173`.

Vite dev server sẽ proxy:

- `/api` -> `VITE_API_URL`
- `/uploads_img` -> `VITE_API_URL`

### 3. Database / migration

Project dùng SQL migration trong `backend/migrations/`.

Khi setup môi trường mới:

1. tạo schema MySQL
2. chạy các migration theo thứ tự
3. kiểm tra các cột quan trọng đã tồn tại:
   - `truyen_new.is_deleted`
   - `truyen_new.so_luong_chuong`
   - `chuong.content_url`
   - `chuong.content_hash`
   - `chuong.content_length`
   - `daily_stats`

## Lưu ý vận hành

### Cache

- frontend assets trên Vercel đang để immutable
- HTML có `no-store`
- JSON chương trên CDN cache dài hạn, backend dùng `content_hash` để bust cache
- đừng cấu hình CDN strip query string cho route chương

### Soft delete

- truyện không còn xóa cứng mặc định
- hệ thống đã dùng `truyen_new.is_deleted` để loại truyện khỏi các list public/ranking/detail chính

### CORS / domain

HTTP API và Socket.io hiện đọc origin từ env:

- `CLIENT_URL`
- `CLIENT_URLS`
- `CORS_ORIGINS`

Nếu thêm domain frontend mới, chỉ cần cập nhật env backend.

## Scripts / jobs nền

Backend khởi động các job sau ở production:

- `viewSyncCronjob`
- `dailyStatsCronjob`
- `notificationCleanupCronjob`
- `expireRewardsCronjob`
- `expireInventoryCronjob`
- `cleanupHistoryOrphansCronjob`
- `reconcileAggregatesCronjob`
- `authorRankingCronjob`
- notification worker

## Tài liệu triển khai

Xem chi tiết ở [DEPLOY.md](./DEPLOY.md).
