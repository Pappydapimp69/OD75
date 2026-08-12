// B23 Overdrive selection: tap equips; a deliberate 4-second hold upgrades.
const OVERDRIVE_HOLD_MS=4000;
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

function completeOverdriveUpgrade(id){
 if(!S.stagePending||!S.bossRewardPending||!S.overUnlocked.has(id))return false;
 const info=OVERDRIVE_INFO[id],lv=overLevel(id);
 if(lv>=5)return false;
 const cost=overUpgradeCost(id);
 if(S.starPoints<cost){
   showPipMessage(`we need ${cost-S.starPoints} more Run Star${cost-S.starPoints===1?"":"s"} to deepen ${info.name}.`,true);
   return false;
 }
 S.starPoints-=cost;
 S.overLevels[id]=lv+1;
 showPipMessage(`${info.name} is level ${S.overLevels[id]}. hold confirmed ✦`,true);
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
   if(strong)strong.textContent=`HOLD ${(Math.max(0,OVERDRIVE_HOLD_MS-elapsed)/1000).toFixed(1)}s · RELEASE TO CANCEL`;
 }
 if(progress>=1){
   const id=overHold.id;
   overHold.active=false;overHold.id=null;overHold.pointerId=null;overHold.start=0;overHold.raf=0;
   overHold.suppressId=id;overHold.suppressUntil=performance.now()+900;
   resetOverdriveHoldVisual(id);
   completeOverdriveUpgrade(id);
   renderOverdriveStep();
   return;
 }
 overHold.raf=requestAnimationFrame(tickOverdriveHold);
}

function beginOverdriveHold(id,e){
 if(!S.stagePending||!S.bossRewardPending||overHold.active)return;
 if(!S.overUnlocked.has(id)||overLevel(id)>=5)return;
 const cost=overUpgradeCost(id);
 if(S.starPoints<cost)return;
 const i=OVER_ORDER.indexOf(id),btn=$("overChoice"+i);
 overHold.active=true;overHold.id=id;overHold.pointerId=e.pointerId;overHold.start=performance.now();
 btn.classList.add("over-holding");
 try{btn.setPointerCapture(e.pointerId)}catch(_){}
 e.preventDefault();
 tickOverdriveHold();
}

// Ordinary activation can unlock/equip, but can never buy a level.
chooseOverdrive=function(id){
 if(overHold.suppressId===id&&performance.now()<overHold.suppressUntil){
   overHold.suppressId=null;overHold.suppressUntil=0;return;
 }
 if(!S.stagePending||!S.bossRewardPending)return;
 const info=OVERDRIVE_INFO[id];if(!info)return;
 if(!S.overUnlocked.has(id)){
   if(S.starPoints<info.unlock){showPipMessage(`we need ${info.unlock-S.starPoints} more Run Star${info.unlock-S.starPoints===1?"":"s"} to unlock ${info.name}.`,true);return}
   S.starPoints-=info.unlock;S.overUnlocked.add(id);S.overLevels[id]=1;S.overType=id;
   showPipMessage(`${info.name} unlocked and selected.`,true);
 }else if(S.overType!==id){
   S.overType=id;showPipMessage(`${info.name} selected for the next charge.`,true);
 }else{
   showPipMessage(`${info.name} is selected. hold it for 4 seconds to upgrade.`,true);
 }
 renderOverdriveStep();
};

renderOverdriveStep=function(){
 $("starBalance").textContent=`★ ${S.starPoints} Run Stars · ${S.starsTotal} collected this run · next boss at ${S.nextBossStars} total stars`;
 OVER_ORDER.forEach((id,i)=>{
   const info=OVERDRIVE_INFO[id],btn=$("overChoice"+i),unlocked=S.overUnlocked.has(id),lv=overLevel(id),equipped=S.overType===id;
   btn.classList.toggle("equipped",equipped);btn.classList.toggle("locked",!unlocked);
   let action="";
   if(!unlocked)action=`TAP TO UNLOCK + SELECT · ★${info.unlock}`;
   else if(lv>=5)action=equipped?"SELECTED · MAX":"TAP TO SELECT · MAX";
   else{
     const cost=overUpgradeCost(id),canUpgrade=S.starPoints>=cost;
     action=`${equipped?"SELECTED":"TAP TO SELECT"} · ${canUpgrade?`HOLD 4s TO UPGRADE · ★${cost}`:`UPGRADE NEEDS ★${cost}`}`;
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
