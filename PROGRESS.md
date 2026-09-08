# Sample-recovery · 開發進度

行動醫院腸/胃篩檢體回收追蹤系統。
跨電腦繼續開發時，clone 此 repo 後從這份文件接續即可。

---

## 路徑 & 部署

- **本機**：`D:\Backup\Desktop\CODE\project\Sample-recovery\`
- **GitHub**：<https://github.com/za869765/Sample-recovery>
- **Production**：<https://sample-recovery.pages.dev/> (Cloudflare Pages)
- **後端**：Cloudflare Pages Functions (`functions/api/`)
- **資料儲存**：Google Sheets (試算表「腸胃篩系統 v5」)
- **本地預覽**：`python -m http.server 8718`（已在 `.claude/launch.json` 註冊為 `sample-recovery`）

### 環境變數（Cloudflare Pages dashboard 設）

| Name | Value |
|---|---|
| `GOOGLE_SHEET_ID` | 試算表 ID（URL 中 `/d/...../edit` 那段） |
| `GOOGLE_SA_EMAIL` | service account email |
| `GOOGLE_SA_PRIVATE_KEY` | service account private key (含 `-----BEGIN PRIVATE KEY-----`) |

詳細 Service Account 設定見 [README.md](README.md)。

## ⚠️ Deploy 流程

**GitHub auto deploy 目前沒在運作**（2026-05-18 確認）。從 `f8c1542` (v0.3.18) 之後 push 都不會自動部署。

唯一可行的部署方式是 **wrangler CLI**：

```powershell
cd D:\Backup\Desktop\CODE\project\Sample-recovery
npx wrangler pages deploy . `
  --project-name sample-recovery `
  --branch main `
  --commit-dirty=true `
  --commit-hash=<本次 commit hash> `
  --commit-message="v0.X.Y short ASCII message"
```

⚠️ **必須加 `--commit-message`** 用純 ASCII，否則 Cloudflare API 會回 `Invalid commit message, it must be a valid UTF-8 string` 拒收（Windows git log 中文 encoding 問題）。

驗證：`curl -sS https://sample-recovery.pages.dev/ | grep "APP_VERSION = "`

## 技術棧

- 前端：單檔 `index.html`，vanilla JS + SheetJS（CDN）
- 後端：Cloudflare Pages Functions（Workers）
- DB：Google Sheets via Service Account JWT
- 沒有 build step、沒有 npm dependency

## 業務邏輯

### 三個來源檔

- **6E已發已掛.xlsx** — 腸篩 (45-75歲) 當天已掛已發試劑
- **6F已發已掛.xlsx** — 胃篩當天已掛已發試劑
- **衛生所查詢.xls** — 行動醫院當天全部掛號 (HIS export)

### 寫入規則

- **腸篩** = 6E 全部 + 「免掛號做」FOBT（年齡 <45 或 >75 但有做，護理師當天手動勾選）
- **胃篩** = 6F 全部
- 候選免掛號 = 衛生所查詢中年齡 <45 或 >75 但有出現的人 → 護理師勾選誰實際做了 FOBT

### 試算表結構（固定 A~L，不可改順序）

| 欄 | 內容 |
|---|---|
| A | 姓名 |
| B | 身分證字號 |
| C | 手機1（電話1，室內電話） |
| D | 手機2（行動電話） |
| E | 檢體狀態（V = 已回收） |
| F | 報告狀態 |
| G | 待轉介 |
| H | 轉介未做腸鏡 |
| I | 發管日 |
| J | 送管日 |
| K | 取消追蹤 |
| L | 編號（掛號序號，主鍵） |

### 分頁命名

`行醫腸篩{民國日期}` / `行醫胃篩{民國日期}`，日期從衛生所查詢 `id93` 前 7 碼推（如 `1150516`）。

## 後端 API

