// B74 Heartfield authority: value-aware drops, deterministic nodes and conserved lifetimes.
const B74_NODE_SCAN_SECONDS=.25;
const B74_MAX_NODES=24;
const B74_DROP_TABLES={
  chaser:[[.15,0],[.87,1],[.98,2],[1,3]],
  rich:[[.05,0],[.20,1],[.75,2],[1,3]]
};

function initHeartfieldB74(){
  if(!S)return null;
  S.b74={nodes:[],nextId:1,scan:0,scanWork:0,audioCd:0,lastStatus:'',mining:null};
  return S.b74;
}
function heartfieldB74(){return S.b74||initHeartfieldB74()}
function nextHeartfieldIdB74(){return heartfieldB74().nextId++}
function rollHeartValueB74(type,roll=rnd()){
  const table=type==='charger'||type==='core'?B74_DROP_TABLES.rich:B74_DROP_TABLES.chaser;
  return table.find(([limit])=>roll<limit)?.[1]??3;
}
function makeHeartSourceB74(value,x,y,life=11,boss=false){
  value=Math.max(0,Math.floor(value));
  return {x,y,vx:rr(-52,52),vy:rr(-52,52),r:7,life,bob:rr(0,6.28),dead:!value,
    b74Id:nextHeartfieldIdB74(),b74Lives:Array.from({length:value},()=>life),b74Age:0,b74Boss:boss,b74NodeId:0};
}
function ensureHeartSourceB74(h){
  if(!h)return h;
  if(!Number.isFinite(h.b74Id))h.b74Id=nextHeartfieldIdB74();
  if(!Array.isArray(h.b74Lives))h.b74Lives=[Math.max(0,Number(h.life)||0)];
  if(!Number.isFinite(h.b74Age))h.b74Age=0;
  if(!Number.isFinite(h.b74NodeId))h.b74NodeId=0;
  return h;
}
function heartValueB74(source){return source?.b74Node?source.lives.length:ensureHeartSourceB74(source)?.b74Lives.length||0}
function heartLivesB74(source){return source?.b74Node?source.lives:ensureHeartSourceB74(source)?.b74Lives||[]}
function heartMinLifeB74(source){const lives=heartLivesB74(source);return lives.length?Math.min(...lives):0}
function looseHeartValueB74(){return heartBits.reduce((n,h)=>n+heartValueB74(h),0)}
function nodeHeartValueB74(){return heartfieldB74().nodes.reduce((n,node)=>n+heartValueB74(node),0)}
function cargoHeartValueB74(){return transportB60().cargo.reduce((n,h)=>n+Math.max(1,heartValueB74(h)),0)}
function totalFieldValueB74(){return looseHeartValueB74()+nodeHeartValueB74()+cargoHeartValueB74()}
function nodeByIdB74(id){return heartfieldB74().nodes.find(node=>node.id===id)}
function nodeInboundValueB74(node){return heartBits.reduce((n,h)=>n+(h.b74NodeId===node.id?heartValueB74(h):0),0)}
function sourcePositionB74(source){return {x:source.x,y:source.y}}
function sourceAliveB74(source){
  if(!source||source.dead||heartValueB74(source)<=0)return false;
  return source.b74Node?heartfieldB74().nodes.includes(source):heartBits.includes(source)&&!source.b74NodeId&&source.life>0;
}

const dropHeartBitsBeforeB74=dropHeartBits;
dropHeartBits=function(e){
  const value=rollHeartValueB74(e.type);
  if(value)heartBits.push(makeHeartSourceB74(value,e.x+rr(-11,11),e.y+rr(-11,11),11,false));
};
const killBossBeforeB74=killBoss;
killBoss=function(e){
  const before=new Set(heartBits),result=killBossBeforeB74(e);
  for(const h of heartBits)if(!before.has(h)){ensureHeartSourceB74(h);h.b74Boss=true}
  return result;
};

