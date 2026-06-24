const fs = require('fs');
const vm = require('vm');
let c = fs.readFileSync('/home/admin/wc2026-site/assets/js/data.js', 'utf8') + '\nglobalThis.D = WC_DATA;';
vm.runInNewContext(c, global);
const D = global.D;
let comp = 0, goals = 0, hw = 0, aw = 0, draws = 0, cs = 0;
let biggest = { diff: 0, desc: '' };
let mostG = { tot: 0, desc: '' };
for (const g of Object.values(D.groups)) {
  for (const m of g.matches) {
    if (m.status === 'completed' && m.homeScore !== null) {
      comp++; const hs = m.homeScore, as = m.awayScore;
      goals += hs + as;
      if (hs > as) { hw++; const d = hs - as; if (d > biggest.diff) { biggest.diff = d; biggest.desc = `${m.home} ${hs}-${as} ${m.away} (+${d})`; } }
      else if (as > hs) { aw++; const d = as - hs; if (d > biggest.diff) { biggest.diff = d; biggest.desc = `${m.home} ${hs}-${as} ${m.away} (+${d})`; } }
      else draws++;
      const tot = hs + as;
      if (tot > mostG.tot) { mostG.tot = tot; mostG.desc = `${m.home} ${hs}-${as} ${m.away} (${tot} goals)`; }
      if (hs === 0 || as === 0) cs++;
    }
  }
}
console.log(JSON.stringify({
  actual: { comp, goals, avg: +(goals/comp).toFixed(2), hw, aw, draws, cs, biggest, mostGoals: { tot: mostG.tot, desc: mostG.desc } },
  stale: { totalMatches: D.stats.totalMatches, totalGoals: D.stats.totalGoals, cleanSheets: D.stats.cleanSheets, draws: D.stats.draws, homeWins: D.stats.homeWins, awayWins: D.stats.awayWins, biggestWin: D.stats.biggestWin, mostGoalsMatch: D.stats.mostGoalsMatch }
}));