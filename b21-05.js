function startBossBattle(){
 const p=bossData();S.bossKey=p.key;S.bossActive=true;S.bossQueued=false;S.bossDefeated=false;S.bossMidPraise=false;S.bossName=p.name;S.waveState="boss";S.spawn=999;shots=[];enemyShots=[];S.bossStartedAt=S.stageTime;resetGuardianCharges();
 const threat=1+S.bossCount;const hp=Math.round(54+S.stage*7+threat*18);S.bossMaxHp=hp;const a=rr(0,Math.PI*2),dist=Math.max(210,Math.min(W,H)*.38);
 enemies.push({type:"boss",bossStage:Math.max(1,S.stage+S.bossCount*2),bossKey:p.key,x:P.x+Math.cos(a)*dist,y:P.y+Math.sin(a)*dist,r:30,hp,maxHp:hp,dead:false,age:0,flash:0,attackClock:1.05,volleyCount:0,orbitAngle:a});
 announce("BOSS · "+p.name,1200);showPipMessage(p.intro,true);sfxBossRoar();if(audioEngine){audioEngine.setTempo(p.bpm);audioEngine.step=0;audioEngine.nextStepTime=audioCtx?audioCtx.currentTime+.05:0}
}
function killBoss(e){
 if(e.dead)return;const p=bossData(e.bossKey||S.bossKey);
 e.dead=true;S.bossActive=false;S.bossDefeated=true;S.stageEnding=true;S.bossRewardPending=true;S.score+=5000+S.stage*450+S.bossCount*900;S.waveKills++;gainPipXP(90+S.stage*8+S.bossCount*12,"boss");
 for(let i=0;i<14+Math.min(12,S.stage+S.bossCount);i++)heartBits.push({x:e.x+rr(-24,24),y:e.y+rr(-24,24),vx:rr(-90,90),vy:rr(-90,90),r:7,life:14,bob:rr(0,6.28),dead:false});
 particle(e.x,e.y,p.color,52,270);ring(e.x,e.y,p.color,210);shake=22;flash=.9;sfxBossDefeat();praise(p.victory,"big",true);announce("BOSS CLEAR!",1100);enemyShots=[];enemies=enemies.filter(o=>o!==e&&!o.dead);
 S.bossCount++;S.bossStarIndex++;S.nextBossStars=bossThresholdFor(S.bossStarIndex);S.waveState="break";S.waveBreak=10;if(audioEngine){audioEngine.setTempo(S.stage>=5?124:116);audioEngine.step=0}
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
 else if(S.stageWaveCount===3&&S.bossQueued)showPipMessage("third wave. the stars pulled something close. whatever happens, I'm with you.");
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
   if(target){S.pipTarget=target;S.pipState="collect";sfxPipCue("depart");showPipMessage("heart spotted — I'll grab it! stay safe for me.")}
   return;
 }
 if(S.pipState==="collect"){
   const h=S.pipTarget;
   if(!h||h.dead||h.life<=0){S.pipTarget=null;S.pipState="return";return}
   const dx=h.x-P.pipX,dy=h.y-P.pipY,d=hyp(dx,dy)||1;
   P.pipX+=dx/d*S.pipMoveSpeed*dt;P.pipY+=dy/d*S.pipMoveSpeed*dt;
   if(d<12){collectHeartBit(h);if(S.pipLove>=2)S.lovePulsePending++;sfxPipCue("heart");S.pipTarget=null;S.pipState="return"}
   return;
 }
 const dx=orbit.x-P.pipX,dy=orbit.y-P.pipY,d=hyp(dx,dy)||1;
 P.pipX+=dx/d*S.pipMoveSpeed*dt;P.pipY+=dy/d*S.pipMoveSpeed*dt;
 if(d<14){
   P.pipX=orbit.x;P.pipY=orbit.y;S.pipState="orbit";sfxPipCue("return");
   if(S.pipCompassion>=2){S.invuln=Math.max(S.invuln,.55+Math.min(.55,(S.pipCompassion-2)*.12));ring(P.x,P.y,"#7ed8ff",58)}
   if(S.lovePulsePending>0){lovePulse(P.pipX,P.pipY);S.lovePulsePending=0}
   warmReturnVolley();
   const relayLv=bossPowerLevel("relay");
   if(relayLv>0){S.pipRelayBuff=4+relayLv;popup(P.x,P.y-18,"HEART RELAY","#ffd36f",true,1.0);ring(P.x,P.y,"#ffd36f",72)}
   showPipMessage("I'm back. bonuses online ✦");
 }
}
function updateCamera(){
 const deadX=W*.15,deadY=H*.15;
 let screenX=P.x-CAM.x+W/2;let screenY=P.y-CAM.y+H/2;
 const minX=W/2-deadX,maxX=W/2+deadX;const minY=H/2-deadY,maxY=H/2+deadY;
 if(screenX<minX)CAM.x=P.x-(minX-W/2);else if(screenX>maxX)CAM.x=P.x-(maxX-W/2);
 if(screenY<minY)CAM.y=P.y-(minY-H/2);else if(screenY>maxY)CAM.y=P.y-(maxY-H/2);
}
function worldToScreenX(x){return x-CAM.x+W/2}
function worldToScreenY(y){return y-CAM.y+H/2}
function worldVisible(x,y,pad=100){const sx=worldToScreenX(x),sy=worldToScreenY(y);return sx>-pad&&sx<W+pad&&sy>-pad&&sy<H+pad}
function nearestEnemyFrom(x,y,range=520){let best=null,bestD=range;for(const e of enemies){if(e.dead)continue;const d=hyp(x-e.x,y-e.y);if(d<bestD){bestD=d;best=e}}return best}
function pushPipShot(x,y,target,power=.8,spread=0){
 if(!target||target.dead)return;let a=Math.atan2(target.y-y,target.x-x)+spread;
 shots.push({x,y,vx:Math.cos(a)*535,vy:Math.sin(a)*535,r:5.2,life:.8,power,source:"pip"});particle(x,y,"#ffd36f",3,42);
 if(ensureAudio())audioEngine.fmBell(850+rr(-45,45),audioCtx.currentTime,.09,.009,rr(-.2,.2),audioEngine.sfx);
}
function lovePulse(x,y){
 if(S.pipLove<2)return;const radius=80+Math.min(55,(S.pipLove-2)*10),damage=.65+S.pipLove*.22;ring(x,y,"#ff9fba",radius);particle(x,y,"#ff9fba",16,115);
 for(const e of enemies){if(e.dead)continue;if(hyp(e.x-x,e.y-y)<=radius)hitEnemy(e,damage,"pip")}
}
function warmReturnVolley(){if(S.pipLove<3||!pipWithPlayer())return;const target=nearestEnemyFrom(P.pipX,P.pipY,470);if(!target)return;const bonus=1+Math.max(0,S.pipLove-3)*.12;[-.13,0,.13].forEach(a=>pushPipShot(P.pipX,P.pipY,target,.62*bonus,a))}
function updatePipCombat(dt){
 S.pipShotCd=Math.max(0,S.pipShotCd-dt);S.pipConstellationCd=Math.max(0,S.pipConstellationCd-dt);S.pipRelayBuff=Math.max(0,S.pipRelayBuff-dt);S.supportRush=Math.max(0,S.supportRush-dt);
 if(!pipWithPlayer()||!(S.waveState==="active"||S.waveState==="boss"))return;
 const starLv=bossPowerLevel("starshot");if(starLv>0&&S.pipShotCd<=0){const target=nearestEnemyFrom(P.pipX,P.pipY,510);if(target){pushPipShot(P.pipX,P.pipY,target,.62+starLv*.24);S.pipShotCd=Math.max(.62,1.45-(starLv-1)*.12)}}
 const constLv=bossPowerLevel("constellation");if(constLv>0&&S.pipConstellationCd<=0){const count=6+Math.min(6,(constLv-1)*2);for(let i=0;i<count;i++){const a=i/count*Math.PI*2+P.pipAngle*.4;shots.push({x:P.pipX,y:P.pipY,vx:Math.cos(a)*430,vy:Math.sin(a)*430,r:4.5,life:.72,power:.46+constLv*.13,source:"pip"})}ring(P.pipX,P.pipY,"#ffd36f",72);S.pipConstellationCd=Math.max(5,10-constLv);sfxPipCue("heart")}
}
function resetGuardianCharges(){const lv=bossPowerLevel("guardian");S.guardianCharges=lv>0?1+Math.floor((lv-1)/2):0}
function getAutoTarget(){const baseRange=Math.min(270,Math.max(185,Math.min(W,H)*.55));let best=null,bestD=pipWithPlayer()?S.attackRange:baseRange;for(const e of enemies){if(e.dead)continue;const d=hyp(P.x-e.x,P.y-e.y);if(d<bestD){bestD=d;best=e}}return best}
function addOverLine(x1,y1,x2,y2,c="#fff0a8",life=.14){overLines.push({x1,y1,x2,y2,c,life,max:life})}
function visibleEnemies(){return enemies.filter(e=>!e.dead&&worldVisible(e.x,e.y,30))}
function strikeStorm(){
 const lv=overLevel("storm"),pool=visibleEnemies();if(!pool.length)return;
 const first=pool[Math.floor(rnd()*pool.length)];const damage=1.25+lv*.62,bounces=1+Math.floor((lv-1)/2),range=115+lv*14;
 addOverLine(first.x,first.y-Math.max(H*.55,260),first.x,first.y,"#9ee7ff",.18);hitEnemy(first,damage,"overdrive");particle(first.x,first.y,"#9ee7ff",12,130);ring(first.x,first.y,"#9ee7ff",52);
 let prev=first,used=new Set([first]);for(let i=0;i<bounces;i++){let best=null,bestD=range;for(const e of enemies){if(e.dead||used.has(e))continue;const d=hyp(e.x-prev.x,e.y-prev.y);if(d<bestD){best=e;bestD=d}}if(!best)break;addOverLine(prev.x,prev.y,best.x,best.y,"#dff9ff",.16);hitEnemy(best,damage*(.84-i*.08),"overdrive");particle(best.x,best.y,"#9ee7ff",8,105);used.add(best);prev=best}
 tone(1180-rr(0,260),.07,.018,"square");
}
function novaPulse(){const lv=overLevel("nova"),radius=125+lv*24,damage=.9+lv*.72;ring(P.x,P.y,"#ff9fba",radius);particle(P.x,P.y,"#ffd36f",18+lv*3,180);for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<=radius)hitEnemy(e,damage,"overdrive");burstTone(320+lv*45,4)}
function gravityPulse(dt){const lv=overLevel("gravity"),g=S.overTarget||{x:P.x,y:P.y},radius=175+lv*22;for(const e of enemies){if(e.dead)continue;const dx=g.x-e.x,dy=g.y-e.y,d=hyp(dx,dy)||1;if(d<radius){const pull=(115+lv*28)*(1-d/radius+.18);e.x+=dx/d*pull*dt;e.y+=dy/d*pull*dt}}}
function gravityDamagePulse(){const lv=overLevel("gravity"),g=S.overTarget||{x:P.x,y:P.y},radius=175+lv*22;ring(g.x,g.y,"#b388ff",radius);particle(g.x,g.y,"#b388ff",14,90);for(const e of [...enemies])if(!e.dead&&hyp(e.x-g.x,e.y-g.y)<radius)hitEnemy(e,.38+lv*.30,"overdrive")}
function ascendantPulse(){
 const lv=overLevel("pip"),love=S.pipLove||0,comp=S.pipCompassion||0,support=S.pipSupport||0;const radius=80+lv*10+love*7,damage=.55+lv*.34+love*.13;
 if(love>0){ring(P.pipX,P.pipY,"#ff9fba",radius);for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.pipX,e.y-P.pipY)<radius)hitEnemy(e,damage,"pip")}
 if(comp>0&&S.shields<S.maxShields&&rnd()<Math.min(.55,.16+comp*.08)){S.shields++;S.shieldRegenClock=0;sfxShield()}
 if(support>0){const t=nearestEnemyFrom(P.pipX,P.pipY,650);if(t){const volleys=1+Math.floor((support+lv)/3);for(let i=0;i<volleys;i++)pushPipShot(P.pipX,P.pipY,t,.9+lv*.2+support*.12,rr(-.12,.12))}}
 if(love>=2&&!S.ascendantWishMade&&S.over<2.2){S.ascendantWishMade=true;spawnWish(P.pipX,P.pipY)}
}
