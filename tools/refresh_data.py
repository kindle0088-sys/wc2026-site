#!/usr/bin/env python3
"""
WC2026 — ESPN → data.js 自动刷新脚本

用法:
  python3 tools/refresh_data.py                     # 仅刷新 data.js
  python3 tools/refresh_data.py --all               # + 更新 HTML 版本和时间戳
  python3 tools/refresh_data.py --dry-run           # 试运行，不写文件
  python3 tools/refresh_data.py --push              # + git commit + push
"""

import json
import os
import re
import sys
import shutil
import subprocess
import urllib.request
from datetime import datetime, timezone, timedelta

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(PROJECT_DIR, 'assets', 'js', 'data.js')
BACKUP_FILE = DATA_FILE + '.bak'

HTML_PAGES = [
    'index.html',
    'matches/index.html',
    'dashboard/index.html',
    'teams/index.html',
    'news/index.html',
    'news/article.html',
]

ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
TOURNAMENT_START = '2026-06-11'


def log(msg):
    print(f'[refresh] {msg}')


def wrn(msg):
    print(f'[WARN] {msg}')


def ok(msg):
    print(f'[OK] {msg}')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'WC2026-v3/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        wrn(f'Fetch failed: {url[:60]} — {e}')
        return None


def fetch_espn():
    """Fetch all tournament dates from ESPN. Returns { date_str: [events] }."""
    start = datetime.strptime(TOURNAMENT_START, '%Y-%m-%d')
    end = datetime.utcnow() + timedelta(days=1)
    result = {}
    cur = start
    while cur <= end:
        ds = cur.strftime('%Y%m%d')
        data = fetch(f'{ESPN_URL}?dates={ds}')
        if data and 'events' in data and len(data['events']) > 0:
            result[ds] = data['events']
            log(f'  {ds}: {len(data["events"])} events')
        cur += timedelta(days=1)
    return result


def parse_espn(raw):
    """Parse ESPN events → { match_key: { home, away, homeScore, awayScore, status } }."""
    matches = {}
    for _, events in raw.items():
        for ev in events:
            comp = ev.get('competitions', [{}])[0]
            competitors = comp.get('competitors', [])
            if len(competitors) < 2:
                continue
            tA, tB = competitors[0], competitors[1]
            abbrA = (tA.get('team') or {}).get('abbreviation', '')
            abbrB = (tB.get('team') or {}).get('abbreviation', '')
            if not abbrA or not abbrB:
                continue
            is_home = tA.get('homeAway') == 'home'
            home = abbrA if is_home else abbrB
            away = abbrB if is_home else abbrA
            st_id = (comp.get('status') or {}).get('type', {}).get('id', '0')
            if st_id == '28':
                status = 'completed'
            elif st_id == '26':
                status = 'live'
            else:
                status = 'upcoming'
            raw_h = (tA.get('score') if is_home else tB.get('score')) or '0'
            raw_a = (tB.get('score') if is_home else tA.get('score')) or '0'
            hs = None if status == 'upcoming' else int(raw_h)
            aws = None if status == 'upcoming' else int(raw_a)
            matches[f'{home}-{away}'] = {'home': home, 'away': away, 'homeScore': hs,
                                          'awayScore': aws, 'status': status}
    return matches


