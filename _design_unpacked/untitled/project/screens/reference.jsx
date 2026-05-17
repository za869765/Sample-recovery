/* global React */

/* ────────────────────────────────────────────────────────────────
   Reference artboards — design notes, color tokens, keyboard map
   ──────────────────────────────────────────────────────────────── */

function StyleGuide() {
  const colors = [
    ["accent",      "var(--accent)",      "clinical teal · primary"],
    ["ok",          "var(--ok)",          "已回收 / 完成"],
    ["warn",        "var(--warn)",        "待轉介 / 異常"],
    ["bad",         "var(--bad)",         "未做腸鏡 / 配對失敗"],
    ["ink",         "var(--ink)",         "primary text"],
    ["ink-mute",    "var(--ink-mute)",    "secondary text"],
    ["bg",          "var(--bg)",          "canvas warm white"],
    ["surface",     "var(--surface)",     "card surface"],
  ];
  return (
    <div className="rs-frame" style={{ padding: 24, gap: 16, overflow: "auto" }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".08em", textTransform: "uppercase" }}>Design system</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 600 }}>視覺基準</h2>
      </div>

      <section>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8 }}>Typography</div>
        <div className="rs-card" style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>UI / Body — Noto Sans TC</div>
            <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>行動醫院檢體回收</div>
            <div style={{ fontSize: 16 }}>勾選免掛號做（市府補助）</div>
            <div style={{ fontSize: 13 }}>連續點按編號可批次回收，視覺即時切換</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>場次切換 · 篩選 · 鍵盤定位</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>Mono — JetBrains Mono (數字、ID、日期)</div>
            <div className="rs-mono" style={{ fontSize: 22, marginTop: 4, fontWeight: 500, letterSpacing: "-0.01em" }}>2026050501013</div>
            <div className="rs-mono" style={{ fontSize: 14 }}>1150516 · 05 / 22 · 0928-700-***</div>
            <div className="rs-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>tnum · ss01 · −1% tracking</div>
          </div>
        </div>
      </section>

      <section>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8 }}>Color</div>
        <div className="rs-card" style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {colors.map(([n, v, note]) => (
            <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: v, border: "1px solid var(--line)" }} />
              <div>
                <div className="rs-mono" style={{ fontSize: 11.5, color: "var(--ink)" }}>{n}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>{note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8 }}>Status states</div>
        <div className="rs-card" style={{ padding: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="rs-status">未回收</span>
          <span className="rs-status is-ok">已回收</span>
          <span className="rs-status is-warn">異常 / 待轉介</span>
          <span className="rs-status is-bad">轉介未做</span>
          <span className="rs-status is-accent">進行中</span>
          <span className="rs-cisid"><span className="rs-cisid-dot" /><span className="rs-cisid-head">20260505</span><span className="rs-cisid-tail">01013</span></span>
          <span className="rs-cisid is-done"><span className="rs-cisid-dot">✓</span><span className="rs-cisid-head">20260505</span><span className="rs-cisid-tail">01013</span></span>
        </div>
      </section>

      <section>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8 }}>Interaction reflex</div>
        <div className="rs-card" style={{ padding: 14 }}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8, fontSize: 12.5 }}>
            <li>· 樂觀更新：點 編號 立即切換已回收 + 寫入送管日，視覺＜80ms 改變；後台同步試算表</li>
            <li>· 同步失敗：右下角 toast「同步失敗 · 重試」+ topbar 同步指示器轉黃 / 紅</li>
            <li>· 防誤點：點到已回收的編號 → 浮起小確認「取消回收？」原地確認，不彈窗</li>
            <li>· 編號末 5 碼即時匹配：搜尋框輸入 5 碼數字 → 自動聚焦該列，Enter 直接標記</li>
            <li>· 視覺層級：列底 = 已回收（淡綠）｜列底 + 灰刪除線 = 取消追蹤 ｜左藍邊 = 鍵盤聚焦</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function KeyboardMap() {
  const groups = [
    { title: "整體", items: [
        [["/"], "聚焦搜尋"],
        [["Esc"], "離開搜尋 / 關閉浮層"],
        [["⌘","K"], "命令列（場次切換 / 設回收日）"],
        [["⌘","O"], "讀取行醫專案"],
        [["⌘","N"], "新行醫專案"],
    ]},
    { title: "個案表格", items: [
        [["↑","↓"], "上下選列"],
        [["↵"], "標記回收（聚焦列）"],
        [["⌫"], "取消回收"],
        [["T"], "切到腸篩 / 胃篩"],
        [["F"], "切換篩選器"],
    ]},
    { title: "批次回收", items: [
        [["搜尋框"], "輸入末 5 碼 → 自動定位"],
        [["↵","↵"], "兩次 Enter 連點下一個試管"],
        [["R"], "回收日設為今日"],
        [["⇧","R"], "改回收日"],
        [["⌘","Z"], "復原最近一次回收"],
    ]},
  ];
  return (
    <div className="rs-frame" style={{ padding: 24, gap: 14, overflow: "auto" }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".08em", textTransform: "uppercase" }}>Keyboard</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 600 }}>鍵盤快捷</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-mute)" }}>單人桌機工作流，連續批次操作優先。</p>
      </div>

      {groups.map(g => (
        <div key={g.title} className="rs-card">
          <div className="rs-card-head">
            <div className="rs-card-title">{g.title}</div>
          </div>
          <div style={{ padding: "8px 18px 14px" }}>
            {g.items.map(([keys, label], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i === g.items.length - 1 ? "0" : "1px solid var(--line-soft)" }}>
                <div style={{ flex: 1, fontSize: 13 }}>{label}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {keys.map((k, j) => <span key={j} className="rs-kbd">{k}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DesignNotes() {
  return (
    <div className="rs-frame" style={{ padding: 28, gap: 18, overflow: "auto" }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".08em", textTransform: "uppercase" }}>Brief</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600 }}>設計取捨</h2>
      </div>

      <section className="rs-card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>1 · 編號是英雄</div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
          試管上的 13 碼編號是回收工作的物理錨點。表格中第一欄做成一顆<b className="rs-mono">「可點按的籌碼」</b>：等寬字體、左側勾選方塊、前 8 碼日期段淡色、末 5 碼粗體。
          點一下 = 標記已回收 + 寫入送管日（即上方選的回收日）。已回收後整列染淺綠、籌碼變綠，整個視覺切換成「處理完」狀態。
          連續點按要極快、有觸感（active 時下移 1px），不需確認對話框；防誤點靠就地小提示。
        </p>
      </section>

      <section className="rs-card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>2 · 回收日是模式</div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
          回收日不是欄位，是「現在這一輪要批次寫入哪個日期」的<b>模式控制</b>。所以放在 toolbar 最左、用 accent 色塊強調，永遠可見。
          它本身不進試算表，只決定「點編號時把送管日寫成多少」。預設今天、可改、本機持久化。
        </p>
      </section>

      <section className="rs-card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>3 · 試算表是後援，不是來源</div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
          所有操作樂觀更新，背景同步。topbar 右側<b>同步指示燈</b>三態：綠（已同步）／黃（同步中／離線排隊）／紅（失敗）。
          失敗時 toast 顯示「重試 / 顯示細節」，不阻擋繼續工作。
        </p>
      </section>

      <section className="rs-card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>4 · 密度</div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
          桌機單人。表格列高 38px、字級 13px、欄位寬度為內容量身。表頭固定、滾動只移動 tbody。
          狀態欄用 pill 而非純文字（一眼可掃描）；checkbox 欄使用 16px 方塊；中文姓名加粗一級增加掃描度。
        </p>
      </section>

      <section className="rs-card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>5 · 上傳識別</div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
          一個拖放區處理 4 份檔，依 header 內容識別。<b>每識別出一份</b>，即時長出對應的綠色狀態列、計數、與其分頁去向（行醫腸篩/胃篩）。
          無法識別的檔以紅色 dashed 列保留，可單獨移除。<b>4 個都到齊才能進下一步</b>，這條規則用 footer 右側主按鈕 disabled / enabled 表達。
        </p>
      </section>
    </div>
  );
}

window.StyleGuide = StyleGuide;
window.KeyboardMap = KeyboardMap;
window.DesignNotes = DesignNotes;
