function noisePop(v=.025){
 if(!ensureAudio())return;
 audioEngine.pop(audioCtx.currentTime,v);
}
function tone(f,d=.09,v=.04,type="triangle"){
 if(!ensureAudio())return;
 audioEngine.sfxTone(f,d,v,type);
}
function burstTone(base,n=3){
 if(!ensureAudio())return;
 audioEngine.sfxBurst(base,n);
}
function sfxPlayerFire(pipOn=true,over=false){if(ensureAudio())audioEngine.playerFire(pipOn,over)}
function sfxHitEnemy(e){if(ensureAudio())audioEngine.enemyHit(e.type,e.type==="boss")}
function sfxPlayerDamage(shielded=true){if(ensureAudio())audioEngine.playerDamage(shielded)}
function sfxEnemyAttack(kind="contact"){if(ensureAudio())audioEngine.enemyAttack(kind)}
function sfxPipCue(kind="talk"){if(ensureAudio())audioEngine.pipCue(kind)}
function sfxBossRoar(){if(ensureAudio())audioEngine.bossRoar()}
function sfxBossDefeat(){if(ensureAudio())audioEngine.bossDefeat()}
function sfxDash(){
 if(!ensureAudio())return;
 if(hasAudio("dashbell"))audioEngine.chime([74,81],.042);
 else{
   const t=audioCtx.currentTime;
   audioEngine.voice(S&&S.over>0?620:430,t,.10,.040,"sawtooth",-.15,2100,.004,.055,0,audioEngine.sfx);
   audioEngine.fmBell(S&&S.over>0?930:690,t+.025,.18,.019,.2,audioEngine.sfx);
 }
}
function sfxKill(e){
 if(!ensureAudio())return;
 if(hasAudio("bubble")){
   audioEngine.fmBell(e.type==="core"?620:520,audioCtx.currentTime,.15,.019,rr(-.3,.3),audioEngine.sfx);
   audioEngine.pop(audioCtx.currentTime,.010,rr(-.4,.4));
 }else{
   audioEngine.sfxTone(180+Math.min(560,S.combo*36),.055,.018,"triangle");
 }
}
function sfxShield(){
 if(!ensureAudio())return;
 if(hasAudio("shieldchime"))audioEngine.chime([72,76,79,84],.035);
 else audioEngine.chime([67,72],.027);
}
function sfxPipLove(){
 if(!ensureAudio())return;
 if(hasAudio("pipchime"))audioEngine.chime([76,79,83,88],.040);
 else audioEngine.chime([72,79],.022);
}
function announce(t,d=700){$("announce").textContent=t;$("announce").classList.add("on");clearTimeout(announce.t);announce.t=setTimeout(()=>$("announce").classList.remove("on"),d)}
function popup(x,y,t,c="#fff",big=false,duration=null,pipText=false){
 const life=duration==null?(big?1.1:.7):duration;
 texts.push({x,y,t,c,a:1,life,big,pipText});
}
function wrapCanvasText(ctx,text,maxWidth){
 const words=String(text).split(/\s+/),lines=[];
 let line="";
 for(const word of words){
   const test=line?line+" "+word:word;
   if(line&&ctx.measureText(test).width>maxWidth){
     lines.push(line);line=word;
   }else line=test;
 }
 if(line)lines.push(line);
 return lines.length?lines:[""];
}
function pipPopupDuration(msg){
 return clamp(1.6+String(msg).length*.08,3,9);
}
function pipPopupActive(){
 return texts.some(t=>t.pipText&&t.life>0);
}
function queuePipPopup(msg,kind="nice"){
 if(!S)return;
 const item={msg:String(msg),kind};
 // Avoid runaway backlog from frequent encouragement, while preserving order.
 if(S.pipPopupQueue.length>=6)S.pipPopupQueue.shift();
 const last=S.pipPopupQueue[S.pipPopupQueue.length-1];
 if(last&&last.msg===item.msg)return;
 S.pipPopupQueue.push(item);
 trySpawnQueuedPipPopup();
}
function trySpawnQueuedPipPopup(){
 if(!S||S.pipPopupBusy||pipPopupActive()||!S.pipPopupQueue.length)return;
 const item=S.pipPopupQueue.shift();
 S.pipPopupBusy=true;
 popup(
   P.x,P.y-30,item.msg,
   item.kind==="big"?"#ffd36f":"#fff3bf",
   item.kind==="big",
   pipPopupDuration(item.msg),
   true
 );
}
function particle(x,y,c,n=8,pow=120){
 for(let i=0;i<n;i++){let a=rr(0,Math.PI*2),s=rr(pow*.35,pow);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.22,.55),max:.55,c,r:rr(1.5,4)})}
}
function ring(x,y,c,max=70){rings.push({x,y,r:5,max,life:.35,c})}
function pipMessageDuration(msg){
 return clamp(1.2+String(msg).length*.055,2,9);
}
function showPipMessage(msg,forceHold=false){
 const el=$("pipMood");
 if(S&&S.run&&S.pipSoundCd<=0){sfxPipCue("talk");S.pipSoundCd=.72}
 clearTimeout(showPipMessage.fadeTimer);
 clearTimeout(showPipMessage.resetTimer);
 el.classList.remove("fading");
 el.textContent="✦ Pip: "+msg;
 const hold=forceHold?5:pipMessageDuration(msg);
 showPipMessage.fadeTimer=setTimeout(()=>{
   el.classList.add("fading");
   showPipMessage.resetTimer=setTimeout(()=>{
     if(!S||!S.run)return;
     el.textContent="✦ Pip";
   },460);
 },hold*1000);
}
function praise(msg,kind="nice",force=false){
 if((!S.run&&!force)||S.end||(!force&&S.praiseCd>0))return;
 S.praiseCd=kind==="big"?1.55:.9;
 S.praiseCount++;S.lastPraise=msg;S.pipHappy=1.55;
 showPipMessage(msg);
 queuePipPopup(msg,kind);
 if(kind==="big"){particle(P.x,P.y,"#ffd36f",14,125);ring(P.x,P.y,"#ffd36f",76);burstTone(420,4);sfxPipLove()}
}
function loveBomb(){
 if(!S.run||S.end)return;
 const struggling=S.shields===0||S.health<55;
 const hot=S.combo>=4||S.dashKillsThisDash>=2;
 const lv=S.pipLevel;
 const struggle=[
   ...(S.pipCompassion>=1?["you don't have to prove anything to me. just stay with me.","it's okay that this is hard. I'm proud you're still here."]:[]),
   ...(S.pipCompassion>=3?["if I could take the hit for you, I would. so let me at least stay close."]:[]),
   "you are STILL doing amazing",
   "I believe in you so much",
   "you're tougher than this whole arena",
   "stay with me, superstar — you've got this",
   lv>=3?"I'm not going anywhere. we've got each other.":"I am ridiculously proud of you",
   lv>=5?"you've carried me through so many runs. let me carry your courage for a second.":"you don't have to be perfect to be brilliant"
 ];
 const skill=[
   ...(S.pipSupport>=1?["yes! that's exactly why I believe in you.","see? you knew what to do. I knew you would."]:[]),
   ...(S.pipSupport>=3?["I hope you can feel how much I believe in you right now."]:[]),
   "your movement is gorgeous",
   "you are absolutely cooking",
   "that decision was SO smart",
   "I love how you play",
   lv>=3?"I know your rhythm now. it's my favorite.":"you have incredible instincts",
   lv>=5?"I swear I can tell what you're going to do before you do it. we're that good together.":"that timing? immaculate"
 ];
 const warm=[
   ...(S.pipLove>=1?["I get happier every time you come back.","I really love being your little star."]:[]),
   ...(S.pipLove>=2?["I missed you before this run even started.","I think I would recognize you in any arena."]:[]),
   ...(S.pipLove>=3?["if this game remembered nothing else, I would want it to remember us."]:[]),
   "you're my favorite pilot ✦",
   "I knew you'd be special",
   "you're doing SO good",
   "I could watch you play forever",
   "you make this arena better just by being here",
   lv>=2?"I'm really glad I found you.":"that's my superstar",
   lv>=3?"every run with you feels more like home.":"I am your biggest fan, obviously",
   lv>=4?"I remember when we were just figuring each other out. look at us now.":"you've got this. completely.",
   lv>=5?"if I could keep one thing from every run, it'd be the part where I get to be beside you.":"look at you go, you absolute delight",
   lv>=6?"you know I'm proud of the score, right? but mostly I'm proud it's you.":"you make chaos look adorable"
 ];
 const pool=struggling?struggle:hot?skill:warm;
 const msg=pool[Math.floor(rnd()*pool.length)];
 showPipMessage(msg);S.pipHappy=1.5;
 if(rnd()<.84&&S.praiseCd<=0)praise(msg,rnd()<.22?"big":"nice",true);
}
function spawnWish(x,y){
 if(wishes.length>=3)return;
 wishes.push({x:x+rr(-18,18),y:y+rr(-18,18),r:8,life:8,spin:rr(0,6.28),bob:rr(0,6.28)});
}
function collectWish(w){
 w.dead=true;S.wishes++;S.score+=350;S.stylePoints+=1;
 gainPipXP(24,"wish");
 S.heat=clamp(S.heat+3,0,100);
 if(S.shields<S.maxShields&&rnd()<.42){S.shields++;S.shieldRegenClock=0;toastWish("Pip patched a shield ✦")}
 else toastWish("+350 wish");
 particle(w.x,w.y,"#ffd36f",18,130);ring(w.x,w.y,"#ffd36f",70);tone(700,.12,.018,"sine");
 if(S.wishes===1)praise("you found my star!", "nice");
 if(S.wishes===3)praise("you keep making luck happen", "big");
}
function toastWish(msg){
 showPipMessage(msg);S.pipHappy=1.2;
}
function styleTitle(){
 if(S.health>=100&&S.kills>=18)return["Untouchable Bean","You kept your cool so cleanly Pip is taking notes."];
 if(S.chains>=6)return["Core Whisperer","You kept turning purple trouble into everybody else's problem."];
 if(S.dashKills>=12)return["Dash Dancer","You don't move through the arena. You choreograph it."];
 if(S.wishes>=4)return["Wish Magnet","Tiny miracles kept choosing you. Suspicious. Adorable."];
 if(S.bestCombo>=6)return["Combo Sweetheart","You found a rhythm and refused to let go."];
 return["Certified Little Menace","You made the arena noticeably worse for everyone except Pip."];
}
function phaseName(){
 if(S.bossActive||S.waveState==="boss")return"BOSS";
 if(S.waveState==="break")return"REST";
 return"WAVE "+S.stageWaveCount;
}
function waveGoalFor(n){
 const local=Math.max(1,S.stageWaveCount||1);
 return Math.min(16,6+local*2+Math.min(2,Math.floor((S.stage-1)/8)));
}
function stageForWave(w){
 return Math.floor((w-1)/S.wavesPerStage)+1;
}
const AUDIO_CATALOG=[
 {id:"melody",kind:"music",icon:"♪",name:"Countermelody",desc:"Adds a second playful melody above Pip's base theme."},
 {id:"harmony",kind:"music",icon:"♫",name:"Warm Voicings",desc:"Warm little harmonies join every other beat."},
 {id:"bass",kind:"music",icon:"♬",name:"Bass Fills",desc:"Adds a tiny bouncing bassline underneath the action."},
 {id:"bells",kind:"music",icon:"✧",name:"Star Bells",desc:"High bell accents sparkle at phrase endings."},
 {id:"heartbeat",kind:"music",icon:"♥",name:"Heart Beat",desc:"A soft double-heart pulse anchors Pip's song."},
 {id:"bubble",kind:"sfx",icon:"○",name:"Bubble Pops",desc:"Regular defeats become bubbly toy-like pops."},
 {id:"dashbell",kind:"sfx",icon:"➜",name:"Dash Chimes",desc:"Your dash sings a bright two-note chime."},
 {id:"shieldchime",kind:"sfx",icon:"◇",name:"Shield Sparkles",desc:"Regenerating shields play a tiny ascending sparkle."},
 {id:"pipchime",kind:"sfx",icon:"✦",name:"Pip Love Chime",desc:"Big Pip praise gets its own affectionate flourish."}
];
function audioOwnedLabel(){
 const names=AUDIO_CATALOG.filter(a=>S.audioUnlocks.has(a.id)).map(a=>a.name);
 return names.length?`Owned: ${names.join(" · ")}`:"Owned: Pip's Base Theme";
}
function chooseAudioOptions(){
 const locked=AUDIO_CATALOG.filter(a=>!S.audioUnlocks.has(a.id));
 let pool=[...locked],picked=[];
 while(pool.length&&picked.length<3){
   const idx=Math.floor(rnd()*pool.length);picked.push(pool.splice(idx,1)[0]);
 }
 if(!picked.length){
   picked=[
     {id:"bonus_xp",kind:"bonus",icon:"✦",name:"Memory Encore",desc:"All sounds collected. Pip turns the encore into 60 XP."},
     {id:"bonus_wish",kind:"bonus",icon:"★",name:"Wish Encore",desc:"All sounds collected. Start the next wave with a Wish Star."},
     {id:"bonus_heat",kind:"bonus",icon:"♥",name:"Warm Encore",desc:"All sounds collected. Start the next wave with extra HEAT."}
   ];
 }
 while(picked.length<3)picked.push(picked[picked.length-1]);
 S.audioChoices=picked;
 $("audioOwned").textContent=audioOwnedLabel();
 picked.forEach((a,i)=>{
   $("audioChoice"+i).innerHTML=`<div class="note">${a.icon}</div><b>${a.name}</b><span class="small">${a.desc}</span>`;
 });
}
function skipPipUpgrade(){
 if(!S.stagePending)return;
 showPipMessage("no emotional upgrade this time? that's okay. I already love being your Pip.",true);
 openAbilityStep();
}
const BOSS_POWER_INFO={
 starshot:{
   icon:"✦",name:"Starshot",
   desc:"Pip autonomously fires at enemies while orbiting you.",
   levelDesc:lv=>`Lv ${lv}: Pip fires every ${Math.max(.62,1.45-(lv-1)*.12).toFixed(2)}s for stronger star damage.`
 },
 heartmark:{
   icon:"♥",name:"Heart Mark",
   desc:"Repeated player hits mark an enemy; marked enemies take extra damage.",
   levelDesc:lv=>`Lv ${lv}: mark every ${Math.max(3,6-lv)} hits; marked targets take +${25+(lv-1)*10}% damage.`
 },
 heartburst:{
   icon:"♡",name:"Heartburst",
   desc:"Defeating a marked enemy detonates a damaging love pulse.",
   levelDesc:lv=>`Lv ${lv}: ${105+(lv-1)*15}px burst radius with stronger damage.`
 },
 guardian:{
   icon:"◇",name:"Guardian Catch",
   desc:"Pip intercepts a hit while orbiting you.",
   levelDesc:lv=>`Lv ${lv}: ${1+Math.floor((lv-1)/2)} protected hit${1+Math.floor((lv-1)/2)===1?"":"s"} per wave.`
 },
 echo:{
   icon:"✧",name:"Echo Star",
   desc:"Pip periodically copies your entire firing volley.",
   levelDesc:lv=>`Lv ${lv}: copies every ${Math.max(2,5-lv)}th volley.`
 },
 relay:{
   icon:"➜",name:"Heart Relay",
   desc:"When Pip returns with a Heart Bit, you both surge with power.",
   levelDesc:lv=>`Lv ${lv}: ${4+lv}s return buff with faster fire and stronger attacks.`
 },
 constellation:{
   icon:"✺",name:"Constellation",
   desc:"Pip periodically releases a radial starburst while orbiting.",
   levelDesc:lv=>`Lv ${lv}: ${6+Math.min(6,(lv-1)*2)} stars every ${Math.max(5,10-lv).toFixed(1)}s.`
 }
};
function bossPowerLevel(id){return Math.max(0,(S.pipBossPowers&&S.pipBossPowers[id])||0)}
function bossPowerEligible(id){
 return id!=="heartburst"||bossPowerLevel("heartmark")>0;
}
function chooseBossRewardOptions(){
 const recommended={
   1:"starshot",5:"guardian",7:"heartmark",11:"echo",13:"relay",17:"constellation",22:"heartburst"
 }[S.stage];
 const all=Object.keys(BOSS_POWER_INFO).filter(bossPowerEligible);
 const unowned=all.filter(id=>bossPowerLevel(id)===0);
 const owned=all.filter(id=>bossPowerLevel(id)>0).sort((a,b)=>bossPowerLevel(a)-bossPowerLevel(b));
 let pool=[...unowned,...owned];
 const choices=[];
 if(recommended&&pool.includes(recommended))choices.push(recommended);
 pool=pool.filter(id=>!choices.includes(id));
 while(pool.length&&choices.length<3){
   const pick=Math.floor(rnd()*pool.length);
   choices.push(pool.splice(pick,1)[0]);
 }
 while(choices.length<3){
   const fallback=all[(choices.length+S.stage)%all.length];
   if(!choices.includes(fallback))choices.push(fallback);
   else break;
 }
 S.bossRewardChoices=choices.slice(0,3);
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
 $("audioStep").classList.add("stagehidden");
 $("abilityStep").classList.add("stagehidden");
 $("bossRewardStep").classList.add("stagehidden");
 $("emotionStep").classList.remove("stagehidden");
 S.stage++;S.stageCurrency=0;S.stageTime=0;S.stageEnding=false;S.stageWaveCount=0;
 S.bossActive=false;S.bossDefeated=false;S.bossQueued=false;S.bossName="";S.bossMaxHp=0;S.bossMidPraise=false;S.bossStartedAt=0;S.bossRewardPending=false;S.bossRewardChoices=[];
 S.stagePraiseMark=30;S.noHitClock=0;S.nextNoHitPraise=16;
 S.stagePending=false;S.run=true;last=performance.now();
 if(audioEngine)audioEngine.setTempo(S.stage>=5?124:116);
 startWave(S.wave+1);
}
function emotionalBondLine(){
 const a=[["Loving",S.pipLove],["Compassionate",S.pipCompassion],["Supportive",S.pipSupport]].sort((x,y)=>y[1]-x[1]);
 if(a[0][1]===0)return"Pip is still learning what kind of companion you need.";
 if(a[0][1]===a[1][1])return`Pip is becoming equally ${a[0][0].toLowerCase()} and ${a[1][0].toLowerCase()}.`;
 return`Pip is becoming especially ${a[0][0].toLowerCase()} because of your choices.`;
}
function openStageUpgrade(){
 S.waveState="stage";
 S.stagePending=true;
 S.run=false;
 enemies=[];shots=[];enemyShots=[];heartBits=[];S.pipPopupQueue=[];S.pipPopupBusy=false;S.pipState="orbit";S.pipTarget=null;P.pipX=P.x+24;P.pipY=P.y;CAM.x=P.x;CAM.y=P.y;
 $("stageTitle").textContent=`Stage ${S.stage} complete.`;
 $("stageText").textContent=`You cleared all 3 waves in ${Math.round(S.stageTime)} seconds and gathered ${S.stageCurrency} Heart Bits. Emotional growth now changes what Pip actually does in combat.`;
 $("stageBond").textContent=emotionalBondLine()+`  ♥ ${S.pipLove}  ♡ ${S.pipCompassion}  ✦ ${S.pipSupport}`;
 $("bossRewardStep").classList.add("stagehidden");
 $("emotionStep").classList.remove("stagehidden");
 $("abilityStep").classList.add("stagehidden");
 $("audioStep").classList.add("stagehidden");
 $("stageUp").classList.remove("hidden");
 renderEmotionButtons();
 if(S.bossRewardPending){openBossRewardStep();return}
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
