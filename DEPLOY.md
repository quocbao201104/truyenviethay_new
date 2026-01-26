# Hướng Dẫn Deploy (Deployment Guide)

Tài liệu này hướng dẫn chi tiết quy trình đưa ứng dụng **TruyenVietHay** lên môi trường Production.

## 🏗 Chuẩn Bị
Trước khi deploy, hãy đảm bảo bạn đã có tài khoản tại các dịch vụ:
1.  **Vercel** (Frontend Hosting)
2.  **Render** (Backend Hosting)
3.  **Aiven** (MySQL Database)
4.  **Cloudinary** (Media Storage)

---

## 🚀 Bước 1: Deploy Database & Cloudinary

### 1.1. Aiven MySQL
*   Tạo service MySQL trên Aiven.
*   Lấy thông tin connection (`Host`, `Port`, `User`, `Password`, `Database`).
*   **Quan trọng**: Vào tab "Advanced configuration" hoặc "Connection pools" để đảm bảo `ssl-mode` được hỗ trợ (Project đã cấu hình `require` SSL nhưng tắt `rejectUnauthorized`).

### 1.2. Cloudinary
*   Lấy `Cloud Name`, `API Key`, `API Secret` từ Dashboard.
*   Vào Settings > Upload > Add upload preset (nếu cần), nhưng Backend hiện tại dùng cấu hình mặc định global.
*   **Lưu ý**: Đảm bảo "Strict Transformations" đang tắt hoặc đã cấu hình allowed transformations.

---

## 🚀 Bước 2: Deploy Backend (Render)

1.  Truy cập [Render Dashboard](https://dashboard.render.com).
2.  Chọn **New +** -> **Web Service**.
3.  Kết nối với repo GitHub của dự án.
4.  Điền thông tin:
    *   **Name**: `truyenviethay-backend`
    *   **Root Directory**: `backend` (Rất quan trọng!)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
5.  **Environment Variables** (Mục Advanced):
    *   `NODE_ENV`: `production`
    *   `PORT`: `3000` (Render sẽ tự override, nhưng cứ để)
    *   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: (Điền thông tin từ Aiven)
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (Điền thông tin Cloudinary)
    *   `JWT_SECRET`: (Điền chuỗi bảo mật ngẫu nhiên)
    *   `CLIENT_URL`: `*` (Tạm thời để `*` để test, sau khi có domain Frontend sẽ cập nhật lại sau).
6.  Nhấn **Create Web Service**.
7.  Chờ deploy thành công. Copy **URL Backend** (ví dụ: `https://truyenviethay-backend.onrender.com`).

---

## 🚀 Bước 3: Deploy Frontend (Vercel)

1.  Truy cập [Vercel Dashboard](https://vercel.com).
2.  Chọn **Add New...** -> **Project**.
3.  Import repo GitHub.
4.  Cấu hình Project:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Chọn `Edit` -> chọn thư mục `frontend`.
    *   **Build Command**: `npm run build` (Mặc định)
    *   **Output Directory**: `dist` (Mặc định)
5.  **Environment Variables**:
    *   `VITE_API_URL`: Dán URL Backend đã copy ở Bước 2 (Ví dụ: `https://truyenviethay-backend.onrender.com`). **Lưu ý**: Không có dấu `/` ở cuối.
6.  Nhấn **Deploy**.
7.  Chờ kết quả. Copy **URL Frontend** (ví dụ: `https://truyenviethay.vercel.app`).

---

## 🚀 Bước 4: Cập Nhật Security (Quan Trọng)

1.  Quay lại **Render Dashboard** (Backend).
2.  Vào mục **Environment**.
3.  Sửa biến `CLIENT_URL` thành URL Frontend vừa tạo (ví dụ: `https://truyenviethay.vercel.app`).
4.  Lưu lại. Render sẽ tự động redeploy.
5.  Việc này giúp ngăn chặn các trang web khác gọi trộm API của bạn (CORS Policy).

---

## ✅ Post-Deploy Checklist

1.  [ ] **Kiểm tra Frontend**: Truy cập trang web, các hình ảnh, icon load tốt không?
2.  [ ] **Kiểm tra API**: Thử đăng nhập/đăng ký. Nếu lỗi Network Error -> Kiểm tra `VITE_API_URL`. Nếu lỗi CORS -> Kiểm tra `CLIENT_URL` trên Render.
3.  [ ] **Kiểm tra Database**: Thử đọc một truyện, nội dung có hiện không?
4.  [ ] **Kiểm tra Upload**: Thử (nếu có quyền) upload ảnh avatar hoặc ảnh truyện -> Check Cloudinary xem ảnh có lên không.
5.  [ ] **Page Refresh**: Vào một trang con (ví dụ `/story/1`) và nhấn F5 (Refresh). Nếu lỗi 404 -> Vercel cần file `vercel.json` rewrite source.
    *   *Note*: Vite Project trên Vercel thường tự xử lý SPA rewrite. Nếu lỗi, tạo file `vercel.json` ở thư mục `frontend/` với nội dung:
        ```json
        {
          "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
        }
        ```

## ⚠️ Các Lỗi Thường Gặp

*   **Lỗi CORS**: Check kỹ `CLIENT_URL` ở Backend và `VITE_API_URL` ở Frontend. Đảm bảo không có dấu `/` thừa ở cuối.
*   **Lỗi DB Connection**: Kiểm tra IP Whitelist trên Aiven (nếu có bật), đảm bảo `0.0.0.0/0` hoặc IP của Render được phép.
*   **Lỗi 502 Bad Gateway**: Server Backend crash. Check tab "Logs" trên Render để xem lỗi (thường do sai tên biến môi trường hoặc lỗi code).
*   **Lỗi "Command not found"**: Check lại Root Directory khi deploy.
