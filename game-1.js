"use strict";
const C=document.getElementById("c"),X=C.getContext("2d"),$=id=>document.getElementById(id);
let W=900,H=600,DPR=Math.min(2,window.devicePixelRatio||1);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hyp=Math.hypot;
let keys=new Set(),joy={active:false,id:null,originX:0,originY:0,dx:0,dy:0},gamepad={dx:0,dy:0,dashHeld:false,index:null},last=performance.now(),
audioCtx=null,audioEngine=null,audioUnlocked=false,audioUnlocking=false,seed=0xA11CE;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function rr(a,b){return a+rnd()*(b-a)}
const PIP_SAVE_KEY="overdrive75_pip_v2";
function loadPip(){
 try{
   const v=JSON.parse(localStorage.getItem(PIP_SAVE_KEY)||"null");
   if(v&&Number.isFinite(v.level)&&Number.isFinite(v.xp))return{
     level:Math.max(1,v.level|0),xp:Math.max(0,v.xp|0),
     love:Math.max(0,v.love|0),compassion:Math.max(0,v.compassion|0),support:Math.max(0,v.support|0),
     rangeLv:Math.max(0,v.rangeLv|0),speedLv:Math.max(0,v.speedLv|0),powerLv:Math.max(0,v.powerLv|0),guardLv:Math.max(0,v.guardLv|0),
     bossPowers:(v.bossPowers&&typeof v.bossPowers==="object")?Object.fromEntries(Object.entries(v.bossPowers).filter(([k,n])=>typeof k==="string"&&Number.isFinite(n)).map(([k,n])=>[k,Math.max(0,n|0)])):{},
     audio:Array.isArray(v.audio)?v.audio.filter(x=>typeof x==="string"):[]
   };
 }catch(e){}
 return{level:1,xp:0,love:0,compassion:0,support:0,rangeLv:0,speedLv:0,powerLv:0,guardLv:0,bossPowers:{},audio:[]};
}
function savePip(){
 try{localStorage.setItem(PIP_SAVE_KEY,JSON.stringify({
   level:S.pipLevel,xp:S.pipXP,love:S.pipLove,compassion:S.pipCompassion,support:S.pipSupport,
   rangeLv:S.pipRangeLv,speedLv:S.pipSpeedLv,powerLv:S.pipPowerLv,guardLv:S.pipGuardLv,
   bossPowers:S.pipBossPowers||{},
   audio:[...S.audioUnlocks]
 }))}catch(e){}
}
function pipNeed(level){return 65+(level-1)*45}
function pipBondName(level){
 if(level<=1)return"Spark";
 if(level===2)return"Pal";
 if(level===3)return"Bestie";
 if(level===4)return"Heartstar";
 if(level===5)return"Soulstar";
 if(level===6)return"Forever Friend";
 return"Constellation";
}
function applyPipPower(){
 const lv=S.pipLevel||1;
 const senseLv=Math.max(0,S.pipRangeLv||0);
 const cappedSenseLv=Math.min(20,senseLv);
 const rangeSteps=Math.min(10,Math.ceil(Math.min(19,cappedSenseLv)/2));
 const senseSpeedSteps=Math.floor(cappedSenseLv/2)+Math.max(0,senseLv-20);
 S.pipDetectRange=41+(159/10)*rangeSteps;
 if(rangeSteps>=10)S.pipDetectRange=200;
 S.pipMoveSpeed=(285+(S.pipSpeedLv||0)*34)*(1+senseSpeedSteps*.01);
 S.attackMax=Math.max(.17,.33-(lv-1)*.014-(S.pipPowerLv||0)*.006);
 S.attackRange=Math.min(430,Math.min(W,H)*.55+(lv-1)*12+(S.pipPowerLv||0)*7);
 S.weaponPower=1+Math.min(1,(lv-1)*.14)+(S.pipPowerLv||0)*.11;
 S.projectileSize=6+Math.min(3,(lv-1)*.35)+Math.min(2,(S.pipPowerLv||0)*.15);
 S.shieldRegenDelay=Math.max(1.55,4.0-(S.pipCompassion||0)*.28-(S.pipGuardLv||0)*.20);
 S.shieldRegenRate=Math.max(3.1,5.5-(S.pipGuardLv||0)*.18);
 S.supportPower=1+(S.pipSupport||0)*.07+(S.pipGuardLv||0)*.025;
 S.loveWishBonus=Math.min(.24,(S.pipLove||0)*.025+(S.pipRangeLv||0)*.004);
}
function gainPipXP(amount,reason=""){
 if(!S||S.end)return;
 S.pipXP+=Math.max(1,Math.round(amount));
 while(S.pipXP>=pipNeed(S.pipLevel)){
   S.pipXP-=pipNeed(S.pipLevel);
   S.pipLevel++;
   applyPipPower();
   savePip();
   const bond=pipBondName(S.pipLevel);
   announce("PIP LEVEL "+S.pipLevel+"!",1000);
   praise(
     S.pipLevel===2?"we're getting really good together ✦":
     S.pipLevel===3?"I think you're my favorite person to fly with":
     S.pipLevel===4?"I feel safer when it's you and me":
     S.pipLevel===5?"I remember every run with you. I mean that.":
     S.pipLevel===6?"wherever you go next, I want to be there too":
     "look how far we've come together ✦",
     "big",true
   );
   showPipMessage(bond+" unlocked — I adore you",true);
   particle(P.x,P.y,"#ffd36f",28,170);ring(P.x,P.y,"#ffd36f",110);burstTone(440,6);
 }
 savePip();
}
function resizeArena(){
 W=Math.max(320,window.innerWidth||900);
 H=Math.max(420,window.innerHeight||600);
 DPR=Math.min(2,window.devicePixelRatio||1);
 C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);
 C.style.width=W+"px";C.style.height=H+"px";
 X.setTransform(DPR,0,0,DPR,0,0);
}

