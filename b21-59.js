// B72 Make Pip's remaining heart reserve readable while he is away.
function pipBondSecondsRemainingB72(){return Math.max(0,pipBondB51()*heartSecondsB63())}

function drawPipBondTimerB72(){
  if(!S?.run||S.end||S.waveState==="stage"||!P||S.pipState==="orbit")return;
  const a=(P.pipAngle||0)+Math.PI*.72,r=22;
  const x=worldToScreenX(P.x+Math.cos(a)*r),y=worldToScreenY(P.y+Math.sin(a)*r);
  const remaining=pipBondSecondsRemainingB72();
  X.save();
  X.font="700 9px system-ui,sans-serif";
  X.textAlign="center";X.textBaseline="middle";
  X.lineWidth=3;X.strokeStyle="rgba(0,0,0,.8)";
  const label=`${remaining.toFixed(1)}s`;
  X.strokeText(label,x,y+17);
  X.fillStyle=remaining>B51_PIP_BOND_EPS?"#ffd6e1":"#ff7f9f";
  X.fillText(label,x,y+17);
  X.restore();
}

const drawBeforeB72=draw;
draw=function(){drawBeforeB72();drawPipBondTimerB72()};
