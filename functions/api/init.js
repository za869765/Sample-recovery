// POST /api/init
// Body: { date:'1150516', fobt:[{cisid,name,idno,tel1,tel2}], gastric:[...] }
// Builds two tabs (行醫腸篩{date} / 行醫胃篩{date}), clears them, writes rows.

import { getSheetId, getAccessToken, sheetsAPI, ensureTab, tabName, json, caseToRow, listTabs } from './_sheets.js';

export async function onRequestPost({ request, env }){
  try{
    const { date, fobt, gastric } = await request.json();
    if (!date || !/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤 (需 7 位數字)'}, 400);
    if (!Array.isArray(fobt) || !Array.isArray(gastric)) return json({ok:false, error:'fobt/gastric 必須是陣列'}, 400);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const titles = new Set(await listTabs(sheetId, token));

    const tabF = tabName('fobt', date);
    const tabG = tabName('gastric', date);

    for (const t of [tabF, tabG]) await ensureTab(sheetId, t, token, titles);

    // clear existing data rows (preserve header)
    for (const t of [tabF, tabG]){
      await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(t)}!A2:L:clear`, 'POST', {}, token);
    }

    // build rows
    const toCase = (r) => ({
      name: r.name, idno: r.idno, tel1: r.tel1, tel2: r.tel2,
      status:'', report:'', referral:false, missed:false,
      dispatch: date, sendDate:'', cancel:false,
      cisid: r.cisid,
    });
    const fobtRows = fobt.map(r => caseToRow(toCase(r)));
    const gastRows = gastric.map(r => caseToRow(toCase(r)));

    if (fobtRows.length){
      await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(tabF)}!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        'POST', {values:fobtRows}, token);
    }
    if (gastRows.length){
      await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(tabG)}!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        'POST', {values:gastRows}, token);
    }

    return json({ok:true, fobtRows:fobtRows.length, gastricRows:gastRows.length,
      url:`https://docs.google.com/spreadsheets/d/${sheetId}/edit`});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
