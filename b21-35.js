// B48 Rare reward beacons: important exploration drops remain legible on the infinite map.
const B48_BEACON_MARGIN=46;
const B48_BEACON_LIMIT=4;

function rareRewardTargetsB48(){
  if(!S||!P)return [];
  const out=[];
  if(typeof musicNoteDrops!=="undefined")for(const n of musicNoteDrops){
    if(!n||n.dead||n.life<=0)continue;
    const special=!!(n.event||n.bossDrop||n.reward>1);
    out.push({x:n.x,y:n.y,icon:special?"★":"♪",label:special?"SPECIAL NOTE":"NOTE",color:special?"#ffd36f":"#9ee7ff",priority:special?3:2});
  }
  if(typeof prismSeedDrops!=="undefined")for(const n of prismSeedDrops){
    if(!n||n.dead||n.life<=0)continue;
    out.push({x:n.x,y:n.y,icon:"◆",label:"PRISM",color:"#d7b7ff",priority:4});
  }
  return out.map(t=>({...t,d:hyp(t.x-P.x,t.y-P.y)})).sort((a,b)=>b.priority-a.priority||a.d-b.d);
}
function beaconEdgePointB48(sx,sy){
  const cx=W/2,cy=H/2,dx=sx-cx,dy=sy-cy;
  if(Math.abs(dx)<.001&&Math.abs(dy)<.001)return{x:cx,y:cy};
  const left=B48_BEACON_MARGIN,right=W-B48_BEACON_MARGIN,top=B48_BEACON_MARGIN,bottom=H-B48_BEACON_MARGIN;
  let t=Infinity;
  if(dx>0)t=Math.min(t,(right-cx)/dx);else if(dx<0)t=Math.min(t,(left-cx)/dx);
  if(dy>0)t=Math.min(t,(bottom-cy)/dy);else if(dy<0)t=Math.min(t,(top-cy)/dy);
  if(!Number.isFinite(t)||t<0)t=1;
  return{x:cx+dx*t,y:cy+dy*t,a:Math.atan2(dy,dx)};
}
function drawRareRewardBeaconsB48(){
  if(!S?.run||S.end||S.waveState==="stage")return;
  const pulse=.5+.5*Math.sin((S.t||0)*5.2),targets=rareRewardTargetsB48();
  let shown=0;
  X.save();
  X.textAlign="center";X.textBaseline="middle";
  for(const t of targets){
    if(shown>=B48_BEACON_LIMIT)break;
    const sx=worldToScreenX(t.x),sy=worldToScreenY(t.y);
    if(sx>=30&&sx<=W-30&&sy>=86&&sy<=H-34)continue;
    const p=beaconEdgePointB48(sx,sy);shown++;
    X.save();X.translate(p.x,p.y);
    X.globalAlpha=.86+.14*pulse;
    X.shadowColor="#000";X.shadowBlur=10;
    X.fillStyle="#05070bcc";X.beginPath();X.arc(0,0,23+3*pulse,0,Math.PI*2);X.fill();
    X.strokeStyle=t.color;X.lineWidth=2;X.beginPath();X.arc(0,0,18+3*pulse,0,Math.PI*2);X.stroke();
    X.shadowColor=t.color;X.shadowBlur=9+5*pulse;X.fillStyle=t.color;X.font="900 22px system-ui,sans-serif";X.fillText(t.icon,0,-1);
    X.shadowBlur=5;X.fillStyle="#fff";X.font="900 9px system-ui,sans-serif";X.fillText(`${Math.max(1,Math.round(t.d/10)*10)}`,0,30);
    X.rotate(p.a||0);X.fillStyle=t.color;X.beginPath();X.moveTo(27,0);X.lineTo(20,-5);X.lineTo(20,5);X.closePath();X.fill();
    X.restore();
  }
  X.restore();
}

const drawBeforeB48=draw;
draw=function(){drawBeforeB48();drawRareRewardBeaconsB48()};
