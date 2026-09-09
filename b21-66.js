// B77 Read movement before committing; the announced charger lane remains authoritative.
function observeChargerB77(e,dt){
  if(e.type!=='charger')return;
  const q=e.b77||(e.b77={x:P.x,y:P.y,vx:0,vy:0,time:0});
  const dx=P.x-q.x,dy=P.y-q.y;q.x=P.x;q.y=P.y;
  if(e.state!=='aim'||S.dashTime>0||hyp(dx,dy)>playerSpeedB61()*dt*1.5+1){q.time=0;q.vx=q.vy=0;return}
  const vx=dx/dt,vy=dy/dt;
  if(q.time>0&&vx*q.vx+vy*q.vy<0){q.time=0;q.vx=q.vy=0}
  const blend=1-Math.exp(-dt*10);q.vx+=(vx-q.vx)*blend;q.vy+=(vy-q.vy)*blend;q.time+=dt;
}
const lockBeforeB77=lockChargerLaneB55;
lockChargerLaneB55=function(e){
  if(!e||e.b55LaneLocked)return;
  lockBeforeB77(e);
  const q=e.b77;if(!e.b55LaneLocked||!q||q.time<.35||S.dashTime>0)return;
  let dx=q.vx*.16,dy=q.vy*.16,l=hyp(dx,dy);if(l>28){dx*=28/l;dy*=28/l}
  e.b55LaneAngle=Math.atan2(P.y+dy-e.y,P.x+dx-e.x);
};
const enemyBeforeB77=updateEnemy;
updateEnemy=function(e,dt){if(!liveB59()||e.dead||!Number.isFinite(dt)||dt<=0)return;observeChargerB77(e,dt);return enemyBeforeB77(e,dt)};
