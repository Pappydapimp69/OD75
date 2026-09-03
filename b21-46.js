// B59 Pip partnership: one shared decision system for Rally, Cover and Setup.
const B59_TRAITS={
  love:{name:"Rally",color:"#ffadc9",field:"pipLove",copy:"Pip returns when your bond weakens and keeps it steady briefly."},
  compassion:{name:"Cover",color:"#9ee7ff",field:"pipCompassion",copy:"Nearby Pip intercepts a hit when your shields or health are low, then recharges."},
  support:{name:"Setup",color:"#ffe39a",field:"pipSupport",copy:"Pip prepares openings. Dash through the gold diamond for a joint strike."}
};
function liveB59(){return !!(S?.run&&!S.end&&!S.b39Paused&&S.waveState!=="stage")}
function combatB59(){return liveB59()&&(S.waveState==="active"||S.waveState==="boss")}
function traitLevelB59(kind){return Math.max(0,Number(S?.[B59_TRAITS[kind]?.field])||0)}
function traitPowerB59(kind){return Math.min(6,traitLevelB59(kind))}
function dominantTraitB59(){
  return Object.keys(B59_TRAITS).reduce((best,key)=>traitLevelB59(key)>traitLevelB59(best)?key:best,"love");
}
function initPartnershipB59(){
  if(!S)return;
  S.b59={rallyCd:0,coverCd:0,setupCd:0,actionTime:0,action:"",actionX:0,actionY:0,
    quiet:0,grace:0,anchor:0,rallyReturn:false,coverThreat:null,setup:null,lure:null,
    dashSerial:0,ascTrait:"",ascEnding:false,reunion:0,
    stats:{rally:0,cover:0,setup:0,joint:0,gap:0}};
}
function partnershipB59(){if(!S)return null;if(!S.b59)initPartnershipB59();return S.b59}
function nearbyPipB59(){return !!P&&hyp(P.pipX-P.x,P.pipY-P.y)<=105+traitPowerB59("compassion")*8}
function vulnerableB59(){return S.shields<=1||S.health<=S.maxHealth*.45}
function cooldownB59(kind){return {love:Math.max(3.5,7-traitPowerB59(kind)*.45),compassion:Math.max(5,10-traitPowerB59(kind)*.6),support:Math.max(3.5,7.5-traitPowerB59(kind)*.5)}[kind]}
function pointSegmentDistanceB59(x,y,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?clamp(((x-ax)*dx+(y-ay)*dy)/l,0,1):0;
  return hyp(x-ax-dx*t,y-ay-dy*t);
}
function partnershipCueB59(kind,x=P.pipX,y=P.pipY,line=""){
  const b=partnershipB59(),trait=B59_TRAITS[kind];if(!b||!trait)return;
  b.action=kind;b.actionTime=.7;b.actionX=x;b.actionY=y;
  addOverLine(P.pipX,P.pipY,x,y,trait.color,.22);
  sfxPipCue(kind==="compassion"?"return":"heart");
  if(line&&b.quiet<=0){showPipMessage(line,true);b.quiet=6}
}
function incomingThreatB59(){
  if(!combatB59()||!vulnerableB59()||S.invuln>0)return null;
  let best=null,soon=.28;
  for(const s of enemyShots){
    if(s.life<=0)continue;
    const vx=s.vx-P.vx,vy=s.vy-P.vy,rx=s.x-P.x,ry=s.y-P.y,v2=vx*vx+vy*vy;
    const t=v2?clamp(-(rx*vx+ry*vy)/v2,0,.28):0;
    if(t<soon&&hyp(rx+vx*t,ry+vy*t)<P.r+s.r+7){soon=t;best={x:s.x,y:s.y}}
  }
  for(const e of enemies){
    if(e.dead)continue;
    const vx=(e.vx||0)-P.vx,vy=(e.vy||0)-P.vy;
    if(pointSegmentDistanceB59(P.x,P.y,e.x,e.y,e.x+vx*.22,e.y+vy*.22)<P.r+e.r+7)best={x:e.x,y:e.y};
  }
  return best;
}
function coverAvailableB59(){
  const b=partnershipB59();
  return combatB59()&&traitLevelB59("compassion")>0&&b.coverCd<=0&&nearbyPipB59()&&vulnerableB59()&&S.invuln<=0;
}
// One actual impending collision spends Cover. Existing free defenses retain priority.
const hurtBeforeB59=hurt;
hurt=function(){
  if(!combatB59())return;
  const b=partnershipB59();
  const protectedAlready=S.invuln>0||(S.over>0&&S.overType==="guardian"&&S.overGuardHits>0)||(pipWithPlayer()&&S.guardianCharges>0);
  if(!protectedAlready&&coverAvailableB59()){
    b.coverCd=cooldownB59("compassion");b.coverThreat=null;b.stats.cover++;
    S.invuln=.28;S.pipHappy=1;
    partnershipCueB59("compassion",P.x,P.y,"I've got this one. keep moving!");
    ring(P.x,P.y,B59_TRAITS.compassion.color,38);return;
  }
  const before=S.health+S.shields*34;
  const result=hurtBeforeB59();
  if(S.health+S.shields*34<before)for(const e of enemies)if(e.b59)e.b59.hurtDuring=true;
  return result;
};

