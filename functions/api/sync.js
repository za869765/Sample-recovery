// POST /api/sync
// body: { date, chang:[{name,idno,tel1,tel2,seq}], wei:[...] }
// Writes to Google Sheets "行醫腸篩{date}" / "行醫胃篩{date}"
// Env vars (Cloudflare Pages):
//   GOOGLE_SHEET_ID         = 13U1nU2LlfwpNuxXprSDfo1hhC6ykSyD-u1rNmjikF2M
//   GOOGLE_SA_EMAIL         = service-account@xxx.iam.gserviceaccount.com
//   GOOGLE_SA_PRIVATE_KEY   = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

export async function onRequestPost({ request, env }) {
  try {
    const { date, chang, wei } = await request.json();
    if (!date || !/^\d{7}$/.test(date)) return json({ ok:false, error:'date 格式錯誤 (需 7 位數字)' }, 400);
    if (!Array.isArray(chang) || !Array.isArray(wei)) return json({ ok:false, error:'chang/wei 必須是陣列' }, 400);

    const sheetId = (env.GOOGLE_SHEET_ID || '').trim().replace(/^﻿/, '');
    if (!sheetId) return json({ ok:false, error:'缺少 GOOGLE_SHEET_ID env' }, 500);

    const token = await getAccessToken(env);
    const sheetMeta = await sheetsAPI(`/${sheetId}?fields=sheets.properties`, 'GET', null, token);
    const titles = new Set(sheetMeta.sheets.map(s => s.properties.title));

    const tabChang = `行醫腸篩${date}`;
    const tabWei = `行醫胃篩${date}`;
    for (const t of [tabChang, tabWei]) {
      if (!titles.has(t)) {
        await sheetsAPI(`/${sheetId}:batchUpdate`, 'POST', { requests: [{ addSheet: { properties: { title: t } } }] }, token);
        await ensureHeader(sheetId, t, token);
      } else {
        await ensureHeader(sheetId, t, token);
      }
    }

    const changRows = chang.map(r => [r.name, r.idno, r.tel1, r.tel2, '', '', '', '', '', '', '', r.seq]);
    const weiRows   = wei.map(r => [r.name, r.idno, r.tel1, r.tel2, '', '', '', '', '', '', '', r.seq]);

    await clearData(sheetId, tabChang, token);
    await clearData(sheetId, tabWei, token);
    if (changRows.length) await appendRows(sheetId, tabChang, changRows, token);
    if (weiRows.length)   await appendRows(sheetId, tabWei, weiRows, token);

    return json({
      ok: true,
      changRows: changRows.length,
      weiRows: weiRows.length,
      url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
    });
  } catch (err) {
    return json({ ok:false, error: err.message || String(err) }, 500);
  }
}

const HEADER = ['姓名','身分證字號','手機1','手機2','檢體狀態','報告狀態','待轉介','轉介未做腸鏡','發管日','送管日','取消追蹤','編號'];

async function ensureHeader(sheetId, tab, token) {
  const range = `${encodeURIComponent(tab)}!A1:L1`;
  const r = await sheetsAPI(`/${sheetId}/values/${range}`, 'GET', null, token);
  const first = (r.values && r.values[0]) || [];
  if (first.join('|') !== HEADER.join('|')) {
    await sheetsAPI(`/${sheetId}/values/${range}?valueInputOption=RAW`, 'PUT', { values: [HEADER] }, token);
  }
}

async function clearData(sheetId, tab, token) {
  // clear A2:L (keep header)
  const range = `${encodeURIComponent(tab)}!A2:L`;
  await sheetsAPI(`/${sheetId}/values/${range}:clear`, 'POST', {}, token);
}

async function appendRows(sheetId, tab, rows, token) {
  const range = `${encodeURIComponent(tab)}!A2`;
  await sheetsAPI(`/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, 'POST', { values: rows }, token);
}

async function sheetsAPI(path, method, body, token) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body)
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Sheets API ${method} ${path} → ${res.status}: ${txt.substring(0,300)}`);
  return txt ? JSON.parse(txt) : {};
}

// ===== Google Service Account JWT → access token =====
async function getAccessToken(env) {
  const email = (env.GOOGLE_SA_EMAIL || '').trim();
  const keyPem = (env.GOOGLE_SA_PRIVATE_KEY || '').trim();
  if (!email || !keyPem) throw new Error('缺少 GOOGLE_SA_EMAIL 或 GOOGLE_SA_PRIVATE_KEY env');
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const jwtClaim = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  const enc = obj => b64url(new TextEncoder().encode(JSON.stringify(obj)));
  const unsigned = `${enc(jwtHeader)}.${enc(jwtClaim)}`;
  const key = await importPrivateKey(keyPem);
  const sig = await crypto.subtle.sign({ name:'RSASSA-PKCS1-v1_5' }, key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(new Uint8Array(sig))}`;

  const tok = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const j = await tok.json();
  if (!j.access_token) throw new Error('取得 access_token 失敗：' + JSON.stringify(j));
  return j.access_token;
}

async function importPrivateKey(pem) {
  const clean = pem.replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const der = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign']);
}

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function json(obj, status=200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