function eligibleNodeSourceB74(h){
  ensureHeartSourceB74(h);
  return !h.dead&&!h.b74Boss&&!h.b67SafeDrop&&!h.b74NodeId&&heartValueB74(h)>0&&h.b74Age>=settingsB74.settle;
}
function assignSourceToNodeB74(source,node){source.b74NodeId=node.id;source.vx=0;source.vy=0}
function spatialGridB74(items,size=settingsB74.radius){
  const grid=new Map();for(const item of items){const key=`${Math.floor(item.x/size)},${Math.floor(item.y/size)}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(item)}return grid;
}
function nearbyGridB74(grid,x,y,size=settingsB74.radius){
  const cx=Math.floor(x/size),cy=Math.floor(y/size),items=[];
  for(let ix=cx-1;ix<=cx+1;ix++)for(let iy=cy-1;iy<=cy+1;iy++)items.push(...(grid.get(`${ix},${iy}`)||[]));
  return items;
}
function scanHeartNodesB74(){
  const state=heartfieldB74(),radius=settingsB74.radius,cap=settingsB74.cap;
  const sources=heartBits.filter(eligibleNodeSourceB74).sort((a,b)=>a.b74Id-b.b74Id);
  const nodes=state.nodes.filter(n=>heartValueB74(n)>0||nodeInboundValueB74(n)>0).sort((a,b)=>a.id-b.id);
  const nodeGrid=spatialGridB74(nodes,radius),inbound=new Map(nodes.map(node=>[node.id,nodeInboundValueB74(node)]));state.scanWork=0;
  for(const source of sources){
    let best=null,bestD=Infinity;
    for(const node of nearbyGridB74(nodeGrid,source.x,source.y,radius)){
      state.scanWork++;const free=cap-heartValueB74(node)-(inbound.get(node.id)||0);if(free<=0)continue;
      const d=hyp(source.x-node.x,source.y-node.y);if(d<=radius&&(d<bestD||(d===bestD&&node.id<best.id))){best=node;bestD=d}
    }
    if(best){assignSourceToNodeB74(source,best);inbound.set(best.id,(inbound.get(best.id)||0)+heartValueB74(source))}
  }
  while(state.nodes.length<B74_MAX_NODES){
    const freeSources=heartBits.filter(eligibleNodeSourceB74);if(!freeSources.length)break;
    const sourceGrid=spatialGridB74(freeSources,radius);let choice=null;
    for(const seed of freeSources){
      if(state.nodes.some(node=>hyp(seed.x-node.x,seed.y-node.y)<70))continue;
      const nearby=nearbyGridB74(sourceGrid,seed.x,seed.y,radius).filter(h=>{state.scanWork++;return hyp(h.x-seed.x,h.y-seed.y)<=radius}).sort((a,b)=>a.b74Id-b.b74Id);
      const value=nearby.reduce((n,h)=>n+heartValueB74(h),0);
      if(value>=3&&(!choice||value>choice.value||(value===choice.value&&seed.b74Id<choice.seed.b74Id)))choice={seed,nearby,value};
    }
    if(!choice)break;
    const node={b74Node:true,id:nextHeartfieldIdB74(),x:choice.seed.x,y:choice.seed.y,lives:[],flash:0,sparkle:3+(choice.seed.b74Id%9)/4};
    state.nodes.push(node);nodes.push(node);
    let reserved=0;
    for(const source of choice.nearby){if(reserved>=cap)break;assignSourceToNodeB74(source,node);reserved+=heartValueB74(source)}
  }
}
function transferIntoNodeB74(source,node){
  const free=Math.max(0,settingsB74.cap-heartValueB74(node));if(!free){source.b74NodeId=0;return 0}
  source.b74Lives.sort((a,b)=>a-b);const moved=source.b74Lives.splice(0,free);node.lives.push(...moved);node.lives.sort((a,b)=>a-b);
  source.b74NodeId=0;source.life=source.b74Lives.length?Math.max(...source.b74Lives):0;
  if(!source.b74Lives.length)source.dead=true;
  if(moved.length)sfxHeartfieldB74('form',moved.length);
  return moved.length;
}
function updateNodeSpiralsB74(dt){
  const gravity=S.over>0&&S.overType==='gravity',speed=(gravity?1.5:1)*180;
  for(const h of heartBits){
    if(!h.b74NodeId)continue;const node=nodeByIdB74(h.b74NodeId);
    if(!node){h.b74NodeId=0;continue}
    const dx=node.x-h.x,dy=node.y-h.y,d=hyp(dx,dy)||1;
    if(d<=6){transferIntoNodeB74(h,node);continue}
    const radial=Math.min(d,speed*(.45+(1-Math.min(1,d/settingsB74.radius))*.9)*dt),twist=Math.min(.32,radial/d*.75);
    h.x+=dx/d*radial+(-dy/d)*radial*twist;h.y+=dy/d*radial+(dx/d)*radial*twist;
  }
}
function updateHeartLifetimesB74(dt){
  for(const h of heartBits){
    ensureHeartSourceB74(h);h.b74Age+=dt;
    if(!(h.b67SafeDrop&&supportEmergencyB63()))h.b74Lives=h.b74Lives.map(l=>l-dt).filter(l=>l>0);
    h.life=h.b74Lives.length?Math.max(...h.b74Lives):0;if(!h.b74Lives.length)h.dead=true;
  }
  const state=heartfieldB74();
  for(const node of state.nodes){
    node.lives=node.lives.map(l=>l-dt).filter(l=>l>0);node.flash=Math.max(0,node.flash-dt);
    if(heartValueB74(node)>=settingsB74.cap){node.sparkle-=dt;if(node.sparkle<=0){node.flash=.45;node.sparkle=3+(node.id%9)/4}}
    else node.sparkle=3+(node.id%9)/4;
  }
  heartBits=heartBits.filter(h=>!h.dead&&heartValueB74(h)>0);
  state.nodes=state.nodes.filter(node=>heartValueB74(node)>0||nodeInboundValueB74(node)>0);
}

function scheduleHeartfieldAudioB74(engine,t,kind,value=1){
  if(kind==='form')engine.voice(310+Math.min(160,value*18),t,.16,.012,'sine',0,1800,.01,.10,-5,engine.sfx);
  else if(kind==='mine')engine.fmBell(680+Math.min(260,value*32),t,.09,.011,.12,engine.sfx);
  else [72,76,79].slice(0,Math.min(3,Math.max(1,value))).forEach((note,i)=>engine.fmBell(MIDI_FREQ(note),t+i*.035,.18,.018,(i-1)*.12,engine.sfx));
}
function sfxHeartfieldB74(kind,value=1){
  const state=heartfieldB74();if(!ensureAudio()||state.audioCd>0)return;
  scheduleHeartfieldAudioB74(audioEngine,audioCtx.currentTime,kind,value);
  state.audioCd=kind==='mine'?.25:.12;
}

const resetBeforeB74Core=reset;
reset=function(){resetBeforeB74Core();initHeartfieldB74()};
initHeartfieldB74();
