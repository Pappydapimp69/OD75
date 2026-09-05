// B63 Partnership survival and run-heart difficulty.
const pauseScrollStyleB63=document.createElement('style');
pauseScrollStyleB63.textContent='#pipPauseB39 .b39-section{overflow:auto;overscroll-behavior:contain}';document.head.appendChild(pauseScrollStyleB63);
function heartSecondsB63(){return 1+Math.max(0,S?.pipCompassion||0)*.5}
function difficultyHeartsB63(){const early=S.earlyRunHearts||0;return Math.max(0,(S.runHearts||0)-early+early/3)}
function difficultyStageB63(){
  if(S.stage<=3)return 1;
  return S.stage<=10?Math.min(10,1+Math.floor(difficultyHeartsB63()/20)):S.stage;
}
function difficultyWaveB63(){return S.stage<=10?1+(difficultyStageB63()-1)*3:Math.max(1,S.wave)}
function difficultyBossCountB63(){return S.stage<=10?Math.floor((difficultyStageB63()-1)/3):S.bossCount}
const waveGoalBeforeB63=waveGoalFor;
waveGoalFor=function(n){return S.stage<=10?8+Math.floor((difficultyStageB63()-1)*2/3):waveGoalBeforeB63(n)};
function supportEmergencyB63(){return !!S&&S.pipSupport>0&&S.shields<2&&(S.waveState==='active'||S.waveState==='boss')}
function dropCargoB63(){
  const cargo=transportB60().cargo.splice(0);
  cargo.forEach((h,i)=>{
    const a=i*2.399;h.b60Carried=false;h.dead=false;h.life=10;
    h.x=P.pipX+Math.cos(a)*14;h.y=P.pipY+Math.sin(a)*14;
    h.vx=Math.cos(a)*35;h.vy=Math.sin(a)*35;
    if(!heartBits.includes(h))heartBits.push(h);
  });
  return cargo.length;
}
function emergencyRecallB63(){
  if(!combatB59()||!supportEmergencyB63())return;
  const b=partnershipB59(),departed=S.pipState!=='orbit';
  if(transportB60().cargo.length)dropCargoB63();
  b.rallyReturn=false;b.lure=null;b.setup=null;S.pipTarget=null;
  if(departed)S.pipState='return';
}
const hurtBeforeB63=hurt;
hurt=function(){hurtBeforeB63();emergencyRecallB63()};
const companionBeforeB63=updatePipCompanion;
updatePipCompanion=function(dt){
  if(!liveB59())return;
  if(supportEmergencyB63()){emergencyRecallB63();updatePipTransportB60(dt);return}
  companionBeforeB63(dt);
};
const targetBeforeB63=findPipHeartTarget;
findPipHeartTarget=function(){return supportEmergencyB63()?null:targetBeforeB63()};
const gatherBeforeB63=gatherHeartB60;
gatherHeartB60=function(h){return supportEmergencyB63()?false:gatherBeforeB63(h)};
const magnetBeforeB63=updateAscendantHeartMagnetB26;
updateAscendantHeartMagnetB26=function(dt){if(!supportEmergencyB63())magnetBeforeB63(dt)};
const orbitBeforeB63=pipOrbitPoint;
pipOrbitPoint=function(){return supportEmergencyB63()?pipOrbitPointBeforeB59():orbitBeforeB63()};
const emotionBeforeB63=emotionalNextText;
emotionalNextText=function(kind){
  if(kind==='compassion')return `Heart meter ${heartSecondsB63().toFixed(1)} → ${(heartSecondsB63()+.5).toFixed(1)} seconds away. Cover and return protection grow with Compassion.`;
  if(kind==='support')return `EMERGENCY RETURN · Below 2 shields, Pip drops cargo, returns while using learned attacks, and stays until shields recover to 2. ${emotionBeforeB63(kind)}`;
  return emotionBeforeB63(kind);
};
B39_EMOTION_TEXT.compassion='Each level adds 0.5 seconds to the heart meter; Cover and protective return effects remain.';
B39_EMOTION_TEXT.support='Below 2 shields, drop cargo and return with learned attacks; stay until 2 shields. Also strengthens offensive support.';
const pauseBeforeB63=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  pauseBeforeB63();
  $('b39CoreList').insertAdjacentHTML('beforeend',rowB39('Heart reserve',`${heartSecondsB63().toFixed(1)} seconds away · +0.5s per Compassion level. Empty heart: current cargo speed × 0.90.`,'BOND'));
  $('b39CoreList').insertAdjacentHTML('beforeend',rowB39('Run difficulty',`${S.runHearts||0} hearts banked this run · ${S.stage<=3?'Opening difficulty':S.stage<=10?'Heart tier '+difficultyStageB63()+' / 10 ('+difficultyHeartsB63().toFixed(1)+' difficulty hearts)':'Original stage scaling'}.`,'STAGE'));
};
