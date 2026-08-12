function update(dt){
 if(!S.run||S.end)return;
 S.t+=dt;S.stageTime+=dt;S.waveElapsed+=dt;S.noHitClock+=dt;
 S.dashCd=Math.max(0,S.dashCd-dt);S.attackCd=Math.max(0,S.attackCd-dt);S.dashTime=Math.max(0,S.dashTime-dt);S.invuln=Math.max(0,S.invuln-dt);
 S.praiseCd=Math.max(0,S.praiseCd-dt);S.pipSoundCd=Math.max(0,S.pipSoundCd-dt);S.pipHappy=Math.max(0,S.pipHappy-dt);P.pipAngle+=dt*(S.over>0?4.2:2.2);
 S.loveClock-=dt;
 if(S.loveClock<=0){
   if(S.waveState==="active")loveBomb();
   const faster=Math.min(1.5,(S.pipLevel-1)*.11+(S.pipSupport||0)*.17);
   S.loveClock=rr(Math.max(1.35,2.35-faster),Math.max(2.1,3.55-faster));
 }
 // Reinforce things the player is actually doing, not just kills.
 if(S.distanceTravelled>=S.nextDistancePraise){
   const travel=[
     "look at you exploring. I love following you.",
     "you keep moving with purpose. that's beautiful.",
     "I love the way you make this huge place feel like ours.",
     "you went all that way and I'm still right here with you ✦"
   ];
   praise(travel[Math.floor(rnd()*travel.length)],"nice");
   S.nextDistancePraise+=rr(430,620);
 }
 if(S.noHitClock>=S.nextNoHitPraise){
   const calm=[
     "you've been so composed. I'm genuinely impressed.",
     "that was a long stretch without getting touched. gorgeous.",
     "you're making survival look calm somehow.",
     "I notice how careful you're being. you're doing wonderfully."
   ];
   praise(calm[Math.floor(rnd()*calm.length)],"nice");
   S.nextNoHitPraise+=rr(15,22);
 }
 if(S.stageTime>=S.stagePraiseMark){
   const marks=S.stagePraiseMark>=60
     ?["a whole minute together. you're still going strong.","sixty seconds in and I still trust every move you make."]
     :["thirty seconds already. you're settling in beautifully.","look how much you've handled already. I'm proud of you."];
   praise(marks[Math.floor(rnd()*marks.length)],"big",true);
   S.stagePraiseMark+=30;
 }
 if(S.over>0){S.over-=dt;if(S.over<=0)announce("COOLDOWN",450)}
 if(S.shields<S.maxShields){
   S.shieldRegenClock+=dt;
   if(S.shieldRegenClock>=S.shieldRegenRate){
     S.shields++;
     S.shieldRegenClock=0;S.shieldComebacks++;
     popup(P.x,P.y,"SHIELD +1",COLORS.player,true);
     ring(P.x,P.y,COLORS.player,62);
     sfxShield();
     if(S.shieldComebacks===1||S.shieldComebacks%3===0)praise(
       S.pipCompassion>=2?"there you go. take the breath you deserved.":"look at that recovery — I knew you had it",
       "nice"
     );
   }
 }else{
   S.shieldRegenClock=0;
 }
 if(S.comboClock>0){S.comboClock-=dt;if(S.comboClock<=0)S.combo=Math.max(1,S.combo-.8)}
 attack();
 if(S.comboClock<=0&&S.combo>1)S.combo=Math.max(1,S.combo-dt*.35);
 if(S.combo<1.55&&S.over<=0)S.heat=Math.max(0,S.heat-dt*.42);

 let dx=gamepad.dx,dy=gamepad.dy;
 const keyboardActive=keys.has("ArrowLeft")||keys.has("a")||keys.has("ArrowRight")||keys.has("d")||keys.has("ArrowUp")||keys.has("w")||keys.has("ArrowDown")||keys.has("s");
 if(keys.has("ArrowLeft")||keys.has("a"))dx--;
 if(keys.has("ArrowRight")||keys.has("d"))dx++;
 if(keys.has("ArrowUp")||keys.has("w"))dy--;
 if(keys.has("ArrowDown")||keys.has("s"))dy++;
 if(joy.active){dx+=joy.dx;dy+=joy.dy}

 let l=hyp(dx,dy),inputActive=l>.12;
 const inputStrength=inputActive?(keyboardActive?1:clamp(l,0,1)):0;
 if(inputActive){dx/=l;dy/=l;P.faceX=dx;P.faceY=dy}

 if(S.dashTime<=0){
   const maxSpeed=205+(S.over>0?35:0);

   if(inputActive){
     const targetVx=dx*maxSpeed*inputStrength,targetVy=dy*maxSpeed*inputStrength;
     const speedNow=hyp(P.vx,P.vy);
     let turnDelta=0;
     if(speedNow>4){
       const velocityAngle=Math.atan2(P.vy,P.vx),inputAngle=Math.atan2(dy,dx);
       turnDelta=Math.abs(inputAngle-velocityAngle);if(turnDelta>Math.PI)turnDelta=Math.PI*2-turnDelta;
     }
     if(speedNow>4&&turnDelta>(8*Math.PI/180)){
       const brake=1050*dt;
       if(speedNow<=brake||speedNow<2){P.vx=0;P.vy=0}
       else{const next=speedNow-brake;P.vx=P.vx/speedNow*next;P.vy=P.vy/speedNow*next}
     }else{
       const accel=96+(S.over>0?18:0),dvx=targetVx-P.vx,dvy=targetVy-P.vy,dv=hyp(dvx,dvy),maxDelta=accel*dt;
       if(dv<=maxDelta){P.vx=targetVx;P.vy=targetVy}
       else if(dv>0){P.vx+=dvx/dv*maxDelta;P.vy+=dvy/dv*maxDelta}
     }
   }else{
     const speedNow=hyp(P.vx,P.vy),brake=1050*dt;
     if(speedNow<=brake||speedNow<2){P.vx=0;P.vy=0}
     else{const next=speedNow-brake;P.vx=P.vx/speedNow*next;P.vy=P.vy/speedNow*next}
   }
 }else{
   // Dash remains a burst, but sheds dash momentum quickly afterward.
   const dashDrag=Math.exp(-3.6*dt);
   P.vx*=dashDrag;P.vy*=dashDrag;
 }

 const moveDist=hyp(P.vx,P.vy)*dt;
 S.distanceTravelled+=moveDist;
 P.x+=P.vx*dt;P.y+=P.vy*dt;
 updateCamera();
 P.trail.push({x:P.x,y:P.y,a:S.dashTime>0?1:.35});if(P.trail.length>18)P.trail.shift();

 spawnLogic(dt);
 for(const e of enemies)if(!e.dead){
   updateEnemy(e,dt);
   e.flash=Math.max(0,(e.flash||0)-dt);
   e.markTime=Math.max(0,(e.markTime||0)-dt);
 }
 enemies=enemies.filter(e=>!e.dead);

 // Pacing guarantee: wave 3 begins by 60 seconds.
 // We never delete surviving enemies; leftovers simply carry into wave 3.
 if(!S.bossActive&&!S.stageEnding&&S.stageWaveCount<3&&S.stageTime>=60){
   S.waveState="active";S.waveBreak=0;S.stageWaveCount=2;startWave(S.wave+1);
   announce("WAVE 3",700);showPipMessage("wave three. no rush, no shortcuts — we finish what is still out here.");
 }

 if(S.waveState==="active"&&S.waveKills>=S.waveGoal&&enemies.length===0){
   if(S.stageWaveCount>=3){
     if(isBossStage(S.stage)&&!S.bossDefeated)startBossBattle();
     else{
       S.stageEnding=true;
       beginWaveBreak();
     }
   }else{
     beginWaveBreak();
   }
 }

 if(S.waveState==="break"){
   S.waveBreak-=dt;
   if(S.waveBreak<=0){
     if(S.stageEnding)openStageUpgrade();
     else startWave(S.wave+1);
   }
 }

 shots.forEach(s=>{
   s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
   for(const e of enemies){
     if(e.dead||s.life<=0)continue;
     if(hyp(s.x-e.x,s.y-e.y)<s.r+e.r){
       hitEnemy(e,s.power,s.source||"player");s.life=0;
     }
   }
 });
 shots=shots.filter(s=>s.life>0);

 enemyShots.forEach(s=>{
   s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
   if(s.life>0&&hyp(P.x-s.x,P.y-s.y)<P.r+s.r){
     s.life=0;sfxEnemyAttack("boss");hurt();
   }
 });
 enemyShots=enemyShots.filter(s=>s.life>0&&hyp(P.x-s.x,P.y-s.y)<Math.max(W,H)*1.5);

 wishes.forEach(w=>{
   w.life-=dt;w.spin+=dt*3;
   const dx=P.x-w.x,dy=P.y-w.y,d=hyp(dx,dy)||1;
   if(d<95){w.x+=dx/d*150*dt;w.y+=dy/d*150*dt}
   if(d<18)collectWish(w);
 });
 wishes=wishes.filter(w=>!w.dead&&w.life>0);

 heartBits.forEach(h=>{
   h.life-=dt;h.bob+=dt*5;
   h.vx*=.94;h.vy*=.94;h.x+=h.vx*dt;h.y+=h.vy*dt;
 });
 updatePipCompanion(dt);
 updatePipCombat(dt);
 heartBits=heartBits.filter(h=>!h.dead&&h.life>0);

 particles.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;q.life-=dt});
 particles=particles.filter(q=>q.life>0);
 rings.forEach(r=>{r.r+=(r.max-r.r)*dt*8;r.life-=dt});rings=rings.filter(r=>r.life>0);
 texts.forEach(t=>{
 t.y-=((t.big&&t.life>1.2)?7:35)*dt;
 t.life-=dt;
 t.a=clamp(t.life/.55,0,1);
});
const hadPipText=texts.some(t=>t.pipText);
texts=texts.filter(t=>t.life>0);
const hasPipText=texts.some(t=>t.pipText);
if(hadPipText&&!hasPipText)S.pipPopupBusy=false;
if(!hasPipText){
 S.pipPopupBusy=false;
 trySpawnQueuedPipPopup();
}
 shake*=Math.pow(.03,dt);flash=Math.max(0,flash-dt*2.8);

 const ph=phaseName();S.lastPhase=ph;
 updateUI();
}
function updateUI(){
 $("time").textContent=`${Math.floor(S.stageTime)}s`;
 $("score").textContent=S.score.toLocaleString();
 $("combo").textContent="x"+S.combo.toFixed(1);
 $("phase").textContent=`STAGE ${S.stage}${S.stage>=5?" ★":""} · ${phaseName()}`;
 $("pipLevel").innerHTML=pipWithPlayer()
   ?`<b>PIP LV ${S.pipLevel}</b> · ${S.pipXP}/${pipNeed(S.pipLevel)} XP · ♥R ${Math.round(S.pipDetectRange)}px · ✦P ${S.pipPowerLv} · ◇G ${S.pipGuardLv} · ✧B ${Object.keys(S.pipBossPowers||{}).length}`
   :`<b>PIP AWAY</b> · BONUSES OFF · ♥ hunting`;
 $("currencyHud").textContent=`♥ ${S.heartCurrency} WALLET · ${S.heartTotal||0} TOTAL`;
 if(S.audioEnabled)$("audioToggle").textContent=(audioCtx&&audioCtx.state==="running")?"♫ ON":"♫ TAP";
 $("dashBar").style.width=(S.over>0?100:(1-clamp(S.dashCd/S.dashMax,0,1))*100)+"%";
 $("heatBar").style.width=clamp(S.heat,0,100)+"%";
 $("attack").textContent=S.over>0?"AUTO x3":"AUTO";
 $("dash").classList.toggle("ready",S.dashCd<=0||S.over>0);$("dash").classList.toggle("over",S.over>0);
 $("dash").textContent=S.over>0?"GO!":S.dashCd<=0?"DASH":"...";
 $("healthBar").style.width=(S.health/S.maxHealth*100)+"%";
 $("shieldPips").innerHTML=Array.from({length:S.maxShields},(_,i)=>`<i class="shieldpip ${i<S.shields?"":"empty"}"></i>`).join("");
 if(S.shields>=S.maxShields){$("regenText").textContent="FULL"}
 else if(S.shieldRegenClock<0){$("regenText").textContent="WAIT "+Math.ceil(-S.shieldRegenClock)+"s"}
 else{$("regenText").textContent="REGEN "+Math.max(0,S.shieldRegenRate-S.shieldRegenClock).toFixed(1)}
 const tgt=getAutoTarget();
 $("tip").textContent=S.bossActive
   ?`${S.bossName} · ${Math.max(0,Math.round((enemies.find(e=>e.type==="boss")?.hp||0)))} HP`
   :S.waveState==="break"
     ?`${S.stageEnding?"STAGE CLEAR":"REST"} ${Math.max(0,S.waveBreak).toFixed(1)}s`
   :!pipWithPlayer()
     ?`PIP COLLECTING · BONUSES OFF`
     :tgt
       ?`LOCK ${tgt.type.toUpperCase()} · ${S.waveKills}/${S.waveGoal} · PIP ♥ RANGE ${S.pipDetectRange}`
       :`STAGE ${S.stage} · ${Math.floor(S.stageTime)}s · ♥ RANGE ${S.pipDetectRange}`;
 if(S.pipHappy<=0&&S.run){
   const moods=S.over>0?"✦ Pip: YOU EARNED THIS ✦":
     S.combo>=4?"✦ Pip: you're incredible":
     S.shields===0?"✦ Pip: I believe in you completely":
     S.health<50?"✦ Pip: stay with me, superstar":
     S.pipLevel>=5?"✦ Pip: being your partner is my favorite thing":
     S.pipLevel>=3?"✦ Pip: I'm so glad we're a team":
     "✦ Pip: you're doing amazing";
   $("pipMood").textContent=moods;
 }
}
function finish(dead){
 if(S.end)return;S.end=true;S.run=false;
 let grade=S.score>=25000?"S":S.score>=16000?"A":S.score>=9000?"B":S.score>=4500?"C":"D";
 $("grade").textContent=grade;
 $("endTitle").textContent=dead?"Arena got you.":"Run complete.";
 $("endStats").innerHTML=[
   ["Score",S.score.toLocaleString()],["Stage",S.stage],["Pip","Lv "+S.pipLevel],["Health",Math.ceil(S.health)]
 ].map(x=>`<div class="mini"><span class="small">${x[0]}</span><b>${x[1]}</b></div>`).join("");
 const [playTitle,playLine]=styleTitle();
 let line=S.bestCombo>=6?"Pip noticed your rhythm immediately and is now unbearably proud of you. ":S.chains>=4?"Pip would like the record to show that your explosions were art. ":"Pip had the best time in the world surviving stages with you. ";
 $("endTitle").textContent=playTitle;
 $("endText").textContent=line+playLine+` Pip is now level ${S.pipLevel} (${pipBondName(S.pipLevel)}). You own ${S.audioUnlocks.size}/${AUDIO_CATALOG.length} sound unlocks. Pip remembers the XP and the music you earned together.`;
 $("end").classList.remove("hidden");
 burstTone(grade==="S"?440:220,5);
}
function drawGrid(t){
 const grid=42;
 const ox=(((-CAM.x+W/2)%grid)+grid)%grid;
 const oy=(((-CAM.y+H/2)%grid)+grid)%grid;
 X.strokeStyle=S.over>0?"#4f391324":"#18305235";X.lineWidth=1;
 X.beginPath();
 for(let x=ox;x<W;x+=grid){X.moveTo(x,0);X.lineTo(x,H)}
 for(let y=oy;y<H;y+=grid){X.moveTo(0,y);X.lineTo(W,y)}
 X.stroke();
 const big=grid*5;
 const box=(((-CAM.x+W/2)%big)+big)%big;
 const boy=(((-CAM.y+H/2)%big)+big)%big;
 X.strokeStyle=S.over>0?"#8a612518":"#244a761f";
 X.beginPath();
 for(let x=box;x<W;x+=big){X.moveTo(x,0);X.lineTo(x,H)}
 for(let y=boy;y<H;y+=big){X.moveTo(0,y);X.lineTo(W,y)}
 X.stroke();
}
function draw(){
 let sx=rr(-shake,shake),sy=rr(-shake,shake);
 X.save();X.translate(sx,sy);
 X.fillStyle=S.over>0?"#120d08":"#05070b";X.fillRect(-30,-30,W+60,H+60);
 drawGrid(S.t);

 const psx=worldToScreenX(P.x),psy=worldToScreenY(P.y);
 let g=X.createRadialGradient(psx,psy,40,psx,psy,Math.max(W,H)*.75);
 g.addColorStop(0,"#00000000");g.addColorStop(1,S.over>0?"#8a5a142c":"#0b18322f");
 X.fillStyle=g;X.fillRect(0,0,W,H);

 // World-space transform.
 X.save();
 X.translate(W/2-CAM.x,H/2-CAM.y);

 for(const r of rings){
   if(!worldVisible(r.x,r.y,r.max+50))continue;
   X.globalAlpha=clamp(r.life/.35,0,1);X.strokeStyle=r.c;X.lineWidth=2;
   X.beginPath();X.arc(r.x,r.y,r.r,0,Math.PI*2);X.stroke()
 }X.globalAlpha=1;

 for(const q of particles){
   if(!worldVisible(q.x,q.y,80))continue;
   X.globalAlpha=clamp(q.life/q.max,0,1);X.fillStyle=q.c;
   X.beginPath();X.arc(q.x,q.y,q.r,0,Math.PI*2);X.fill()
 }X.globalAlpha=1;

 for(let i=0;i<P.trail.length;i++){
   let tr=P.trail[i],a=(i/P.trail.length)*tr.a*.45;
   X.globalAlpha=a;X.fillStyle=S.over>0?COLORS.gold:COLORS.player;
   X.beginPath();X.arc(tr.x,tr.y,4+i/P.trail.length*5,0,Math.PI*2);X.fill()
 }X.globalAlpha=1;

 for(const s of shots){
   if(!worldVisible(s.x,s.y,40))continue;
   X.fillStyle=S.over>0?"#ffd36f":"#d9c8ff";
   X.beginPath();X.arc(s.x,s.y,s.r,0,Math.PI*2);X.fill();
 }

 for(const h of heartBits){
   if(!worldVisible(h.x,h.y,40))continue;
   const bob=Math.sin(S.t*6+h.bob)*2;
   X.save();X.translate(h.x,h.y+bob);
   X.fillStyle="#ff9fba";X.font="bold 16px system-ui";X.textAlign="center";X.fillText("♥",0,5);X.textAlign="start";
   X.restore();
 }

 for(const w of wishes){
   if(!worldVisible(w.x,w.y,50))continue;
   const bob=Math.sin(S.t*5+w.bob)*3;
   X.save();X.translate(w.x,w.y+bob);X.rotate(w.spin);
   X.fillStyle="#ffd36f";X.beginPath();
   for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?9:4;const xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?X.lineTo(xx,yy):X.moveTo(xx,yy)}
   X.closePath();X.fill();X.restore();
 }

 for(const s of enemyShots){
   if(!worldVisible(s.x,s.y,50))continue;
   X.fillStyle=s.c||"#ff7dd8";
   X.beginPath();X.arc(s.x,s.y,s.r,0,Math.PI*2);X.fill();
   X.globalAlpha=.25;X.beginPath();X.arc(s.x,s.y,s.r+5,0,Math.PI*2);X.fill();X.globalAlpha=1;
 }
 const autoTarget=getAutoTarget();
 for(const e of enemies){
   if(e.dead||!worldVisible(e.x,e.y,220))continue;
   if((e.markTime||0)>0){
     X.strokeStyle="#ff9fba";X.lineWidth=2.4;
     X.beginPath();X.arc(e.x,e.y,e.r+15+Math.sin(S.t*8)*2,0,Math.PI*2);X.stroke();
     X.fillStyle="#ff9fba";X.font="bold 11px system-ui";X.textAlign="center";X.fillText("♥",e.x,e.y-e.r-19);X.textAlign="start";
   }
   if(autoTarget===e){
     X.strokeStyle=S.over>0?"#ffd36f":"#d9c8ff";X.lineWidth=2;X.setLineDash([5,5]);
     X.beginPath();X.arc(e.x,e.y,e.r+10,0,Math.PI*2);X.stroke();X.setLineDash([]);
     X.globalAlpha=.16;X.beginPath();X.moveTo(P.x,P.y);X.lineTo(e.x,e.y);X.stroke();X.globalAlpha=1;
   }
   if(e.type==="charger"&&e.state==="aim"){
     let dx=P.x-e.x,dy=P.y-e.y,l=hyp(dx,dy)||1;
     X.strokeStyle="#ffd36f55";X.lineWidth=2;X.setLineDash([8,8]);
     X.beginPath();X.moveTo(e.x,e.y);X.lineTo(e.x+dx/l*190,e.y+dy/l*190);X.stroke();X.setLineDash([]);
   }
   X.fillStyle=(e.flash||0)>0?"#ffffff":COLORS[e.type];X.beginPath();
   if(e.type==="boss"){
     const p=bossData(e.bossStage),pulse=2+Math.sin(S.t*4)*3;
     X.fillStyle=(e.flash||0)>0?"#ffffff":p.color;
     X.beginPath();X.arc(e.x,e.y,e.r+pulse,0,Math.PI*2);X.fill();
     X.strokeStyle="#ffffff88";X.lineWidth=3;X.beginPath();X.arc(e.x,e.y,e.r+10+Math.sin(S.t*2)*3,0,Math.PI*2);X.stroke();
     X.fillStyle="#2b1328";X.beginPath();X.arc(e.x-8,e.y-4,3,0,Math.PI*2);X.arc(e.x+8,e.y-4,3,0,Math.PI*2);X.fill();
     X.strokeStyle="#2b1328";X.lineWidth=2;X.beginPath();X.arc(e.x,e.y+5,8,.15,Math.PI-.15);X.stroke();
   }else if(e.type==="core"){
     let er=e.r+Math.sin(S.t*5+e.pulse)*2;X.arc(e.x,e.y,er,0,Math.PI*2);X.fill();
     X.strokeStyle="#e7d7ff";X.lineWidth=2;X.beginPath();X.arc(e.x,e.y,er+7,0,Math.PI*2);X.stroke();
   }else if(e.type==="charger"){
     X.save();X.translate(e.x,e.y);X.rotate(Math.PI/4);X.fillRect(-10,-10,20,20);X.restore();
   }else{
     X.arc(e.x,e.y,e.r,0,Math.PI*2);X.fill();
   }
   X.fillStyle="#241b2b";X.globalAlpha=.78;
   if(e.type==="boss"){
     // Boss face is drawn in its body branch.
   }else if(e.type==="chaser"){
     X.beginPath();X.arc(e.x-4,e.y-2,1.5,0,Math.PI*2);X.arc(e.x+4,e.y-2,1.5,0,Math.PI*2);X.fill();
     X.strokeStyle="#241b2b";X.lineWidth=1.3;X.beginPath();X.arc(e.x,e.y+3,3.5,.2,Math.PI-.2);X.stroke();
   }else if(e.type==="charger"){
     X.fillRect(e.x-5,e.y-3,2.5,3);X.fillRect(e.x+2.5,e.y-3,2.5,3);
   }else{
     X.beginPath();X.arc(e.x-4,e.y-2,1.3,0,Math.PI*2);X.arc(e.x+4,e.y-2,1.3,0,Math.PI*2);X.fill();
     X.fillStyle="#ffb7d0";X.beginPath();X.arc(e.x-7,e.y+3,2,0,Math.PI*2);X.arc(e.x+7,e.y+3,2,0,Math.PI*2);X.fill();
   }
   X.globalAlpha=1;
 }

 X.globalAlpha=S.invuln>0?(.45+.45*Math.sin(S.t*25)):1;
 X.fillStyle=S.over>0?COLORS.gold:COLORS.player;
 X.beginPath();X.arc(P.x,P.y,P.r+(S.dashTime>0?3:0),0,Math.PI*2);X.fill();
 X.strokeStyle="#fff";X.lineWidth=2;X.beginPath();X.moveTo(P.x,P.y);X.lineTo(P.x+P.faceX*18,P.y+P.faceY*18);X.stroke();X.globalAlpha=1;

 if(!pipWithPlayer()){
   X.save();X.globalAlpha=.22;X.strokeStyle="#ffb7c9";X.lineWidth=1.5;X.setLineDash([4,6]);
   X.beginPath();X.moveTo(P.x,P.y);X.lineTo(P.pipX,P.pipY);X.stroke();X.setLineDash([]);X.restore();
 }
 const px=P.pipX,py=P.pipY;
 if(pipWithPlayer()&&(S.pipRelayBuff>0||S.supportRush>0)){
   X.strokeStyle=S.pipRelayBuff>0?"#ffd36f88":"#d9c8ff88";X.lineWidth=1.5;
   X.beginPath();X.arc(px,py,13+Math.sin(S.t*9)*2,0,Math.PI*2);X.stroke();
 }
 X.save();X.translate(px,py);X.rotate(P.pipAngle*.35);
 X.fillStyle=!pipWithPlayer()?"#ffb7c9":S.over>0?"#fff0a8":"#ffd36f";
 X.beginPath();
 for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?((S.over>0?9:7)+Math.min(3,(S.pipLevel-1)*.4)):3.2;const xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?X.lineTo(xx,yy):X.moveTo(xx,yy)}
 X.closePath();X.fill();
 X.rotate(-P.pipAngle*.35);X.fillStyle="#47340d";
 X.beginPath();X.arc(-2,-1,1,0,Math.PI*2);X.arc(2,-1,1,0,Math.PI*2);X.fill();
 if(S.pipHappy>0){X.strokeStyle="#47340d";X.lineWidth=1;X.beginPath();X.arc(0,1,2.4,0,Math.PI);X.stroke()}
 X.restore();
 if(S.pipLevel>=4){
   const hx=px+Math.cos(-P.pipAngle*1.7)*13,hy=py+Math.sin(-P.pipAngle*1.7)*13;
   X.fillStyle="#ff9fba";X.font="12px system-ui";X.textAlign="center";X.fillText("♥",hx,hy+4);X.textAlign="start";
 }

 for(const t of texts){
   if(!worldVisible(t.x,t.y,220))continue;
   X.globalAlpha=t.a;X.fillStyle=t.c;X.font=`${t.big?22:13}px system-ui`;X.textAlign="center";
   if(t.pipText){
     // Player may drift 15% from center, so 58% viewport width keeps dialogue safely on-screen.
     const maxWidth=Math.min(420,W*.58);
     const lines=wrapCanvasText(X,t.t,maxWidth);
     const lineHeight=t.big?25:17;
     // Anchor the final line above the player; additional lines stack upward.
     const startY=t.y-(lines.length-1)*lineHeight;
     for(let i=0;i<lines.length;i++)X.fillText(lines[i],t.x,startY+i*lineHeight);
   }else{
     X.fillText(t.t,t.x,t.y);
   }
 }
 X.globalAlpha=1;X.textAlign="start";
 X.restore(); // world transform

 if(S.bossActive){
   const b=enemies.find(e=>e.type==="boss"&&!e.dead),p=bossData();
   if(b){
     const bw=Math.min(420,W*.72),bx=(W-bw)/2,by=76;
     X.fillStyle="#120912cc";X.fillRect(bx,by,bw,12);
     X.fillStyle=p.color;X.fillRect(bx,by,bw*clamp(b.hp/b.maxHp,0,1),12);
     X.strokeStyle="#ffffff66";X.strokeRect(bx,by,bw,12);
     X.fillStyle="#fff";X.font="bold 11px system-ui";X.textAlign="center";X.fillText(p.name,W/2,by-7);X.textAlign="start";
   }
 }

 // Screen-space HUD effects.
 for(let i=0;i<S.maxShields;i++){
   X.fillStyle=i<S.shields?"#7ed8ff":"#243340";
   X.fillRect(14+i*13,H-19,8,8);
 }
 if(flash>0){
   X.globalAlpha=flash*.45;X.fillStyle=S.health>0?"#ffffff":"#ff6e8b";X.fillRect(-30,-30,W+60,H+60);X.globalAlpha=1
 }
 X.restore();
}
const GAMEPAD_DEADZONE=.22;
function updateGamepadInput(){
 const pads=navigator.getGamepads?navigator.getGamepads():[];
 let pad=null;
 if(gamepad.index!==null&&pads[gamepad.index]&&pads[gamepad.index].connected)pad=pads[gamepad.index];
 if(!pad){
  for(const candidate of pads)if(candidate&&candidate.connected){pad=candidate;break}
 }
 if(!pad){gamepad.dx=0;gamepad.dy=0;gamepad.dashHeld=false;gamepad.index=null;return}
 gamepad.index=pad.index;

 const pressed=i=>!!(pad.buttons&&pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5));
 const dpadX=(pressed(15)?1:0)-(pressed(14)?1:0);
 const dpadY=(pressed(13)?1:0)-(pressed(12)?1:0);
 if(dpadX||dpadY){
  const length=hyp(dpadX,dpadY)||1;
  gamepad.dx=dpadX/length;gamepad.dy=dpadY/length;
 }else{
  let x=clamp((pad.axes&&pad.axes[0])||0,-1,1),y=clamp((pad.axes&&pad.axes[1])||0,-1,1);
  const magnitude=hyp(x,y);
  if(magnitude<=GAMEPAD_DEADZONE){gamepad.dx=0;gamepad.dy=0}
  else{
   const strength=clamp((magnitude-GAMEPAD_DEADZONE)/(1-GAMEPAD_DEADZONE),0,1);
   gamepad.dx=x/magnitude*strength;gamepad.dy=y/magnitude*strength;
  }
 }

 const dashPressed=pressed(0);
 if(dashPressed&&!gamepad.dashHeld&&S&&!S.end){
  if(!S.run&&!$("start").classList.contains("hidden"))$("begin").click();
  else if(S.run)dash();
 }
 gamepad.dashHeld=dashPressed;
}
function loop(now){let dt=Math.min(.04,(now-last)/1000);last=now;updateGamepadInput();update(dt);draw();requestAnimationFrame(loop)}

