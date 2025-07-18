# 餐廳訂位系統

使用 Node.js、Express 和 PostgreSQL 建立的餐廳訂位網站。

## 功能特色

- 線上訂位表單
- 後台管理系統（需登入）
- 訂位狀態管理
- 即時統計資料
- 響應式設計

## 環境需求

- Node.js >= 14.0.0
- PostgreSQL 資料庫
- npm 或 yarn

## 本地安裝

1. 複製專案
```bash
git clone <repository-url>
cd restaurant-booking
```

2. 安裝依賴
```bash
npm install
```

3. 設定環境變數
複製 `.env.example` 為 `.env` 並修改資料庫連線資訊：
```
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_booking
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
PORT=3000
```

4. 建立資料庫
**方法一：自動初始化（推薦）**
應用程式啟動時會自動建立資料表和管理員帳號。

**方法二：手動初始化**
```bash
npm run setup
```

**方法三：使用 SQL 指令**
執行 `database/schema.sql` 中的 SQL 指令來建立資料庫結構。

5. 啟動伺服器
```bash
npm start
```

## Zeabur 部署

1. 在 Zeabur 建立新專案
2. 連接 GitHub 儲存庫
3. 在 Zeabur 環境變數中設定：
   - DATABASE_URL（使用 Zeabur PostgreSQL 服務）
   - JWT_SECRET
   - SESSION_SECRET
4. 部署會自動進行

## 預設管理員帳號

應用程式啟動時會自動建立管理員帳號：
- 帳號：`admin`
- 密碼：`admin123`

如需手動建立管理員帳號：
```bash
node scripts/create-admin.js
```

## API 端點

### 公開端點
- `POST /api/reservations/create` - 建立新訂位
- `GET /api/reservations/check-availability` - 檢查時段可用性

### 需要認證的端點
- `POST /api/auth/login` - 管理員登入
- `POST /api/auth/logout` - 登出
- `GET /api/admin/reservations` - 取得訂位列表
- `PUT /api/admin/reservations/:id/status` - 更新訂位狀態
- `GET /api/admin/dashboard-stats` - 取得統計資料