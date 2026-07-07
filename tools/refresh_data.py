#!/usr/bin/env python3
"""
WC2026 — ESPN &rarr; data-knockout.js &#x81ea;&#x52a8;&#x5237;&#x65b0;&#x811a;&#x672c;

&#x7528;&#x6cd5;:
  python3 tools/refresh_data.py                                 # &#x589e;&#x91cf;&#x6a21;&#x5f0f; (&#x9ed8;&#x8ba4;)
  python3 tools/refresh_data.py --all                           # + &#x66f4;&#x65b0; HTML &#x7248;&#x672c;&#x548c;&#x65f6;&#x95f4;&#x6233;
  python3 tools/refresh_data.py --full                          # &#x5168;&#x91cf;&#x5237;&#x65b0; (&#x91cd;&#x626b;&#x6240;&#x6709;&#x65e5;&#x671f;)
  python3 tools/refresh_data.py --full --all                    # &#x5168;&#x91cf; + HTML
  python3 tools/refresh_data.py --dry-run                       # &#x8bd5;&#x8fd0;&#x884c;
  python3 tools/refresh_data.py --no-scorers                    # &#x8df3;&#x8fc7;&#x5c04;&#x624b;&#x699c;
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
DATA_FILE = os.path.join(PROJECT_DIR, 'assets', 'js', 'data-knockout.js')
GROUPS_FILE = os.path.join(PROJECT_DIR, 'assets', 'js', 'data-groups.js')
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

# &#x5317;&#x4eac;&#x65f6;&#x95f4; UTC+8
BJ_TZ = timezone(timedelta(hours=8))


def log(msg):
    print(f'[refresh] {msg}')


def wrn(msg):
    print(f'[WARN] {msg}')


def ok(msg):
    print(f'[OK] {msg}')


def bj_now():
    """Return a timezone-aware datetime in Beijing time (UTC+8)."""
    return datetime.now(BJ_TZ)


def bj_today_str():
    """Return today's date string in Beijing time, e.g. '20260708'."""
    return bj_now().strftime('%Y%m%d')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'WC2026-v3/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        wrn(f'Fetch failed: {url[:60]} &mdash; {e}')
        return None


# ===== _meta helpers (incremental tracking) =====

def read_meta(content):
    """Extract _meta dict from data-knockout.js content."""
    m = re.search(r'"_meta":\s*\{(.*?)\}', content, re.DOTALL)
    if not m:
        return {}
    meta = {}
    for kv in re.finditer(r'"(lastProcessedDate|processedEventIds|processedUpTo)":\s*("[^"]*"|\[[^\]]*\])', m.group(1)):
        key = kv.group(1)
        val = kv.group(2)
        if key == 'processedEventIds':
            meta[key] = json.loads(val)
        else:
            meta[key] = val.strip('"')
    return meta


def write_meta_block(meta):
    """Generate _meta JSON block string."""
    ids_str = ', '.join(str(eid) for eid in meta.get('processedEventIds', []))
    return (f'  "_meta": {{\n'
            f'    "lastProcessedDate": "{meta.get("lastProcessedDate", "")}",\n'
            f'    "processedUpTo": "{meta.get("processedUpTo", "")}",\n'
            f'    "processedEventIds": [{ids_str}]\n'
            f'  }},')


def update_meta_in_content(content, meta):
    """Replace or insert _meta block in content."""
    existing = re.search(r'"_meta":\s*\{.*?\},?', content, re.DOTALL)
    new_block = write_meta_block(meta)
    if existing:
        return content[:existing.start()] + new_block + content[existing.end():]
    # Insert after "lastUpdated" field
    ins = re.search(r'"lastUpdated":\s*"[^"]*"', content)
    if ins:
        return content[:ins.end()] + ',\n' + new_block + content[ins.end():]
    return content


# ===== ESPN data fetch =====

