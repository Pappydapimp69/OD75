// B42 Sound engine + 2:1 Resonance families: three mix families pair with all six Pip Sound themes.
const B42_FAMILY_FOR_AUDIO={
 harmony:"heart",heartbeat:"heart",pipchime:"heart",
 melody:"star",bells:"star",dashbell:"star",
 bass:"orbit",bubble:"orbit",shieldchime:"orbit"
};
const B42_FAMILY_FOR_PACK={honey:"heart",plush:"heart",starlight:"star",cherub:"star",bubble:"orbit",cosmic:"orbit"};
const B42_FAMILY_PACKS={heart:["honey","plush"],star:["starlight","cherub"],orbit:["bubble","cosmic"]};
const B42_FAMILY_NAME={heart:"Heart Mix",star:"Star Mix",orbit:"Orbit Mix"};

function familyForAudioB42(id){return B42_FAMILY_FOR_AUDIO[id]||"heart"}
function familyForPackB42(id){return B42_FAMILY_FOR_PACK[id]||"heart"}
function familyAudioB42(family){return AUDIO_CATALOG.filter(a=>familyForAudioB42(a.id)===family)}
function familyPackNamesB42(family){return (B42_FAMILY_PACKS[family]||[]).map(id=>B41_THEME_NAME[id]||id)}
function resonanceRankB42(theme){
 const pipLv=pipThemeLevelB41(theme);if(pipLv<=0)return 0;
 const family=familyForPackB42(theme);
 let total=0;
 for(const a of familyAudioB42(family)){
   const lv=audioLevelB41(a.id);if(lv>0)total+=Math.min(pipLv,lv);
 }
 return Math.min(8,total);
}
// B41's gameplay bonuses resolve this function dynamically, so the six distinct effects remain intact
// while each of the three Mix families can pair with two Pip Sound themes.
resonanceRankB41=function(theme){return resonanceRankB42(theme)};
resonanceLabelB41=function(theme){
 const family=familyForPackB42(theme),rank=resonanceRankB42(theme);
 return rank>0?`${B42_FAMILY_NAME[family]} · ${B41_THEME_NAME[theme]} R${rank}`:`${B42_FAMILY_NAME[family]} pairs ${familyPackNamesB42(family).join(" + ")}`;
};

chooseAudioOptionsB41=function(){
 const available=AUDIO_CATALOG.filter(a=>audioLevelB41(a.id)<B41_AUDIO_MAX_LEVEL);
 const unlockedPacks=typeof activePipSoundIdsB31==="function"?activePipSoundIdsB31():[];
 const activeFamilies=new Set(unlockedPacks.map(familyForPackB42));
 const chosen=[];
 const add=a=>{if(a&&!chosen.includes(a))chosen.push(a)};
 // One resonant option first, then one owned/deepen option, then one fresh option.
 add(available.filter(a=>activeFamilies.has(familyForAudioB42(a.id))).sort((a,b)=>{
   const af=familyForAudioB42(a.id),bf=familyForAudioB42(b.id);
   const ar=Math.max(...(B42_FAMILY_PACKS[af]||[]).map(resonanceRankB42),0),br=Math.max(...(B42_FAMILY_PACKS[bf]||[]).map(resonanceRankB42),0);
   return br-ar||audioLevelB41(b.id)-audioLevelB41(a.id)||a.id.localeCompare(b.id);
 })[0]);
 add(available.filter(a=>audioLevelB41(a.id)>0).sort((a,b)=>audioLevelB41(b.id)-audioLevelB41(a.id)||a.id.localeCompare(b.id))[0]);
 add(available.filter(a=>audioLevelB41(a.id)===0).sort((a,b)=>a.id.localeCompare(b.id))[0]);
 for(const a of available.sort((a,b)=>audioLevelB41(a.id)-audioLevelB41(b.id)||a.id.localeCompare(b.id)))if(chosen.length<3)add(a);
 while(chosen.length<3&&chosen.length)chosen.push(chosen[chosen.length-1]);
 S.audioChoices=chosen.slice(0,3);renderAudioChoicesB41();
};