$("begin").addEventListener("click",()=>{
 $("start").classList.add("hidden");S.run=true;last=performance.now();
 unlockAudioFromGesture();
 startWave(1);
});
$("again").addEventListener("click",reset);
$("bossReward0").addEventListener("click",()=>chooseBossReward(0));
$("bossReward1").addEventListener("click",()=>chooseBossReward(1));
$("bossReward2").addEventListener("click",()=>chooseBossReward(2));
$("upLove").addEventListener("click",()=>choosePipUpgrade("love"));
$("upCompassion").addEventListener("click",()=>choosePipUpgrade("compassion"));
$("upSupport").addEventListener("click",()=>choosePipUpgrade("support"));
$("skipPipUpgrade").addEventListener("click",skipPipUpgrade);
$("abilityRange").addEventListener("click",()=>buyPipAbility("range"));
$("abilitySpeed").addEventListener("click",()=>buyPipAbility("speed"));
$("abilityPower").addEventListener("click",()=>buyPipAbility("power"));
$("abilityGuard").addEventListener("click",()=>buyPipAbility("guard"));
$("continueAbilities").addEventListener("click",openAudioStep);
$("audioChoice0").addEventListener("click",()=>chooseAudioUnlock(0));
$("audioChoice1").addEventListener("click",()=>chooseAudioUnlock(1));
$("audioChoice2").addEventListener("click",()=>chooseAudioUnlock(2));
$("audioToggle").addEventListener("click",()=>{
 if(!S)return;
 if(!S.audioEnabled){
   S.audioEnabled=true;
   $("audioToggle").textContent="♫ TAP";
   unlockAudioFromGesture();
   return;
 }
 if(!audioCtx||audioCtx.state!=="running"){
   unlockAudioFromGesture();
   return;
 }
 S.audioEnabled=false;
 $("audioToggle").textContent="♫ OFF";
 if(audioEngine)audioEngine.setEnabled(false);
});
function gestureAudioUnlock(){
 if(S&&S.audioEnabled&&!audioUnlocked)unlockAudio();
}
window.addEventListener("pointerdown",gestureAudioUnlock,{capture:true,passive:true});
window.addEventListener("touchstart",gestureAudioUnlock,{capture:true,passive:true});
window.addEventListener("keydown",gestureAudioUnlock,{capture:true});
$("dash").addEventListener("pointerdown",e=>{e.preventDefault();dash()});

