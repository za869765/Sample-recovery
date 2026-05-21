// POST /api/save_roster
// Body: { date:'1150516', roster:[{cisid,name,idno,tel1,tel2,age}] }
// Writes the clinic-query roster into 行醫掛號{date} sheet (creates the tab if needed, clears + appends).
// Used for old sessions created before v0.3.36 to back-fill the roster sheet.

import { getSheetId, getAccessToken, sheetsAPI, ensureTab, listTabs, tabName, json, ROSTER_HEADER, rosterToRow } from './_sheets.js';

export async function onRequestPost({ request, env }){
  try{
    const { date, roster } = await request.json();
    if(!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    if(!Array.isArray(roster)) return json({ok:false, error:'roster 必須是陣列'}, 400);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const titles = new Set(await listTabs(sheetId, token));
    const tabR = tabName('roster', date);

    await ensureTab(sheetId, tabR, token, titles, ROSTER_HEADER);
    await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(tabR)}!A2:F:clear`, 'POST', {}, token);
    const rows = roster.map(rosterToRow);
    if(rows.length){
      await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(tabR)}!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        'POST', {values:rows}, token);
    }
    return json({ok:true, rosterRows:rows.length});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
