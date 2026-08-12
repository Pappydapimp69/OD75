"use strict";
const C=document.getElementById("c"),X=C.getContext("2d"),$=id=>document.getElementById(id);
const joyViz=document.getElementById("joyViz"),joyKnob=joyViz.querySelector("i");
let W=900,H=600,DPR=Math.min(2,window.devicePixelRatio||1);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hyp=Math.hypot;
let keys=new Set(),joy={active:false,id:null,originX:0,originY:0,dx:0,dy:0},gamepad={dx:0,dy:0,dashHeld:false,overHeld:false,index:null},last=performance.now(),
audioCtx=null,audioEngine=null,audioUnlocked=false,audioUnlocking=false,seed=0xA11CE;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function rr(a,b){return a+rnd()*(b-a)}
const PIP_SAVE_KEY="overdrive75_pip_v2";
const STAR_ECHO_KEY="overdrive75_star_echo_v1";
function loadStarEcho(){try{return Math.max(0,Math.floor(Number(localStorage.getItem(STAR_ECHO_KEY)||0)||0))}catch(_){return 0}}
function clearStarEcho(){try{localStorage.removeItem(STAR_ECHO_KEY)}catch(_){}}
function bankStarEcho(){
 if(!S)return 0;
 const echo=Math.floor((S.starsTotal||0)*.20);
 try{localStorage.setItem(STAR_ECHO_KEY,String(echo))}catch(_){}
 return echo;
}
const OVER_ORDER=["beam","storm","guardian","nova","gravity","pip"];
const OVERDRIVE_INFO={
 beam:{icon:"━",name:"Beam",desc:"Rapid piercing starfire. Levels add damage, duration and penetration.",unlock:0},
 storm:{icon:"ϟ",name:"Thunderstorm",desc:"Lightning rains across the viewport and chains through nearby enemies.",unlock:2},
 guardian:{icon:"◇",name:"Guardian",desc:"Absorbs hits, restores shields and blasts attackers away.",unlock:3},
 nova:{icon:"◎",name:"Nova",desc:"Repeated expanding shockwaves punish anything surrounding you.",unlock:4},
 gravity:{icon:"●",name:"Gravity Well",desc:"Pulls enemies into a damaging singularity near your current target.",unlock:5},
 pip:{icon:"✦",name:"Pip Ascendant",desc:"Pip becomes the super. Loving, Compassionate and Supportive levels reshape it.",unlock:6}
};
const BOSS_STAR_THRESHOLDS=[4,11,20,32,47,65];
function bossThresholdFor(index){
 if(index<BOSS_STAR_THRESHOLDS.length)return BOSS_STAR_THRESHOLDS[index];
 const extra=index-BOSS_STAR_THRESHOLDS.length+1;
 return 65+extra*21+5*extra*(extra-1)/2;
}
function overLevel(id=S.overType){return Math.max(0,S.overLevels?.[id]||0)}
function overUpgradeCost(id){const lv=overLevel(id);return lv>=5?Infinity:2+lv}

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

let S,P,CAM,enemies,particles,rings,shards,texts,shots,enemyShots,wishes,heartBits,overLines,shake=0,flash=0;
const COLORS={chaser:"#ff6e8b",charger:"#ffd36f",core:"#b388ff",boss:"#ff7dd8",player:"#7ed8ff",good:"#7be0ae",gold:"#ffd36f",hot:"#ff6e8b",violet:"#b388ff"};

function reset(){
 seed=0xA11CE;
 const pip=loadPip();
 const starEcho=loadStarEcho();
 S={run:false,end:false,t:0,total:75,score:0,combo:1,comboClock:0,kills:0,bestCombo:1,heat:0,over:0,
    overType:"beam",overUnlocked:new Set(["beam"]),overLevels:{beam:1},overPulse:0,overGuardHits:0,overTarget:null,overFxClock:0,ascendantWishMade:false,
    starPoints:starEcho,starEchoStart:starEcho,starsTotal:0,bossCount:0,bossStarIndex:0,nextBossStars:bossThresholdFor(0),
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
    bossActive:false,bossDefeated:false,bossQueued:false,bossName:"",bossMaxHp:0,bossMidPraise:false,bossStartedAt:0,bossKey:1,
    distanceTravelled:0,nextDistancePraise:420,noHitClock:0,nextNoHitPraise:16,stagePraiseMark:30,
    pipPopupQueue:[],pipPopupBusy:false};
 P={x:0,y:0,r:10,vx:0,vy:0,faceX:1,faceY:0,trail:[],pipAngle:0,pipX:24,pipY:0};
 CAM={x:0,y:0};
 enemies=[];particles=[];rings=[];shards=[];texts=[];shots=[];enemyShots=[];wishes=[];heartBits=[];overLines=[];shake=0;flash=0;
 applyPipPower();
 $("start").classList.remove("hidden");$("end").classList.add("hidden");$("stageUp").classList.add("hidden");if($("overdriveStep"))$("overdriveStep").classList.add("stagehidden");
 $("audioToggle").textContent=audioUnlocked?"♫ ON":"♫ TAP";
 $("pipMood").textContent=S.pipLevel>=4?"✦ Pip: you're back. I missed doing this with you.":"✦ Pip: I already know you're going to be great";
 updateUI();
}
const BOSS_ORDER=[1,5,7,11,13,17,22];
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
function currentBossKey(){return BOSS_ORDER[(S?.bossCount||0)%BOSS_ORDER.length]}
function isBossStage(){return !!(S&&S.bossQueued)}
function bossData(key=null){
 const k=(key!=null&&BOSS_DATA[key])?key:currentBossKey();
 const base=BOSS_DATA[k]||BOSS_DATA[1];
 return {...base,key:k};
}
const MIDI_FREQ=n=>440*Math.pow(2,(n-69)/12);
