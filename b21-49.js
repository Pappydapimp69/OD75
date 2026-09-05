// B60 Heart transport: inventory is credited at reunion, never at remote pickup.
const B60_HEART_WEIGHT=3;
function transportB60(){return S.b60||(S.b60={cargo:[],relayCd:0,rest:0})}
function cargoWeightB60(){return transportB60().cargo.length*B60_HEART_WEIGHT}
function carrySpeedB60(){return S.pipMoveSpeed*(1-.5*clamp(cargoWeightB60()/S.pipCarryCapacity,0,1))}
function heartRangeB60(lv){return Math.min(200,82+Math.min(10,lv)*8+Math.max(0,lv-10)*2)}
function nextCargoTargetB60(){
  if(cargoWeightB60()>=S.pipCarryCapacity)return null;
  let best=null,distance=S.pipDetectRange;
  for(const h of heartBits){
    if(h.dead||h.life<=0||h.b60Carried)continue;
    const d=hyp(h.x-P.pipX,h.y-P.pipY);
    if(d<distance){best=h;distance=d}
  }
  return best;
}
function gatherHeartB60(h){
  if(!h||h.dead||h.life<=0||h.b60Carried||S.pipState==="return"||cargoWeightB60()>=S.pipCarryCapacity)return false;
  h.b60Carried=true;h.vx=0;h.vy=0;transportB60().cargo.push(h);
  heartBits=heartBits.filter(item=>item!==h);
  sfxPipCue("heart");
  S.pipTarget=nextCargoTargetB60();S.pipState=S.pipTarget?"collect":"return";
  return true;
}
function deliverCargoB60(combat=true){
  const state=transportB60(),cargo=state.cargo.splice(0);
  for(const h of cargo){h.b60Carried=false;h.x=P.x;h.y=P.y;collectHeartBit(h)}
  if(!cargo.length)return 0;
  if(combat){
    const lv=bossPowerLevel("relay");
    if(lv>0&&state.relayCd<=0){
      S.pipRelayBuff=.5+Math.max(0,lv-1)*.1;state.relayCd=8;
      popup(P.x,P.y-18,"HEART RELAY","#ffd36f",true,.5);ring(P.x,P.y,"#ffd36f",72);
    }
    if(S.pipLove>=2)lovePulse(P.pipX,P.pipY);
  }
  return cargo.length;
}
function reunitePipB60(){
  S.pipState="orbit";S.pipTarget=null;S.b51PipBond=1;
  const count=deliverCargoB60();transportB60().rest=.25;
  warmReturnVolley();
  sfxPipCue("return");
  if(S.pipCompassion>=2){S.invuln=Math.max(S.invuln,.55+Math.min(.55,(S.pipCompassion-2)*.12));ring(P.x,P.y,"#7ed8ff",58)}
  S.lovePulsePending=0;
  if(count)showPipMessage(`${count} heart${count===1?"":"s"} delivered. thanks for meeting me ✦`);
}
function flyPipB60(x,y,dt){
  const dx=x-P.pipX,dy=y-P.pipY,d=hyp(dx,dy),step=Math.min(d,carrySpeedB60()*dt);
  if(d>0){P.pipX+=dx/d*step;P.pipY+=dy/d*step}
}
function updatePipTransportB60(dt){
  const state=transportB60();state.relayCd=Math.max(0,state.relayCd-dt);state.rest=Math.max(0,state.rest-dt);
  // The player may meet a loaded Pip at any point, including while he is gathering.
  if(S.pipState!=="orbit"&&state.cargo.length&&hyp(P.pipX-P.x,P.pipY-P.y)<=30){reunitePipB60();return}
  if(S.pipState==="orbit"){
    const orbit=pipOrbitPoint();flyPipB60(orbit.x,orbit.y,dt);
    if(state.rest>0)return;
    const target=findPipHeartTarget();
    if(target){S.pipTarget=target;S.pipState="collect";sfxPipCue("depart")}
    return;
  }
  if(S.pipState==="collect"){
    let h=S.pipTarget;
    if(!h||h.dead||h.life<=0||h.b60Carried)h=S.pipTarget=nextCargoTargetB60();
    if(!h||cargoWeightB60()>=S.pipCarryCapacity){S.pipTarget=null;S.pipState="return";return}
    flyPipB60(h.x,h.y,dt);
    if(hyp(h.x-P.pipX,h.y-P.pipY)<=12)gatherHeartB60(h);
    return;
  }
  // Return follows the player, independent of a boss lure's orbit point.
  flyPipB60(P.x,P.y,dt);
  if(hyp(P.pipX-P.x,P.pipY-P.y)<=30)reunitePipB60();
}
const resetBeforeB60=reset;
reset=function(){resetBeforeB60();S.b60={cargo:[],relayCd:0,rest:0};applyPipPower()};
const openStageUpgradeBeforeB60=openStageUpgrade;
openStageUpgrade=function(){deliverCargoB60(false);openStageUpgradeBeforeB60()};

