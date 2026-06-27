const fs=require('fs'),vm=require('vm');
let c=fs.readFileSync('assets/js/data.js','utf8')+'\nglobalThis.D=WC_DATA;';
vm.runInNewContext(c,globalThis);
const d=globalThis.D;

console.log('=== GROUP STANDINGS ===');
const groups = Object.entries(d.groups);
for(const [gk,g] of groups) {
  const sorted = [...g.teams].sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  console.log(gk + ':');
  sorted.forEach((t,i) => console.log('  ' + (i+1) + '. ' + t.code + 
    ' Pts:' + t.pts + ' GD:' + t.gd + ' ' + t.played + 'P/' + t.won + 'W/' + t.drawn + 'D/' + t.lost + 'L'));
  const upcoming = g.matches.filter(m => m.status==='upcoming');
  if(upcoming.length > 0) {
    console.log('  Remaining:');
    upcoming.forEach(m => console.log('    ' + m.home + ' vs ' + m.away + ' (' + m.date + ' R' + m.round + ')'));
  }
}

console.log('\n=== KNOCKOUT ===');
d.knockout.rounds.forEach(r => {
  console.log(r.name + ' (' + r.matches.length + ' matches):');
  r.matches.forEach(m => {
    if(m.status==='completed') {
      console.log('  ' + m.home + ' ' + m.homeScore + '-' + m.awayScore + ' ' + m.away);
    } else if(m.status==='scheduled') {
      console.log('  ' + m.home + ' vs ' + m.away + ' (' + m.date + ')');
    } else {
      console.log('  ' + m.home + ' vs ' + m.away);
    }
  });
});
