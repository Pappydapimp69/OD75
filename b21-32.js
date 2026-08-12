// B45 cadence + Sound Lab hold confirmation.
const B45_EXPLORATION_KILL_INTERVAL=15;
const SOUNDLAB_HOLD_MS=typeof OVERDRIVE_HOLD_MS==="number"?OVERDRIVE_HOLD_MS:1800;
const soundLabHold={active:false,kind:null,id:null,index:-1,pointerId:null,start:0,raf:0,button:null,suppressUntil:0};

// Special exploration rolls now happen every 15 non-boss kills.
checkKillMilestoneDropB30=function(){
 if(!S||S.end)return;
 if(!Number.isFinite(S.b30LastKillMilestone))S.b30LastKillMilestone=0;
 while(S.kills>=S.b30LastKillMilestone+B45_EXPLORATION_KILL_INTERVAL){
   S.b30LastKillMilestone+=B45_EXPLORATION_KILL_INTERVAL;
   rollExplorationDropB30();
 }
};

// Mix Choices: Pip Lv 5, Lv 10, then every 10 levels (20,30,40...). No free Lv1 Mix Choice.
function isMixChoiceLevelB45(lv){return lv===5||lv===10||(lv>=20&&lv%10===0)}
function nextMixLevelB45(from=S?.pipLevel||1){
 const lv=Math.max(1,Math.floor(from));
 if(lv<5)return 5;
 if(lv<10)return 10;
 return Math.max(20,(Math.floor(lv/10)+1)*10);
}
function countOldMixCrossingsB45(before,after){let n=0;for(let lv=before+1;lv<=after;lv++)if(lv%5===0)n++;return n}
function countNewMixCrossingsB45(before,after){let n=0;for(let lv=before+1;lv<=after;lv++)if(isMixChoiceLevelB45(lv))n++;return n}
nextMixLevelB41=function(){return nextMixLevelB45()};

const gainPipXPBeforeB45=gainPipXP;
gainPipXP=function(amount,reason=""){
 const before=S?.pipLevel||1;
 gainPipXPBeforeB45(amount,reason);
 const after=S?.pipLevel||before;
 if(after<=before)return;
 const oldEarned=countOldMixCrossingsB45(before,after),newEarned=countNewMixCrossingsB45(before,after);
 S.audioMixCredits=Math.max(0,(S.audioMixCredits||0)-oldEarned+newEarned);
 if(newEarned&&newEarned!==oldEarned)showPipMessage(newEarned===1?`Pip Lv ${after}: new Mix Choice unlocked ♪`:`${newEarned} new Mix Choices unlocked ♪`,true);
};

const resetBeforeB45=reset;
reset=function(){
 resetBeforeB45();
 S.audioMixCredits=0;
 updateUI();
};
if(S)S.audioMixCredits=0;

