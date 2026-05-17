/* global React */
const { useState: useStateU } = React;

/* ────────────────────────────────────────────────────────────────
   Screen 2 — 上傳初始化頁
   Showing two artboards: file-detect state, and candidate-pick state
   ──────────────────────────────────────────────────────────────── */

function StepBar({ step }) {
  const steps = [
    { n: 1, label: "上傳名冊" },
    { n: 2, label: "比對摘要" },
    { n: 3, label: "勾選免掛號做" },
    { n: 4, label: "確認建立" },
  ];
  return (
    <div className="rs-steps">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          {i > 0 && <div className="rs-step-line" />}
          <div className={"rs-step " + (s.n === step ? "is-active" : s.n < step ? "is-done" : "")}>
            <span className="rs-step-num">{s.n < step ? "✓" : s.n}</span>
            <span>{s.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function UploadDetectScreen() {
  const files = [
    { kind: "ok", type: "fobt45-75歲名冊", name: "1150516_fobt名單.xls", count: 104, fields: 25, note: "依欄位 CISID, 身份證字號, 手機 自動識別" },
    { kind: "ok", type: "胃癌名冊",         name: "胃癌_0516.xls",        count: 81,  fields: 13, note: "全英文欄位 IDNO/cisid/NAME/jdate…" },
    { kind: "ok", type: "非45-75歲FOBT名冊", name: "非4575_0516.xls",      count: 74,  fields: 5,  note: "缺身分證/電話，需配對衛生所查詢" },
    { kind: "ok", type: "衛生所查詢",         name: "查詢_20260516.xls",    count: 213, fields: 18, note: "當日所有掛號名單" },
  ];

  return (
    <div className="rs-frame">
      <Topbar showTabs={false} />

      <div style={{ flex: 1, padding: "24px 40px", overflow: "auto", display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="rs-btn is-ghost is-sm">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M8 2 L4 6 L8 10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
            返回
          </button>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>建立新場次</h1>
          <div style={{ marginLeft: "auto" }}>
            <StepBar step={1} />
          </div>
        </div>

        {/* drop area */}
        <div className="rs-drop">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-ink)", display: "grid", placeItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 3 v9 M6 8 l4 -5 l4 5 M3 14 v2 a1 1 0 0 0 1 1 h12 a1 1 0 0 0 1 -1 v-2" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>拖放或選擇 4 份 Excel 名冊</div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>系統依欄位 header 自動識別檔案類型，不靠檔名</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="rs-btn">
                <svg width="13" height="13" viewBox="0 0 13 13"><path d="M6.5 1.5 v8 M3 6 l3.5 -3.5 L10 6 M2 10.5 h9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
                選擇檔案
              </button>
              <button className="rs-btn is-ghost is-sm" title="清除">重設</button>
            </div>
          </div>

          {/* file list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {files.map((f, i) => (
              <div key={i} className={"rs-file-row is-" + f.kind}>
                <div className="rs-file-glyph">XLS</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {f.kind === "ok" && <span style={{ color: "var(--ok)", marginRight: 6 }}>✓</span>}
                      {f.type}
                    </span>
                    <span className="rs-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{f.name}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{f.note}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  <span className="rs-mono" style={{ fontSize: 14, fontWeight: 600 }}>{f.count} 筆</span>
                  <span className="rs-mono" style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>{f.fields} 欄</span>
                </div>
                <button className="rs-btn is-ghost is-icon is-sm" title="移除">
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3 l6 6 M9 3 l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* summary card */}
        <div className="rs-card">
          <div className="rs-card-head">
            <div>
              <div className="rs-card-title">偵測結果摘要</div>
              <div className="rs-card-sub">將建立 2 個分頁，初始化欄位來源依 DESIGN §4</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="rs-recovdate" style={{ pointerEvents: "none" }}>
                <div>
                  <div className="rs-recovdate-lbl">行醫日期</div>
                  <div className="rs-recovdate-val">{SESSION_DATE}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div style={{ padding: "14px 18px", borderRight: "1px solid var(--line-soft)" }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>腸篩 健保（含 40-44 家族史）</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 4 }}>104</div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)" }} className="rs-mono">→ 行醫腸篩{SESSION_DATE}</div>
            </div>
            <div style={{ padding: "14px 18px", borderRight: "1px solid var(--line-soft)" }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>胃篩 健保 45-75</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 4 }}>81</div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)" }} className="rs-mono">→ 行醫胃篩{SESSION_DATE}</div>
            </div>
            <div style={{ padding: "14px 18px", borderRight: "1px solid var(--line-soft)" }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>非45-75 FOBT 候選</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 4 }}>74<span style={{ fontSize: 12, color: "var(--ink-mute)", marginLeft: 6 }}>待勾選</span></div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)" }} className="rs-mono">30-39 / ≥76 可補助</div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>衛生所查詢（補齊用）</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 4 }}>213</div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)" }} className="rs-mono">id93 → idno / tel</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid var(--line-soft)" }}>
          <div className="rs-hints">
            <span><span className="rs-kbd">Esc</span> 取消</span>
            <span><span className="rs-kbd">↵</span> 下一步</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="rs-btn">取消</button>
            <button className="rs-btn is-primary">
              繼續 → 勾選免掛號候選
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 2 L8 6 L4 10" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Candidate selection (step 3) ─────────────────────────────── */

