const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('assets/js/data-groups.js', 'utf8');
const ctx = {};
vm.runInNewContext(src + '\nglobalThis.D = WC_GROUPS;', ctx);
const d = ctx.D;

const glist = 'ABCDEFGHIJKL';

function getStandings(g) {
  return d.groups[g].teams.slice().sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
  );
}

const qualifiers = {};
for (let i = 0; i < glist.length; i++) {
  const g = glist[i];
  const st = getStandings(g);
  qualifiers[g] = { first: st[0], second: st[1], third: st[2] };
}

const thirds = [];
for (let i = 0; i < glist.length; i++) {
  const g = glist[i];
  const t = qualifiers[g].third;
  thirds.push({ group: g, code: t.code, pts: t.pts, gd: t.gd, gf: t.gf });
}
thirds.sort((a, b) =>
  b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
);

const qualified3rd = thirds.slice(0, 8);

const poolMap = {
  'R32-2': { pool: 'ABCDF', slot: '1E' },
  'R32-5': { pool: 'CDFGH', slot: '1I' },
  'R32-7': { pool: 'CEFHI', slot: '1A' },
  'R32-8': { pool: 'EHIJK', slot: '1L' },
  'R32-9': { pool: 'BEFIJ', slot: '1D' },
  'R32-10': { pool: 'AEHIJ', slot: '1G' },
  'R32-13': { pool: 'EFGIJ', slot: '1B' },
  'R32-15': { pool: 'DEIJL', slot: '1K' },
};

const slotOrder = ['R32-2', 'R32-5', 'R32-7', 'R32-8', 'R32-9', 'R32-10', 'R32-13', 'R32-15'];
const assigned3rd = {};
const used = new Set();

for (const slotId of slotOrder) {
  const info = poolMap[slotId];
  const poolGroups = info.pool.split('');
  const candidates = qualified3rd.filter(t => poolGroups.includes(t.group) && !used.has(t.group));
  if (candidates.length > 0) {
    const best = candidates.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code))[0];
    assigned3rd[slotId] = best.code;
    used.add(best.group);
  }
}

const remainingSlots = slotOrder.filter(s => !assigned3rd[s]);
const remaining3rds = qualified3rd.filter(t => !used.has(t.group));
for (let i = 0; i < remainingSlots.length && i < remaining3rds.length; i++) {
  assigned3rd[remainingSlots[i]] = remaining3rds[i].code;
  used.add(remaining3rds[i].group);
}

// Comments for each match
const comments = {
  'R32-1': 'R32-1 (Match 73): 2A vs 2B — SoFi Stadium, Inglewood — June 28',
  'R32-2': 'R32-2 (Match 74): 1E (GER) vs 3(A/B/C/D/F) — Gillette Stadium, Foxborough — June 29',
  'R32-3': 'R32-3 (Match 75): 1F vs 2C — Estadio BBVA, Monterrey — June 29',
  'R32-4': 'R32-4 (Match 76): 1C vs 2F — NRG Stadium, Houston — June 29',
  'R32-5': 'R32-5 (Match 77): 1I vs 3(C/D/F/G/H) — MetLife Stadium, NJ — June 30',
  'R32-6': 'R32-6 (Match 78): 2E vs 2I — AT&T Stadium, Arlington — June 30',
  'R32-7': 'R32-7 (Match 79): 1A (MEX) vs 3(C/E/F/H/I) — Estadio Azteca — June 30',
  'R32-8': 'R32-8 (Match 80): 1L vs 3(E/H/I/J/K) — Mercedes-Benz Stadium, Atlanta — July 1',
  'R32-9': 'R32-9 (Match 81): 1D (USA) vs 3(B/E/F/I/J) — Levi\'s Stadium, Santa Clara — July 1',
  'R32-10': 'R32-10 (Match 82): 1G vs 3(A/E/H/I/J) — Lumen Field, Seattle — July 1',
  'R32-11': 'R32-11 (Match 83): 2K vs 2L — BMO Field, Toronto — July 2',
  'R32-12': 'R32-12 (Match 84): 1H vs 2J — SoFi Stadium, Inglewood — July 2',
  'R32-13': 'R32-13 (Match 85): 1B vs 3(E/F/G/I/J) — BC Place, Vancouver — July 2',
  'R32-14': 'R32-14 (Match 86): 1J (ARG) vs 2H — Hard Rock Stadium, Miami — July 2',
  'R32-15': 'R32-15 (Match 87): 1K (COL) vs 3(D/E/I/J/L) — Arrowhead Stadium, Kansas City — July 3',
  'R32-16': 'R32-16 (Match 88): 2D vs 2G — AT&T Stadium, Dallas — July 3',
};

