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


def update_stats_in_content(content):
    """Recount completed matches and goals, update stats block.
    Returns (new_content, total_matches, total_goals, avg_goals)."""
    # Find completed matches with numeric scores
    score_pairs = re.findall(
        r"homeScore:\s*(\d+),\s*awayScore:\s*(\d+),\s*status:\s*'completed'",
        content
    )
    total = len(score_pairs)
    goals = sum(int(h) + int(a) for h, a in score_pairs)
    avg = round(goals / total, 2) if total > 0 else 0

    stats_updates = [
        (r'totalMatches:\s*\d+', f'totalMatches: {total}'),
        (r'totalGoals:\s*\d+', f'totalGoals: {goals}'),
        (r'avgGoalsPerMatch:\s*[\d.]+', f'avgGoalsPerMatch: {avg}'),
    ]
    result = content
    for pat, repl in stats_updates:
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

    # Update stats
    content, total, goals, avg = update_stats_in_content(content)
    log(f'Stats: {total} matches, {goals} goals, avg {avg}')

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
