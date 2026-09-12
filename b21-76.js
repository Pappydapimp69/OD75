// B87 Leaving the game is an implicit release, so missed keyup/pointer events cannot
// preserve movement or complete a held action after focus returns.
function releaseTransientInputB87(){
  keys.clear();
  joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;
  if(typeof hideJoyViz==="function")hideJoyViz();
  if(typeof resetDashTap==="function")resetDashTap();
  if(typeof cancelOverdriveHold==="function"&&overHold.active)cancelOverdriveHold();
  if(typeof cancelSoundLabHoldB45==="function"&&soundLabHold.active)cancelSoundLabHoldB45();
  if(typeof soundLabInputB54!=="undefined")soundLabInputB54.keyboardButton=null;
  if(S?.b38OverHeld&&typeof stopOverdriveB38==="function")stopOverdriveB38(false);
}
window.addEventListener("blur",releaseTransientInputB87);
document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseTransientInputB87()});
