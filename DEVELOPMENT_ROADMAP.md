# GradPilot 2.0 開發路線圖
> 完整功能規劃與實現順序
> 更新日期：2026-01-01

---

## 📋 目錄
1. [專案願景](#專案願景)
2. [核心功能模組](#核心功能模組)
3. [開發階段](#開發階段)
4. [技術架構](#技術架構)
5. [時程規劃](#時程規劃)

---

## 🎯 專案願景

**GradPilot 2.0** - 研究生全方位學習管理平台

整合以下核心功能：
- ✅ 待辦事項管理（已完成）
- ✅ 筆記管理（已完成）
- ✅ 番茄鐘計時器（已完成）
- ✅ 用戶認證與資料管理（已完成）
- 🆕 **學術文獻管理**（整合 reference-formatter）
- 🆕 全局搜索與數據導出
- 🆕 標籤管理系統
- 🆕 提醒通知系統
- 🆕 深色模式
- 🆕 統計與分析增強

---

## 🧩 核心功能模組

### ✅ 已完成模組

#### 1. 用戶系統
- [x] 註冊/登入
- [x] JWT 認證
- [x] 忘記密碼/重置密碼
- [x] 個人資料管理
- [x] 密碼修改

#### 2. 待辦事項 (Todos)
- [x] CRUD 操作
- [x] 優先級設定
- [x] 標籤系統
- [x] 截止日期
- [x] 完成狀態追蹤

#### 3. 筆記 (Notes)
- [x] CRUD 操作
- [x] 分類管理
- [x] 顏色標籤
- [x] 置頂功能
- [x] 標籤系統

#### 4. 番茄鐘 (Pomodoro)
- [x] 計時功能
- [x] 會話記錄
- [x] 統計數據
- [x] 自定義時長

#### 5. 儀表板 (Dashboard)
- [x] 統計概覽
- [x] 快速訪問
- [x] 時鐘與問候

#### 6. 後端 API（已完成但前端未實現）
- [x] 全局搜索 API
- [x] 數據導出 API（JSON/CSV/Markdown）

---

## 🚀 開發階段

### 第一階段：UI 完善（Week 1-2）

#### Phase 1.1: 搜索功能 UI 🔍
**優先級：高**
**預計時間：2-3 小時**

**後端（已完成）：**
- ✅ GET /api/search - 全局搜索
- ✅ GET /api/search/todos - 搜索待辦
- ✅ GET /api/search/notes - 搜索筆記

**前端開發：**
- [ ] 在導航欄添加搜索圖標
- [ ] 創建 SearchModal 組件
- [ ] 實時搜索（debounce）
- [ ] 搜索結果高亮
- [ ] 按類型分組顯示結果
- [ ] 點擊結果快速跳轉
- [ ] 鍵盤快捷鍵（Ctrl/Cmd + K）

**技術要點：**
- 使用 Modal 組件（彈出式）
- Debounce 搜索請求（300ms）
- 高亮匹配關鍵字（使用 mark.js 或自定義）
- 支持方向鍵導航

---

#### Phase 1.2: 數據導出 UI 📥
**優先級：高**
**預計時間：2 小時**

**後端（已完成）：**
- ✅ GET /api/export/all - 導出所有數據
- ✅ GET /api/export/todos?format=json|csv|md
- ✅ GET /api/export/notes?format=json|md

**前端開發：**
- [ ] 在設置頁面添加「數據管理」區塊
- [ ] 導出選項選擇器
- [ ] 一鍵下載功能
- [ ] 導出進度提示
- [ ] 成功/失敗反饋

**UI 設計：**
```
📦 數據管理
  ├─ 導出所有數據 (JSON)
  ├─ 導出待辦事項 (JSON/CSV/Markdown)
  ├─ 導出筆記 (JSON/Markdown)
  └─ 導出番茄鐘記錄 (JSON/CSV)
```

---

### 第二階段：文獻管理系統（Week 3-4）

#### Phase 2.1: 後端整合 📚
**優先級：極高**
**預計時間：1 天**

**任務：**
1. **遷移核心模組**
   - [ ] 複製 reference-formatter/modules 到 gradpilot-v2/backend
   - [ ] 重命名為 references 模組
   - [ ] 適配 GradPilot 項目結構

2. **創建數據模型**
   ```python
   class Reference(db.Model):
       id = Integer (主鍵)
       user_id = Integer (外鍵)
       title = String (標題)
       authors = JSON (作者列表)
       year = Integer (年份)
       journal = String (期刊)
       volume = String (卷)
       issue = String (期)
       pages = String (頁碼)
       doi = String (DOI)
       url = String (URL)
       reference_type = String (article/book/conference)
       tags = String (標籤)
       notes = Text (個人筆記)
       created_at = DateTime
       updated_at = DateTime
   ```

3. **創建 API 路由**
   - [ ] POST /api/references/parse - 解析文獻
   - [ ] GET /api/references - 獲取文獻列表
   - [ ] POST /api/references - 創建文獻
   - [ ] GET /api/references/:id - 獲取單個文獻
   - [ ] PUT /api/references/:id - 更新文獻
   - [ ] DELETE /api/references/:id - 刪除文獻
   - [ ] POST /api/references/format - 格式化文獻
   - [ ] GET /api/references/export - 導出為 BibTeX

4. **整合 Crossref API**
   - [ ] 配置 API 客戶端
   - [ ] 添加 DOI 查詢功能
   - [ ] 自動補全文獻資訊

---

#### Phase 2.2: 前端文獻管理 UI
**優先級：極高**
**預計時間：2 天**

**組件結構：**
```
frontend/src/components/References/
  ├─ ReferenceList.jsx         # 文獻列表
  ├─ ReferenceCard.jsx         # 文獻卡片
  ├─ ReferenceForm.jsx         # 新增/編輯表單
  ├─ ReferenceParser.jsx       # 文獻解析器
  ├─ ReferenceFormatter.jsx    # 格式化工具
  └─ BibTeXExporter.jsx        # BibTeX 導出

frontend/src/pages/
  └─ ReferencesPage.jsx        # 文獻管理主頁面
```

**功能清單：**
- [ ] 文獻列表展示
- [ ] 按作者/年份/標題排序
- [ ] 批量導入（貼上多條文獻）
- [ ] 文獻解析（自動識別格式）
- [ ] 手動添加/編輯
- [ ] DOI 查詢補全
- [ ] 格式化預覽（APA/MLA/Chicago/Harvard）
- [ ] 複製引用格式
- [ ] 導出為 BibTeX
- [ ] 添加個人筆記
- [ ] 標籤管理

**UI 設計重點：**
- 左側：文獻列表（支持篩選、排序）
- 右側：文獻詳情與編輯
- 頂部：解析器工具欄
- 底部：批量操作按鈕

---

### 第三階段：標籤管理系統（Week 5）

#### Phase 3.1: 統一標籤系統 🏷️
**優先級：中**
**預計時間：1 天**

**後端開發：**
1. **創建 Tag 模型**
   ```python
   class Tag(db.Model):
       id = Integer
       user_id = Integer
       name = String (標籤名稱)
       color = String (顏色代碼)
       category = String (todos/notes/references)
       usage_count = Integer (使用次數)
       created_at = DateTime
   ```

2. **API 路由**
   - [ ] GET /api/tags - 獲取所有標籤
   - [ ] POST /api/tags - 創建標籤
   - [ ] PUT /api/tags/:id - 更新標籤
   - [ ] DELETE /api/tags/:id - 刪除標籤
   - [ ] GET /api/tags/suggestions - 智能建議

**前端開發：**
- [ ] TagManager 組件
- [ ] 標籤選擇器（支持創建新標籤）
- [ ] 標籤顏色選擇器
- [ ] 標籤統計視圖
- [ ] 按標籤篩選內容

---

### 第四階段：深色模式（Week 6）

#### Phase 4.1: 主題系統 🌙
**優先級：中**
**預計時間：1 天**

**技術實現：**
1. **使用 Tailwind Dark Mode**
   ```javascript
   // tailwind.config.js
   module.exports = {
     darkMode: 'class',
     // ...
   }
   ```

2. **創建主題 Context**
   ```jsx
   const ThemeContext = createContext()
   - light / dark / auto (跟隨系統)
   - 保存到 localStorage
   - 平滑過渡動畫
   ```

3. **更新所有組件**
   - [ ] 添加 dark: 前綴類名
   - [ ] 調整顏色方案
   - [ ] 確保對比度（WCAG AA）

4. **添加切換器**
   - [ ] 在導航欄添加主題切換按鈕
   - [ ] 太陽/月亮圖標
   - [ ] 過渡動畫

---

### 第五階段：提醒通知系統（Week 7-8）

#### Phase 5.1: 後端通知系統 🔔
**優先級：中低**
**預計時間：2 天**

**數據模型：**
```python
class Notification(db.Model):
    id = Integer
    user_id = Integer
    todo_id = Integer (可選)
    type = String (deadline/reminder/achievement)
    title = String
    message = Text
    scheduled_at = DateTime
    sent = Boolean
    read = Boolean
    created_at = DateTime
```

**功能：**
- [ ] 待辦事項到期提醒
- [ ] 提前 N 小時/天提醒
- [ ] 重複提醒設置
- [ ] 通知歷史記錄

---

#### Phase 5.2: 前端通知 UI
**預計時間：1 天**

**瀏覽器通知：**
- [ ] 請求通知權限
- [ ] 顯示系統通知
- [ ] 點擊跳轉到相關內容

**應用內通知：**
- [ ] 通知中心圖標（顯示未讀數量）
- [ ] 通知列表彈出層
- [ ] 標記已讀/全部已讀
- [ ] 通知設置頁面

---

### 第六階段：統計增強（Week 9）

#### Phase 6.1: 高級統計 📈
**優先級：低**
**預計時間：2 天**

**後端分析 API：**
- [ ] GET /api/analytics/productivity - 生產力分析
- [ ] GET /api/analytics/trends - 趨勢分析
- [ ] GET /api/analytics/heatmap - 熱力圖數據

**前端可視化：**
- [ ] 使用 Recharts 創建圖表
- [ ] 週/月/年度報表
- [ ] 完成率趨勢
- [ ] 番茄鐘專注力分析
- [ ] 學習時間分布
- [ ] 導出報表（PDF）

---

## 🏗️ 技術架構

### 後端技術棧
```
Flask 3.0
├─ Flask-JWT-Extended (認證)
├─ Flask-SQLAlchemy (ORM)
├─ Flask-CORS (跨域)
├─ Flask-Migrate (數據庫遷移)
├─ psycopg (PostgreSQL 驅動)
├─ bcrypt (密碼加密)
└─ 新增依賴：
   ├─ python-docx (Word 文檔)
   ├─ requests (API 調用)
   └─ beautifulsoup4 (可選，網頁抓取)
```

### 前端技術棧
```
React 18 + Vite
├─ React Router (路由)
├─ Axios (HTTP 請求)
├─ Tailwind CSS (樣式)
├─ Lucide React (圖標)
├─ Recharts (圖表)
└─ 新增依賴：
   ├─ react-hot-toast (通知提示)
   ├─ react-select (高級選擇器)
   ├─ mark.js (搜索高亮)
   ├─ date-fns (日期處理)
   └─ react-markdown (Markdown 渲染)
```

---

## 📅 時程規劃

### 快速實現路線（推薦）

**Week 1: 基礎 UI 完善**
- Day 1-2: 搜索功能 UI ✨
- Day 3-4: 數據導出 UI ✨
- Day 5-7: 測試與優化

**Week 2-3: 文獻管理核心**
- Day 1-3: 後端整合（模組遷移、API）✨✨✨
- Day 4-7: 前端 UI（文獻列表、解析器）✨✨✨
- Day 8-10: 格式化與導出功能

**Week 4: 標籤系統**
- Day 1-2: 後端 API
- Day 3-4: 前端 UI
- Day 5: 整合到現有功能

**Week 5: 深色模式**
- Day 1-2: 主題系統
- Day 3-4: 組件適配
- Day 5: 測試與調整

**Week 6-7: 通知系統（可選）**
- Day 1-3: 後端邏輯
- Day 4-6: 前端實現
- Day 7: 測試

**Week 8: 統計增強（可選）**
- Day 1-3: 數據分析 API
- Day 4-6: 圖表可視化
- Day 7: 報表導出

---

## 🎯 里程碑

### Milestone 1: UI 完善（2 週）
- ✅ 搜索功能完整可用
- ✅ 數據導出功能完整可用
- ✅ 用戶體驗優化

### Milestone 2: 文獻管理（3 週）
- ✅ 文獻 CRUD 完整
- ✅ 文獻解析器工作正常
- ✅ 格式化功能完整
- ✅ BibTeX 導出可用

### Milestone 3: 增強功能（3 週）
- ✅ 標籤管理系統
- ✅ 深色模式
- ✅ 基礎通知功能

### Milestone 4: 高級功能（可選）
- ⭕ 完整通知系統
- ⭕ 高級統計分析
- ⭕ AI 功能整合

---

## 🚀 立即開始

### 建議的實施順序：

1. **先快速見效**（提升用戶體驗）
   - 搜索 UI（2-3 小時）✨
   - 導出 UI（2 小時）✨

2. **核心差異化功能**（核心競爭力）
   - 文獻管理系統（3-4 天）✨✨✨

3. **體驗提升**（增加黏性）
   - 標籤管理（2 天）
   - 深色模式（1 天）

4. **進階功能**（長期價值）
   - 通知系統（3 天）
   - 統計增強（2 天）

---

## 📝 備註

- ✨ = 高優先級
- ✨✨ = 核心功能
- ✨✨✨ = 差異化競爭力
- ⭕ = 可選功能

**關鍵成功因素：**
1. 文獻管理是最大的差異化功能，必須做好
2. UI/UX 要保持一致性和美觀
3. 性能優化（搜索要快、導出要順暢）
4. 移動端適配（響應式設計）
5. 數據安全（定期備份）

**風險管理：**
- 文獻解析準確率可能不是 100%，需要允許手動編輯
- Crossref API 可能有限流，需要實現緩存
- 通知權限可能被用戶拒絕，需要優雅降級
- 大量數據導出可能耗時，需要進度提示

---

**準備好了嗎？讓我們從哪裡開始？** 🚀
