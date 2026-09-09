// B83 Trusted Pip distinguishes urgent collision courses from mere proximity at reunion.
function reunionTargetB83(){
  const nearest=nearestEnemyFrom(P.pipX,P.pipY,470);
  if(!nearest||!liveB59()||feelingsB76().trust<.65)return nearest;
  const contact=nearestEnemyFrom(P.x,P.y,65);
  if(contact&&hyp(contact.x-P.pipX,contact.y-P.pipY)<470)return contact;
  let target=nearest,bestTime=Infinity;
  for(const e of enemies){
    if(e.dead||e.type!=='charger'||e.state!=='charge'||hyp(e.x-P.x,e.y-P.y)>200||hyp(e.x-P.pipX,e.y-P.pipY)>=470)continue;
    const speed2=e.vx*e.vx+e.vy*e.vy;if(!Number.isFinite(speed2)||speed2<=0)continue;
    const time=((P.x-e.x)*e.vx+(P.y-e.y)*e.vy)/speed2;
    if(time<=0||time>Math.min(.35,e.charge||0)||time>=bestTime)continue;
    if(hyp(e.x+e.vx*time-P.x,e.y+e.vy*time-P.y)>P.r+e.r+18)continue;
    target=e;bestTime=time;
  }
  return target;
}
warmReturnVolley=function(){
  if(S.pipLove<3||!pipWithPlayer())return;
  const target=reunionTargetB83();if(!target)return;
  const bonus=1+Math.max(0,S.pipLove-3)*.12;
  for(const spread of [-.13,0,.13])pushPipShot(P.pipX,P.pipY,target,.62*bonus,spread);
};