def update_match_in_content(content, home, away, hs, aws, status):
    """
    Find a match block `home: 'X', away: 'Y'` in data.js and update
    homeScore, awayScore, and status.
    Returns updated content and True if changed.
    """
    # Pattern: home: 'X', away: 'Y', homeScore: N, awayScore: N, status: 'S'
    pat = (r"(home:\s*'" + re.escape(home) + r"'\s*,\s*away:\s*'" + re.escape(away) +
           r"'\s*,\s*homeScore:\s*)(\d+|null)(\s*,\s*awayScore:\s*)(\d+|null)(\s*,\s*status:\s*')" +
           r"([^']+)(')")
    repl_hs = 'null' if hs is None else str(hs)
    repl_aws = 'null' if aws is None else str(aws)
    repl = r'\g<1>' + repl_hs + r'\g<3>' + repl_aws + r'\g<5>' + status + r'\g<7>'

    if re.search(pat, content):
        new = re.sub(pat, repl, content)
        if new != content:
            return new, True

    # Try swapped (home/away reversed in data.js vs ESPN)
    pat2 = (r"(home:\s*'" + re.escape(away) + r"'\s*,\s*away:\s*'" + re.escape(home) +
            r"'\s*,\s*homeScore:\s*)(\d+|null)(\s*,\s*awayScore:\s*)(\d+|null)(\s*,\s*status:\s*')" +
            r"([^']+)(')")
    if re.search(pat2, content):
        # Scores are reversed too
        repl2 = r'\g<1>' + repl_aws + r'\g<3>' + repl_hs + r'\g<5>' + status + r'\g<7>'
        new = re.sub(pat2, repl2, content)
        if new != content:
            return new, True

    return content, False


def _get_team_name_map(content):
    """Build {code: name} map from team blocks."""
    names = {}
    for m in re.finditer(r"code:\s*'(\w+)'\s*,\s*name:\s*'([^']+)'", content):
        names[m.group(1)] = m.group(2)
    return names


def _get_team_info_map(content):
    """Build {code: {'name': name, 'flag': flag}} map from team blocks."""
    info = {}
    for m in re.finditer(r"\{\s*code:\s*'(\w+)'\s*,\s*name:\s*'([^']+)'\s*,\s*flag:\s*'([^']+)'", content):
        info[m.group(1)] = {'name': m.group(2), 'flag': m.group(3)}
    return info


def _parse_team_entries(teams_block, team_info):
    """Parse existing team entries from a teams array."""
    entries = []
    for m in re.finditer(r"\{\s*code:\s*'(\w+)'\s*,\s*name:\s*'([^']+)'\s*,\s*flag:\s*'([^']+)'", teams_block):
        code, name, flag = m.groups()
        sm = re.search(r"status:\s*'([^']+)'", teams_block[m.start():m.end()+80])
        entries.append({'code': code, 'name': name, 'flag': flag,
                        'status': sm.group(1) if sm else 'qualifying'})
    return entries


def _parse_completed_matches(matches_block):
    """Parse completed matches from a matches array."""
    matches = []
    for m in re.finditer(
        r"home:\s*'(\w+)'\s*,\s*away:\s*'(\w+)'\s*,\s*homeScore:\s*(\d+|null),\s*awayScore:\s*(\d+|null),\s*status:\s*'completed'",
        matches_block
    ):
        h, a, hs_s, aws_s = m.groups()
        if hs_s != 'null' and aws_s != 'null':
            matches.append((h, a, int(hs_s), int(aws_s)))
    return matches


