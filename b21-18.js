// B31 cumulative audio: every unlocked Pip sound stays active and layers with the base cue.
function activePipSoundIdsB31(){
 return PIP_SOUND_PACKS.map(p=>p.id).filter(id=>pipSoundLevelB29(id)>0);
}

function playPipSoundLayerB31(id,kind="talk",big=false,scale=1){
 if(!ensureAudio())return;
 const t=audioCtx.currentTime,offset=kind==="heart"?80:kind==="return"?45:kind==="depart"?-35:0;
 const g=n=>n*scale;
 if(id==="honey"){
   audioEngine.fmBell(720+offset,t,.18,g(big?.035:.020),-.18,audioEngine.sfx);
   audioEngine.fmBell(900+offset,t+.045,.20,g(big?.030:.016),.20,audioEngine.sfx);
 }else if(id==="bubble"){
   audioEngine.pop(t,g(big?.040:.024),-.18);
   audioEngine.sfxTone(520+offset,.08,g(big?.030:.018),"sine");
   if(big)audioEngine.pop(t+.055,g(.027),.24);
 }else if(id==="starlight"){
   [820,1030,1290].slice(0,big?3:2).forEach((f,i)=>audioEngine.fmBell(f+offset,t+i*.035,.20,g(big?.027:.016),(i-1)*.22,audioEngine.sfx));
 }else if(id==="plush"){
   audioEngine.voice(360+offset*.35,t,.11,g(big?.030:.018),"sine",-.12,1700,.008,.07,-4,audioEngine.sfx);
   audioEngine.voice(470+offset*.35,t+.035,.13,g(big?.025:.014),"triangle",.14,1500,.008,.08,4,audioEngine.sfx);
 }else if(id==="cherub"){
   const notes=big?[76,81,84,88]:[76,81,84];
   notes.forEach((n,i)=>audioEngine.fmBell(MIDI_FREQ(n),t+i*.025,.16,g(big?.024:.015),(i-(notes.length-1)/2)*.14,audioEngine.sfx));
 }else if(id==="cosmic"){
   audioEngine.voice(610+offset,t,.14,g(big?.031:.019),"triangle",-.22,3800,.004,.09,-11,audioEngine.sfx);
   audioEngine.voice(925+offset,t+.025,.16,g(big?.027:.016),"sine",.24,4200,.004,.11,13,audioEngine.sfx);
 }
}

function pipSoundStackFlairB31(kind="talk",big=false){
 const ids=activePipSoundIdsB31();
 if(!ids.length)return;
 const x=Number.isFinite(P.pipX)?P.pipX:P.x,y=Number.isFinite(P.pipY)?P.pipY:P.y;
 ids.forEach((id,index)=>{
   const lv=pipSoundLevelB29(id);if(lv<2)return;
   const fx=PIP_SOUND_FX[id]||PIP_SOUND_FX.starlight;
   const count=lv>=4?(big?10:5):(big?6:3);
   particle(x+Math.cos(index*2.1)*5,y+Math.sin(index*2.1)*5,fx.color,count,lv>=4?118:76);
   if(lv>=3&&(big||kind==="heart"||kind==="return"))ring(x,y,fx.color,38+Math.min(24,index*4)+(lv>=4?10:0));
   if(lv>=4&&big)particle(x,y,fx.color,5,145);
 });
}

// Base Pip cue plus every unlocked palette. Scale added layers so stacking stays readable as the collection grows.
sfxPipCue=function(kind="talk"){
 sfxPipCueB26Base(kind);
 const ids=activePipSoundIdsB31();
 const scale=ids.length?Math.max(.34,.72/Math.sqrt(ids.length)):1;
 ids.forEach(id=>playPipSoundLayerB31(id,kind,false,scale));
 pipSoundStackFlairB31(kind,false);
};
sfxPipLove=function(){
 sfxPipLoveB26Base();
 const ids=activePipSoundIdsB31();
 const scale=ids.length?Math.max(.34,.72/Math.sqrt(ids.length)):1;
 ids.forEach(id=>playPipSoundLayerB31(id,"love",true,scale));
 pipSoundStackFlairB31("love",true);
};

