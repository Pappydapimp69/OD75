// B49 Pip presence clarity: make companion-away state and combat-bonus availability visible in the arena.
const B49_RETURN_PULSE_SECONDS=.85;

function pipAwayB49(){return !!(S&&S.pipState&&S.pipState!=="orbit")}
function pipStateLabelB49(){
  if(!S)return "";
  if(S.pipState==="collect")return "PIP FETCHING ♥";
  if(S.pipState==="return")return "PIP RETURNING";
  return "";
}
function drawPipPresenceB49(){
  if(!S?.run||S.end||S.waveState==="stage"||!P)return;
  const px=worldToScreenX(P.x),py=worldToScreenY(P.y),qx=worldToScreenX(P.pipX),qy=worldToScreenY(P.pipY);
  const away=pipAwayB49(),pulse=Math.max(0,S.b49ReturnPulse||0);
  X.save();
  if(away){
    const collect=S.pipState==="collect",c=collect?"#ffb3c7":"#9ee7ff";
    X.globalAlpha=.72;X.strokeStyle=c;X.lineWidth=2;X.setLineDash([6,7]);
    X.beginPath();X.moveTo(px,py);X.lineTo(qx,qy);X.stroke();X.setLineDash([]);
    const bx=clamp(qx,72,W-72),by=clamp(qy-28,104,H-48);
    X.globalAlpha=.96;X.textAlign="center";X.textBaseline="middle";
    X.fillStyle="#05070bd9";X.beginPath();X.roundRect(bx-63,by-18,126,36,10);X.fill();
    X.strokeStyle=c;X.lineWidth=1.5;X.stroke();
    X.fillStyle=c;X.font="900 11px system-ui,sans-serif";X.fillText(pipStateLabelB49(),bx,by-5);
    X.fillStyle="#ffffffd9";X.font="800 9px system-ui,sans-serif";X.fillText("COMBAT BONUSES PAUSED",bx,by+8);
    X.globalAlpha=.75;X.strokeStyle=c;X.lineWidth=2;X.beginPath();X.arc(qx,qy,17+Math.sin((S.t||0)*7)*2,0,Math.PI*2);X.stroke();
  }
  if(pulse>0){
    const k=1-pulse/B49_RETURN_PULSE_SECONDS;
    X.globalAlpha=(1-k)*.85;X.strokeStyle="#ffd36f";X.lineWidth=2.5;X.beginPath();X.arc(qx,qy,20+k*42,0,Math.PI*2);X.stroke();
    X.globalAlpha=(1-k);X.fillStyle="#fff0b8";X.font="900 11px system-ui,sans-serif";X.textAlign="center";X.fillText("BONUSES ONLINE ✦",clamp(qx,75,W-75),clamp(qy-30,104,H-40));
  }
  X.restore();
}

const updateBeforeB49=update;
update=function(dt){
  const before=S?.pipState||"orbit";
  updateBeforeB49(dt);
  if(!S)return;
  const after=S.pipState||"orbit";
  if(before!=="orbit"&&after==="orbit")S.b49ReturnPulse=B49_RETURN_PULSE_SECONDS;
  else S.b49ReturnPulse=Math.max(0,(S.b49ReturnPulse||0)-Math.max(0,dt||0));
};
const resetBeforeB49=reset;
reset=function(){resetBeforeB49();S.b49ReturnPulse=0};
if(S)S.b49ReturnPulse=0;

const drawBeforeB49=draw;
draw=function(){drawBeforeB49();drawPipPresenceB49()};
