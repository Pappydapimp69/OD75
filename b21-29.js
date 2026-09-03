// B41 Sound Lab progression: shared Note economy, 5-level Mix Choices, themed Resonance synergies.
const B41_AUDIO_MAX_LEVEL=4;
const B41_AUDIO_THEME={
 melody:"cherub",harmony:"honey",bass:"cosmic",bells:"starlight",heartbeat:"honey",
 bubble:"bubble",dashbell:"starlight",shieldchime:"plush",pipchime:"cherub"
};
const B41_THEME_NAME={honey:"Honey",bubble:"Bubble",starlight:"Starlight",plush:"Plush",cherub:"Cherub",cosmic:"Cosmic"};
const B41_RESONANCE_TEXT={
 honey:"Faster shield recovery.",
 bubble:"Defeats release a tiny bubble splash.",
 starlight:"Player and Pip projectiles hit slightly harder.",
 plush:"Regenerated shields grant a brief grace window.",
 cherub:"Pip-assisted attack cadence is slightly faster.",
 cosmic:"Defeats return a little extra HEAT."
};

function audioLevelB41(id){return Math.max(0,S?.audioLevels?.[id]||0)}
function audioUpgradeCostB41(id){
 const a=AUDIO_CATALOG.find(x=>x.id===id),lv=audioLevelB41(id);
 if(!a||lv>=B41_AUDIO_MAX_LEVEL)return Infinity;
 if(lv===0)return a.kind==="music"?2:1;
 return Math.min(4,lv+1);
}
function pipThemeLevelB41(theme){return typeof pipSoundLevelB29==="function"?pipSoundLevelB29(theme):0}
function resonanceRankB41(theme){
 const pipLv=pipThemeLevelB41(theme);if(pipLv<=0)return 0;
 let total=0;
 for(const a of AUDIO_CATALOG){
   if(B41_AUDIO_THEME[a.id]!==theme)continue;
   const lv=audioLevelB41(a.id);if(lv>0)total+=Math.min(pipLv,lv);
 }
 return total;
}
function resonanceLabelB41(theme){const r=resonanceRankB41(theme);return r>0?`${B41_THEME_NAME[theme]} RESONANCE ${r}`:`Pair with ${B41_THEME_NAME[theme]}`}
function nextMixLevelB41(){const lv=Math.max(1,S?.pipLevel||1);return Math.ceil((lv+1)/5)*5}

function initAudioProgressB41(){
 if(!S)return;
 S.audioLevels={};
 S.audioMixCredits=1;
 S.audioUnlocks=new Set();
 S.audioChoices=[];
}
const resetBeforeB41=reset;
reset=function(){
 resetBeforeB41();
 initAudioProgressB41();
 updateUI();
};
initAudioProgressB41();

// One initial Mix Choice, then exactly one more whenever Pip crosses a multiple of 5.
const gainPipXPBeforeB41=gainPipXP;
gainPipXP=function(amount,reason=""){
 const before=S?.pipLevel||1;
 gainPipXPBeforeB41(amount,reason);
 const after=S?.pipLevel||before;
 let earned=0;
 for(let lv=before+1;lv<=after;lv++)if(lv%5===0)earned++;
 if(earned){
   S.audioMixCredits=(S.audioMixCredits||0)+earned;
   showPipMessage(earned===1?`Pip Lv ${after}: new Mix Choice unlocked ♪`:`${earned} new Mix Choices unlocked ♪`,true);
 }
};

