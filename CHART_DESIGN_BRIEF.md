# 每日送管進度 Chart 重新設計 — Design Brief

> 給 Claude Design / 設計協作工具的規格說明。目標：把目前簡陋的 SVG 圖表升級成「資料儀表板」風格。

---

## 1. 專案背景

**系統**：行動醫院檢體回收 · Sample-recovery · 純 HTML 單檔（無 build pipeline、無 chart library）
**部署**：Cloudflare Pages
**現有檔**：`index.html` 一支搞定，CSS 跟 JS inline

這支 dialog 是「每日圖表」按鈕點開的彈窗，展示**一個場次內**每天的腸/胃檢體送管進度。

---

## 2. 目前實作（給 Claude Design 參考的「不要再做成這樣」）

- **檔位置**：`index.html` line 2044-2158 函式 `openDailyChart()`
- **chart 類型**：堆疊柱狀圖（腸黃在下、胃藍在上）
- **尺寸**：760 × 360
- **配色**：`oklch(0.70 0.13 80)`（土黃）+ `oklch(0.55 0.10 200)`（土藍）
- **字型**：標題 Noto Sans TC、數字 JetBrains Mono、混用
- **結構**：y 軸 5 條灰網格、x 軸 MM/DD、每柱上方標總數、右上角小 legend

### 目前的缺點（要解決的）

| 問題 | 描述 |
|------|------|
| 配色土 | 黃+藍對比硬，沒有層次感 |
| 字型雜 | 中文/英文/數字三種字混用，沒層次 |
| 缺留白 | legend、標題、軸標都擠在頂部 |
| 無互動 | 沒 hover tooltip、沒點按 highlight |
| 視覺平 | 純色塊，無漸層/陰影/圓角細節 |
| 軸刻度比例不 clean | 直接 `max/4` 取整，會出現 31 / 62 / 93 / 124 之類醜數字 |
| 單柱頂端文字 | 只顯示總和，看不出腸/胃各自數量 |
| dialog 內 sub-stats（已回收 / 已送管）跟 chart 視覺風格分離 | 像兩個系統拼一起 |

---

## 3. 設計目標

**風格**：資料儀表板（Linear / Vercel / Stripe Dashboard / Notion Charts 風格）

### 視覺方向

- **深色背景**為主，柱用鮮色 + 微漸層 + 微陰影
- **單一字型家族**（如 Inter / SF Pro / Geist Sans）+ tabular numerals
- 大量**留白**，重要數字放大，次要資訊弱化
- **層次清楚**：KPI 一行（已回收/已送管 大數字）→ chart → 軸標 → footnote
- **微互動**：hover 柱顯示 tooltip（當日腸 X 胃 Y 合計 Z）
- **柱**用 rounded top + subtle inner highlight + 落地陰影
- y 軸刻度用 nice numbers（5/10/25/50/100 階梯）
- 場次標題 + 場次日期放角落淡顯（hairline 文字）

### 需要保留的功能

- 堆疊柱狀（腸+胃 同根柱）— 但允許設計師建議改成分組柱（左右並列）或其他型態，附理由
- y 軸網格 + 數字
- x 軸 MM/DD 標籤
- legend（腸/胃顏色說明 + 累計總數）
- 警示：「N 支已回收尚未送管」（用 warning 色顯眼）
- 「匯出 PNG」按鈕

---

## 4. 約束條件（這支系統的限制）

| 約束 | 細節 |
|------|------|
| **無 chart library** | 不能用 chart.js / d3 / apexcharts。純手刻 SVG inline |
| **無 build pipeline** | 不能用 React/Vue/Tailwind class。CSS 必須能 inline 進 SVG 或內嵌 `<style>` |
| **PNG 匯出** | 整個 SVG 要能透過 `XMLSerializer` + `<canvas>.drawImage(<img src="data:image/svg+xml,...">)` 序列化成 PNG。**任何依賴外部資源（webfont、外部圖檔）會在 PNG 匯出時掉失，要全部 inline 或回退到系統字型** |
| **字型** | 不能假設使用者裝特定 webfont。若想用 Inter/Geist，要 fallback 到 system-ui。中文用 `"Noto Sans TC", "Microsoft JhengHei", sans-serif` |
| **單檔 HTML** | 最終要塞進 `index.html` 的 dialog 內，CSS 跟 JS 都要 inline |
| **dialog 寬** | 目前 dialog `min-width:820px max-width:90vw`，圖表寬要適配 |
| **背景白底深底** | 系統主 UI 是淺色，但 dialog 內 chart 區可獨立用深色背景（dashboard 慣例） |

