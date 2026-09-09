// B79 A missed commitment creates a brief, vulnerable reset before the next aim.
const enemyBeforeB79=updateEnemy;
updateEnemy=function(e,dt){
  if(!liveB59()||e.dead||!Number.isFinite(dt)||dt<=0)return;
  if(e.type!=='charger')return enemyBeforeB79(e,dt);
  const q=e.b79||(e.b79={misses:0,nearest:Infinity,recover:0});
  const charging=e.state==='charge',x=e.x,y=e.y;
  if(!charging&&q.recover>0){const held=Math.min(dt,q.recover);e.aim+=held;q.recover=Math.max(0,q.recover-dt)}
  enemyBeforeB79(e,dt);
  if(!charging&&e.state==='charge')q.nearest=hyp(P.x-e.x,P.y-e.y);
  if(charging){
    q.nearest=Math.min(q.nearest,pointSegmentDistanceB59(P.x,P.y,x,y,e.x,e.y));
    if(e.state==='aim'&&!e.dead){q.misses=q.nearest>80?Math.min(2,q.misses+1):0;q.recover=q.misses*.18;q.nearest=Infinity}
  }
};
const drawBeforeB79=draw;
draw=function(){drawBeforeB79();if(!S?.run||S.end||S.waveState==='stage')return;X.save();X.font='bold 9px system-ui';X.textAlign='center';X.fillStyle='#ffe3ab';X.shadowColor='#000';X.shadowBlur=4;for(const e of enemies)if(!e.dead&&e.b79?.recover>0)X.fillText('RESETTING',worldToScreenX(e.x),worldToScreenY(e.y)-24);X.restore()};
