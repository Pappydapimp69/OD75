function triggerOverdrive(){
 if(!S||!S.run||S.end||S.waveState==="stage"||S.over>0||S.heat<100)return false;
 const id=S.overType,lv=Math.max(1,overLevel(id));
 S.heat=0;S.overdrives++;S.overPulse=0;S.overFxClock=0;S.overTarget=null;S.ascendantWishMade=false;
 if(id==="beam")S.over=3.0+lv*.48;
 else if(id==="storm")S.over=3.4+lv*.42;
 else if(id==="guardian"){S.over=4.0+lv*.48;S.overGuardHits=2+lv*2;S.shields=S.maxShields;S.shieldRegenClock=0}
 else if(id==="nova")S.over=2.5+lv*.34;
 else if(id==="gravity"){S.over=3.8+lv*.46;const t=getAutoTarget();S.overTarget=t?{x:t.x,y:t.y}:{x:P.x+P.faceX*90,y:P.y+P.faceY*90}}
 else {S.over=4.2+lv*.48;S.invuln=Math.max(S.invuln,.25+(S.pipCompassion||0)*.10);S.shields=Math.min(S.maxShields,S.shields+Math.ceil((S.pipCompassion||0)/2))}
 announce("OVERDRIVE · "+OVERDRIVE_INFO[id].name.toUpperCase(),1050);flash=.65;shake=12;burstTone(330+lv*25,6);
 praise(id==="pip"?"okay — me and you. ALL of me. let's go!":"you saved it for exactly the right moment ✦","big",true);
 updateUI();return true;
}
function updateOverdrive(dt){
 if(S.over<=0)return;
 const id=S.overType,lv=Math.max(1,overLevel(id));S.overPulse-=dt;S.overFxClock-=dt;
 if(id==="storm"&&S.overPulse<=0){strikeStorm();S.overPulse=Math.max(.22,.58-lv*.055)}
 else if(id==="nova"&&S.overPulse<=0){novaPulse();S.overPulse=Math.max(.38,.82-lv*.06)}
 else if(id==="gravity"){
   gravityPulse(dt);
   if(S.overPulse<=0){gravityDamagePulse();S.overPulse=Math.max(.24,.52-lv*.045)}
 }else if(id==="guardian"&&S.overPulse<=0){ring(P.x,P.y,"#7ed8ff",85+lv*8);for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<80+lv*10)hitEnemy(e,.35+lv*.22,"overdrive");S.overPulse=.7}
 else if(id==="pip"&&S.overPulse<=0){ascendantPulse();S.overPulse=Math.max(.28,.68-lv*.045-(S.pipSupport||0)*.018)}
}
function finishOverdrive(){S.over=0;S.overPulse=0;S.overGuardHits=0;S.overTarget=null;announce("OVERDRIVE SPENT",500)}
function attack(){
 if(!S.run||S.end||S.attackCd>0)return;
 const target=getAutoTarget();if(!target)return;
 let dx=target.x-P.x,dy=target.y-P.y,l=hyp(dx,dy)||1;dx/=l;dy/=l;P.faceX=dx;P.faceY=dy;
 const pipOn=pipWithPlayer(),beam=S.over>0&&S.overType==="beam",asc=S.over>0&&S.overType==="pip";
 const lv=beam?overLevel("beam"):asc?overLevel("pip"):0;
 const supportTwin=pipOn&&S.pipSupport>=3?Math.min(.34,.10+(S.pipSupport-3)*.04):0;
 const extraTwin=pipOn&&!beam&&rnd()<Math.max(S.pipLevel>=5?.18:0,supportTwin);
 const spread=beam?[-.13,0,.13]:(asc&&S.pipSupport>=2?[-.08,.08]:(extraTwin?[-.07,.07]:[0]));
 const relayLv=bossPowerLevel("relay"),relayPower=S.pipRelayBuff>0?1.15+(relayLv-1)*.04:1;
 for(const off of spread){
   const a=Math.atan2(dy,dx)+off,vx=Math.cos(a)*600,vy=Math.sin(a)*600;
   const overPower=beam?(1.5+lv*.33):asc?(1.15+lv*.16+(S.pipSupport||0)*.06):1;
   shots.push({x:P.x+Math.cos(a)*18,y:P.y+Math.sin(a)*18,vx,vy,r:pipOn?S.projectileSize+(beam?1.5:0):6,life:beam?.78:.55,power:(pipOn?S.weaponPower*((S.shields<=1)?S.supportPower:1)*relayPower:1)*overPower,source:"player",pierce:beam?1+Math.floor((lv-1)/2):0});
 }
 if(pipOn){S.pipVolleyCount++;const echoLv=bossPowerLevel("echo"),every=Math.max(2,5-echoLv);if(echoLv>0&&S.pipVolleyCount%every===0){for(const off of spread)pushPipShot(P.pipX,P.pipY,target,.72+echoLv*.16,off);ring(P.pipX,P.pipY,"#d9c8ff",42)}}
 let cd=pipOn?S.attackMax:.33;
 if(beam)cd=Math.max(.065,.12-lv*.009);else if(asc)cd=Math.max(.075,.17-lv*.008-(S.pipSupport||0)*.008);else{if(pipOn&&S.supportRush>0)cd*=.76;if(pipOn&&S.pipRelayBuff>0)cd*=Math.max(.66,.82-bossPowerLevel("relay")*.025)}
 S.attackCd=cd;particle(P.x+dx*16,P.y+dy*16,beam?"#ffd36f":COLORS.violet,4,55);sfxPlayerFire(pipOn,beam||asc);
}
function dashVector(dx,dy){
 if(!S.run||S.end)return false;
 if(S.dashCd>0)return false;
 let l=hyp(dx,dy);
 if(l<.2){dx=P.faceX;dy=P.faceY;l=hyp(dx,dy)||1}
 dx/=l;dy/=l;
 P.faceX=dx;P.faceY=dy;
 P.vx=dx*640;P.vy=dy*640;
 S.dashTime=.16;S.invuln=.22;S.dashKillsThisDash=0;
 S.dashCd=S.dashMax*((S.over>0&&S.overType==="pip"&&(S.pipSupport||0)>=2)?.48:1);
 if(pipWithPlayer()&&S.pipSupport>=2){
   S.supportRush=2+Math.min(1.5,(S.pipSupport-2)*.18);
   popup(P.x,P.y-16,"PIP RUSH","#d9c8ff",false,.65);
 }
 particle(P.x,P.y,COLORS.player,9,90);sfxDash();
 return true;
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
   if(S.pipHitCount%threshold===0){e.markTime=5.5;ring(e.x,e.y,"#ff9fba",e.r+18);popup(e.x,e.y,"♥ MARK","#ffb3c7",false,.75);sfxPipCue("heart")}
 }
 e.hp-=power;e.flash=.11;particle(e.x,e.y,"#ffffff",4,70);sfxHitEnemy(e);
 if(e.type==="boss"&&!S.bossMidPraise&&e.hp<=e.maxHp*.5){S.bossMidPraise=true;praise(bossData().mid,"big",true)}
 if(e.hp<=0)kill(e,false);
}
function dropHeartBits(e){const count=e.type==="charger"?2:e.type==="core"?2:1;for(let i=0;i<count;i++)heartBits.push({x:e.x+rr(-11,11),y:e.y+rr(-11,11),vx:rr(-52,52),vy:rr(-52,52),r:7,life:11,bob:rr(0,6.28),dead:false})}
const HEART_TOTAL_KEY="overdrive75_player_heart_total_v1";
function loadHeartTotal(){try{const n=Number(localStorage.getItem(HEART_TOTAL_KEY)||0);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0}catch(_){return 0}}
function saveHeartTotal(){try{localStorage.setItem(HEART_TOTAL_KEY,String(Math.max(0,Math.floor(S.heartTotal||0))))}catch(_){}}
function collectHeartBit(h){
 if(h.dead)return;h.dead=true;S.heartCurrency++;S.stageCurrency++;S.heartTotal=(S.heartTotal||0)+1;saveHeartTotal();popup(h.x,h.y,"♥ +1","#ffb3c7",false,1.0);tone(730+Math.min(300,S.heartCurrency*5),.045,.010,"sine");
 if(S.stageCurrency===3)praise("three little hearts already. you're taking such good care of us.","nice");if(S.stageCurrency===5)praise("yes — the little hearts! I love doing this with you ✦","nice");if(S.stageCurrency===8)praise("eight hearts. you keep showing up for me and I notice.","nice");if(S.stageCurrency===12)praise("you earned enough to help me grow. you did that for me. I won't forget it.","big",true);
}
function kill(e,chain=false){
 if(e.dead)return;if(e.type==="boss"){killBoss(e);return}e.dead=true;S.kills++;S.waveKills++;dropHeartBits(e);
 const xpBase=e.type==="core"?18:e.type==="charger"?14:9;gainPipXP(xpBase+(chain?3:0)+(S.dashTime>0?2:0),e.type);if(S.dashTime>0&&!chain){S.dashKills++;S.dashKillsThisDash++;S.stylePoints+=.35}
 const overMult=S.over>0?3:1;let base=e.type==="core"?180:e.type==="charger"?140:100;S.combo=Math.min(9.9,S.combo+.18+(chain?.08:0));S.comboClock=1.35;S.bestCombo=Math.max(S.bestCombo,S.combo);let pts=Math.round(base*S.combo*overMult);S.score+=pts;
 const heatGain=(S.combo>=2?((e.type==="core"?7:2)+(chain?1:0)+(S.dashTime>0?1:0)):0)*(S.overdrives>0?.65:1);S.heat=clamp(S.heat+heatGain,0,100);
 popup(e.x,e.y,"+"+pts,e.type==="core"?COLORS.violet:"#fff",S.combo>4);particle(e.x,e.y,COLORS[e.type]||"#fff",e.type==="core"?18:10,e.type==="core"?190:125);ring(e.x,e.y,COLORS[e.type]||"#fff",e.type==="core"?135:48);shake=Math.max(shake,e.type==="core"?9:4);
 const burstLv=bossPowerLevel("heartburst");if((e.markTime||0)>0&&burstLv>0){const radius=105+(burstLv-1)*15,damage=1.25+burstLv*.72;ring(e.x,e.y,"#ff9fba",radius);particle(e.x,e.y,"#ff9fba",18,145);for(const o of [...enemies])if(o!==e&&!o.dead&&hyp(o.x-e.x,o.y-e.y)<radius)hitEnemy(o,damage,"burst")}
 if(e.type==="core"){S.chains++;burstTone(220+S.combo*14,4);for(const o of enemies)if(o!==e&&!o.dead&&hyp(o.x-e.x,o.y-e.y)<128)kill(o,true)}else sfxKill(e);
 if(S.dashKillsThisDash===1&&rnd()<.42)praise("beautiful dash","nice");if(S.dashKillsThisDash===2)praise("double dash! you are SO clean","nice");if(S.dashKillsThisDash>=3)praise("okay, THAT was ridiculous","big");if(chain&&S.chains>=2&&rnd()<(.34+(pipWithPlayer()?S.loveWishBonus:0)))spawnWish(e.x,e.y);if(e.type==="core"&&S.chains===1)praise("you popped the spicy one ✦","nice");if(S.combo>=3&&S.bestCombo<3.3)praise("ohhh you found the rhythm ✦","nice");if(S.combo>=4&&S.bestCombo<4.3)praise("you make this look gorgeous","nice");if(S.combo>=6&&S.bestCombo<6.3)praise("look at you GO","big");if(S.kills>0&&S.kills%8===0)praise("eight down. you're wonderful.","nice");if(S.kills>0&&S.kills%14===0)spawnWish(e.x,e.y);
}
function hurt(){
 if(S.invuln>0||S.end)return;
 if(S.over>0&&S.overType==="guardian"&&S.overGuardHits>0){S.overGuardHits--;S.invuln=.42;ring(P.x,P.y,"#fff0a8",100);particle(P.x,P.y,"#7ed8ff",18,170);popup(P.x,P.y-18,"GUARDIAN BLOCK","#fff0a8",true,.8);sfxShield();return}
 if(S.over>0&&S.overType==="pip"&&(S.pipCompassion||0)>0&&rnd()<Math.min(.72,.22+(S.pipCompassion||0)*.10)){S.invuln=.35;ring(P.x,P.y,"#ffb3c7",80);popup(P.x,P.y-18,"PIP HELD YOU","#ffb3c7",false,.7);sfxPipLove();return}
 if(pipWithPlayer()&&S.guardianCharges>0){S.guardianCharges--;S.invuln=.72;ring(P.x,P.y,"#fff0a8",88);particle(P.pipX,P.pipY,"#ffd36f",20,170);popup(P.x,P.y-18,"PIP CAUGHT IT","#fff0a8",true,1.0);sfxPipLove();praise("I caught that one. I've got you.","nice",true);return}
 S.noHitClock=0;S.nextNoHitPraise=rr(15,21);S.combo=1;S.comboClock=0;if(S.heat<100)S.heat=Math.max(0,S.heat-42);S.invuln=1.05;shake=16;flash=.8;S.shieldRegenClock=-(pipWithPlayer()?S.shieldRegenDelay:4.0);
 if(S.shields>0){sfxPlayerDamage(true);S.shields--;if(pipWithPlayer()&&S.pipCompassion>=3)S.invuln=Math.max(S.invuln,1.32);if(S.shields===0)praise("I'm right here. You're still incredible.","nice",true);else praise("you're okay — keep being brilliant","nice",true);popup(P.x,P.y,"SHIELD BROKE",COLORS.player,true);particle(P.x,P.y,COLORS.player,24,210);ring(P.x,P.y,COLORS.player,78);tone(125,.18,.035,"sawtooth")}
 else{sfxPlayerDamage(false);S.health=Math.max(0,S.health-34);praise(S.health>35?"you've got this — I believe in you completely ✦":"stay with me, superstar. you're amazing.","big",true);popup(P.x,P.y,"-"+34+" HP",COLORS.hot,true);particle(P.x,P.y,COLORS.hot,24,210);tone(82,.24,.045,"sawtooth")}
 if(S.health<=0)finish(true);
}
function fireBossVolley(e){
 const p=bossData(e.bossKey);const count=5+Math.min(5,Math.floor(e.bossStage/5));const baseA=Math.atan2(P.y-e.y,P.x-e.x);const spread=.82;sfxEnemyAttack("boss");
 for(let i=0;i<count;i++){const t=count===1?0:i/(count-1),a=baseA-spread/2+spread*t,speed=170+Math.min(100,e.bossStage*4);enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:5,life:4,c:p.color})}
 if((e.volleyCount++%2)===1){const radial=6+Math.min(4,Math.floor(e.bossStage/6));for(let i=0;i<radial;i++){const a=i/radial*Math.PI*2+e.age*.4;enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*135,vy:Math.sin(a)*135,r:4,life:4,c:p.color})}}
}
function updateEnemy(e,dt){
 e.age+=dt;
 if(e.type==="boss"){e.attackClock-=dt;e.orbitAngle+=dt*(.42+Math.min(.35,e.bossStage*.012));const desired=155+Math.sin(e.age*.7)*34;const tx=P.x+Math.cos(e.orbitAngle)*desired,ty=P.y+Math.sin(e.orbitAngle)*desired;e.x+=(tx-e.x)*Math.min(1,dt*(1.15+e.bossStage*.015));e.y+=(ty-e.y)*Math.min(1,dt*(1.15+e.bossStage*.015));if(e.attackClock<=0){fireBossVolley(e);e.attackClock=Math.max(.72,1.55-e.bossStage*.022)}}
 else if(e.type==="chaser"||e.type==="core"){let dx=P.x-e.x,dy=P.y-e.y,l=hyp(dx,dy)||1,s=e.speed*difficulty();e.x+=dx/l*s*dt;e.y+=dy/l*s*dt}
 if(e.type==="charger"){if(e.state==="aim"){e.aim-=dt;if(e.aim<=0){let dx=P.x-e.x,dy=P.y-e.y,l=hyp(dx,dy)||1;e.vx=dx/l*340;e.vy=dy/l*340;e.state="charge";e.charge=.52;sfxEnemyAttack("charger")}}else{e.x+=e.vx*dt;e.y+=e.vy*dt;e.charge-=dt;if(e.charge<=0){e.state="aim";e.aim=rr(.6,.95);e.vx=e.vy=0}}}
 let dd=hyp(P.x-e.x,P.y-e.y);if(e.type!=="boss"&&S.dashTime>0&&dd<P.r+e.r+10)kill(e,false);else if(dd<P.r+e.r){sfxEnemyAttack(e.type==="charger"?"charger":e.type==="boss"?"boss":"contact");hurt()}
}