def update_standings_in_content(content):
    """Recalculate all group standings from completed matches, adding missing teams when needed."""
    tn = _get_team_name_map(content)
    team_info = _get_team_info_map(content)
    result = content
    for g in 'ABCDEFGHIJKL':
        m = re.search(rf"\n    {g}: \{{(?P<body>.*?)(?=\n    [A-Z]: \{{|\n  \}},\n|\Z)", result, re.S)
        if not m:
            continue
        body = m.group('body')
        body_start = m.start('body')
        body_end = m.end('body')
        teams_start = body.find('teams: [')
        teams_end = body.find('\n      ],', teams_start)
        matches_start = body.find('matches: [')
        # The matches array ends with — "\n      ]\n    }" (no comma before ])
        # Search for "\n      ]\n" to find the closing bracket of the matches array
        matches_end = body.find('\n      ]\n', matches_start)
        if teams_start < 0 or teams_end < 0 or matches_start < 0 or matches_end < 0:
            continue
        # Include the closing bracket
        matches_end += len('\n      ]')
        teams_block = body[teams_start+len('teams: ['):teams_end]
        matches_block = body[matches_start+len('matches: ['):matches_end]
        team_entries = _parse_team_entries(teams_block, team_info)
        completed = _parse_completed_matches(matches_block)
        team_codes = {te['code'] for te in team_entries}
        for h, a, hs, aws in completed:
            for code in (h, a):
                if code not in team_codes:
                    info = team_info.get(code, {'name': code, 'flag': '🏳️'})
                    team_entries.append({'code': code, 'name': info['name'], 'flag': info['flag'], 'status': 'qualifying'})
                    team_codes.add(code)
        stats = {te['code']: {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'gd': 0, 'pts': 0}
                 for te in team_entries}
        for h, a, hs, aws in completed:
            for code, scored, conceded in [(h, hs, aws), (a, aws, hs)]:
                if code in stats:
                    s = stats[code]
                    s['p'] += 1
                    s['gf'] += scored
                    s['ga'] += conceded
                    if scored > conceded:
                        s['w'] += 1
                        s['pts'] += 3
                    elif scored < conceded:
                        s['l'] += 1
                    else:
                        s['d'] += 1
                        s['pts'] += 1
        for code, s in stats.items():
            s['gd'] = s['gf'] - s['ga']
        team_entries.sort(key=lambda t: (-stats[t['code']]['pts'], -stats[t['code']]['gd'], -stats[t['code']]['gf'], t['code']))
        new_lines = []
        for te in team_entries:
            s = stats[te['code']]
            ml = (f"        {{ code: '{te['code']}', name: '{te['name']}', flag: '{te['flag']}', "
                  f"played: {s['p']}, won: {s['w']}, drawn: {s['d']}, lost: {s['l']}, "
                  f"gf: {s['gf']}, ga: {s['ga']}, gd: {s['gd']}, pts: {s['pts']}, "
                  f"status: '{te['status']}' }},")
            new_lines.append(ml)
        new_teams_block = 'teams: [\n' + '\n'.join(new_lines) + '\n      ],'
        body = body[:teams_start] + new_teams_block + body[teams_end+len('\n      ],'):]
        result = result[:body_start] + body + result[body_end:]
    return result


def _find_knockout_match(content, round_name, match_id):
    """Find a knockout match block by id (e.g. 'R32-1') and return its bounds."""
    pat = rf"\{{\s*id:\s*'{re.escape(match_id)}'.*?\}}"
    m = re.search(pat, content, re.S)
    return m


