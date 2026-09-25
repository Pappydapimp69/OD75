
// B99 Variable enemies. Hearts banked by the end of each stage set a heart level that widens the
// speed and health ranges; every enemy rolls its own values inside them. Aggression is stage-based:
// its minimum climbs by a random 1-3 every three stages, with no cap, while its effect on wind-ups,
// charges and shots grows slowly with diminishing returns. Run stars unlock the roster the way they
// unlock bosses, stages one to three stay chasers-only, and spawn pacing follows each enemy's speed.
// Three new enemies: Sniper, Splitter and Thief. Bosses keep their own track: heart level adds health,
// run stars quicken their rhythm, and later bosses add a ring volley.
const B99_HEARTS_PER_LEVEL=20;
const B99_UNLOCKS=Object.freeze([
  {type:'charger',stars:6,weight:.45,name:'Charger',hint:'it winds up, then dashes in a straight line. step aside!'},
  {type:'core',stars:14,weight:.35,name:'Core',hint:'pop it and it takes its friends with it.'},
  {type:'sniper',stars:25,weight:.30,name:'Sniper',hint:'it keeps its distance and aims. watch the line, then move.'},
  {type:'splitter',stars:38,weight:.35,name:'Splitter',hint:'it breaks into two little ones when it pops.'},
  {type:'thief',stars:52,weight:.20,name:'Thief',hint:'it wants my hearts! catch it and it drops them.'}
]);
const B99_BASE={
  chaser:{hp:2,speed:[58,82],gap:1},
  charger:{hp:3,speed:[0,0],gap:1.1},
  core:{hp:1,speed:[30,46],gap:.9},
  sniper:{hp:2,speed:[44,58],gap:1.2,r:13},
  splitter:{hp:3,speed:[50,64],gap:1.2,r:16},
  thief:{hp:2,speed:[92,112],gap:1.3,r:11}
};
const B99_SPAWN_GAP=.7;
const B99_CAP={landscape:10,portrait:8};
const B99_MAX_ELITES=2;
COLORS.sniper='#7be0ae';COLORS.splitter='#ff9f6f';COLORS.thief='#9fd3ff';

function stateB99(){return S.b99||(S.b99={heartLevel:0,aggMin:1,bumpPending:false,bossSeen:0,unlockStage:{},introduced:{}})}
function effectiveHeartLevelB99(level=stateB99().heartLevel){return level<=8?level:8+(level-8)/2}
function traitRangesB99(level=stateB99().heartLevel){
  const L=effectiveHeartLevelB99(level);
  return {speed:[1+.03*L,1.1+.06*L],hp:[.35*L,.7*L]};
}
function aggressionRangeB99(){const min=stateB99().aggMin;return [min,min+3]}
function aggressionEffectB99(agg){return 1-1/(1+.06*Math.max(0,agg-1))}
function snapshotStageB99(){
  const st=stateB99(),bossStage=(S.bossCount||0)>st.bossSeen;st.bossSeen=S.bossCount||0;
  // Breather: the stage after a boss holds every range where it was.
  if(bossStage){if(S.stage>1&&(S.stage-1)%3===0)st.bumpPending=true;return}
  st.heartLevel=Math.floor((S.runHearts||0)/B99_HEARTS_PER_LEVEL);
  if((S.stage>1&&(S.stage-1)%3===0)||st.bumpPending){st.aggMin+=1+Math.floor(rnd()*3);st.bumpPending=false}
}
function unlockedTypesB99(){
  if(S.stage<=3)return ['chaser'];
  const st=stateB99(),out=['chaser'];
  for(const u of B99_UNLOCKS)if((S.starsTotal||0)>=u.stars){if(st.unlockStage[u.type]==null)st.unlockStage[u.type]=S.stage;out.push(u.type)}
  return out;
}
function rosterWeightsB99(){
  const st=stateB99(),types=unlockedTypesB99(),w={chaser:1};
  for(const u of B99_UNLOCKS){if(!types.includes(u.type))continue;const age=Math.max(0,S.stage-(st.unlockStage[u.type]??S.stage));w[u.type]=u.weight*Math.min(1,(age+1)/3)}
  return w;
}
function aliveOfB99(type){let n=0;for(const e of enemies)if(!e.dead&&e.type===type)n++;return n}
function chooseTypeB99(){
  const w=rosterWeightsB99();
  if(aliveOfB99('thief')>=1)delete w.thief;
  if(aliveOfB99('sniper')>=3)delete w.sniper;
  let total=0;for(const k in w)total+=w[k];let r=rnd()*total;
  for(const k in w){if((r-=w[k])<=0)return k}
  return 'chaser';
}
function rollEnemyB99(e){
  const base=B99_BASE[e.type]||B99_BASE.chaser,range=traitRangesB99(),[amin,amax]=aggressionRangeB99();
  let elites=0;for(const o of enemies)if(!o.dead&&o!==e&&(o.b99?.quality||0)>.75)elites++;
  let ts=rnd()**1.6,th=rnd()**1.6;if(elites>=B99_MAX_ELITES){ts*=.5;th*=.5}
  const speedMul=range.speed[0]+(range.speed[1]-range.speed[0])*ts;
  const hp=Math.max(1,Math.round(base.hp+range.hp[0]+(range.hp[1]-range.hp[0])*th));
  const agg=amin+Math.floor(rnd()*(amax-amin+1)),aggE=aggressionEffectB99(agg);
  const quality=(ts+th)/2;
  e.b99={speedMul,agg,aggE,quality,baseHp:base.hp};
  e.hp=hp;e.maxHp=hp;
  if(e.type==='charger'){e.aim=Math.max(.3,(e.aim||.8)*(1-.5*aggE));}
  else e.speed=rr(base.speed[0],base.speed[1])*speedMul*(1+.15*aggE);
  if(base.r)e.r=base.r;
  e.r+=Math.round(3*th);
  if(e.type==='sniper'){e.b99Fire=rr(1.2,2.2);e.b99Aim=0;e.b99Side=rnd()<.5?-1:1}
  if(e.type==='thief'){e.b99Stolen=null}
  return e;
}
function spawnGapB99(e){
  const base=B99_BASE[e.type]||B99_BASE.chaser,q=e.b99;
  return clamp(B99_SPAWN_GAP*base.gap*q.speedMul*(.75+.25*e.hp/base.hp)*rr(.9,1.1),.3,1.8);
}
function introduceB99(type){
  const st=stateB99();if(type==='chaser'||st.introduced[type])return;st.introduced[type]=true;
  const u=B99_UNLOCKS.find(x=>x.type===type);if(!u)return;
  announce(`NEW ENEMY · ${u.name.toUpperCase()}`,1100);showPipMessage(u.hint,true);
}

