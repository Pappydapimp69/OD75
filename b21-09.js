// B25 Overdrive selection: tap selects; hold confirms unlocks and upgrades.
const OVERDRIVE_HOLD_MS=1800;
const overHold={active:false,id:null,pointerId:null,start:0,raf:0,suppressId:null,suppressUntil:0};

function resetOverdriveHoldVisual(id){
 const i=OVER_ORDER.indexOf(id);
 if(i<0)return;
 const btn=$("overChoice"+i);
 btn.classList.remove("over-holding");
 btn.style.removeProperty("background");
 btn.style.removeProperty("background-image");
}

function cancelOverdriveHold(pointerId=null){
 if(!overHold.active)return;
 if(pointerId!==null&&pointerId!==overHold.pointerId)return;
 cancelAnimationFrame(overHold.raf);
 const id=overHold.id;
 overHold.active=false;overHold.id=null;overHold.pointerId=null;overHold.start=0;overHold.raf=0;
 resetOverdriveHoldVisual(id);
 renderOverdriveStep();
}

function completeOverdriveHoldAction(id){
 if(!S.stagePending||!S.bossRewardPending)return false;
 const info=OVERDRIVE_INFO[id];if(!info)return false;
 if(!S.overUnlocked.has(id)){
   const cost=info.unlock;
   if(S.starPoints<cost){
     showPipMessage(`we need ${cost-S.starPoints} more Run Star${cost-S.starPoints===1?"":"s"} to unlock ${info.name}.`,true);
     return false;
   }
   S.starPoints-=cost;
   S.overUnlocked.add(id);
   S.overLevels[id]=1;
   S.overType=id;
   showPipMessage(`${info.name} unlocked and selected.`,true);
   if(navigator.vibrate)try{navigator.vibrate(35)}catch(_){}
   return true;
 }
 const lv=overLevel(id);
 if(lv>=5)return false;
 const cost=overUpgradeCost(id);
 if(S.starPoints<cost){
   showPipMessage(`we need ${cost-S.starPoints} more Run Star${cost-S.starPoints===1?"":"s"} to deepen ${info.name}.`,true);
   return false;
 }
 S.starPoints-=cost;
 S.overLevels[id]=lv+1;
 showPipMessage(`${info.name} is level ${S.overLevels[id]}. confirmed ✦`,true);
 if(navigator.vibrate)try{navigator.vibrate(35)}catch(_){}
 return true;
}

function tickOverdriveHold(){
 if(!overHold.active)return;
 const elapsed=performance.now()-overHold.start;
 const progress=clamp(elapsed/OVERDRIVE_HOLD_MS,0,1);
 const i=OVER_ORDER.indexOf(overHold.id),btn=i>=0?$("overChoice"+i):null;
 if(btn){
   const pct=(progress*100).toFixed(1)+"%";
   btn.style.background=`linear-gradient(90deg, rgba(255,211,111,.34) 0%, rgba(255,211,111,.34) ${pct}, rgba(255,255,255,.04) ${pct}, rgba(255,255,255,.04) 100%)`;
   const strong=btn.querySelector("strong");
   if(strong)strong.textContent="KEEP HOLDING · RELEASE TO CANCEL";
 }
 if(progress>=1){
   const id=overHold.id;
   overHold.active=false;overHold.id=null;overHold.pointerId=null;overHold.start=0;overHold.raf=0;
   overHold.suppressId=id;overHold.suppressUntil=performance.now()+700;
   resetOverdriveHoldVisual(id);
   completeOverdriveHoldAction(id);
   renderOverdriveStep();
   return;
 }
 overHold.raf=requestAnimationFrame(tickOverdriveHold);
}

