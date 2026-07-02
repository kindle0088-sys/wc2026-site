#!/usr/bin/env python3
"""
Update top scorers & assisters in data-groups.js from ESPN summary API.
"""
import sys, os, re, json, urllib.request, time as _time
from datetime import datetime, timezone, timedelta

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS_FILE = os.path.join(PROJECT_DIR, 'assets', 'js', 'data-groups.js')
ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
TOURNAMENT_START = '2026-06-11'

def log(msg):
    print(f'[scorers] {msg}')

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'WC2026-v3/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        return None

# 1. Get event IDs for all completed matches
start = datetime.strptime(TOURNAMENT_START, '%Y-%m-%d')
end = datetime.utcnow() + timedelta(days=1)
event_ids = []
cur = start
while cur <= end:
    ds = cur.strftime('%Y%m%d')
    data = fetch(f'{ESPN_URL}?dates={ds}')
    if data and 'events' in data:
        for ev in data['events']:
            comp = ev.get('competitions', [{}])[0]
            st_id = (comp.get('status') or {}).get('type', {}).get('id', '0')
            if st_id in ('28', '45', '47'):
                event_ids.append(ev['id'])
    cur += timedelta(days=1)

log(f'Found {len(event_ids)} completed matches')

# 2. Fetch summary for each match
scorer_map = {}
assist_map = {}
ok_count = 0

for eid in event_ids:
    try:
        req = urllib.request.Request(
            f'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={eid}',
            headers={'User-Agent': 'WC2026-v3/1.0'}
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            sd = json.loads(r.read().decode())
        details = (sd.get('header', {}).get('competitions', [{}])[0] or {}).get('details', [])
        for d in details:
            if not d.get('scoringPlay'):
                continue
            team_obj = d.get('team', {})
            team_abbr = team_obj.get('abbreviation', '')
            athletes = d.get('participants', [])
            if not team_abbr and athletes:
                team_abbr = ((athletes[0].get('athlete') or {}).get('team') or {}).get('abbreviation', '')
            if not team_abbr:
                continue
            if athletes and (athletes[0].get('athlete') or {}).get('displayName'):
                sname = athletes[0]['athlete']['displayName']
                skey = f'{sname}|{team_abbr}'
                if skey not in scorer_map:
                    scorer_map[skey] = {'name': sname, 'team': team_abbr, 'goals': 0, 'assists': 0, 'matches': set()}
                scorer_map[skey]['goals'] += 1
                scorer_map[skey]['matches'].add(eid)
            if len(athletes) > 1 and (athletes[1].get('athlete') or {}).get('displayName'):
                aname = athletes[1]['athlete']['displayName']
                akey = f'{aname}|{team_abbr}'
                if akey not in assist_map:
                    assist_map[akey] = {'name': aname, 'team': team_abbr, 'goals': 0, 'assists': 0, 'matches': set()}
                assist_map[akey]['assists'] += 1
                assist_map[akey]['matches'].add(eid)
                if akey not in scorer_map:
                    scorer_map[akey] = {'name': aname, 'team': team_abbr, 'goals': 0, 'assists': 0, 'matches': set()}
        ok_count += 1
        if ok_count % 20 == 0:
            log(f'  {ok_count}/{len(event_ids)} matches')
        _time.sleep(0.05)
    except Exception as e:
        pass

log(f'Processed {ok_count}/{len(event_ids)} matches')

if ok_count == 0:
    log('ERROR: No matches processed!')
    sys.exit(1)

# 3. Build sorted lists
all_players = list(scorer_map.values())
for p in all_players:
    pkey = f'{p["name"]}|{p["team"]}'
    if pkey in assist_map:
        p['assists'] = assist_map[pkey]['assists']

top_scorers = sorted(all_players, key=lambda x: (-x['goals'], -x['assists']))[:10]
top_assisters = sorted(all_players, key=lambda x: (-x['assists'], -x['goals']))[:10]

# 4. Get flag info from groups file
with open(GROUPS_FILE) as f:
    groups = f.read()

flag_map = {}
for m in re.finditer(r'"code":\s*"(\w+)"\s*,\s*"name":\s*"([^"]+)"\s*,\s*"flag":\s*"([^"]+)"', groups):
    flag_map[m.group(1)] = {'name': m.group(2), 'flag': m.group(3)}

def fmt_entry(entry, idx):
    team_info = flag_map.get(entry['team'], {'flag': '🏳️', 'name': entry['team']})
    return (f'    {{ "rank": {idx}, "name": "{entry["name"]}", '
            f'"team": "{entry["team"]}", '
            f'"flag": "{team_info["flag"]}", '
            f'"goals": {entry["goals"]}, '
            f'"assists": {entry["assists"]}, "matches": {len(entry["matches"])} }}')

scorers_lines = [fmt_entry(e, i+1) for i, e in enumerate(top_scorers)]
assisters_lines = [fmt_entry(e, i+1) for i, e in enumerate(top_assisters)]

scorers_block = '  "topScorers": [\n' + ',\n'.join(scorers_lines) + '\n  ],'
assisters_block = '  "topAssisters": [\n' + ',\n'.join(assisters_lines) + '\n  ],'

# 5. Replace in content
new_groups = re.sub(r'"topScorers": \[.*?\],', scorers_block, groups, flags=re.DOTALL)
new_groups = re.sub(r'"topAssisters": \[.*?\],', assisters_block, new_groups, flags=re.DOTALL)

if new_groups != groups:
    with open(GROUPS_FILE, 'w') as f:
        f.write(new_groups)
    log(f'data-groups.js updated!')
    log(f'  Top scorer: {top_scorers[0]["name"]} ({top_scorers[0]["goals"]}G)')
    log(f'  Top assister: {top_assisters[0]["name"]} ({top_assisters[0]["assists"]}A)')
else:
    log('Content unchanged (scorer data matches existing)')