function CandidatePickScreen() {
  const rows = CANDIDATES;
  const picked = rows.filter(r => r.picked).length;

  return (
    <div className="rs-frame">
      <Topbar showTabs={false} />

      <div style={{ flex: 1, padding: "24px 40px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="rs-btn is-ghost is-sm">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M8 2 L4 6 L8 10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
            返回
          </button>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>勾選免掛號做 FOBT（市府補助）</h1>
          <div style={{ marginLeft: "auto" }}>
            <StepBar step={3} />
          </div>
        </div>

        <div className="rs-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
            <b className="rs-mono" style={{ fontSize: 14 }}>{picked}</b>
            <span style={{ color: "var(--ink-mute)" }}> / {rows.length} 已勾選</span>
          </div>
          <div className="rs-topbar-divider" />
          <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--ink-mute)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--ok-soft)", border: "1px solid color-mix(in oklab, var(--ok) 30%, white)" }} />
              30-39 / ≥76 可申請補助
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--surface-alt)", border: "1px solid var(--line)" }} />
              40-44 無家族史 不可做
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--bad-soft)", border: "1px solid color-mix(in oklab, var(--bad) 30%, white)" }} />
              衛生所查詢 配對不到 身分證
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div className="rs-search" style={{ minWidth: 220 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" style={{ color: "var(--ink-faint)" }}><circle cx="5.5" cy="5.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 8.5 L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <input placeholder="搜尋姓名 / 末 5 碼" />
            </div>
            <button className="rs-btn is-sm">全選可做</button>
            <button className="rs-btn is-sm">清除</button>
          </div>
        </div>

        <div className="rs-tbl-wrap" style={{ flex: 1 }}>
          <table className="rs-tbl">
            <colgroup>
              <col style={{ width: 170 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 56 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 100 }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>編號（13 碼）</th>
                <th>姓名</th>
                <th>身分證</th>
                <th>性別</th>
                <th>年齡 / 補助</th>
                <th>來源</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const elig = r.band === "elig" && !r.missing;
                return (
                  <tr key={r.tail} style={r.band === "inelig" ? { color: "var(--ink-faint)" } : null}>
                    <td>
                      <span
                        className={"rs-cisid " + (r.picked ? "is-done" : "")}
                        style={!elig ? { opacity: 0.5, cursor: "not-allowed" } : null}
                      >
                        <span className="rs-cisid-dot">{r.picked ? "✓" : ""}</span>
                        <span className="rs-cisid-head">{r.id93.slice(0, 8)}</span>
                        <span className="rs-cisid-tail">{r.id93.slice(8)}</span>
                      </span>
                    </td>
                    <td>{r.name}</td>
                    <td>
                      {r.missing
                        ? <span style={{ color: "var(--bad)", fontFamily: "var(--mono)" }}>— 缺</span>
                        : <span className="rs-mono">{r.idno}</span>}
                    </td>
                    <td className="rs-sex">{r.sex}</td>
                    <td>
                      <span className={"rs-age " + (elig ? "is-elig" : "is-inelig")}>{r.age}</span>
                      <span style={{ marginLeft: 6, fontSize: 11, color: elig ? "var(--ok)" : "var(--ink-faint)" }}>
                        {r.band === "elig" ? (r.age >= 76 ? "≥76" : "30-39") : "40-44 不在範圍"}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>非45-75</td>
                    <td style={{ fontSize: 11.5, color: r.missing ? "var(--bad)" : "var(--ink-mute)" }}>
                      {r.missing ? "衛生所查詢 配對失敗 — 請手動補登" : "id93 → 衛生所查詢 OK"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="rs-hints">
            <span><span className="rs-kbd">點編號</span> 切換勾選</span>
            <span><span className="rs-kbd">Space</span> 切換游標列</span>
            <span><span className="rs-kbd">⌘</span><span className="rs-kbd">A</span> 全選可做</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>最終將寫入 <b className="rs-mono" style={{ color: "var(--ink)" }}>{104 + picked}</b> 腸篩 / <b className="rs-mono" style={{ color: "var(--ink)" }}>81</b> 胃篩</span>
            <button className="rs-btn">上一步</button>
            <button className="rs-btn is-primary">
              建立場次寫入試算表
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 2 L8 6 L4 10" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.UploadDetectScreen = UploadDetectScreen;
window.CandidatePickScreen = CandidatePickScreen;
window.StepBar = StepBar;