difficulty=function(){return 1};
enemyCap=function(){return H>W?B99_CAP.portrait:B99_CAP.landscape};
chooseSpawn=function(){return chooseTypeB99()};
const spawnEnemyBeforeB99=spawnEnemy;
spawnEnemy=function(type){
  const custom=type==='sniper'||type==='splitter'||type==='thief',before=enemies.length;
  spawnEnemyBeforeB99(custom?'chaser':type);
  if(enemies.length<=before)return null;
  const e=enemies[enemies.length-1];
  if(custom){e.type=type;e.state=undefined}
  rollEnemyB99(e);introduceB99(type);
  return e;
};
spawnLogic=function(dt){
  if(S.waveState!=='active'||S.bossActive||S.waveKills>=S.waveGoal)return;
  S.spawn-=dt;if(S.spawn>0)return;
  const alive=enemies.filter(e=>!e.dead).length;
  if(alive>=enemyCap()){S.spawn=.2;return}
  const e=spawnEnemy(chooseSpawn());
  S.spawn=e?spawnGapB99(e):.3;
};

function shootSniperB99(e){
  const a=e.b99AimAngle,speed=250;
  enemyShots.push({x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:5,life:3.2,c:'#7be0ae'});
  ring(e.x,e.y,'#7be0ae',26);tone(880,.05,.018,'square');
}
function updateSniperB99(e,dt){
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1,want=260,q=e.b99;
  const mv=d>want+40?1:d<want-40?-1:0,s=e.speed;
  e.x+=(dx/d*mv*s-dy/d*e.b99Side*s*.45)*dt;e.y+=(dy/d*mv*s+dx/d*e.b99Side*s*.45)*dt;
  if(rnd()<dt*.25)e.b99Side*=-1;
  if(e.b99Aim>0){
    if(e.b99Aim>.2)e.b99AimAngle=Math.atan2(dy,dx);
    e.b99Aim-=dt;if(e.b99Aim<=0)shootSniperB99(e);
    return;
  }
  e.b99Fire-=dt;
  if(e.b99Fire<=0&&d<560&&worldVisible(e.x,e.y,0)){
    e.b99Aim=Math.max(.45,.8*(1-.3*q.aggE));e.b99AimAngle=Math.atan2(dy,dx);
    e.b99Fire=2.8*(1-.45*q.aggE)*rr(.9,1.1);
  }
}
function stealHeartB99(e,source,fromCargo){
  let heart=source;
  ensureHeartSourceB74(source);
  if(source.b74Lives.length>1){const life=source.b74Lives.pop();heart=makeHeartSourceB74(1,e.x,e.y,Math.max(1,life),false)}
  else if(fromCargo){const cargo=transportB60().cargo,i=cargo.indexOf(source);if(i>=0)cargo.splice(i,1)}
  else heartBits=heartBits.filter(h=>h!==source);
  heart.b60Carried=false;heart.b74NodeId=0;e.b99Stolen=heart;
  popup(e.x,e.y-16,'♥ STOLEN','#9fd3ff',true,.9);tone(300,.08,.02,'sawtooth');
  if(fromCargo)showPipMessage('hey! it took one of my hearts!',true);
}
function updateThiefB99(e,dt){
  const s=e.speed;
  if(e.b99Stolen){
    const dx=e.x-P.x,dy=e.y-P.y,d=hyp(dx,dy)||1;e.x+=dx/d*s*1.15*dt;e.y+=dy/d*s*1.15*dt;
    if(d>680){e.dead=true;e.b99Escaped=true;announce('THIEF ESCAPED',700)}
    return;
  }
  const cargo=transportB60().cargo;let tx=P.x,ty=P.y,grab=null,fromCargo=false;
  if(cargo.length){tx=P.pipX;ty=P.pipY;grab=cargo[cargo.length-1];fromCargo=true}
  else{let best=null,bd=360;for(const h of heartBits){if(h.dead||h.b60Carried)continue;const hd=hyp(h.x-e.x,h.y-e.y);if(hd<bd){bd=hd;best=h}}if(best){tx=best.x;ty=best.y;grab=best}}
  const dx=tx-e.x,dy=ty-e.y,d=hyp(dx,dy)||1;e.x+=dx/d*s*dt;e.y+=dy/d*s*dt;
  if(grab&&d<e.r+10)stealHeartB99(e,grab,fromCargo);
}
function updateSplitterB99(e,dt){const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1;e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}