// Build round of 32 lines
const r32Lines = [];

function fmtEntry(id, match, home, away, date, venue, pairing) {
  const h = home === null ? 'null' : `'${home}'`;
  const a = away === null ? 'null' : `'${away}'`;
  const v = venue.includes("'")
    ? venue.replace(/'/g, "\\'")
    : venue;
  if (venue.includes("'")) {
    return `      { id: '${id}', match: ${match}, home: ${h}, away: ${a}, homeScore: null, awayScore: null, date: '${date}', venue: '${v}', status: 'pending', pairing: '${pairing}' },`;
  }
  return `      { id: '${id}', match: ${match}, home: ${h}, away: ${a}, homeScore: null, awayScore: null, date: '${date}', venue: '${venue}', status: 'pending', pairing: '${pairing}' },`;
}

r32Lines.push('    // Round of 32 — June 28~July 3');
r32Lines.push('    roundOf32: [');

// R32-1: 2A vs 2B
r32Lines.push(`      // ${comments['R32-1']}`);
r32Lines.push(fmtEntry('R32-1', 73, qualifiers['A'].second.code, qualifiers['B'].second.code, 'June 28', 'SoFi Stadium · Inglewood', '2A vs 2B'));

// R32-2: 1E vs 3ABCDF
r32Lines.push(`      // ${comments['R32-2']}`);
r32Lines.push(fmtEntry('R32-2', 74, 'GER', assigned3rd['R32-2'], 'June 29', 'Gillette Stadium · Foxborough', '1E vs 3ABCDF'));

// R32-3: 1F vs 2C
r32Lines.push(`      // ${comments['R32-3']}`);
r32Lines.push(fmtEntry('R32-3', 75, qualifiers['F'].first.code, qualifiers['C'].second.code, 'June 29', 'Estadio BBVA · Monterrey', '1F vs 2C'));

// R32-4: 1C vs 2F
r32Lines.push(`      // ${comments['R32-4']}`);
r32Lines.push(fmtEntry('R32-4', 76, qualifiers['C'].first.code, qualifiers['F'].second.code, 'June 29', 'NRG Stadium · Houston', '1C vs 2F'));

// R32-5: 1I vs 3CDFGH
r32Lines.push(`      // ${comments['R32-5']}`);
r32Lines.push(fmtEntry('R32-5', 77, qualifiers['I'].first.code, assigned3rd['R32-5'], 'June 30', 'MetLife Stadium · NJ', '1I vs 3CDFGH'));

// R32-6: 2E vs 2I
r32Lines.push(`      // ${comments['R32-6']}`);
r32Lines.push(fmtEntry('R32-6', 78, qualifiers['E'].second.code, qualifiers['I'].second.code, 'June 30', 'AT&T Stadium · Arlington', '2E vs 2I'));

// R32-7: 1A vs 3CEFHI
r32Lines.push(`      // ${comments['R32-7']}`);
r32Lines.push(fmtEntry('R32-7', 79, 'MEX', assigned3rd['R32-7'], 'June 30', 'Estadio Azteca · Mexico City', '1A vs 3CEFHI'));

// R32-8: 1L vs 3EHIJK
r32Lines.push(`      // ${comments['R32-8']}`);
r32Lines.push(fmtEntry('R32-8', 80, qualifiers['L'].first.code, assigned3rd['R32-8'], 'July 1', 'Mercedes-Benz Stadium · Atlanta', '1L vs 3EHIJK'));

// R32-9: 1D vs 3BEFIJ
const usVenue = "Levi's Stadium · Santa Clara".replace(/'/g, "\\'");
r32Lines.push(`      // ${comments['R32-9']}`);
r32Lines.push(fmtEntry('R32-9', 81, 'USA', assigned3rd['R32-9'], 'July 1', usVenue, '1D vs 3BEFIJ'));

// R32-10: 1G vs 3AEHIJ
r32Lines.push(`      // ${comments['R32-10']}`);
r32Lines.push(fmtEntry('R32-10', 82, qualifiers['G'].first.code, assigned3rd['R32-10'], 'July 1', 'Lumen Field · Seattle', '1G vs 3AEHIJ'));

// R32-11: 2K vs 2L
r32Lines.push(`      // ${comments['R32-11']}`);
r32Lines.push(fmtEntry('R32-11', 83, qualifiers['K'].second.code, qualifiers['L'].second.code, 'July 2', 'BMO Field · Toronto', '2K vs 2L'));

// R32-12: 1H vs 2J
r32Lines.push(`      // ${comments['R32-12']}`);
r32Lines.push(fmtEntry('R32-12', 84, qualifiers['H'].first.code, qualifiers['J'].second.code, 'July 2', 'SoFi Stadium · Inglewood', '1H vs 2J'));

// R32-13: 1B vs 3EFGIJ
r32Lines.push(`      // ${comments['R32-13']}`);
r32Lines.push(fmtEntry('R32-13', 85, qualifiers['B'].first.code, assigned3rd['R32-13'], 'July 2', 'BC Place · Vancouver', '1B vs 3EFGIJ'));

// R32-14: 1J vs 2H
r32Lines.push(`      // ${comments['R32-14']}`);
r32Lines.push(fmtEntry('R32-14', 86, 'ARG', qualifiers['H'].second.code, 'July 2', 'Hard Rock Stadium · Miami', '1J vs 2H'));

// R32-15: 1K vs 3DEIJL
r32Lines.push(`      // ${comments['R32-15']}`);
r32Lines.push(fmtEntry('R32-15', 87, 'COL', assigned3rd['R32-15'], 'July 3', 'Arrowhead Stadium · Kansas City', '1K vs 3DEIJL'));

// R32-16: 2D vs 2G
r32Lines.push(`      // ${comments['R32-16']}`);
r32Lines.push(fmtEntry('R32-16', 88, qualifiers['D'].second.code, qualifiers['G'].second.code, 'July 3', 'AT&T Stadium · Dallas', '2D vs 2G'));

r32Lines.push('    ],');

// Round of 16
const r16Comments = [
  'R16-1 (Match 89): W74 vs W77 — Lincoln Financial Field, Philadelphia — July 4',
  'R16-2 (Match 90): W73 vs W75 — NRG Stadium, Houston — July 4',
  'R16-3 (Match 91): W76 vs W78 — MetLife Stadium, NJ — July 5',
  'R16-4 (Match 92): W79 vs W80 — Estadio Azteca, Mexico City — July 5',
  'R16-5 (Match 93): W83 vs W84 — AT&T Stadium, Arlington — July 6',
  'R16-6 (Match 94): W81 vs W82 — Lumen Field, Seattle — July 6',
  'R16-7 (Match 95): W86 vs W88 — Mercedes-Benz Stadium, Atlanta — July 7',
  'R16-8 (Match 96): W85 vs W87 — BC Place, Vancouver — July 7',
];

const r16Ids = ['R16-1','R16-2','R16-3','R16-4','R16-5','R16-6','R16-7','R16-8'];
const r16Pairings = ['W74 vs W77','W73 vs W75','W76 vs W78','W79 vs W80','W83 vs W84','W81 vs W82','W86 vs W88','W85 vs W87'];
const r16Venues = [
  'Lincoln Financial Field · Philadelphia',
  'NRG Stadium · Houston',
  'MetLife Stadium · NJ',
  'Estadio Azteca · Mexico City',
  "AT&T Stadium · Arlington",
  'Lumen Field · Seattle',
  'Mercedes-Benz Stadium · Atlanta',
  'BC Place · Vancouver'
];
const r16Dates = ['July 4','July 4','July 5','July 5','July 6','July 6','July 7','July 7'];

r32Lines.push('    // Round of 16 — July 4~7');
r32Lines.push('    roundOf16: [');
for (let i = 0; i < 8; i++) {
  r32Lines.push(`      // ${r16Comments[i]}`);
  r32Lines.push(fmtEntry(r16Ids[i], 89+i, null, null, r16Dates[i], r16Venues[i], r16Pairings[i]));
}
r32Lines.push('    ],');

// Quarter finals
const qfComments = [
  'QF-1 (Match 97): W89 vs W90 — Gillette Stadium, Foxborough — July 9',
  'QF-2 (Match 98): W93 vs W94 — SoFi Stadium, Inglewood — July 10',
  'QF-3 (Match 99): W91 vs W92 — Hard Rock Stadium, Miami — July 11',
  'QF-4 (Match 100): W95 vs W96 — Arrowhead Stadium, Kansas City — July 11',
];
const qfIds = ['QF-1','QF-2','QF-3','QF-4'];
const qfPairings = ['W89 vs W90','W93 vs W94','W91 vs W92','W95 vs W96'];
const qfVenues = [
  'Gillette Stadium · Foxborough',
  'SoFi Stadium · Inglewood',
  'Hard Rock Stadium · Miami',
  'Arrowhead Stadium · Kansas City',
];
const qfDates = ['July 9','July 10','July 11','July 11'];

r32Lines.push('    // Quarter-finals — July 9~11');
r32Lines.push('    quarterFinals: [');
for (let i = 0; i < 4; i++) {
  r32Lines.push(`      // ${qfComments[i]}`);
  r32Lines.push(fmtEntry(qfIds[i], 97+i, null, null, qfDates[i], qfVenues[i], qfPairings[i]));
}
r32Lines.push('    ],');

// Semifinals
r32Lines.push('    // Semi-finals — July 14/16');
r32Lines.push('    semiFinals: [');
r32Lines.push(`      // SF-1 (Match 101): W97 vs W98 — AT&T Stadium, Dallas — July 14`);
r32Lines.push(fmtEntry('SF-1', 101, null, null, 'July 14', 'AT&T Stadium · Dallas', 'W97 vs W98'));
r32Lines.push(`      // SF-2 (Match 102): W99 vs W100 — Mercedes-Benz Stadium, Atlanta — July 16`);
r32Lines.push(fmtEntry('SF-2', 102, null, null, 'July 16', 'Mercedes-Benz Stadium · Atlanta', 'W99 vs W100'));
r32Lines.push('    ],');

// Third place
r32Lines.push('    // Third-place match — July 18 — Miami');
r32Lines.push("    thirdPlace: { id: '3P', match: 103, home: null, away: null, homeScore: null, awayScore: null, date: 'July 18', venue: 'Hard Rock Stadium · Miami', status: 'pending', pairing: 'SF Losers' },");
// Final
r32Lines.push('    // Final — July 19 — MetLife Stadium, NJ');
r32Lines.push("    final: { id: 'F', match: 104, home: null, away: null, homeScore: null, awayScore: null, date: 'July 19', venue: 'MetLife Stadium · NJ', status: 'pending', pairing: 'SF Winners' }");

r32Lines.push('  },');

console.log(r32Lines.join('\n'));
