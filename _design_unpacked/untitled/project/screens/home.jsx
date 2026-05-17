/* global React */
const { useState, useMemo } = React;

/* ────────────────────────────────────────────────────────────────
   Sample data
   ──────────────────────────────────────────────────────────────── */

const SESSION_DATE = "1150516";
const SESSION_PREFIX = "20260505";

const mkRow = (tail, name, idno, t1, t2, status = "pending", report = "", referral = false, missed = false, sendDate = "", cancel = false, dispatchDate = "1150516") => ({
  cisid: SESSION_PREFIX + "01" + tail,
  tail,
  name,
  idno,
  t1,
  t2,
  status,
  report,
  referral,
  missed,
  sendDate,
  cancel,
  dispatchDate,
});

const FOBT_ROWS_DEFAULT = [
  mkRow("001", "陳淑芬", "F22018****", "06-225****", "0912-345-***"),
  mkRow("002", "林志明", "N12345****", "06-235****", "0922-111-***"),
  mkRow("003", "黃美麗", "F22099****", "06-241****", "0918-552-***"),
  mkRow("004", "王建宏", "N10054****", "—",          "0933-219-***"),
  mkRow("005", "蔡春嬌", "F22011****", "06-228****", "0928-700-***"),
  mkRow("006", "張文德", "N18866****", "06-211****", "0911-882-***"),
  mkRow("007", "李秀蘭", "F22102****", "06-244****", "0935-118-***"),
  mkRow("008", "周俊雄", "N10921****", "06-219****", "0912-340-***"),
  mkRow("009", "鄭月霞", "F22044****", "06-256****", "0978-443-***"),
  mkRow("010", "謝國強", "N16671****", "06-201****", "0931-887-***"),
  mkRow("011", "吳惠美", "F22220****", "06-228****", "0921-090-***"),
  mkRow("012", "簡文雄", "N17782****", "—",          "0937-661-***"),
  mkRow("013", "蘇麗珠", "F22301****", "06-218****", "0911-558-***"),
];

const FOBT_ROWS_PROGRESS = [
  { ...FOBT_ROWS_DEFAULT[0], status: "done",  sendDate: "1150522" },
  { ...FOBT_ROWS_DEFAULT[1], status: "done",  sendDate: "1150522", report: "正常" },
  { ...FOBT_ROWS_DEFAULT[2], status: "done",  sendDate: "1150521", report: "異常", referral: true },
  { ...FOBT_ROWS_DEFAULT[3], status: "pending" },
  { ...FOBT_ROWS_DEFAULT[4], status: "done",  sendDate: "1150522" },
  { ...FOBT_ROWS_DEFAULT[5], status: "done",  sendDate: "1150522", report: "異常", referral: true, missed: true },
  { ...FOBT_ROWS_DEFAULT[6], status: "done",  sendDate: "1150521" },
  { ...FOBT_ROWS_DEFAULT[7], status: "pending" },
  { ...FOBT_ROWS_DEFAULT[8], status: "done",  sendDate: "1150522", report: "正常" },
  { ...FOBT_ROWS_DEFAULT[9], status: "cancel", cancel: true },
  { ...FOBT_ROWS_DEFAULT[10], status: "done", sendDate: "1150522" },
  { ...FOBT_ROWS_DEFAULT[11], status: "pending" },
  { ...FOBT_ROWS_DEFAULT[12], status: "done", sendDate: "1150522" },
];

const CANDIDATES = [
  { tail: "001", id93: SESSION_PREFIX + "01001", name: "趙志強", idno: "N10221****", sex: "男", age: 38, picked: true,  band: "elig" },
  { tail: "002", id93: SESSION_PREFIX + "01002", name: "陳秀珠", idno: "F22300****", sex: "女", age: 78, picked: true,  band: "elig" },
  { tail: "003", id93: SESSION_PREFIX + "01003", name: "林文德", idno: "N18102****", sex: "男", age: 41, picked: false, band: "inelig" },
  { tail: "004", id93: SESSION_PREFIX + "01004", name: "黃美鳳", idno: "F22021****", sex: "女", age: 35, picked: true,  band: "elig" },
  { tail: "005", id93: SESSION_PREFIX + "01005", name: "王俊雄", idno: "N10773****", sex: "男", age: 43, picked: false, band: "inelig" },
  { tail: "006", id93: SESSION_PREFIX + "01006", name: "蔡惠美", idno: "—",            sex: "女", age: 82, picked: false, band: "elig", missing: true },
  { tail: "007", id93: SESSION_PREFIX + "01007", name: "張建宏", idno: "N12101****", sex: "男", age: 32, picked: false, band: "elig" },
  { tail: "008", id93: SESSION_PREFIX + "01008", name: "李秀蘭", idno: "F22099****", sex: "女", age: 44, picked: false, band: "inelig" },
  { tail: "009", id93: SESSION_PREFIX + "01009", name: "鄭月霞", idno: "F22044****", sex: "女", age: 30, picked: true,  band: "elig" },
];

/* ────────────────────────────────────────────────────────────────
   Small shared chrome
   ──────────────────────────────────────────────────────────────── */

