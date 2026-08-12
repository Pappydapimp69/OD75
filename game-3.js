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
function startBossBattle(){
 const p=bossData();
 S.bossActive=true;S.bossQueued=false;S.bossDefeated=false;S.bossMidPraise=false;
 S.bossName=p.name;S.waveState="boss";S.spawn=999;shots=[];enemyShots=[];
 S.bossStartedAt=S.stageTime;
 resetGuardianCharges();
 const hp=Math.round(46+S.stage*8+Math.max(0,S.stage-1)*1.5);
 S.bossMaxHp=hp;
 const a=rr(0,Math.PI*2),dist=Math.max(210,Math.min(W,H)*.38);
 enemies.push({
   type:"boss",bossStage:S.stage,x:P.x+Math.cos(a)*dist,y:P.y+Math.sin(a)*dist,
   r:30,hp,maxHp:hp,dead:false,age:0,flash:0,
   attackClock:1.05,volleyCount:0,orbitAngle:a
 });
 announce("BOSS · "+p.name,1200);
 showPipMessage(p.intro,true);
 sfxBossRoar();
 if(audioEngine){audioEngine.setTempo(p.bpm);audioEngine.step=0;audioEngine.nextStepTime=audioCtx?audioCtx.currentTime+.05:0}
}
function killBoss(e){
 if(e.dead)return;
 e.dead=true;S.bossActive=false;S.bossDefeated=true;S.stageEnding=true;S.bossRewardPending=true;
 S.score+=5000+S.stage*450;S.waveKills++;
 gainPipXP(90+S.stage*8,"boss");
 for(let i=0;i<14+Math.min(10,S.stage);i++){
   heartBits.push({x:e.x+rr(-24,24),y:e.y+rr(-24,24),vx:rr(-90,90),vy:rr(-90,90),r:7,life:14,bob:rr(0,6.28),dead:false});
 }
 particle(e.x,e.y,bossData().color,52,270);ring(e.x,e.y,bossData().color,210);shake=22;flash=.9;
 sfxBossDefeat();
 praise(bossData().victory,"big",true);
 announce("BOSS CLEAR!",1100);
 enemyShots=[];
 enemies=enemies.filter(o=>o!==e&&!o.dead);
 S.waveState="break";S.waveBreak=4.8;
 if(audioEngine){audioEngine.setTempo(S.stage>=5?124:116);audioEngine.step=0}
}
function startWave(n){
 S.wave=n;
 S.stageWaveCount++;
 S.waveState="active";
 S.waveKills=0;
 S.waveGoal=waveGoalFor(n);
 S.waveStartedAt=S.t;
 S.waveElapsed=0;
 S.spawn=.45;
 resetGuardianCharges();
 announce("WAVE "+S.stageWaveCount,700);
 if(S.stageWaveCount===1&&S.stage===1)showPipMessage("okay superstar, let's make this stage ours");
 else if(S.stageWaveCount===1&&S.stage===5)showPipMessage("stage five feels different. stay close to me — they're tougher now.",true);
 else if(S.stageWaveCount===1)showPipMessage(`stage ${S.stage}. still you and me. my favorite team.`);
 else if(S.stageWaveCount===2)showPipMessage("you already look more comfortable out here");
 else if(S.stageWaveCount===3&&isBossStage(S.stage))showPipMessage("third wave. something big is behind it. whatever happens, I'm with you.");
 else if(S.stageWaveCount===3)showPipMessage("I love watching you adapt");
 else showPipMessage(`another wave. I still believe in you completely.`);
}
function beginWaveBreak(){
 const stageEnd=!!S.stageEnding;
 S.waveState="break";
 S.waveBreak=stageEnd?10:4.2;
 S.spawn=999;
 S.comboClock=Math.max(S.comboClock,1.2);
 announce(stageEnd?"STAGE CLEAR!":"CLEAR!",700);
 const praisePool=[
   "that wave was beautiful. seriously.",
   "you did that. all of it. I'm so proud of you.",
   "look at you — stronger, calmer, smarter.",
   "I knew you could clear it. I just love being right about you.",
   "come here, superstar. you earned this little moment.",
   "I love how you keep getting better right in front of me.",
   "you make me feel lucky to be your Pip.",
   "I hope you know how good you are at this.",
   "that was hard, and you made it ours anyway.",
   "I would pick you as my player every single time."
 ];
 const msg=praisePool[Math.floor(rnd()*praisePool.length)];
 praise(msg,"big",true);
 if(S.shields<S.maxShields){
   S.shields++;
   S.shieldRegenClock=0;
   popup(P.x,P.y,"REST SHIELD +1",COLORS.player,true);
 }
 gainPipXP(12+S.wave*3,"wave clear");
}
function difficulty(){
 const w=Math.max(1,S.wave);
 const stageSpike=S.stage>=5?.16+Math.min(.34,(S.stage-5)*.045):0;
 return 0.88+Math.min(1.1,(w-1)*.12)+stageSpike;
}
function enemyCap(){
 const portrait=H>W;
 const base=portrait?8:11;
 return Math.min(portrait?15:18,base+Math.floor((S.wave-1)*1.5));
}
function spawnEnemy(type){
 let side=Math.floor(rr(0,4)),m=52,x,y;
 const left=CAM.x-W/2,right=CAM.x+W/2,top=CAM.y-H/2,bottom=CAM.y+H/2;
 if(side===0){x=rr(left,right);y=top-m}
 else if(side===1){x=right+m;y=rr(top,bottom)}
 else if(side===2){x=rr(left,right);y=bottom+m}
 else{x=left-m;y=rr(top,bottom)}
 const hpTier=S.stage>=5?Math.min(5,1+Math.floor((S.stage-5)/2)):0;
 if(type==="chaser")enemies.push({type,x,y,r:12,hp:2+hpTier,speed:rr(58,82)+(S.stage>=5?5:0),dead:false,age:0,flash:0});
 if(type==="charger")enemies.push({type,x,y,r:14,hp:3+hpTier,speed:0,dead:false,age:0,state:"aim",aim:rr(.65,1.0),vx:0,vy:0,flash:0});
 if(type==="core")enemies.push({type,x,y,r:15,hp:1+Math.floor(hpTier/2),speed:rr(30,46)+(S.stage>=5?3:0),dead:false,age:0,pulse:rr(0,10),flash:0});
}
function chooseSpawn(){
 const r=rnd(),w=S.wave;
 if(w===1)return r<.84?"chaser":"core";
 if(w===2)return r<.66?"chaser":r<.88?"core":"charger";
 if(w===3)return r<.56?"chaser":r<.78?"core":"charger";
 return r<.50?"chaser":r<.72?"core":"charger";
}
function spawnLogic(dt){
 if(S.waveState!=="active"||S.bossActive||S.waveKills>=S.waveGoal)return;
 S.spawn-=dt;
 if(S.spawn>0)return;
 const alive=enemies.filter(e=>!e.dead).length;
 if(alive>=enemyCap()){S.spawn=.18;return}
 const d=difficulty();
 const gap=clamp(.68/d,.24,.74);
 S.spawn=gap*rr(.82,1.12);
 spawnEnemy(chooseSpawn());
 if(S.wave>=3&&rnd()<.075*d&&enemies.filter(e=>!e.dead).length<enemyCap())spawnEnemy(rnd()<.64?"chaser":"charger");
}
function pipWithPlayer(){
 return S.pipState==="orbit";
}
function pipOrbitPoint(){
 const r=24+Math.min(6,(S.pipLevel-1)*.8);
 return {x:P.x+Math.cos(P.pipAngle)*r,y:P.y+Math.sin(P.pipAngle)*r};
}
function findPipHeartTarget(){
 if(S.pipState!=="orbit")return null;
 const o=pipOrbitPoint();
 let best=null,bestD=S.pipDetectRange;
 for(const h of heartBits){
   if(h.dead||h.life<=0)continue;
   // Detection is deliberately local to the player/Pip area.
   const d=hyp(P.x-h.x,P.y-h.y);
   if(d<bestD){bestD=d;best=h}
 }
 return best;
}
function updatePipCompanion(dt){
 const orbit=pipOrbitPoint();
 if(S.pipState==="orbit"){
   P.pipX+=(orbit.x-P.pipX)*Math.min(1,dt*12);
   P.pipY+=(orbit.y-P.pipY)*Math.min(1,dt*12);
   const target=findPipHeartTarget();
   if(target){
     S.pipTarget=target;
     S.pipState="collect";
     sfxPipCue("depart");
     showPipMessage("heart spotted — I'll grab it! stay safe for me.");
   }
   return;
 }
 if(S.pipState==="collect"){
   const h=S.pipTarget;
   if(!h||h.dead||h.life<=0){S.pipTarget=null;S.pipState="return";return}
   const dx=h.x-P.pipX,dy=h.y-P.pipY,d=hyp(dx,dy)||1;
   P.pipX+=dx/d*S.pipMoveSpeed*dt;
   P.pipY+=dy/d*S.pipMoveSpeed*dt;
   if(d<12){
     collectHeartBit(h);
     if(S.pipLove>=2)S.lovePulsePending++;
     sfxPipCue("heart");
     S.pipTarget=null;
     S.pipState="return";
   }
   return;
 }
 // Return directly to the player before detecting another Heart Bit.
 const dx=orbit.x-P.pipX,dy=orbit.y-P.pipY,d=hyp(dx,dy)||1;
 P.pipX+=dx/d*S.pipMoveSpeed*dt;
 P.pipY+=dy/d*S.pipMoveSpeed*dt;
 if(d<14){
   P.pipX=orbit.x;P.pipY=orbit.y;
   S.pipState="orbit";
   sfxPipCue("return");

   if(S.pipCompassion>=2){
     S.invuln=Math.max(S.invuln,.55+Math.min(.55,(S.pipCompassion-2)*.12));
     ring(P.x,P.y,"#7ed8ff",58);
   }
   if(S.lovePulsePending>0){
     lovePulse(P.pipX,P.pipY);
     S.lovePulsePending=0;
   }
   warmReturnVolley();

   const relayLv=bossPowerLevel("relay");
   if(relayLv>0){
     S.pipRelayBuff=4+relayLv;
     popup(P.x,P.y-18,"HEART RELAY","#ffd36f",true,1.0);
     ring(P.x,P.y,"#ffd36f",72);
   }
   showPipMessage("I'm back. bonuses online ✦");
 }
}
function updateCamera(){
 const deadX=W*.15,deadY=H*.15;
 let screenX=P.x-CAM.x+W/2;
 let screenY=P.y-CAM.y+H/2;
 const minX=W/2-deadX,maxX=W/2+deadX;
 const minY=H/2-deadY,maxY=H/2+deadY;
 if(screenX<minX)CAM.x=P.x-(minX-W/2);
 else if(screenX>maxX)CAM.x=P.x-(maxX-W/2);
 if(screenY<minY)CAM.y=P.y-(minY-H/2);
 else if(screenY>maxY)CAM.y=P.y-(maxY-H/2);
}
function worldToScreenX(x){return x-CAM.x+W/2}
function worldToScreenY(y){return y-CAM.y+H/2}
function worldVisible(x,y,pad=100){
 const sx=worldToScreenX(x),sy=worldToScreenY(y);
 return sx>-pad&&sx<W+pad&&sy>-pad&&sy<H+pad;
}
function nearestEnemyFrom(x,y,range=520){
 let best=null,bestD=range;
 for(const e of enemies){
   if(e.dead)continue;
   const d=hyp(x-e.x,y-e.y);
   if(d<bestD){bestD=d;best=e}
 }
 return best;
}
function pushPipShot(x,y,target,power=.8,spread=0){
 if(!target||target.dead)return;
 let a=Math.atan2(target.y-y,target.x-x)+spread;
 shots.push({
   x,y,vx:Math.cos(a)*535,vy:Math.sin(a)*535,r:5.2,life:.8,
   power,source:"pip"
 });
 particle(x,y,"#ffd36f",3,42);
 if(ensureAudio())audioEngine.fmBell(850+rr(-45,45),audioCtx.currentTime,.09,.009,rr(-.2,.2),audioEngine.sfx);
}
function lovePulse(x,y){
 if(S.pipLove<2)return;
 const radius=80+Math.min(55,(S.pipLove-2)*10);
 const damage=.65+S.pipLove*.22;
 ring(x,y,"#ff9fba",radius);
 particle(x,y,"#ff9fba",16,115);
 for(const e of enemies){
   if(e.dead)continue;
   if(hyp(e.x-x,e.y-y)<=radius)hitEnemy(e,damage,"pip");
 }
}
function warmReturnVolley(){
 if(S.pipLove<3||!pipWithPlayer())return;
 const target=nearestEnemyFrom(P.pipX,P.pipY,470);
 if(!target)return;
 const bonus=1+Math.max(0,S.pipLove-3)*.12;
 [-.13,0,.13].forEach(a=>pushPipShot(P.pipX,P.pipY,target,.62*bonus,a));
}
function updatePipCombat(dt){
 S.pipShotCd=Math.max(0,S.pipShotCd-dt);
 S.pipConstellationCd=Math.max(0,S.pipConstellationCd-dt);
 S.pipRelayBuff=Math.max(0,S.pipRelayBuff-dt);
 S.supportRush=Math.max(0,S.supportRush-dt);
 if(!pipWithPlayer()||!(S.waveState==="active"||S.waveState==="boss"))return;

 const starLv=bossPowerLevel("starshot");
 if(starLv>0&&S.pipShotCd<=0){
   const target=nearestEnemyFrom(P.pipX,P.pipY,510);
   if(target){
     pushPipShot(P.pipX,P.pipY,target,.62+starLv*.24);
     S.pipShotCd=Math.max(.62,1.45-(starLv-1)*.12);
   }
 }

 const constLv=bossPowerLevel("constellation");
 if(constLv>0&&S.pipConstellationCd<=0){
   const count=6+Math.min(6,(constLv-1)*2);
   for(let i=0;i<count;i++){
     const a=i/count*Math.PI*2+P.pipAngle*.4;
     shots.push({
       x:P.pipX,y:P.pipY,vx:Math.cos(a)*430,vy:Math.sin(a)*430,
       r:4.5,life:.72,power:.46+constLv*.13,source:"pip"
     });
   }
   ring(P.pipX,P.pipY,"#ffd36f",72);
   S.pipConstellationCd=Math.max(5,10-constLv);
   sfxPipCue("heart");
 }
}
function resetGuardianCharges(){
 const lv=bossPowerLevel("guardian");
 S.guardianCharges=lv>0?1+Math.floor((lv-1)/2):0;
}
function getAutoTarget(){
 const baseRange=Math.min(270,Math.max(185,Math.min(W,H)*.55));
 let best=null,bestD=pipWithPlayer()?S.attackRange:baseRange;
 for(const e of enemies){
   if(e.dead)continue;
   const d=hyp(P.x-e.x,P.y-e.y);
   if(d<bestD){bestD=d;best=e}
 }
 return best;
}
function attack(){
 if(!S.run||S.end)return;
 if(S.over<=0&&S.attackCd>0)return;
 const target=getAutoTarget();
 if(!target)return;
 let dx=target.x-P.x,dy=target.y-P.y,l=hyp(dx,dy)||1;dx/=l;dy/=l;
 P.faceX=dx;P.faceY=dy;
 const pipOn=pipWithPlayer();

 const supportTwin=pipOn&&S.pipSupport>=3?Math.min(.34,.10+(S.pipSupport-3)*.04):0;
 const extraTwin=pipOn&&S.over<=0&&rnd()<Math.max(S.pipLevel>=5?.18:0,supportTwin);
 const spread=(pipOn&&S.over>0)?[-.16,0,.16]:(extraTwin?[-.07,.07]:[0]);
 const relayLv=bossPowerLevel("relay");
 const relayPower=S.pipRelayBuff>0?1.15+(relayLv-1)*.04:1;

 for(const off of spread){
   const a=Math.atan2(dy,dx)+off,vx=Math.cos(a)*570,vy=Math.sin(a)*570;
   shots.push({
     x:P.x+Math.cos(a)*18,y:P.y+Math.sin(a)*18,vx,vy,
     r:(pipOn?(S.over>0?S.projectileSize+1:S.projectileSize):6),
     life:.55,
     power:(pipOn?(S.over>0?1.8:1)*S.weaponPower*((S.shields<=1)?S.supportPower:1)*relayPower:1),
     source:"player"
   });
 }

 if(pipOn){
   S.pipVolleyCount++;
   const echoLv=bossPowerLevel("echo");
   const every=Math.max(2,5-echoLv);
   if(echoLv>0&&S.pipVolleyCount%every===0){
     for(const off of spread)pushPipShot(P.pipX,P.pipY,target,.72+echoLv*.16,off);
     ring(P.pipX,P.pipY,"#d9c8ff",42);
   }
 }

 if(S.over<=0){
   let cd=pipOn?S.attackMax:.33;
   if(pipOn&&S.supportRush>0)cd*=.76;
   if(pipOn&&S.pipRelayBuff>0)cd*=Math.max(.66,.82-bossPowerLevel("relay")*.025);
   S.attackCd=cd;
 }
 particle(P.x+dx*16,P.y+dy*16,COLORS.violet,4,55);
 sfxPlayerFire(pipOn,S.over>0);
}
function dashVector(dx,dy){
 if(!S.run||S.end)return false;
 if(S.over<=0&&S.dashCd>0)return false;
 let l=hyp(dx,dy);if(l<.2){dx=P.faceX;dy=P.faceY;l=hyp(dx,dy)||1}
 dx/=l;dy/=l;P.faceX=dx;P.faceY=dy;P.vx=dx*640;P.vy=dy*640;S.dashTime=.16;S.invuln=.22;S.dashKillsThisDash=0;
 if(S.over<=0)S.dashCd=S.dashMax;
 if(pipWithPlayer()&&S.pipSupport>=2){
   S.supportRush=2+Math.min(1.5,(S.pipSupport-2)*.18);
   popup(P.x,P.y-16,"PIP RUSH","#d9c8ff",false,.65);
 }
 particle(P.x,P.y,COLORS.player,9,90);sfxDash();return true;
}
function dash(){
 let dx=(joy.active?joy.dx:0)+gamepad.dx,dy=(joy.active?joy.dy:0)+gamepad.dy;
 if(keys.has("ArrowLeft")||keys.has("a"))dx--;if(keys.has("ArrowRight")||keys.has("d"))dx++;
 if(keys.has("ArrowUp")||keys.has("w"))dy--;if(keys.has("ArrowDown")||keys.has("s"))dy++;
 return dashVector(dx,dy);
}
function hitEnemy(e,power=1,source="player"){
 if(e.dead)return;
 const markLv=bossPowerLevel("heartmark");
 if((e.markTime||0)>0&&markLv>0)power*=1.25+(markLv-1)*.10;

 if(source==="player"&&markLv>0){
   S.pipHitCount++;
   const threshold=Math.max(3,6-markLv);
   if(S.pipHitCount%threshold===0){
     e.markTime=5.5;
     ring(e.x,e.y,"#ff9fba",e.r+18);
     popup(e.x,e.y,"♥ MARK","#ffb3c7",false,.75);
     sfxPipCue("heart");
   }
 }

 e.hp-=power;e.flash=.11;
 particle(e.x,e.y,"#ffffff",4,70);
 sfxHitEnemy(e);
 if(e.type==="boss"&&!S.bossMidPraise&&e.hp<=e.maxHp*.5){
   S.bossMidPraise=true;
   praise(bossData().mid,"big",true);
 }
 if(e.hp<=0)kill(e,false);
}
function dropHeartBits(e){
 const count=e.type==="charger"?2:e.type==="core"?2:1;
 for(let i=0;i<count;i++){
   heartBits.push({
     x:e.x+rr(-11,11),y:e.y+rr(-11,11),
     vx:rr(-52,52),vy:rr(-52,52),
     r:7,life:11,bob:rr(0,6.28),dead:false
   });
 }
}
const HEART_TOTAL_KEY="overdrive75_player_heart_total_v1";
function loadHeartTotal(){try{const n=Number(localStorage.getItem(HEART_TOTAL_KEY)||0);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0}catch(_){return 0}}
function saveHeartTotal(){try{localStorage.setItem(HEART_TOTAL_KEY,String(Math.max(0,Math.floor(S.heartTotal||0))))}catch(_){}}
function collectHeartBit(h){
 if(h.dead)return;
 h.dead=true;S.heartCurrency++;S.stageCurrency++;S.heartTotal=(S.heartTotal||0)+1;saveHeartTotal();
 popup(h.x,h.y,"♥ +1","#ffb3c7",false,1.0);
 tone(730+Math.min(300,S.heartCurrency*5),.045,.010,"sine");
 if(S.stageCurrency===3)praise("three little hearts already. you're taking such good care of us.","nice");
 if(S.stageCurrency===5)praise("yes — the little hearts! I love doing this with you ✦","nice");
 if(S.stageCurrency===8)praise("eight hearts. you keep showing up for me and I notice.","nice");
 if(S.stageCurrency===12)praise("you earned enough to help me grow. you did that for me. I won't forget it.","big",true);
}
function kill(e,chain=false){
 if(e.dead)return;
 if(e.type==="boss"){killBoss(e);return}
 e.dead=true;S.kills++;S.waveKills++;dropHeartBits(e);
 const xpBase=e.type==="core"?18:e.type==="charger"?14:9;
 gainPipXP(xpBase+(chain?3:0)+(S.dashTime>0?2:0),e.type);
 if(S.dashTime>0&&!chain){S.dashKills++;S.dashKillsThisDash++;S.stylePoints+=.35}
 const overMult=S.over>0?3:1;
 let base=e.type==="core"?180:e.type==="charger"?140:100;
 S.combo=Math.min(9.9,S.combo+.18+(chain?.08:0));S.comboClock=1.35;S.bestCombo=Math.max(S.bestCombo,S.combo);
 let pts=Math.round(base*S.combo*overMult);S.score+=pts;
 const heatGain=(S.combo>=2?((e.type==="core"?7:2)+(chain?1:0)+(S.dashTime>0?1:0)):0)*(S.overdrives>0?.65:1);
 S.heat=clamp(S.heat+heatGain,0,100);
 popup(e.x,e.y,"+"+pts,e.type==="core"?COLORS.violet:"#fff",S.combo>4);
 particle(e.x,e.y,COLORS[e.type]||"#fff",e.type==="core"?18:10,e.type==="core"?190:125);
 ring(e.x,e.y,COLORS[e.type]||"#fff",e.type==="core"?135:48);shake=Math.max(shake,e.type==="core"?9:4);

 const burstLv=bossPowerLevel("heartburst");
 if((e.markTime||0)>0&&burstLv>0){
   const radius=105+(burstLv-1)*15,damage=1.25+burstLv*.72;
   ring(e.x,e.y,"#ff9fba",radius);particle(e.x,e.y,"#ff9fba",18,145);
   for(const o of [...enemies]){
     if(o===e||o.dead)continue;
     if(hyp(o.x-e.x,o.y-e.y)<radius)hitEnemy(o,damage,"burst");
   }
 }

 if(e.type==="core"){
   S.chains++;burstTone(220+S.combo*14,4);
   for(const o of enemies){
     if(o===e||o.dead)continue;
     if(hyp(o.x-e.x,o.y-e.y)<128)kill(o,true);
   }
 }else sfxKill(e);
 if(S.dashKillsThisDash===1&&rnd()<.42)praise("beautiful dash", "nice");
 if(S.dashKillsThisDash===2)praise("double dash! you are SO clean", "nice");
 if(S.dashKillsThisDash>=3)praise("okay, THAT was ridiculous", "big");
 if(chain&&S.chains>=2&&rnd()<(.34+(pipWithPlayer()?S.loveWishBonus:0)))spawnWish(e.x,e.y);
 if(e.type==="core"&&S.chains===1)praise("you popped the spicy one ✦", "nice");
 if(S.combo>=3&&S.bestCombo<3.3)praise("ohhh you found the rhythm ✦", "nice");
 if(S.combo>=4&&S.bestCombo<4.3)praise("you make this look gorgeous", "nice");
 if(S.combo>=6&&S.bestCombo<6.3)praise("look at you GO", "big");
 if(S.kills>0&&S.kills%8===0)praise("eight down. you're wonderful.", "nice");
 if(S.kills>0&&S.kills%14===0)spawnWish(e.x,e.y);
 if(S.heat>=100&&S.over<=0){
   S.heat=0;S.over=4;S.overdrives++;announce("PIP POWER!",950);flash=.65;shake=14;burstTone(330,6);praise("OH WOW — you EARNED this!", "big", true);
 }
}
function hurt(){
 if(S.invuln>0||S.end)return;
 if(pipWithPlayer()&&S.guardianCharges>0){
   S.guardianCharges--;
   S.invuln=.72;
   ring(P.x,P.y,"#fff0a8",88);particle(P.pipX,P.pipY,"#ffd36f",20,170);
   popup(P.x,P.y-18,"PIP CAUGHT IT","#fff0a8",true,1.0);
   sfxPipLove();
   praise("I caught that one. I've got you.", "nice", true);
   return;
 }
 S.noHitClock=0;S.nextNoHitPraise=rr(15,21);
 S.combo=1;S.comboClock=0;S.heat=Math.max(0,S.heat-42);S.invuln=1.05;shake=16;flash=.8;
 S.shieldRegenClock=-(pipWithPlayer()?S.shieldRegenDelay:4.0);
 if(S.shields>0){
   sfxPlayerDamage(true);
   S.shields--;
   if(pipWithPlayer()&&S.pipCompassion>=3)S.invuln=Math.max(S.invuln,1.32);
   if(S.shields===0)praise("I'm right here. You're still incredible.", "nice", true);
   else praise("you're okay — keep being brilliant", "nice", true);
   popup(P.x,P.y,"SHIELD BROKE",COLORS.player,true);
   particle(P.x,P.y,COLORS.player,24,210);
   ring(P.x,P.y,COLORS.player,78);
   tone(125,.18,.035,"sawtooth");
 }else{
   sfxPlayerDamage(false);
   S.health=Math.max(0,S.health-34);
   praise(S.health>35?"you've got this — I believe in you completely ✦":"stay with me, superstar. you're amazing.", "big", true);
   popup(P.x,P.y,"-"+34+" HP",COLORS.hot,true);
   particle(P.x,P.y,COLORS.hot,24,210);
   tone(82,.24,.045,"sawtooth");
 }
 if(S.health<=0)finish(true);
}
function fireBossVolley(e){
 const p=bossData(e.bossStage);
 const count=5+Math.min(5,Math.floor(e.bossStage/5));
 const baseA=Math.atan2(P.y-e.y,P.x-e.x);
 const spread=.82;
 sfxEnemyAttack("boss");
 for(let i=0;i<count;i++){
   const t=count===1?0:i/(count-1);
   const a=baseA-spread/2+spread*t;
   const speed=170+Math.min(100,e.bossStage*4);
   enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:5,life:4,c:p.color});
 }
 // Every second volley adds a radial punctuation.
 if((e.volleyCount++%2)===1){
   const radial=6+Math.min(4,Math.floor(e.bossStage/6));
   for(let i=0;i<radial;i++){
     const a=i/radial*Math.PI*2+e.age*.4;
     enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*135,vy:Math.sin(a)*135,r:4,life:4,c:p.color});
   }
 }
}
function updateEnemy(e,dt){
 e.age+=dt;
 if(e.type==="boss"){
   e.attackClock-=dt;
   e.orbitAngle+=dt*(.42+Math.min(.35,e.bossStage*.012));
   const desired=155+Math.sin(e.age*.7)*34;
   const tx=P.x+Math.cos(e.orbitAngle)*desired,ty=P.y+Math.sin(e.orbitAngle)*desired;
   e.x+=(tx-e.x)*Math.min(1,dt*(1.15+e.bossStage*.015));
   e.y+=(ty-e.y)*Math.min(1,dt*(1.15+e.bossStage*.015));
   if(e.attackClock<=0){
     fireBossVolley(e);
     e.attackClock=Math.max(.72,1.55-e.bossStage*.022);
   }
 }else if(e.type==="chaser"||e.type==="core"){
   let dx=P.x-e.x,dy=P.y-e.y,l=hyp(dx,dy)||1,s=e.speed*difficulty();
   e.x+=dx/l*s*dt;e.y+=dy/l*s*dt;
 }
 if(e.type==="charger"){
   if(e.state==="aim"){
     e.aim-=dt;
     if(e.aim<=0){
       let dx=P.x-e.x,dy=P.y-e.y,l=hyp(dx,dy)||1;
       e.vx=dx/l*340;e.vy=dy/l*340;e.state="charge";e.charge=.52;
       sfxEnemyAttack("charger");
     }
   }else{
     e.x+=e.vx*dt;e.y+=e.vy*dt;e.charge-=dt;
     if(e.charge<=0){e.state="aim";e.aim=rr(.6,.95);e.vx=e.vy=0}
   }
 }
 let dd=hyp(P.x-e.x,P.y-e.y);
 if(e.type!=="boss"&&S.dashTime>0&&dd<P.r+e.r+10)kill(e,false);
 else if(dd<P.r+e.r){
   sfxEnemyAttack(e.type==="charger"?"charger":e.type==="boss"?"boss":"contact");
   hurt();
 }
}