def fetch_espn(dates_to_fetch=None):
    """
    Fetch ESPN calendar data for specified dates.
    
    Args:
        dates_to_fetch: list of date strings like ['20260705', '20260706'].
                        If None, fetches ALL dates from tournament start to today (Beijing time).
    """
    if dates_to_fetch is not None:
        # Incremental: only specific dates
        result = {}
        for ds in dates_to_fetch:
            data = fetch(f'{ESPN_URL}?dates={ds}')
            if data and 'events' in data and len(data['events']) > 0:
                result[ds] = data['events']
                log(f'  {ds}: {len(data["events"])} events')
        return result
    
    # Full: from tournament start to today (Beijing time)
    start = datetime.strptime(TOURNAMENT_START, '%Y-%m-%d').replace(tzinfo=BJ_TZ)
    end = bj_now() + timedelta(days=1)
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


def get_new_dates_since(last_date_str, meta):
    """Return list of date strings to fetch since last processed date."""
    if not last_date_str:
        return None

    try:
        last_dt = datetime.strptime(last_date_str, '%Y%m%d').replace(tzinfo=BJ_TZ)
    except ValueError:
        return None

    # Calculate from day after last to today+1 (Beijing)
    today = bj_now()
    end = today + timedelta(days=1)

    new_dates = []
    cur = last_dt + timedelta(days=1)
    while cur <= end:
        new_dates.append(cur.strftime('%Y%m%d'))
        cur += timedelta(days=1)

    return new_dates if new_dates else None


def parse_espn(raw):
    """Parse ESPN events &rarr; { match_key: { home, away, homeScore, awayScore, status, ids } }."""
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
            if st_id in ('28', '45', '47'):
                status = 'completed'
            elif st_id == '26':
                status = 'live'
            else:
                status = 'upcoming'
            raw_h = (tA.get('score') if is_home else tB.get('score')) or '0'
            raw_a = (tB.get('score') if is_home else tA.get('score')) or '0'
            hs = None if status == 'upcoming' else int(raw_h)
            aws = None if status == 'upcoming' else int(raw_a)
            key = f'{home}-{away}'
            matches[key] = {'home': home, 'away': away, 'homeScore': hs,
                            'awayScore': aws, 'status': status, 'id': ev.get('id')}
    return matches


# ===== Match update helpers =====

def update_match_in_content(content, home, away, hs, aws, status):
    """Find match block in any knockout round and update scores."""
    rounds = ['roundOf32', 'roundOf16', 'quarterFinals', 'semiFinals', 'thirdPlace', 'final']
    for rnd in rounds:
        content, found = _update_match_in_round(content, rnd, home, away, hs, aws, status)
        if found:
            return content, True
    return content, False


def _update_match_in_round(content, round_name, home, away, hs, aws, status):
    rnd_match = re.search(rf'"{round_name}":\s*\[(.*?)\]', content, re.DOTALL)
    if not rnd_match:
        return content, False
    rnd_section = rnd_match.group(1)
    rnd_start = rnd_match.start(1)

    pat1 = re.compile(
        r'"home":\s*"{home}"\s*,\s*"away":\s*"{away}"'.format(home=re.escape(home), away=re.escape(away)),
        re.DOTALL
    )
    pat2 = re.compile(
        r'"home":\s*"{away}"\s*,\s*"away":\s*"{home}"'.format(home=re.escape(home), away=re.escape(away)),
        re.DOTALL
    )

    m = pat1.search(rnd_section)
    swapped = False
    if not m:
        m = pat2.search(rnd_section)
        if not m:
            return content, False
        swapped = True

    idx = m.start()
    start = rnd_section.rfind('{', 0, idx)
    end = rnd_section.find('}', idx)
    if start < 0 or end < 0:
        return content, False

    block = rnd_section[start:end+1]
    new_block = block

    score_keys = ['homeScore', 'awayScore'] if not swapped else ['awayScore', 'homeScore']
    vals = [hs, aws] if not swapped else [aws, hs]

    for skey, val in zip(score_keys, vals):
        old_val = 'null' if val is None else str(val)
        sp = re.compile(rf'"{re.escape(skey)}":\s*(\d+|null)')
        m2 = sp.search(new_block)
        if m2:
            new_block = sp.sub(f'"{skey}": {old_val}', new_block)

    sp2 = re.compile(r'"status":\s*"[^"]*"')
    if sp2.search(new_block):
        new_block = sp2.sub(f'"status": "{status}"', new_block)

    if new_block != block:
        return content[:rnd_start + start] + new_block + content[rnd_start + end + 1:], True
    return content, False


