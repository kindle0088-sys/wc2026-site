#!/usr/bin/env python3
"""Debug script to analyze why update_scorers_in_content doesn't change content."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import importlib.util
spec = importlib.util.spec_from_file_location('refresh_data', os.path.join(os.path.dirname(__file__), 'refresh_data.py'))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

# Read groups file
with open('assets/js/data-groups.js') as f:
    groups = f.read()

# Run with --no-scorers flag off
groups_updated = mod.update_scorers_in_content(groups)

if groups_updated != groups:
    ok('data-groups.js scorers updated')
    diff_len = len(groups_updated) - len(groups)
    print(f'Length diff: {diff_len}')
    
    # Extract topScorers section from both
    import re
    old_s = re.search(r'"topScorers": \[.*?\],', groups, re.DOTALL)
    new_s = re.search(r'"topScorers": \[.*?\],', groups_updated, re.DOTALL)
    if old_s and new_s:
        print('=== OLD topScorers (first 300 chars) ===')
        print(old_s.group()[:300])
        print()
        print('=== NEW topScorers (first 300 chars) ===')
        print(new_s.group()[:300])
else:
    print('Content unchanged!')
    print('Checking possible causes...')
    
    import re
    # Does the regex match?
    m = re.search(r'"topScorers": \[.*?\],', groups, re.DOTALL)
    print(f'Regex matches: {m is not None}')
    
    # Compare first 10 chars of each line in the old block
    old_block = m.group() if m else 'N/A'
    print(f'Old block ends with: {repr(old_block[-30:])}')
    
    # Check the generated replacement
    # We need to run the internal steps manually
    # Fetch event IDs and compute
    import urllib.request, json
    from datetime import datetime, timezone, timedelta
    
    ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
    TOURNAMENT_START = '2026-06-11'
    
    def fetch(url):
        req = urllib.request.Request(url, headers={'User-Agent': 'WC2026-v3/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            return None
    
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
                if st_id == '28':
                    event_ids.append(ev['id'])
        cur += timedelta(days=1)
    
    print(f'Event IDs found: {len(event_ids)}')
    
    # Manually compute top scorers
    scorer_map = {}
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
                    scorer_name = athletes[0]['athlete']['displayName']
                    skey = f'{scorer_name}|{team_abbr}'
                    if skey not in scorer_map:
                        scorer_map[skey] = {'name': scorer_name, 'team': team_abbr, 'goals': 0, 'assists': 0}
                    scorer_map[skey]['goals'] += 1
                if len(athletes) > 1 and (athletes[1].get('athlete') or {}).get('displayName'):
                    assist_name = athletes[1]['athlete']['displayName']
                    # ... handle assists
            ok_count += 1
        except Exception as e:
            pass
    
    print(f'Processed {ok_count} matches')
    
    # Show top 3
    top = sorted(scorer_map.values(), key=lambda x: (-x['goals'], -x['assists']))[:3]
    print('\n=== Computed Top 3 ===')
    for t in top:
        print(f'  {t["name"]} ({t["team"]}): {t["goals"]}G, {t["assists"]}A')