def _advance_knockout_winners(content):
    """Internal helper: advance completed knockout match winners into next round."""
    progression = [
        ('R32-1', 'R16-1', 'home'), ('R32-2', 'R16-1', 'away'),
        ('R32-3', 'R16-2', 'home'), ('R32-4', 'R16-2', 'away'),
        ('R32-5', 'R16-3', 'home'), ('R32-6', 'R16-3', 'away'),
        ('R32-7', 'R16-4', 'home'), ('R32-8', 'R16-4', 'away'),
        ('R32-9', 'R16-5', 'home'), ('R32-10', 'R16-5', 'away'),
        ('R32-11', 'R16-6', 'home'), ('R32-12', 'R16-6', 'away'),
        ('R32-13', 'R16-7', 'home'), ('R32-14', 'R16-7', 'away'),
        ('R32-15', 'R16-8', 'home'), ('R32-16', 'R16-8', 'away'),
        ('R16-1', 'QF-1', 'home'), ('R16-2', 'QF-1', 'away'),
        ('R16-3', 'QF-2', 'home'), ('R16-4', 'QF-2', 'away'),
        ('R16-5', 'QF-3', 'home'), ('R16-6', 'QF-3', 'away'),
        ('R16-7', 'QF-4', 'home'), ('R16-8', 'QF-4', 'away'),
        ('QF-1', 'SF-1', 'home'), ('QF-2', 'SF-1', 'away'),
        ('QF-3', 'SF-2', 'home'), ('QF-4', 'SF-2', 'away'),
        ('SF-1', 'F', 'home'), ('SF-2', 'F', 'away'),
    ]
    result = content
    for src_id, dst_id, dst_slot in progression:
        src_m = _find_knockout_match(result, None, src_id)
        dst_m = _find_knockout_match(result, None, dst_id)
        if not src_m or not dst_m:
            continue
        src_block = result[src_m.start():src_m.end()]
        status_m = re.search(r"status:\s*'(\w+)'", src_block)
        if not status_m or status_m.group(1) != 'completed':
            continue
        hs_m = re.search(r"homeScore:\s*(\d+)", src_block)
        aws_m = re.search(r"awayScore:\s*(\d+)", src_block)
        home_team_m = re.search(r"home:\s*'(\w+)'", src_block)
        away_team_m = re.search(r"away:\s*'(\w+)'", src_block)
        if not hs_m or not aws_m or not home_team_m or not away_team_m:
            continue
        hs = int(hs_m.group(1))
        aws = int(aws_m.group(1))
        winner = home_team_m.group(1) if hs > aws else away_team_m.group(1) if aws > hs else None
        if not winner:
            continue
        dst_block = result[dst_m.end()]
        if dst_slot == 'home':
            dst_new = re.sub(r"(home:\s*)'(\w+|null)'", r"\g<1>'" + winner + "'", dst_block, count=1)
        else:
            dst_new = re.sub(r"(away:\s*)'(\w+|null)'", r"\g<1>'" + winner + "'", dst_block, count=1)
        if dst_new != dst_block:
            result = result[:dst_m.start()] + dst_new + result[dst_m.end():]
    return result


def update_knockout_progression(content):
    """
    After knockout matches complete, auto-fill winners into next round.
    """
    return _advance_knockout_winners(content)


