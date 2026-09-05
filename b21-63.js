// B74 Heartfield presentation and final simulation guard.
const heartfieldStatusB74=document.createElement('div');
heartfieldStatusB74.id='heartfieldStatusB74';heartfieldStatusB74.setAttribute('role','status');heartfieldStatusB74.setAttribute('aria-live','polite');
heartfieldStatusB74.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';$('app').appendChild(heartfieldStatusB74);

function updateHeartfieldStatusB74(){
  if(!S?.run)return;
  const field=heartfieldB74(),cargo=cargoHeartValueB74();let text='';
  if(S.pipState==='collect'&&field.mining?.source&&sourceAliveB74(field.mining.source))text=`Pip mining heart source, ${heartValueB74(field.mining.source)} remaining.`;
  else if(S.pipState==='return'&&cargo)text=`Pip returning with ${cargo} heart${cargo===1?'':'s'}.`;
  if(text!==field.lastStatus){field.lastStatus=text;heartfieldStatusB74.textContent=text}
}

function drawHeartGlyphB74(x,y,size,alpha=1){
  X.save();X.globalAlpha=alpha;X.fillStyle='#ff9fba';X.font=`900 ${size}px system-ui`;X.textAlign='center';X.textBaseline='middle';X.shadowColor='#250a18';X.shadowBlur=5;X.fillText('♥',x,y);X.restore();
}
function drawHeartfieldSourcesB74(){
  if(!S?.run||S.end||S.waveState==='stage')return;
  for(const h of heartBits){
    const value=heartValueB74(h);if(value<2||!worldVisible(h.x,h.y,45))continue;
    const x=worldToScreenX(h.x),y=worldToScreenY(h.y+Math.sin(S.t*6+h.bob)*2);
    drawHeartGlyphB74(x-5,y+2,13,.88);if(value>=3)drawHeartGlyphB74(x+5,y+2,13,.82);
    X.save();X.fillStyle='#ffe0e8';X.font='800 9px system-ui';X.textAlign='center';X.shadowColor='#000';X.shadowBlur=4;X.fillText(`×${value}`,x,y+17);X.restore();
  }
}
function drawHeartNodesB74(){
  if(!S?.run||S.end||S.waveState==='stage')return;
  for(const node of heartfieldB74().nodes){
    const value=heartValueB74(node);if(!value||!worldVisible(node.x,node.y,55))continue;
    const x=worldToScreenX(node.x),y=worldToScreenY(node.y),size=18+Math.min(10,value*1.2);
    X.save();X.globalAlpha=.28;X.fillStyle='#ff8fb4';X.beginPath();X.arc(x,y,size*.82,0,Math.PI*2);X.fill();X.restore();
    drawHeartGlyphB74(x-5,y+2,size,.78);drawHeartGlyphB74(x+5,y+1,size,.72);drawHeartGlyphB74(x,y-4,size+2,.96);
    X.save();X.fillStyle='#fff1f5';X.font='900 10px system-ui';X.textAlign='center';X.shadowColor='#000';X.shadowBlur=5;X.fillText(`×${value}`,x,y+size*.8);X.restore();
    if(node.flash>0){
      X.save();X.fillStyle='#fff4c7';X.globalAlpha=node.flash/.45;X.font='900 11px system-ui';X.textAlign='center';
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3+node.id*.7;X.fillText('✦',x+Math.cos(a)*(size+7),y+Math.sin(a)*(size+7))}X.restore();
    }
  }
}
function drawPipCargoB74(){
  const cargo=transportB60().cargo;if(!S?.run||S.end||S.waveState==='stage'||!cargo.length)return;
  const px=worldToScreenX(P.pipX),py=worldToScreenY(P.pipY),field=heartfieldB74();
  X.save();X.fillStyle='#ffb3c7';X.font='bold 13px system-ui';X.textAlign='center';X.shadowColor='#090d19';X.shadowBlur=5;
  for(let i=0;i<Math.min(18,cargo.length);i++){const a=i*2.399+S.t*.65,r=19+Math.sqrt(i)*5;X.fillText('♥',px+Math.cos(a)*r,py+Math.sin(a)*r+Math.sin(S.t*3+i)*3)}
  X.font='bold 10px system-ui';const mining=S.pipState==='collect'&&field.mining?.source&&sourceAliveB74(field.mining.source);
  const label=mining?`MINE ×${heartValueB74(field.mining.source)} · ${cargoWeightB60()}/${S.pipCarryCapacity}`:`${S.pipState==='return'?'RETURN':'GATHER'} ${cargoWeightB60()}/${S.pipCarryCapacity}`;
  X.fillText(label,clamp(px,70,W-70),clamp(py+48,108,H-40));X.restore();
}

const drawBeforeB74Final=draw;
draw=function(){
  const state=S?.b60,saved=state?.cargo;if(state)state.cargo=[];
  try{drawBeforeB74Final()}finally{if(state)state.cargo=saved}
  drawHeartfieldSourcesB74();drawHeartNodesB74();drawPipCargoB74();
};

const updateBeforeB74Final=update;
update=function(dt){
  if(!liveB59())return;
  dt=clamp(Number(dt)||0,0,.04);if(!dt)return;
  for(const h of heartBits)ensureHeartSourceB74(h);
  updateBeforeB74Final(dt);if(!liveB59())return;
  const state=heartfieldB74();state.audioCd=Math.max(0,state.audioCd-dt);
  updateHeartLifetimesB74(dt);updateNodeSpiralsB74(dt);
  state.scan-=dt;if(state.scan<=0){state.scan+=B74_NODE_SCAN_SECONDS;scanHeartNodesB74()}
  updateHeartfieldStatusB74();
};

const dropCargoBeforeB74Final=dropCargoB63;
dropCargoB63=function(){
  const before=new Set(heartBits),count=dropCargoBeforeB74Final();
  for(const h of heartBits)if(!before.has(h)){ensureHeartSourceB74(h);h.b74Lives=[Math.max(0,h.life||10)];h.b74Boss=false;h.b74NodeId=0}
  clearMiningB74();return count;
};

const openStageBeforeB74=openStageUpgrade;
openStageUpgrade=function(){const result=openStageBeforeB74();if(S?.b74){S.b74.nodes=[];S.b74.mining=null;S.b74.scan=0;S.b74.lastStatus=''}return result};

const updateUIBeforeB74Final=updateUI;
updateUI=function(){updateUIBeforeB74Final();updateHeartfieldStatusB74()};