| Endpoint | 用途 |
|---|---|
| `POST /api/init` | 建立場次（兩個分頁 clear+append） |
| `GET /api/sessions` | 列所有「行醫腸篩/胃篩YYYMMDD」分頁 + counts + recovered |
| `GET /api/session?date=&type=` | 讀整個分頁 cases |
| `PATCH /api/case` | 按 cisid（L 欄）找 row，更新指定 fields |
| `POST /api/batch_case` | 批次寫入（一鍵送管用） |

共用助手：`functions/api/_sheets.js`（JWT auth + CRUD）

## 已完成功能（最近版本）

| 版本 | 重點 |
|---|---|
| v0.3.78 | 首頁跨場次進度圖只畫「進行中」場次（排除已結案、鎖定中、已 100% 回收） |
| v0.3.77 | 首頁移除「讀取行醫專案」卡（＝重新整理）改為 topbar「重新整理」小按鈕（回首頁旁，只在首頁顯示）；只留「開啟新行醫專案」卡。場次日期超過 60 天預設鎖定反灰、點列不開，按「🔒 解鎖」（本次頁面有效）才能打開；鎖定中不顯示並排 |
| v0.3.76 | 「⇆ 並排」／「↩ 恢復單日」按鈕改實心主色（與回首頁同樣式） |
| v0.3.75 | 回收日 date input 寬度 96→130px（並排半寬時「日」被切掉，現在年月日完整顯示） |
| v0.3.74 | topbar「首頁」改為實心主色按鈕「🏠 回首頁」（使用者反應不夠明顯） |
| v0.3.73 | 拿掉 topbar「單日／兩天合併」常駐切換：單一場次頁面一律只處理本場；並排子畫面按 列印待收檢／催管簡訊／列印送管／陽性名單／轉診單／繳回款 時才詢問「只本場／兩天合併」，輸出完自動回單日。移除 待轉介／轉介未做腸鏡／取消追蹤 三顆篩選鈕 |
| v0.3.72 | 修首頁跨場次進度圖「產生於」時間戳 SVG x 座標寫成字串 `800-70`（console 錯誤、文字定位失敗） |
| v0.3.71 | 離開並排（恢復單日／切場／回首頁）前先 flush 左右 iframe 未送出的編輯；進入並排時清掉合併狀態。實測單日→合併→並排→恢復左／右→再並排→切場→首頁全流程狀態無殘留 |
| v0.3.70 | 並排時「⇆ 並排」改為「↩ 恢復單日」，按下跳出選擇要回左場或右場 |
| v0.3.69 | 並排檢視時上方共用列隱藏「單日／兩天合併」切換（左右各自頁面已有按鈕，避免誤解） |
| v0.3.68 | 連續日期場次（前後一天）「⇆ 並排」左右各一個 iframe（?session=X&embed=1&pane=left/right，左藍右綠配色）各自獨立操作；topbar「單日／兩天合併」切換：列印待收檢、催管簡訊、列印送管、陽性名單、轉診單、繳回款一次處理兩天（畫面列表與寫入仍只動本日）；`?session=` 不帶 view 直接進可編輯場次、`?split=A,B` 直接並排 |
| v0.3.67 | 首頁往年場次（民國年<今年）自動結案、只留當年度（勾「顯示已結案場次」可看）；topbar「▾」切換場次原本沒綁事件，改開場次清單 dialog 可直接切換 |
| v0.3.26 | 催管 CSV C 欄編號只取末 3 碼（cisid 是 1150516XXX 太長，護理師只需流水號末段） |
| v0.3.25 | 催管 CSV 改 3 欄（姓名,手機,編號）；無手機者仍列入（之前會被 skip），方便人工外撥 |
| v0.3.24 | 每日圖表「匯出 PNG」改純 SVG 重畫整張 dashboard（原本只抓中間曲線，KPI/Ring/Day Strip/Legend 都沒進 PNG） |
| v0.3.23 | 催管 CSV 加 UTF-8 BOM 修 Excel 中文亂碼 |
| v0.3.22 | KPI 第三格改「尚未回收」（原「尚未送管」幾乎恆為 0 沒意義） |
| v0.3.21 | 唯讀外部連結 `?view=1&session=XXX`（分享給上級看用） |
| v0.3.20 | 每日圖表改 v3 整合版（進度環 + S-curve + Day Strip 三視角） |
| v0.3.19 | 催管簡訊 CSV 下載按鈕（未回收名單，姓名,手機 9 碼） |
| v0.3.18 | fix renderHomeSessions + close session toggle |
| v0.3.17 | per-session daily send-date chart |
| v0.3.16 | batch_case API + 一鍵送管 |
| v0.3.15 | home cross-session SVG chart + PNG 匯出 |
| v0.3.14 | dashboard 4-cell 分 腸健保/腸補助/胃 |
| v0.3.13 | 一鍵送管 + send-cell 點按彈日期 dialog |
| v0.3.11 | 重補檢體 dialog（reset + 耗材+1） |
| v0.3.4 | 集中 APP_VERSION 常數 |

