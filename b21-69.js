// B80 Pip may reconsider one in-flight heart route when danger materially changes.
const B80_REPLAN_COOLDOWN=1.2,B80_REPLAN_CUE=.8;
function replanStateB80(){return S.b80||(S.b80={cooldown:0,cue:0,count:0})}
function replanUtilityB80(source){return sourceScoreB74(source)-riskAtB76(source.x,source.y)*160}
function saferSourceB80(current){
  if(!sourceAliveB74(current)||hyp(current.x-P.pipX,current.y-P.pipY)<=18)return null;
  const currentRisk=riskAtB76(current.x,current.y);if(currentRisk<.45)return null;
  const candidates=heartSourcesB74().filter(source=>source!==current&&sourceAliveB74(source)&&hyp(source.x-P.pipX,source.y-P.pipY)<S.pipDetectRange&&partnershipAllowsSourceB74(source)&&riskAtB76(source.x,source.y)<=currentRisk-.3);
  candidates.sort((a,b)=>replanUtilityB80(b)-replanUtilityB80(a)||(a.id||a.b74Id)-(b.id||b.b74Id));
  return candidates[0]&&replanUtilityB80(candidates[0])>=replanUtilityB80(current)+15?candidates[0]:null;
}
const transportBeforeB80=updatePipTransportB60;
updatePipTransportB60=function(dt){
  if(!liveB59())return transportBeforeB80(dt);
  const q=replanStateB80(),step=clamp(Number(dt)||0,0,.04);q.cooldown=Math.max(0,q.cooldown-step);q.cue=Math.max(0,q.cue-step);
  let changed=false;if(step&&q.cooldown<=0&&S.pipState==='collect'&&!supportEmergencyB63()&&!S.b59?.rallyReturn&&!heartfieldB74().mining){
    const next=saferSourceB80(S.pipTarget);if(next){S.pipTarget=next;clearMiningB74();q.cooldown=B80_REPLAN_COOLDOWN;q.cue=B80_REPLAN_CUE;q.count++;changed=true}
  }
  transportBeforeB80(dt);
  if(changed&&S.pipState==='collect')setIntentB76('replan','Rerouting around immediate danger','different way.');
};
const drawBeforeB80=draw;
draw=function(){drawBeforeB80();const q=S?.b80;if(!q?.cue||!S.run||S.end||S.waveState==='stage'||S.pipState!=='collect')return;X.save();X.font='bold 10px system-ui';X.textAlign='center';X.fillStyle='#9ee7ff';X.shadowColor='#000';X.shadowBlur=5;X.fillText('REROUTING',clamp(worldToScreenX(P.pipX),70,W-70),clamp(worldToScreenY(P.pipY)-28,215,H-70));X.restore()};
const stageBeforeB80=openStageUpgrade;
openStageUpgrade=function(){const result=stageBeforeB80();S.b80={cooldown:0,cue:0,count:0};return result};
const resetBeforeB80=reset;
reset=function(){resetBeforeB80();S.b80={cooldown:0,cue:0,count:0}};
if(S)S.b80={cooldown:0,cue:0,count:0};