function beginOverdriveHold(id,e){
 if(!S.stagePending||!S.bossRewardPending||overHold.active)return;
 const info=OVERDRIVE_INFO[id];if(!info)return;
 const unlocked=S.overUnlocked.has(id);
 const cost=unlocked?overUpgradeCost(id):info.unlock;
 if(unlocked&&overLevel(id)>=5)return;
 if(S.starPoints<cost)return;
 const i=OVER_ORDER.indexOf(id),btn=$("overChoice"+i);
 overHold.active=true;overHold.id=id;overHold.pointerId=e.pointerId;overHold.start=performance.now();
 btn.classList.add("over-holding");
 try{btn.setPointerCapture(e.pointerId)}catch(_){}
 e.preventDefault();
 tickOverdriveHold();
}

// Taps only select skills that are already unlocked. Spending Stars requires a completed hold.
chooseOverdrive=function(id){
 if(overHold.suppressId===id&&performance.now()<overHold.suppressUntil){
   overHold.suppressId=null;overHold.suppressUntil=0;return;
 }
 if(!S.stagePending||!S.bossRewardPending)return;
 const info=OVERDRIVE_INFO[id];if(!info)return;
 if(!S.overUnlocked.has(id)){
   showPipMessage(`${info.name} is locked. hold the skill to unlock it.`,true);
 }else if(S.overType!==id){
   S.overType=id;showPipMessage(`${info.name} selected for the next charge.`,true);
 }else{
   showPipMessage(`${info.name} is selected.`,true);
 }
 renderOverdriveStep();
};

renderOverdriveStep=function(){
 $("starBalance").textContent=`★ ${S.starPoints} Run Stars · ${S.starsTotal} collected this run · next boss at ${S.nextBossStars} total stars`;
 OVER_ORDER.forEach((id,i)=>{
   const info=OVERDRIVE_INFO[id],btn=$("overChoice"+i),unlocked=S.overUnlocked.has(id),lv=overLevel(id),equipped=S.overType===id;
   btn.classList.toggle("equipped",equipped);btn.classList.toggle("locked",!unlocked);
   let action="";
   if(!unlocked)action=S.starPoints>=info.unlock?`HOLD TO UNLOCK · ★${info.unlock}`:`UNLOCK NEEDS ★${info.unlock}`;
   else if(lv>=5)action=equipped?"SELECTED · MAX":"TAP TO SELECT · MAX";
   else{
     const cost=overUpgradeCost(id),canUpgrade=S.starPoints>=cost;
     action=`${equipped?"SELECTED":"TAP TO SELECT"} · ${canUpgrade?`HOLD TO UPGRADE · ★${cost}`:`UPGRADE NEEDS ★${cost}`}`;
   }
   const extra=id==="pip"?`Your build: ♥${S.pipLove} Loving · ♡${S.pipCompassion} Compassionate · ✦${S.pipSupport} Supportive.`:info.desc;
   btn.innerHTML=`<div class="heart">${info.icon}</div><b>${info.name} · ${unlocked?`Lv ${lv}`:"LOCKED"}</b><span class="small">${extra}<br><strong>${action}</strong></span>`;
 });
 $("continueOverdrive").textContent=`Continue with ${OVERDRIVE_INFO[S.overType].name}`;
};

OVER_ORDER.forEach((id,i)=>{
 const btn=$("overChoice"+i);
 btn.style.touchAction="none";
 btn.style.userSelect="none";
 btn.style.webkitUserSelect="none";
 btn.addEventListener("contextmenu",e=>e.preventDefault());
 btn.addEventListener("pointerdown",e=>beginOverdriveHold(id,e));
 btn.addEventListener("pointerup",e=>cancelOverdriveHold(e.pointerId));
 btn.addEventListener("pointercancel",e=>cancelOverdriveHold(e.pointerId));
 btn.addEventListener("lostpointercapture",e=>cancelOverdriveHold(e.pointerId));
});

const overdriveHelp=$("overdriveStep")?.querySelector("p");
if(overdriveHelp)overdriveHelp.textContent="Tap an unlocked skill to select it. Hold a skill to unlock or upgrade it; the button fills to confirm. Releasing early cancels with no Stars spent.";
