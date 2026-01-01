# GradPilot 2.0 - 研究生學習儀表板

> 專為博碩士研究生打造的雲端學習管理系統

## 🎯 專案特色

- ✅ **雲端同步**：待辦清單、筆記跨裝置同步
- ✅ **番茄鐘**：專注時間追蹤與統計
- ✅ **進度視覺化**：圖表呈現學習數據
- ✅ **現代化 UI**：React + Tailwind CSS
- ✅ **安全認證**：JWT token 身份驗證

## 🏗️ 技術架構

### 後端
- **Flask 3.0** - Python Web 框架
- **PostgreSQL** - 關聯式資料庫
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - JWT 認證
- **Gunicorn** - WSGI 伺服器

### 前端
- **React 18** - UI 框架
- **Vite** - 構建工具
- **Tailwind CSS** - CSS 框架
- **Recharts** - 圖表庫
- **React Router** - 路由管理

## 🚀 快速開始

### 前置需求
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ (生產環境) / SQLite (開發環境)

### 後端設置

```bash
cd backend

# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 複製環境變數模板
cp .env.example .env
# 編輯 .env 設定資料庫等配置

# 運行開發伺服器
python app.py
```

後端將運行在 `http://localhost:5000`

### 前端設置

```bash
cd frontend

# 安裝依賴
npm install

# 運行開發伺服器
npm run dev
```

前端將運行在 `http://localhost:5173`

## 📖 API 文檔

### 認證端點
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶

### 待辦事項
- `GET /api/todos` - 獲取所有待辦
- `POST /api/todos` - 創建待辦
- `PUT /api/todos/:id` - 更新待辦
- `DELETE /api/todos/:id` - 刪除待辦

### 筆記
- `GET /api/notes` - 獲取所有筆記
- `POST /api/notes` - 創建筆記
- `PUT /api/notes/:id` - 更新筆記
- `DELETE /api/notes/:id` - 刪除筆記

### 番茄鐘
- `GET /api/pomodoro/sessions` - 獲取會話記錄
- `POST /api/pomodoro/sessions` - 創建會話
- `GET /api/pomodoro/stats` - 獲取統計數據

### 儀表板
- `GET /api/dashboard/stats` - 獲取儀表板統計

## 🐳 Docker 部署

```bash
# 構建並運行
docker-compose up -d
```

## 🌐 部署到 Render

### 後端部署
1. 推送到 GitHub
2. 在 Render 創建 Web Service
3. 連接倉庫，設定：
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn --config gunicorn.conf.py wsgi:app`
4. 添加環境變數：
   - `FLASK_ENV=production`
   - `SECRET_KEY=<生成強密碼>`
   - `DATABASE_URL=<PostgreSQL連接字串>`

### 前端部署
1. 在 Render 創建 Static Site
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`

## 📁 專案結構

```
gradpilot-v2/
├── backend/              # Flask 後端
│   ├── models/           # 資料模型
│   ├── routes/           # API 路由
│   ├── app.py            # 主應用
│   └── requirements.txt
│
├── frontend/             # React 前端
│   ├── src/
│   │   ├── components/   # React 組件
│   │   ├── pages/        # 頁面
│   │   ├── context/      # Context API
│   │   └── services/     # API 服務
│   └── package.json
│
└── README.md
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 📧 聯繫

- 專案主頁: https://github.com/iamvista/gradpilot
- 問題回報: https://github.com/iamvista/gradpilot/issues
- Email: iamvista@gmail.com

## 💖 支持專案

如果這個工具對你有幫助，歡迎：
- ⭐ 給專案一個 Star
- 🐛 回報問題或建議
- 🔀 提交 Pull Request
- ☕ [請我喝杯咖啡](https://vista.im/coffee)

---

**用心打造，助力研究生學習！** 📚✨
