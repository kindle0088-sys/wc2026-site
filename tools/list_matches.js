const fs=require('fs'),vm=require('vm');
let c=fs.readFileSync('assets/js/data.js','utf8')+'\nglobalThis.D=WC_DATA;';
vm.runInNewContext(c,globalThis);
const d=globalThis.D;

// List completed matches by date, excluding known old ones
// Show all completed matches grouped by date
const byDate = {};
for(const [gk,g] of Object.entries(d.groups)) {
  g.matches.filter(m=>m.status==='completed').forEach(m => {
    const key = m.date || 'unknown';
    if(!byDate[key]) byDate[key] = [];
    byDate[key].push({...m, group: gk});
  });
}

for(const [date,matches] of Object.entries(byDate).sort()) {
  console.log('\n=== ' + date + ' ===');
  matches.forEach(m => {
    const tn = d.groups[m.group].teams.find(t=>t.code===m.home);
    const tn2 = d.groups[m.group].teams.find(t=>t.code===m.away);
    const hname = tn ? tn.name : m.home;
    const aname = tn2 ? tn2.name : m.away;
    console.log('  ' + m.group + ' | ' + hname + ' ' + m.homeScore + '-' + m.awayScore + ' ' + aname + ' (R' + m.round + ')');
  });
}
