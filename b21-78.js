// B89 Arrival read: fresh offscreen enemies get a short edge cue before entry.
const B89_ENTRY_SECONDS=.9;
function arrivalCueB89(e,width=W,height=H,cameraX=CAM.x,cameraY=CAM.y){
  if(!e||e.dead||e.type==="boss"||(e.age||0)>B89_ENTRY_SECONDS)return null;
  const sx=e.x-cameraX+width/2,sy=e.y-cameraY+height/2,pad=18;
  if(sx>=-e.r&&sx<=width+e.r&&sy>=-e.r&&sy<=height+e.r)return null;
  const d={top:Math.abs(sy),right:Math.abs(sx-width),bottom:Math.abs(sy-height),left:Math.abs(sx)};
  let edge="top",best=d.top;
  for(const k of ["right","bottom","left"])if(d[k]<best){edge=k;best=d[k]}
  const alpha=clamp(1-(e.age||0)/B89_ENTRY_SECONDS,0,1);
  const x=edge==="left"?pad:edge==="right"?width-pad:clamp(sx,pad,width-pad);
  const y=edge==="top"?pad:edge==="bottom"?height-pad:clamp(sy,pad,height-pad);
  return {x,y,edge,alpha,type:e.type,color:COLORS[e.type]||"#fff"};
}
function drawArrivalCueB89(q){
  if(!q)return;
  X.save();X.translate(q.x,q.y);X.globalAlpha=.22+.62*q.alpha;X.fillStyle=q.color;X.strokeStyle="#ffffffcc";X.lineWidth=1.5;X.shadowColor=q.color;X.shadowBlur=8;
  const rot={top:0,right:Math.PI/2,bottom:Math.PI,left:-Math.PI/2}[q.edge]||0;X.rotate(rot);
  if(q.type==="charger"){X.rotate(Math.PI/4);X.fillRect(-6,-6,12,12);X.strokeRect(-6,-6,12,12)}
  else if(q.type==="core"){X.beginPath();X.arc(0,0,8,0,Math.PI*2);X.fill();X.stroke();X.beginPath();X.arc(0,0,13,0,Math.PI*2);X.stroke()}
  else{X.beginPath();X.moveTo(0,-11);X.lineTo(9,8);X.lineTo(-9,8);X.closePath();X.fill();X.stroke()}
  X.restore();
}
function drawArrivalReadsB89(){
  if(!S?.run||S.end||S.waveState==="stage")return;
  for(const e of enemies)drawArrivalCueB89(arrivalCueB89(e));
}
const drawBeforeB89=draw;
draw=function(){drawBeforeB89();drawArrivalReadsB89()};