def update_scorers_in_content(content):
    """Fetch ESPN summary for all completed matches, extract top scorers & assisters.

    Replaces the topScorers and topAssisters arrays in data.js with fresh data
    from ESPN summary API (athletesInvolved in scoringPlay details).
    Returns updated content.
    """
    import time as _time

    # 1. Fetch all completed match event IDs from scoreboard API
    log('Fetching scorers data from ESPN summary API...')
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
                if st_id == '28':  # completed
                    event_ids.append(ev['id'])
        cur += timedelta(days=1)

    if not event_ids:
        log('No completed matches found for scorers update.')
        return content

    log(f'  Found {len(event_ids)} completed matches, fetching details...')

    # 2. Fetch summary for each match to get athletesInvolved
    scorer_map = {}  # name|team -> {name, team, goals, assists}
    assist_map = {}  # name|team -> {name, team, goals, assists}
    ok_count = 0

    for eid in event_ids:
        try:
            req = urllib.request.Request(
                f'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={eid}',
                headers={'User-Agent': 'WC2026-v3/1.0'}
            )
            with urllib.request.urlopen(req, timeout=10) as r:
                sd = json.loads(r.read().decode())
            details = (sd.get('header', {}).get('competitions', [{}])[0] or {}).get('details', [])
            for d in details:
                if not d.get('scoringPlay'):
                    continue
                team_obj = d.get('team', {})
                team_abbr = team_obj.get('abbreviation', '')
                athletes = d.get('athletesInvolved', [])
                if not team_abbr and athletes:
                    # Fallback: try to get abbreviation from athlete's team
                    team_abbr = (athletes[0].get('team') or {}).get('abbreviation', '')
                if not team_abbr:
                    continue  # Skip if we can't determine team
                if athletes and athletes[0].get('displayName'):
                    scorer_name = athletes[0]['displayName']
                    skey = f'{scorer_name}|{team_abbr}'
                    if skey not in scorer_map:
                        scorer_map[skey] = {'name': scorer_name, 'team': team_abbr, 'goals': 0, 'assists': 0}
                    scorer_map[skey]['goals'] += 1
                if len(athletes) > 1 and athletes[1].get('displayName'):
                    assist_name = athletes[1]['displayName']
                    akey = f'{assist_name}|{team_abbr}'
                    if akey not in assist_map:
                        assist_map[akey] = {'name': assist_name, 'team': team_abbr, 'goals': 0, 'assists': 0}
                    assist_map[akey]['assists'] += 1
                    # Also ensure assister appears in scorer_map (for combined stats)
                    if akey not in scorer_map:
                        scorer_map[akey] = {'name': assist_name, 'team': team_abbr, 'goals': 0, 'assists': 0}
                    scorer_map[akey]['assists'] += 1
            ok_count += 1
            if ok_count % 20 == 0:
                log(f'  Scorers: {ok_count}/{len(event_ids)} matches processed')
            _time.sleep(0.1)  # rate limit
        except Exception:
            pass

    log(f'  Processed {ok_count}/{len(event_ids)} matches for scorers/assists')

    if ok_count == 0:
        return content

    # 3. Build sorted top 10 lists
    all_players = list(scorer_map.values())
    # Merge assists from assist_map for players who only appear as scorers
    for p in all_players:
        pkey = f'{p["name"]}|{p["team"]}'
        if pkey in assist_map:
            p['assists'] = assist_map[pkey]['assists']

    top_scorers = sorted(all_players, key=lambda x: (-x['goals'], -x['assists']))[:10]
    top_assisters = sorted(all_players, key=lambda x: (-x['assists'], -x['goals']))[:10]

    # 4. Build flag lookup from data.js content
    flag_map = {}
    for m in re.finditer(r"code:\s*'(\w+)'\s*,\s*name:\s*'([^']+)'\s*,\s*flag:\s*'([^']+)'", content):
        flag_map[m.group(1)] = {'name': m.group(2), 'flag': m.group(3)}

    def fmt_entry(entry, idx):
        team_info = flag_map.get(entry['team'], {'flag': '🏳️', 'name': entry['team']})
        return (f"    {{ rank: {idx}, name: '{entry['name']}', team: '{entry['team']}', "
                f"flag: '{team_info['flag']}', goals: {entry['goals']}, "
                f"assists: {entry['assists']}, matches: 0 }}")

    scorers_lines = [fmt_entry(e, i+1) for i, e in enumerate(top_scorers)]
    assisters_lines = [fmt_entry(e, i+1) for i, e in enumerate(top_assisters)]

    scorers_block = ('  // Top scorers (auto-generated from ESPN summary API)\n'
                     '  topScorers: [\n' + ',\n'.join(scorers_lines) + '\n  ],')
    assisters_block = ('  // Top assisters (auto-generated from ESPN summary API)\n'
                       '  topAssisters: [\n' + ',\n'.join(assisters_lines) + '\n  ],')

    # 5. Replace in content using regex
    # Replace topScorers block
    content = re.sub(
        r'  // Top scorers.*?\n  topScorers: \[.*?\],',
        scorers_block,
        content,
        flags=re.DOTALL
    )
    # Replace topAssisters block
    content = re.sub(
        r'  // Top assisters.*?\n  topAssisters: \[.*?\],',
        assisters_block,
        content,
        flags=re.DOTALL
    )

    log(f'  Top scorer: {top_scorers[0]["name"]} ({top_scorers[0]["goals"]}G)')
    log(f'  Top assister: {top_assisters[0]["name"]} ({top_assisters[0]["assists"]}A)')
    return content


