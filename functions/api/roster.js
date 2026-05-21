// GET /api/roster?date=1150516
// Returns the clinic-query roster (all HIS registrations) stored at session creation time.

import { getSheetId, getAccessToken, readRoster, tabName, json } from './_sheets.js';

export async function onRequestGet({ request, env }){
  try{
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '';
    if (!/^\d{7}$/.test(date)) return json({ok:false, error:'date 格式錯誤'}, 400);
    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const title = tabName('roster', date);
    try{
      const roster = await readRoster(sheetId, title, token);
      return json({ok:true, date, roster});
    }catch(e){
      if (String(e.message).includes('not found') || String(e.message).includes('Unable to parse range')){
        return json({ok:true, date, roster:[]});
      }
      throw e;
    }
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