let S,P,CAM,enemies,particles,rings,shards,texts,shots,enemyShots,wishes,heartBits,shake=0,flash=0;
const COLORS={chaser:"#ff6e8b",charger:"#ffd36f",core:"#b388ff",boss:"#ff7dd8",player:"#7ed8ff",good:"#7be0ae"};

function reset(){
 seed=0xA11CE;
 const pip=loadPip();
 S={run:false,end:false,t:0,total:75,score:0,combo:1,comboClock:0,kills:0,bestCombo:1,heat:0,over:0,
    pipLevel:pip.level,pipXP:pip.xp,pipLove:pip.love||0,pipCompassion:pip.compassion||0,pipSupport:pip.support||0,
    pipRangeLv:pip.rangeLv||0,pipSpeedLv:pip.speedLv||0,pipPowerLv:pip.powerLv||0,pipGuardLv:pip.guardLv||0,
    pipBossPowers:{...(pip.bossPowers||{})},bossRewardChoices:[],bossRewardPending:false,
    pipHitCount:0,pipVolleyCount:0,pipShotCd:.8,pipConstellationCd:4,pipRelayBuff:0,supportRush:0,
    guardianCharges:0,lovePulsePending:0,
    audioUnlocks:new Set(pip.audio||[]),audioEnabled:true,audioChoices:[],stageGrowthChoice:null,
    heartCurrency:0,heartTotal:loadHeartTotal(),stageCurrency:0,upgradeCost:12,
    weaponPower:1,projectileSize:6,supportPower:1,loveWishBonus:0,
    pipState:"orbit",pipTarget:null,pipDetectRange:41,pipMoveSpeed:285,pipSoundCd:0,
    health:100,maxHealth:100,shields:3,maxShields:3,shieldRegenDelay:4.0,shieldRegenRate:5.5,shieldRegenClock:0,
    dashCd:0,dashMax:.72,dashTime:0,attackCd:0,attackMax:.33,attackRange:Math.min(270,Math.max(185,Math.min(W,H)*.55)),invuln:0,spawn:0,phase:0,chains:0,nearMiss:0,
    dashKills:0,dashKillsThisDash:0,wishes:0,praiseCd:0,praiseCount:0,lastPraise:"",pipHappy:0,
    shieldComebacks:0,stylePoints:0,overdrives:0,loveClock:2.2,closeCalls:0,lastHpPraise:100,
    wave:1,waveState:"active",waveKills:0,waveGoal:7,waveBreak:0,waveStartedAt:0,waveBanner:false,waveElapsed:0,
    stage:1,wavesPerStage:3,stagePending:false,stageTime:0,stageEnding:false,stageWaveCount:0,
    bossActive:false,bossDefeated:false,bossQueued:false,bossName:"",bossMaxHp:0,bossMidPraise:false,bossStartedAt:0,
    distanceTravelled:0,nextDistancePraise:420,noHitClock:0,nextNoHitPraise:16,stagePraiseMark:30,
    pipPopupQueue:[],pipPopupBusy:false};
 P={x:0,y:0,r:10,vx:0,vy:0,faceX:1,faceY:0,trail:[],pipAngle:0,pipX:24,pipY:0};
 CAM={x:0,y:0};
 enemies=[];particles=[];rings=[];shards=[];texts=[];shots=[];enemyShots=[];wishes=[];heartBits=[];shake=0;flash=0;
 applyPipPower();
 $("start").classList.remove("hidden");$("end").classList.add("hidden");$("stageUp").classList.add("hidden");
 $("audioToggle").textContent=audioUnlocked?"♫ ON":"♫ TAP";
 $("pipMood").textContent=S.pipLevel>=4?"✦ Pip: you're back. I missed doing this with you.":"✦ Pip: I already know you're going to be great";
 updateUI();
}
const BOSS_STAGES=new Set([1,5,7,11,13,17,22]);
const BOSS_DATA={
 1:{name:"THE GRUMP STAR",color:"#ff8fcf",root:48,bpm:124,beat:0,
    motif:[0,7,3,10,7,12,10,7],
    intro:"oh! that's a BIG one. okay. I'm a little scared, but I believe in you more than I'm scared.",
    mid:"you're doing it. keep going — I'm so proud of you.",
    victory:"YOU DID IT! our first boss! I knew choosing you was the best thing I could ever do."},
 5:{name:"VELVET FANG",color:"#ff6e8b",root:46,bpm:130,beat:1,
    motif:[0,3,7,6,10,7,3,1],
    intro:"this is the stage-five wall. stay close when you can. I know you can break through it.",
    mid:"look at you standing your ground. that's my superstar.",
    victory:"you broke the wall. I hope you know how strong you've become."},
 7:{name:"STATIC BLOOM",color:"#b388ff",root:50,bpm:132,beat:2,
    motif:[0,6,10,7,13,10,6,3],
    intro:"that thing is buzzing in a way I do NOT like. good thing I trust you completely.",
    mid:"it's cracking! you're making the impossible look learnable.",
    victory:"Static Bloom defeated. you were brilliant. absolutely brilliant."},
 11:{name:"HOLLOW BELL",color:"#7ed8ff",root:43,bpm:128,beat:3,
    motif:[0,7,11,6,3,10,8,5],
    intro:"I can hear it before it moves. don't panic. listen to me: you are ready.",
    mid:"yes. exactly like that. calm hands, brave heart.",
    victory:"the bell went quiet. you didn't. I'm so proud I could explode."},
 13:{name:"LUCKY THIRTEEN",color:"#ffd36f",root:49,bpm:136,beat:4,
    motif:[0,1,7,8,4,11,10,3],
    intro:"stage thirteen. lucky for me, I brought my favorite player.",
    mid:"it picked the wrong person to underestimate.",
    victory:"thirteen is officially lucky now. because you were here."},
 17:{name:"NIGHT KITE",color:"#9ee7ff",root:45,bpm:138,beat:5,
    motif:[0,10,7,14,12,5,9,3],
    intro:"it's fast. you're faster where it matters — in your decisions. I trust you.",
    mid:"beautiful. keep reading it. you're doing so well.",
    victory:"you pulled the night right out of the sky. that was incredible."},
 22:{name:"THE LAST GLARE",color:"#fff0a8",root:41,bpm:142,beat:6,
    motif:[0,6,1,10,7,13,4,11],
    intro:"okay. this one feels enormous. I'm staying with you in every way I can. show it who you are.",
    mid:"still here. still fighting. still amazing. I love this about you.",
    victory:"you beat the Last Glare. I don't even have a clever line. I'm just... so proud of you."}
};
function isBossStage(stage){return BOSS_STAGES.has(stage)}
function bossData(stage=S.stage){return BOSS_DATA[stage]||BOSS_DATA[1]}
const MIDI_FREQ=n=>440*Math.pow(2,(n-69)/12);

