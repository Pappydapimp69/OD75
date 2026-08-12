function draw(){
 let sx=rr(-shake,shake),sy=rr(-shake,shake);
 X.save();X.translate(sx,sy);
 X.fillStyle=S.over>0?"#120d08":"#05070b";X.fillRect(-30,-30,W+60,H+60);
 drawGrid(S.t);

 const psx=worldToScreenX(P.x),psy=worldToScreenY(P.y);
 let g=X.createRadialGradient(psx,psy,40,psx,psy,Math.max(W,H)*.75);
 g.addColorStop(0,"#00000000");g.addColorStop(1,S.over>0?"#8a5a142c":"#0b18322f");
 X.fillStyle=g;X.fillRect(0,0,W,H);

 X.save();
 X.translate(W/2-CAM.x,H/2-CAM.y);

 for(const l of overLines){X.globalAlpha=clamp(l.life/l.max,0,1);X.strokeStyle=l.c;X.lineWidth=3;X.beginPath();X.moveTo(l.x1,l.y1);X.lineTo(l.x2,l.y2);X.stroke()}X.globalAlpha=1;
 for(const r of rings){if(!worldVisible(r.x,r.y,r.max+50))continue;X.globalAlpha=clamp(r.life/.35,0,1);X.strokeStyle=r.c;X.lineWidth=2;X.beginPath();X.arc(r.x,r.y,r.r,0,Math.PI*2);X.stroke()}X.globalAlpha=1;
 for(const q of particles){if(!worldVisible(q.x,q.y,80))continue;X.globalAlpha=clamp(q.life/q.max,0,1);X.fillStyle=q.c;X.beginPath();X.arc(q.x,q.y,q.r,0,Math.PI*2);X.fill()}X.globalAlpha=1;
 for(let i=0;i<P.trail.length;i++){let tr=P.trail[i],a=(i/P.trail.length)*tr.a*.45;X.globalAlpha=a;X.fillStyle=S.over>0?COLORS.gold:COLORS.player;X.beginPath();X.arc(tr.x,tr.y,4+i/P.trail.length*5,0,Math.PI*2);X.fill()}X.globalAlpha=1;
 for(const s of shots){if(!worldVisible(s.x,s.y,40))continue;X.fillStyle=S.over>0?"#ffd36f":"#d9c8ff";X.beginPath();X.arc(s.x,s.y,s.r,0,Math.PI*2);X.fill()}
 for(const h of heartBits){if(!worldVisible(h.x,h.y,40))continue;const bob=Math.sin(S.t*6+h.bob)*2;X.save();X.translate(h.x,h.y+bob);X.fillStyle="#ff9fba";X.font="bold 16px system-ui";X.textAlign="center";X.fillText("♥",0,5);X.textAlign="start";X.restore()}
 for(const w of wishes){if(!worldVisible(w.x,w.y,50))continue;const bob=Math.sin(S.t*5+w.bob)*3;X.save();X.translate(w.x,w.y+bob);X.rotate(w.spin);X.fillStyle="#ffd36f";X.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?9:4;const xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?X.lineTo(xx,yy):X.moveTo(xx,yy)}X.closePath();X.fill();X.restore()}
 for(const s of enemyShots){if(!worldVisible(s.x,s.y,50))continue;X.fillStyle=s.c||"#ff7dd8";X.beginPath();X.arc(s.x,s.y,s.r,0,Math.PI*2);X.fill();X.globalAlpha=.25;X.beginPath();X.arc(s.x,s.y,s.r+5,0,Math.PI*2);X.fill();X.globalAlpha=1}
 const autoTarget=getAutoTarget();
 for(const e of enemies){
   if(e.dead||!worldVisible(e.x,e.y,220))continue;
   if((e.markTime||0)>0){X.strokeStyle="#ff9fba";X.lineWidth=2.4;X.beginPath();X.arc(e.x,e.y,e.r+15+Math.sin(S.t*8)*2,0,Math.PI*2);X.stroke();X.fillStyle="#ff9fba";X.font="bold 11px system-ui";X.textAlign="center";X.fillText("♥",e.x,e.y-e.r-19);X.textAlign="start"}
   if(autoTarget===e){X.strokeStyle=S.over>0?"#ffd36f":"#d9c8ff";X.lineWidth=2;X.setLineDash([5,5]);X.beginPath();X.arc(e.x,e.y,e.r+10,0,Math.PI*2);X.stroke();X.setLineDash([]);X.globalAlpha=.16;X.beginPath();X.moveTo(P.x,P.y);X.lineTo(e.x,e.y);X.stroke();X.globalAlpha=1}
   if(e.type==="charger"&&e.state==="aim"){let dx=P.x-e.x,dy=P.y-e.y,l=hyp(dx,dy)||1;X.strokeStyle="#ffd36f55";X.lineWidth=2;X.setLineDash([8,8]);X.beginPath();X.moveTo(e.x,e.y);X.lineTo(e.x+dx/l*190,e.y+dy/l*190);X.stroke();X.setLineDash([])}
   X.fillStyle=(e.flash||0)>0?"#ffffff":COLORS[e.type];X.beginPath();
   if(e.type==="boss"){const p=bossData(e.bossKey),pulse=2+Math.sin(S.t*4)*3;X.fillStyle=(e.flash||0)>0?"#ffffff":p.color;X.beginPath();X.arc(e.x,e.y,e.r+pulse,0,Math.PI*2);X.fill();X.strokeStyle="#ffffff88";X.lineWidth=3;X.beginPath();X.arc(e.x,e.y,e.r+10+Math.sin(S.t*2)*3,0,Math.PI*2);X.stroke();X.fillStyle="#2b1328";X.beginPath();X.arc(e.x-8,e.y-4,3,0,Math.PI*2);X.arc(e.x+8,e.y-4,3,0,Math.PI*2);X.fill();X.strokeStyle="#2b1328";X.lineWidth=2;X.beginPath();X.arc(e.x,e.y+5,8,.15,Math.PI-.15);X.stroke()}
   else if(e.type==="core"){let er=e.r+Math.sin(S.t*5+e.pulse)*2;X.arc(e.x,e.y,er,0,Math.PI*2);X.fill();X.strokeStyle="#e7d7ff";X.lineWidth=2;X.beginPath();X.arc(e.x,e.y,er+7,0,Math.PI*2);X.stroke()}
   else if(e.type==="charger"){X.save();X.translate(e.x,e.y);X.rotate(Math.PI/4);X.fillRect(-10,-10,20,20);X.restore()}
   else{X.arc(e.x,e.y,e.r,0,Math.PI*2);X.fill()}
   X.fillStyle="#241b2b";X.globalAlpha=.78;
   if(e.type==="boss"){}
   else if(e.type==="chaser"){X.beginPath();X.arc(e.x-4,e.y-2,1.5,0,Math.PI*2);X.arc(e.x+4,e.y-2,1.5,0,Math.PI*2);X.fill();X.strokeStyle="#241b2b";X.lineWidth=1.3;X.beginPath();X.arc(e.x,e.y+3,3.5,.2,Math.PI-.2);X.stroke()}
   else if(e.type==="charger"){X.fillRect(e.x-5,e.y-3,2.5,3);X.fillRect(e.x+2.5,e.y-3,2.5,3)}
   else{X.beginPath();X.arc(e.x-4,e.y-2,1.3,0,Math.PI*2);X.arc(e.x+4,e.y-2,1.3,0,Math.PI*2);X.fill();X.fillStyle="#ffb7d0";X.beginPath();X.arc(e.x-7,e.y+3,2,0,Math.PI*2);X.arc(e.x+7,e.y+3,2,0,Math.PI*2);X.fill()}
   X.globalAlpha=1;
 }
 X.globalAlpha=S.invuln>0?(.45+.45*Math.sin(S.t*25)):1;X.fillStyle=S.over>0?COLORS.gold:COLORS.player;X.beginPath();X.arc(P.x,P.y,P.r+(S.dashTime>0?3:0),0,Math.PI*2);X.fill();X.strokeStyle="#fff";X.lineWidth=2;X.beginPath();X.moveTo(P.x,P.y);X.lineTo(P.x+P.faceX*18,P.y+P.faceY*18);X.stroke();X.globalAlpha=1;
 if(!pipWithPlayer()){X.save();X.globalAlpha=.22;X.strokeStyle="#ffb7c9";X.lineWidth=1.5;X.setLineDash([4,6]);X.beginPath();X.moveTo(P.x,P.y);X.lineTo(P.pipX,P.pipY);X.stroke();X.setLineDash([]);X.restore()}
 const px=P.pipX,py=P.pipY;
 if(pipWithPlayer()&&(S.pipRelayBuff>0||S.supportRush>0)){X.strokeStyle=S.pipRelayBuff>0?"#ffd36f88":"#d9c8ff88";X.lineWidth=1.5;X.beginPath();X.arc(px,py,13+Math.sin(S.t*9)*2,0,Math.PI*2);X.stroke()}
 X.save();X.translate(px,py);X.rotate(P.pipAngle*.35);X.fillStyle=!pipWithPlayer()?"#ffb7c9":S.over>0?"#fff0a8":"#ffd36f";X.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?((S.over>0?9:7)+Math.min(3,(S.pipLevel-1)*.4)):3.2;const xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?X.lineTo(xx,yy):X.moveTo(xx,yy)}X.closePath();X.fill();X.rotate(-P.pipAngle*.35);X.fillStyle="#47340d";X.beginPath();X.arc(-2,-1,1,0,Math.PI*2);X.arc(2,-1,1,0,Math.PI*2);X.fill();if(S.pipHappy>0){X.strokeStyle="#47340d";X.lineWidth=1;X.beginPath();X.arc(0,1,2.4,0,Math.PI);X.stroke()}X.restore();
 if(S.pipLevel>=4){const hx=px+Math.cos(-P.pipAngle*1.7)*13,hy=py+Math.sin(-P.pipAngle*1.7)*13;X.fillStyle="#ff9fba";X.font="12px system-ui";X.textAlign="center";X.fillText("♥",hx,hy+4);X.textAlign="start"}
 for(const t of texts){if(!worldVisible(t.x,t.y,220))continue;X.globalAlpha=t.a;X.fillStyle=t.c;X.font=`${t.big?22:13}px system-ui`;X.textAlign="center";if(t.pipText){const maxWidth=Math.min(420,W*.58),lines=wrapCanvasText(X,t.t,maxWidth),lineHeight=t.big?25:17,startY=t.y-(lines.length-1)*lineHeight;for(let i=0;i<lines.length;i++)X.fillText(lines[i],t.x,startY+i*lineHeight)}else X.fillText(t.t,t.x,t.y)}
 X.globalAlpha=1;X.textAlign="start";X.restore();
 if(S.bossActive){const b=enemies.find(e=>e.type==="boss"&&!e.dead),p=bossData();if(b){const bw=Math.min(420,W*.72),bx=(W-bw)/2,by=76;X.fillStyle="#120912cc";X.fillRect(bx,by,bw,12);X.fillStyle=p.color;X.fillRect(bx,by,bw*clamp(b.hp/b.maxHp,0,1),12);X.strokeStyle="#ffffff66";X.strokeRect(bx,by,bw,12);X.fillStyle="#fff";X.font="bold 11px system-ui";X.textAlign="center";X.fillText(p.name,W/2,by-7);X.textAlign="start"}}
 for(let i=0;i<S.maxShields;i++){X.fillStyle=i<S.shields?"#7ed8ff":"#243340";X.fillRect(14+i*13,H-19,8,8)}
 if(flash>0){X.globalAlpha=flash*.45;X.fillStyle=S.health>0?"#ffffff":"#ff6e8b";X.fillRect(-30,-30,W+60,H+60);X.globalAlpha=1}
 X.restore();
}
const GAMEPAD_DEADZONE=.22;
function updateGamepadInput(){
 const pads=navigator.getGamepads?navigator.getGamepads():[];let pad=null;if(gamepad.index!==null&&pads[gamepad.index]&&pads[gamepad.index].connected)pad=pads[gamepad.index];if(!pad){for(const candidate of pads)if(candidate&&candidate.connected){pad=candidate;break}}if(!pad){gamepad.dx=0;gamepad.dy=0;gamepad.dashHeld=false;gamepad.overHeld=false;gamepad.index=null;return}gamepad.index=pad.index;
 const pressed=i=>!!(pad.buttons&&pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5)),dpadX=(pressed(15)?1:0)-(pressed(14)?1:0),dpadY=(pressed(13)?1:0)-(pressed(12)?1:0);
 if(dpadX||dpadY){const length=hyp(dpadX,dpadY)||1;gamepad.dx=dpadX/length;gamepad.dy=dpadY/length}else{let x=clamp((pad.axes&&pad.axes[0])||0,-1,1),y=clamp((pad.axes&&pad.axes[1])||0,-1,1);const magnitude=hyp(x,y);if(magnitude<=GAMEPAD_DEADZONE){gamepad.dx=0;gamepad.dy=0}else{const strength=clamp((magnitude-GAMEPAD_DEADZONE)/(1-GAMEPAD_DEADZONE),0,1);gamepad.dx=x/magnitude*strength;gamepad.dy=y/magnitude*strength}}
 const dashPressed=pressed(0)||pressed(1)||pressed(2)||pressed(5);if(dashPressed&&!gamepad.dashHeld&&S&&!S.end){if(!S.run&&!$("start").classList.contains("hidden"))$("begin").click();else if(S.run)dash()}gamepad.dashHeld=dashPressed;const overPressed=pressed(3);if(overPressed&&!gamepad.overHeld&&S&&S.run)triggerOverdrive();gamepad.overHeld=overPressed;
}
function loop(now){let dt=Math.min(.04,(now-last)/1000);last=now;updateGamepadInput();update(dt);draw();requestAnimationFrame(loop)}
$("begin").addEventListener("click",()=>{$("start").classList.add("hidden");S.run=true;last=performance.now();clearStarEcho();unlockAudioFromGesture();startWave(1)});
$("again").addEventListener("click",reset);OVER_ORDER.forEach((id,i)=>$("overChoice"+i).addEventListener("click",()=>chooseOverdrive(id)));$("continueOverdrive").addEventListener("click",continueOverdriveChoice);$("bossReward0").addEventListener("click",()=>chooseBossReward(0));$("bossReward1").addEventListener("click",()=>chooseBossReward(1));$("bossReward2").addEventListener("click",()=>chooseBossReward(2));$("upLove").addEventListener("click",()=>choosePipUpgrade("love"));$("upCompassion").addEventListener("click",()=>choosePipUpgrade("compassion"));$("upSupport").addEventListener("click",()=>choosePipUpgrade("support"));$("skipPipUpgrade").addEventListener("click",skipPipUpgrade);$("abilityRange").addEventListener("click",()=>buyPipAbility("range"));$("abilitySpeed").addEventListener("click",()=>buyPipAbility("speed"));$("abilityPower").addEventListener("click",()=>buyPipAbility("power"));$("abilityGuard").addEventListener("click",()=>buyPipAbility("guard"));$("continueAbilities").addEventListener("click",openAudioStep);$("audioChoice0").addEventListener("click",()=>chooseAudioUnlock(0));$("audioChoice1").addEventListener("click",()=>chooseAudioUnlock(1));$("audioChoice2").addEventListener("click",()=>chooseAudioUnlock(2));
$("audioToggle").addEventListener("click",()=>{if(!S)return;if(!S.audioEnabled){S.audioEnabled=true;$("audioToggle").textContent="♫ TAP";unlockAudioFromGesture();return}if(!audioCtx||audioCtx.state!=="running"){unlockAudioFromGesture();return}S.audioEnabled=false;$("audioToggle").textContent="♫ OFF";if(audioEngine)audioEngine.setEnabled(false)});
function gestureAudioUnlock(){if(S&&S.audioEnabled&&!audioUnlocked)unlockAudio()}
window.addEventListener("pointerdown",gestureAudioUnlock,{capture:true,passive:true});window.addEventListener("touchstart",gestureAudioUnlock,{capture:true,passive:true});window.addEventListener("keydown",gestureAudioUnlock,{capture:true});$("dash").addEventListener("pointerdown",e=>{e.preventDefault();dash()});$("overdrive").addEventListener("pointerdown",e=>{e.preventDefault();triggerOverdrive()});
window.addEventListener("keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d","e","E"].includes(e.key))e.preventDefault();keys.add(k);if(e.key===" ")dash();if(k==="e")triggerOverdrive()});window.addEventListener("keyup",e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
const tapDash={time:0,x:0,y:0,type:"",sourcePointer:null};const JOY_RADIUS=55,JOY_DEADZONE=6;
function inMovementTouchZone(clientX,clientY){const rect=C.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top;return x<=rect.width*.48&&y>=rect.height*.42}
function showJoyViz(){joyViz.style.left=joy.originX+"px";joyViz.style.top=joy.originY+"px";joyKnob.style.transform="translate(-50%,-50%)";joyViz.classList.add("on")}
function updateJoyViz(px,py){joyKnob.style.transform=`translate(calc(-50% + ${px}px),calc(-50% + ${py}px))`}
function hideJoyViz(){joyViz.classList.remove("on");joyKnob.style.transform="translate(-50%,-50%)"}
function dashTowardScreenPoint(clientX,clientY){const rect=C.getBoundingClientRect(),sx=(clientX-rect.left)*(W/rect.width),sy=(clientY-rect.top)*(H/rect.height),worldX=CAM.x+sx-W/2,worldY=CAM.y+sy-H/2;return dashVector(worldX-P.x,worldY-P.y)}
function resetDashTap(){tapDash.time=0;tapDash.type="";tapDash.sourcePointer=null}
function processDashTap(e){const pointerType=e.pointerType||"mouse",now=performance.now(),dtap=now-tapDash.time,dist=hyp(e.clientX-tapDash.x,e.clientY-tapDash.y),doubleTap=tapDash.type===pointerType&&dtap>=40&&dtap<=660&&dist<=72;if(doubleTap){resetDashTap();dashTowardScreenPoint(e.clientX,e.clientY);return true}tapDash.time=now;tapDash.x=e.clientX;tapDash.y=e.clientY;tapDash.type=pointerType;tapDash.sourcePointer=e.pointerId;return false}
function screenJoyStart(e){if(!S||!S.run||S.end||S.waveState==="stage")return;if(e.target.closest&&e.target.closest("button,.modal"))return;const pointerType=e.pointerType||"mouse",touchLike=pointerType==="touch"||pointerType==="pen";if(touchLike&&joy.active&&e.pointerId!==joy.id){processDashTap(e);e.preventDefault();return}if(!touchLike){processDashTap(e);return}if(processDashTap(e)){e.preventDefault();return}if(!inMovementTouchZone(e.clientX,e.clientY)||joy.active)return;joy.active=true;joy.id=e.pointerId;joy.originX=e.clientX;joy.originY=e.clientY;joy.dx=0;joy.dy=0;showJoyViz();try{C.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()}
function screenJoyMove(e){if(!joy.active||e.pointerId!==joy.id)return;let dx=e.clientX-joy.originX,dy=e.clientY-joy.originY,mag=hyp(dx,dy);if(mag>18&&tapDash.sourcePointer===joy.id)resetDashTap();if(mag>JOY_RADIUS){dx=dx/mag*JOY_RADIUS;dy=dy/mag*JOY_RADIUS;mag=JOY_RADIUS}updateJoyViz(dx,dy);if(mag<=JOY_DEADZONE){joy.dx=0;joy.dy=0}else{const strength=(mag-JOY_DEADZONE)/(JOY_RADIUS-JOY_DEADZONE);joy.dx=dx/mag*strength;joy.dy=dy/mag*strength}e.preventDefault()}
function screenJoyEnd(e){if(!joy.active||e.pointerId!==joy.id){if(e.pointerType==="touch"||e.pointerType==="pen")e.preventDefault();return}joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;hideJoyViz();try{C.releasePointerCapture(e.pointerId)}catch(_){}e.preventDefault()}
function screenJoyCancel(e){if(tapDash.sourcePointer===e.pointerId)resetDashTap();screenJoyEnd(e)}
C.addEventListener("pointerdown",screenJoyStart,{passive:false});C.addEventListener("pointermove",screenJoyMove,{passive:false});C.addEventListener("pointerup",screenJoyEnd,{passive:false});C.addEventListener("pointercancel",screenJoyCancel,{passive:false});
resizeArena();reset();CAM.x=P.x;CAM.y=P.y;requestAnimationFrame(loop);window.addEventListener("resize",()=>{resizeArena();if(S)applyPipPower();updateCamera()});
