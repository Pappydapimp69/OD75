// B55 Committed charger lanes: freeze the final warning and preserve it through the dash.
const B55_CHARGER_COMMIT_WINDOW=.22;
const B55_CHARGER_LANE_LENGTH=220;

function lockChargerLaneB55(e){
  if(!e||e.type!=="charger"||e.state!=="aim"||e.b55LaneLocked)return;
  e.b55LaneAngle=Math.atan2(P.y-e.y,P.x-e.x);e.b55LaneLocked=true;
}
const updateEnemyBeforeB55=updateEnemy;
updateEnemy=function(e,dt){
  const wasAim=e?.type==="charger"&&e.state==="aim";
  if(wasAim&&(e.aim||0)<=B55_CHARGER_COMMIT_WINDOW)lockChargerLaneB55(e);
  updateEnemyBeforeB55(e,dt);
  if(!e||e.type!=="charger")return;
  if(wasAim&&e.state==="charge"){
    if(!e.b55LaneLocked){e.b55LaneAngle=Math.atan2(e.vy,e.vx);e.b55LaneLocked=true}
    const a=Number.isFinite(e.b55LaneAngle)?e.b55LaneAngle:Math.atan2(e.vy,e.vx);
    e.b55LaneAngle=a;e.b55LaneLocked=true;e.b55ChargeStartX=e.x;e.b55ChargeStartY=e.y;
    e.vx=Math.cos(a)*340;e.vy=Math.sin(a)*340;
  }else if(!wasAim&&e.state==="aim"){
    e.b55LaneLocked=false;e.b55LaneAngle=null;e.b55ChargeStartX=null;e.b55ChargeStartY=null;
  }
};

function drawCommittedChargerLanesB55(){
  if(!S?.run||S.end||S.waveState==="stage")return;
  X.save();X.lineCap="round";
  for(const e of enemies){
    if(!e||e.dead||e.type!=="charger"||!e.b55LaneLocked||!Number.isFinite(e.b55LaneAngle))continue;
    if(e.state!=="aim"&&e.state!=="charge")continue;
    const a=e.b55LaneAngle,aiming=e.state==="aim";
    const wx=aiming?e.x:(Number.isFinite(e.b55ChargeStartX)?e.b55ChargeStartX:e.x);
    const wy=aiming?e.y:(Number.isFinite(e.b55ChargeStartY)?e.b55ChargeStartY:e.y);
    const sx=worldToScreenX(wx),sy=worldToScreenY(wy),ex=worldToScreenX(wx+Math.cos(a)*B55_CHARGER_LANE_LENGTH),ey=worldToScreenY(wy+Math.sin(a)*B55_CHARGER_LANE_LENGTH);
    const t=aiming?clamp(1-(e.aim||0)/B55_CHARGER_COMMIT_WINDOW,0,1):1;
    X.globalAlpha=aiming?.12+.12*t:.13;X.strokeStyle="#ff9fba";X.lineWidth=18;X.beginPath();X.moveTo(sx,sy);X.lineTo(ex,ey);X.stroke();
    X.globalAlpha=aiming?.72+.25*t:.52;X.strokeStyle=aiming?"#ffd6e1":"#ff9fba";X.lineWidth=2.5;X.beginPath();X.moveTo(sx,sy);X.lineTo(ex,ey);X.stroke();
    X.globalAlpha=aiming?.8:Math.max(.2,clamp((e.charge||0)/.52,0,1));X.fillStyle="#fff0f4";X.beginPath();X.arc(ex,ey,3.5,0,Math.PI*2);X.fill();
  }
  X.restore();
}

const drawThreatTelegraphsBeforeB55=drawThreatTelegraphsB50;
drawThreatTelegraphsB50=function(){
  const hidden=[];
  for(const e of enemies)if(e?.type==="charger"&&e.state==="aim"&&e.b55LaneLocked){hidden.push([e,e.aim]);e.aim=B50_CHARGER_TELEGRAPH_WINDOW+1}
  try{drawThreatTelegraphsBeforeB55()}finally{for(const [e,aim] of hidden)e.aim=aim}
  drawCommittedChargerLanesB55();
};
