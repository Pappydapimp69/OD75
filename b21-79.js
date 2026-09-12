// B90 Dash readiness
const B90_DASH_READY_SECONDS=.42;
function clearDashReadyB90(){if(S){S.b90DashReady=0;S.b90DashWasCooling=false}}
function tickDashReadyB90(dt,beforeCd){
 if(!S||!S.run||S.end||S.waveState==="stage"||S.b39Paused)return;
 const crossed=(beforeCd||0)>0&&S.dashCd<=0;
 if(crossed)S.b90DashReady=B90_DASH_READY_SECONDS;
 else if(S.b90DashReady>0)S.b90DashReady=Math.max(0,S.b90DashReady-dt);
 S.b90DashWasCooling=S.dashCd>0;
}
function dashReadyCueB90(){
 if(!S||!S.b90DashReady||!S.run||S.end||S.waveState==="stage")return null;
 const k=clamp(S.b90DashReady/B90_DASH_READY_SECONDS,0,1);
 return {x:P.x,y:P.y,alpha:k,r:24+(1-k)*18};
}
function drawDashReadyB90(){
 const q=dashReadyCueB90();if(!q)return;
 X.save();
 X.globalAlpha=.18+.34*q.alpha;X.strokeStyle=COLORS.player;X.lineWidth=3;
 X.beginPath();X.arc(q.x,q.y,q.r,0,Math.PI*2);X.stroke();
 X.globalAlpha=.65*q.alpha;X.fillStyle=COLORS.player;X.font="bold 11px system-ui";X.textAlign="center";
 X.fillText("DASH",q.x,q.y-28-(1-q.alpha)*8);
 X.restore();
}
const updateBeforeB90=update;
update=function(dt){const before=S?S.dashCd:0;updateBeforeB90(dt);tickDashReadyB90(dt,before)};
const dashVectorBeforeB90=dashVector;
dashVector=function(dx,dy){const ok=dashVectorBeforeB90(dx,dy);if(ok)S.b90DashReady=0;return ok};
const drawBeforeB90=draw;
draw=function(){drawBeforeB90();drawDashReadyB90()};
const resetBeforeB90=reset;
reset=function(){resetBeforeB90();clearDashReadyB90()};
const openStageUpgradeBeforeB90=openStageUpgrade;
openStageUpgrade=function(){const r=openStageUpgradeBeforeB90();clearDashReadyB90();return r};