renderAudioChoicesB41=function(){
 const choices=S.audioChoices||[],credits=Math.max(0,S.audioMixCredits||0),notes=Math.max(0,S.musicNotes||0);
 if($("audioOwned")){
   const owned=AUDIO_CATALOG.filter(a=>audioLevelB41(a.id)>0).length;
   $("audioOwned").textContent=`MIX ${credits} · ♪ ${notes} · ${owned}/${AUDIO_CATALOG.length} layers · next Mix Choice at Pip Lv ${nextMixLevelB41()}`;
 }
 for(let i=0;i<3;i++){
   const btn=$("audioChoice"+i),a=choices[i];if(!btn)continue;
   if(!a){btn.style.display="none";continue}btn.style.display="";
   const lv=audioLevelB41(a.id),cost=audioUpgradeCostB41(a.id),family=familyForAudioB42(a.id),packs=B42_FAMILY_PACKS[family]||[],maxed=lv>=B41_AUDIO_MAX_LEVEL;
   const active=packs.filter(id=>pipThemeLevelB41(id)>0).map(id=>`${B41_THEME_NAME[id]} R${resonanceRankB42(id)}`);
   const action=maxed?"MAX":(S.audioMixCredits||0)<1?`NEXT MIX · PIP LV ${nextMixLevelB41()}`:(S.musicNotes||0)<cost?`NEEDS ♪${cost}`:`${lv?`UPGRADE TO LV ${lv+1}`:"UNLOCK"} · ♪${cost} · USE 1 MIX`;
   btn.disabled=maxed||(S.audioMixCredits||0)<1||(S.musicNotes||0)<cost;
   btn.classList.toggle("ready",!btn.disabled);
   btn.classList.toggle("b41-resonant",active.length>0);
   btn.innerHTML=`<div class="note">${a.icon}</div><b>${a.name} · ${lv?`Lv ${lv}`:"LOCKED"}</b><span class="small"><strong>${B42_FAMILY_NAME[family]}</strong> · pairs ${familyPackNamesB42(family).join(" + ")}<br>${active.length?`ACTIVE · ${active.join(" · ")}`:"Unlock either paired Pip Sound to activate Resonance."}<br><strong>${action}</strong></span>`;
 }
};

chooseAudioUnlock=function(index){
 if(!S?.stagePending)return;
 const a=S.audioChoices?.[index];if(!a)return;
 const lv=audioLevelB41(a.id);if(lv>=B41_AUDIO_MAX_LEVEL)return;
 if((S.audioMixCredits||0)<1){showPipMessage(`next Mix Choice arrives at Pip level ${nextMixLevelB41()}.`,true);return}
 const cost=audioUpgradeCostB41(a.id);
 if((S.musicNotes||0)<cost){const need=cost-(S.musicNotes||0);showPipMessage(`we need ${need} more Music Note${need===1?"":"s"} for ${a.name}.`,true);return}
 S.musicNotes-=cost;S.audioMixCredits--;S.audioLevels[a.id]=lv+1;S.audioUnlocks.add(a.id);
 const family=familyForAudioB42(a.id),active=(B42_FAMILY_PACKS[family]||[]).filter(id=>pipThemeLevelB41(id)>0);
 showPipMessage(lv===0?`${a.name} unlocked. ${active.length?B42_FAMILY_NAME[family]+" is resonating with "+active.map(id=>B41_THEME_NAME[id]).join(" + ")+" ✦":"it can resonate with "+familyPackNamesB42(family).join(" or ")+"."}`:`${a.name} is level ${lv+1}. ${B42_FAMILY_NAME[family]} just got richer ✦`,true);
 if(audioCtx)burstTone(a.kind==="music"?660:520,4);
 chooseAudioOptionsB41();renderPipSoundStepB26();
};

// --- Sound engine hardening and mix polish ---
function installAudioEngineB42(engine){
 if(!engine||engine.b42Installed)return engine;
 engine.b42Installed=true;
 engine.voiceLimit=Math.min(engine.voiceLimit||28,24);
 engine.b42LastSfx=Object.create(null);
 engine.b42DuckUntil=0;
 engine.b42DuckFactor=1;
 engine.b42DroppedSfx=0;
 engine.b42Resyncs=0;
 return engine;
}
function audioMixWeightB42(){
 if(!S)return 0;
 let w=0;for(const a of AUDIO_CATALOG)w+=Math.max(0,audioLevelB41(a.id));return w;
}
function musicGainTargetB42(engine){
 // More stacked stems get a gentle equal-power-ish trim instead of getting linearly louder.
 const weight=audioMixWeightB42(),base=.46/Math.sqrt(1+weight*.045),now=engine?.ctx?.currentTime||0;
 const duck=engine&&now<(engine.b42DuckUntil||0)?engine.b42DuckFactor||1:1;
 return clamp(base*duck,.27,.46);
}
function smoothMusicBusB42(engine){
 if(!engine?.music?.gain||!engine.ctx)return;
 const now=engine.ctx.currentTime,target=musicGainTargetB42(engine);
 try{engine.music.gain.setTargetAtTime(target,now,.075)}catch(_){engine.music.gain.value=target}
}
function duckMusicB42(factor=.72,duration=.18){
 if(!audioEngine||!audioCtx)return;
 installAudioEngineB42(audioEngine);
 audioEngine.b42DuckFactor=Math.min(audioEngine.b42DuckFactor||1,factor);
 audioEngine.b42DuckUntil=Math.max(audioEngine.b42DuckUntil||0,audioCtx.currentTime+duration);
 smoothMusicBusB42(audioEngine);
}
function sfxGateB42(engine,key,gap=.03,voiceCeiling=22){
 if(!engine?.ctx)return false;installAudioEngineB42(engine);
 const now=engine.ctx.currentTime,last=engine.b42LastSfx[key]??-Infinity;
 if(now-last<gap||engine.voices.size>=voiceCeiling){engine.b42DroppedSfx++;return false}
 engine.b42LastSfx[key]=now;return true;
}