def _get_team_name_map(content):
    names = {}
    for m in re.finditer(r'"code":\s*"(\w+)"\s*,\s*"name":\s*"([^"]+)"', content):
        names[m.group(1)] = m.group(2)
    return names


def _get_team_info_map(content):
    info = {}
    for m in re.finditer(r'\{\s*"code":\s*"(\w+)"\s*,\s*"name":\s*"([^"]+)"\s*,\s*"flag":\s*"([^"]+)"', content):
        info[m.group(1)] = {'name': m.group(2), 'flag': m.group(3)}
    return info


def _parse_team_entries(teams_block, team_info):
    entries = []
    for m in re.finditer(r'\{\s*"code":\s*"(\w+)"\s*,\s*"name":\s*"([^"]+)"\s*,\s*"flag":\s*"([^"]+)"', teams_block):
        code, name, flag = m.groups()
        sm = re.search(r'"status":\s*"([^"]+)"', teams_block[m.start():m.end()+80])
        entries.append({'code': code, 'name': name, 'flag': flag,
                        'status': sm.group(1) if sm else 'qualifying'})
    return entries


def _parse_completed_matches(matches_block):
    matches = []
    for m in re.finditer(
        r'"home":\s*"(\w+)"\s*,\s*"away":\s*"(\w+)"\s*,\s*"homeScore":\s*(\d+|null)\s*,\s*"awayScore":\s*(\d+|null)\s*,\s*"status":\s*"completed"',
        matches_block
    ):
        h, a, hs_s, aws_s = m.groups()
        if hs_s != 'null' and aws_s != 'null':
            matches.append((h, a, int(hs_s), int(aws_s)))
    return matches


# ===== Knockout progression =====

def _find_knockout_match(content, round_name, match_id):
    pat = rf'\{{\s*"id":\s*"{re.escape(match_id)}"'
    m = re.search(pat, content, re.S)
    return m


