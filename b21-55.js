// B67 Preserve Supportive-dropped cargo until the player recovers two shields.
const dropCargoBeforeB67=dropCargoB63;
dropCargoB63=function(){
  const before=new Set(heartBits),count=dropCargoBeforeB67();
  for(const h of heartBits)if(!before.has(h)){h.b67SafeDrop=true;h.life=Math.max(10,h.life||0)}
  return count;
};
const updateBeforeB67=update;
update=function(dt){
  if(liveB59()&&supportEmergencyB63())for(const h of heartBits)if(h.b67SafeDrop&&!h.dead)h.life+=clamp(Number(dt)||0,0,.04);
  updateBeforeB67(dt);
};
function safeCargoCountB67(){return heartBits.filter(h=>h.b67SafeDrop&&!h.dead&&h.life>0).length}
const updateUIBeforeB67=updateUI;
updateUI=function(){
  updateUIBeforeB67();
  if(!liveB59()||!supportEmergencyB63())return;
  const count=safeCargoCountB67();if(count)$('tip').textContent+=` · CARGO ${count} SAFE`;
};
