// B29 Pip Sound progression: one sound choice per Pip level, with upgradeable visual/audio flair.
const PIP_SOUND_MAX_LEVEL=4;
const PIP_SOUND_FX={
 honey:{color:"#ffd36f",freq:880},
 bubble:{color:"#9ee7ff",freq:690},
 starlight:{color:"#eafcff",freq:1180},
 plush:{color:"#ffb3c7",freq:520},
 cherub:{color:"#d9c8ff",freq:990},
 cosmic:{color:"#b388ff",freq:760}
};

function initPipSoundProgressB29(){
 if(!S)return;
 S.pipSoundCredits=1;
 S.pipSoundLevels={};
 S.pipSoundPack="base";
 S.pipSoundUnlocked=new Set();
}

const resetBeforeB29=reset;
reset=function(){
 resetBeforeB29();
 initPipSoundProgressB29();
 updateUI();
};
initPipSoundProgressB29();

// Every Pip level earned grants exactly one sound progression choice.
const gainPipXPBeforeB29=gainPipXP;
gainPipXP=function(amount,reason=""){
 const before=S?.pipLevel||1;
 gainPipXPBeforeB29(amount,reason);
 const after=S?.pipLevel||before;
 if(after>before){
   S.pipSoundCredits=(S.pipSoundCredits||0)+(after-before);
   showPipMessage(`${after-before===1?"a new Pip level means one new sound choice":"those Pip levels gave us "+(after-before)+" new sound choices"} ♪`,true);
 }
};

function pipSoundLevelB29(id){return Math.max(0,S?.pipSoundLevels?.[id]||0)}
function pipSoundUpgradeCostB29(id){
 const lv=pipSoundLevelB29(id);
 if(lv<=0){const p=PIP_SOUND_PACKS.find(x=>x.id===id);return p?.cost||1}
 if(lv>=PIP_SOUND_MAX_LEVEL)return Infinity;
 return lv;
}
function pipSoundLevelTextB29(lv){
 if(lv<=0)return "Palette locked.";
 if(lv===1)return "Voice palette unlocked.";
 if(lv===2)return "Cue particles unlocked.";
 if(lv===3)return "Pulse FX + harmonic layer unlocked.";
 return "Signature burst + richer cue finish unlocked.";
}
function pipSoundNextTextB29(lv){
 if(lv<=0)return "Unlock the voice palette.";
 if(lv===1)return "Next: Pip cue particles.";
 if(lv===2)return "Next: pulse FX and an extra harmonic layer.";
 if(lv===3)return "Next: signature particle burst and richer cue finish.";
 return "Fully upgraded.";
}

renderPipSoundStepB26=function(){
 ensurePipSoundStepB26();
 const credits=Math.max(0,S.pipSoundCredits||0),notes=Math.max(0,S.musicNotes||0);
 const current=S.pipSoundPack==="base"?"Pip Base":PIP_SOUND_PACKS.find(p=>p.id===S.pipSoundPack)?.name||"Pip Base";
 $("pipSoundBalance").textContent=`PIP LV ${S.pipLevel} · ${credits} Sound Choice${credits===1?"":"s"} · ♪ ${notes} Music Note${notes===1?"":"s"} · Current: ${current}`;
 const step=$("pipSoundStep"),p=step?.querySelector("p");
 if(p)p.textContent="Each Pip level grants one sound choice. Spend a choice plus Music Notes to unlock or upgrade one palette; switching between unlocked palettes is free.";
 const grid=$("pipSoundGrid");grid.innerHTML="";
 for(const pack of PIP_SOUND_PACKS){
   const lv=pipSoundLevelB29(pack.id),unlocked=lv>0,selected=S.pipSoundPack===pack.id,btn=document.createElement("button");
   btn.className="upgrade"+(selected?" equipped":"");
   const cost=pipSoundUpgradeCostB29(pack.id),maxed=lv>=PIP_SOUND_MAX_LEVEL;
   let action="";
   if(!unlocked){
     if(credits<1)action="NEXT SOUND CHOICE AT A PIP LEVEL";
     else if(notes<cost)action=`NEEDS ♪${cost}`;
     else action=`UNLOCK · ♪${cost} · USE 1 CHOICE`;
   }else if(!selected){
     action=maxed?"TAP TO USE · MAX":`TAP TO USE · LV ${lv}`;
   }else if(maxed){
     action="SELECTED · MAX";
   }else if(credits<1){
     action="SELECTED · NEXT UPGRADE AT A PIP LEVEL";
   }else if(notes<cost){
     action=`SELECTED · UPGRADE NEEDS ♪${cost}`;
   }else{
     action=`SELECTED · UPGRADE TO LV ${lv+1} · ♪${cost} · USE 1 CHOICE`;
   }
   btn.innerHTML=`<div class="heart">${pack.icon}</div><b>${pack.name} · ${unlocked?`Lv ${lv}`:"LOCKED"}</b><span class="small">${pack.desc}<br>${unlocked?pipSoundLevelTextB29(lv):pipSoundNextTextB29(0)}<br>${unlocked&&!maxed?pipSoundNextTextB29(lv)+"<br>":""}<strong>${action}</strong></span>`;
   btn.addEventListener("click",()=>selectPipSoundPackB26(pack.id));
   grid.appendChild(btn);
 }
};

