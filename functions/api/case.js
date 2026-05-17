// PATCH /api/case
// Body: { date, type, cisid, updates:{status?, report?, referral?, missed?, sendDate?, cancel?, tel1?, tel2?, dispatch?} }
// Locates row by cisid (column L) then writes updated cells. Optimistic UI on client.

import { getSheetId, getAccessToken, sheetsAPI, tabName, json, FIELD_COL, partialValue } from './_sheets.js';

export async function onRequestPatch({ request, env }){
  try{
    const { date, type, cisid, updates } = await request.json();
    if (!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    if (!['fobt','gastric'].includes(type)) return json({ok:false, error:'type 須為 fobt 或 gastric'}, 400);
    if (!cisid) return json({ok:false, error:'缺少 cisid'}, 400);
    if (!updates || typeof updates!=='object') return json({ok:false, error:'缺少 updates'}, 400);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const title = tabName(type, date);

    // Find row by reading column L
    const colL = await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(title)}!L2:L`, 'GET', null, token);
    const rows = colL.values || [];
    const idx = rows.findIndex(r => String(r[0]||'').trim() === String(cisid).trim());
    if (idx < 0) return json({ok:false, error:'找不到 cisid='+cisid+' 於 '+title}, 404);
    const rowNum = idx + 2;

    // batchUpdate values
    const data = [];
    for (const [field, val] of Object.entries(updates)){
      const col = FIELD_COL[field];
      if (!col) continue;
      data.push({range:`${title}!${col}${rowNum}`, values:[[partialValue(field, val)]]});
    }
    if (!data.length) return json({ok:true, rowNum, updated:0});

    await sheetsAPI(`/${sheetId}/values:batchUpdate`, 'POST',
      {valueInputOption:'USER_ENTERED', data}, token);

    return json({ok:true, rowNum, updated:data.length});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