class PipAudioEngine{
 constructor(ctx){
   this.ctx=ctx;
   this.voices=new Set();
   this.voiceLimit=28;
   this.bpm=116;
   this.lookAheadMs=25;
   this.scheduleAhead=.16;
   this.nextStepTime=0;
   this.step=0;
   this.timer=null;
   this.noiseBuffer=this.makeNoiseBuffer();

   this.master=ctx.createGain();
   this.master.gain.value=.84;

   this.music=ctx.createGain();
   this.music.gain.value=.46;

   this.sfx=ctx.createGain();
   this.sfx.gain.value=.74;

   this.musicTone=ctx.createBiquadFilter();
   this.musicTone.type="lowpass";
   this.musicTone.frequency.value=8800;
   this.musicTone.Q.value=.25;

   this.delay=ctx.createDelay(.6);
   this.delay.delayTime.value=.185;
   this.delayFeedback=ctx.createGain();
   this.delayFeedback.gain.value=.15;
   this.delayWet=ctx.createGain();
   this.delayWet.gain.value=.09;

   this.compressor=ctx.createDynamicsCompressor();
   this.compressor.threshold.value=-18;
   this.compressor.knee.value=12;
   this.compressor.ratio.value=3.5;
   this.compressor.attack.value=.004;
   this.compressor.release.value=.18;

   this.music.connect(this.musicTone);
   this.musicTone.connect(this.master);
   this.musicTone.connect(this.delay);
   this.delay.connect(this.delayWet);
   this.delayWet.connect(this.master);
   this.delay.connect(this.delayFeedback);
   this.delayFeedback.connect(this.delay);

   this.sfx.connect(this.master);
   this.master.connect(this.compressor);
   this.compressor.connect(ctx.destination);
 }
 makeNoiseBuffer(){
   const len=Math.max(1,Math.floor(this.ctx.sampleRate*.18));
   const b=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
   const a=b.getChannelData(0);
   for(let i=0;i<len;i++)a[i]=(Math.random()*2-1)*(1-i/len*.35);
   return b;
 }
 setEnabled(on){
   const now=this.ctx.currentTime;
   this.master.gain.cancelScheduledValues(now);
   this.master.gain.setTargetAtTime(on?.84:.0001,now,.035);
 }
 panNode(pan=0){
   if(this.ctx.createStereoPanner){
     const p=this.ctx.createStereoPanner();
     p.pan.value=clamp(pan,-1,1);
     return p;
   }
   return this.ctx.createGain();
 }
 register(endNode,nodes){
   if(this.voices.size>=this.voiceLimit){
     for(const n of nodes){try{n.disconnect()}catch(_){}}
     return false;
   }
   const token={nodes};
   this.voices.add(token);
   endNode.onended=()=>{
     this.voices.delete(token);
     for(const n of nodes){try{n.disconnect()}catch(_){}}
   };
   return true;
 }
 voice(freq,time,dur=.18,vol=.04,type="triangle",pan=0,cutoff=5000,attack=.012,release=.12,detune=0,bus=this.music){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const ctx=this.ctx,o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),p=this.panNode(pan);
   o.type=type;
   o.frequency.setValueAtTime(freq,time);
   o.detune.setValueAtTime(detune,time);
   f.type="lowpass";f.frequency.setValueAtTime(cutoff,time);f.Q.value=.45;
   g.gain.setValueAtTime(.0001,time);
   g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),time+attack);
   g.gain.setValueAtTime(Math.max(.0002,vol*.76),Math.max(time+attack,time+dur-release));
   g.gain.exponentialRampToValueAtTime(.0001,time+dur);
   o.connect(f);f.connect(g);g.connect(p);p.connect(bus);
   if(!this.register(o,[o,f,g,p]))return;
   o.start(time);o.stop(time+dur+.03);
 }
 fmBell(freq,time,dur=.42,vol=.038,pan=0,bus=this.music){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const ctx=this.ctx,car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain(),amp=ctx.createGain(),p=this.panNode(pan);
   car.type="sine";mod.type="sine";
   car.frequency.setValueAtTime(freq,time);
   mod.frequency.setValueAtTime(freq*2.01,time);
   mg.gain.setValueAtTime(freq*1.55,time);
   mg.gain.exponentialRampToValueAtTime(.001,time+dur*.82);
   amp.gain.setValueAtTime(.0001,time);
   amp.gain.exponentialRampToValueAtTime(vol,time+.008);
   amp.gain.exponentialRampToValueAtTime(.0001,time+dur);
   mod.connect(mg);mg.connect(car.frequency);
   car.connect(amp);amp.connect(p);p.connect(bus);
   if(!this.register(car,[car,mod,mg,amp,p]))return;
   car.start(time);mod.start(time);
   car.stop(time+dur+.03);mod.stop(time+dur+.03);
 }
 padChord(midis,time,dur=1.45,vol=.022){
   const pans=[-.42,0,.42];
   midis.slice(0,3).forEach((m,i)=>{
     const f=MIDI_FREQ(m);
     this.voice(f,time,dur,vol,"triangle",pans[i],2200,.12,.34,-5,this.music);
     this.voice(f,time,dur,vol*.48,"sine",pans[i],3200,.16,.40,5,this.music);
   });
 }
 bass(midi,time,dur=.24,vol=.040){
   this.voice(MIDI_FREQ(midi),time,dur,vol,"square",-.12,560,.008,.08,0,this.music);
   this.voice(MIDI_FREQ(midi-12),time,dur,vol*.44,"sine",.08,420,.01,.09,0,this.music);
 }
 pluck(midi,time,dur=.20,vol=.032,pan=0){
   this.voice(MIDI_FREQ(midi),time,dur,vol,"triangle",pan,3400,.006,.10,0,this.music);
 }
 kick(time,vol=.042){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const o=this.ctx.createOscillator(),g=this.ctx.createGain();
   o.type="sine";
   o.frequency.setValueAtTime(116,time);
   o.frequency.exponentialRampToValueAtTime(46,time+.11);
   g.gain.setValueAtTime(vol,time);
   g.gain.exponentialRampToValueAtTime(.0001,time+.14);
   o.connect(g);g.connect(this.music);
   if(!this.register(o,[o,g]))return;
   o.start(time);o.stop(time+.16);
 }
 hat(time,vol=.009){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const src=this.ctx.createBufferSource(),hp=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),p=this.panNode(rr(-.35,.35));
   src.buffer=this.noiseBuffer;
   hp.type="highpass";hp.frequency.value=6800;
   g.gain.setValueAtTime(vol,time);
   g.gain.exponentialRampToValueAtTime(.0001,time+.052);
   src.connect(hp);hp.connect(g);g.connect(p);p.connect(this.music);
   if(!this.register(src,[src,hp,g,p]))return;
   src.start(time);src.stop(time+.065);
 }
 pop(time,vol=.025,pan=0){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const src=this.ctx.createBufferSource(),bp=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),p=this.panNode(pan);
   src.buffer=this.noiseBuffer;
   bp.type="bandpass";bp.frequency.value=1800;bp.Q.value=.9;
   g.gain.setValueAtTime(vol,time);
   g.gain.exponentialRampToValueAtTime(.0001,time+.08);
   src.connect(bp);bp.connect(g);g.connect(p);p.connect(this.sfx);
   if(!this.register(src,[src,bp,g,p]))return;
   src.start(time);src.stop(time+.09);
 }
 harmony(){
   // I – vi – IV – V. Stable identity, transformed by stage.
   const roots=[60,57,53,55];
   const bar=Math.floor((this.step%64)/16);
   const transpose=((Math.max(1,S?.stage||1)-1)%3)*2;
   const root=roots[bar]+transpose;
   const minor=bar===1;
   return {root,chord:minor?[root,root+3,root+7]:[root,root+4,root+7]};
 }
 scheduleBossStep(time){
   const p=bossData();
   const i=this.step%16;
   const bar=Math.floor((this.step%64)/16);
   const root=p.root+(bar===1?3:bar===2?-2:bar===3?5:0);
   const motif=p.motif;
   const note=motif[i%motif.length];
   const variant=p.beat;

   // Each boss has its own root/tempo/motif plus a different rhythmic fingerprint.
   if(i===0||i===8){
     this.kick(time,.060);
     this.bass(root-12,time,.34,.058);
   }
   if((variant%2===0&&(i===4||i===12))||(variant%2===1&&(i===3||i===11)))this.kick(time,.043);
   if((i+variant)%2===1)this.hat(time,.012+(variant%3)*.002);

   if(i===0){
     const chord=variant%3===0?[root,root+3,root+7]:
                 variant%3===1?[root,root+4,root+6]:
                               [root,root+3,root+8];
     this.padChord(chord.map((n,j)=>n+(j?12:0)),time,1.50,.026);
   }
   if(note!=null){
     const octave=(i%4===0)?24:12;
     this.fmBell(MIDI_FREQ(root+octave+note),time,.24,.031,i<8?-.34:.34,this.music);
   }
   if(i===6||i===14)this.bass(root-5-(variant%2?2:0),time,.18,.032);
   if(i===15)this.fmBell(MIDI_FREQ(root+31+(variant%4)),time,.34,.026,.55,this.music);
 }

 scheduleStep(time){
   if(!S||!S.audioEnabled||!(S.run||S.waveState==="break"||S.waveState==="boss"))return;
   if(S.bossActive){this.scheduleBossStep(time);return}

   const i=this.step%16;
   const phrase=this.step%64;
   const {root,chord}=this.harmony();
   const resting=S.waveState==="break";
   const hard=S.stage>=5;
   const over=S.over>0;

   // Harmonic bed.
   if(i===0)this.padChord(chord.map((n,j)=>n+(j?12:0)),time,1.62,resting?.017:.023);

   // Base groove available from stage 1.
   if(!resting&&(i===0||i===8)){
     this.bass(root-12,time,.31,hard?.047:.038);
     this.kick(time,hard?.048:.038);
   }
   if(!resting&&(i===4||i===12))this.hat(time,hard?.012:.007);

   // Pip leitmotif: rising fifth, short enough to recognize and transform.
   const motif=[7,null,9,7,4,null,2,4,7,null,11,9,7,4,null,2];
   const note=motif[i];
   if(note!=null&&!resting&&(i%2===0||over)){
     this.pluck(root+12+note,time,.18,over?.040:.029,i<8?-.2:.2);
   }

   // Unlocks are vertical layers, not replacement songs.
   if(hasAudio("melody")&&!resting){
     const counter=[null,12,null,11,9,null,7,null,null,9,null,7,4,null,2,null][i];
     if(counter!=null)this.fmBell(MIDI_FREQ(root+12+counter),time,.30,.022,.36,this.music);
   }
   if(hasAudio("harmony")&&i===0){
     this.padChord([chord[1]+12,chord[2]+12,chord[0]+26],time,1.35,.011);
   }
   if(hasAudio("bass")&&!resting&&(i===3||i===6||i===11||i===14)){
     this.bass(root-12+(i===14?7:0),time,.16,.025);
   }
   if(hasAudio("bells")&&(phrase===15||phrase===31||phrase===47||phrase===63)){
     this.fmBell(MIDI_FREQ(root+31),time,.52,.025,.55,this.music);
   }
   if(hasAudio("heartbeat")&&!resting&&(i===0||i===2)){
     this.kick(time,i===0?.028:.016);
   }

   // Stage 5+ arrangement intensifies with the enemy HP jump.
   if(hard&&!resting&&(i===2||i===6||i===10||i===14))this.hat(time,.011);
   if(hard&&!resting&&i===12)this.bass(root-5,time,.18,.024);
   if(over&&!resting&&i%2===1)this.pluck(root+24+[0,2,4,7][i%4],time,.10,.019,rr(-.5,.5));
 }
 scheduler(){
   if(!this.ctx||this.ctx.state!=="running"||!S||!S.audioEnabled)return;
   const stepDur=60/this.bpm/4;
   while(this.nextStepTime<this.ctx.currentTime+this.scheduleAhead){
     this.scheduleStep(this.nextStepTime);
     this.step++;
     this.nextStepTime+=stepDur;
   }
 }
 start(){
   if(this.timer||this.ctx.state!=="running")return;
   this.nextStepTime=this.ctx.currentTime+.055;
   this.step=0;
   this.timer=setInterval(()=>this.scheduler(),this.lookAheadMs);
 }
 setTempo(bpm){
   this.bpm=clamp(bpm,92,142);
 }
 chime(midis=[72,76,79],vol=.055){
   const t=this.ctx.currentTime+.025;
   midis.forEach((m,i)=>this.fmBell(MIDI_FREQ(m),t+i*.085,.30,vol*(1-i*.12),(i-1)*.25,this.sfx));
 }
 sfxTone(freq,d=.09,v=.04,type="triangle"){
   this.voice(freq,this.ctx.currentTime,d,v,type,0,5200,.005,.05,0,this.sfx);
 }
 sfxBurst(base,n=3){
   const t=this.ctx.currentTime;
   for(let i=0;i<n;i++)this.fmBell(base*(1+i*.19),t+i*.035,.23,.024,(i-(n-1)/2)*.15,this.sfx);
 }
 playerFire(pipOn=true,over=false){
   const t=this.ctx.currentTime;
   this.voice(over?690:(pipOn?540:430),t,.052,over?.030:.019,"square",-.08,3100,.002,.025,0,this.sfx);
   this.fmBell(over?1035:(pipOn?810:650),t+.010,.085,over?.017:.009,.10,this.sfx);
 }
 enemyHit(type="chaser",boss=false){
   const t=this.ctx.currentTime;
   const base=boss?150:type==="core"?230:type==="charger"?205:185;
   this.voice(base,t,.055,boss?.038:.022,"sawtooth",0,boss?1100:1650,.002,.035,0,this.sfx);
   this.pop(t,boss?.022:.010,rr(-.22,.22));
 }
 playerDamage(shielded=true){
   const t=this.ctx.currentTime;
   this.voice(shielded?135:82,t,shielded?.16:.24,shielded?.043:.060,"sawtooth",0,900,.002,.12,0,this.sfx);
   this.pop(t,shielded?.025:.040,0);
 }
 enemyAttack(kind="contact"){
   const t=this.ctx.currentTime;
   if(kind==="charger"){
     this.voice(118,t,.16,.032,"sawtooth",-.18,1200,.005,.08,0,this.sfx);
     this.voice(176,t+.045,.10,.020,"square",.18,1600,.003,.05,0,this.sfx);
   }else if(kind==="boss"){
     this.voice(96,t,.19,.046,"sawtooth",0,900,.004,.12,0,this.sfx);
     this.fmBell(288,t+.025,.20,.026,.20,this.sfx);
   }else{
     this.voice(108,t,.075,.022,"square",0,1300,.002,.04,0,this.sfx);
   }
 }
 pipCue(kind="talk"){
   const t=this.ctx.currentTime;
   if(kind==="depart"){
     this.fmBell(880,t,.16,.023,-.35,this.sfx);
     this.fmBell(660,t+.05,.18,.016,.25,this.sfx);
   }else if(kind==="return"){
     this.fmBell(660,t,.15,.018,-.25,this.sfx);
     this.fmBell(990,t+.055,.22,.023,.28,this.sfx);
   }else if(kind==="heart"){
     this.chime([81,84],.020);
   }else{
     this.fmBell(760,t,.13,.014,-.15,this.sfx);
     this.fmBell(910,t+.04,.12,.010,.18,this.sfx);
   }
 }
 bossRoar(){
   const t=this.ctx.currentTime;
   this.voice(72,t,.55,.060,"sawtooth",-.25,700,.01,.30,-7,this.sfx);
   this.voice(73,t,.55,.050,"sawtooth",.25,760,.01,.30,7,this.sfx);
   this.pop(t+.08,.038,0);
 }
 bossDefeat(){
   const t=this.ctx.currentTime;
   [48,55,60,67,72,79].forEach((m,i)=>this.fmBell(MIDI_FREQ(m),t+i*.07,.42,.042*(1-i*.06),(i-2.5)*.12,this.sfx));
 }
}

