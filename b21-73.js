// B84 The mid-fight cue lands when the boss escalates, not when its health crosses half.
function escalatingBossB84(e){return !!e&&e.type==="boss"&&B59_BOSS_KEYS.includes(e.bossKey)}
const hitEnemyBeforeB84=hitEnemy;
hitEnemy=function(e,power=1,source="player"){
  if(S.bossMidPraise||!liveB59()||!escalatingBossB84(e))return hitEnemyBeforeB84(e,power,source);
  // Hold the threshold cue. A B59 boss finishes its announced attack and only
  // raises its pattern at the next cycle boundary, so praising the moment the
  // bar passes half describes a change the player cannot see yet.
  S.bossMidPraise=true;
  try{hitEnemyBeforeB84(e,power,source)}finally{S.bossMidPraise=false}
};
const updateEnemyBeforeB84=updateEnemy;
updateEnemy=function(e,dt){
  const before=escalatingBossB84(e)&&e.b59?e.b59.second:null;
  updateEnemyBeforeB84(e,dt);
  if(before!==false||S.bossMidPraise||e.dead||!e.b59||!e.b59.second)return;
  S.bossMidPraise=true;praise(bossData(e.bossKey).mid,"big",true);
};
