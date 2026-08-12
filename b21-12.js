// B26 exploration economy: run-reset Pip growth, Music Notes, Prism Seeds, voice packs, and Ascendant Heart magnet.
const PIP_SOUND_PACKS=[
 {id:"honey",name:"Honey",icon:"♪",cost:1,desc:"Warm rounded bell chirps with a soft golden finish."},
 {id:"bubble",name:"Bubble",icon:"○",cost:1,desc:"Toy-like pops and buoyant little blips."},
 {id:"starlight",name:"Starlight",icon:"✧",cost:2,desc:"Bright glassy sparkles that shimmer above the mix."},
 {id:"plush",name:"Plush",icon:"♡",cost:2,desc:"Soft low-volume pips with a cuddly toy feel."},
 {id:"cherub",name:"Cherub",icon:"♬",cost:3,desc:"Airy stacked chimes that feel almost choir-like."},
 {id:"cosmic",name:"Cosmic",icon:"✦",cost:3,desc:"Tiny detuned synth twinkles with a spacey tail."}
];
let musicNoteDrops=[],prismSeedDrops=[];

// Persist the soundtrack collection only. Pip combat growth is run-based.
savePip=function(){
 try{localStorage.setItem(PIP_SAVE_KEY,JSON.stringify({
   level:1,xp:0,love:0,compassion:0,support:0,
   rangeLv:0,speedLv:0,powerLv:0,guardLv:0,bossPowers:{},
   audio:[...(S?.audioUnlocks||[])]
 }))}catch(_){}
};

function resetPipRunProgressB26(){
 if(!S)return;
 S.pipLevel=1;S.pipXP=0;S.pipLove=0;S.pipCompassion=0;S.pipSupport=0;
 S.pipRangeLv=0;S.pipSpeedLv=0;S.pipPowerLv=0;S.pipGuardLv=0;S.pipBossPowers={};
 S.pipHitCount=0;S.pipVolleyCount=0;S.pipShotCd=.8;S.pipConstellationCd=4;S.pipRelayBuff=0;S.supportRush=0;
 S.guardianCharges=0;S.lovePulsePending=0;
 S.musicNotes=0;S.prismSeeds=0;S.pipSoundPack="base";S.pipSoundUnlocked=new Set();
 S.b26StartX=P?.x||0;S.b26StartY=P?.y||0;
 S.b26AmbientTimer=7;S.b26MusicEventTimer=24;S.b26PrismEventTimer=34;S.b26DropStarted=false;
 musicNoteDrops=[];prismSeedDrops=[];
 applyPipPower();savePip();
 if($("pipMood"))$("pipMood").textContent="✦ Pip: fresh run, fresh little spark. I'm with you.";
}

const resetBeforeB26=reset;
reset=function(){resetBeforeB26();resetPipRunProgressB26();updateUI()};
resetPipRunProgressB26();

// The original AGAIN listener captured the pre-B26 reset function, so intercept it first.
const againB26=$("again");
if(againB26)againB26.addEventListener("click",e=>{e.stopImmediatePropagation();reset()},true);

function b26PointOutsideViews(){
 const startX=S.b26StartX||0,startY=S.b26StartY||0;
 for(let tries=0;tries<30;tries++){
   const a=rr(0,Math.PI*2),far=rr(Math.max(W,H)*.78,Math.max(W,H)*1.32);
   const x=P.x+Math.cos(a)*far,y=P.y+Math.sin(a)*far;
   const outsideCurrent=Math.abs(x-CAM.x)>W*.58||Math.abs(y-CAM.y)>H*.58;
   const outsideStart=Math.abs(x-startX)>W*.58||Math.abs(y-startY)>H*.58;
   if(outsideCurrent&&outsideStart)return{x,y};
 }
 const a=rr(0,Math.PI*2),far=Math.max(W,H)*1.35;
 return{x:P.x+Math.cos(a)*far,y:P.y+Math.sin(a)*far};
}

