// B65 Difficulty HUD: reveal the active curve without adding gameplay state.
const difficultyHudB65=document.createElement('div');
difficultyHudB65.id='difficultyHudB65';difficultyHudB65.setAttribute('role','status');difficultyHudB65.setAttribute('aria-live','polite');
$('app').appendChild(difficultyHudB65);
const difficultyStyleB65=document.createElement('style');
difficultyStyleB65.textContent='#difficultyHudB65{position:absolute;z-index:9;left:max(9px,env(safe-area-inset-left));top:133px;font-size:9px;letter-spacing:.06em;color:#ffe7a3;border:1px solid #ffd36f38;background:#151008bf;backdrop-filter:blur(7px);border-radius:999px;padding:4px 7px;pointer-events:none;white-space:nowrap}@media(max-width:560px){#difficultyHudB65{top:125px;left:8px;max-width:34vw;overflow:hidden;text-overflow:ellipsis}}';
document.head.appendChild(difficultyStyleB65);
function difficultyHudTextB65(){
  if(S.stage<=3)return {short:'DIFF · OPENING',long:'Opening difficulty is fixed through stage 3.'};
  if(S.stage>=11)return {short:'DIFF · STAGE SCALE',long:'Original stage and wave difficulty scaling is active.'};
  const hearts=difficultyHeartsB63(),tier=difficultyStageB63();
  if(tier>=10)return {short:'DIFF · ♥ T10 MAX',long:`Heart difficulty tier 10 of 10. ${hearts.toFixed(1)} difficulty hearts; maximum reached.`};
  const progress=hearts-(tier-1)*20;
  return {short:`DIFF · ♥ T${tier} · ${Math.floor(progress)}/20`,long:`Heart difficulty tier ${tier} of 10. ${progress.toFixed(1)} of 20 difficulty hearts toward tier ${tier+1}.`};
}
const updateUIBeforeB65=updateUI;
updateUI=function(){updateUIBeforeB65();const copy=difficultyHudTextB65();difficultyHudB65.textContent=copy.short;difficultyHudB65.setAttribute('aria-label',copy.long);difficultyHudB65.title=copy.long};
updateUI();
