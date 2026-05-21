// GET /api/groups?date=1150516
// Returns the report-grouping config (nurse → cisid-tail range) stored in 行醫分組{date} tab.

import { getSheetId, getAccessToken, readGroups, tabName, json } from './_sheets.js';

export async function onRequestGet({ request, env }){
  try{
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '';
    if (!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const title = tabName('groups', date);
    try{
      const groups = await readGroups(sheetId, title, token);
      return json({ok:true, date, groups});
    }catch(e){
      if (String(e.message).includes('not found') || String(e.message).includes('Unable to parse range')){
        return json({ok:true, date, groups:[]});
      }
      throw e;
    }
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
