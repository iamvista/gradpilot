# GradPilot 2.0 完整開發計劃

> 制定日期：2026-01-02
> 目標：完成所有三個選項（基礎 UI + 搜尋/導出 + 文獻管理）

---

## ✅ 已完成

1. **搜尋功能檢查** - 後端實現正確，資料庫暫無測試數據
2. **術語統一** - 將所有「搜索」改為「搜尋」

---

## 📋 開發階段

### 階段一：基礎前端 UI（2-3 天）

#### 1.1 認證系統
**優先級：極高** | **預計時間：3 小時**

需要創建的檔案：
- `src/context/AuthContext.jsx` - 認證上下文
- `src/components/PrivateRoute.jsx` - 路由保護
- `src/main.jsx` - React 入口
- `src/App.jsx` - 主應用路由

功能：
- ✅ 用戶登入/登出
- ✅ Token 管理
- ✅ 自動檢查登入狀態
- ✅ 路由保護

---

#### 1.2 登入與註冊頁面
**優先級：極高** | **預計時間：2 小時**

需要創建的檔案：
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`

功能：
- ✅ 登入表單（email + password）
- ✅ 註冊表單（username + email + password）
- ✅ 表單驗證
- ✅ 錯誤處理
- ✅ 成功後跳轉到儀表板

---

#### 1.3 儀表板頁面
**優先級：極高** | **預計時間：4-5 小時**

需要創建的檔案：
- `src/components/Dashboard/Clock.jsx` - 時鐘組件
- `src/components/Dashboard/StatsCards.jsx` - 統計卡片
- `src/components/Todo/TodoList.jsx` - 待辦清單
- `src/components/Todo/TodoItem.jsx` - 單個待辦
- `src/components/Todo/TodoForm.jsx` - 新增/編輯表單
- `src/components/Pomodoro/PomodoroTimer.jsx` - 番茄鐘
- `src/components/Notes/NotesList.jsx` - 筆記列表
- `src/components/Notes/NoteCard.jsx` - 筆記卡片
- `src/components/Notes/NoteEditor.jsx` - 筆記編輯器

功能：
- ✅ 時鐘與問候語
- ✅ 今日統計（待辦、筆記、番茄鐘）
- ✅ 待辦事項管理（CRUD）
- ✅ 筆記快速訪問
- ✅ 番茄鐘計時器
- ✅ 響應式設計

---

### 階段二：搜尋與導出功能（1 天）

#### 2.1 搜尋功能 UI
**優先級：高** | **預計時間：3 小時**

後端：✅ 已完成
- ✅ GET /api/search - 全局搜尋
- ✅ GET /api/search/todos
- ✅ GET /api/search/notes

前端開發：
- ✅ SearchModal 組件已存在，需整合到導航欄
- 🔲 添加鍵盤快捷鍵（Ctrl/Cmd + K）
- 🔲 實時搜尋（debounce）
- 🔲 搜尋結果高亮
- 🔲 按類型分組顯示結果
- 🔲 點擊跳轉到相關內容

---

#### 2.2 數據導出 UI
**優先級：高** | **預計時間：2 小時**

後端：✅ 已完成
- ✅ GET /api/export/all - 導出所有數據
- ✅ GET /api/export/todos?format=json|csv|md
- ✅ GET /api/export/notes?format=json|md

前端開發：
- 🔲 創建設置頁面
- 🔲 添加數據管理區塊
- 🔲 導出選項選擇器
- 🔲 一鍵下載功能
- 🔲 導出進度提示

---

### 階段三：文獻管理系統（3-4 天）

#### 3.1 後端開發
**優先級：極高** | **預計時間：1 天**

後端已有初步實現，需要：
- ✅ Reference 模型已建立
- ✅ 基本 API 路由已完成
- 🔲 檢查並優化 BibTeX 導出功能
- 🔲 測試 DOI 查詢功能
- 🔲 添加批量導入支援

API 端點：
- ✅ POST /api/references/parse - 解析文獻
- ✅ GET /api/references - 獲取文獻列表
- ✅ POST /api/references - 創建文獻
- ✅ GET /api/references/:id - 獲取單個文獻
- ✅ PUT /api/references/:id - 更新文獻
- ✅ DELETE /api/references/:id - 刪除文獻
- ✅ POST /api/references/format - 格式化文獻
- ✅ GET /api/references/export - 導出為 BibTeX

---

#### 3.2 前端開發
**優先級：極高** | **預計時間：2 天**

需要完善的組件：
- ReferencesPage.jsx（已存在，需完善）
- ReferenceCard.jsx（已存在，需完善）
- ReferenceForm.jsx（已存在，需完善）
- 🔲 ReferenceParser 組件（批量解析）
- 🔲 ReferenceFormatter 組件（格式預覽）
- 🔲 BibTeXExporter 組件（導出功能）

功能清單：
- 🔲 文獻列表展示與篩選
- 🔲 按作者/年份/標題排序
- 🔲 批量導入（貼上多條文獻）
- 🔲 文獻解析（自動識別格式）
- 🔲 手動添加/編輯
- 🔲 DOI 查詢補全
- 🔲 格式化預覽（APA/MLA/Chicago/Harvard）
- 🔲 複製引用格式
- 🔲 導出為 BibTeX
- 🔲 添加個人筆記
- 🔲 標籤管理

---

### 階段四：測試與整合（1 天）

#### 4.1 本地測試
- 🔲 測試所有 API 端點
- 🔲 創建測試用戶與數據
- 🔲 測試前後端聯動
- 🔲 修復發現的 bug
- 🔲 優化 UI/UX

#### 4.2 整合測試
- 🔲 測試登入流程
- 🔲 測試待辦事項完整流程
- 🔲 測試筆記功能
- 🔲 測試番茄鐘
- 🔲 測試搜尋功能
- 🔲 測試導出功能
- 🔲 測試文獻管理完整流程

---

### 階段五：部署（0.5 天）

#### 5.1 Render 部署
- 🔲 檢查 render.yaml 配置
- 🔲 設置環境變數
- 🔲 部署後端
- 🔲 部署前端
- 🔲 測試生產環境
- 🔲 設置自定義域名（可選）

---

## 🎯 時間表

| 階段 | 任務 | 預計時間 | 狀態 |
|------|------|---------|------|
| **準備** | 搜尋功能檢查 + 術語統一 | 1 小時 | ✅ 完成 |
| **階段一** | 基礎前端 UI | 2-3 天 | 🔲 待開始 |
| **階段二** | 搜尋與導出功能 | 1 天 | 🔲 待開始 |
| **階段三** | 文獻管理系統 | 3-4 天 | 🔲 待開始 |
| **階段四** | 測試與整合 | 1 天 | 🔲 待開始 |
| **階段五** | 部署 | 0.5 天 | 🔲 待開始 |
| **總計** | - | **7-9 天** | **進行中** |

---

## 🚀 立即開始

### 下一步行動：

**現在開始階段一：創建基礎前端 UI**

1. **首先創建認證系統**
   - AuthContext.jsx
   - PrivateRoute.jsx
   - main.jsx
   - App.jsx

2. **然後創建登入/註冊頁面**
   - LoginPage.jsx
   - RegisterPage.jsx

3. **最後完成儀表板**
   - 所有 Dashboard 組件
   - Todo 組件
   - Notes 組件
   - Pomodoro 組件

---

## 📝 備註

- ✅ = 已完成
- 🔲 = 待完成
- ⚠️ = 需要注意

**技術重點：**
- 使用 Tailwind CSS 保持設計一致性
- 所有 API 調用使用 `src/services/api.js` 中的封裝
- 響應式設計，支援移動端
- 良好的錯誤處理與用戶反饋
- 載入狀態與空狀態處理

**質量要求：**
- 代碼要清晰、可維護
- UI 要美觀、易用
- 性能要優化
- 錯誤處理要完善