const updateEnemyBeforeB99=updateEnemy;
updateEnemy=function(e,dt){
  if(!e||e.dead||!liveB59()||!Number.isFinite(dt)||dt<=0)return updateEnemyBeforeB99(e,dt);
  if(e.type==='boss')return updateEnemyBeforeB99(e,dt*bossTempoB99());
  if(e.type==='sniper')updateSniperB99(e,dt);
  else if(e.type==='thief')updateThiefB99(e,dt);
  else if(e.type==='splitter')updateSplitterB99(e,dt);
  const was=e.state;
  updateEnemyBeforeB99(e,dt);
  if(e.type==='charger'&&e.b99){
    if(was==='aim'&&e.state==='charge'){const m=Math.sqrt(e.b99.speedMul)*(1+.4*e.b99.aggE);e.vx*=m;e.vy*=m}
    else if(was==='charge'&&e.state==='aim')e.aim=Math.max(.3,e.aim*(1-.5*e.b99.aggE));
  }
};

const killBeforeB99=kill;
kill=function(e,chain=false){
  const was=!!e?.dead;killBeforeB99(e,chain);
  if(was||!e?.dead||e.b99Escaped)return;
  if(e.type==='splitter'&&!e.b99Small){
    for(const side of [-1,1]){
      const a=rr(0,Math.PI*2),baby={type:'chaser',x:e.x+Math.cos(a)*10*side,y:e.y+Math.sin(a)*10*side,r:9,hp:1,maxHp:1,speed:(e.speed||60)*1.15,dead:false,age:0,flash:.2,b99Small:true,b99:{speedMul:e.b99?.speedMul||1,agg:1,aggE:0,quality:0,baseHp:1}};
      enemies.push(baby);
    }
    ring(e.x,e.y,'#ff9f6f',40);
  }
  if(e.type==='thief'&&e.b99Stolen){
    const h=e.b99Stolen;e.b99Stolen=null;h.x=e.x;h.y=e.y;h.dead=false;h.vx=rr(-40,40);h.vy=rr(-40,40);
    ensureHeartSourceB74(h);h.b74Lives=h.b74Lives.map(()=>10);h.life=10;if(!heartBits.includes(h))heartBits.push(h);
    popup(e.x,e.y-16,'♥ RECOVERED','#ffb3c7',true,.9);
  }
};

