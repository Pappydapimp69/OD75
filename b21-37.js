// B50 Threat telegraphs: expose imminent boss volleys and charger commitment without changing combat balance.
const B50_BOSS_TELEGRAPH_START=.55;
const B50_CHARGER_TELEGRAPH_WINDOW=.45;

function bossVolleyIntervalB50(e){return Math.max(.72,1.55-(e?.bossStage||1)*.022)}
function drawThreatTelegraphsB50(){
  if(!S?.run||S.end||S.waveState==="stage"||!P)return;
  const px=worldToScreenX(P.x),py=worldToScreenY(P.y);
  X.save();X.lineCap="round";X.textAlign="center";X.textBaseline="middle";
  for(const e of enemies){
    if(!e||e.dead)continue;
    const ex=worldToScreenX(e.x),ey=worldToScreenY(e.y);
    if(e.type==="boss"){
      const interval=bossVolleyIntervalB50(e),progress=clamp(1-(e.attackClock||0)/interval,0,1);
      if(progress<B50_BOSS_TELEGRAPH_START)continue;
      const t=clamp((progress-B50_BOSS_TELEGRAPH_START)/(1-B50_BOSS_TELEGRAPH_START),0,1);
      const base=Math.atan2(P.y-e.y,P.x-e.x),spread=.82,ray=140+90*t;
      const color=bossData(e.bossStage).color||"#ff6e8b";
      X.globalAlpha=.25+.62*t;X.strokeStyle=color;X.lineWidth=1.5+1.8*t;
      X.beginPath();X.arc(ex,ey,e.r+12+14*t,0,Math.PI*2);X.stroke();
      for(const off of [-spread/2,0,spread/2]){
        const a=base+off;X.beginPath();X.moveTo(ex+Math.cos(a)*(e.r+7),ey+Math.sin(a)*(e.r+7));X.lineTo(ex+Math.cos(a)*ray,ey+Math.sin(a)*ray);X.stroke();
      }
      X.globalAlpha=.7+.3*t;X.fillStyle=color;X.font="900 12px system-ui,sans-serif";X.fillText("VOLLEY",ex,ey-e.r-28);
      if(t>.72){X.globalAlpha=(t-.72)/.28;X.fillStyle="#fff";X.font="900 10px system-ui,sans-serif";X.fillText("MOVE",ex,ey-e.r-43)}
    }else if(e.type==="charger"&&e.state==="aim"&&Number.isFinite(e.aim)&&e.aim<=B50_CHARGER_TELEGRAPH_WINDOW){
      const t=clamp(1-e.aim/B50_CHARGER_TELEGRAPH_WINDOW,0,1),a=Math.atan2(P.y-e.y,P.x-e.x),len=hyp(P.x-e.x,P.y-e.y);
      X.globalAlpha=.24+.62*t;X.strokeStyle="#ff9fba";X.lineWidth=1.5+1.5*t;X.setLineDash([8,6]);
      X.beginPath();X.moveTo(ex,ey);X.lineTo(px,py);X.stroke();X.setLineDash([]);
      X.beginPath();X.arc(ex,ey,e.r+7+9*t,0,Math.PI*2);X.stroke();
      X.globalAlpha=.85;X.fillStyle="#ffb3c7";X.font="900 9px system-ui,sans-serif";X.fillText("CHARGE",ex,ey-e.r-15);
    }
  }
  X.restore();
}

const drawBeforeB50=draw;
draw=function(){drawBeforeB50();drawThreatTelegraphsB50()};
