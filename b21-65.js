// B76 Pip notices: run memory changes source choice, trip commitment and reunion.
function initFeelingsB76(){
  return S.b76={trust:.5,pride:.5,worry:0,familiarity:0,trip:null,approach:0,closing:0,
    px:P.x,py:P.y,hold:0,quiet:0,intent:'gather',reason:'Looking for hearts',cue:0,
    stats:{safe:0,rough:0,met:0},motives:{attachment:0,pride:.5,concern:0,trust:.5}};
}
function feelingsB76(){return S.b76||initFeelingsB76()}
function riskAtB76(x,y){
  let risk=0;
  for(const e of enemies){if(e.dead)continue;const d=hyp(e.x-x,e.y-y);risk+=Math.max(0,1-d/(e.type==='boss'?200:125))*.55;if(risk>=1)return 1}
  for(const s of enemyShots){if(s.life<=0)continue;risk+=Math.max(0,1-hyp(s.x-x,s.y-y)/90)*.4;if(risk>=1)return 1}
  return clamp(risk,0,1);
}
function setIntentB76(intent,reason,line=''){
  const f=feelingsB76();if(f.intent===intent&&f.reason===reason)return;
  f.intent=intent;f.reason=reason;f.cue=1.1;
  if(line&&f.quiet<=0){showMessageBeforeB76(line,true);f.quiet=4;S.pipHappy=Math.max(S.pipHappy||0,4);S.praiseCd=Math.max(S.praiseCd||0,4)}
}
const showMessageBeforeB76=showPipMessage;
showPipMessage=function(msg,force=false){if(!force&&S?.b76?.quiet>0)return;return showMessageBeforeB76(msg,force)};
function tripGoalB76(){
  const f=feelingsB76();
  // Fresh Pip keeps the old full-load goal. Experiences can reduce it to 55%.
  return S.pipCarryCapacity*clamp(.85+f.trust*.3+(f.pride-.5)*.2-f.worry*.45,.55,1);
}
const sourceScoreBeforeB76=sourceScoreB74;
sourceScoreB74=function(source){
  const f=feelingsB76(),distance=hyp(source.x-P.pipX,source.y-P.pipY);
  return sourceScoreBeforeB76(source)+(f.pride-.5)*Math.min(heartValueB74(source),cargoSlotsB74())*65
    -f.worry*(riskAtB76(source.x,source.y)*180+distance*.35);
};
function observePipB76(dt){
  const f=feelingsB76(),distance=hyp(P.pipX-P.x,P.pipY-P.y);
  f.hold=Math.max(0,f.hold-dt);f.quiet=Math.max(0,f.quiet-dt);f.cue=Math.max(0,f.cue-dt);
  f.worry=Math.max(0,f.worry-dt*.018);
  if(S.pipState!=='orbit'&&!f.trip)f.trip={time:0,maxDistance:distance,danger:0,rough:false,approached:false};
  const danger=Math.max(riskAtB76(P.pipX,P.pipY),riskAtB76(P.x,P.y)*(S.shields<2?1:.35));
  if(f.trip){f.trip.time+=dt;f.trip.maxDistance=Math.max(f.trip.maxDistance,distance);f.trip.danger=danger>.55?f.trip.danger+dt:Math.max(0,f.trip.danger-dt*.5)}
  const dx=P.x-f.px,dy=P.y-f.py,move=hyp(dx,dy),toward=distance?((P.pipX-P.x)*dx+(P.pipY-P.y)*dy)/distance:0;
  // Require the player's own sustained approach. Pip flying home or a dash cannot manufacture recognition.
  if(distance>30&&distance<180&&cargoWeightB60()>=S.pipCarryCapacity*.5&&S.dashTime<=0&&move>0&&move<playerSpeedB61()*dt*1.5+1&&toward>move*.75){
    f.approach+=dt;f.closing+=toward;
  }else{f.approach=0;f.closing=0}
  f.px=P.x;f.py=P.y;
  if(f.trip&&f.approach>=.6-f.familiarity*.2&&f.closing>=24)f.trip.approached=true;
  f.motives={attachment:(1-pipBondB51())*(1-f.trust)*.6,pride:f.pride,concern:danger,trust:f.trust};
}
function decidePipB76(){
  const f=feelingsB76(),trip=f.trip;
  if(supportEmergencyB63()){setIntentB76('support','Returning to protect you');return}
  if(S.b59?.rallyReturn||S.b59?.anchor>0){setIntentB76('rally','Following Loving Rally');return}
  if(S.pipState!=='collect')return;
  let intent='',reason='',line='';
  if(trip?.approached&&cargoHeartValueB74()>0){intent='meet';reason='Meeting you with this load';line=f.familiarity>.3?'there you are.':'oh. you came back.'}
  else if(trip?.time>.8&&trip.danger>.8&&cargoWeightB60()>0&&f.motives.concern+f.motives.attachment>f.pride*.6+f.trust*.5){intent='shelter';reason='Bringing this load home early';line='bringing these back. stay close.'}
  else if(trip?.time>.8&&cargoWeightB60()>0&&cargoWeightB60()>=tripGoalB76()&&f.worry>.15){intent='cautious';reason='Taking a shorter trip';line='these will do. coming home.'}
  if(intent){if(intent==='shelter')trip.rough=true;S.pipState='return';S.pipTarget=null;clearMiningB74();setIntentB76(intent,reason,line)}
  else setIntentB76('gather',f.worry>.25?'Choosing a safer heart route':f.trust>.65?'Comfortable finishing this load':'Gathering this load');
}
const transportBeforeB76=updatePipTransportB60;
updatePipTransportB60=function(dt){
  if(!liveB59())return;dt=clamp(Number(dt)||0,0,.04);if(!dt)return;
  observePipB76(dt);decidePipB76();
  const f=feelingsB76();if(S.pipState==='orbit'&&f.hold>0)transportB60().rest=Math.max(transportB60().rest,f.hold);
  transportBeforeB76(dt);
};
const reuniteBeforeB76=reunitePipB60;
reunitePipB60=function(){
  const f=feelingsB76(),trip=f.trip,count=cargoHeartValueB74();
  reuniteBeforeB76();
  if(trip&&trip.time>=.5&&trip.maxDistance>=60){
    if(trip.rough||trip.danger>.8){f.stats.rough++;f.worry=clamp(f.worry+.3,0,1);f.trust=clamp(f.trust-.06,.2,.95);f.hold=1.2;setIntentB76('recover','Staying close after that trip','stay close a sec.')}
    else if(count>0){f.stats.safe++;f.trust=clamp(f.trust+.07,.2,.95);f.pride=clamp(f.pride+.05,.25,.9);f.worry=Math.max(0,f.worry-.12);setIntentB76('reunited','Safe delivery','got them. we did it.')}
    if(trip.approached&&count>0){f.stats.met++;f.familiarity=clamp(f.familiarity+.18,0,1)}
  }
  transportB60().rest=Math.max(transportB60().rest,f.hold);f.trip=null;f.approach=0;f.closing=0;
};
const hurtBeforeB76=hurt;
hurt=function(){
  const before=S.health+S.shields*34,result=hurtBeforeB76();
  if(S.health+S.shields*34<before&&liveB59()&&hyp(P.pipX-P.x,P.pipY-P.y)>60){
    const f=feelingsB76();if(f.trip&&!f.trip.rough){f.trip.rough=true;f.worry=clamp(f.worry+.25,0,1)}
  }return result;
};
const stageBeforeB76=openStageUpgrade;
openStageUpgrade=function(){const result=stageBeforeB76();const f=feelingsB76();f.trip=null;f.approach=0;f.closing=0;f.hold=0;f.intent='gather';f.reason='Ready for the next stage';return result};
const resetBeforeB76=reset;
reset=function(){resetBeforeB76();initFeelingsB76()};
const pauseBeforeB76=renderAscendedPauseB39;
renderAscendedPauseB39=function(){pauseBeforeB76();const f=feelingsB76();$('b39CoreList')?.insertAdjacentHTML('beforeend',rowB39('Pip notices',`${f.reason}. ${f.stats.safe} safe trips · ${f.stats.rough} rough trips · ${f.stats.met} halfway reunions. Experience changes route choice and how full a load he tries to bring home. Memories last this run.`,'TOGETHER'))};
const drawBeforeB76=draw;
draw=function(){
  drawBeforeB76();if(!S?.run||S.end||S.waveState==='stage')return;
  const f=feelingsB76();if(f.intent==='gather'||f.intent==='reunited')return;
  if(S.pipState==='orbit'&&f.hold<=0)return;
  const label={meet:'MEETING YOU',shelter:'COMING HOME',cautious:'SHORT TRIP',recover:'STAYING CLOSE',support:'HERE TO HELP',rally:'RALLY'}[f.intent];if(!label)return;
  X.save();X.font='bold 10px system-ui';X.textAlign='center';X.fillStyle=f.intent==='recover'?'#9ee7ff':'#ffe3ab';X.shadowColor='#000';X.shadowBlur=5;
  X.fillText(label,clamp(worldToScreenX(P.pipX),75,W-75),clamp(worldToScreenY(P.pipY)-28,215,H-70));X.restore();
};
initFeelingsB76();