// Ascension pulls ground hearts toward Pip, but still fills the same finite cargo.
updateAscendantHeartMagnetB26=function(dt){
  if(!liveB59()||S.over<=0||S.overType!=="pip"||S.pipState==="return"||transportB60().rest>0||S.b59?.rallyReturn)return;
  const lv=Math.max(1,overLevel("pip")),radius=170+lv*58+S.pipDetectRange*.72,pullSpeed=220+lv*92+S.pipMoveSpeed*.58;
  for(const h of [...heartBits]){
    if(S.pipState==="return"||cargoWeightB60()>=S.pipCarryCapacity)break;
    if(h.dead||h.life<=0||h.b60Carried)continue;
    const dx=P.pipX-h.x,dy=P.pipY-h.y,d=hyp(dx,dy);
    if(d>radius)continue;
    if(d<=13){gatherHeartB60(h);continue}
    const step=Math.min(d,pullSpeed*(.45+(1-d/radius)*.95)*dt);
    h.x+=dx/d*step;h.y+=dy/d*step;h.vx*=.72;h.vy*=.72;
  }
};

PIP_ABILITY_INFO.range.desc="+8px sense per level through Lv 10, then +2px (200px cap). +2 carry capacity each level; hearts weigh 3.";
PIP_ABILITY_INFO.speed.desc="+34 flight speed per level. Full cargo reduces Pip's flight speed by 50%.";
const pipAbilityEffectTextBeforeB60=pipAbilityEffectText;
pipAbilityEffectText=function(kind){
  if(kind==="range")return `${Math.round(S.pipDetectRange)} → ${heartRangeB60((S.pipRangeLv||0)+1)}px sense · ${S.pipCarryCapacity} → ${S.pipCarryCapacity+2} capacity. Range growth slows after Lv 10.`;
  if(kind==="speed")return `${S.pipMoveSpeed} → ${S.pipMoveSpeed+34} flight speed · ${(S.pipMoveSpeed+34)/2} at full load`;
  return pipAbilityEffectTextBeforeB60(kind);
};
const renderEmotionButtonsBeforeB60=renderEmotionButtons;
renderEmotionButtons=function(){
  renderEmotionButtonsBeforeB60();$("skipPipUpgrade").textContent="Continue to Heart upgrades";
  const p=$("emotionStep").querySelector("p");
  if(p)p.textContent=`◆ ${Math.max(0,S.prismSeeds||0)} Prism Seeds available · Spend as many as you like, then Continue.`;
};
const renderAscendedPauseBeforeB60=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  renderAscendedPauseBeforeB60();const core=$("b39CoreList");if(!core)return;
  core.insertAdjacentHTML("beforeend",rowB39("Heart transport",`${Math.round(S.pipDetectRange)}px sense · ${cargoWeightB60()}/${S.pipCarryCapacity} weight. Hearts weigh 3. Meet Pip within 30px to bank his cargo; a full load halves flight speed.`,"CARGO"));
};
const drawBeforeB60=draw;
draw=function(){
  drawBeforeB60();if(!S?.run||S.end||S.waveState==="stage"||!S.b60?.cargo.length)return;
  const cargo=S.b60.cargo,px=worldToScreenX(P.pipX),py=worldToScreenY(P.pipY);
  X.save();X.fillStyle="#ffb3c7";X.font="bold 13px system-ui";X.textAlign="center";X.shadowColor="#090d19";X.shadowBlur=5;
  for(let i=0;i<Math.min(18,cargo.length);i++){
    const a=i*2.399+S.t*.65,r=19+Math.sqrt(i)*5;
    X.fillText("♥",px+Math.cos(a)*r,py+Math.sin(a)*r+Math.sin(S.t*3+i)*3);
  }
  X.font="bold 10px system-ui";
  const label=`${S.pipState==="return"?"RETURN":"GATHER"} ${cargoWeightB60()}/${S.pipCarryCapacity}`;
  X.fillText(label,clamp(px,60,W-60),clamp(py+48,108,H-40));X.restore();
};
if(S){transportB60();applyPipPower()}
