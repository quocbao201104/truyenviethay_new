# Deployment Guide

Tài liệu này phản ánh kiến trúc deploy hiện tại của TruyenVietHay:

- frontend build tĩnh trên Vercel
- backend Node.js/Express chạy riêng
- MySQL cho dữ liệu nghiệp vụ
- Redis cho cache, queue, socket presence/state
- Cloudinary cho ảnh
- R2 hoặc S3-compatible object storage cho nội dung chương
- CDN/public domain đứng trước bucket chương

Điểm khác biệt lớn so với tài liệu cũ:

- frontend không đọc nội dung chương qua backend nữa
- frontend lấy metadata chương từ API, sau đó fetch JSON chương trực tiếp từ CDN
- backend upload file chương `.json.gz` lên R2/S3-compatible storage và lưu metadata trong DB

## 1. Sơ đồ triển khai

```text
Browser
  ├─ Frontend app (Vercel / static hosting)
  ├─ API requests -> Backend (Express)
  └─ Chapter content requests -> CDN domain -> R2/S3-compatible bucket

Backend
  ├─ MySQL
  ├─ Redis
  ├─ Cloudinary
  └─ R2/S3-compatible object storage
```

Luồng đọc chương:

1. FE gọi API lấy metadata chương.
2. FE build URL CDN bằng `storyId`, `chapterId`, `content_hash`.
3. FE fetch trực tiếp file JSON chương từ CDN.

## 2. Dịch vụ cần chuẩn bị

- Frontend hosting: Vercel hoặc static host tương đương
- Backend hosting: Render/Railway/Fly.io/VM
- MySQL 8+
- Redis
- Cloudinary
- Cloudflare R2 hoặc storage S3-compatible có public endpoint/CDN
- Google OAuth client nếu dùng đăng nhập Google

## 3. Biến môi trường

## Backend

Tối thiểu:

```env
NODE_ENV=production
PORT=3000

DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
REDIS_URL=
BASE_URL=https://api.truyenviethay.id.vn

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

R2_ENDPOINT=
R2_REGION=auto
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_BASE_URL=https://cdn.truyenviethay.id.vn

CLIENT_URL=https://truyenviethay.id.vn
GOOGLE_CLIENT_ID=
```

Biến tùy chọn hay dùng:

```env
LOG_LEVEL=info
LOG_DIR=logs
LOG_CACHE_HIT_MISS=0
CACHE_DEBUG=0
HISTORY_CAP_PER_USER=200
```

## Frontend

```env
VITE_API_URL=https://api.truyenviethay.id.vn
VITE_APP_IMAGE_URL=https://api.truyenviethay.id.vn
VITE_CDN_BASE_URL=https://cdn.truyenviethay.id.vn
VITE_GOOGLE_CLIENT_ID=
```

## 4. Database

### Yêu cầu

- chạy toàn bộ migration trong `backend/migrations/`
- kiểm tra các bảng/cột quan trọng:
  - `truyen_new.is_deleted`
  - `truyen_new.so_luong_chuong`
  - `chuong.content_url`
  - `chuong.content_hash`
  - `chuong.content_length`
  - `daily_stats`
  - `author` related tables

### Ghi chú

- author ranking, dashboard, hot score và story listings phụ thuộc vào `daily_stats`, `hot_score`, `is_deleted`
- nếu database thiếu các migration phase mới, list/ranking có thể sai

## 5. Redis

Redis hiện được dùng cho:

- app cache
- notification queue/worker
- world chat / author room presence
- online status
- view tracking buffer trước khi sync về MySQL

Nếu thiếu Redis:

- app vẫn có thể chạy ở mức hạn chế ở vài chỗ fallback
- nhưng cache, socket state, queue và một số job sẽ không vận hành đúng

## 6. R2 / CDN cho nội dung chương

Đây là phần cần cấu hình đúng nhất.

### Backend đang upload gì

File [backend/services/r2ChapterStorage.service.js](C:/Users/Admin/Downloads/web/truyenviethay_new/backend/services/r2ChapterStorage.service.js) hiện:

- build key: `chapters/{storyId}/{chapterId}.json`
- tạo payload JSON gồm `id`, `story_id`, `title`, `content`, `updated_at`
- gzip payload trước khi upload
- set:
  - `Content-Type: application/json`
  - `Content-Encoding: gzip`
  - `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`

### Cần đảm bảo

- bucket/public domain cho phép GET công khai file chương
- CDN không strip query string
- CDN không đổi `Content-Encoding`
- CDN không ép tải file về dạng attachment
- CDN path phải map đúng tới prefix `chapters/...`

### Frontend đang build URL như thế nào

File [frontend/src/utils/chapterCdn.ts](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/utils/chapterCdn.ts):

```ts
{VITE_CDN_BASE_URL}/chapters/{storyId}/{chapterId}.json?v={content_hash}
```

Lưu ý:

- query `v=` là cơ chế bust cache khi nội dung chương đổi
- nếu CDN bỏ qua query string trong cache key, người dùng sẽ dễ thấy nội dung cũ

## 7. Deploy backend

