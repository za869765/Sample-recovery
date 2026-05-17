import gzip, tarfile, zipfile, io, os, sys
sys.stdout.reconfigure(encoding='utf-8')

src = r'C:\Users\MIHC\.claude\projects\D--Backup-Desktop-CODE\8aedd5a9-be56-4a4c-902f-f71bd37d5283\tool-results\webfetch-1778994706793-1ddqfo.bin'
out = r'D:\Backup\Desktop\CODE\project\Sample-recovery\_design_unpacked'
os.makedirs(out, exist_ok=True)

with open(src, 'rb') as f:
    raw = f.read()
print('size:', len(raw), 'first bytes:', raw[:4].hex())

# Try gunzip
try:
    decompressed = gzip.decompress(raw)
    print('gunzip OK, size:', len(decompressed), 'first bytes:', decompressed[:8].hex())
    # try as tar
    try:
        tf = tarfile.open(fileobj=io.BytesIO(decompressed))
        for m in tf.getmembers():
            print('  TAR member:', m.name, m.size)
            if m.isfile():
                tf.extract(m, out)
        print('extracted to', out)
    except Exception as e:
        print('tar failed:', e)
        # write as single file
        with open(os.path.join(out, 'payload.bin'), 'wb') as wf:
            wf.write(decompressed)
        # try parse as text
        try:
            text = decompressed.decode('utf-8')
            with open(os.path.join(out, 'payload.txt'), 'w', encoding='utf-8') as wf:
                wf.write(text)
            print('saved as text, length:', len(text))
            print(text[:500])
        except Exception as e2:
            print('not utf-8:', e2)
except Exception as e:
    print('gunzip failed:', e)

# Also try as zip
try:
    zf = zipfile.ZipFile(io.BytesIO(raw))
    print('ZIP files:')
    for n in zf.namelist():
        print(' ', n)
        zf.extract(n, out)
except Exception as e:
    print('zip failed:', e)