function Topbar({ session, tab, onSwitch, showTabs = true, showSync = true }) {
  return (
    <div className="rs-topbar">
      <div className="rs-brand">
        <div className="rs-brand-mark">R</div>
        <div>
          <div className="rs-brand-title">行動醫院檢體回收<span className="rs-brand-sub">v0.4</span></div>
        </div>
      </div>

      {session && (
        <>
          <div className="rs-topbar-divider" />
          <button className="rs-btn is-ghost is-sm" style={{ fontFamily: "inherit" }}>
            <span className="rs-mono" style={{ fontSize: 13, fontWeight: 600 }}>{session}</span>
            <span style={{ color: "var(--ink-mute)" }}>場</span>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
          </button>
        </>
      )}

      {showTabs && (
        <div className="rs-seg" style={{ marginLeft: 4 }}>
          <button className={tab === "fobt" ? "is-on" : ""} onClick={() => onSwitch && onSwitch("fobt")}>
            腸篩 <span className="rs-pill">FOBT</span> <span className="rs-pill">117</span>
          </button>
          <button className={tab === "gastric" ? "is-on" : ""} onClick={() => onSwitch && onSwitch("gastric")}>
            胃篩 <span className="rs-pill">81</span>
          </button>
        </div>
      )}

      <div className="rs-topbar-spacer" />

      {showSync && (
        <div className="rs-sync">
          <span className="rs-dot" /> 試算表 已同步 · 14:22
        </div>
      )}

      <button className="rs-btn is-ghost is-sm">
        <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4.5 v3 M7 9.2 v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        說明
      </button>
      <div className="rs-user-chip">
        <span className="rs-avatar">林</span>
        <span>林護理師</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Screen 1 — 進入頁 (Home)
   ──────────────────────────────────────────────────────────────── */

function HomeScreen() {
  const sessions = [
    { date: "1150516", roc: "2026-05-16", venue: "鹽水區公所", fobt: 117, gastric: 81, recovered: 9, total: 198, status: "active" },
    { date: "1150509", roc: "2026-05-09", venue: "白河區公所", fobt: 142, gastric: 96, recovered: 231, total: 238 },
    { date: "1150425", roc: "2026-04-25", venue: "後壁區公所", fobt: 88,  gastric: 64, recovered: 152, total: 152 },
    { date: "1150418", roc: "2026-04-18", venue: "新營區公所", fobt: 121, gastric: 89, recovered: 210, total: 210 },
    { date: "1150404", roc: "2026-04-04", venue: "六甲區公所", fobt: 95,  gastric: 71, recovered: 166, total: 166 },
  ];

  return (
    <div className="rs-frame">
      <Topbar showTabs={false} />

      <div style={{ flex: 1, padding: "32px 48px", overflow: "auto", display: "flex", flexDirection: "column", gap: 28 }}>

        <header>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Workspace</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em" }}>選擇行動醫院場次</h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink-mute)", fontSize: 13.5 }}>
            從雲端載入既有場次繼續追蹤，或上傳本場 4 份名冊建立新場次。
          </p>
        </header>

        {/* two primary entry actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <button className="rs-card" style={{ padding: 22, textAlign: "left", cursor: "pointer", border: "1px solid var(--accent-line)", background: "linear-gradient(180deg, var(--accent-soft) 0%, var(--surface) 60%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", color: "white", display: "grid", placeItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 5 h12 v9 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 Z M3 5 V4 a1 1 0 0 1 1 -1 h4 l2 2 h4 a1 1 0 0 1 1 1 v1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>讀取行醫專案</div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>從試算表載入已建立的場次</div>
              </div>
              <div style={{ marginLeft: "auto" }} className="rs-mono" >
                <span className="rs-kbd">⌘</span> <span className="rs-kbd">O</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>5 個場次 · 最後同步 14:22</div>
          </button>

          <button className="rs-card" style={{ padding: 22, textAlign: "left", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface-alt)", color: "var(--ink)", border: "1px solid var(--line)", display: "grid", placeItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 3 v12 M3 9 h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>開啟新行醫專案</div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>上傳當日 4 份名冊建立場次</div>
              </div>
              <div style={{ marginLeft: "auto" }} className="rs-mono">
                <span className="rs-kbd">⌘</span> <span className="rs-kbd">N</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>fobt45-75 · 胃癌 · 非45-75歲FOBT · 衛生所查詢</div>
          </button>
        </div>

        {/* session list */}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--ink-2)", letterSpacing: ".02em" }}>近期場次</h2>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }} className="rs-mono">依民國日期降冪</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map(s => (
              <div key={s.date} className="rs-session">
                <div className="rs-session-date">
                  {s.date}
                  <small>{s.roc}</small>
                </div>
                <div style={{ width: 130, fontSize: 13, color: "var(--ink)" }}>{s.venue}</div>
                <div className="rs-session-meta">
                  <span>腸篩 <b>{s.fobt}</b></span>
                  <span>胃篩 <b>{s.gastric}</b></span>
                </div>
                <div className="rs-session-prog">
                  <div className="rs-session-prog-bar"><i style={{ width: `${Math.round(s.recovered / s.total * 100)}%` }} /></div>
                  <div className="rs-session-prog-lbl">
                    <span>回收 {s.recovered}/{s.total}</span>
                    <span>{Math.round(s.recovered / s.total * 100)}%</span>
                  </div>
                </div>
                <div style={{ width: 70, textAlign: "right" }}>
                  {s.status === "active"
                    ? <span className="rs-status is-accent">進行中</span>
                    : <span className="rs-status is-ok">完成</span>}
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: "var(--ink-faint)" }}><path d="M5 3 L9 7 L5 11" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--ink-mute)", fontSize: 11.5, marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--line-soft)" }}>
          <span>後援儲存：Google 試算表 <span className="rs-mono" style={{ color: "var(--ink-2)" }}>13U1nU2L…F2M</span></span>
          <span style={{ marginLeft: "auto" }}>檢體回收追蹤系統 · 行動醫院</span>
        </footer>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.Topbar = Topbar;
window.SESSION_DATE = SESSION_DATE;
window.SESSION_PREFIX = SESSION_PREFIX;
window.FOBT_ROWS_DEFAULT = FOBT_ROWS_DEFAULT;
window.FOBT_ROWS_PROGRESS = FOBT_ROWS_PROGRESS;
window.CANDIDATES = CANDIDATES;
