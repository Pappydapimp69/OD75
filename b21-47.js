// B59 Boss personalities: committed attacks with opportunities for all three traits.
const B59_BOSS_KEYS=[1,5,7];
function angleDeltaB59(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function initBossB59(e){
  if(e.b59)return e.b59;
  const a=Math.atan2(P.y-e.y,P.x-e.x);
  e.b59={phase:e.bossKey===5?"stalk":"track",timer:e.bossKey===5?1.5:1.05,
    duration:e.bossKey===5?1.5:1.05,angle:a,gapAngle:a,cycle:0,volley:0,second:false,
    direction:1,openTime:0,openAngle:0,setupUsed:false,lured:false,clean:false,
    hurtDuring:false,dashStart:partnershipB59().dashSerial,fromX:e.x,fromY:e.y,moveX:0,moveY:0};
  return e.b59;
}
function bossPhaseB59(e,phase,seconds){
  const q=e.b59;q.phase=phase;q.timer=seconds;q.duration=seconds;
  q.fromX=e.x;q.fromY=e.y;
}
function bossCycleB59(e){
  const q=e.b59,b=partnershipB59();
  q.second=e.hp<=e.maxHp*.5;q.hurtDuring=false;q.setupUsed=false;q.lured=false;
  q.clean=false;q.volley=0;q.dashStart=b.dashSerial;q.cycle++;
  if(b.setup?.boss===e)b.setup=null;
  if(b.lure?.boss===e)b.lure=null;
  if(e.bossKey===5)bossPhaseB59(e,"stalk",1.5);
  else if(e.bossKey===7){
    const reverse=q.second&&q.cycle%2===0;
    if(reverse)q.direction*=-1;
    if(q.cycle>2)q.gapAngle+=q.direction*.42;
    bossPhaseB59(e,reverse?"reverse":"track",reverse?1.15:.95);
  }else bossPhaseB59(e,"track",.95);
}
function bossRecoverB59(e,seconds){
  const q=e.b59;
  const moved=partnershipB59().dashSerial>q.dashStart||Math.abs(angleDeltaB59(Math.atan2(P.y-e.y,P.x-e.x)-q.angle))>.48;
  q.clean=!q.hurtDuring&&moved;q.setupUsed=false;
  bossPhaseB59(e,"recover",seconds);
  if(partnershipB59().lure?.boss===e)partnershipB59().lure=null;
}
function moveBossToB59(e,x,y,speed,dt){
  const dx=x-e.x,dy=y-e.y,d=hyp(dx,dy)||1,step=Math.min(d,speed*dt);
  e.x+=dx/d*step;e.y+=dy/d*step;
}
function pushBossShotB59(e,angle,speed,r=5,petal=false){
  const x=e.x+Math.cos(angle)*(e.r+13),y=e.y+Math.sin(angle)*(e.r+13);
  // A radial shot never appears inside the player's collision radius.
  if(petal&&hyp(x-P.x,y-P.y)<P.r+r+16)return;
  enemyShots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,life:3.6,
    c:bossData(e.bossKey).color,b59Boss:e,b59Angle:angle,b59Petal:petal});
}
function fireGrumpB59(e){
  const q=e.b59,count=q.second?7:5;
  for(let i=0;i<count;i++)pushBossShotB59(e,q.angle-.41+.82*i/(count-1),175+(q.second?15:0));
  q.volley++;sfxEnemyAttack("boss");bossPhaseB59(e,"volley",q.second&&q.volley===1?.4:.65);
}
function fireBloomB59(e){
  const q=e.b59,count=28;
  for(let i=0;i<count;i++){
    const a=q.gapAngle+Math.PI*2*i/count;
    if(Math.abs(angleDeltaB59(a-q.gapAngle))<.48)continue;
    pushBossShotB59(e,a,q.second?155:135,4.5,true);
  }
  sfxEnemyAttack("boss");q.setupUsed=false;bossPhaseB59(e,"petals",2.6);
}
function updateGrumpB59(e,dt){
  const q=e.b59;
  if(q.phase==="track"){
    q.angle=Math.atan2(P.y-e.y,P.x-e.x);
    if(q.volley===0){const a=q.angle+Math.PI;moveBossToB59(e,P.x+Math.cos(a)*165,P.y+Math.sin(a)*165,55,dt)}
    if(q.timer<=0)bossPhaseB59(e,"locked",.38);
  }else if(q.phase==="locked"){
    if(q.timer<=0)fireGrumpB59(e);
  }else if(q.phase==="volley"&&q.timer<=0){
    if(q.second&&q.volley===1)bossPhaseB59(e,"track",.45);
    else bossRecoverB59(e,2.0);
  }else if(q.phase==="recover"&&q.timer<=0)bossCycleB59(e);
}
function updateFangB59(e,dt){
  const q=e.b59,b=partnershipB59();
  if(q.phase==="stalk"){
    const a=Math.atan2(e.y-P.y,e.x-P.x)+dt*.6;
    moveBossToB59(e,P.x+Math.cos(a)*142,P.y+Math.sin(a)*142,110,dt);
    const target=b.lure?.boss===e?b.lure:P;
    q.angle=Math.atan2(target.y-e.y,target.x-e.x);
    if(q.timer<=0)bossPhaseB59(e,"locked",.6);
  }else if(q.phase==="locked"){
    if(q.timer<=0){q.moveX=Math.cos(q.angle)*355;q.moveY=Math.sin(q.angle)*355;bossPhaseB59(e,"pounce",.58);sfxEnemyAttack("charger")}
  }else if(q.phase==="pounce"){
    e.x+=q.moveX*dt;e.y+=q.moveY*dt;
    if(q.timer<=0){
      q.volley++;
      if(q.second&&q.volley===1)bossPhaseB59(e,"follow",.9);
      else bossRecoverB59(e,2.2);
    }
  }else if(q.phase==="follow"){
    q.angle=Math.atan2(P.y-e.y,P.x-e.x);
    if(q.timer<=0)bossPhaseB59(e,"locked",.5);
  }else if(q.phase==="recover"&&q.timer<=0)bossCycleB59(e);
  e.vx=q.phase==="pounce"?q.moveX:0;e.vy=q.phase==="pounce"?q.moveY:0;
}
function updateBloomB59(e,dt){
  const q=e.b59;
  if(q.phase==="track"||q.phase==="reverse"){
    const a=Math.atan2(e.y-P.y,e.x-P.x);
    moveBossToB59(e,P.x+Math.cos(a)*175,P.y+Math.sin(a)*175,35,dt);
    if(q.cycle===0)q.gapAngle=Math.atan2(P.y-e.y,P.x-e.x);
    if(q.timer<=0)bossPhaseB59(e,"locked",.4);
  }else if(q.phase==="locked"&&q.timer<=0)fireBloomB59(e);
  else if(q.phase==="petals"&&q.timer<=0)bossRecoverB59(e,1.1);
  else if(q.phase==="recover"&&q.timer<=0)bossCycleB59(e);
}
const updateEnemyBeforeB59=updateEnemy;
updateEnemy=function(e,dt){
  if(e.type!=="boss"||!B59_BOSS_KEYS.includes(e.bossKey))return updateEnemyBeforeB59(e,dt);
  if(!liveB59()||e.dead)return;
  const q=initBossB59(e),x=e.x,y=e.y;
  // Phase two begins at an attack boundary, never midway through an announced attack.
  if(q.cycle===0&&q.phase==="track"&&q.timer===q.duration)q.second=e.hp<=e.maxHp*.5;
  q.timer-=dt;q.openTime=Math.max(0,q.openTime-dt);e.age+=dt;
  if(e.bossKey===1)updateGrumpB59(e,dt);
  else if(e.bossKey===5)updateFangB59(e,dt);
  else updateBloomB59(e,dt);
  if(pointSegmentDistanceB59(P.x,P.y,x,y,e.x,e.y)<P.r+e.r)hurt();
};
const startBossBattleBeforeB59=startBossBattle;
startBossBattle=function(){
  startBossBattleBeforeB59();
  const e=enemies.find(e=>e.type==="boss"&&!e.dead&&B59_BOSS_KEYS.includes(e.bossKey));if(!e)return;
  const a=Math.atan2(e.y-P.y,e.x-P.x),d=clamp(Math.min(W,H)*.36,125,185);
  e.x=P.x+Math.cos(a)*d;e.y=P.y+Math.sin(a)*d;initBossB59(e);
};
const killBossBeforeB59=killBoss;
killBoss=function(e){
  const b=partnershipB59();if(b.setup?.boss===e)b.setup=null;if(b.lure?.boss===e)b.lure=null;
  return killBossBeforeB59(e);
};
// Keep old telegraphs for regular chargers and the four unchanged bosses.
const drawThreatTelegraphsBeforeB59=drawThreatTelegraphsB50;
drawThreatTelegraphsB50=function(){
  const hidden=[];
  for(const e of enemies)if(e.b59){hidden.push([e,e.attackClock]);e.attackClock=1000}
  try{drawThreatTelegraphsBeforeB59()}finally{for(const [e,clock] of hidden)e.attackClock=clock}
  drawBossTelegraphsB59();
};
