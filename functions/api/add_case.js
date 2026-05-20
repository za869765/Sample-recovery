// POST /api/add_case
// Body: { date, type, case:{cisid, name, idno, tel1, tel2, dispatch?} }
// 加掛：append 一列到對應分頁。dispatch 預設今日 MM/DD。
// 若 cisid 已存在於該分頁則拒絕（避免重複）。

import { getSheetId, getAccessToken, sheetsAPI, ensureTab, tabName, json, caseToRow, listTabs, rocToMMDD } from './_sheets.js';

export async function onRequestPost({ request, env }){
  try{
    const { date, type, case:c } = await request.json();
    if(!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    if(!['fobt','gastric'].includes(type)) return json({ok:false, error:'type 須為 fobt 或 gastric'}, 400);
    if(!c || typeof c!=='object') return json({ok:false, error:'缺少 case 物件'}, 400);
    const cisid = String(c.cisid||'').trim();
    if(!cisid) return json({ok:false, error:'缺少 cisid'}, 400);
    if(!c.name) return json({ok:false, error:'缺少姓名'}, 400);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const title = tabName(type, date);

    const titles = new Set(await listTabs(sheetId, token));
    await ensureTab(sheetId, title, token, titles);

    // 檢查 cisid 是否已存在
    const colL = await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(title)}!L2:L`, 'GET', null, token);
    const existing = (colL.values||[]).some(r => String((r||[])[0]||'').trim() === cisid);
    if(existing) return json({ok:false, error:`編號 ${cisid} 已存在於 ${title}`}, 409);

    const dispatch = c.dispatch || rocToMMDD(date);
    const row = caseToRow({
      name: c.name, idno: c.idno||'', tel1: c.tel1||'', tel2: c.tel2||'',
      status:'', report:'', referral:false, missed:false,
      dispatch, sendDate:'', cancel:false,
      cisid,
    });

    await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(title)}!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      'POST', {values:[row]}, token);

    return json({ok:true, cisid, type, date, dispatch});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