def _advance_knockout_winners(content):
    progression = [
        ('R32-1', 'R16-1', 'home'), ('R32-3', 'R16-1', 'away'),
        ('R32-2', 'R16-2', 'home'), ('R32-5', 'R16-2', 'away'),
        ('R32-4', 'R16-3', 'home'), ('R32-6', 'R16-3', 'away'),
        ('R32-7', 'R16-4', 'home'), ('R32-8', 'R16-4', 'away'),
        ('R32-12', 'R16-5', 'home'), ('R32-11', 'R16-5', 'away'),
        ('R32-10', 'R16-6', 'home'), ('R32-9', 'R16-6', 'away'),
        ('R32-14', 'R16-7', 'home'), ('R32-16', 'R16-7', 'away'),
        ('R32-13', 'R16-8', 'home'), ('R32-15', 'R16-8', 'away'),
        ('R16-1', 'QF-1', 'home'), ('R16-2', 'QF-1', 'away'),
        ('R16-3', 'QF-2', 'home'), ('R16-4', 'QF-2', 'away'),
        ('R16-5', 'QF-3', 'home'), ('R16-6', 'QF-3', 'away'),
        ('R16-7', 'QF-4', 'home'), ('R16-8', 'QF-4', 'away'),
        ('QF-1', 'SF-1', 'home'), ('QF-2', 'SF-1', 'away'),
        ('QF-3', 'SF-2', 'home'), ('QF-4', 'SF-2', 'away'),
        ('SF-1', 'F', 'home'), ('SF-2', 'F', 'away'),
    ]
    result = content

    def _get_block(text, pos):
        end = text.find('}', pos)
        if end < 0:
            return None, -1, -1
        return text[pos:end+1], pos, end+1

    for src_id, dst_id, dst_slot in progression:
        src_m = _find_knockout_match(result, None, src_id)
        dst_m = _find_knockout_match(result, None, dst_id)
        if not src_m or not dst_m:
            continue
        src_block, src_start, src_end = _get_block(result, src_m.start())
        dst_block, dst_start, dst_end = _get_block(result, dst_m.start())
        if src_block is None or dst_block is None:
            continue
        status_m = re.search(r'"status":\s*"(\w+)"', src_block)
        if not status_m or status_m.group(1) != 'completed':
            continue
        hs_m = re.search(r'"homeScore":\s*(\d+)', src_block)
        aws_m = re.search(r'"awayScore":\s*(\d+)', src_block)
        home_team_m = re.search(r'"home":\s*"(\w+)"', src_block)
        away_team_m = re.search(r'"away":\s*"(\w+)"', src_block)
        if not hs_m or not aws_m or not home_team_m or not away_team_m:
            continue
        hs = int(hs_m.group(1))
        aws = int(aws_m.group(1))
        winner = home_team_m.group(1) if hs > aws else away_team_m.group(1) if aws > hs else None
        if not winner:
            continue
        if dst_slot == 'home':
            dst_home_m = re.search(r'"home":\s*"(\w+)"', dst_block)
            if dst_home_m:
                dst_new = re.sub(r'"home":\s*"(\w+)"', f'"home": "{winner}"', dst_block, count=1)
            else:
                dst_new = re.sub(r'"home":\s*null', f'"home": "{winner}"', dst_block, count=1)
        else:
            dst_away_m = re.search(r'"away":\s*"(\w+)"', dst_block)
            if dst_away_m:
                dst_new = re.sub(r'"away":\s*"(\w+)"', f'"away": "{winner}"', dst_block, count=1)
            else:
                dst_new = re.sub(r'"away":\s*null', f'"away": "{winner}"', dst_block, count=1)
        if dst_new != dst_block:
            result = result[:dst_start] + dst_new + result[dst_end:]
    return result


def update_knockout_progression(content):
    return _advance_knockout_winners(content)


# ===== Scorers update =====

def fetch_scorer_event_ids(dates_to_fetch=None):
    """Get ESPN event IDs for completed matches. If dates_to_fetch specified, only those dates."""
    import time as _time
    event_ids = []
    if dates_to_fetch is None:
        # Full: all dates
        start = datetime.strptime(TOURNAMENT_START, '%Y-%m-%d').replace(tzinfo=BJ_TZ)
        end = bj_now() + timedelta(days=1)
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
    else:
        for ds in dates_to_fetch:
            data = fetch(f'{ESPN_URL}?dates={ds}')
            if data and 'events' in data:
                for ev in data['events']:
                    comp = ev.get('competitions', [{}])[0]
                    st_id = (comp.get('status') or {}).get('type', {}).get('id', '0')
                    if st_id in ('28', '45', '47'):
                        event_ids.append(ev['id'])
    return list(set(event_ids))  # deduplicate


