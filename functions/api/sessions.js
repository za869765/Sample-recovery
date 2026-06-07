// GET /api/sessions
// Lists 行醫腸篩{date} / 行醫胃篩{date} tabs, groups by date, returns counts + recovery progress.

import { getSheetId, getAccessToken, sheetsAPI, listTabs, TAB_PREFIX, json, rowToCase } from './_sheets.js';

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
        // 退掛 (cancel=K=TRUE) 不算入分母，與詳細頁/圖表統計一致
        const active = rows.map((row, idx) => rowToCase(row, idx + 2)).filter(c => !c.cancel);
        s[meta.type] = active.length;
        s.recovered += active.filter(c => c.status === 'V').length;
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
