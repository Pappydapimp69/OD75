// B68 One visual recovery marker per emergency cargo drop.
const dropCargoBeforeB68=dropCargoB63;
dropCargoB63=function(){
  const before=new Set(heartBits),count=dropCargoBeforeB68();
  if(count){
    S.b68DropSerial=(S.b68DropSerial||0)+1;
    for(const h of heartBits)if(!before.has(h)&&h.b67SafeDrop)h.b68DropGroup=S.b68DropSerial;
  }
  return count;
};
function cargoGroupsB68(){
  const groups=new Map();
  for(const h of heartBits){
    if(!h.b68DropGroup||h.dead||h.life<=0)continue;
    let g=groups.get(h.b68DropGroup);if(!g){g={id:h.b68DropGroup,x:0,y:0,count:0,life:0};groups.set(h.b68DropGroup,g)}
    g.x+=h.x;g.y+=h.y;g.count++;g.life=Math.max(g.life,h.life);
  }
  return [...groups.values()].map(g=>({...g,x:g.x/g.count,y:g.y/g.count}));
}
const drawBeforeB68=draw;
draw=function(){
  drawBeforeB68();if(!S?.run||S.end||S.waveState==='stage')return;
  for(const g of cargoGroupsB68()){
    if(!worldVisible(g.x,g.y,70))continue;
    const x=worldToScreenX(g.x),y=worldToScreenY(g.y),safe=supportEmergencyB63();
    X.save();X.translate(x,y);X.strokeStyle='#9ee7ff';X.fillStyle='#dff8ff';X.lineWidth=2;X.setLineDash([4,5]);X.globalAlpha=.72+.18*Math.sin(S.t*3+g.id);
    X.beginPath();X.arc(0,0,25+Math.sqrt(g.count)*3,0,Math.PI*2);X.stroke();X.setLineDash([]);
    X.font='bold 10px system-ui';X.textAlign='center';X.shadowColor='#071019';X.shadowBlur=5;
    X.fillText(safe?`SAFE ×${g.count}`:`RECOVER ×${g.count} · ${Math.ceil(g.life)}s`,0,-32);X.restore();
  }
};