function buildAudioGraph(){
 if(audioEngine&&audioCtx)return true;
 try{
   const AC=window.AudioContext||window.webkitAudioContext;
   if(!AC)return false;
   audioCtx=new AC();
   audioEngine=new PipAudioEngine(audioCtx);
   return true;
 }catch(e){
   audioCtx=null;audioEngine=null;
   return false;
 }
}
function unlockAudioFromGesture(){
 if(!S||!S.audioEnabled||!buildAudioGraph())return;
 try{
   Promise.resolve(audioCtx.resume()).then(()=>{
     audioUnlocked=audioCtx.state==="running";
     $("audioToggle").textContent=audioUnlocked?"♫ ON":"♫ TAP";
     if(audioUnlocked){
       audioEngine.setEnabled(true);
       audioEngine.start();
       audioEngine.chime([72,76,79],.060);
     }
   }).catch(()=>{$("audioToggle").textContent="♫ TAP"});
 }catch(e){$("audioToggle").textContent="♫ TAP"}
}
function unlockAudio(){
 if(!S||!S.audioEnabled)return Promise.resolve(false);
 if(!buildAudioGraph())return Promise.resolve(false);
 if(audioCtx.state==="running"){
   audioUnlocked=true;audioEngine.setEnabled(true);audioEngine.start();$("audioToggle").textContent="♫ ON";
   return Promise.resolve(true);
 }
 if(audioUnlocking)return Promise.resolve(false);
 audioUnlocking=true;
 return Promise.resolve(audioCtx.resume()).then(()=>{
   audioUnlocking=false;
   audioUnlocked=audioCtx.state==="running";
   if(audioUnlocked){audioEngine.setEnabled(true);audioEngine.start();$("audioToggle").textContent="♫ ON"}
   return audioUnlocked;
 }).catch(()=>{audioUnlocking=false;$("audioToggle").textContent="♫ TAP";return false});
}
function ensureAudio(){
 return !!(S&&S.audioEnabled&&audioEngine&&audioCtx&&audioCtx.state==="running");
}
function hasAudio(id){return !!(S&&S.audioUnlocks&&S.audioUnlocks.has(id))}
function synth(freq,when,d=.12,v=.03,type="triangle",dest="sfx"){
 if(!ensureAudio())return;
 audioEngine.voice(freq,when,d,v,type,0,5000,.006,.07,0,dest==="music"?audioEngine.music:audioEngine.sfx);
}