function spawnAmbientMusicNote(){
 if(musicNoteDrops.filter(n=>!n.dead&&!n.event).length>=2)return;
 const p=b26PointOutsideViews();
 musicNoteDrops.push({x:p.x,y:p.y,r:12,life:90,dead:false,event:false,reward:1,fall:0,phase:rr(0,6.28)});
}
function spawnMusicStarEvent(){
 if(musicNoteDrops.some(n=>!n.dead&&n.event))return;
 const p=b26PointOutsideViews();
 musicNoteDrops.push({x:p.x,y:p.y,r:14,life:18,dead:false,event:true,reward:2,fall:1.15,fallMax:1.15,phase:rr(0,6.28)});
 announce("MUSIC STAR FALLING",900);
 showPipMessage("I heard a music star land out there — follow the flashing marker!",true);
}
function spawnPrismEvent(){
 if(prismSeedDrops.some(n=>!n.dead))return;
 const p=b26PointOutsideViews();
 prismSeedDrops.push({x:p.x,y:p.y,r:14,life:21,dead:false,event:true,fall:1.05,fallMax:1.05,phase:rr(0,6.28)});
 announce("PRISM SEED FALLING",900);
 showPipMessage("prism seed! that can change one of my attributes — marker's up!",true);
}
function collectMusicNote(n){
 if(n.dead)return;n.dead=true;S.musicNotes=(S.musicNotes||0)+(n.reward||1);S.score+=n.event?700:300;
 popup(n.x,n.y,`♪ +${n.reward||1}`,"#c9f3ff",true,.9);particle(n.x,n.y,"#9ee7ff",18,130);ring(n.x,n.y,"#9ee7ff",78);
 if(ensureAudio())audioEngine.chime(n.event?[76,81,88]:[72,79],n.event?.045:.030);
 praise(n.event?"you chased it down! that note is ours ✦":"you found a little piece of my soundtrack","nice",true);
}
function collectPrismSeed(n){
 if(n.dead)return;n.dead=true;S.prismSeeds=(S.prismSeeds||0)+1;S.score+=900;
 popup(n.x,n.y,"◆ PRISM SEED","#d9c8ff",true,1.0);particle(n.x,n.y,"#b388ff",22,155);ring(n.x,n.y,"#d9c8ff",88);
 if(ensureAudio())audioEngine.chime([67,74,79,86],.038);
 praise("you got it! that's a whole new piece of me waiting to happen.","big",true);
}

function updateB26Drops(dt){
 if(!S.run||S.end||S.waveState==="stage")return;
 if(!S.b26DropStarted){S.b26DropStarted=true;S.b26AmbientTimer=5.5;S.b26MusicEventTimer=22;S.b26PrismEventTimer=32}
 if(!S.bossActive&&S.waveState==="active"){
   S.b26AmbientTimer-=dt;S.b26MusicEventTimer-=dt;S.b26PrismEventTimer-=dt;
   if(S.b26AmbientTimer<=0){spawnAmbientMusicNote();S.b26AmbientTimer=rr(17,29)}
   if(S.b26MusicEventTimer<=0){spawnMusicStarEvent();S.b26MusicEventTimer=rr(38,56)}
   if(S.b26PrismEventTimer<=0){spawnPrismEvent();S.b26PrismEventTimer=rr(50,72)}
 }
 for(const n of musicNoteDrops){
   if(n.dead)continue;n.life-=dt;n.phase+=dt*5;if(n.fall>0)n.fall=Math.max(0,n.fall-dt);
   if(n.fall<=0&&hyp(P.x-n.x,P.y-n.y)<P.r+n.r+7)collectMusicNote(n);
 }
 for(const n of prismSeedDrops){
   if(n.dead)continue;n.life-=dt;n.phase+=dt*5;if(n.fall>0)n.fall=Math.max(0,n.fall-dt);
   if(n.fall<=0&&hyp(P.x-n.x,P.y-n.y)<P.r+n.r+7)collectPrismSeed(n);
 }
 musicNoteDrops=musicNoteDrops.filter(n=>!n.dead&&n.life>0);
 prismSeedDrops=prismSeedDrops.filter(n=>!n.dead&&n.life>0);
}

function updateAscendantHeartMagnetB26(dt){
 if(!S.run||S.end||S.over<=0||S.overType!=="pip")return;
 const lv=Math.max(1,overLevel("pip"));
 const radius=190+lv*75;
 const pullSpeed=260+lv*130;
 for(const h of heartBits){
   if(h.dead||h.life<=0)continue;
   const dx=P.pipX-h.x,dy=P.pipY-h.y,d=hyp(dx,dy)||1;
   if(d>radius)continue;
   if(d<13){collectHeartBit(h);continue}
   const proximity=1-clamp(d/radius,0,1);
   const step=Math.min(d,pullSpeed*(.45+proximity*.95)*dt);
   h.x+=dx/d*step;h.y+=dy/d*step;
   h.vx*=.72;h.vy*=.72;
 }
}