// Bosses: heart level adds health; run stars quicken the rhythm; later bosses add a ring volley.
function bossTempoB99(){return 1+Math.min(.3,(S.starsTotal||0)*.004)}
const startBossBattleBeforeB99=startBossBattle;
startBossBattle=function(){
  startBossBattleBeforeB99();
  const boss=enemies.find(e=>e.type==='boss'&&!e.dead);if(!boss)return;
  const threat=1+(S.bossCount||0),hp=Math.round(54+effectiveHeartLevelB99()*9+threat*18);
  boss.hp=hp;boss.maxHp=hp;S.bossMaxHp=hp;boss.b99Ring=4;
};
function updateBossRingB99(dt){
  if((S.bossCount||0)<2||!S.bossActive)return;
  const boss=enemies.find(e=>e.type==='boss'&&!e.dead);if(!boss)return;
  boss.b99Ring=(boss.b99Ring??4)-dt*bossTempoB99();
  if(boss.b99Ring<=.5&&!boss.b99RingWarned){boss.b99RingWarned=true;ring(boss.x,boss.y,'#ffffff',70)}
  if(boss.b99Ring<=0){
    const n=8+Math.min(6,(S.bossCount||0)-2)*2;
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+boss.age*.3;enemyShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*125,vy:Math.sin(a)*125,r:5,life:4,c:'#ffd6f4'})}
    boss.b99Ring=Math.max(2.8,5-.4*((S.bossCount||0)-2));boss.b99RingWarned=false;
  }
}

const advanceBeforeB99=advanceToNextStage;
advanceToNextStage=function(){const before=S?.stage;const r=advanceBeforeB99.apply(this,arguments);if(S&&S.stage!==before)snapshotStageB99();return r};
const updateBeforeB99=update;
update=function(dt){updateBeforeB99(dt);if(S?.run&&!S.end&&!S.b39Paused)updateBossRingB99(dt)};

function drawEnemyTellsB99(){
  if(!S?.run||S.end)return;
  X.save();
  for(const e of enemies){
    if(e.dead||!e.b99||!worldVisible(e.x,e.y,60))continue;
    const sx=worldToScreenX(e.x),sy=worldToScreenY(e.y),q=e.b99.quality;
    if(q>.55){X.strokeStyle=q>.8?'#ffd36f':'#ffffffaa';X.lineWidth=q>.8?3:2;X.beginPath();X.arc(sx,sy,e.r+4,0,Math.PI*2);X.stroke()}
    if(e.type==='sniper'&&e.b99Aim>0){const a=e.b99AimAngle;X.strokeStyle='#7be0ae';X.globalAlpha=.35+.5*Math.sin(S.t*30)**2;X.lineWidth=2;X.setLineDash([10,6]);X.beginPath();X.moveTo(sx,sy);X.lineTo(sx+Math.cos(a)*620,sy+Math.sin(a)*620);X.stroke();X.setLineDash([]);X.globalAlpha=1}
    if(e.type==='sniper'){X.strokeStyle='#0d2a1e';X.lineWidth=2;X.beginPath();X.moveTo(sx-e.r+3,sy);X.lineTo(sx+e.r-3,sy);X.moveTo(sx,sy-e.r+3);X.lineTo(sx,sy+e.r-3);X.stroke()}
    if(e.type==='splitter'){X.strokeStyle='#5a2a14';X.lineWidth=2;X.beginPath();X.moveTo(sx,sy-e.r);X.lineTo(sx+3,sy-3);X.lineTo(sx-3,sy+3);X.lineTo(sx,sy+e.r);X.stroke()}
    if(e.type==='thief'){X.fillStyle='#0d1b2a';X.fillRect(sx-e.r+2,sy-4,e.r*2-4,4);if(e.b99Stolen){X.fillStyle='#ff9fba';X.font='bold 13px system-ui';X.textAlign='center';X.fillText('♥',sx,sy-e.r-6)}}
  }
  X.restore();
}
const drawBeforeB99=draw;
draw=function(){drawBeforeB99();drawEnemyTellsB99()};

const resetBeforeB99=reset;
reset=function(){resetBeforeB99();S.b99={heartLevel:0,aggMin:1,bumpPending:false,bossSeen:0,unlockStage:{},introduced:{}}};
if(S)S.b99={heartLevel:0,aggMin:1,bumpPending:false,bossSeen:0,unlockStage:{},introduced:{}};
