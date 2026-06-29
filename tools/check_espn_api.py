#!/usr/bin/env python3
"""Final comprehensive scan: Scoreboard vs Summary API for full scorer/assist data."""
import urllib.request, json, sys, time

def fetch_json(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
    resp = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(resp.read())

dates = [f'202606{d:02d}' for d in range(12, 28)]

# --- Scoreboard scan ---
sb_scorers = {}
sb_total = 0
match_count = 0

# --- Summary scan ---
sum_scorers = {}  # name -> {name, team, goals, assists}
sum_total_goals = 0
sum_total_assists = 0

GOAL_TYPES = {'70', '97', '98', '137'}

for d in dates:
    url = f'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates={d}'
    try:
        data = fetch_json(url)
        for ev in data.get('events',[]):
            if not ev.get('status',{}).get('type',{}).get('completed'):
                continue
            eid = ev.get('id')
            match_count += 1
            comps = ev.get('competitions',[])
            
            # --- Scoreboard details ---
            for c in comps:
                for det in c.get('details',[]):
                    if det.get('type',{}).get('id') not in GOAL_TYPES:
                        continue
                    sb_total += 1
                    aths = det.get('athletesInvolved', det.get('participants',[]))
                    if aths:
                        name = aths[0].get('displayName', '')
                        if not name and 'athlete' in aths[0]:
                            name = aths[0]['athlete'].get('displayName','')
                        team = aths[0].get('team',{}).get('abbreviation','')
                        if name:
                            if name not in sb_scorers:
                                sb_scorers[name] = {'name': name, 'team': team, 'goals': 0}
                            sb_scorers[name]['goals'] += 1
            
            # --- Summary API ---
            try:
                surl = f'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={eid}'
                sdata = fetch_json(surl)
                for c in sdata.get('header',{}).get('competitions',[]):
                    for det in c.get('details',[]):
                        if not det.get('scoringPlay'):
                            continue
                        sum_total_goals += 1
                        parts = det.get('participants',[])
                        team_abbr = det.get('team',{}).get('abbreviation','')
                        
                        # Scorer
                        if parts:
                            scorer = parts[0].get('athlete', parts[0])
                            name = scorer.get('displayName','')
                            steam = scorer.get('team',{}).get('abbreviation','') or team_abbr
                            if name:
                                if name not in sum_scorers:
                                    sum_scorers[name] = {'name': name, 'team': steam, 'goals': 0, 'assists': 0}
                                sum_scorers[name]['goals'] += 1
                        
                        # Assister
                        if len(parts) > 1:
                            assister = parts[1].get('athlete', parts[1])
                            aname = assister.get('displayName','')
                            ateam = assister.get('team',{}).get('abbreviation','') or team_abbr
                            if aname:
                                if aname not in sum_scorers:
                                    sum_scorers[aname] = {'name': aname, 'team': ateam, 'goals': 0, 'assists': 0}
                                sum_scorers[aname]['assists'] += 1
                                sum_total_assists += 1
                time.sleep(0.25)
            except Exception as e:
                print(f"  Summary error {eid}: {e}")
    except:
        pass

print(f"=== RESULTS ===")
print(f"Matches: {match_count}")
print(f"\nScoreboard: {sb_total} goals from details")
print(f"Summary: {sum_total_goals} goals, {sum_total_assists} assists from scoringPlay")

print(f"\n--- SCOREBOARD Top Scorers (first 15) ---")
for s in sorted(sb_scorers.values(), key=lambda x:-x['goals'])[:15]:
    print(f"  {s['name']} ({s['team']}): {s['goals']}")

print(f"\n--- SUMMARY Top Scorers (first 15) ---")
for s in sorted(sum_scorers.values(), key=lambda x:(-x['goals'], -x['assists']))[:15]:
    print(f"  {s['name']} ({s['team']}): {s['goals']}g {s['assists']}a")

print(f"\n--- SUMMARY Top Assisters (first 10) ---")
for s in sorted(sum_scorers.values(), key=lambda x:(-x['assists'], -x['goals']))[:10]:
    if s['assists'] > 0:
        print(f"  {s['name']} ({s['team']}): {s['assists']}a {s['goals']}g")

# Messi comparison
print(f"\n--- MESSI ---")
print(f"  Scoreboard: {sb_scorers.get('Lionel Messi', {})}")
print(f"  Summary: {sum_scorers.get('Lionel Messi', {})}")

# 差异：summary 有但 scoreboard 没有的进球
print(f"\n--- DIFF: Summary has more goals than Scoreboard for these players ---")
for name, sd in sum_scorers.items():
    sbd = sb_scorers.get(name, {'goals': 0})
    diff = sd['goals'] - sbd['goals']
    if diff > 0:
        print(f"  {name}: summary={sd['goals']}, scoreboard={sbd['goals']}, +{diff}")