def update_scorers_in_content(content, new_event_ids=None):
    """Fetch ESPN summary for matches, extract top scorers &amp; assisters.
    
    If new_event_ids specified, only fetch those (incremental mode merges with existing data).
    If None, fetch ALL completed matches (full mode).
    """
    import time as _time

    log('Fetching scorers data from ESPN summary API...')
    
    # Get event IDs
    if new_event_ids is None:
        event_ids = fetch_scorer_event_ids()
    else:
        event_ids = new_event_ids
    
    if not event_ids:
        log('No completed matches found for scorers update.')
        return content
    
    log(f'  Found {len(event_ids)} completed matches, fetching details...')

    # Parse EXISTING scorer data from content for incremental merge
    existing_scorers = {}
    existing_assisters = {}
    
    if new_event_ids is not None:
        # Incremental mode: parse existing topScorers/topAssisters from content
        sc_m = re.search(r'"topScorers":\s*\[(.*?)\]', content, re.DOTALL)
        if sc_m:
            for entry in re.finditer(r'\{\s*"rank":\s*\d+\s*,\s*"name":\s*"([^"]+)"\s*,\s*"team":\s*"([^"]+)"\s*,\s*"flag":\s*"[^"]*"\s*,\s*"goals":\s*(\d+)\s*,\s*"assists":\s*(\d+)\s*,\s*"matches":\s*(\d+)\s*\}', sc_m.group(1)):
                name, team, goals, assists, matches = entry.groups()
                skey = f'{name}|{team}'
                existing_scorers[skey] = {'name': name, 'team': team, 'goals': int(goals), 'assists': int(assists), 'matches': int(matches)}
        as_m = re.search(r'"topAssisters":\s*\[(.*?)\]', content, re.DOTALL)
        if as_m:
            for entry in re.finditer(r'\{\s*"rank":\s*\d+\s*,\s*"name":\s*"([^"]+)"\s*,\s*"team":\s*"([^"]+)"\s*,\s*"flag":\s*"[^"]*"\s*,\s*"goals":\s*\d+\s*,\s*"assists":\s*(\d+)\s*,\s*"matches":\s*(\d+)\s*\}', as_m.group(1)):
                name, team, assists, matches = entry.groups()
                akey = f'{name}|{team}'
                existing_assisters[akey] = {'name': name, 'team': team, 'assists': int(assists), 'matches': int(matches)}

    # Fetch summaries
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
                    scorer_name = athletes[0]['athlete']['displayName']
                    skey = f'{scorer_name}|{team_abbr}'
                    if skey not in scorer_map:
                        scorer_map[skey] = {'name': scorer_name, 'team': team_abbr, 'goals': 0, 'assists': 0, 'matches': set()}
                    scorer_map[skey]['goals'] += 1
                    scorer_map[skey]['matches'].add(eid)
                if len(athletes) > 1 and (athletes[1].get('athlete') or {}).get('displayName'):
                    assist_name = athletes[1]['athlete']['displayName']
                    akey = f'{assist_name}|{team_abbr}'
                    if akey not in assist_map:
                        assist_map[akey] = {'name': assist_name, 'team': team_abbr, 'goals': 0, 'assists': 0, 'matches': set()}
                    assist_map[akey]['assists'] += 1
                    assist_map[akey]['matches'].add(eid)
                    if akey not in scorer_map:
                        scorer_map[akey] = {'name': assist_name, 'team': team_abbr, 'goals': 0, 'assists': 0, 'matches': set()}
                    scorer_map[akey]['assists'] += 1
                    scorer_map[akey]['matches'].add(eid)
            ok_count += 1
            if ok_count % 20 == 0:
                log(f'  Scorers: {ok_count}/{len(event_ids)} matches processed')
            _time.sleep(0.05)
        except Exception:
            pass

    log(f'  Processed {ok_count}/{len(event_ids)} matches for scorers/assists')
    if ok_count == 0:
        return content

    # Incremental mode: merge with existing data
    if new_event_ids is not None:
        for skey, sdata in existing_scorers.items():
            if skey not in scorer_map:
                scorer_map[skey] = sdata
                scorer_map[skey]['matches'] = set()
            else:
                # Merged entry already includes new data; add existing counts
                pass  # The new data replaces the old (complete re-fetch for new matches)
        for akey, adata in existing_assisters.items():
            if akey not in assist_map:
                assist_map[akey] = adata
                assist_map[akey]['matches'] = set()

    # Build top 10
    all_players = list(scorer_map.values())
    for p in all_players:
        pkey = f'{p["name"]}|{p["team"]}'
        if pkey in assist_map:
            p['assists'] = assist_map[pkey]['assists']
        # 'matches' might be a set in the map; convert to int count
        if isinstance(p.get('matches'), set):
            p['matches'] = len(p['matches'])

    top_scorers = sorted(all_players, key=lambda x: (-x['goals'], -x['assists']))[:10]
    top_assisters = sorted(all_players, key=lambda x: (-x['assists'], -x['goals']))[:10]

    # Flag map
    flag_map = {}
    for m in re.finditer(r'"code":\s*"(\w+)"\s*,\s*"name":\s*"([^"]+)"\s*,\s*"flag":\s*"([^"]+)"', content):
        flag_map[m.group(1)] = {'name': m.group(2), 'flag': m.group(3)}

    def fmt_entry(entry, idx):
        team_info = flag_map.get(entry['team'], {'flag': '&#x1f3f3;&#xfe0f;', 'name': entry['team']})
        matches = entry.get('matches', 0)
        if isinstance(matches, set):
            matches = len(matches)
        return (f'    {{ "rank": {idx}, "name": "{entry["name"]}", '
                f'"team": "{entry["team"]}", '
                f'"flag": "{team_info["flag"]}", '
                f'"goals": {entry["goals"]}, '
                f'"assists": {entry["assists"]}, "matches": {matches} }}')

    scorers_lines = [fmt_entry(e, i+1) for i, e in enumerate(top_scorers)]
    assisters_lines = [fmt_entry(e, i+1) for i, e in enumerate(top_assisters)]

    scorers_block = ('  "topScorers": [\n' + ',\n'.join(scorers_lines) + '\n  ],')
    assisters_block = ('  "topAssisters": [\n' + ',\n'.join(assisters_lines) + '\n  ],')

    content = re.sub(
        r'\"topScorers\":\s*\[.*?\],',
        scorers_block,
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'\"topAssisters\":\s*\[.*?\],',
        assisters_block,
        content,
        flags=re.DOTALL
    )

    log(f'  Top scorer: {top_scorers[0]["name"]} ({top_scorers[0]["goals"]}G)')
    log(f'  Top assister: {top_assisters[0]["name"]} ({top_assisters[0]["assists"]}A)')
    return content