selectPipSoundPackB26=function(id){
 const pack=PIP_SOUND_PACKS.find(p=>p.id===id);if(!pack)return;
 const lv=pipSoundLevelB29(id),unlocked=lv>0;
 if(unlocked&&S.pipSoundPack!==id){
   S.pipSoundPack=id;
   renderPipSoundStepB26();
   sfxPipCue("return");
   showPipMessage(`${pack.name} selected.`,true);
   return;
 }
 if(unlocked&&lv>=PIP_SOUND_MAX_LEVEL){showPipMessage(`${pack.name} is already fully upgraded.`,true);return}
 if((S.pipSoundCredits||0)<1){showPipMessage("we get one new sound choice each time I gain a Pip level.",true);return}
 const cost=pipSoundUpgradeCostB29(id);
 if((S.musicNotes||0)<cost){
   const need=cost-(S.musicNotes||0);
   showPipMessage(`we need ${need} more Music Note${need===1?"":"s"} for ${pack.name}.`,true);return;
 }
 S.musicNotes-=cost;S.pipSoundCredits--;
 if(!unlocked){
   S.pipSoundLevels[id]=1;S.pipSoundUnlocked.add(id);S.pipSoundPack=id;
   showPipMessage(`${pack.name} unlocked. that's our sound now ✦`,true);
 }else{
   S.pipSoundLevels[id]=lv+1;
   showPipMessage(`${pack.name} is level ${lv+1}. it has a little more personality now ✦`,true);
 }
 renderPipSoundStepB26();sfxPipCue("return");
};

openPipSoundStepB26=function(){
 ensurePipSoundStepB26();
 $("emotionStep").classList.add("stagehidden");$("abilityStep").classList.add("stagehidden");$("audioStep").classList.add("stagehidden");$("pipSoundStep").classList.remove("stagehidden");
 renderPipSoundStepB26();
 showPipMessage((S.pipSoundCredits||0)>0?"I earned a sound choice from leveling up. want a new voice or should we deepen one we already love?":"no new sound choice yet, but you can still switch between anything we've unlocked.",true);
};

function pipSoundFlairB29(kind="talk",big=false){
 if(!S||S.pipSoundPack==="base")return;
 const id=S.pipSoundPack,lv=pipSoundLevelB29(id);if(lv<2)return;
 const fx=PIP_SOUND_FX[id]||PIP_SOUND_FX.starlight;
 const x=Number.isFinite(P.pipX)?P.pipX:P.x,y=Number.isFinite(P.pipY)?P.pipY:P.y;
 particle(x,y,fx.color,lv>=4?(big?16:8):(big?9:4),lv>=4?125:82);
 if(lv>=3&&(big||kind==="heart"||kind==="return"))ring(x,y,fx.color,lv>=4?66:44);
 if(lv>=4&&big){particle(x,y,"#ffffff",8,150);ring(x,y,"#ffffff",36)}
 if(lv>=3&&ensureAudio()){
   const t=audioCtx.currentTime;
   audioEngine.fmBell(fx.freq,t+.025,.13,lv>=4?.010:.006,-.12,audioEngine.sfx);
   if(lv>=4)audioEngine.fmBell(fx.freq*1.25,t+.065,.16,.007,.16,audioEngine.sfx);
 }
}
const sfxPipCueBeforeB29=sfxPipCue,sfxPipLoveBeforeB29=sfxPipLove;
sfxPipCue=function(kind="talk"){sfxPipCueBeforeB29(kind);pipSoundFlairB29(kind,false)};
sfxPipLove=function(){sfxPipLoveBeforeB29();pipSoundFlairB29("love",true)};

// Make the sound step's progression state obvious in the HUD without adding another permanent meter.
const updateUIBeforeB29=updateUI;
updateUI=function(){
 updateUIBeforeB29();
 if($("currencyHud"))$("currencyHud").textContent=`♥ ${S.heartCurrency} · ★ ${S.starPoints} · ♪ ${S.musicNotes||0} · ◆ ${S.prismSeeds||0}${(S.pipSoundCredits||0)>0?` · SOUND ${S.pipSoundCredits}`:""}`;
};
