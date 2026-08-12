const joyViz=document.getElementById("joyViz"),joyKnob=joyViz.querySelector("i");
const GAMEPAD_DEADZONE=.22;
function updateGamepadInput(){
 const pads=navigator.getGamepads?navigator.getGamepads():[];
 let pad=null;
 if(gamepad.index!==null&&pads[gamepad.index]&&pads[gamepad.index].connected)pad=pads[gamepad.index];
 if(!pad){for(const candidate of pads)if(candidate&&candidate.connected){pad=candidate;break}}
 if(!pad){gamepad.dx=0;gamepad.dy=0;gamepad.dashHeld=false;gamepad.index=null;return}
 gamepad.index=pad.index;
 const pressed=i=>!!(pad.buttons&&pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5));
 const dpadX=(pressed(15)?1:0)-(pressed(14)?1:0),dpadY=(pressed(13)?1:0)-(pressed(12)?1:0);
 if(dpadX||dpadY){const length=hyp(dpadX,dpadY)||1;gamepad.dx=dpadX/length;gamepad.dy=dpadY/length}else{
  let x=clamp((pad.axes&&pad.axes[0])||0,-1,1),y=clamp((pad.axes&&pad.axes[1])||0,-1,1);const magnitude=hyp(x,y);
  if(magnitude<=GAMEPAD_DEADZONE){gamepad.dx=0;gamepad.dy=0}else{const strength=clamp((magnitude-GAMEPAD_DEADZONE)/(1-GAMEPAD_DEADZONE),0,1);gamepad.dx=x/magnitude*strength;gamepad.dy=y/magnitude*strength}
 }
 const dashPressed=pressed(0)||pressed(1)||pressed(2)||pressed(5);
 if(dashPressed&&!gamepad.dashHeld&&S&&!S.end){if(!S.run&&!$("start").classList.contains("hidden"))$("begin").click();else if(S.run)dash()}
 gamepad.dashHeld=dashPressed;
}
function loop(now){let dt=Math.min(.04,(now-last)/1000);last=now;updateGamepadInput();update(dt);draw();requestAnimationFrame(loop)}