const updateBeforeB26=update;
update=function(dt){
 updateBeforeB26(dt);
 updateB26Drops(dt);
 updateAscendantHeartMagnetB26(dt);
};

function drawFallingTrailB26(x,y,fall,color){
 if(fall<=0)return;
 const len=70+fall*80;X.strokeStyle=color;X.globalAlpha=.45;X.lineWidth=3;X.beginPath();X.moveTo(x-35,y-len);X.lineTo(x,y);X.stroke();X.globalAlpha=1;
}
function drawWaypointB26(item,color,symbol){
 const sx=worldToScreenX(item.x),sy=worldToScreenY(item.y),margin=38;
 const onscreen=sx>margin&&sx<W-margin&&sy>margin&&sy<H-margin;
 const pulse=.55+.45*Math.sin(S.t*10+item.phase);
 if(onscreen){X.globalAlpha=.45+.45*pulse;X.strokeStyle=color;X.lineWidth=2.5;X.beginPath();X.arc(sx,sy,20+6*pulse,0,Math.PI*2);X.stroke();X.globalAlpha=1;return}
 const dx=sx-W/2,dy=sy-H/2;
 if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
 const scale=Math.min((W/2-margin)/Math.max(1,Math.abs(dx)),(H/2-margin)/Math.max(1,Math.abs(dy)));
 const x=W/2+dx*scale,y=H/2+dy*scale,a=Math.atan2(dy,dx);
 X.save();X.translate(x,y);X.globalAlpha=.55+.45*pulse;X.strokeStyle=color;X.lineWidth=2.5;X.beginPath();X.arc(0,0,17+3*pulse,0,Math.PI*2);X.stroke();X.rotate(a);X.fillStyle=color;X.beginPath();X.moveTo(23,0);X.lineTo(10,-7);X.lineTo(10,7);X.closePath();X.fill();X.rotate(-a);X.fillStyle="#fff";X.font="bold 14px system-ui";X.textAlign="center";X.fillText(symbol,0,5);X.restore();
}
function drawB26Drops(){
 X.save();X.textAlign="center";
 for(const n of musicNoteDrops){
   const sx=worldToScreenX(n.x),baseY=worldToScreenY(n.y),fallOffset=n.fall>0?(n.fall/(n.fallMax||1))*130:0,sy=baseY-fallOffset;
   if(sx>-60&&sx<W+60&&sy>-180&&sy<H+60){drawFallingTrailB26(sx,sy,n.fall,"#9ee7ff");X.globalAlpha=.8+.2*Math.sin(S.t*7+n.phase);X.fillStyle=n.event?"#eafcff":"#9ee7ff";X.font=`bold ${n.event?28:23}px system-ui`;X.fillText(n.event?"♫":"♪",sx,sy+8);X.globalAlpha=1}
   if(n.event)drawWaypointB26(n,"#9ee7ff","♪");
 }
 for(const n of prismSeedDrops){
   const sx=worldToScreenX(n.x),baseY=worldToScreenY(n.y),fallOffset=n.fall>0?(n.fall/(n.fallMax||1))*120:0,sy=baseY-fallOffset;
   if(sx>-60&&sx<W+60&&sy>-170&&sy<H+60){drawFallingTrailB26(sx,sy,n.fall,"#d9c8ff");X.save();X.translate(sx,sy);X.rotate(S.t*1.7+n.phase);X.globalAlpha=.86+.14*Math.sin(S.t*8+n.phase);X.fillStyle="#d9c8ff";X.beginPath();X.moveTo(0,-13);X.lineTo(10,0);X.lineTo(0,13);X.lineTo(-10,0);X.closePath();X.fill();X.fillStyle="#ffffffaa";X.beginPath();X.moveTo(0,-8);X.lineTo(4,0);X.lineTo(0,3);X.closePath();X.fill();X.restore();X.globalAlpha=1}
   drawWaypointB26(n,"#d9c8ff","◆");
 }
 X.restore();
}
const drawBeforeB26=draw;
draw=function(){drawBeforeB26();drawB26Drops()};

