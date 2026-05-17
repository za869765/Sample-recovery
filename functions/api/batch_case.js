// POST /api/batch_case
// Body: { date, type, updates: [{cisid, fields:{status?, sendDate?, ...}}] }
// 一次 Sheets batchUpdate 寫多 cells，避免每筆 PATCH 各自打 API 觸發 quota。

import { getSheetId, getAccessToken, sheetsAPI, tabName, json, FIELD_COL, partialValue } from './_sheets.js';

export async function onRequestPost({ request, env }){
  try{
    const { date, type, updates } = await request.json();
    if(!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    if(!['fobt','gastric'].includes(type)) return json({ok:false, error:'type 須為 fobt/gastric'}, 400);
    if(!Array.isArray(updates) || updates.length===0) return json({ok:false, error:'updates 必須是非空陣列'}, 400);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const title = tabName(type, date);

    // 一次讀 column L，建 cisid → row 對應
    const colL = await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(title)}!L2:L`, 'GET', null, token);
    const rows = colL.values || [];
    const cisidToRow = new Map();
    rows.forEach((r, i) => {
      const c = String((r||[])[0] || '').trim();
      if(c) cisidToRow.set(c, i+2);
    });

    // 構建 batch cells
    const data = [];
    const notFound = [];
    for(const u of updates){
      const cid = String(u.cisid||'').trim();
      const rowNum = cisidToRow.get(cid);
      if(!rowNum){ notFound.push(cid); continue; }
      for(const [field, val] of Object.entries(u.fields||{})){
        const col = FIELD_COL[field];
        if(!col) continue;
        data.push({range:`${title}!${col}${rowNum}`, values:[[partialValue(field, val)]]});
      }
    }

    if(!data.length) return json({ok:true, updated:0, notFound, message:'沒有可寫入的欄位'});

    await sheetsAPI(`/${sheetId}/values:batchUpdate`, 'POST',
      {valueInputOption:'USER_ENTERED', data}, token);

    return json({ok:true, updated:data.length, rows:updates.length, notFound});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
