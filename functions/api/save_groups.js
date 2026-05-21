// POST /api/save_groups
// Body: { date:'1150516', groups:[{name,from,to}] }
// Writes the report-grouping config into 行醫分組{date} sheet.

import { getSheetId, getAccessToken, sheetsAPI, ensureTab, listTabs, tabName, json, GROUPS_HEADER, groupToRow } from './_sheets.js';

export async function onRequestPost({ request, env }){
  try{
    const { date, groups } = await request.json();
    if(!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    if(!Array.isArray(groups)) return json({ok:false, error:'groups 必須是陣列'}, 400);
    const clean = groups
      .map(g => ({ name:String(g.name||'').trim(), from:parseInt(g.from,10)||0, to:parseInt(g.to,10)||0 }))
      .filter(g => g.name && g.to>=g.from);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const titles = new Set(await listTabs(sheetId, token));
    const tabG = tabName('groups', date);

    await ensureTab(sheetId, tabG, token, titles, GROUPS_HEADER);
    await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(tabG)}!A2:C:clear`, 'POST', {}, token);
    const rows = clean.map(groupToRow);
    if(rows.length){
      await sheetsAPI(`/${sheetId}/values/${encodeURIComponent(tabG)}!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        'POST', {values:rows}, token);
    }
    return json({ok:true, groups:clean});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
