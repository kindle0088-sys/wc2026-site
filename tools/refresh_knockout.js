const fs = require('fs');
const vm = require('vm');

// Read data
const src = fs.readFileSync('assets/js/data-groups.js', 'utf8');
const ctx = {};
vm.runInNewContext(src + '\nglobalThis.D = WC_GROUPS;', ctx);
const d = ctx.D;

// Group order for tiebreak reference
const glist = 'ABCDEFGHIJKL';

// Build standings per group
function getStandings(g) {
  const teams = d.groups[g].teams.slice().sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
  );
  return teams;
}

// Get all qualifiers
const qualifiers = {}; // {group: {1st, 2nd, 3rd}}
for (let i = 0; i < glist.length; i++) {
  const g = glist[i];
  const st = getStandings(g);
  qualifiers[g] = { first: st[0], second: st[1], third: st[2] };
}

// Rank third place teams
const thirds = [];
for (let i = 0; i < glist.length; i++) {
  const g = glist[i];
  const t = qualifiers[g].third;
  thirds.push({ group: g, code: t.code, pts: t.pts, gd: t.gd, gf: t.gf });
}
thirds.sort((a, b) =>
  b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
);

console.log('=== Third-place rankings ===');
thirds.forEach((t, i) => console.log(`${i+1}. Group ${t.group}: ${t.code} (${t.pts}p, ${t.gd}gd, ${t.gf}gf)`));

const qualified3rd = thirds.slice(0, 8);
console.log('\n=== Qualifying 3rd-placed teams (top 8) ===');
qualified3rd.forEach(t => console.log(t.group + ': ' + t.code));

// Third-place pool mapping
const poolMap = {
  'R32-2':  { pool: 'ABCDF', matchId: 74, slot: '1E', home: 'GER' },
  'R32-5':  { pool: 'CDFGH', matchId: 77, slot: '1I', home: null },
  'R32-7':  { pool: 'CEFHI', matchId: 79, slot: '1A', home: 'MEX' },
  'R32-8':  { pool: 'EHIJK', matchId: 80, slot: '1L', home: null },
  'R32-9':  { pool: 'BEFIJ', matchId: 81, slot: '1D', home: 'USA' },
  'R32-10': { pool: 'AEHIJ', matchId: 82, slot: '1G', home: null },
  'R32-13': { pool: 'EFGIJ', matchId: 85, slot: '1B', home: null },
  'R32-15': { pool: 'DEIJL', matchId: 87, slot: '1K', home: 'COL' },
};

// For each third-place slot, find the best qualifying 3rd place from its pool
const assigned3rd = {}; // slot id -> team code
const used = new Set();

const slotOrder = ['R32-2', 'R32-5', 'R32-7', 'R32-8', 'R32-9', 'R32-10', 'R32-13', 'R32-15'];

// First pass: for each slot, find best match from pool among qualified 3rds
for (const slotId of slotOrder) {
  const info = poolMap[slotId];
  const poolGroups = info.pool.split('');
  // Filter qualified thirds that are in this pool and not used yet
  const candidates = qualified3rd.filter(t => poolGroups.includes(t.group) && !used.has(t.group));
  if (candidates.length > 0) {
    // Pick the best one (they're already sorted)
    const best = candidates[0];
    assigned3rd[slotId] = best.code;
    used.add(best.group);
  }
}

// Second pass: assign any remaining qualified 3rds to remaining slots
const remainingSlots = slotOrder.filter(s => !assigned3rd[s]);
const remaining3rds = qualified3rd.filter(t => !used.has(t.group));
for (let i = 0; i < remainingSlots.length && i < remaining3rds.length; i++) {
  assigned3rd[remainingSlots[i]] = remaining3rds[i].code;
  used.add(remaining3rds[i].group);
}