def update_stats_in_content(content):
    """Recount completed matches and compute ALL stats (8 fields).
    Returns (new_content, total, goals, avg).
    """
    matches = _parse_completed_matches(content)
    total = len(matches)
    if total == 0:
        return content, 0, 0, 0
    goals = sum(hs + aws for _, _, hs, aws in matches)
    avg = round(goals / total, 2)
    hw = aw = draws = cs = 0
    most_goals = 0
    biggest_diff = 0
    tn = _get_team_name_map(content)
    for h, a, hs, aws in matches:
        if hs > aws:
            hw += 1
            diff = hs - aws
            if diff > biggest_diff:
                biggest_diff = diff
        elif aws > hs:
            aw += 1
            diff = aws - hs
            if diff > biggest_diff:
                biggest_diff = diff
        else:
            draws += 1
        if hs == 0 or aws == 0:
            cs += 1
        totg = hs + aws
        if totg > most_goals:
            most_goals = totg
    most_desc = ''
    biggest_desc = ''
    for h, a, hs, aws in matches:
        totg = hs + aws
        hname = tn.get(h, h)
        aname = tn.get(a, a)
        diff = abs(hs - aws)
        if totg == most_goals and not most_desc:
            most_desc = f"{hname} {hs}-{aws} {aname} ({totg} goals)"
        if diff == biggest_diff and not biggest_desc:
            biggest_desc = f"{hname} {hs}-{aws} {aname} (+{diff})"
    updates = [
        (r'totalMatches:\s*\d+', f'totalMatches: {total}'),
        (r'totalGoals:\s*\d+', f'totalGoals: {goals}'),
        (r'avgGoalsPerMatch:\s*[\d.]+', f'avgGoalsPerMatch: {avg}'),
        (r"mostGoalsMatch:\s*'[^']*'", f"mostGoalsMatch: '{most_desc}'"),
        (r"biggestWin:\s*'[^']*'", f"biggestWin: '{biggest_desc}'"),
        (r'cleanSheets:\s*\d+', f'cleanSheets: {cs}'),
        (r'draws:\s*\d+', f'draws: {draws}'),
        (r'homeWins:\s*\d+', f'homeWins: {hw}'),
        (r'awayWins:\s*\d+', f'awayWins: {aw}'),
    ]
    result = content
    for pat, repl in updates:
        result = re.sub(pat, repl, result)
    return result, total, goals, avg


def update_timestamp(content):
    """Update the Last updated comment AND the lastUpdated field in WC_DATA."""
    now = datetime.now(timezone.utc)
    ts = now.strftime('%B %d, %Y at %H:%M')
    # Update the comment block
    pat = r"(Last updated:\s*)[^\n]+"
    if re.search(pat, content):
        content = re.sub(pat, fr'\1{ts}', content)
    # Update the lastUpdated field in WC_DATA object
    pat2 = r"(lastUpdated:\s*')[^']*(')"
    if re.search(pat2, content):
        content = re.sub(pat2, fr'\g<1>{ts}\g<2>', content)
    return content, ts


def validate_js(content):
    """Validate JS syntax using node."""
    try:
        r = subprocess.run(['node', '--check', '-'], input=content.encode(),
                          capture_output=True, timeout=10)
        return r.returncode == 0, r.stderr.decode()
    except FileNotFoundError:
        ok = content.count('{') == content.count('}')
        return ok, 'No node; brace balance OK' if ok else 'Brace mismatch'


def update_html(version, month_day):
    """Update all HTML pages with consistent version + timestamp."""
    count = 0
    for rel in HTML_PAGES:
        path = os.path.join(PROJECT_DIR, rel)
        if not os.path.exists(path):
            continue
        with open(path) as f:
            html = f.read()
        old = html
        html = re.sub(r'(src="[^"]*data\.js\?v=)\d+', fr'\g<1>{version}', html)
        html = re.sub(r'(src="[^"]*app\.js\?v=)\d+', fr'\g<1>{version}', html)
        html = re.sub(r'Data updated [A-Za-z]+ \d+, \d{4}',
                      f'Data updated {month_day}', html)
        if html != old:
            with open(path, 'w') as f:
                f.write(html)
            log(f'  ✓ {rel}')
            count += 1
    return count