function audioLevelTextB41(a,lv){
 if(lv<=0)return "Layer locked.";
 if(lv===1)return `${a.kind==="music"?"Track":"SFX"} layer active.`;
 if(lv===2)return "Richer second layer added.";
 if(lv===3)return "Fuller arrangement + stronger themed detail.";
 return "Signature mix reached.";
}
function chooseAudioOptionsB41(){
 const available=AUDIO_CATALOG.filter(a=>audioLevelB41(a.id)<B41_AUDIO_MAX_LEVEL);
 const unlockedThemes=new Set((typeof activePipSoundIdsB31==="function"?activePipSoundIdsB31():[]));
 const chosen=[];
 const add=a=>{if(a&&!chosen.includes(a))chosen.push(a)};
 // First offer: best direct Resonance match.
 add(available.filter(a=>unlockedThemes.has(B41_AUDIO_THEME[a.id])).sort((a,b)=>{
   const ar=resonanceRankB41(B41_AUDIO_THEME[a.id]),br=resonanceRankB41(B41_AUDIO_THEME[b.id]);
   return br-ar||audioLevelB41(b.id)-audioLevelB41(a.id)||a.id.localeCompare(b.id);
 })[0]);
 // Second offer: something already owned that can deepen.
 add(available.filter(a=>audioLevelB41(a.id)>0).sort((a,b)=>audioLevelB41(b.id)-audioLevelB41(a.id)||a.id.localeCompare(b.id))[0]);
 // Third offer: a new family or lowest-level alternative.
 add(available.filter(a=>audioLevelB41(a.id)===0).sort((a,b)=>a.id.localeCompare(b.id))[0]);
 for(const a of available.sort((a,b)=>audioLevelB41(a.id)-audioLevelB41(b.id)||a.id.localeCompare(b.id)))if(chosen.length<3)add(a);
 while(chosen.length<3&&chosen.length)chosen.push(chosen[chosen.length-1]);
 S.audioChoices=chosen.slice(0,3);
 renderAudioChoicesB41();
}
function renderAudioChoicesB41(){
 const choices=S.audioChoices||[],credits=Math.max(0,S.audioMixCredits||0),notes=Math.max(0,S.musicNotes||0);
 if($("audioOwned")){
   const owned=AUDIO_CATALOG.filter(a=>audioLevelB41(a.id)>0).length;
   $("audioOwned").textContent=`MIX ${credits} · ♪ ${notes} · ${owned}/${AUDIO_CATALOG.length} layers · next Mix Choice at Pip Lv ${nextMixLevelB41()}`;
 }
 for(let i=0;i<3;i++){
   const btn=$("audioChoice"+i),a=choices[i];if(!btn)continue;
   if(!a){btn.style.display="none";continue}btn.style.display="";
   const lv=audioLevelB41(a.id),cost=audioUpgradeCostB41(a.id),theme=B41_AUDIO_THEME[a.id],rank=resonanceRankB41(theme),maxed=lv>=B41_AUDIO_MAX_LEVEL;
   let action=maxed?"MAX":credits<1?`NEXT MIX CHOICE · PIP LV ${nextMixLevelB41()}`:notes<cost?`NEEDS ♪${cost}`:`${lv?`UPGRADE TO LV ${lv+1}`:"UNLOCK"} · ♪${cost} · USE 1 MIX`;
   btn.disabled=maxed||credits<1||notes<cost;
   btn.classList.toggle("ready",!btn.disabled);
   btn.innerHTML=`<div class="note">${a.icon}</div><b>${a.name} · ${lv?`Lv ${lv}`:"LOCKED"}</b><span class="small">${audioLevelTextB41(a,lv)}<br><strong>${resonanceLabelB41(theme)}</strong> · ${B41_RESONANCE_TEXT[theme]}${rank?` Current rank ${rank}.`:""}<br><strong>${action}</strong></span>`;
 }
}
chooseAudioOptions=function(){chooseAudioOptionsB41()};

// Audio choices are now optional investments; they no longer auto-advance the stage.
chooseAudioUnlock=function(index){
 if(!S?.stagePending)return;
 const a=S.audioChoices?.[index];if(!a)return;
 const lv=audioLevelB41(a.id);if(lv>=B41_AUDIO_MAX_LEVEL)return;
 if((S.audioMixCredits||0)<1){showPipMessage(`next Mix Choice arrives at Pip level ${nextMixLevelB41()}.`,true);return}
 const cost=audioUpgradeCostB41(a.id);
 if((S.musicNotes||0)<cost){const need=cost-(S.musicNotes||0);showPipMessage(`we need ${need} more Music Note${need===1?"":"s"} for ${a.name}.`,true);return}
 S.musicNotes-=cost;S.audioMixCredits--;
 S.audioLevels[a.id]=lv+1;S.audioUnlocks.add(a.id);
 const theme=B41_AUDIO_THEME[a.id],rank=resonanceRankB41(theme);
 showPipMessage(lv===0?`${a.name} unlocked. ${rank?B41_THEME_NAME[theme]+" Resonance is online ✦":"it is now part of our mix."}`:`${a.name} is level ${lv+1}. the mix just got richer ✦`,true);
 if(audioCtx)burstTone(a.kind==="music"?660:520,4);
 chooseAudioOptionsB41();renderPipSoundStepB26();
};

