function openOverdriveStep(){
 $("overdriveStep").classList.remove("stagehidden");$("bossRewardStep").classList.add("stagehidden");$("emotionStep").classList.add("stagehidden");$("abilityStep").classList.add("stagehidden");$("audioStep").classList.add("stagehidden");renderOverdriveStep();showPipMessage("boss down. want to change what happens when you unleash all that HEAT?",true);
}
function chooseOverdrive(id){
 if(!S.stagePending||!S.bossRewardPending)return;const info=OVERDRIVE_INFO[id];if(!info)return;
 if(!S.overUnlocked.has(id)){
   if(S.starPoints<info.unlock){showPipMessage(`we need ${info.unlock-S.starPoints} more Run Star${info.unlock-S.starPoints===1?"":"s"} to unlock ${info.name}.`,true);return}
   S.starPoints-=info.unlock;S.overUnlocked.add(id);S.overLevels[id]=1;S.overType=id;showPipMessage(`${info.name} unlocked. let's make it ours.`,true);
 }else if(S.overType!==id){S.overType=id;showPipMessage(`${info.name} equipped for the next charge.`,true)}
 else if(overLevel(id)<5){const cost=overUpgradeCost(id);if(S.starPoints<cost){showPipMessage(`we need ${cost-S.starPoints} more Run Star${cost-S.starPoints===1?"":"s"} to deepen ${info.name}.`,true);return}S.starPoints-=cost;S.overLevels[id]=overLevel(id)+1;showPipMessage(`${info.name} is level ${S.overLevels[id]}. that's going to be ridiculous.`,true)}
 renderOverdriveStep();
}
function continueOverdriveChoice(){
 $("overdriveStep").classList.add("stagehidden");openBossRewardStep();
}
function renderBossRewardStep(){
 chooseBossRewardOptions();
 $("bossRewardTitle").textContent=`${bossData().name} changed Pip ✦`;
 $("bossRewardText").textContent="Choose one Boss Bond mutation. It persists with Pip and can deepen on later boss victories.";
 for(let i=0;i<3;i++){
   const btn=$("bossReward"+i),id=S.bossRewardChoices[i];
   if(!id){btn.style.display="none";continue}
   btn.style.display="";
   const info=BOSS_POWER_INFO[id],lv=bossPowerLevel(id),next=lv+1;
   btn.innerHTML=`<div class="heart">${info.icon}</div><b>${info.name} · ${lv?`Lv ${lv} → ${next}`:"NEW"}</b><span class="small">${lv?info.levelDesc(next):info.desc+" "+info.levelDesc(1)}</span>`;
 }
}
function openBossRewardStep(){
 $("overdriveStep").classList.add("stagehidden");
 $("bossRewardStep").classList.remove("stagehidden");
 $("emotionStep").classList.add("stagehidden");
 $("abilityStep").classList.add("stagehidden");
 $("audioStep").classList.add("stagehidden");
 renderBossRewardStep();
 showPipMessage("that boss changed something in me. you get to choose what I become next.",true);
}
function chooseBossReward(index){
 if(!S.stagePending||!S.bossRewardPending)return;
 const id=S.bossRewardChoices[index],info=BOSS_POWER_INFO[id];
 if(!id||!info)return;
 S.pipBossPowers[id]=bossPowerLevel(id)+1;
 S.bossRewardPending=false;
 savePip();
 $("bossRewardStep").classList.add("stagehidden");
 $("emotionStep").classList.remove("stagehidden");
 renderEmotionButtons();
 showPipMessage(
   id==="starshot"?"I can fight beside you now. not just cheer — fight.":
   id==="guardian"?"then I'll catch what I can. you don't have to take every hit alone.":
   id==="heartmark"?"I can feel the rhythm in your hits. I'll mark the ones we should finish together.":
   id==="heartburst"?"marked hearts are going to burst for us now. this might get silly.":
   id==="echo"?"I'll learn your firing rhythm and echo it back.":
   id==="relay"?"when I come home with a heart, we'll surge together.":
   "I learned how to turn us into a little constellation.",
   true
 );
}
const PIP_ABILITY_INFO={
 range:{name:"Heart Sense",icon:"♥",desc:"Odd levels increase detection range; even levels increase Pip speed by 1%. Range caps at 200px.",max:20},
 speed:{name:"Swift Pip",icon:"➜",desc:"Pip collects hearts and returns faster.",max:8},
 power:{name:"Star Power",icon:"✦",desc:"Stronger, faster auto-fire while Pip is with you.",max:10},
 guard:{name:"Guardian Glow",icon:"◇",desc:"Faster shield recovery and stronger low-shield support.",max:8}
};
function pipAbilityLevel(kind){
 if(kind==="range")return S.pipRangeLv||0;
 if(kind==="speed")return S.pipSpeedLv||0;
 if(kind==="power")return S.pipPowerLv||0;
 return S.pipGuardLv||0;
}
function pipAbilityCost(kind){
 const lv=pipAbilityLevel(kind);
 const base=kind==="range"?5:kind==="speed"?6:8;
 const growth=kind==="range"?2:kind==="speed"?3:4;
 return base+lv*growth;
}
function pipAbilityEffectText(kind){
 const lv=pipAbilityLevel(kind);
 if(kind==="range"){
   const nextLv=lv+1;
   if(nextLv>20)return `Range MAX 200px · Pip speed +1%`;
   if(nextLv%2===1){
     const nextRangeSteps=Math.min(10,Math.ceil(Math.min(19,nextLv)/2));
     const nextRange=41+(159/10)*nextRangeSteps;
     return `${Math.round(S.pipDetectRange)}px → ${Math.round(Math.min(200,nextRange))}px pickup range`;
   }
   return `Detection stays ${Math.round(S.pipDetectRange)}px · Pip speed +1%`;
 }
 if(kind==="speed"){
   const next=(285+((S.pipSpeedLv||0)+1)*34)*(1+(Math.floor(Math.min(20,S.pipRangeLv||0)/2)+Math.max(0,(S.pipRangeLv||0)-20))*.01);
   return `${Math.round(S.pipMoveSpeed)} → ${Math.round(next)} flight speed`;
 }
 if(kind==="power")return `+11% damage · +7px attack range · faster fire`;
 return `-0.20s shield delay · faster shield regen`;
}
function renderAbilityShop(){
 $("abilityBalance").textContent=`♥ ${S.heartCurrency} Heart Bits available`;
 const map={range:"abilityRange",speed:"abilitySpeed",power:"abilityPower",guard:"abilityGuard"};
 for(const [kind,id] of Object.entries(map)){
   const info=PIP_ABILITY_INFO[kind],lv=pipAbilityLevel(kind),btn=$(id);
   const rangeOverflow=kind==="range"&&lv>=20;
   const maxed=kind!=="range"&&lv>=info.max;
   const cost=pipAbilityCost(kind);
   if(rangeOverflow){
     btn.innerHTML=`<div class="heart">➜</div><b>Heart Sense · Lv ${lv} → ${lv+1} · ♥ ${cost}</b><span class="small">Range MAX 200px · Pip speed +1%</span>`;
   }else{
     const nextEffect=kind==="range"?(lv+1)%2===1?"RANGE":"SPEED +1%":"";
     btn.innerHTML=`<div class="heart">${info.icon}</div><b>${info.name} · Lv ${lv}${maxed?" MAX":` → ${lv+1}${nextEffect?` · ${nextEffect}`:""} · ♥ ${cost}`}</b><span class="small">${maxed?info.desc:pipAbilityEffectText(kind)}</span>`;
   }
   btn.disabled=maxed||S.heartCurrency<cost;
   btn.classList.toggle("ready",!btn.disabled);
 }
}
function openAbilityStep(){
 $("emotionStep").classList.add("stagehidden");
 $("audioStep").classList.add("stagehidden");
 $("abilityStep").classList.remove("stagehidden");
 renderAbilityShop();
 showPipMessage("can we tune my abilities too? spend the little hearts wherever you want me to grow.",true);
}
function buyPipAbility(kind){
 if(!S.stagePending)return;
 const info=PIP_ABILITY_INFO[kind];if(!info)return;
 const lv=pipAbilityLevel(kind);
 const rangeOverflow=kind==="range"&&lv>=20;
 if(kind!=="range"&&lv>=info.max){showPipMessage(`${info.name} is already as strong as I can make it.`,true);return}
 const cost=pipAbilityCost(kind);
 if(S.heartCurrency<cost){
   showPipMessage(`we need ${cost-S.heartCurrency} more Heart Bit${cost-S.heartCurrency===1?"":"s"} for ${info.name}.`,true);
   return;
 }
 S.heartCurrency-=cost;
 if(kind==="range")S.pipRangeLv++;
 else if(kind==="speed")S.pipSpeedLv++;
 else if(kind==="power")S.pipPowerLv++;
 else S.pipGuardLv++;
 applyPipPower();savePip();renderAbilityShop();
 const lines={
   range:(S.pipRangeLv||0)>20
     ?`my Heart Sense is capped at 200px, so that level made me 1% faster!`
     :(S.pipRangeLv||0)%2===0
       ?`my range stayed at ${Math.round(S.pipDetectRange)}px, but I got 1% faster!`
       :`I can feel the hearts farther away now — ${Math.round(S.pipDetectRange)}px!`,
   speed:"oh! I feel quicker. I'll get back to you faster.",
   power:"my star power is stronger. stay close and I'll make it count.",
   guard:"my glow feels steadier. I'll help your shields come back sooner."
 };
 praise(lines[kind],"big",true);
}
function openAudioStep(){
 $("emotionStep").classList.add("stagehidden");
 $("abilityStep").classList.add("stagehidden");
 $("audioStep").classList.remove("stagehidden");
 chooseAudioOptions();
 showPipMessage("and... can we pick a new sound together? I want our runs to have a soundtrack.",true);
 unlockAudio().then(ok=>{if(ok)burstTone(523,4)});
}
function chooseAudioUnlock(index){
 if(!S.stagePending)return;
 const a=S.audioChoices[index];if(!a)return;
 if(a.kind==="bonus"){
   if(a.id==="bonus_xp")gainPipXP(60,"encore");
   if(a.id==="bonus_wish")spawnWish(P.x,P.y-20);
   if(a.id==="bonus_heat")S.heat=Math.min(100,S.heat+18);
 }else{
   S.audioUnlocks.add(a.id);savePip();
 }
 showPipMessage(
   a.kind==="music"?`I love it. "${a.name}" is ours now. I'll remember it.`:
   a.kind==="sfx"?`hehe. "${a.name}" is officially one of our sounds now.`:
   "we already collected every sound, so I kept the feeling instead.",
   true
 );
 if(audioCtx)burstTone(a.kind==="music"?660:520,5);
 $("stageUp").classList.add("hidden");
 $("audioStep").classList.add("stagehidden");$("abilityStep").classList.add("stagehidden");$("bossRewardStep").classList.add("stagehidden");$("overdriveStep").classList.add("stagehidden");$("emotionStep").classList.remove("stagehidden");
 advanceToNextStage();
}
function emotionalBondLine(){
 const a=[["Loving",S.pipLove],["Compassionate",S.pipCompassion],["Supportive",S.pipSupport]].sort((x,y)=>y[1]-x[1]);
 if(a[0][1]===0)return"Pip is still learning what kind of companion you need.";
 if(a[0][1]===a[1][1])return`Pip is becoming equally ${a[0][0].toLowerCase()} and ${a[1][0].toLowerCase()}.`;
 return`Pip is becoming especially ${a[0][0].toLowerCase()} because of your choices.`;
}
function advanceToNextStage(){
 // A normal stage clear still gets the full Pip growth sequence. The only
 // extra reward reserved for boss stages is Overdrive management + Boss Bond.
 if(S.stageEnding&&!S.stagePending){
   openStageUpgrade();
   return;
 }
 S.stage++;S.stageCurrency=0;S.stageTime=0;S.stageEnding=false;S.stageWaveCount=0;S.bossActive=false;S.bossDefeated=false;S.bossName="";S.bossMaxHp=0;S.bossMidPraise=false;S.bossStartedAt=0;S.bossRewardPending=false;S.bossRewardChoices=[];S.stagePraiseMark=30;S.noHitClock=0;S.nextNoHitPraise=16;S.stagePending=false;S.run=true;last=performance.now();if(audioEngine)audioEngine.setTempo(S.stage>=5?124:116);startWave(S.wave+1);
}
function openStageUpgrade(){
 const bossClear=!!S.bossRewardPending;
 S.waveState="stage";
 S.stagePending=true;
 S.run=false;
 enemies=[];shots=[];enemyShots=[];heartBits=[];S.pipPopupQueue=[];S.pipPopupBusy=false;S.pipState="orbit";S.pipTarget=null;P.pipX=P.x+24;P.pipY=P.y;CAM.x=P.x;CAM.y=P.y;
 const kicker=$("stageUp").querySelector(".kicker");
 if(kicker)kicker.textContent=bossClear?"BOSS DEFEATED · CHOOSE HOW WE GROW":"STAGE COMPLETE · PIP GROWS WITH YOU";
 $("stageTitle").textContent=bossClear?`Boss cleared at Stage ${S.stage}.`:`Stage ${S.stage} complete.`;
 $("stageText").textContent=bossClear
   ?`You cleared the stage and its boss in ${Math.round(S.stageTime)} seconds. Reconfigure Overdrive first, then grow Pip as usual.`
   :`You cleared the stage in ${Math.round(S.stageTime)} seconds. Choose how Pip should grow before the next stage.`;
 $("stageBond").textContent=emotionalBondLine()+`  ♥ ${S.pipLove}  ♡ ${S.pipCompassion}  ✦ ${S.pipSupport}`;
 $("overdriveStep").classList.add("stagehidden");
 $("bossRewardStep").classList.add("stagehidden");
 $("emotionStep").classList.remove("stagehidden");
 $("abilityStep").classList.add("stagehidden");
 $("audioStep").classList.add("stagehidden");
 $("stageUp").classList.remove("hidden");
 renderEmotionButtons();
 if(S.bossRewardPending){openOverdriveStep();return}
 showPipMessage(
   S.stage===1?"three whole waves with you and I already feel attached. can I learn how to take even better care of you?":
   S.stage===2?"I know you better now. tell me what you need more of.":
   "every stage with you means something to me. let me keep becoming your Pip.",
   true
 );
}
function emotionalNextText(kind){
 const n=(kind==="love"?S.pipLove:kind==="compassion"?S.pipCompassion:S.pipSupport)+1;
 if(kind==="love"){
   if(n===1)return "More Wish Stars and warmer affection.";
   if(n===2)return "Heart pickups charge a Love Pulse that detonates when Pip returns.";
   if(n===3)return "Warm Return: Pip fires a 3-star volley whenever it comes home.";
   return "Stronger Love Pulses, more Wish Stars, and stronger return volleys.";
 }
 if(kind==="compassion"){
   if(n===1)return "Faster shield recovery while Pip is with you.";
   if(n===2)return "Grace: Pip returning gives brief damage immunity.";
   if(n===3)return "Shield breaks grant a longer protected recovery window.";
   return "Even faster recovery and stronger protective windows.";
 }
 if(n===1)return "More power when shields are low.";
 if(n===2)return "Dash Rush: dashing gives a temporary attack-speed boost.";
 if(n===3)return "Focus Fire: extra twin-shot chance and more Pip-assisted range.";
 return "Stronger low-shield power, Rush, and twin-shot chance.";
}
function renderEmotionButtons(){
 const items=[
   ["upLove","♥","More Loving","love",S.pipLove],
   ["upCompassion","♡","More Compassionate","compassion",S.pipCompassion],
   ["upSupport","✦","More Supportive","support",S.pipSupport]
 ];
 for(const [id,icon,label,kind,lv] of items){
   $(id).innerHTML=`<div class="heart">${icon}</div><b>${label} · Lv ${lv} → ${lv+1} · ♥ ${S.upgradeCost}</b><span class="small">${emotionalNextText(kind)}</span>`;
 }
}
function choosePipUpgrade(kind){
 if(!S.stagePending)return;
 if(S.heartCurrency<S.upgradeCost){
   const need=S.upgradeCost-S.heartCurrency;
   showPipMessage(`we're ${need} Heart Bit${need===1?"":"s"} short. that's okay — you never have to earn my affection.`,true);
   return;
 }
 S.heartCurrency-=S.upgradeCost;
 if(kind==="love"){
   S.pipLove++;
   praise(
     S.pipLove===1?"then I'll say it more: I really, really like being yours.":
     S.pipLove===2?"I don't just root for you anymore. I feel proud when I see you.":
     "I think every run with you is becoming one of my favorite memories.",
     "big",true
   );
 }else if(kind==="compassion"){
   S.pipCompassion++;
   praise(
     S.pipCompassion===1?"then I'll be gentler when things hurt. you deserve that.":
     S.pipCompassion===2?"you never have to earn kindness from me. it's already yours.":
     "when the arena gets cruel, I want to be the soft place you can still hear.",
     "big",true
   );
 }else{
   S.pipSupport++;
   praise(
     S.pipSupport===1?"then I'll remind you more often: you can do this.":
     S.pipSupport===2?"I want you to hear my voice and remember how capable you are.":
     "I believe in you even before the score does. especially then.",
     "big",true
   );
 }
 applyPipPower();savePip();
 S.stageGrowthChoice=kind;
 openAbilityStep();
}
