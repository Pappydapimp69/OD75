
// B100 Heat flow. Every ordinary kill feeds HEAT; combo is a bonus rather than a gate. The amount
// follows the enemy's rolled toughness, the post-Overdrive 65% cut is gone, and HEAT still never drains
// on its own (B25). Replaces the legacy per-kill gain in place; other HEAT sources are untouched.
const B100_KILL_HEAT=2.5;
const B100_TYPE_HEAT={chaser:1,charger:1.2,core:2.5,sniper:1.3,splitter:1.2,thief:1.5};

function killHeatB100(e,chain=false,comboAt=S.combo){
  if(!e||e.type==='boss')return 0;
  const base=B99_BASE[e.type]||B99_BASE.chaser,q=e.b99||{speedMul:1};
  const type=e.b99Small?.5:(B100_TYPE_HEAT[e.type]??1);
  const tough=.6+.4*Math.max(1,e.maxHp||base.hp)/base.hp;
  const combo=1+.1*(Math.max(1,Math.min(9.9,comboAt||1))-1);
  return B100_KILL_HEAT*type*tough*Math.sqrt(Math.max(.5,q.speedMul||1))*combo+(chain?1:0)+(S.dashTime>0?1:0);
}
// The legacy line adds (combo>=2 ? 2|7 + chain + dash : 0) * (used Overdrive ? .65 : 1), clamped to 100.
function legacyKillHeatB100(e,chain){
  const combo=Math.min(9.9,(S.combo||1)+.18+(chain?.08:0));
  const gain=(combo>=2?((e.type==='core'?7:2)+(chain?1:0)+(S.dashTime>0?1:0)):0)*(S.overdrives>0?.65:1);
  return Math.max(0,Math.min(gain,100-S.heat));
}
const killBeforeB100=kill;
kill=function(e,chain=false){
  if(!S||!e||e.dead||e.type==='boss')return killBeforeB100(e,chain);
  const legacy=legacyKillHeatB100(e,chain),comboAt=S.combo;
  killBeforeB100(e,chain);
  if(!e.dead||e.b99Escaped)return;
  S.heat=clamp(S.heat-legacy+killHeatB100(e,chain,comboAt),0,100);
};

// The legacy low-combo drain has been held off since B25, which restores any HEAT lost while no Overdrive is active.
