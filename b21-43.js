// B56 Pip bond endpoint pulse: confirm empty/full crossings without another persistent indicator.
const B56_BOND_CUE_SECONDS=.34;

function initBondCueB56(){
  if(!S)return;
  const visual=pipBondVisualB51();
  S.b56BondWasEmpty=visual<=B51_PIP_BOND_EPS;
  S.b56BondWasFull=visual>=.999;
  S.b56BondCue=0;S.b56BondCueKind="";
}
const updateBeforeB56=update;
update=function(dt){
  updateBeforeB56(dt);
  if(!S)return;
  S.b56BondCue=Math.max(0,(S.b56BondCue||0)-Math.max(0,dt||0));
  const visual=pipBondVisualB51(),empty=visual<=B51_PIP_BOND_EPS,full=visual>=.999;
  if(empty&&!S.b56BondWasEmpty){S.b56BondCue=B56_BOND_CUE_SECONDS;S.b56BondCueKind="empty"}
  else if(full&&!S.b56BondWasFull){S.b56BondCue=B56_BOND_CUE_SECONDS;S.b56BondCueKind="full"}
  S.b56BondWasEmpty=empty;S.b56BondWasFull=full;
};
const resetBeforeB56=reset;
reset=function(){resetBeforeB56();initBondCueB56()};
initBondCueB56();

function drawBondEndpointPulseB56(){
  const cue=Math.max(0,S?.b56BondCue||0);if(cue<=0||!P||!S?.run||S.end||S.waveState==="stage")return;
  const life=clamp(cue/B56_BOND_CUE_SECONDS,0,1),progress=1-life;
  const a=(P.pipAngle||0)+Math.PI*.72,r=22;
  const x=worldToScreenX(P.x+Math.cos(a)*r),y=worldToScreenY(P.y+Math.sin(a)*r);
  X.save();X.globalAlpha=life*.78;X.strokeStyle=S.b56BondCueKind==="full"?"#fff0b8":"#ff9fba";X.lineWidth=2.4-life;
  X.shadowColor=X.strokeStyle;X.shadowBlur=8*life;X.beginPath();X.arc(x,y,18+progress*12,0,Math.PI*2);X.stroke();X.restore();
}
const drawPipBondHeartBeforeB56=drawPipBondHeartB51;
drawPipBondHeartB51=function(){drawPipBondHeartBeforeB56();drawBondEndpointPulseB56()};
