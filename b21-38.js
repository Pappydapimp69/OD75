// B51 Pip bond meter: replace B49 arena clutter with one heart-state signal and a 1s decay/recovery model.
const B51_PIP_BOND_SECONDS=1.0;
const B51_PIP_BOND_EPS=.001;

function pipBondB51(){return clamp(Number.isFinite(S?.b51PipBond)?S.b51PipBond:1,0,1)}
function pipBondVisualB51(){return clamp(Number.isFinite(S?.b51PipBondVisual)?S.b51PipBondVisual:pipBondB51(),0,1)}

// B49's tether, labels, rings and return text are intentionally retired.
drawPipPresenceB49=function(){};

// Existing Pip-gated mechanics stay available through the decay window and shut off at zero.
pipWithPlayer=function(){return !!S&&pipBondB51()>B51_PIP_BOND_EPS};

const updateBeforeB51=update;
update=function(dt){
  updateBeforeB51(dt);
  if(!S)return;
  const step=Math.max(0,dt||0)/B51_PIP_BOND_SECONDS;
  if(S.pipState==="orbit"){
    // Mechanical benefits return immediately; the heart refills visually over one second.
    S.b51PipBond=1;
    S.b51PipBondVisual=Math.min(1,(Number.isFinite(S.b51PipBondVisual)?S.b51PipBondVisual:1)+step);
  }else{
    S.b51PipBond=Math.max(0,(Number.isFinite(S.b51PipBond)?S.b51PipBond:1)-step);
    S.b51PipBondVisual=S.b51PipBond;
  }
};

const resetBeforeB51=reset;
reset=function(){
  resetBeforeB51();
  S.b51PipBond=1;
  S.b51PipBondVisual=1;
};
if(S){S.b51PipBond=1;S.b51PipBondVisual=1}

// Fade the player's main Pip-derived weapon scaling continuously with bond strength.
const attackBeforeB51=attack;
attack=function(){
  if(!S)return attackBeforeB51();
  const b=pipBondB51();
  if(b>=.999)return attackBeforeB51();
  const saved={attackRange:S.attackRange,weaponPower:S.weaponPower,projectileSize:S.projectileSize,supportPower:S.supportPower,attackMax:S.attackMax};
  const baseRange=Math.min(270,Math.max(185,Math.min(W,H)*.55));
  S.attackRange=baseRange+(saved.attackRange-baseRange)*b;
  S.weaponPower=1+(saved.weaponPower-1)*b;
  S.projectileSize=6+(saved.projectileSize-6)*b;
  S.supportPower=1+(saved.supportPower-1)*b;
  S.attackMax=.33+(saved.attackMax-.33)*b;
  try{return attackBeforeB51()}finally{Object.assign(S,saved)}
};

// Autonomous Pip shots also lose power smoothly while the bond drains.
const updatePipCombatBeforeB51=updatePipCombat;
updatePipCombat=function(dt){
  const start=shots.length,b=pipBondB51();
  updatePipCombatBeforeB51(dt);
  if(b>=.999)return;
  for(let i=start;i<shots.length;i++)if(shots[i]?.source==="pip")shots[i].power*=b;
};

function heartPathB51(ctx,x,y,size){
  const s=size/18;
  ctx.beginPath();
  ctx.moveTo(x,y+7*s);
  ctx.bezierCurveTo(x-15*s,y-2*s,x-9*s,y-12*s,x-3*s,y-9*s);
  ctx.bezierCurveTo(x,y-7*s,x,y-4*s,x,y-3*s);
  ctx.bezierCurveTo(x,y-4*s,x,y-7*s,x+3*s,y-9*s);
  ctx.bezierCurveTo(x+9*s,y-12*s,x+15*s,y-2*s,x,y+7*s);
  ctx.closePath();
}
function drawPipBondHeartB51(){
  if(!S?.run||S.end||S.waveState==="stage"||!P)return;
  const visual=pipBondVisualB51();
  const a=(P.pipAngle||0)+Math.PI*.72,r=22;
  const x=worldToScreenX(P.x+Math.cos(a)*r),y=worldToScreenY(P.y+Math.sin(a)*r);
  const size=17;
  X.save();
  X.lineJoin="round";
  X.shadowColor="#000";X.shadowBlur=7;
  heartPathB51(X,x,y,size);
  X.lineWidth=2.2;X.strokeStyle="#ffb3c7";X.globalAlpha=.95;X.stroke();
  if(visual>B51_PIP_BOND_EPS){
    X.save();
    heartPathB51(X,x,y,size);X.clip();
    const top=y-size*.58,bottom=y+size*.48,h=(bottom-top)*visual;
    X.fillStyle="#ff9fba";X.globalAlpha=.92;
    X.fillRect(x-size, bottom-h, size*2, h);
    X.restore();
  }
  X.restore();
}

const drawBeforeB51=draw;
draw=function(){drawBeforeB51();drawPipBondHeartB51()};
