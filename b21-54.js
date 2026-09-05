// B66 Supportive emergency return clarity.
function announceEmergencyB66(count){
  if(S.b66EmergencyActive)return;
  S.b66EmergencyActive=true;
  if(count)popup(P.pipX,P.pipY,`CARGO DROPPED ×${count}`,'#9ee7ff',true,.9);
  partnershipCueB59('support',P.x,P.y,count?`cargo down — I'm coming back. ${count} heart${count===1?'':'s'} can be recovered.`:"I'm coming back. stay with me.");
}
const hurtBeforeB66=hurt;
hurt=function(){const count=transportB60().cargo.length;hurtBeforeB66();if(liveB59()&&supportEmergencyB63())announceEmergencyB66(count)};
const updateBeforeB66=update;
update=function(dt){
  const count=transportB60().cargo.length,was=!!S?.b66EmergencyActive;
  updateBeforeB66(dt);
  if(!S)return;
  const active=liveB59()&&supportEmergencyB63();
  if(active&&!was)announceEmergencyB66(count);
  else if(!active)S.b66EmergencyActive=false;
};
const updateUIBeforeB66=updateUI;
updateUI=function(){
  updateUIBeforeB66();
  if(!liveB59()||!supportEmergencyB63())return;
  const returning=S.pipState!=='orbit';
  $('tip').textContent=`PIP ${returning?'RETURNING':'GUARDING'} · SHIELDS ${S.shields}/2${S.b66EmergencyActive?' · SUPPORTIVE':''}`;
};