Ví dụ với Render:

1. tạo Web Service trỏ root `backend`
2. build command:

```bash
npm install
```

3. start command:

```bash
node index.js
```

4. inject các env vars backend
5. xác nhận port nội bộ khớp `PORT`

### Việc backend tự khởi động khi chạy production

Trong [backend/index.js](C:/Users/Admin/Downloads/web/truyenviethay_new/backend/index.js), app sẽ:

- start HTTP server
- init Socket.io
- clear online status cũ
- start toàn bộ cron jobs và notification worker khi `NODE_ENV !== test`

Nếu deploy nhiều replica backend:

- cron jobs và worker sẽ chạy trên mọi replica nếu không tách riêng
- nên cân nhắc:
  - 1 worker/backend chính cho cron
  - các replica còn lại chỉ serve traffic

## 8. Deploy frontend

Ví dụ với Vercel:

1. import project với root `frontend`
2. framework: Vite
3. build command:

```bash
npm run build
```

4. output dir:

```bash
dist
```

5. inject env vars frontend

### File cấu hình có sẵn

- [frontend/vite.config.ts](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vite.config.ts)
- [frontend/vercel.json](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json)

`vercel.json` hiện đã có:

- SPA rewrite về `index.html`
- `no-store` cho HTML/routes
- cache immutable cho assets build

## 9. CORS và domain

Hiện có 2 nơi cần kiểm tra:

### HTTP API

[backend/app.js](C:/Users/Admin/Downloads/web/truyenviethay_new/backend/app.js) đang hardcode danh sách origin.

Nếu đổi domain frontend, cần sửa file này hoặc refactor sang env-driven CORS.

### Socket

[backend/config/socket.js](C:/Users/Admin/Downloads/web/truyenviethay_new/backend/config/socket.js) dùng `CLIENT_URL`.

Nếu đổi domain frontend, cần đồng bộ cả app HTTP lẫn socket.

## 10. Cloudinary

Cloudinary vẫn là nơi lưu:

- ảnh bìa
- avatar
- badge assets
- shop assets

Frontend lấy ảnh qua `VITE_APP_IMAGE_URL` hoặc fallback `VITE_API_URL`.

Nếu bạn muốn tách hẳn image domain riêng, cần cập nhật:

- env frontend
- helper ở `frontend/src/config/constants.ts`
- chính sách CORS/cache nếu ảnh đi qua domain mới

## 11. Checklist sau deploy

- frontend load được ở domain chính
- API `/healthcheck` trả `OK`
- login/logout hoạt động
- socket notification/chat kết nối được
- upload ảnh bìa/avatar hoạt động
- mở một chương:
  - metadata API trả OK
  - request JSON chương đi trực tiếp tới CDN
  - response có `Content-Type: application/json`
  - response có `Content-Encoding: gzip` nếu CDN pass-through
- tạo/chỉnh sửa chương:
  - DB cập nhật `content_url`, `content_hash`, `content_length`
  - bucket có file mới đúng path
  - URL mới có thể đọc qua CDN
- ranking/hot stories hiển thị đúng
- cron jobs có log startup và chạy bình thường

## 12. Cache strategy hiện tại

### Frontend build

- HTML / app route: `no-store`
- assets hash: immutable cache dài hạn

### Story/chapter metadata

- backend dùng Redis cache cho nhiều list/detail
- khi update story/chapter/approval sẽ invalidate key liên quan

### Chapter content

- cache dài hạn ở CDN/object storage
- bust cache bằng `content_hash` trong query string
- frontend dùng `force-cache`
- có prefetch chương tiếp theo để warm cache

## 13. Những lỗi hay gặp

### Chương vẫn hiện nội dung cũ sau khi sửa

Nguyên nhân thường gặp:

- CDN ignore query string
- metadata chưa cập nhật `content_hash`
- file mới chưa upload thành công lên bucket

### Mở chương 404 dù metadata có

Kiểm tra:

- `R2_PUBLIC_BASE_URL`
- bucket path `chapters/{storyId}/{chapterId}.json`
- public access policy / custom domain mapping

### Ảnh không hiện

Kiểm tra:

- `VITE_APP_IMAGE_URL`
- Cloudinary URL/path
- helper trong `frontend/src/config/constants.ts`

### Frontend gọi API được nhưng socket fail

Kiểm tra:

- `CLIENT_URL`
- CORS config trong `backend/app.js`
- websocket support ở provider backend/proxy

### Cron chạy lặp nhiều lần

Nguyên nhân:

- đang chạy nhiều backend replica cùng lúc

Giải pháp:

- tách worker/cron process riêng
- hoặc chỉ giữ cron ở 1 service duy nhất

## 14. Khuyến nghị vận hành

- giữ `cdn` riêng cho chapter content
- không để backend serve nội dung chương public ở production
- không strip query string trên CDN path chương
- tách backend API và worker nếu scale nhiều instance
- theo dõi Redis memory vì app cache + chat + queue + presence cùng dùng chung
- định kỳ kiểm tra cron logs cho:
  - view sync
  - daily stats
  - author ranking
  - reconcile aggregates