renderPipSoundStepB26=function(){
 ensurePipSoundStepB26();
 const credits=Math.max(0,S.pipSoundCredits||0),notes=Math.max(0,S.musicNotes||0),active=activePipSoundIdsB31();
 $("pipSoundBalance").textContent=`PIP LV ${S.pipLevel} · ${credits} Sound Choice${credits===1?"":"s"} · ♪ ${notes} Music Note${notes===1?"":"s"} · ${active.length} active layer${active.length===1?"":"s"}`;
 const step=$("pipSoundStep"),p=step?.querySelector("p");
 if(p)p.textContent="Every unlocked Pip sound stacks permanently for this run. Each Pip level grants one sound choice to unlock a new layer or upgrade one you already have.";
 const grid=$("pipSoundGrid");grid.innerHTML="";
 for(const pack of PIP_SOUND_PACKS){
   const lv=pipSoundLevelB29(pack.id),unlocked=lv>0,btn=document.createElement("button");
   btn.className="upgrade"+(unlocked?" equipped":"");
   const cost=pipSoundUpgradeCostB29(pack.id),maxed=lv>=PIP_SOUND_MAX_LEVEL;
   let action="";
   if(!unlocked){
     if(credits<1)action="NEXT SOUND CHOICE AT A PIP LEVEL";
     else if(notes<cost)action=`NEEDS ♪${cost}`;
     else action=`UNLOCK + STACK · ♪${cost} · USE 1 CHOICE`;
   }else if(maxed)action="ACTIVE IN STACK · MAX";
   else if(credits<1)action="ACTIVE · NEXT UPGRADE AT A PIP LEVEL";
   else if(notes<cost)action=`ACTIVE · UPGRADE NEEDS ♪${cost}`;
   else action=`ACTIVE · UPGRADE TO LV ${lv+1} · ♪${cost} · USE 1 CHOICE`;
   btn.innerHTML=`<div class="heart">${pack.icon}</div><b>${pack.name} · ${unlocked?`Lv ${lv}`:"LOCKED"}</b><span class="small">${pack.desc}<br>${unlocked?pipSoundLevelTextB29(lv):pipSoundNextTextB29(0)}<br>${unlocked&&!maxed?pipSoundNextTextB29(lv)+"<br>":""}<strong>${action}</strong></span>`;
   btn.addEventListener("click",()=>selectPipSoundPackB26(pack.id));grid.appendChild(btn);
 }
};

selectPipSoundPackB26=function(id){
 const pack=PIP_SOUND_PACKS.find(p=>p.id===id);if(!pack)return;
 const lv=pipSoundLevelB29(id),unlocked=lv>0;
 if(unlocked&&lv>=PIP_SOUND_MAX_LEVEL){showPipMessage(`${pack.name} is already fully upgraded and stays active in the stack.`,true);return}
 if((S.pipSoundCredits||0)<1){showPipMessage("we get one new sound choice each time I gain a Pip level.",true);return}
 const cost=pipSoundUpgradeCostB29(id);
 if((S.musicNotes||0)<cost){const need=cost-(S.musicNotes||0);showPipMessage(`we need ${need} more Music Note${need===1?"":"s"} for ${pack.name}.`,true);return}
 S.musicNotes-=cost;S.pipSoundCredits--;
 if(!unlocked){
   S.pipSoundLevels[id]=1;S.pipSoundUnlocked.add(id);
   showPipMessage(`${pack.name} unlocked. it now stacks with every other Pip sound ✦`,true);
 }else{
   S.pipSoundLevels[id]=lv+1;
   showPipMessage(`${pack.name} is level ${lv+1}. its layer just got richer ✦`,true);
 }
 S.pipSoundPack="stack";
 renderPipSoundStepB26();sfxPipCue("return");
};

openPipSoundStepB26=function(){
 ensurePipSoundStepB26();
 $("emotionStep").classList.add("stagehidden");$("abilityStep").classList.add("stagehidden");$("audioStep").classList.add("stagehidden");$("pipSoundStep").classList.remove("stagehidden");
 renderPipSoundStepB26();
 showPipMessage((S.pipSoundCredits||0)>0?"one sound choice ready. unlock another layer or deepen one that's already singing with me.":"all unlocked Pip sounds are still stacked together. another Pip level earns the next sound choice.",true);
};

// Soundtrack unlocks already accumulate in S.audioUnlocks and are mixed independently. Make that rule explicit in the UI.
const soundtrackStackCopyB31=$("audioStep")?.querySelector("p");
if(soundtrackStackCopyB31)soundtrackStackCopyB31.textContent="Choose one soundtrack or SFX unlock. Everything you've already unlocked stays active and stacks with the new layer.";
