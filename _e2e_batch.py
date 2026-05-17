"""E2E test for /api/batch_case"""
import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'https://sample-recovery.pages.dev'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'

def req(path, method='GET', body=None):
    data = None if body is None else json.dumps(body).encode('utf-8')
    headers = {'User-Agent':UA}
    if data is not None: headers['Content-Type'] = 'application/json'
    r = urllib.request.Request(BASE+path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

# Read existing 1150516 fobt cases (need cisids that exist)
print('=== read fobt 1150516 first 3 cisids ===')
code, body = req('/api/session?date=1150516&type=fobt')
cases = body.get('cases', [])[:3]
print('  3 cisids:', [c['cisid'] for c in cases])

# batch_case: write sendDate=05/22 for 3
print('\n=== POST /api/batch_case write sendDate=05/22 to 3 cisids ===')
updates = [{'cisid':c['cisid'], 'fields':{'status':'V','sendDate':'05/22'}} for c in cases]
code, body = req('/api/batch_case', 'POST', {'date':'1150516','type':'fobt','updates':updates})
print('  status:', code, 'body:', json.dumps(body, ensure_ascii=False))

# Verify
code, body = req('/api/session?date=1150516&type=fobt')
verified = [c for c in body.get('cases',[]) if c['cisid'] in [u['cisid'] for u in updates]]
print('\n=== verify ===')
for v in verified:
    print(f"  {v['cisid']}: status={v['status']} sendDate={v['sendDate']}")

# clear
print('\n=== clear ===')
upd_clear = [{'cisid':u['cisid'], 'fields':{'status':'','sendDate':''}} for u in updates]
code, body = req('/api/batch_case', 'POST', {'date':'1150516','type':'fobt','updates':upd_clear})
print('  cleared:', code, body.get('ok'))
