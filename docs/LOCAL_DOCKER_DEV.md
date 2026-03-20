# Local Debug Modes

Tai lieu nay dung cho 2 truong hop:

- backend va frontend chay tren may local
- MySQL chay thang tren DO VPS hoac chay local bang Docker
- Redis co the giu local bang Docker
- production van chay tren VPS rieng

## 1. Yeu cau

- Docker Desktop hoac Docker Engine + Compose plugin
- Node.js 20.x
- Repo da clone day du

Kiem tra nhanh:

```bash
docker --version
docker compose version
node --version
```

## 2. Mode A: ket noi thang toi DO VPS database

Neu ban muon debug bug tren data that, khong can chay MySQL local. Thuong chi can Redis local:

```bash
docker compose up -d redis
docker compose ps
```

Copy env mau cho mode nay:

```bash
cp backend/.env.vps.example backend/.env
```

Neu ban dang dung PowerShell:

```powershell
Copy-Item backend/.env.vps.example backend/.env
```

Sau do dien host/user/password/database cua VPS vao `backend/.env`.

Co the dung tung bien:

```env
DB_HOST=your-do-vps-ip
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
REDIS_URL=redis://127.0.0.1:6380/0
```

Hoac dung 1 dong:

```env
DATABASE_URL=mysql://user:password@your-do-vps-ip:3306/truyenviethay
REDIS_URL=redis://127.0.0.1:6380/0
```

Khi backend start, log se in ra target DB dang dung de ban check nhanh.

## 3. Mode B: MySQL + Redis local bang Docker

Tai root project:

```bash
docker compose --profile local-db up -d mysql redis adminer
docker compose ps
```

Mac dinh stack local nay tao:

- MySQL: `127.0.0.1:3307`
- Redis: `127.0.0.1:6380`
- Adminer: `http://localhost:8080`

Thong tin dang nhap MySQL local mac dinh:

- database: `truyenviethay_dev`
- user: `truyen_app`
- password: `Truyen@2026!`
- root password: `root123`

Neu muon doi port hoac mat khau local, tao file `.env` o root project truoc khi chay Docker:

```env
LOCAL_MYSQL_PORT=3307
LOCAL_REDIS_PORT=6380
LOCAL_ADMINER_PORT=8080
LOCAL_MYSQL_DATABASE=truyenviethay_dev
LOCAL_MYSQL_USER=truyen_app
LOCAL_MYSQL_PASSWORD=Truyen@2026!
LOCAL_MYSQL_ROOT_PASSWORD=root123
```

## 4. Cau hinh backend local khi dung Docker DB

Copy file env mau:

```bash
cp backend/.env.docker.example backend/.env
```

Neu ban dang dung PowerShell:

```powershell
Copy-Item backend/.env.docker.example backend/.env
```

Kiem tra nhanh `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=truyen_app
DB_PASSWORD=Truyen@2026!
DB_NAME=truyenviethay_dev
REDIS_URL=redis://127.0.0.1:6380/0
```

## 5. Chay migration local

Apply cac migration danh so:

```bash
docker compose exec -T mysql sh -lc 'for f in /migrations/[0-9][0-9]_*.sql; do echo "Applying $f"; mysql -h127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$f"; done'
```

Neu can them `create_story_views.sql`:

```bash
docker compose exec -T mysql sh -lc 'mysql -h127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < /migrations/create_story_views.sql'
```

Kiem tra ket noi:

```bash
docker compose exec -T mysql sh -lc 'mysql -h127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1"'
docker compose exec -T redis redis-cli ping
```

## 6. Import data tu VPS ve local

### Dump tren VPS

SSH vao VPS va tao dump:

```bash
mysqldump -h 127.0.0.1 -u truyen_app -p --single-transaction --quick --default-character-set=utf8mb4 truyenviethay > /root/truyenviethay-dev.sql
```

### Copy dump ve may local

Chay tren may local:

```bash
scp root@178.128.25.84:/root/truyenviethay-dev.sql ./docker/mysql/dumps/truyenviethay-dev.sql
```

### Import vao MySQL local

Neu local DB da co data cu va ban muon reset sach:

```bash
docker compose down -v
docker compose up -d mysql redis adminer
```

Import dump vao local:

```bash
docker compose exec -T mysql sh -lc 'mysql -h127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < /dumps/truyenviethay-dev.sql'
```

Neu dump cu hon schema hien tai, chay lai migration sau khi import.

## 7. Chay backend + frontend local

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Kiem tra nhanh:

```bash
curl http://localhost:3000/healthcheck
```

Frontend dev mac dinh:

- `http://localhost:5173`

## 8. Adminer

Mo:

```text
http://localhost:8080
```

Dang nhap:

- System: `MySQL`
- Server: `mysql`
- Username: `truyen_app`
- Password: `Truyen@2026!`
- Database: `truyenviethay_dev`

Neu mo Adminer bang browser tren may host ma khong vao duoc bang `mysql`, thu `127.0.0.1` hoac ten container `truyenviethay-mysql`.

## 9. Lenh thuong dung

Khoi dong lai stack:

```bash
docker compose up -d redis
```

Neu muon bat ca local MySQL + Adminer:

```bash
docker compose --profile local-db up -d mysql redis adminer
```

Xem log:

```bash
docker compose logs -f mysql
docker compose logs -f redis
```

Dung stack:

```bash
docker compose down
```

Reset sach volume:

```bash
docker compose down -v
```

## 10. Luu y

- Khong dung dump production raw de chia se cho nguoi khac.
- Khi da paste secret that ra ngoai, nen rotate lai secret production.
- Local Docker stack nay dung port `3307` va `6380` de tranh dung voi service local san co.
- Production `.env` tren VPS va local `backend/.env` phai tach rieng.
