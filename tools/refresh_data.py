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


def _parse_completed_matches(content):
    """Parse all completed matches from content.
    Returns list of (home_code, away_code, home_score, away_score)."""
    pairs = re.findall(
        r"home:\s*'(\w+)'\s*,\s*away:\s*'(\w+)'\s*,\s*homeScore:\s*(\d+),\s*awayScore:\s*(\d+),\s*status:\s*'completed'",
        content
    )
    return [(h, a, int(hs), int(aws)) for h, a, hs, aws in pairs]


def _get_team_name_map(content):
    """Build {code: name} map from team blocks."""
    names = {}
    for m in re.finditer(r"code:\s*'(\w+)'\s*,\s*name:\s*'([^']+)'", content):
        names[m.group(1)] = m.group(2)
    return names


def update_standings_in_content(content):
    """Recalculate all group standings from completed matches."""
    tn = _get_team_name_map(content)
    result = content
    for g in 'ABCDEFGHIJKL':
        hdr = f'\n    {g}: {{\n'
        idx = result.find(hdr)
        if idx < 0:
            continue
        teams_start = result.find('teams: [', idx)
        if teams_start < 0:
            continue
        teams_end = result.find('\n      ],', teams_start)
        if teams_end < 0:
            continue
        m_end = result.find('\n    },', teams_start)
        if m_end < 0:
            m_end = result.find('\n  },\n', teams_start)
        if m_end < 0:
            continue
        teams_block = result[teams_start+9:teams_end]
        matches_block = result[result.find('matches: [', teams_start)+10:m_end]
        team_entries = []
        for tm in re.finditer(
            r"\{\s*code:\s*'(\w+)'\s*,\s*name:\s*'([^']+)'\s*,\s*flag:\s*'([^']+)'",
            teams_block
        ):
            code = tm.group(1); name = tm.group(2); flag = tm.group(3)
            sm = re.search(r"status:\s*'([^']+)'", teams_block[tm.start():tm.end()+60])
            team_entries.append({'code': code, 'name': name, 'flag': flag,
                                'status': sm.group(1) if sm else 'qualifying'})
            tn[code] = name
        if not team_entries:
            continue
        completed = []
        for mm in re.finditer(
            r"home:\s*'(\w+)'\s*,\s*away:\s*'(\w+)'\s*,\s*homeScore:\s*(\d+|null),\s*awayScore:\s*(\d+|null),\s*status:\s*'completed'",
            matches_block
        ):
            hs_s = mm.group(3); aws_s = mm.group(4)
            if hs_s != 'null' and aws_s != 'null':
                completed.append((mm.group(1), mm.group(2), int(hs_s), int(aws_s)))
        stats = {te['code']: {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'gd': 0, 'pts': 0}
                 for te in team_entries}
        for h, a, hs, aws in completed:
            for code, hsi, awi in [(h, hs, aws), (a, aws, hs)]:
                if code in stats:
                    s = stats[code]; s['p'] += 1; s['gf'] += hsi; s['ga'] += awi
                    if hsi > awi:
                        s['w'] += 1; s['pts'] += 3
                    elif hsi < awi:
                        s['l'] += 1
                    else:
                        s['d'] += 1; s['pts'] += 1
        for code, s in stats.items():
            s['gd'] = s['gf'] - s['ga']
        team_entries.sort(key=lambda t: (-stats[t['code']]['pts'], -stats[t['code']]['gd'], -stats[t['code']]['gf']))
        new_lines = []
        for te in team_entries:
            s = stats[te['code']]
            ml = (f"        {{ code: '{te['code']}', name: '{te['name']}', flag: '{te['flag']}', "
                  f"played: {s['p']}, won: {s['w']}, drawn: {s['d']}, lost: {s['l']}, "
                  f"gf: {s['gf']}, ga: {s['ga']}, gd: {s['gd']}, pts: {s['pts']}, "
                  f"status: '{te['status']}' }},")
            new_lines.append(ml)
        old_block = result[teams_start:teams_end + 11]
        new_block = f"teams: [\n" + '\n'.join(new_lines) + f"\n      ],"
        result = result[:teams_start] + new_block + result[teams_end + 11:]
    return result


def update_stats_in_content(content):
    """Recount completed matches and compute ALL stats (8 fields).
    Returns (new_content, total, goals, avg)."""
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
