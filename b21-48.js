// B59 Presentation and final simulation guard. Load after partnership and boss modules.
function bossHintB59(e){
  const q=e.b59;
  if(q.phase==="recover")return "OPENING · move in";
  if(e.bossKey===1)return q.phase==="track"?"AIMING · bait the volley":q.phase==="locked"?"LOCKED · sidestep":"VOLLEY · keep moving";
  if(e.bossKey===5)return q.phase==="stalk"?"STALKING · watch Pip":q.phase==="follow"?"SECOND POUNCE · get ready":q.phase==="locked"?"LOCKED · leave the lane":"POUNCE";
  return q.phase==="reverse"?"PETALS REVERSE · find the gap":q.phase==="petals"?"PETALS · follow the gap":"PETALS FORMING · find the gap";
}
function screenLineB59(ax,ay,bx,by){
  X.beginPath();X.moveTo(worldToScreenX(ax),worldToScreenY(ay));X.lineTo(worldToScreenX(bx),worldToScreenY(by));X.stroke();
}
function drawBossTelegraphsB59(){
  if(!liveB59())return;
  X.save();X.lineCap="round";
  for(const e of enemies){
    if(e.dead||!e.b59)continue;
    const q=e.b59,x=worldToScreenX(e.x),y=worldToScreenY(e.y),locked=q.phase==="locked";
    if(q.phase==="recover"){
      X.globalAlpha=.7;X.strokeStyle="#7be0ae";X.lineWidth=2;X.setLineDash([3,6]);
      X.beginPath();X.arc(x,y,e.r+14,0,Math.PI*2);X.stroke();X.setLineDash([]);
      continue;
    }
    if(e.bossKey===1&&(q.phase==="track"||locked||q.phase==="volley")){
      X.strokeStyle=locked?"#fff0b8":"#ff8fcf";X.lineWidth=locked?2.8:1.6;X.globalAlpha=locked?.95:.5;
      if(!locked)X.setLineDash([6,5]);
      for(const off of [-.41,0,.41]){const a=q.angle+off;screenLineB59(e.x+Math.cos(a)*43,e.y+Math.sin(a)*43,e.x+Math.cos(a)*235,e.y+Math.sin(a)*235)}
      X.setLineDash([]);
      X.beginPath();X.arc(x,y,e.r+11,0,Math.PI*2*clamp(1-q.timer/q.duration,0,1));X.stroke();
    }else if(e.bossKey===5&&(locked||q.phase==="stalk"||q.phase==="follow"||q.phase==="pounce")){
      const start=q.phase==="pounce"?{x:q.fromX,y:q.fromY}:e;
      const end={x:start.x+Math.cos(q.angle)*206,y:start.y+Math.sin(q.angle)*206};
      X.strokeStyle=locked?"#ffdda5":"#ff859e";X.globalAlpha=locked?.16:.08;X.lineWidth=e.r*2;
      screenLineB59(start.x,start.y,end.x,end.y);
      X.globalAlpha=locked?.95:.55;X.lineWidth=locked?2.6:1.5;
      if(q.phase==="stalk"||q.phase==="follow")X.setLineDash([6,6]);
      screenLineB59(start.x,start.y,end.x,end.y);X.setLineDash([]);
    }else if(e.bossKey===7){
      const fired=q.phase==="petals",radius=fired?43+(q.second?155:135)*(q.duration-q.timer):88;
      X.strokeStyle=q.phase==="reverse"?"#fff0a8":"#c9a7ff";X.lineWidth=2;X.globalAlpha=fired?.3:.7;
      X.beginPath();X.arc(x,y,radius,q.gapAngle+.48,q.gapAngle+Math.PI*2-.48);X.stroke();
      X.strokeStyle="#89efc2";X.lineWidth=4;X.globalAlpha=.8;
      X.beginPath();X.arc(x,y,radius,q.gapAngle-.4,q.gapAngle+.4);X.stroke();
      if(!fired){
        for(let i=0;i<28;i++){const a=q.gapAngle+i*Math.PI*2/28;if(Math.abs(angleDeltaB59(a-q.gapAngle))<.48)continue;
          X.fillStyle="#d4bdff";X.globalAlpha=locked?.95:.5;X.beginPath();X.arc(x+Math.cos(a)*radius,y+Math.sin(a)*radius,2.8,0,Math.PI*2);X.fill()}
      }
      if(q.openTime>0){X.strokeStyle="#ffe39a";X.lineWidth=5;X.globalAlpha=.75;X.beginPath();X.arc(x,y,88,q.openAngle-.5,q.openAngle+.5);X.stroke()}
    }
  }
  X.restore();
}
function drawPartnershipB59(){
  if(!liveB59())return;
  const b=partnershipB59(),px=worldToScreenX(P.pipX),py=worldToScreenY(P.pipY);
  X.save();X.textAlign="center";X.textBaseline="middle";
  // Shape and color both identify the action; the heart remains the bond indicator.
  if(b.coverThreat&&coverAvailableB59()){
    X.strokeStyle=B59_TRAITS.compassion.color;X.globalAlpha=.85;X.lineWidth=2;
    const a=Math.atan2(b.coverThreat.y-P.y,b.coverThreat.x-P.x),x=worldToScreenX(P.x),y=worldToScreenY(P.y);
    X.beginPath();X.arc(x,y,23,a-.6,a+.6);X.stroke();
  }
  if(b.coverCd>0&&traitLevelB59("compassion")>0){
    X.strokeStyle="#9ee7ff";X.globalAlpha=.4;X.lineWidth=1.8;
    X.beginPath();X.arc(px,py,16,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-clamp(b.coverCd/cooldownB59("compassion"),0,1)));X.stroke();
  }
  if(b.actionTime>0){
    const kind=b.action,color=B59_TRAITS[kind].color;
    X.globalAlpha=clamp(b.actionTime*2,0,1);X.fillStyle=color;X.strokeStyle=color;X.lineWidth=2;
    const icon=kind==="love"?"♥":kind==="compassion"?"◇":"✦";
    X.font="900 17px system-ui";X.fillText(icon,px,py-23);
  }
  if(b.setup){
    const m=b.setup,x=worldToScreenX(m.x),y=worldToScreenY(m.y),r=m.r;
    X.globalAlpha=.98;X.fillStyle="#20180de0";X.strokeStyle="#ffe39a";X.lineWidth=2.5;
    X.beginPath();X.moveTo(x,y-r);X.lineTo(x+r,y);X.lineTo(x,y+r);X.lineTo(x-r,y);X.closePath();X.fill();X.stroke();
    X.fillStyle="#fff0b8";X.font="900 9px system-ui";X.fillText("DASH",x,y+r+12);
  }
  if(b.lure&&!b.lure.boss.dead&&["stalk","locked"].includes(b.lure.boss.b59.phase)){
    const x=worldToScreenX(b.lure.x),y=worldToScreenY(b.lure.y);
    X.globalAlpha=.8;X.strokeStyle="#ffe39a";X.lineWidth=2;X.setLineDash([3,4]);X.beginPath();X.arc(x,y,12,0,Math.PI*2);X.stroke();X.setLineDash([]);
  }
  if(b.grace>0){X.strokeStyle="#ffadc9";X.lineWidth=2;X.globalAlpha=.5;X.beginPath();X.arc(px,py,18,0,Math.PI*2);X.stroke()}
  if(S.over>0&&S.overType==="pip"&&b.ascTrait){
    X.strokeStyle=B59_TRAITS[b.ascTrait].color;X.globalAlpha=.65;X.lineWidth=2.5;
    const remaining=Math.min(1,(S.b58AscTime||0)/2),r=18+remaining*12;
    X.beginPath();X.arc(px,py,r,-Math.PI/2,-Math.PI/2+Math.PI*2*remaining);X.stroke();
  }
  if(b.reunion>0){X.globalAlpha=b.reunion;X.strokeStyle="#ffadc9";X.lineWidth=2;X.beginPath();X.arc(px,py,12+(1-b.reunion)*22,0,Math.PI*2);X.stroke()}
  X.restore();
}
const updateBeforeB59=update;
update=function(dt){
  // Older late wrappers also contain timers: freeze the entire chain at its entrance.
  if(!liveB59())return;
  dt=clamp(Number(dt)||0,0,.04);if(!dt)return;
  const b=partnershipB59(),x=P.x,y=P.y,dashing=S.dashTime>0,wasAsc=S.over>0&&S.overType==="pip";
  for(const key of ["rallyCd","coverCd","setupCd","quiet","grace","anchor","actionTime","reunion"]){
    const kind={rallyCd:"love",coverCd:"compassion",setupCd:"support"}[key];
    const rate=kind&&wasAsc&&b.ascTrait===kind?1.5:1;
    b[key]=Math.max(0,b[key]-dt*rate);
  }
  if(b.setup){
    b.setup.life-=dt;
    const m=b.setup,phase=m.boss.b59?.phase;
    if(m.life<=0||m.boss.dead||!enemies.includes(m.boss)||(m.kind==="strike"?phase!=="recover":phase!=="petals"))b.setup=null;
  }
  if(b.lure&&(b.lure.boss.dead||!enemies.includes(b.lure.boss)||!["stalk","locked","pounce","follow"].includes(b.lure.boss.b59.phase)))b.lure=null;
  b.coverThreat=coverAvailableB59()?incomingThreatB59():null;
  updateBeforeB59(dt);
  if(!liveB59()){b.setup=null;b.lure=null;return}
  if(b.grace>0){S.b51PipBond=1;S.b51PipBondVisual=1}
  consumeSetupB59(x,y,P.x,P.y,dashing||S.dashTime>0);
  if(wasAsc&&S.over<=0){b.reunion=.65;b.ascTrait="";b.ascEnding=false}
  else if(wasAsc&&(S.b58AscTime||0)<=2&&!b.ascEnding){b.ascEnding=true;sfxPipCue("return")}
};
const drawBeforeB59=draw;
draw=function(){drawBeforeB59();drawPartnershipB59()};
const updateUIBeforeB59=updateUI;
updateUI=function(){
  updateUIBeforeB59();
  const e=enemies.find(e=>!e.dead&&e.b59);
  if(e&&S.run)$("tip").textContent=`${bossHintB59(e)} · ${Math.max(0,Math.ceil(e.hp))} HP`;
};
const emotionalNextTextBeforeB59=emotionalNextText;
emotionalNextText=function(kind){
  const trait=B59_TRAITS[kind];
  return trait?`${trait.name.toUpperCase()} · ${trait.copy} ${traitLevelB59(kind)>0?"Next level improves its timing. ":""}${emotionalNextTextBeforeB59(kind)}`:emotionalNextTextBeforeB59(kind);
};
const renderAscendedPauseBeforeB59=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  renderAscendedPauseBeforeB59();
  const core=$("b39CoreList"),b=partnershipB59();if(!core||!b)return;
  for(const [key,trait] of Object.entries(B59_TRAITS)){
    const lv=traitLevelB59(key),cd=b[{love:"rallyCd",compassion:"coverCd",support:"setupCd"}[key]];
    core.insertAdjacentHTML("beforeend",rowB39(`${trait.name}${lv?` · Lv ${lv}`:""}`,lv?`${trait.copy} ${cd>0?`Ready in ${cd.toFixed(1)}s.`:"Ready when needed."}`:`Choose ${key==="love"?"Loving":key==="compassion"?"Compassionate":"Supportive"} with a Prism Seed to develop this instinct.`,lv?"PARTNER":"GROW",!lv));
  }
};