const buildAudioGraphBeforeB42=buildAudioGraph;
buildAudioGraph=function(){const ok=buildAudioGraphBeforeB42();if(ok)installAudioEngineB42(audioEngine);return ok};
if(audioEngine)installAudioEngineB42(audioEngine);

// Look-ahead stays on AudioContext time. If the main thread stalls/backgrounds, skip catch-up notes
// instead of scheduling a burst in the past.
PipAudioEngine.prototype.scheduler=function(){
 if(!this.ctx||this.ctx.state!=="running"||!S||!S.audioEnabled)return;
 installAudioEngineB42(this);
 const now=this.ctx.currentTime,stepDur=60/this.bpm/4;
 if(!Number.isFinite(this.nextStepTime)||this.nextStepTime<now-.10){this.nextStepTime=now+.04;this.b42Resyncs++}
 smoothMusicBusB42(this);
 while(this.nextStepTime<now+this.scheduleAhead){
   this.scheduleStep(this.nextStepTime);this.step++;this.nextStepTime+=stepDur;
 }
};

const playerFireBeforeB42=PipAudioEngine.prototype.playerFire;
PipAudioEngine.prototype.playerFire=function(pipOn=true,over=false){if(sfxGateB42(this,"fire",over?.018:.032,23))playerFireBeforeB42.call(this,pipOn,over)};
const enemyHitBeforeB42=PipAudioEngine.prototype.enemyHit;
PipAudioEngine.prototype.enemyHit=function(type="chaser",boss=false){if(boss||sfxGateB42(this,"hit",.020,23))enemyHitBeforeB42.call(this,type,boss)};
const enemyAttackBeforeB42=PipAudioEngine.prototype.enemyAttack;
PipAudioEngine.prototype.enemyAttack=function(kind="contact"){if(kind==="boss"||sfxGateB42(this,"enemy",.038,22))enemyAttackBeforeB42.call(this,kind)};
const pipCueBeforeB42=PipAudioEngine.prototype.pipCue;
PipAudioEngine.prototype.pipCue=function(kind="talk"){if(kind!=="talk"||sfxGateB42(this,"piptalk",.075,23))pipCueBeforeB42.call(this,kind)};
const playerDamageBeforeB42=PipAudioEngine.prototype.playerDamage;
PipAudioEngine.prototype.playerDamage=function(shielded=true){duckMusicB42(shielded?.78:.66,shielded?.14:.24);playerDamageBeforeB42.call(this,shielded)};
const bossRoarBeforeB42=PipAudioEngine.prototype.bossRoar;
PipAudioEngine.prototype.bossRoar=function(){duckMusicB42(.62,.34);bossRoarBeforeB42.call(this)};
const bossDefeatBeforeB42=PipAudioEngine.prototype.bossDefeat;
PipAudioEngine.prototype.bossDefeat=function(){duckMusicB42(.76,.12);bossDefeatBeforeB42.call(this)};

// Keep the Ascended Pip synthesis page explicit about the new 2:1 family map.
const renderAscendedPauseBeforeB42=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
 renderAscendedPauseBeforeB42();
 const box=$("b39SoundList");if(!box)return;
 box.innerHTML=PIP_SOUND_PACKS.map(pack=>{
   const pipLv=pipThemeLevelB41(pack.id),family=familyForPackB42(pack.id),rank=resonanceRankB42(pack.id);
   const mixes=familyAudioB42(family).filter(a=>audioLevelB41(a.id)>0).map(a=>`${a.name} Lv ${audioLevelB41(a.id)}`);
   const partner=(B42_FAMILY_PACKS[family]||[]).find(id=>id!==pack.id);
   return rowB39(`${pack.name}${pipLv?` Lv ${pipLv}`:""}`,pipLv?`${B42_FAMILY_NAME[family]} pairs this with ${B41_THEME_NAME[partner]}. ${B41_RESONANCE_TEXT[pack.id]} ${mixes.length?`Mix: ${mixes.join(" + ")}. Resonance ${rank}.`:"Add a family Mix Layer to activate it."}`:`Paired family: ${B42_FAMILY_NAME[family]} · ${familyPackNamesB42(family).join(" + ")}.`,rank?`R${rank}`:pipLv?"UNPAIRED":"LOCKED",!pipLv);
 }).join("");
};

(function installSoundEngineB42UI(){
 if(document.getElementById("soundEngineB42Style"))return;
 const style=document.createElement("style");style.id="soundEngineB42Style";
 style.textContent=`#audioStep .audiochoice .small strong:first-child{color:#fff0b8}#audioStep .audiochoice.b41-resonant{box-shadow:inset 0 0 0 1px #ffd36f33}`;
 document.head.appendChild(style);
 const intro=$("pipSoundStep")?.querySelector(":scope > p");if(intro)intro.textContent="Pip Sounds pair two-at-a-time with three Mix families. Notes deepen both; matching families create Resonance.";
})();
