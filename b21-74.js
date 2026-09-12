// B85 The Cover arc points at whichever threat lands first, not the last one scanned.
// Entry time, not closest approach: a body already on you arrives now even though its
// nearest point is still ahead, and a shot is ranked by when it reaches you rather than
// by when it is closest.
function threatEntryB85(rx,ry,vx,vy,radius){
  const r2=rx*rx+ry*ry;
  // Fast path only — inside the radius the root below is always negative and clamps to 0.
  if(r2<=radius*radius)return 0;
  const v2=vx*vx+vy*vy;if(!v2)return .28;
  const dot=rx*vx+ry*vy,disc=dot*dot-v2*(r2-radius*radius);
  if(disc<0)return .28;
  return clamp((-dot-Math.sqrt(disc))/v2,0,.28);
}
incomingThreatB59=function(){
  if(!combatB59()||!vulnerableB59()||S.invuln>0)return null;
  let best=null,soon=Infinity;
  for(const s of enemyShots){
    if(s.life<=0)continue;
    const vx=s.vx-P.vx,vy=s.vy-P.vy,rx=s.x-P.x,ry=s.y-P.y,v2=vx*vx+vy*vy;
    // Unchanged qualification: closest approach inside the window still lands.
    const near=v2?clamp(-(rx*vx+ry*vy)/v2,0,.28):0,radius=P.r+s.r+7;
    if(near>=.28||hyp(rx+vx*near,ry+vy*near)>=radius)continue;
    const t=threatEntryB85(rx,ry,vx,vy,radius);
    if(t<soon){soon=t;best={x:s.x,y:s.y}}
  }
  for(const e of enemies){
    if(e.dead)continue;
    const vx=(e.vx||0)-P.vx,vy=(e.vy||0)-P.vy,radius=P.r+e.r+7;
    // Unchanged qualification: a body inside the 0.22s lookahead still counts.
    if(pointSegmentDistanceB59(P.x,P.y,e.x,e.y,e.x+vx*.22,e.y+vy*.22)>=radius)continue;
    const t=threatEntryB85(e.x-P.x,e.y-P.y,vx,vy,radius);
    if(t<soon){soon=t;best={x:e.x,y:e.y}}
  }
  return best;
};
