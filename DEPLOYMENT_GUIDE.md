# GradPilot 2.0 部署指南

## 🎉 專案完成狀態

### ✅ 已完成的功能

**後端 (100%)**
- ✅ 用戶註冊/登入系統 (JWT 認證)
- ✅ 待辦清單 CRUD
- ✅ 筆記系統 CRUD
- ✅ 番茄鐘計時與統計
- ✅ 儀表板綜合統計 API

**前端 (100%)**
- ✅ 登入/註冊頁面
- ✅ 儀表板首頁
- ✅ 時鐘與問候組件
- ✅ 統計卡片顯示
- ✅ 待辦清單 (新增/完成/刪除)
- ✅ 番茄鐘計時器 (圓環進度顯示)
- ✅ 快速筆記 (多色彩、置頂功能)

---

## 🚀 本地測試

### 1. 啟動後端

```bash
cd backend

# 安裝依賴
pip install -r requirements.txt

# 運行（自動使用 SQLite）
python app.py
```

後端運行於: `http://localhost:5000`

### 2. 啟動前端

```bash
cd frontend

# 安裝依賴
npm install

# 運行開發伺服器
npm run dev
```

前端運行於: `http://localhost:5173`

### 3. 測試流程

1. 訪問 `http://localhost:5173`
2. 註冊新帳號
3. 登入後進入儀表板
4. 測試功能：
   - 新增待辦事項
   - 啟動番茄鐘
   - 創建筆記
   - 查看統計數據

---

## 📦 部署到 GitHub

### 初始化 Git 倉庫

```bash
cd /Users/vista/gradpilot-v2

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: GradPilot 2.0 MVP完成

- 完整的後端 API (Flask + PostgreSQL)
- 完整的前端 UI (React + Tailwind)
- 用戶認證系統
- 待辦清單功能
- 番茄鐘計時器
- 筆記系統
- 儀表板統計"

# 創建 GitHub 倉庫後推送
git remote add origin https://github.com/你的用戶名/gradpilot-v2.git
git branch -M main
git push -u origin main
```

---

## 🌐 部署到 Render

### 方式一：使用 render.yaml（推薦）

1. **推送到 GitHub**（如上）

2. **在 Render 創建新專案**
   - 登入 [Render Dashboard](https://dashboard.render.com)
   - 點擊 "New +" → "Blueprint"
   - 連接你的 GitHub 倉庫
   - Render 會自動檢測 `render.yaml`

3. **部署**
   - 點擊 "Apply"
   - 等待部署完成（約 5-10 分鐘）

4. **訪問應用**
   - Frontend: `https://gradpilot-frontend.onrender.com`
   - Backend: `https://gradpilot-backend.onrender.com`

### 方式二：手動部署

#### 後端部署

1. Render Dashboard → "New +" → "Web Service"
2. 連接 GitHub 倉庫
3. 設定：
   - **Name**: `gradpilot-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --config gunicorn.conf.py wsgi:app`
4. 環境變數：
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = `(點擊 Generate 生成)`
   - `JWT_SECRET_KEY` = `(點擊 Generate 生成)`
   - `DATABASE_URL` = `(連接 PostgreSQL 資料庫)`
   - `CORS_ORIGINS` = `https://gradpilot-frontend.onrender.com`
5. 點擊 "Create Web Service"

#### PostgreSQL 資料庫

1. Render Dashboard → "New +" → "PostgreSQL"
2. 設定：
   - **Name**: `gradpilot-db`
   - **Database**: `gradpilot`
   - **User**: `gradpilot`
   - **Region**: `Singapore`
   - **Plan**: `Free`
3. 創建後，複製 `Internal Database URL`
4. 貼到後端的 `DATABASE_URL` 環境變數

#### 前端部署

1. Render Dashboard → "New +" → "Static Site"
2. 連接 GitHub 倉庫
3. 設定：
   - **Name**: `gradpilot-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. 環境變數：
   - `VITE_API_URL` = `https://gradpilot-backend.onrender.com/api`
5. 點擊 "Create Static Site"

---

## ⚙️ 環境變數說明

### 後端環境變數

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `FLASK_ENV` | 環境模式 | `production` |
| `SECRET_KEY` | Flask 密鑰 | `(自動生成)` |
| `JWT_SECRET_KEY` | JWT 密鑰 | `(自動生成)` |
| `DATABASE_URL` | 資料庫連接 | `postgresql://user:pass@host/db` |
| `CORS_ORIGINS` | 允許的前端域名 | `https://your-frontend.com` |

### 前端環境變數

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `VITE_API_URL` | 後端 API 地址 | `https://your-backend.com/api` |

---

## 🐛 常見問題

### Q: 前端無法連接後端
**A:** 檢查：
1. 後端 `CORS_ORIGINS` 是否包含前端域名
2. 前端 `VITE_API_URL` 是否正確
3. 後端 `/health` 端點是否正常

### Q: Render 免費方案會休眠？
**A:** 是的，15 分鐘無活動會休眠。解決方案：
1. 使用 UptimeRobot 每 10 分鐘 ping 一次
2. 升級到付費方案

### Q: 資料庫連接失敗？
**A:** 確認：
1. PostgreSQL 已創建
2. `DATABASE_URL` 格式正確
3. 網路連線正常

---

## 📊 專案統計

- **總代碼行數**: ~3000 行
- **後端文件**: 15 個
- **前端組件**: 10 個
- **API 端點**: 20+ 個
- **開發時間**: 1 天

---

## 🎯 下一步擴展

- [ ] 週統計圖表（Recharts）
- [ ] 文獻管理功能
- [ ] 實驗記錄系統
- [ ] 團隊協作功能
- [ ] 移動端 App

---

## 💡 技術亮點

1. **全端分離**: 前後端獨立部署
2. **雲端同步**: PostgreSQL 雲端資料庫
3. **安全認證**: JWT Token + bcrypt 密碼加密
4. **現代 UI**: Tailwind CSS + Lucide Icons
5. **響應式設計**: 支援桌面/平板/手機

---

**祝你部署順利！有任何問題隨時回來詢問。** 🚀
