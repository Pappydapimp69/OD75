// B35 gamepad modal navigation: all between-stage upgrade screens are controller navigable.
const gamepadMenuB35={
 focus:null,navX:0,navY:0,nextNavAt:0,aHeld:false,bHeld:false,overId:null,overCompleted:false
};

(function installGamepadMenuStyleB35(){
 if(document.getElementById("gamepadMenuStyleB35"))return;
 const style=document.createElement("style");
 style.id="gamepadMenuStyleB35";
 style.textContent=`#stageUp button.gamepad-focus{outline:3px solid #7ed8ff;outline-offset:3px;box-shadow:0 0 0 5px #7ed8ff18,0 0 24px #7ed8ff44}`;
 document.head.appendChild(style);
})();

function stageUpgradeVisibleB35(){
 return !!(S&&S.stagePending&&$("stageUp")&&!$("stageUp").classList.contains("hidden"));
}
function gamepadMenuButtonsB35(){
 const root=$("stageUp");if(!root)return[];
 return [...root.querySelectorAll("button")].filter(btn=>{
   if(btn.disabled||btn.style.display==="none")return false;
   if(btn.closest(".stagehidden"))return false;
   const r=btn.getBoundingClientRect();
   return r.width>2&&r.height>2;
 });
}
function focusGamepadButtonB35(btn){
 const buttons=gamepadMenuButtonsB35();
 for(const b of buttons)b.classList.toggle("gamepad-focus",b===btn);
 gamepadMenuB35.focus=btn||null;
 if(btn){try{btn.focus({preventScroll:true})}catch(_){try{btn.focus()}catch(__){}}
   try{btn.scrollIntoView({block:"nearest",inline:"nearest"})}catch(_){}
 }
}
function ensureGamepadMenuFocusB35(){
 const buttons=gamepadMenuButtonsB35();
 if(!buttons.length){gamepadMenuB35.focus=null;return null}
 if(!gamepadMenuB35.focus||!buttons.includes(gamepadMenuB35.focus))focusGamepadButtonB35(buttons[0]);
 return gamepadMenuB35.focus;
}
function moveGamepadMenuFocusB35(dx,dy){
 const buttons=gamepadMenuButtonsB35();if(!buttons.length)return;
 const current=ensureGamepadMenuFocusB35();if(!current)return;
 const cr=current.getBoundingClientRect(),cx=cr.left+cr.width/2,cy=cr.top+cr.height/2;
 let best=null,bestScore=Infinity;
 for(const btn of buttons){
   if(btn===current)continue;
   const r=btn.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,rx=x-cx,ry=y-cy;
   const primary=dx?rx*dx:ry*dy;
   if(primary<=4)continue;
   const cross=dx?Math.abs(ry):Math.abs(rx);
   const score=primary+cross*1.65;
   if(score<bestScore){bestScore=score;best=btn}
 }
 if(!best){
   const i=buttons.indexOf(current),step=(dx>0||dy>0)?1:-1;
   best=buttons[(i+step+buttons.length)%buttons.length];
 }
 focusGamepadButtonB35(best);
}
function gamepadBackActionB35(){
 const ids=["continueOverdrive","skipPipUpgrade","continueAbilities"];
 for(const id of ids){
   const btn=$(id);if(!btn||btn.disabled||btn.style.display==="none"||btn.closest(".stagehidden"))continue;
   const r=btn.getBoundingClientRect();if(r.width>2&&r.height>2){btn.click();return true}
 }
 return false;
}
function beginGamepadOverdriveHoldB35(id){
 if(!S.stagePending||!S.bossRewardPending||overHold.active)return false;
 const info=OVERDRIVE_INFO[id];if(!info)return false;
 const unlocked=S.overUnlocked.has(id),cost=unlocked?overUpgradeCost(id):info.unlock;
 if(unlocked&&overLevel(id)>=5)return false;
 if(S.starPoints<cost)return false;
 const i=OVER_ORDER.indexOf(id),btn=i>=0?$("overChoice"+i):null;if(!btn)return false;
 overHold.active=true;overHold.id=id;overHold.pointerId="gamepad";overHold.start=performance.now();overHold.raf=0;
 btn.classList.add("over-holding");
 tickOverdriveHold();
 return true;
}
function pressGamepadMenuA_B35(){
 const btn=ensureGamepadMenuFocusB35();if(!btn)return;
 const match=/^overChoice(\d+)$/.exec(btn.id||"");
 if(match){
   const id=OVER_ORDER[Number(match[1])];
   gamepadMenuB35.overId=id||null;gamepadMenuB35.overCompleted=false;
   if(id)beginGamepadOverdriveHoldB35(id);
   return;
 }
 btn.click();
}
function releaseGamepadMenuA_B35(){
 if(!gamepadMenuB35.overId)return;
 const id=gamepadMenuB35.overId,i=OVER_ORDER.indexOf(id),btn=i>=0?$("overChoice"+i):null;
 const wasActive=overHold.active&&overHold.pointerId==="gamepad";
 if(wasActive)cancelOverdriveHold("gamepad");
 if(btn)btn.click();
 gamepadMenuB35.overId=null;gamepadMenuB35.overCompleted=false;
}
function clearGamepadMenuB35(){
 if(gamepadMenuB35.focus)gamepadMenuB35.focus.classList.remove("gamepad-focus");
 if(overHold.active&&overHold.pointerId==="gamepad")cancelOverdriveHold("gamepad");
 gamepadMenuB35.focus=null;gamepadMenuB35.navX=0;gamepadMenuB35.navY=0;gamepadMenuB35.nextNavAt=0;
 gamepadMenuB35.aHeld=false;gamepadMenuB35.bHeld=false;gamepadMenuB35.overId=null;
}
function updateGamepadMenuB35(){
 if(!stageUpgradeVisibleB35()){clearGamepadMenuB35();return false}
 const pads=navigator.getGamepads?navigator.getGamepads():[];let pad=null;
 if(gamepad.index!==null&&pads[gamepad.index]&&pads[gamepad.index].connected)pad=pads[gamepad.index];
 if(!pad){for(const candidate of pads)if(candidate&&candidate.connected){pad=candidate;break}}
 if(!pad){ensureGamepadMenuFocusB35();return true}
 gamepad.index=pad.index;
 const pressed=i=>!!(pad.buttons&&pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5));
 const ax=clamp((pad.axes&&pad.axes[0])||0,-1,1),ay=clamp((pad.axes&&pad.axes[1])||0,-1,1);
 let nx=(pressed(15)?1:0)-(pressed(14)?1:0),ny=(pressed(13)?1:0)-(pressed(12)?1:0);
 if(!nx&&Math.abs(ax)>.55)nx=Math.sign(ax);
 if(!ny&&Math.abs(ay)>.55)ny=Math.sign(ay);
 const now=performance.now();
 const changed=nx!==gamepadMenuB35.navX||ny!==gamepadMenuB35.navY;
 if((nx||ny)&&(changed||now>=gamepadMenuB35.nextNavAt)){
   if(Math.abs(nx)>=Math.abs(ny)&&nx)moveGamepadMenuFocusB35(nx,0);else if(ny)moveGamepadMenuFocusB35(0,ny);
   gamepadMenuB35.nextNavAt=now+(changed?330:135);
 }
 if(!nx&&!ny)gamepadMenuB35.nextNavAt=0;
 gamepadMenuB35.navX=nx;gamepadMenuB35.navY=ny;
 const a=pressed(0);
 if(a&&!gamepadMenuB35.aHeld)pressGamepadMenuA_B35();
 if(!a&&gamepadMenuB35.aHeld)releaseGamepadMenuA_B35();
 gamepadMenuB35.aHeld=a;
 const b=pressed(1);
 if(b&&!gamepadMenuB35.bHeld)gamepadBackActionB35();
 gamepadMenuB35.bHeld=b;
 ensureGamepadMenuFocusB35();
 return true;
}

const updateGamepadInputBeforeB35=updateGamepadInput;
updateGamepadInput=function(){
 updateGamepadInputBeforeB35();
 updateGamepadMenuB35();
};