完整 commit log：`git log --oneline`

## 未完成 / 待辦（無）

目前沒有明確待辦清單。新需求由使用者提出。

## 重要慣例與雷區

- ⚠️ **版號集中**：`const APP_VERSION` 在 JS 最上方，改一處同步 topbar 徽章 + 列印頁尾。**升版只改這一處**
- ⚠️ **CSS scope**：每日圖表 v3 的深色樣式全部 scope 在 `.chart-card` 下，不影響主系統淺色 UI
- ⚠️ **PNG 匯出**：SVG 內元素用 hardcode oklch string（`CHART_COLORS` 常數），不用 CSS var，避免 XMLSerializer 序列化後 canvas 渲染掉色
- ⚠️ **Read-only mode**：URL `?view=1` 進入，body 加 `.readonly` class。寫資料 API 仍可被 POST（UI 層唯讀，非 API 層），如需嚴格擋就要在 functions/api/ 加 token 驗證
- ⚠️ **CSV BOM**：`exportSmsCsv()` 加 `﻿` BOM 讓 Excel 開不亂碼
- ⚠️ **手機格式**：催管 CSV 去掉開頭 0（`0952...` → `952...`），跟使用者給的範例對齊
- 試算表欄位順序 A~L 不可改，後端 functions 寫死索引
- 分頁命名格式 `行醫腸篩{YYYMMDD}` 民國年，後端依此匹配

## 設計來源

- `DESIGN.md` — 系統規格（給 Claude Design 參考用）
- `CHART_DESIGN_BRIEF.md` — 每日圖表 v3 redesign 規格
- `_design_v3/` (gitignored) — Claude Design 解壓的 mockup bundle
- `_design_unpacked/` (gitignored) — 早期 mockup bundle

## 換電腦續做的步驟

```powershell
# 1. 確保 gh + wrangler 已可用
gh auth login
node --version  # 已裝就 OK，wrangler 用 npx

# 2. clone repo
gh repo clone za869765/Sample-recovery
cd Sample-recovery

# 3. 確認 wrangler 登入到正確 Cloudflare 帳號
npx wrangler whoami
# 預期：za869765@gmail.com (account 01aa170d853519d9ce738a2115886271)

# 4. 讀此 PROGRESS.md + README.md 接續開發
# 5. 編輯 → commit → push → wrangler pages deploy（見上方 Deploy 流程）
```

新電腦不需要：Python（除非要本地預覽）、Service Account JSON（在 Cloudflare env vars 內）、Google Sheets 編輯權（service account 已加共用）。

## 安全提醒

- ⚠️ 試算表的 service account JSON 不該 commit 進 repo（檢查 `.gitignore`）
- ⚠️ Read-only mode 是 UI 層，知道 URL 的人若會操作 DevTools 仍可發 PATCH。要嚴格擋外部寫入需後端加 token 驗證