def main():
    dry = '--dry-run' in sys.argv
    full = '--all' in sys.argv
    push = '--push' in sys.argv
    if not dry:
        shutil.copy2(DATA_FILE, BACKUP_FILE)

    with open(DATA_FILE) as f:
        orig = f.read()
    log(f'Read data.js ({len(orig)} bytes)')

    # Find current version from any HTML page
    ver = 7
    for rel in HTML_PAGES:
        path = os.path.join(PROJECT_DIR, rel)
        if os.path.exists(path):
            m = re.search(r'app\.js\?v=(\d+)', open(path).read())
            if m:
                ver = int(m.group(1))
                break
    log(f'Current version: v{ver}')

    # Fetch ESPN
    log('Fetching ESPN...')
    raw = fetch_espn()
    if not raw:
        wrn('No ESPN data. Keeping data.js.')
        return

    espn_m = parse_espn(raw)
    completed = {k: v for k, v in espn_m.items() if v['status'] == 'completed'}
    old_done = len(re.findall(r"status:\s*'completed'", orig))
    new_done = len(completed)
    log(f'ESPN: {new_done} completed (data.js had {old_done})')

    # Update each match
    content = orig
    updates = 0
    for key, m in completed.items():
        content, changed = update_match_in_content(content, m['home'], m['away'],
                                                    m['homeScore'], m['awayScore'],
                                                    m['status'])
        if changed:
            updates += 1
            log(f'  ✓ {m["home"]} {m["homeScore"]}-{m["awayScore"]} {m["away"]}')

    if updates == 0:
        log('No new match results to update.')

    # Update stats + standings
    content, total, goals, avg = update_stats_in_content(content)
    log(f'Stats: {total} matches, {goals} goals, avg {avg}')

    # Recalculate per-group standings
    content = update_standings_in_content(content)
    log('Standings recalculated from match results')

    # Knockout stage: update filled-in knockout teams from ESPN
    # This handles the case where ESPN already assigned specific teams to R16/QF/SF/F
    content = update_knockout_progression(content)
    log('Knockout progression updated (winners advanced)')

    # Update top scorers & assisters from ESPN summary API
    content = update_scorers_in_content(content)

    # Update timestamp
    content, ts = update_timestamp(content)
    month_day = ' '.join(ts.split()[:3]).rstrip(',')
    log(f'Timestamp: {ts}')

    # Validate JS
    is_valid, msg = validate_js(content)
    if is_valid:
        ok('JS syntax valid')
    else:
        wrn(f'JS error: {msg}')

    nver = ver + 1 if updates > 0 or content != orig else ver

    if not dry and content != orig:
        with open(DATA_FILE, 'w') as f:
            f.write(content)
        ok('data.js written')

    if full or push:
        if not dry:
            html_n = update_html(nver, month_day)
            log(f'HTML pages updated: {html_n}')

    if push:
        subprocess.run(['git', 'add', '-A'], cwd=PROJECT_DIR, capture_output=True)
        subprocess.run(['git', 'commit', '-m', f'chore: data refresh — {total} matches, {goals} goals'],
                      cwd=PROJECT_DIR, capture_output=True)
        subprocess.run(['git', 'push'], cwd=PROJECT_DIR, capture_output=True, timeout=30)
        ok('Pushed to GitHub')

    print()
    print('=' * 50)
    print('SUMMARY')
    print(f'  Matches:  {old_done} → {new_done}')
    print(f'  Goals:    {goals}')
    if updates > 0:
        print(f'  Updates:  {updates} matches')
    else:
        print(f'  Updates:  none (already current)')
    print(f'  Version:  v{ver} → v{nver}')
    print(f'  Dry run:  {dry}')
    print('=' * 50)


if __name__ == '__main__':
    main()
