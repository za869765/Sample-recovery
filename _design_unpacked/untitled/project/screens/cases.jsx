/* global React */
const { useState: useStateC } = React;

/* ────────────────────────────────────────────────────────────────
   Screen 3 — 個案管理頁 (Case Management) — the hero
   Variants: default (just initialized), progress (mid-recovery), 鍵盤定位
   ──────────────────────────────────────────────────────────────── */

function StatusPill({ kind }) {
  if (kind === "done") return <span className="rs-status is-ok">已回收</span>;
  if (kind === "cancel") return <span className="rs-status is-bad">取消追蹤</span>;
  return <span className="rs-status">未回收</span>;
}
function ReportPill({ kind }) {
  if (kind === "正常") return <span className="rs-status is-ok">正常</span>;
  if (kind === "異常") return <span className="rs-status is-warn">異常</span>;
  return <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>—</span>;
}

function CasesToolbar({ recoveryDate, filter, onFilter, counts, focused, search }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
      <div className="rs-recovdate" title="點按改回收日期">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: "currentColor" }}><rect x="2" y="3" width="10" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6 h10 M5 1.5 v2 M9 1.5 v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        <div>
          <div className="rs-recovdate-lbl">回收日</div>
          <div className="rs-recovdate-val">{recoveryDate}</div>
        </div>
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginLeft: 4 }}><path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
      </div>

      <div className="rs-topbar-divider" />

      <div style={{ display: "flex", gap: 6 }}>
        {[
          ["all",     "全部",       counts.all,     null],
          ["pending", "未回收",     counts.pending, null],
          ["done",    "已回收",     counts.done,    null],
          ["referral","待轉介",     counts.referral,null],
          ["missed",  "轉介未做腸鏡", counts.missed,  null],
          ["cancel",  "取消追蹤",   counts.cancel,  null],
        ].map(([k, label, c]) => (
          <button key={k} className={"rs-chip " + (filter === k ? "is-on" : "")} onClick={() => onFilter && onFilter(k)}>
            {label} <span className="rs-chip-count">{c}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div className="rs-search" style={{ minWidth: 260 }}>
        <svg width="13" height="13" viewBox="0 0 13 13" style={{ color: "var(--ink-faint)" }}><circle cx="5.5" cy="5.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 8.5 L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <input placeholder={focused ? "" : "搜尋姓名 / 身分證 / 末 5 碼…"} defaultValue={search || ""} autoFocus={!!focused} />
        <span className="rs-kbd">/</span>
      </div>

      <button className="rs-btn is-sm">
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 3 h8 M2 6 h8 M2 9 h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        欄位
      </button>
      <button className="rs-btn is-sm">
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1.5 v9 M2.5 8 l3.5 3 l3.5 -3 M2 2 h8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        匯出
      </button>
    </div>
  );
}

function StatsStrip({ pending, done, total, referral, missed, cancel }) {
  return (
    <div className="rs-stats">
      <div className="rs-stat">
        <div className="rs-stat-label is-pending">未回收</div>
        <div className="rs-stat-value">
          {pending}
          <span className="rs-stat-total">/ {total}</span>
          <span className="rs-stat-pct">{Math.round(pending / total * 100)}%</span>
        </div>
        <div className="rs-stat-bar"><i style={{ width: `${Math.round(pending / total * 100)}%`, background: "var(--ink-faint)" }} /></div>
      </div>
      <div className="rs-stat">
        <div className="rs-stat-label is-done">已回收</div>
        <div className="rs-stat-value">
          {done}
          <span className="rs-stat-total">/ {total}</span>
          <span className="rs-stat-pct">{Math.round(done / total * 100)}%</span>
        </div>
        <div className="rs-stat-bar"><i style={{ width: `${Math.round(done / total * 100)}%` }} /></div>
      </div>
      <div className="rs-stat">
        <div className="rs-stat-label is-warn">待轉介</div>
        <div className="rs-stat-value">{referral}</div>
        <div className="rs-stat-bar"><i style={{ width: `${referral / total * 100}%`, background: "var(--warn)" }} /></div>
      </div>
      <div className="rs-stat">
        <div className="rs-stat-label is-bad">轉介未做腸鏡</div>
        <div className="rs-stat-value">{missed}</div>
        <div className="rs-stat-bar"><i style={{ width: `${missed / total * 100}%`, background: "var(--bad)" }} /></div>
      </div>
      <div className="rs-stat">
        <div className="rs-stat-label">取消追蹤</div>
        <div className="rs-stat-value">{cancel}</div>
        <div className="rs-stat-bar"><i style={{ width: `${cancel / total * 100}%`, background: "var(--ink-faint)" }} /></div>
      </div>
    </div>
  );
}

function CaseRow({ r, focused, ghost }) {
  const isDone = r.status === "done";
  const isCancel = r.status === "cancel" || r.cancel;
  return (
    <tr className={[
      isDone ? "is-done" : "",
      isCancel ? "is-cancelled" : "",
      focused ? "is-focus" : "",
    ].join(" ").trim()}>
      <td>
        <span className={"rs-cisid " + (isDone ? "is-done" : "")}>
          <span className="rs-cisid-dot">{isDone ? "✓" : ""}</span>
          <span className="rs-cisid-head">{r.cisid.slice(0, 8)}</span>
          <span className="rs-cisid-tail">{r.cisid.slice(8)}</span>
        </span>
      </td>
      <td style={{ fontWeight: 500 }}>{r.name}</td>
      <td className="rs-mono" style={{ fontSize: 12 }}>{r.idno}</td>
      <td className="rs-mono" style={{ fontSize: 12, color: r.t1 === "—" ? "var(--ink-faint)" : "inherit" }}>{r.t1}</td>
      <td className="rs-mono" style={{ fontSize: 12 }}>{r.t2}</td>
      <td><StatusPill kind={r.status} /></td>
      <td><ReportPill kind={r.report} /></td>
      <td><span className={"rs-cb is-warn " + (r.referral ? "is-on" : "")} /></td>
      <td><span className={"rs-cb is-bad " + (r.missed ? "is-on" : "")} /></td>
      <td className="rs-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>{r.dispatchDate}</td>
      <td className="rs-mono" style={{ fontSize: 12, color: r.sendDate ? "var(--ink)" : "var(--ink-faint)" }}>
        {r.sendDate || "—"}
      </td>
      <td><span className={"rs-cb is-bad " + (r.cancel ? "is-on" : "")} /></td>
    </tr>
  );
}

function CasesTable({ rows, focusedTail }) {
  return (
    <div className="rs-tbl-wrap" style={{ flex: 1, minHeight: 0 }}>
      <div style={{ overflow: "auto", flex: 1 }}>
        <table className="rs-tbl">
          <colgroup>
            <col style={{ width: 170 }} />
            <col style={{ width: 82 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 92 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 64 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 64 }} />
          </colgroup>
          <thead>
            <tr>
              <th>編號 <span style={{ color: "var(--ink-faint)", fontWeight: 400 }} className="rs-mono">·點按回收</span></th>
              <th>姓名</th>
              <th>身分證</th>
              <th>手機1 <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>室內</span></th>
              <th>手機2 <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>行動</span></th>
              <th>檢體狀態</th>
              <th>報告</th>
              <th>待轉介</th>
              <th>未做腸鏡</th>
              <th>發管日</th>
              <th>送管日</th>
              <th>取消</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => <CaseRow key={r.cisid} r={r} focused={focusedTail === r.tail} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HintsBar({ items }) {
  const defaults = [
    [["/"], "搜尋"],
    [["↑","↓"], "上下選列"],
    [["↵"], "標記回收"],
    [["⌫"], "取消回收"],
    [["R"], "今日"],
    [["⌘","Z"], "復原"],
    [["⌘","K"], "命令列"],
  ];
  const list = items || defaults;
  return (
    <div className="rs-hints" style={{ padding: "8px 20px", background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
      {list.map(([keys, label], i) => (
        <span key={i}>
          {keys.map((k, j) => <span key={j} className="rs-kbd">{k}</span>)}
          {label}
        </span>
      ))}
      <span style={{ marginLeft: "auto", color: "var(--ink-faint)" }} className="rs-mono">
        編號末 5 碼自動定位 · 連點批次回收 · 樂觀更新 + 背景同步
      </span>
    </div>
  );
}

/* ── Variant: default (no recovery yet) ─────────────────────── */

function CasesDefaultScreen() {
  const rows = FOBT_ROWS_DEFAULT;
  const counts = {
    all: rows.length,
    pending: rows.length,
    done: 0,
    referral: 0,
    missed: 0,
    cancel: 0,
  };
  return (
    <div className="rs-frame">
      <Topbar session={SESSION_DATE} tab="fobt" />
      <CasesToolbar recoveryDate="05 / 22" filter="all" counts={counts} />
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }}>
        <StatsStrip pending={counts.pending} done={counts.done} total={counts.all} referral={0} missed={0} cancel={0} />
        <CasesTable rows={rows} />
      </div>
      <HintsBar />
    </div>
  );
}

/* ── Variant: progress (mid-recovery) ───────────────────────── */

function CasesProgressScreen() {
  const rows = FOBT_ROWS_PROGRESS;
  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    done: rows.filter(r => r.status === "done").length,
    referral: rows.filter(r => r.referral).length,
    missed: rows.filter(r => r.missed).length,
    cancel: rows.filter(r => r.cancel).length,
  };
  return (
    <div className="rs-frame">
      <Topbar session={SESSION_DATE} tab="fobt" />
      <CasesToolbar recoveryDate="05 / 22" filter="all" counts={counts} />
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }}>
        <StatsStrip pending={counts.pending} done={counts.done} total={counts.all} referral={counts.referral} missed={counts.missed} cancel={counts.cancel} />
        <CasesTable rows={rows} />
      </div>
      <HintsBar />
    </div>
  );
}

