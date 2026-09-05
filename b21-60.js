// B73 Pulse the existing difficulty pill when banked hearts raise its tier.
const B73_DIFFICULTY_PULSE_SECONDS=1;
const difficultyPulseStyleB73=document.createElement('style');
difficultyPulseStyleB73.textContent='#difficultyHudB65{transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease,color .12s ease}#difficultyHudB65.b73-tier-up{transform:scale(1.07);color:#fff6cf;border-color:#ffe39acc;box-shadow:0 0 14px #ffd36f99;background:#30230dcc}';
document.head.appendChild(difficultyPulseStyleB73);

const collectHeartBitBeforeB73=collectHeartBit;
collectHeartBit=function(h){
  const eligible=!!S&&S.stage>=4&&S.stage<=10,before=eligible?difficultyStageB63():0;
  const result=collectHeartBitBeforeB73(h);
  const after=eligible?difficultyStageB63():before;
  if(after>before){S.b73DifficultyPulse=B73_DIFFICULTY_PULSE_SECONDS;S.b73DifficultyTier=after}
  return result;
};

const updateBeforeB73=update;
update=function(dt){
  updateBeforeB73(dt);
  if(liveB59()&&S.b73DifficultyPulse>0)S.b73DifficultyPulse=Math.max(0,S.b73DifficultyPulse-Math.max(0,dt||0));
};

const updateUIBeforeB73=updateUI;
updateUI=function(){
  updateUIBeforeB73();
  const active=(S?.b73DifficultyPulse||0)>0;
  difficultyHudB65.classList.toggle('b73-tier-up',active);
  if(active)difficultyHudB65.setAttribute('aria-label',`${difficultyHudB65.getAttribute('aria-label')} Tier ${S.b73DifficultyTier} reached.`);
};

const resetBeforeB73=reset;
reset=function(){resetBeforeB73();S.b73DifficultyPulse=0;S.b73DifficultyTier=0;difficultyHudB65.classList.remove('b73-tier-up')};
if(S){S.b73DifficultyPulse=0;S.b73DifficultyTier=0}
