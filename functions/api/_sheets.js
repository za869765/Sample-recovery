// Shared Google Sheets helpers for all /api/* endpoints.
// Pages Functions auto-skip files prefixed with _ so this is not an endpoint.

export const HEADER = ['姓名','身分證字號','手機1','手機2','檢體狀態','報告狀態','待轉介','轉介未做腸鏡','發管日','送管日','取消追蹤','編號'];
export const ROSTER_HEADER = ['姓名','身分證字號','手機1','手機2','年齡','編號'];
export const GROUPS_HEADER = ['姓名','起','迄'];
export const TAB_PREFIX = { fobt:'行醫腸篩', gastric:'行醫胃篩', roster:'行醫掛號', groups:'行醫分組' };

export function getSheetId(env){
  const id = (env.GOOGLE_SHEET_ID || '').trim().replace(/^﻿/, '');
  if (!id) throw new Error('缺少 GOOGLE_SHEET_ID env');
  return id;
}

export function tabName(type, date){
  if (!TAB_PREFIX[type]) throw new Error('unknown type: '+type);
  return TAB_PREFIX[type] + date;
}

export function rocToMMDD(roc){
  if (!roc || String(roc).length !== 7) return '';
  return String(roc).slice(3,5) + '/' + String(roc).slice(5,7);
}

export function json(obj, status=200){
  return new Response(JSON.stringify(obj), { status, headers:{'Content-Type':'application/json'} });
}

export async function getAccessToken(env){
  const email = (env.GOOGLE_SA_EMAIL || '').trim();
  const keyPem = (env.GOOGLE_SA_PRIVATE_KEY || '').trim();
  if (!email || !keyPem) throw new Error('缺少 GOOGLE_SA_EMAIL 或 GOOGLE_SA_PRIVATE_KEY env');
  const now = Math.floor(Date.now()/1000);
  const enc = obj => b64url(new TextEncoder().encode(JSON.stringify(obj)));
  const unsigned = enc({alg:'RS256',typ:'JWT'}) + '.' + enc({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  });
  const key = await importPrivateKey(keyPem);
  const sig = await crypto.subtle.sign({name:'RSASSA-PKCS1-v1_5'}, key, new TextEncoder().encode(unsigned));
  const jwt = unsigned + '.' + b64url(new Uint8Array(sig));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('取得 access_token 失敗：'+JSON.stringify(j));
  return j.access_token;
}

async function importPrivateKey(pem){
  const clean = pem.replace(/\\n/g,'\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');
  const der = Uint8Array.from(atob(clean), c=>c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['sign']);
}
function b64url(bytes){
  let s=''; for(const b of bytes) s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

export async function sheetsAPI(path, method, body, token, attempt = 0){
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets${path}`, {
    method,
    headers:{'Authorization':`Bearer ${token}`, 'Content-Type':'application/json'},
    body: body==null ? undefined : JSON.stringify(body)
  });
  const txt = await r.text();
  // 429 (rate limit) / 503 (transient) → 指數退避重試 1s, 2s, 4s, 8s
  if ((r.status === 429 || r.status === 503) && attempt < 4){
    const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
    await new Promise(res => setTimeout(res, delay));
    return sheetsAPI(path, method, body, token, attempt + 1);
  }
  if (!r.ok) throw new Error(`Sheets ${method} ${path} → ${r.status}: ${txt.substring(0,300)}`);
  return txt ? JSON.parse(txt) : {};
}

export async function listTabs(sheetId, token){
  const meta = await sheetsAPI(`/${sheetId}?fields=sheets.properties`, 'GET', null, token);
  return meta.sheets.map(s=>s.properties.title);
}

export async function ensureTab(sheetId, title, token, existingTitles, headerRow){
  if (!existingTitles.has(title)){
    await sheetsAPI(`/${sheetId}:batchUpdate`, 'POST',
      {requests:[{addSheet:{properties:{title}}}]}, token);
    existingTitles.add(title);
  }
  const h = headerRow || HEADER;
  const lastCol = String.fromCharCode(65 + h.length - 1);
  const range = `${encodeURIComponent(title)}!A1:${lastCol}1`;
  const cur = await sheetsAPI(`/${sheetId}/values/${range}`, 'GET', null, token);
  if (((cur.values||[])[0]||[]).join('|') !== h.join('|')){
    await sheetsAPI(`/${sheetId}/values/${range}?valueInputOption=RAW`, 'PUT', {values:[h]}, token);
  }
}

export function rosterToRow(p){
  return [p.name||'', p.idno||'', p.tel1||'', p.tel2||'', p.age||'', p.cisid||''];
}
export function rowToRoster(row){
  const v = i => (row[i]==null ? '' : String(row[i]));
  return { name:v(0), idno:v(1), tel1:v(2), tel2:v(3), age:v(4), cisid:v(5) };
}
export async function readRoster(sheetId, title, token){
  const range = `${encodeURIComponent(title)}!A2:F`;
  const r = await sheetsAPI(`/${sheetId}/values/${range}`, 'GET', null, token);
  return (r.values || []).map(rowToRoster);
}

export function groupToRow(g){
  return [g.name||'', String(g.from||''), String(g.to||'')];
}
export function rowToGroup(row){
  const v = i => (row[i]==null ? '' : String(row[i]));
  return { name: v(0), from: parseInt(v(1),10)||0, to: parseInt(v(2),10)||0 };
}
export async function readGroups(sheetId, title, token){
  const range = `${encodeURIComponent(title)}!A2:C`;
  const r = await sheetsAPI(`/${sheetId}/values/${range}`, 'GET', null, token);
  return (r.values || []).map(rowToGroup).filter(g => g.name && g.from>=0 && g.to>=g.from);
}

export async function readTab(sheetId, title, token){
  const range = `${encodeURIComponent(title)}!A2:L`;
  const r = await sheetsAPI(`/${sheetId}/values/${range}`, 'GET', null, token);
  return (r.values || []).map((row, i) => rowToCase(row, i+2));
}

// row[0..11] → case object
export function rowToCase(row, rowNum){
  const v = i => (row[i]==null ? '' : String(row[i]));
  const rawStatus = v(4);
  return {
    rowNum,
    name:      v(0),
    idno:      v(1),
    tel1:      v(2),
    tel2:      v(3),
    status:    rawStatus==='已回收' ? 'V' : rawStatus,
    report:    v(5),
    referral:  truthy(v(6)),
    missed:    truthy(v(7)),
    dispatch:  v(8),
    sendDate:  v(9),
    cancel:    truthy(v(10)),
    cisid:     v(11),
  };
}
function truthy(s){ return s==='1' || s==='TRUE' || s==='true' || s==='✓' || s==='Y' || s==='是'; }

export function caseToRow(c){
  return [
    c.name||'', c.idno||'', c.tel1||'', c.tel2||'',
    c.status||'', c.report||'',
    c.referral?'TRUE':'', c.missed?'TRUE':'',
    c.dispatch||'', c.sendDate||'',
    c.cancel?'TRUE':'',
    c.cisid||'',
  ];
}

// Build header→column index map for partial updates
export const FIELD_COL = {
  name:'A', idno:'B', tel1:'C', tel2:'D',
  status:'E', report:'F', referral:'G', missed:'H',
  dispatch:'I', sendDate:'J', cancel:'K', cisid:'L',
};

export function partialValue(field, val){
  if (['referral','missed','cancel'].includes(field)) return val ? 'TRUE' : '';
  if (field === 'status') return val ? 'V' : '';
  return val == null ? '' : String(val);
}