// One Prism Seed buys one attribute level. Hearts remain for emotional growth.
function pipPrismCost(){return 1}
renderAbilityShop=function(){
 $("abilityBalance").textContent=`◆ ${S.prismSeeds||0} Prism Seed${(S.prismSeeds||0)===1?"":"s"} available · one seed = one attribute level`;
 const map={range:"abilityRange",speed:"abilitySpeed",power:"abilityPower",guard:"abilityGuard"};
 for(const [kind,id] of Object.entries(map)){
   const info=PIP_ABILITY_INFO[kind],lv=pipAbilityLevel(kind),btn=$(id);
   const rangeOverflow=kind==="range"&&lv>=20,maxed=kind!=="range"&&lv>=info.max;
   const effect=maxed?info.desc:pipAbilityEffectText(kind);
   btn.innerHTML=`<div class="heart">${info.icon}</div><b>${info.name} · Lv ${lv}${maxed?" MAX":` → ${lv+1} · ◆ 1`}</b><span class="small">${rangeOverflow&&!maxed?`Range MAX 200px · Pip speed +1%`:effect}</span>`;
   btn.disabled=maxed||(S.prismSeeds||0)<pipPrismCost();btn.classList.toggle("ready",!btn.disabled);
 }
};
buyPipAbility=function(kind){
 if(!S.stagePending)return;const info=PIP_ABILITY_INFO[kind];if(!info)return;
 const lv=pipAbilityLevel(kind);if(kind!=="range"&&lv>=info.max)return;
 if((S.prismSeeds||0)<1){showPipMessage("we need a Prism Seed for that attribute.",true);return}
 S.prismSeeds--;if(kind==="range")S.pipRangeLv++;else if(kind==="speed")S.pipSpeedLv++;else if(kind==="power")S.pipPowerLv++;else S.pipGuardLv++;
 applyPipPower();savePip();renderAbilityShop();
 const lines={range:`Heart Sense tuned — ${Math.round(S.pipDetectRange)}px and counting.`,speed:"I feel quicker already. I'll get back to you faster.",power:"my star power just got sharper.",guard:"my guardian glow feels steadier now."};
 praise(lines[kind],"big",true);
};

function ensurePipSoundStepB26(){
 if($("pipSoundStep"))return;
 const step=document.createElement("div");step.id="pipSoundStep";step.className="stagehidden";
 step.innerHTML=`<h2>Pip Sounds ♪</h2><p>Music Notes unlock new Pip voice palettes for this run. Pick any sound you've unlocked.</p><div id="pipSoundBalance" class="small"></div><div id="pipSoundGrid" class="overgrid"></div><button id="continuePipSounds" class="primary">Continue to soundtrack</button>`;
 const ability=$("abilityStep");ability.insertAdjacentElement("afterend",step);
 $("continuePipSounds").addEventListener("click",()=>{step.classList.add("stagehidden");openAudioStepB26Base()});
}
function renderPipSoundStepB26(){
 ensurePipSoundStepB26();
 $("pipSoundBalance").textContent=`♪ ${S.musicNotes||0} Music Note${(S.musicNotes||0)===1?"":"s"} · Current: ${S.pipSoundPack==="base"?"Pip Base":PIP_SOUND_PACKS.find(p=>p.id===S.pipSoundPack)?.name||"Pip Base"}`;
 const grid=$("pipSoundGrid");grid.innerHTML="";
 for(const pack of PIP_SOUND_PACKS){
   const unlocked=S.pipSoundUnlocked.has(pack.id),selected=S.pipSoundPack===pack.id,btn=document.createElement("button");btn.className="upgrade"+(selected?" equipped":"");
   const action=unlocked?(selected?"SELECTED":"TAP TO USE"):(S.musicNotes>=pack.cost?`UNLOCK ♪${pack.cost}`:`NEEDS ♪${pack.cost}`);
   btn.innerHTML=`<div class="heart">${pack.icon}</div><b>${pack.name}</b><span class="small">${pack.desc}<br><strong>${action}</strong></span>`;
   btn.addEventListener("click",()=>selectPipSoundPackB26(pack.id));grid.appendChild(btn);
 }
}
function selectPipSoundPackB26(id){
 const pack=PIP_SOUND_PACKS.find(p=>p.id===id);if(!pack)return;
 if(!S.pipSoundUnlocked.has(id)){
   if((S.musicNotes||0)<pack.cost){showPipMessage(`we need ${pack.cost-(S.musicNotes||0)} more Music Note${pack.cost-(S.musicNotes||0)===1?"":"s"} for ${pack.name}.`,true);return}
   S.musicNotes-=pack.cost;S.pipSoundUnlocked.add(id);showPipMessage(`${pack.name} unlocked for this run.`,true);
 }
 S.pipSoundPack=id;renderPipSoundStepB26();sfxPipCue("return");
}
function openPipSoundStepB26(){
 ensurePipSoundStepB26();$("emotionStep").classList.add("stagehidden");$("abilityStep").classList.add("stagehidden");$("audioStep").classList.add("stagehidden");$("pipSoundStep").classList.remove("stagehidden");renderPipSoundStepB26();showPipMessage("want to choose how I sound this run? every note you chased down is in here.",true);
}
const openAudioStepB26Base=openAudioStep;
ensurePipSoundStepB26();
const continueAbilitiesB26=$("continueAbilities");
if(continueAbilitiesB26)continueAbilitiesB26.addEventListener("click",e=>{e.stopImmediatePropagation();openPipSoundStepB26()},true);

