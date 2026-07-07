import re, subprocess

path = '/home/admin/wc2026-site/assets/js/data-knockout.js'

with open(path) as f:
    content = f.read()

orig = content

# ---- Fix R16-5: current home=ESP, away=POR, homeScore=0, awayScore=1, winner=POR ----
# ESPN: home=POR, away=ESP, homeScore=0, awayScore=1, winner=ESP
idx5 = content.find('"id": "R16-5"')
idx6 = content.find('"id": "R16-6"')
block5 = content[idx5:idx6]

# Build the correct block
correct_block5 = '''            {
            "id": "R16-5",
            "match": 93,
            "home": "POR",
            "away": "ESP",
            "homeScore": 0,
            "awayScore": 1,
            "date": "July 6",
            "venue": "AT&T Stadium · Arlington",
            "status": "completed",
            "winner": "ESP",
            "pairing": "W83 vs W84"
          }'''
content = content[:idx5] + correct_block5 + content[idx6:]

# ---- Fix R16-6: current home=BEL, away=USA, homeScore=1, awayScore=4, winner=BEL ----
# ESPN: home=USA, away=BEL, homeScore=1, awayScore=4, winner=BEL
idx6 = content.find('"id": "R16-6"')
idx7 = content.find('"id": "R16-7"')
block6 = content[idx6:idx7]

correct_block6 = '''            {
            "id": "R16-6",
            "match": 94,
            "home": "USA",
            "away": "BEL",
            "homeScore": 1,
            "awayScore": 4,
            "date": "July 6",
            "venue": "Lumen Field · Seattle",
            "status": "completed",
            "winner": "BEL",
            "pairing": "W81 vs W82"
          }'''
content = content[:idx6] + correct_block6 + content[idx7:]

# ---- Reset QF-2, QF-3 to null ----
idx_qf2 = content.find('"id": "QF-2"')
idx_qf3 = content.find('"id": "QF-3"')
block_qf2 = content[idx_qf2:idx_qf3]

correct_qf2 = '''      {
        "id": "QF-2",
        "match": 98,
        "home": null,
        "away": null,
        "homeScore": null,
        "awayScore": null,
        "date": "July 10",
        "venue": "SoFi Stadium · Inglewood",
        "status": "pending",
        "pairing": "W91 vs W92"
      }'''
content = content[:idx_qf2] + correct_qf2 + content[idx_qf3:]

idx_qf3 = content.find('"id": "QF-3"')
idx_qf4 = content.find('"id": "QF-4"')
correct_qf3 = '''      {
        "id": "QF-3",
        "match": 99,
        "home": null,
        "away": null,
        "homeScore": null,
        "awayScore": null,
        "date": "July 11",
        "venue": "Hard Rock Stadium · Miami",
        "status": "pending",
        "pairing": "W93 vs W94"
      }'''
content = content[:idx_qf3] + correct_qf3 + content[idx_qf4:]

with open(path, 'w') as f:
    f.write(content)

print('Written!')

# Verify
for rid in ['R16-3', 'R16-4', 'R16-5', 'R16-6', 'QF-2', 'QF-3']:
    pos = content.find('"id": "' + rid + '"')
    if pos < 0: continue
    block = content[pos:pos+250]
    h = re.search(r'"home": ("\w+"|null)', block)
    a = re.search(r'"away": ("\w+"|null)', block)
    hs = re.search(r'"homeScore": (\d+|null)', block)
    aws = re.search(r'"awayScore": (\d+|null)', block)
    w = re.search(r'"winner": ("\w+")', block)
    if h and a and hs and aws:
        wstr = f' win={w.group(1)}' if w else ''
        print(f'  {rid}: {h.group(1)} {hs.group(1)}-{aws.group(1)} {a.group(1)}{wstr}')

r = subprocess.run(['node', '--check', path], capture_output=True, timeout=10)
print(f'JS: {"OK" if r.returncode==0 else r.stderr.decode()}')

if content != orig:
    print(f'Changes made: {len(content)} vs {len(orig)} bytes')
else:
    print('NO CHANGES!')
