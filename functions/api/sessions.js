// GET /api/sessions
// Lists 行醫腸篩{date} / 行醫胃篩{date} tabs, groups by date, returns counts + recovery progress.

import { getSheetId, getAccessToken, sheetsAPI, listTabs, TAB_PREFIX, json } from './_sheets.js';

export async function onRequestGet({ env }){
  try{
    const sheetId = getSheetId(env);
    const token = await getAccessToken(env);
    const titles = await listTabs(sheetId, token);

    const byDate = new Map();
    for (const t of titles){
      let match = null;
      if (t.startsWith(TAB_PREFIX.fobt))      match = { type:'fobt',    date:t.slice(TAB_PREFIX.fobt.length) };
      else if (t.startsWith(TAB_PREFIX.gastric)) match = { type:'gastric', date:t.slice(TAB_PREFIX.gastric.length) };
      if (!match || !/^\d{7}$/.test(match.date)) continue;
      if (!byDate.has(match.date)) byDate.set(match.date, {date:match.date, fobt:0, gastric:0, recovered:0});
      byDate.get(match.date)._tabs = (byDate.get(match.date)._tabs||[]).concat([{type:match.type, title:t}]);
    }

    // Batch-read columns E (status) and J (sendDate) for counting
    const ranges = [];
    const order = [];
    for (const [date, s] of byDate){
      for (const t of s._tabs){
        ranges.push(`${encodeURIComponent(t.title)}!A2:L`);
        order.push({date, type:t.type});
      }
    }
    if (ranges.length){
      const r = await sheetsAPI(`/${sheetId}/values:batchGet?${ranges.map(rg=>'ranges='+rg).join('&')}`, 'GET', null, token);
      (r.valueRanges||[]).forEach((vr, i) => {
        const meta = order[i];
        const rows = vr.values || [];
        const s = byDate.get(meta.date);
        s[meta.type] = rows.length;
        s.recovered += rows.filter(row => row[4] === '已回收').length;
      });
    }

    const sessions = [...byDate.values()]
      .map(s => { delete s._tabs; return s; })
      .sort((a,b) => b.date.localeCompare(a.date));

    return json({ok:true, sessions});
  }catch(e){
    return json({ok:false, error:e.message||String(e)}, 500);
  }
}