// Voice palettes replace Pip's companion cues while selected.
const sfxPipCueB26Base=sfxPipCue,sfxPipLoveB26Base=sfxPipLove;
function playPipPackCueB26(kind="talk",big=false){
 if(!S||S.pipSoundPack==="base")return false;
 if(!ensureAudio())return true;
 const t=audioCtx.currentTime,pack=S.pipSoundPack,offset=kind==="heart"?80:kind==="return"?45:kind==="depart"?-35:0;
 if(pack==="honey"){audioEngine.fmBell(720+offset,t,.18,big?.035:.020,-.18,audioEngine.sfx);audioEngine.fmBell(900+offset,t+.045,.20,big?.030:.016,.20,audioEngine.sfx)}
 else if(pack==="bubble"){audioEngine.pop(t,big?.040:.024,-.18);audioEngine.sfxTone(520+offset,.08,big?.030:.018,"sine");if(big)audioEngine.pop(t+.055,.027,.24)}
 else if(pack==="starlight"){[820,1030,1290].slice(0,big?3:2).forEach((f,i)=>audioEngine.fmBell(f+offset,t+i*.035,.20,big?.027:.016,(i-1)*.22,audioEngine.sfx))}
 else if(pack==="plush"){audioEngine.voice(360+offset*.35,t,.11,big?.030:.018,"sine",-.12,1700,.008,.07,-4,audioEngine.sfx);audioEngine.voice(470+offset*.35,t+.035,.13,big?.025:.014,"triangle",.14,1500,.008,.08,4,audioEngine.sfx)}
 else if(pack==="cherub"){audioEngine.chime(big?[76,81,84,88]:[76,81,84],big?.034:.022)}
 else if(pack==="cosmic"){audioEngine.voice(610+offset,t,.14,big?.031:.019,"triangle",-.22,3800,.004,.09,-11,audioEngine.sfx);audioEngine.voice(925+offset,t+.025,.16,big?.027:.016,"sine",.24,4200,.004,.11,13,audioEngine.sfx)}
 return true;
}
sfxPipCue=function(kind="talk"){if(!playPipPackCueB26(kind,false))sfxPipCueB26Base(kind)};
sfxPipLove=function(){if(!playPipPackCueB26("love",true))sfxPipLoveB26Base()};

const updateUIBeforeB26=updateUI;
updateUI=function(){
 updateUIBeforeB26();
 if($("currencyHud"))$("currencyHud").textContent=`♥ ${S.heartCurrency} · ★ ${S.starPoints} · ♪ ${S.musicNotes||0} · ◆ ${S.prismSeeds||0}`;
};

const finishBeforeB26=finish;
finish=function(dead){
 finishBeforeB26(dead);
 const el=$("endText");if(el)el.textContent=el.textContent.replace("Pip remembers the XP and the music you earned together.","Pip's combat growth resets next run; your soundtrack collection remains.");
};
