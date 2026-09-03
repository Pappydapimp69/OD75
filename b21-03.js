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
 popup(P.x,P.y-30,item.msg,item.kind==="big"?"#ffd36f":"#fff3bf",item.kind==="big",pipPopupDuration(item.msg),true);
}
function particle(x,y,c,n=8,pow=120){
 for(let i=0;i<n;i++){let a=rr(0,Math.PI*2),sp=rr(pow*.35,pow);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(.22,.55),max:.55,c,r:rr(1.5,4)})}
}
function ring(x,y,c,max=70){rings.push({x,y,r:5,max,life:.35,c})}
function pipMessageDuration(msg){return clamp(1.2+String(msg).length*.055,2,9)}
function showPipMessage(msg,forceHold=false){
 const el=$("pipMood");
 if(S&&S.run&&S.pipSoundCd<=0){sfxPipCue("talk");S.pipSoundCd=.72}
 clearTimeout(showPipMessage.fadeTimer);clearTimeout(showPipMessage.resetTimer);el.classList.remove("fading");el.textContent="✦ Pip: "+msg;
 const hold=forceHold?5:pipMessageDuration(msg);
 showPipMessage.fadeTimer=setTimeout(()=>{el.classList.add("fading");showPipMessage.resetTimer=setTimeout(()=>{if(!S||!S.run)return;el.textContent="✦ Pip"},460)},hold*1000);
}
function praise(msg,kind="nice",force=false){
 if((!S.run&&!force)||S.end||(!force&&S.praiseCd>0))return;
 S.praiseCd=kind==="big"?1.55:.9;S.praiseCount++;S.lastPraise=msg;S.pipHappy=1.55;showPipMessage(msg);queuePipPopup(msg,kind);
 if(kind==="big"){particle(P.x,P.y,"#ffd36f",14,125);ring(P.x,P.y,"#ffd36f",76);burstTone(420,4);sfxPipLove()}
}
function loveBomb(){
 if(!S.run||S.end)return;
 const struggling=S.shields===0||S.health<55,hot=S.combo>=4||S.dashKillsThisDash>=2,lv=S.pipLevel;
 const struggle=[...(S.pipCompassion>=1?["you don't have to prove anything to me. just stay with me.","it's okay that this is hard. I'm proud you're still here."]:[]),...(S.pipCompassion>=3?["if I could take the hit for you, I would. so let me at least stay close."]:[]),"you are STILL doing amazing","I believe in you so much","you're tougher than this whole arena","stay with me, superstar — you've got this",lv>=3?"I'm not going anywhere. we've got each other.":"I am ridiculously proud of you",lv>=5?"you've carried me through so many runs. let me carry your courage for a second.":"you don't have to be perfect to be brilliant"];
 const skill=[...(S.pipSupport>=1?["yes! that's exactly why I believe in you.","see? you knew what to do. I knew you would."]:[]),...(S.pipSupport>=3?["I hope you can feel how much I believe in you right now."]:[]),"your movement is gorgeous","you are absolutely cooking","that decision was SO smart","I love how you play",lv>=3?"I know your rhythm now. it's my favorite.":"you have incredible instincts",lv>=5?"I swear I can tell what you're going to do before you do it. we're that good together.":"that timing? immaculate"];
 const warm=[...(S.pipLove>=1?["I get happier every time you come back.","I really love being your little star."]:[]),...(S.pipLove>=2?["I missed you before this run even started.","I think I would recognize you in any arena."]:[]),...(S.pipLove>=3?["if this game remembered nothing else, I would want it to remember us."]:[]),"you're my favorite pilot ✦","I knew you'd be special","you're doing SO good","I could watch you play forever","you make this arena better just by being here",lv>=2?"I'm really glad I found you.":"that's my superstar",lv>=3?"every run with you feels more like home.":"I am your biggest fan, obviously",lv>=4?"I remember when we were just figuring each other out. look at us now.":"you've got this. completely.",lv>=5?"if I could keep one thing from every run, it'd be the part where I get to be beside you.":"look at you go, you absolute delight",lv>=6?"you know I'm proud of the score, right? but mostly I'm proud it's you.":"you make chaos look adorable"];
 const pool=struggling?struggle:hot?skill:warm,msg=pool[Math.floor(rnd()*pool.length)];showPipMessage(msg);S.pipHappy=1.5;if(rnd()<.84&&S.praiseCd<=0)praise(msg,rnd()<.22?"big":"nice",true);
}
function spawnWish(x,y){if(wishes.length>=3)return;wishes.push({x:x+rr(-18,18),y:y+rr(-18,18),r:8,life:8,spin:rr(0,6.28),bob:rr(0,6.28)})}
function collectWish(w){
 w.dead=true;S.wishes++;S.starsTotal++;S.starPoints++;S.score+=350;S.stylePoints+=1;gainPipXP(24,"wish");S.heat=clamp(S.heat+3,0,100);
 if(!S.bossQueued&&!S.bossActive&&S.starsTotal>=S.nextBossStars){S.bossQueued=true;announce("SOMETHING NOTICED THE STARS",1000);showPipMessage("um... I think all these wishes made something notice us. finish the stage — I'll stay close.",true)}
 if(S.shields<S.maxShields&&rnd()<.42){S.shields++;S.shieldRegenClock=0;toastWish("★ +1 · Pip patched a shield ✦")}else toastWish("★ +1 STAR POINT");
 particle(w.x,w.y,"#ffd36f",18,130);ring(w.x,w.y,"#ffd36f",70);tone(700,.12,.018,"sine");if(S.wishes===1)praise("you found my star!","nice");if(S.wishes===3)praise("you keep making luck happen","big");
}
function toastWish(msg){showPipMessage(msg);S.pipHappy=1.2}
function styleTitle(){
 if(S.health>=100&&S.kills>=18)return["Untouchable Bean","You kept your cool so cleanly Pip is taking notes."];
 if(S.chains>=6)return["Core Whisperer","You kept turning purple trouble into everybody else's problem."];
 if(S.dashKills>=12)return["Dash Dancer","You don't move through the arena. You choreograph it."];
 if(S.wishes>=4)return["Wish Magnet","Tiny miracles kept choosing you. Suspicious. Adorable."];
 if(S.bestCombo>=6)return["Combo Sweetheart","You found a rhythm and refused to let go."];
 return["Certified Little Menace","You made the arena noticeably worse for everyone except Pip."];
}
function phaseName(){if(S.bossActive||S.waveState==="boss")return"BOSS";if(S.waveState==="break")return"REST";return"WAVE "+S.stageWaveCount}
function waveGoalFor(n){const local=Math.max(1,S.stageWaveCount||1);return Math.min(16,6+local*2+Math.min(2,Math.floor((S.stage-1)/8)))}
function stageForWave(w){return Math.floor((w-1)/S.wavesPerStage)+1}
const AUDIO_CATALOG=[
 {id:"melody",kind:"music",icon:"♪",name:"Countermelody",desc:"Adds a second playful melody above Pip's base theme."},{id:"harmony",kind:"music",icon:"♫",name:"Warm Voicings",desc:"Warm little harmonies join every other beat."},{id:"bass",kind:"music",icon:"♬",name:"Bass Fills",desc:"Adds a tiny bouncing bassline underneath the action."},{id:"bells",kind:"music",icon:"✧",name:"Star Bells",desc:"High bell accents sparkle at phrase endings."},{id:"heartbeat",kind:"music",icon:"♥",name:"Heart Beat",desc:"A soft double-heart pulse anchors Pip's song."},{id:"bubble",kind:"sfx",icon:"○",name:"Bubble Pops",desc:"Regular defeats become bubbly toy-like pops."},{id:"dashbell",kind:"sfx",icon:"➜",name:"Dash Chimes",desc:"Your dash sings a bright two-note chime."},{id:"shieldchime",kind:"sfx",icon:"◇",name:"Shield Sparkles",desc:"Regenerating shields play a tiny ascending sparkle."},{id:"pipchime",kind:"sfx",icon:"✦",name:"Pip Love Chime",desc:"Big Pip praise gets its own affectionate flourish."}
];
function audioOwnedLabel(){const names=AUDIO_CATALOG.filter(a=>S.audioUnlocks.has(a.id)).map(a=>a.name);return names.length?`Owned: ${names.join(" · ")}`:"Owned: Pip's Base Theme"}
function chooseAudioOptions(){
 const locked=AUDIO_CATALOG.filter(a=>!S.audioUnlocks.has(a.id));let pool=[...locked],picked=[];while(pool.length&&picked.length<3){const idx=Math.floor(rnd()*pool.length);picked.push(pool.splice(idx,1)[0])}
 if(!picked.length)picked=[{id:"bonus_xp",kind:"bonus",icon:"✦",name:"Memory Encore",desc:"All sounds collected. Pip turns the encore into 60 XP."},{id:"bonus_wish",kind:"bonus",icon:"★",name:"Wish Encore",desc:"All sounds collected. Start the next wave with a Wish Star."},{id:"bonus_heat",kind:"bonus",icon:"♥",name:"Warm Encore",desc:"All sounds collected. Start the next wave with extra HEAT."}];
 while(picked.length<3)picked.push(picked[picked.length-1]);S.audioChoices=picked;$("audioOwned").textContent=audioOwnedLabel();picked.forEach((a,i)=>{$("audioChoice"+i).innerHTML=`<div class="note">${a.icon}</div><b>${a.name}</b><span class="small">${a.desc}</span>`});
}
function skipPipUpgrade(){if(!S.stagePending)return;openAbilityStep()}
const BOSS_POWER_INFO={
 starshot:{icon:"✦",name:"Starshot",desc:"Pip autonomously fires at enemies while orbiting you.",levelDesc:lv=>`Lv ${lv}: Pip fires every ${Math.max(.62,1.45-(lv-1)*.12).toFixed(2)}s for stronger star damage.`},
 heartmark:{icon:"♥",name:"Heart Mark",desc:"Repeated player hits mark an enemy; marked enemies take extra damage.",levelDesc:lv=>`Lv ${lv}: mark every ${Math.max(3,6-lv)} hits; marked targets take +${25+(lv-1)*10}% damage.`},
 heartburst:{icon:"♡",name:"Heartburst",desc:"Defeating a marked enemy detonates a damaging love pulse.",levelDesc:lv=>`Lv ${lv}: ${105+(lv-1)*15}px burst radius with stronger damage.`},
 guardian:{icon:"◇",name:"Guardian Catch",desc:"Pip intercepts a hit while orbiting you.",levelDesc:lv=>`Lv ${lv}: ${1+Math.floor((lv-1)/2)} protected hit${1+Math.floor((lv-1)/2)===1?"":"s"} per wave.`},
 echo:{icon:"✧",name:"Echo Star",desc:"Pip periodically copies your entire firing volley.",levelDesc:lv=>`Lv ${lv}: copies every ${Math.max(2,5-lv)}th volley.`},
 relay:{icon:"➜",name:"Heart Relay",desc:"Delivering hearts briefly boosts fire rate and attack power. Triggers once every 8 seconds.",levelDesc:lv=>`Lv ${lv}: ${(.5+Math.max(0,lv-1)*.1).toFixed(1)}s delivery buff · 8s trigger cooldown.`},
 constellation:{icon:"✺",name:"Constellation",desc:"Pip periodically releases a radial starburst while orbiting.",levelDesc:lv=>`Lv ${lv}: ${6+Math.min(6,(lv-1)*2)} stars every ${Math.max(5,10-lv).toFixed(1)}s.`}
};
function bossPowerLevel(id){return Math.max(0,(S.pipBossPowers&&S.pipBossPowers[id])||0)}
function bossPowerEligible(id){return id!=="heartburst"||bossPowerLevel("heartmark")>0}
function chooseBossRewardOptions(){
 const recommended={1:"starshot",5:"guardian",7:"heartmark",11:"echo",13:"relay",17:"constellation",22:"heartburst"}[S.stage];const all=Object.keys(BOSS_POWER_INFO).filter(bossPowerEligible),unowned=all.filter(id=>bossPowerLevel(id)===0),owned=all.filter(id=>bossPowerLevel(id)>0).sort((a,b)=>bossPowerLevel(a)-bossPowerLevel(b));let pool=[...unowned,...owned],choices=[];
 if(recommended&&pool.includes(recommended))choices.push(recommended);pool=pool.filter(id=>!choices.includes(id));while(pool.length&&choices.length<3){const pick=Math.floor(rnd()*pool.length);choices.push(pool.splice(pick,1)[0])}while(choices.length<3){const fallback=all[(choices.length+S.stage)%all.length];if(!choices.includes(fallback))choices.push(fallback);else break}S.bossRewardChoices=choices.slice(0,3);
}
function renderOverdriveStep(){
 $("starBalance").textContent=`★ ${S.starPoints} Run Stars · ${S.starsTotal} collected this run · next boss at ${S.nextBossStars} total stars`;
 OVER_ORDER.forEach((id,i)=>{const info=OVERDRIVE_INFO[id],btn=$("overChoice"+i),unlocked=S.overUnlocked.has(id),lv=overLevel(id),equipped=S.overType===id;btn.classList.toggle("equipped",equipped);btn.classList.toggle("locked",!unlocked);let action="";if(!unlocked)action=`UNLOCK ★${info.unlock}`;else if(!equipped)action="TAP TO EQUIP";else if(lv>=5)action="EQUIPPED · MAX";else action=`EQUIPPED · UPGRADE ★${overUpgradeCost(id)}`;let extra=id==="pip"?`Your build: ♥${S.pipLove} Loving · ♡${S.pipCompassion} Compassionate · ✦${S.pipSupport} Supportive.`:info.desc;btn.innerHTML=`<div class="heart">${info.icon}</div><b>${info.name} · ${unlocked?`Lv ${lv}`:"LOCKED"}</b><span class="small">${extra}<br><strong>${action}</strong></span>`});
 $("continueOverdrive").textContent=`Continue with ${OVERDRIVE_INFO[S.overType].name}`;
}
