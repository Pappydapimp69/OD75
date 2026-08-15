// B52 Heart-only Pip bond clarity: make B51's heart the single bond-state signal.
function enableHeartOnlyBondB52(){
  if(S)S.b52HeartOnlyBond=true;
}

const resetBeforeB52=reset;
reset=function(){
  resetBeforeB52();
  enableHeartOnlyBondB52();
};
enableHeartOnlyBondB52();

// Keep the persistent HUD useful while Pip is away without repeating the heart's state.
const updateUIBeforeB52=updateUI;
updateUI=function(){
  updateUIBeforeB52();
  if(!S||pipWithPlayer())return;
  $("pipLevel").innerHTML=`<b>PIP LV ${S.pipLevel}</b> · ${S.pipXP}/${pipNeed(S.pipLevel)} XP · ♥R ${Math.round(S.pipDetectRange)}px · ✦P ${S.pipPowerLv} · ◈G ${S.pipGuardLv} · ✧B ${Object.keys(S.pipBossPowers||{}).length}`;
  const tip=$("tip");
  if(tip.textContent.startsWith("PIP COLLECTING")){
    const tgt=getAutoTarget();
    tip.textContent=tgt?`LOCK ${tgt.type.toUpperCase()} · ${S.waveKills}/${S.waveGoal} · PIP ♥ RANGE ${S.pipDetectRange}`:`STAGE ${S.stage} · ${Math.floor(S.stageTime)}s · ♥ RANGE ${S.pipDetectRange}`;
  }
};