const findPipHeartTargetBeforeB59=findPipHeartTarget;
findPipHeartTarget=function(){
  const target=findPipHeartTargetBeforeB59(),b=partnershipB59();
  if(!target||!combatB59()||traitLevelB59("love")<=0)return target;
  if(b.anchor>0||b.rallyReturn)return null;
  const boss=enemies.find(e=>!e.dead&&e.b59);
  // During a windup prefer a short, finishable trip; ordinary nearby collection continues.
  if(boss&&boss.b59.phase!=="recover"&&hyp(target.x-P.x,target.y-P.y)>Math.max(48,S.pipMoveSpeed*.25))return null;
  return target;
};
const pipOrbitPointBeforeB59=pipOrbitPoint;
pipOrbitPoint=function(){
  const lure=S?.b59?.lure;
  if(lure&&liveB59()&&!lure.boss.dead&&lure.boss.b59?.phase==="stalk")return {x:lure.x,y:lure.y};
  return pipOrbitPointBeforeB59();
};
function requestRallyB59(){
  const b=partnershipB59(),lv=traitPowerB59("love");
  if(!combatB59()||!lv||b.rallyCd>0||b.rallyReturn||b.actionTime>0||b.coverThreat)return false;
  const boss=enemies.find(e=>!e.dead&&e.b59),far=hyp(P.x-P.pipX,P.y-P.pipY)>42;
  const weakening=pipBondB51()<.32+lv*.07;
  const urgent=boss&&(boss.b59.phase==="locked"||boss.b59.phase==="pounce")&&far;
  if(S.pipState==="orbit"||!far||(!weakening&&!urgent))return false;
  b.rallyReturn=true;b.lure=null;S.pipTarget=null;S.pipState="return";
  partnershipCueB59("love",P.x,P.y,"coming back — we do this together.");return true;
}
function finishRallyB59(){
  const b=partnershipB59(),lv=traitPowerB59("love");
  b.rallyReturn=false;b.rallyCd=cooldownB59("love");b.anchor=.45;
  b.grace=.5+lv*.15+(b.ascTrait==="love"&&S.over>0?.45:0);
  S.b51PipBond=1;S.b51PipBondVisual=1;b.stats.rally++;
  partnershipCueB59("love",P.x,P.y,"back with you. our bond is steady.");
}
const updatePipCompanionBeforeB59=updatePipCompanion;
updatePipCompanion=function(dt){
  requestRallyB59();
  const b=partnershipB59(),speed=S.pipMoveSpeed;
  if(b.rallyReturn)S.pipMoveSpeed*=1.2+traitPowerB59("love")*.06;
  try{updatePipCompanionBeforeB59(dt)}finally{S.pipMoveSpeed=speed}
  if(b.rallyReturn&&S.pipState==="orbit")finishRallyB59();
  planSetupB59();
};
function setupPointB59(e,kind){
  let angle=Math.atan2(P.y-e.y,P.x-e.x),radius=e.r+24;
  if(kind==="petal"){angle=e.b59.gapAngle+.66;radius=88}
  return {x:e.x+Math.cos(angle)*radius,y:e.y+Math.sin(angle)*radius};
}
function markSetupB59(e,kind="strike",free=false){
  const b=partnershipB59();if(!e||e.dead||b.setup||traitLevelB59("support")<=0)return false;
  if(!free&&b.setupCd>0)return false;
  const p=setupPointB59(e,kind);
  b.setup={boss:e,kind,x:p.x,y:p.y,r:16,life:kind==="petal"?2.8:2.0,createdDash:b.dashSerial};
  if(!free)b.setupCd=cooldownB59("support");
  b.stats.setup++;
  partnershipCueB59("support",p.x,p.y,kind==="petal"?"dash through my diamond — I'll open a path!":"my diamond! dash through and we'll strike together.");
  return true;
}
function planSetupB59(){
  const b=partnershipB59();
  if(!combatB59()||traitLevelB59("support")<=0||b.setup||b.actionTime>0||b.rallyReturn||b.coverThreat||!nearbyPipB59()||pipBondB51()<.45)return;
  const e=enemies.find(e=>!e.dead&&e.b59);if(!e)return;
  const q=e.b59;
  if(q.phase==="recover"&&q.clean&&q.timer>.65&&!q.setupUsed){
    if(markSetupB59(e,"strike",!!q.lured)){q.setupUsed=true;q.lured=false}
  }else if(e.bossKey===5&&q.phase==="stalk"&&q.timer<1.1&&!q.lured&&b.setupCd<=0){
    const a=Math.atan2(P.y-e.y,P.x-e.x)+.6;
    b.lure={boss:e,x:P.x+Math.cos(a)*58,y:P.y+Math.sin(a)*58};
    q.lured=true;b.setupCd=cooldownB59("support");b.stats.setup++;
    partnershipCueB59("support",b.lure.x,b.lure.y,"I'll draw the pounce. take its flank!");
  }else if(e.bossKey===7&&q.phase==="petals"&&q.timer>1&&!q.setupUsed&&b.setupCd<=0){
    if(markSetupB59(e,"petal"))q.setupUsed=true;
  }
}
function consumeSetupB59(ax,ay,bx,by,dashed){
  const b=partnershipB59(),mark=b.setup;if(!mark)return false;
  if(mark.boss.dead||!enemies.includes(mark.boss)||mark.life<=0){b.setup=null;return false}
  if(!dashed||b.dashSerial<=mark.createdDash||hyp(bx-ax,by-ay)<.1)return false;
  if(pointSegmentDistanceB59(mark.x,mark.y,ax,ay,bx,by)>P.r+mark.r)return false;
  b.setup=null;b.stats.joint++;
  const e=mark.boss,lv=traitPowerB59("support");
  const damage=(3.2+lv*.85)*(b.ascTrait==="support"&&S.over>0?1.35:1);
  if(mark.kind==="petal"){
    const angle=Math.atan2(mark.y-e.y,mark.x-e.x);
    e.b59.openAngle=angle;e.b59.openTime=1.2;
    for(const shot of enemyShots)if(shot.b59Boss===e&&Math.abs(angleDeltaB59(shot.b59Angle-angle))<.5)shot.life=0;
    b.stats.gap++;
  }
  hitEnemy(e,damage,"pip");partnershipCueB59("support",mark.x,mark.y,"that's our opening!");
  ring(mark.x,mark.y,B59_TRAITS.support.color,45);return true;
}
const dashVectorBeforeB59=dashVector;
dashVector=function(dx,dy){
  if(!liveB59())return false;
  const started=dashVectorBeforeB59(dx,dy);if(started)partnershipB59().dashSerial++;return started;
};
const triggerOverdriveBeforeB59=triggerOverdrive;
triggerOverdrive=function(){
  const active=!!(S?.over>0),started=triggerOverdriveBeforeB59();
  if(started&&!active&&S.overType==="pip"){
    const b=partnershipB59(),kind=dominantTraitB59();b.ascTrait=traitLevelB59(kind)>0?kind:"";b.ascEnding=false;
  }
  return started;
};
const resetBeforeB59=reset;
reset=function(){resetBeforeB59();initPartnershipB59()};
initPartnershipB59();