$("begin").addEventListener("click",()=>{$("start").classList.add("hidden");S.run=true;last=performance.now();unlockAudioFromGesture();startWave(1)});
$("again").addEventListener("click",reset);
$("bossReward0").addEventListener("click",()=>chooseBossReward(0));$("bossReward1").addEventListener("click",()=>chooseBossReward(1));$("bossReward2").addEventListener("click",()=>chooseBossReward(2));
$("upLove").addEventListener("click",()=>choosePipUpgrade("love"));$("upCompassion").addEventListener("click",()=>choosePipUpgrade("compassion"));$("upSupport").addEventListener("click",()=>choosePipUpgrade("support"));$("skipPipUpgrade").addEventListener("click",skipPipUpgrade);
$("abilityRange").addEventListener("click",()=>buyPipAbility("range"));$("abilitySpeed").addEventListener("click",()=>buyPipAbility("speed"));$("abilityPower").addEventListener("click",()=>buyPipAbility("power"));$("abilityGuard").addEventListener("click",()=>buyPipAbility("guard"));$("continueAbilities").addEventListener("click",openAudioStep);
$("audioChoice0").addEventListener("click",()=>chooseAudioUnlock(0));$("audioChoice1").addEventListener("click",()=>chooseAudioUnlock(1));$("audioChoice2").addEventListener("click",()=>chooseAudioUnlock(2));
$("audioToggle").addEventListener("click",()=>{if(!S)return;if(!S.audioEnabled){S.audioEnabled=true;$("audioToggle").textContent="♫ TAP";unlockAudioFromGesture();return}if(!audioCtx||audioCtx.state!=="running"){unlockAudioFromGesture();return}S.audioEnabled=false;$("audioToggle").textContent="♫ OFF";if(audioEngine)audioEngine.setEnabled(false)});
function gestureAudioUnlock(){if(S&&S.audioEnabled&&!audioUnlocked)unlockAudio()}
window.addEventListener("pointerdown",gestureAudioUnlock,{capture:true,passive:true});window.addEventListener("touchstart",gestureAudioUnlock,{capture:true,passive:true});window.addEventListener("keydown",gestureAudioUnlock,{capture:true});
$("dash").addEventListener("pointerdown",e=>{e.preventDefault();dash()});
window.addEventListener("keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d"].includes(e.key))e.preventDefault();keys.add(k);if(e.key===" ")dash()});
window.addEventListener("keyup",e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

// Hybrid touch controls: one pointer owns movement; every other pointer can dash.
const tapDash={time:0,x:0,y:0,type:"",sourcePointer:null};
const JOY_RADIUS=55,JOY_DEADZONE=6;

function inMovementTouchZone(clientX,clientY){
 const rect=C.getBoundingClientRect();
 const x=clientX-rect.left,y=clientY-rect.top;
 return x<=rect.width*.48&&y>=rect.height*.42;
}
function showJoyViz(){
 joyViz.style.left=joy.originX+"px";
 joyViz.style.top=joy.originY+"px";
 joyKnob.style.transform="translate(-50%,-50%)";
 joyViz.classList.add("on");
}
function updateJoyViz(px,py){
 joyKnob.style.transform=`translate(calc(-50% + ${px}px),calc(-50% + ${py}px))`;
}
function hideJoyViz(){
 joyViz.classList.remove("on");
 joyKnob.style.transform="translate(-50%,-50%)";
}
function dashTowardScreenPoint(clientX,clientY){
 const rect=C.getBoundingClientRect();
 const sx=(clientX-rect.left)*(W/rect.width);
 const sy=(clientY-rect.top)*(H/rect.height);
 const worldX=CAM.x+sx-W/2;
 const worldY=CAM.y+sy-H/2;
 return dashVector(worldX-P.x,worldY-P.y);
}
function resetDashTap(){
 tapDash.time=0;
 tapDash.type="";
 tapDash.sourcePointer=null;
}
function processDashTap(e){
 const pointerType=e.pointerType||"mouse";
 const now=performance.now();
 const dtap=now-tapDash.time;
 const dist=hyp(e.clientX-tapDash.x,e.clientY-tapDash.y);
 const doubleTap=
   tapDash.type===pointerType&&
   dtap>=40&&dtap<=660&&
   dist<=72;

 if(doubleTap){
   resetDashTap();
   dashTowardScreenPoint(e.clientX,e.clientY);
   return true;
 }

 tapDash.time=now;
 tapDash.x=e.clientX;
 tapDash.y=e.clientY;
 tapDash.type=pointerType;
 tapDash.sourcePointer=e.pointerId;
 return false;
}
function screenJoyStart(e){
 if(!S||!S.run||S.end||S.waveState==="stage")return;
 if(e.target.closest&&e.target.closest("button,.modal"))return;

 const pointerType=e.pointerType||"mouse";
 const touchLike=pointerType==="touch"||pointerType==="pen";

 // While the movement thumb is held, every other finger is reserved for
 // dash gestures. It never steals, releases, or zeroes the joystick.
 if(touchLike&&joy.active&&e.pointerId!==joy.id){
   processDashTap(e);
   e.preventDefault();
   return;
 }

 // Mouse never owns the joystick, but double-click dash still works.
 if(!touchLike){
   processDashTap(e);
   return;
 }

 // With no movement pointer held, a touch can still double-tap dash anywhere.
 // If it is only the first tap and lands in the lower-left zone, it becomes
 // the movement pointer.
 if(processDashTap(e)){
   e.preventDefault();
   return;
 }
 if(!inMovementTouchZone(e.clientX,e.clientY))return;
 if(joy.active)return;

 joy.active=true;
 joy.id=e.pointerId;
 joy.originX=e.clientX;
 joy.originY=e.clientY;
 joy.dx=0;
 joy.dy=0;
 showJoyViz();
 try{C.setPointerCapture(e.pointerId)}catch(_){}
 e.preventDefault();
}
function screenJoyMove(e){
 if(!joy.active||e.pointerId!==joy.id)return;

 let dx=e.clientX-joy.originX,dy=e.clientY-joy.originY;
 let mag=hyp(dx,dy);

 // Only invalidate a dash candidate if that candidate came from the same
 // finger that became the movement joystick. A second finger's pending
 // dash tap survives while the movement thumb keeps dragging.
 if(mag>18&&tapDash.sourcePointer===joy.id){
   resetDashTap();
 }

 if(mag>JOY_RADIUS){
   dx=dx/mag*JOY_RADIUS;
   dy=dy/mag*JOY_RADIUS;
   mag=JOY_RADIUS;
 }
 updateJoyViz(dx,dy);

 if(mag<=JOY_DEADZONE){
   joy.dx=0;
   joy.dy=0;
 }else{
   const strength=(mag-JOY_DEADZONE)/(JOY_RADIUS-JOY_DEADZONE);
   joy.dx=dx/mag*strength;
   joy.dy=dy/mag*strength;
 }
 e.preventDefault();
}
function screenJoyEnd(e){
 // Auxiliary dash fingers can lift independently without disturbing movement.
 if(!joy.active||e.pointerId!==joy.id){
   if(e.pointerType==="touch"||e.pointerType==="pen")e.preventDefault();
   return;
 }

 joy.active=false;
 joy.id=null;
 joy.dx=0;
 joy.dy=0;
 hideJoyViz();
 try{C.releasePointerCapture(e.pointerId)}catch(_){}
 e.preventDefault();
}
function screenJoyCancel(e){
 if(tapDash.sourcePointer===e.pointerId)resetDashTap();
 screenJoyEnd(e);
}
C.addEventListener("pointerdown",screenJoyStart,{passive:false});
C.addEventListener("pointermove",screenJoyMove,{passive:false});
C.addEventListener("pointerup",screenJoyEnd,{passive:false});
C.addEventListener("pointercancel",screenJoyCancel,{passive:false});

resizeArena();reset();CAM.x=P.x;CAM.y=P.y;requestAnimationFrame(loop);
window.addEventListener("resize",()=>{resizeArena();if(S)applyPipPower();updateCamera()});