function ensureSoundLabContinueB41(){
 ensureSoundLabB34();
 const lab=$("pipSoundStep");if(!lab)return;
 let btn=$("continueSoundLabB41");
 if(!btn){btn=document.createElement("button");btn.id="continueSoundLabB41";btn.className="primary";btn.type="button";btn.textContent="Continue with current mix";lab.appendChild(btn);btn.addEventListener("click",continueSoundLabB41)}
 const audioTitle=$("audioStep")?.querySelector("h2");if(audioTitle)audioTitle.textContent="Mix Layers ♪";
 const audioCopy=$("audioStep")?.querySelector(":scope > p");if(audioCopy)audioCopy.textContent="Spend Notes + a Mix Choice. New Mix Choices arrive every 5 Pip levels.";
 const intro=lab.querySelector(":scope > p");if(intro)intro.textContent="Pip Sounds change his voice and cues. Mix Layers add recurring background music. Hold cards to buy; hear mixes below for free.";
}
function continueSoundLabB41(){
 if(!S?.stagePending)return;
 const lab=$("pipSoundStep"),audio=$("audioStep");
 if(lab)lab.classList.add("stagehidden");if(audio)audio.classList.add("stagehidden");$("stageUp").classList.add("hidden");
 advanceToNextStage();
}
const openPipSoundStepBeforeB41=openPipSoundStepB26;
openPipSoundStepB26=function(){
 ensureSoundLabContinueB41();
 openPipSoundStepBeforeB41();
 ensureSoundLabContinueB41();
 chooseAudioOptionsB41();
};
ensureSoundLabContinueB41();

// Small themed gameplay bonuses. No mismatch debuffs: collecting a non-matching layer is never punishment.
const applyPipPowerBeforeB41=applyPipPower;
applyPipPower=function(){
 applyPipPowerBeforeB41();
 const honey=resonanceRankB41("honey"),cherub=resonanceRankB41("cherub");
 if(honey)S.shieldRegenRate*=Math.max(.82,1-honey*.022);
 if(cherub)S.attackMax*=Math.max(.86,1-cherub*.018);
};
const attackBeforeB41=attack;
attack=function(){
 const start=shots?.length||0;attackBeforeB41();
 const rank=resonanceRankB41("starlight");if(!rank)return;
 const mult=1+Math.min(.15,rank*.018);
 for(let i=start;i<shots.length;i++)if(shots[i]&&(shots[i].source==="player"||shots[i].source==="pip"))shots[i].power*=mult;
};
const killBeforeB41=kill;
kill=function(e,chain=false){
 const wasDead=!!e?.dead,x=e?.x||0,y=e?.y||0,type=e?.type;
 killBeforeB41(e,chain);
 if(wasDead||!e?.dead||type==="boss")return;
 const bubble=resonanceRankB41("bubble");
 if(bubble){const radius=38+bubble*4,damage=.025*bubble;ring(x,y,"#9ee7ff",radius);for(const o of [...enemies])if(o!==e&&!o.dead&&hyp(o.x-x,o.y-y)<radius)hitEnemy(o,damage,"sound")}
 const cosmic=resonanceRankB41("cosmic");
 if(cosmic){const cap=typeof heatCapacityB38==="function"?heatCapacityB38():100;S.heat=clamp(S.heat+((.18*cosmic)/cap)*100,0,100)}
};
const updateBeforeB41=update;
update=function(dt){
 const shieldsBefore=S?.shields||0;updateBeforeB41(dt);
 if(!S||S.shields<=shieldsBefore)return;
 const plush=resonanceRankB41("plush");if(plush)S.invuln=Math.max(S.invuln,.05+Math.min(.12,plush*.025));
};

