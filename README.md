# Sample-recovery 腸胃篩檢體回收系統

行動醫院每場結束後上傳 3 個檔案 → 自動比對 → 寫入 Google Sheets。

## 來源檔

- `6E已發已掛.xlsx` — 腸篩 45-75 已掛已發試劑
- `6F已發已掛.xlsx` — 胃篩已掛已發試劑
- `衛生所查詢.xls` — 行動醫院當天全部掛號名單 (HIS export)

## 比對邏輯

- 腸篩寫入 = 6E 全部 + 勾選的「免掛號做 FOBT」
- 胃篩寫入 = 6F 全部
- 候選免掛號 = 衛生所查詢中年齡 <45 或 >75 但有出現的人 → 護理師勾選誰實際做了 FOBT

## 部署 (Cloudflare Pages)

### 環境變數

| Name | Value |
|---|---|
| `GOOGLE_SHEET_ID` | 試算表 ID（URL 中 `/d/...../edit` 那段） |
| `GOOGLE_SA_EMAIL` | service account email |
| `GOOGLE_SA_PRIVATE_KEY` | service account private key (含 `-----BEGIN PRIVATE KEY-----`) |

### Service Account 設定步驟

1. https://console.cloud.google.com/ → 建 project (隨意命名)
2. APIs & Services → Library → 啟用 **Google Sheets API**
3. APIs & Services → Credentials → Create Credentials → Service account
4. 建好後點進該 SA → Keys → Add Key → JSON → 下載
5. 把 JSON 裡的 `client_email` 加進 Google 試算表的「共用」（編輯者）
6. 把 JSON 裡的 `private_key` 整段（含 `\n`）放進 Cloudflare env vars

## 寫入欄位

| 欄 | 內容 |
|---|---|
| A | 姓名 |
| B | 身分證字號 |
| C | 手機1（電話1，室內電話） |
| D | 手機2（行動電話） |
| L | 編號（掛號序號） |

E~K（檢體狀態/報告狀態/待轉介/轉介未做腸鏡/發管日/送管日/取消追蹤）留空，人工填。

## 分頁命名

`行醫腸篩{民國日期}` / `行醫胃篩{民國日期}`，日期從衛生所查詢 `sdate93` 自動偵測（如 `1150516`）。