/* ── Variant: keyboard scan-in mode (search + focused row) ────── */

function CasesKeyboardScreen() {
  const rows = FOBT_ROWS_PROGRESS;
  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    done: rows.filter(r => r.status === "done").length,
    referral: rows.filter(r => r.referral).length,
    missed: rows.filter(r => r.missed).length,
    cancel: rows.filter(r => r.cancel).length,
  };
  return (
    <div className="rs-frame">
      <Topbar session={SESSION_DATE} tab="fobt" />

      {/* toolbar with search focused + a value typed in */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div className="rs-recovdate">
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: "currentColor" }}><rect x="2" y="3" width="10" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6 h10 M5 1.5 v2 M9 1.5 v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <div><div className="rs-recovdate-lbl">回收日</div><div className="rs-recovdate-val">05 / 22</div></div>
        </div>
        <div className="rs-topbar-divider" />
        <div style={{ display: "flex", gap: 6 }}>
          {[["all", "全部", counts.all], ["pending", "未回收", counts.pending], ["done", "已回收", counts.done]].map(([k, l, c]) => (
            <button key={k} className={"rs-chip" + (k === "pending" ? " is-on" : "")}>{l} <span className="rs-chip-count">{c}</span></button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="rs-search" style={{ minWidth: 320, border: "1px solid var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)", background: "white" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" style={{ color: "var(--accent)" }}><circle cx="5.5" cy="5.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 8.5 L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <input className="rs-mono" defaultValue="01008" style={{ fontWeight: 600, fontSize: 14, color: "var(--accent-ink)" }} />
          <span style={{ fontSize: 11, color: "var(--accent-ink)", display: "flex", alignItems: "center", gap: 4 }}>
            <span className="rs-kbd">↵</span> 標記回收
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }}>
        <StatsStrip pending={counts.pending} done={counts.done} total={counts.all} referral={counts.referral} missed={counts.missed} cancel={counts.cancel} />
        <CasesTable rows={rows} focusedTail="008" />
      </div>

      <HintsBar />
    </div>
  );
}

window.CasesDefaultScreen = CasesDefaultScreen;
window.CasesProgressScreen = CasesProgressScreen;
window.CasesKeyboardScreen = CasesKeyboardScreen;