// Audio levels also deepen the audible layer rather than existing only as combat numbers.
function b41Level(id){return audioLevelB41(id)}
const scheduleStepBeforeB41=PipAudioEngine.prototype.scheduleStep;
PipAudioEngine.prototype.scheduleStep=function(time){
 scheduleStepBeforeB41.call(this,time);
 if(!S||S.bossActive||S.waveState==="break")return;
 const i=this.step%16,{root}=this.harmony();
 const melody=b41Level("melody"),harmony=b41Level("harmony"),bass=b41Level("bass"),bells=b41Level("bells"),heart=b41Level("heartbeat");
 if(melody>=2&&(i===6||i===14))this.fmBell(MIDI_FREQ(root+19+(melody>=4?5:0)),time,.18,.008+melody*.002,.3,this.music);
 if(harmony>=2&&i===8)this.padChord([root+12,root+16,root+19],time,.72,.004+harmony*.002);
 if(bass>=2&&(i===6||i===14))this.bass(root-12+(bass>=3?7:0),time,.14,.012+bass*.003);
 if(bells>=2&&(i===7||i===15))this.fmBell(MIDI_FREQ(root+31+(bells>=4?7:0)),time,.28,.009+bells*.002,.5,this.music);
 if(heart>=2&&(i===2||i===10))this.kick(time,.008+heart*.003);
};
function extraSfxB41(id,base){
 const lv=b41Level(id);if(lv<2||!ensureAudio())return;
 const t=audioCtx.currentTime;
 audioEngine.fmBell(base*(1+(lv-2)*.08),t+.025,.11,.004+lv*.002,0,audioEngine.sfx);
 if(lv>=4)audioEngine.fmBell(base*1.5,t+.055,.13,.006,.18,audioEngine.sfx);
}
const sfxKillBeforeB41=sfxKill;sfxKill=function(e){sfxKillBeforeB41(e);extraSfxB41("bubble",680)};
const sfxDashBeforeB41=sfxDash;sfxDash=function(){sfxDashBeforeB41();extraSfxB41("dashbell",900)};
const sfxShieldBeforeB41=sfxShield;sfxShield=function(){sfxShieldBeforeB41();extraSfxB41("shieldchime",1040)};
const sfxPipLoveBeforeB41=sfxPipLove;sfxPipLove=function(){sfxPipLoveBeforeB41();extraSfxB41("pipchime",1180)};

// Keep the Ascended Pip page honest about Sound Lab pairings.
const renderAscendedPauseBeforeB41=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
 renderAscendedPauseBeforeB41();
 const box=$("b39SoundList");if(!box)return;
 box.innerHTML=PIP_SOUND_PACKS.map(pack=>{
   const pipLv=pipThemeLevelB41(pack.id),rank=resonanceRankB41(pack.id),mixes=AUDIO_CATALOG.filter(a=>B41_AUDIO_THEME[a.id]===pack.id&&audioLevelB41(a.id)>0).map(a=>`${a.name} Lv ${audioLevelB41(a.id)}`);
   const active=pipLv>0;
   return rowB39(`${pack.name}${active?` Lv ${pipLv}`:""}`,active?`${B41_RESONANCE_TEXT[pack.id]} ${mixes.length?`Paired: ${mixes.join(" + ")}. Resonance ${rank}.`:"Add a matching Mix Layer to activate the pair bonus."}`:"Unlock this Pip Sound to begin its theme.",rank?`R${rank}`:active?"UNPAIRED":"LOCKED",!active);
 }).join("");
};

const updateUIBeforeB41=updateUI;
updateUI=function(){
 updateUIBeforeB41();
 if($("currencyHud")&&(S.audioMixCredits||0)>0)$("currencyHud").textContent+=` · MIX ${S.audioMixCredits}`;
};

(function installSoundLabB41Style(){
 if(document.getElementById("soundLabB41Style"))return;
 const style=document.createElement("style");style.id="soundLabB41Style";
 style.textContent=`#soundtrackSectionB34{border-top:1px solid #ffffff18;padding-top:7px;margin-top:7px}#audioOwned{font-size:clamp(12px,1.2vw,14px);color:#fff0b8;margin:3px 0 6px}#continueSoundLabB41{margin-top:8px}.b41-resonant{border-color:#ffd36f}`;
 document.head.appendChild(style);
})();
