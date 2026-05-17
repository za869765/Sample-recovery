// GET /api/session?date=1150516&type=fobt
// Returns all cases in that tab.

import { getSheetId, getAccessToken, readTab, tabName, json } from './_sheets.js';

export async function onRequestGet({ request, env }){
  try{
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '';
    const type = url.searchParams.get('type') || '';
    if (!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    if (!['fobt','gastric'].includes(type)) return json({ok:false, error:'type 須為 fobt 或 gastric'}, 400);

    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const title = tabName(type, date);
    try{
      const cases = await readTab(sheetId, title, token);
      return json({ok:true, date, type, cases});
    }catch(e){
      if (String(e.message).includes('not found') || String(e.message).includes('Unable to parse range')){
        return json({ok:true, date, type, cases:[]});
      }
      throw e;
    }
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