# ===== Stats &amp; timestamp =====

def update_stats_in_content(content):
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
        (r'\"totalMatches\":\s*\d+', f'\"totalMatches\": {total}'),
        (r'\"totalGoals\":\s*\d+', f'\"totalGoals\": {goals}'),
        (r'\"avgGoalsPerMatch\":\s*[\d.]+', f'\"avgGoalsPerMatch\": {avg}'),
        (r'\"mostGoalsMatch\":\s*\"[^\"]*\"', f'\"mostGoalsMatch\": \"{most_desc}\"'),
        (r'\"biggestWin\":\s*\"[^\"]*\"', f'\"biggestWin\": \"{biggest_desc}\"'),
        (r'\"cleanSheets\":\s*\d+', f'\"cleanSheets\": {cs}'),
        (r'\"draws\":\s*\d+', f'\"draws\": {draws}'),
        (r'\"homeWins\":\s*\d+', f'\"homeWins\": {hw}'),
        (r'\"awayWins\":\s*\d+', f'\"awayWins\": {aw}'),
    ]
    result = content
    for pat, repl in updates:
        result = re.sub(pat, repl, result)
    return result, total, goals, avg


def update_timestamp(content):
    """Update Last updated comment and lastUpdated field using Beijing time (UTC+8)."""
    now = datetime.now(BJ_TZ)
    ts = now.strftime('%B %d, %Y at %H:%M CST')
    # Comment block
    pat = r"(Last updated:\s*)[^\n]+"
    if re.search(pat, content):
        content = re.sub(pat, fr'\1{ts}', content)
    # JSON field
    pat2 = r'("lastUpdated":\s*")[^"]*(")'
    if re.search(pat2, content):
        content = re.sub(pat2, fr'\g<1>{ts}\g<2>', content)
    return content, ts


def validate_js(content):
    try:
        r = subprocess.run(['node', '--check', '-'], input=content.encode(),
                          capture_output=True, timeout=10)
        return r.returncode == 0, r.stderr.decode()
    except FileNotFoundError:
        ok = content.count('{') == content.count('}')
        return ok, 'No node; brace balance OK' if ok else 'Brace mismatch'