console.log('\n=== Third-place assignments ===');
for (const [slotId, code] of Object.entries(assigned3rd)) {
  const info = poolMap[slotId];
  console.log(`${slotId} (${info.slot} vs 3${info.pool}): ${code}`);
}

// Now build the knockout bracket entries
function makeEntry(id, match, home, away, homeScore, awayScore, date, venue, status, pairing) {
  return { id, match, home, away, homeScore, awayScore, date, venue, status, pairing };
}

// Round of 32
const roundOf32 = [
  // R32-1 (73): 2A vs 2B
  makeEntry('R32-1', 73, qualifiers['A'].second.code, qualifiers['B'].second.code, null, null, 'June 28', 'SoFi Stadium · Inglewood', 'pending', '2A vs 2B'),
  // R32-2 (74): 1E vs 3(ABCDF)
  makeEntry('R32-2', 74, 'GER', assigned3rd['R32-2'], null, null, 'June 29', 'Gillette Stadium · Foxborough', 'pending', '1E vs 3ABCDF'),
  // R32-3 (75): 1F vs 2C
  makeEntry('R32-3', 75, qualifiers['F'].first.code, qualifiers['C'].second.code, null, null, 'June 29', 'Estadio BBVA · Monterrey', 'pending', '1F vs 2C'),
  // R32-4 (76): 1C vs 2F
  makeEntry('R32-4', 76, qualifiers['C'].first.code, qualifiers['F'].second.code, null, null, 'June 29', 'NRG Stadium · Houston', 'pending', '1C vs 2F'),
  // R32-5 (77): 1I vs 3(CDFGH)
  makeEntry('R32-5', 77, qualifiers['I'].first.code, assigned3rd['R32-5'], null, null, 'June 30', 'MetLife Stadium · NJ', 'pending', '1I vs 3CDFGH'),
  // R32-6 (78): 2E vs 2I
  makeEntry('R32-6', 78, qualifiers['E'].second.code, qualifiers['I'].second.code, null, null, 'June 30', 'AT&T Stadium · Arlington', 'pending', '2E vs 2I'),
  // R32-7 (79): 1A vs 3(CEFHI)
  makeEntry('R32-7', 79, 'MEX', assigned3rd['R32-7'], null, null, 'June 30', 'Estadio Azteca · Mexico City', 'pending', '1A vs 3CEFHI'),
  // R32-8 (80): 1L vs 3(EHIJK)
  makeEntry('R32-8', 80, qualifiers['L'].first.code, assigned3rd['R32-8'], null, null, 'July 1', 'Mercedes-Benz Stadium · Atlanta', 'pending', '1L vs 3EHIJK'),
  // R32-9 (81): 1D vs 3(BEFIJ)
  makeEntry('R32-9', 81, 'USA', assigned3rd['R32-9'], null, null, 'July 1', "Levi's Stadium · Santa Clara", 'pending', '1D vs 3BEFIJ'),
  // R32-10 (82): 1G vs 3(AEHIJ)
  makeEntry('R32-10', 82, qualifiers['G'].first.code, assigned3rd['R32-10'], null, null, 'July 1', 'Lumen Field · Seattle', 'pending', '1G vs 3AEHIJ'),
  // R32-11 (83): 2K vs 2L
  makeEntry('R32-11', 83, qualifiers['K'].second.code, qualifiers['L'].second.code, null, null, 'July 2', 'BMO Field · Toronto', 'pending', '2K vs 2L'),
  // R32-12 (84): 1H vs 2J
  makeEntry('R32-12', 84, qualifiers['H'].first.code, qualifiers['J'].second.code, null, null, 'July 2', 'SoFi Stadium · Inglewood', 'pending', '1H vs 2J'),
  // R32-13 (85): 1B vs 3(EFGIJ)
  makeEntry('R32-13', 85, qualifiers['B'].first.code, assigned3rd['R32-13'], null, null, 'July 2', 'BC Place · Vancouver', 'pending', '1B vs 3EFGIJ'),
  // R32-14 (86): 1J vs 2H
  makeEntry('R32-14', 86, 'ARG', qualifiers['H'].second.code, null, null, 'July 2', 'Hard Rock Stadium · Miami', 'pending', '1J vs 2H'),
  // R32-15 (87): 1K vs 3(DEIJL)
  makeEntry('R32-15', 87, 'COL', assigned3rd['R32-15'], null, null, 'July 3', 'Arrowhead Stadium · Kansas City', 'pending', '1K vs 3DEIJL'),
  // R32-16 (88): 2D vs 2G
  makeEntry('R32-16', 88, qualifiers['D'].second.code, qualifiers['G'].second.code, null, null, 'July 3', 'AT&T Stadium · Dallas', 'pending', '2D vs 2G'),
];