---

## 5. 資料 Schema

```js
// 來自現有 openDailyChart() 計算結果，可當作設計的固定 input
{
  sessionDate: "1150516",          // 民國 7 碼
  sessionDateDisplay: "2026-05-16", // 西元顯示
  fobtTotal: 115,        // 腸 全部
  fobtDone: 88,          // 腸 已回收
  fobtSent: 88,          // 腸 已送管
  gastricTotal: 81,
  gastricDone: 64,
  gastricSent: 64,
  noSendCount: 0,        // 已回收但尚未送管（警示用）

  // 每天的送管量
  series: [
    { date: "05/18", fobt: 88, gastric: 64, cumF: 88, cumG: 64 },
    // ... 可能 1 天 ~ 30 天
  ],
  cumF: 88,              // 累計腸
  cumG: 64,              // 累計胃
}
```

### 邊界情境

- **series 長度 1**（剛開場只有第一天送）→ 一根柱、不能空空浪費版面，圖表本體可考慮做成「summary card 為主、柱為輔」
- **series 長度 7-14**（典型 1-2 週）→ 主場景
- **series 長度 30+**（罕見，多場次連跑）→ 柱會擠，要考慮 x 軸標籤旋轉或抽稀
- **cumF 跟 cumG 差很多**（例如腸 88 胃 11）→ 比例懸殊時視覺要平衡

---

## 6. 互動 / 動畫需求

- **進場**：柱從 y=baseline 漲高，stagger 50ms，總共 < 600ms
- **Hover 柱**：tooltip 浮出顯示 `{date} · 腸 X · 胃 Y · 合計 Z`，柱本體微亮
- **點按柱**：可選 highlight 該柱（其他變淡）
- **匯出 PNG**：點「匯出」按鈕後，把 chart SVG serialize → 載 canvas → 下載 PNG。**動畫中的中間 frame 不該被截取，PNG 應該是 final state**

---

## 7. 輸出格式（要交付給我的東西）

請設計師（Claude Design）產出一份**獨立 HTML demo 檔**：

```html
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <title>每日送管進度 — Mockup</title>
  <style>/* 所有樣式 inline 在這 */</style>
</head>
<body>
  <!-- 預設用 §5 的 Schema 範例資料 hardcode 進去 -->
  <div id="chart-root"></div>
  <script>
    const DATA = { /* §5 範例 */ };
    /* 純手刻 SVG / DOM，不引外部 lib */
  </script>
</body>
</html>
```

要求：

- 用 §5 的範例資料 hardcode（**series 長度 1, 7, 14 各做一版** 看適配）
- 包含 hover tooltip 互動
- 包含進場動畫
- PNG 匯出按鈕（demo 用，可以是模擬 click 後 console.log）
- 深色 / 淺色 二版色票（讓我選一個融入主系統）

我拿到後會：
1. 挑一版採用
2. 把 SVG 結構抄回 `index.html` 的 `openDailyChart()` 替換掉現有實作
3. 把 hardcode 資料改回 `State.session` 動態取

---

## 8. 視覺參考（風格錨點）

- **Linear** 的 cycle insights chart — 深色背景、紫粉霓虹、tabular numerals
- **Vercel Analytics** 的 traffic chart — 大量留白、grid 細到幾乎看不見、 hover 才浮出 tooltip
- **Stripe Dashboard** 的 revenue chart — 淺色版的話可以參考、強調 KPI、chart 是輔助
- **Notion** 的 database chart — 圓角柱、配色克制

**重點不是抄某一個**，而是「資料是主角、裝飾退後、留白拉開層次」。

---

## 9. 命名

- 檔案：`chart_mockup_v1.html`（同目錄）
- 收到 mockup 後我會手動 review → 通知是否進主程式

---

## 10. 不在範圍

- 不用做 Home 頁的 cross-session chart（line 1xxx「每日圖表」按鈕對應的是 dialog 內這支）
- 不用做 dashboard 4-cell 那塊
- 不用做後端 / API 改動