function soundLabAffordableB45(kind,id,index){
 if(!S?.stagePending)return false;
 if(kind==="pip"){
   const lv=pipSoundLevelB29(id);if(lv>=PIP_SOUND_MAX_LEVEL)return false;
   const cost=pipSoundUpgradeCostB29(id);
   return (S.pipSoundCredits||0)>=1&&(S.musicNotes||0)>=cost;
 }
 const a=S.audioChoices?.[index];if(!a||a.id!==id)return false;
 const lv=audioLevelB41(id);if(lv>=B41_AUDIO_MAX_LEVEL)return false;
 const cost=audioUpgradeCostB41(id);
 return (S.audioMixCredits||0)>=1&&(S.musicNotes||0)>=cost;
}
function completeSoundLabHoldB45(kind,id,index){
 if(!soundLabAffordableB45(kind,id,index))return false;
 if(kind==="pip"){
   const pack=PIP_SOUND_PACKS.find(p=>p.id===id);if(!pack)return false;
   const lv=pipSoundLevelB29(id),cost=pipSoundUpgradeCostB29(id);
   S.musicNotes-=cost;S.pipSoundCredits--;
   if(lv<=0){S.pipSoundLevels[id]=1;S.pipSoundUnlocked.add(id);showPipMessage(`${pack.name} unlocked. it now stacks with every other Pip sound ✦`,true)}
   else{S.pipSoundLevels[id]=lv+1;showPipMessage(`${pack.name} is level ${lv+1}. its layer just got richer ✦`,true)}
   S.pipSoundPack="stack";renderPipSoundStepB26();sfxPipCue("return");
 }else{
   const a=S.audioChoices?.[index];if(!a||a.id!==id)return false;
   const lv=audioLevelB41(id),cost=audioUpgradeCostB41(id);
   S.musicNotes-=cost;S.audioMixCredits--;S.audioLevels[id]=lv+1;S.audioUnlocks.add(id);
   const family=typeof familyForAudioB42==="function"?familyForAudioB42(id):null;
   const active=family&&B42_FAMILY_PACKS[family]?(B42_FAMILY_PACKS[family]||[]).filter(x=>pipThemeLevelB41(x)>0):[];
   showPipMessage(lv===0?`${a.name} unlocked.${active.length?` ${B42_FAMILY_NAME[family]} is resonating ✦`:" it is now part of our mix."}`:`${a.name} is level ${lv+1}. the mix just got richer ✦`,true);
   if(audioCtx)burstTone(a.kind==="music"?660:520,4);
   chooseAudioOptionsB41();renderPipSoundStepB26();
 }
 if(navigator.vibrate)try{navigator.vibrate(35)}catch(_){}
 return true;
}
function clearSoundLabHoldVisualB45(){
 const btn=soundLabHold.button;if(btn){btn.classList.remove("soundlab-holding");btn.style.removeProperty("background");btn.style.removeProperty("background-image")}
}
function cancelSoundLabHoldB45(pointerId=null){
 if(!soundLabHold.active)return;
 if(pointerId!==null&&pointerId!==soundLabHold.pointerId)return;
 cancelAnimationFrame(soundLabHold.raf);clearSoundLabHoldVisualB45();
 soundLabHold.active=false;soundLabHold.kind=null;soundLabHold.id=null;soundLabHold.index=-1;soundLabHold.pointerId=null;soundLabHold.start=0;soundLabHold.raf=0;soundLabHold.button=null;
 renderPipSoundStepB26();if(typeof renderAudioChoicesB41==="function")renderAudioChoicesB41();
}
function tickSoundLabHoldB45(){
 if(!soundLabHold.active)return;
 const progress=clamp((performance.now()-soundLabHold.start)/SOUNDLAB_HOLD_MS,0,1),btn=soundLabHold.button;
 if(btn){const pct=(progress*100).toFixed(1)+"%";btn.style.background=`linear-gradient(90deg, rgba(158,231,255,.34) 0%, rgba(158,231,255,.34) ${pct}, rgba(255,255,255,.04) ${pct}, rgba(255,255,255,.04) 100%)`;const strong=btn.querySelector("strong");if(strong)strong.textContent="KEEP HOLDING · RELEASE TO CANCEL"}
 if(progress>=1){
   const {kind,id,index}=soundLabHold;cancelAnimationFrame(soundLabHold.raf);clearSoundLabHoldVisualB45();
   soundLabHold.active=false;soundLabHold.suppressUntil=performance.now()+700;soundLabHold.button=null;
   completeSoundLabHoldB45(kind,id,index);
   soundLabHold.kind=null;soundLabHold.id=null;soundLabHold.index=-1;soundLabHold.pointerId=null;soundLabHold.start=0;soundLabHold.raf=0;
   return;
 }
 soundLabHold.raf=requestAnimationFrame(tickSoundLabHoldB45);
}
function beginSoundLabHoldB45(btn,e){
 if(soundLabHold.active||!S?.stagePending)return;
 const kind=btn.dataset.soundHoldKind,id=btn.dataset.soundHoldId,index=Number(btn.dataset.soundHoldIndex??-1);
 if(!kind||!id||!soundLabAffordableB45(kind,id,index))return;
 soundLabHold.active=true;soundLabHold.kind=kind;soundLabHold.id=id;soundLabHold.index=index;soundLabHold.pointerId=e.pointerId;soundLabHold.start=performance.now();soundLabHold.button=btn;
 btn.classList.add("soundlab-holding");try{btn.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();tickSoundLabHoldB45();
}

// Existing click handlers no longer spend currency. Holding is the only spend path.
selectPipSoundPackB26=function(id){
 if(performance.now()<soundLabHold.suppressUntil)return;
 const pack=PIP_SOUND_PACKS.find(p=>p.id===id);if(!pack)return;
 const lv=pipSoundLevelB29(id),cost=pipSoundUpgradeCostB29(id);
 if(lv>=PIP_SOUND_MAX_LEVEL){showPipMessage(`${pack.name} is already fully upgraded and active.`,true);return}
 if((S.pipSoundCredits||0)<1){showPipMessage("the next Pip level gives us another Sound Choice.",true);return}
 if((S.musicNotes||0)<cost){showPipMessage(`we need ${cost-(S.musicNotes||0)} more Music Note${cost-(S.musicNotes||0)===1?"":"s"} for ${pack.name}.`,true);return}
 showPipMessage(`hold ${pack.name} to ${lv?"upgrade":"unlock"} it.`,true);
};
chooseAudioUnlock=function(index){
 if(performance.now()<soundLabHold.suppressUntil)return;
 const a=S.audioChoices?.[index];if(!a)return;
 const lv=audioLevelB41(a.id),cost=audioUpgradeCostB41(a.id);
 if(lv>=B41_AUDIO_MAX_LEVEL)return;
 if((S.audioMixCredits||0)<1){showPipMessage(`next Mix Choice arrives at Pip level ${nextMixLevelB45()}.`,true);return}
 if((S.musicNotes||0)<cost){showPipMessage(`we need ${cost-(S.musicNotes||0)} more Music Note${cost-(S.musicNotes||0)===1?"":"s"} for ${a.name}.`,true);return}
 showPipMessage(`hold ${a.name} to ${lv?"upgrade":"unlock"} it.`,true);
};

function annotateSoundLabButtonsB45(){
 const pipButtons=[...($("pipSoundGrid")?.querySelectorAll("button.upgrade")||[])];
 pipButtons.forEach((btn,i)=>{const pack=PIP_SOUND_PACKS[i];if(!pack)return;btn.dataset.soundHoldKind="pip";btn.dataset.soundHoldId=pack.id;btn.style.touchAction="none";btn.style.userSelect="none"});
 for(let i=0;i<3;i++){const btn=$("audioChoice"+i),a=S?.audioChoices?.[i];if(!btn||!a)continue;btn.dataset.soundHoldKind="mix";btn.dataset.soundHoldId=a.id;btn.dataset.soundHoldIndex=String(i);btn.style.touchAction="none";btn.style.userSelect="none"}
}
const renderPipSoundStepBeforeB45=renderPipSoundStepB26;
renderPipSoundStepB26=function(){renderPipSoundStepBeforeB45();annotateSoundLabButtonsB45();const p=$("pipSoundStep")?.querySelector(":scope > p");if(p)p.textContent="Hold a Sound Lab item to unlock or upgrade it. Releasing early cancels with no Notes, Sound Choices, or Mix Choices spent."};
const renderAudioChoicesBeforeB45=renderAudioChoicesB41;
renderAudioChoicesB41=function(){renderAudioChoicesBeforeB45();annotateSoundLabButtonsB45()};

const soundLabRootB45=$("pipSoundStep");
if(soundLabRootB45&&!soundLabRootB45.dataset.holdB45){
 soundLabRootB45.dataset.holdB45="1";
 soundLabRootB45.addEventListener("contextmenu",e=>{if(e.target.closest("[data-sound-hold-kind]"))e.preventDefault()});
 soundLabRootB45.addEventListener("pointerdown",e=>{const btn=e.target.closest("[data-sound-hold-kind]");if(btn&&soundLabRootB45.contains(btn))beginSoundLabHoldB45(btn,e)});
 for(const type of ["pointerup","pointercancel","lostpointercapture"])soundLabRootB45.addEventListener(type,e=>cancelSoundLabHoldB45(e.pointerId));
}

(function updateSoundLabCadenceCopyB45(){
 const audioCopy=$("audioStep")?.querySelector(":scope > p");if(audioCopy)audioCopy.textContent="Hold to unlock or upgrade. Mix Choices arrive at Pip Lv 5, 10, then every 10 levels.";
 const intro=$("pipSoundStep")?.querySelector(":scope > p");if(intro)intro.textContent="Hold a Sound Lab item to unlock or upgrade it. Releasing early cancels without spending anything.";
})();