console.log('\n=== Round of 32 ===');
roundOf32.forEach(e => console.log(`${e.id}: ${e.home} vs ${e.away}`));

// Round of 16 - all pending, no scores yet
const roundOf16 = [
  makeEntry('R16-1', 89, null, null, null, null, 'July 4', 'Lincoln Financial Field · Philadelphia', 'pending', 'W74 vs W77'),
  makeEntry('R16-2', 90, null, null, null, null, 'July 4', 'NRG Stadium · Houston', 'pending', 'W73 vs W75'),
  makeEntry('R16-3', 91, null, null, null, null, 'July 5', 'MetLife Stadium · NJ', 'pending', 'W76 vs W78'),
  makeEntry('R16-4', 92, null, null, null, null, 'July 5', 'Estadio Azteca · Mexico City', 'pending', 'W79 vs W80'),
  makeEntry('R16-5', 93, null, null, null, null, 'July 6', 'AT&T Stadium · Arlington', 'pending', 'W83 vs W84'),
  makeEntry('R16-6', 94, null, null, null, null, 'July 6', 'Lumen Field · Seattle', 'pending', 'W81 vs W82'),
  makeEntry('R16-7', 95, null, null, null, null, 'July 7', 'Mercedes-Benz Stadium · Atlanta', 'pending', 'W86 vs W88'),
  makeEntry('R16-8', 96, null, null, null, null, 'July 7', 'BC Place · Vancouver', 'pending', 'W85 vs W87'),
];

const quarterFinals = [
  makeEntry('QF-1', 97, null, null, null, null, 'July 9', 'Gillette Stadium · Foxborough', 'pending', 'W89 vs W90'),
  makeEntry('QF-2', 98, null, null, null, null, 'July 10', 'SoFi Stadium · Inglewood', 'pending', 'W93 vs W94'),
  makeEntry('QF-3', 99, null, null, null, null, 'July 11', 'Hard Rock Stadium · Miami', 'pending', 'W91 vs W92'),
  makeEntry('QF-4', 100, null, null, null, null, 'July 11', 'Arrowhead Stadium · Kansas City', 'pending', 'W95 vs W96'),
];

const semiFinals = [
  makeEntry('SF-1', 101, null, null, null, null, 'July 14', 'AT&T Stadium · Dallas', 'pending', 'W97 vs W98'),
  makeEntry('SF-2', 102, null, null, null, null, 'July 16', 'Mercedes-Benz Stadium · Atlanta', 'pending', 'W99 vs W100'),
];

const thirdPlace = makeEntry('3P', 103, null, null, null, null, 'July 18', 'Hard Rock Stadium · Miami', 'pending', 'SF Losers');
const finalEntry = makeEntry('F', 104, null, null, null, null, 'July 19', 'MetLife Stadium · NJ', 'pending', 'SF Winners');

// Generate JSON
const knockout = {
  roundOf32,
  roundOf16,
  quarterFinals,
  semiFinals,
  thirdPlace,
  final: finalEntry
};

console.log('\n=== JSON output ===');
console.log(JSON.stringify(knockout, null, 2));