def update_html(version, month_day):
    count = 0
    for rel in HTML_PAGES:
        path = os.path.join(PROJECT_DIR, rel)
        if not os.path.exists(path):
            continue
        with open(path) as f:
            html = f.read()
        old = html
        html = re.sub(r'(src="[^"]*(?:data-groups|data-knockout)\.js\?v=)\d+', fr'\g<1>{version}', html)
        html = re.sub(r'(src="[^"]*app\.js\?v=)\d+', fr'\g<1>{version}', html)
        html = re.sub(r'Data updated [A-Za-z]+ \d+, \d{4}',
                      f'Data updated {month_day}', html)
        if html != old:
            with open(path, 'w') as f:
                f.write(html)
            log(f'  &#x2713; {rel}')
            count += 1
    return count


# ===== Main =====

def main():
    dry = '--dry-run' in sys.argv
    full = '--all' in sys.argv
    is_full = '--full' in sys.argv  # force full scan
    push = '--push' in sys.argv
    no_scorers = '--no-scorers' in sys.argv
    
    # Determine mode
    is_incremental = not is_full
    if is_incremental:
        log('Mode: incremental')
    else:
        log('Mode: full scan')
    
    if not dry:
        shutil.copy2(DATA_FILE, BACKUP_FILE)
    
    with open(DATA_FILE) as f:
        orig = f.read()
    log(f'Read data-knockout.js ({len(orig)} bytes)')
    
    # Extract meta and current version
    meta = read_meta(orig)
    if not meta:
        meta = {'lastProcessedDate': '', 'processedEventIds': [], 'processedUpTo': ''}
    log(f'  Last processed date: {meta.get("lastProcessedDate", "never")}')
    
    # Find current version
    ver = 7
    for rel in HTML_PAGES:
        path = os.path.join(PROJECT_DIR, rel)
        if os.path.exists(path):
            m = re.search(r'app\.js\?v=(\d+)', open(path).read())
            if m:
                ver = int(m.group(1))
                break
    log(f'Current version: v{ver}')
    
    # === Phase 1: Fetch ESPN ===
    log('Fetching ESPN...')
    if is_incremental and meta.get('lastProcessedDate'):
        new_dates = get_new_dates_since(meta['lastProcessedDate'], meta)
        if new_dates:
            log(f'  Scanning dates: {new_dates[0]} to {new_dates[-1]} ({len(new_dates)} days)')
            raw = fetch_espn(new_dates)
        else:
            log('  No new dates since last processed date.')
            raw = {}
    else:
        raw = fetch_espn()  # full scan
    
    if not raw:
        log('No new ESPN data. Keeping files unchanged.')
        return
    
    # Extract completed matches and their IDs
    espn_m = parse_espn(raw)
    completed = {k: v for k, v in espn_m.items() if v['status'] == 'completed'}
    
    # For stats, use the combined data (incremental's fetched data + file's existing data)
    # Total completed count comes from ESPN full data
    all_completed_count = len(re.findall(r'"status":\s*"completed"', orig)) + len(completed)
    
    old_done = len(re.findall(r'"status":\s*"completed"', orig))
    log(f'ESPN: {all_completed_count} completed (data-knockout.js had {old_done})')
    
    # === Phase 2: Update match scores ===
    content = orig
    updates = 0
    # Check if all R32 already completed (skip R32 matching for speed)
    r32_all_done = False
    r32_match = re.search(r'"roundOf32":\s*\[(.*?)\]', content, re.DOTALL)
    if r32_match:
        r32_pending = r32_match.group(1).count('"pending"')
        r32_all_done = r32_pending == 0
    
    for key, m in completed.items():
        content, changed = update_match_in_content(content, m['home'], m['away'],
                                                    m['homeScore'], m['awayScore'],
                                                    m['status'])
        if changed:
            updates += 1
            log(f'  &#x2713; {m["home"]} {m["homeScore"]}-{m["awayScore"]} {m["away"]}')
    
    if updates == 0:
        log('No new match results to update.')
    
    # === Phase 3: Stats (always run, cheap local operation) ===
    content, total, goals, avg = update_stats_in_content(content)
    log(f'Stats: {total} matches, {goals} goals, avg {avg}')
    
    # === Phase 4: Knockout progression ===
    content = update_knockout_progression(content)
    log('Knockout progression updated (winners advanced)')
    
    # === Phase 5: Scorers ===
    if no_scorers:
        log('Skipping scorers update (--no-scorers)')
    else:
        if os.path.exists(GROUPS_FILE):
            with open(GROUPS_FILE) as f:
                groups_orig = f.read()
            
            if is_incremental and meta.get('processedEventIds') is not None:
                # Only fetch new event IDs that aren't already processed
                existing_ids = set(meta.get('processedEventIds', []))
                new_event_ids_all = set()
                for _, events in raw.items():
                    for ev in events:
                        new_event_ids_all.add(ev.get('id'))
                # Find truly new ones
                incremental_ids = new_event_ids_all - existing_ids
                if incremental_ids:
                    log(f'  {len(incremental_ids)} new match(es) to fetch for scorers')
                    groups_updated = update_scorers_in_content(groups_orig, list(incremental_ids))
                else:
                    groups_updated = groups_orig
                    log('  No new matches for scorers update.')
            else:
                # Full: refetch all
                groups_updated = update_scorers_in_content(groups_orig)
            
            if groups_updated != groups_orig and not dry:
                with open(GROUPS_FILE, 'w') as f:
                    f.write(groups_updated)
                ok('data-groups.js scorers updated')
        else:
            wrn('data-groups.js not found, skipping scorers')
    
    # === Phase 6: Update _meta (track what we've processed) ===
    today_bj = bj_now().strftime('%Y%m%d')
    # Collect all event IDs from current ESPN data
    all_event_ids = []
    for _, events in raw.items():
        for ev in events:
            eid = ev.get('id')
            if eid:
                all_event_ids.append(eid)
    
    new_meta = {
        'lastProcessedDate': today_bj,
        'processedUpTo': bj_now().isoformat(),
        'processedEventIds': list(set(all_event_ids)),
    }
    content = update_meta_in_content(content, new_meta)
    
    # === Phase 7: Timestamp (Beijing time) ===
    content, ts = update_timestamp(content)
    month_day = ' '.join(ts.split()[:3]).rstrip(',')
    log(f'Timestamp: {ts}')
    
    # === Phase 8: Validate ===
    is_valid, msg = validate_js(content)
    if is_valid:
        ok('JS syntax valid')
    else:
        wrn(f'JS error: {msg}')
        # Revert?
    
    nver = ver + 1 if updates > 0 or content != orig else ver
    
    if not dry and content != orig:
        with open(DATA_FILE, 'w') as f:
            f.write(content)
        ok('data-knockout.js written')
    
    if full or push:
        if not dry:
            html_n = update_html(nver, month_day)
            log(f'HTML pages updated: {html_n}')
    
    if push:
        subprocess.run(['git', 'add', '-A'], cwd=PROJECT_DIR, capture_output=True)
        subprocess.run(['git', 'commit', '-m', f'chore: data refresh &mdash; {total} matches, {goals} goals'],
                      cwd=PROJECT_DIR, capture_output=True)
        subprocess.run(['git', 'push'], cwd=PROJECT_DIR, capture_output=True, timeout=30)
        ok('Pushed to GitHub')
    
    print()
    print('=' * 50)
    print('SUMMARY')
    print(f'  Mode:     {"incremental" if is_incremental else "full"}')
    print(f'  Matches:  {old_done} → {all_completed_count}')
    print(f'  Goals:    {goals}')
    if updates > 0:
        print(f'  Updates:  {updates} matches')
    else:
        print(f'  Updates:  none (already current)')
    print(f'  Version:  v{ver} &rarr; v{nver}')
    print(f'  Timezone: Beijing (UTC+8)')
    print(f'  Dry run:  {dry}')
    print('=' * 50)


if __name__ == '__main__':
    main()