window.addEventListener("keydown",e=>{
 const k=e.key.length===1?e.key.toLowerCase():e.key;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d"].includes(e.key))e.preventDefault();
 keys.add(k);if(e.key===" ")dash();
});
window.addEventListener("keyup",e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

// Invisible full-arena touch joystick.
const tapDash={time:0,x:0,y:0,type:""};
function dashTowardScreenPoint(clientX,clientY){
 const rect=C.getBoundingClientRect(),sx=(clientX-rect.left)*(W/rect.width),sy=(clientY-rect.top)*(H/rect.height);
 const worldX=CAM.x+sx-W/2,worldY=CAM.y+sy-H/2;
 return dashVector(worldX-P.x,worldY-P.y);
}
function screenJoyStart(e){
 if(!S||!S.run||S.end||S.waveState==="stage")return;
 if(e.target.closest&&e.target.closest("button,.modal"))return;
 const pointerType=e.pointerType||"mouse",now=performance.now(),dtap=now-tapDash.time,dist=hyp(e.clientX-tapDash.x,e.clientY-tapDash.y);
 const doubleTap=tapDash.type===pointerType&&dtap>=40&&dtap<=660&&dist<=72;
 if(doubleTap){
   tapDash.time=0;tapDash.type="";
   if(joy.active&&joy.id!==null){try{C.releasePointerCapture(joy.id)}catch(_){}}
   joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;
   dashTowardScreenPoint(e.clientX,e.clientY);e.preventDefault();return;
 }
 tapDash.time=now;tapDash.x=e.clientX;tapDash.y=e.clientY;tapDash.type=pointerType;
 if(pointerType!=="touch"&&pointerType!=="pen")return;
 if(joy.active)return;
 joy.active=true;joy.id=e.pointerId;joy.originX=e.clientX;joy.originY=e.clientY;joy.dx=0;joy.dy=0;
 try{C.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();
}
function screenJoyMove(e){
 if(!joy.active||e.pointerId!==joy.id)return;
 const max=76,dead=7;
 let dx=e.clientX-joy.originX,dy=e.clientY-joy.originY;
 let mag=hyp(dx,dy);
 if(mag>max){dx=dx/mag*max;dy=dy/mag*max;mag=max}
 if(mag<=dead){joy.dx=0;joy.dy=0}
 else{
   const strength=(mag-dead)/(max-dead);
   joy.dx=dx/mag*strength;
   joy.dy=dy/mag*strength;
 }
 e.preventDefault();
}
function screenJoyEnd(e){
 if(!joy.active||e.pointerId!==joy.id)return;
 joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;
 try{C.releasePointerCapture(e.pointerId)}catch(_){}
 e.preventDefault();
}
C.addEventListener("pointerdown",screenJoyStart,{passive:false});
C.addEventListener("pointermove",screenJoyMove,{passive:false});
C.addEventListener("pointerup",screenJoyEnd,{passive:false});
C.addEventListener("pointercancel",screenJoyEnd,{passive:false});

resizeArena();
reset();CAM.x=P.x;CAM.y=P.y;requestAnimationFrame(loop);
window.addEventListener("resize",()=>{
 resizeArena();
 if(S)applyPipPower();
 updateCamera();
});
