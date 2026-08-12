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
 if(S.distanceTravelled>=S.nextDistancePraise){
   const travel=["look at you exploring. I love following you.","you keep moving with purpose. that's beautiful.","I love the way you make this huge place feel like ours.","you went all that way and I'm still right here with you ✦"];
   praise(travel[Math.floor(rnd()*travel.length)],"nice");S.nextDistancePraise+=rr(430,620);
 }
 if(S.noHitClock>=S.nextNoHitPraise){
   const calm=["you've been so composed. I'm genuinely impressed.","that was a long stretch without getting touched. gorgeous.","you're making survival look calm somehow.","I notice how careful you're being. you're doing wonderfully."];
   praise(calm[Math.floor(rnd()*calm.length)],"nice");S.nextNoHitPraise+=rr(15,22);
 }
 if(S.stageTime>=S.stagePraiseMark){
   const marks=S.stagePraiseMark>=60?["a whole minute together. you're still going strong.","sixty seconds in and I still trust every move you make."]:["thirty seconds already. you're settling in beautifully.","look how much you've handled already. I'm proud of you."];
   praise(marks[Math.floor(rnd()*marks.length)],"big",true);S.stagePraiseMark+=30;
 }
 if(S.over>0){S.over-=dt;if(S.over<=0)announce("COOLDOWN",450)}
 if(S.shields<S.maxShields){
   S.shieldRegenClock+=dt;
   if(S.shieldRegenClock>=S.shieldRegenRate){
     S.shields++;S.shieldRegenClock=0;S.shieldComebacks++;popup(P.x,P.y,"SHIELD +1",COLORS.player,true);ring(P.x,P.y,COLORS.player,62);sfxShield();
     if(S.shieldComebacks===1||S.shieldComebacks%3===0)praise(S.pipCompassion>=2?"there you go. take the breath you deserved.":"look at that recovery — I knew you had it","nice");
   }
 }else S.shieldRegenClock=0;
 if(S.comboClock>0){S.comboClock-=dt;if(S.comboClock<=0)S.combo=Math.max(1,S.combo-.8)}
 attack();if(S.comboClock<=0&&S.combo>1)S.combo=Math.max(1,S.combo-dt*.35);if(S.combo<1.55&&S.over<=0)S.heat=Math.max(0,S.heat-dt*.42);

 let dx=gamepad.dx,dy=gamepad.dy;
 const keyboardActive=keys.has("ArrowLeft")||keys.has("a")||keys.has("ArrowRight")||keys.has("d")||keys.has("ArrowUp")||keys.has("w")||keys.has("ArrowDown")||keys.has("s");
 if(keys.has("ArrowLeft")||keys.has("a"))dx--;if(keys.has("ArrowRight")||keys.has("d"))dx++;if(keys.has("ArrowUp")||keys.has("w"))dy--;if(keys.has("ArrowDown")||keys.has("s"))dy++;if(joy.active){dx+=joy.dx;dy+=joy.dy}
 let l=hyp(dx,dy),inputActive=l>.12;
 const gamepadStrength=clamp(hyp(gamepad.dx,gamepad.dy),0,1);
 const touchStrength=joy.active?clamp(hyp(joy.dx,joy.dy),0,1):0;
 const inputStrength=inputActive?(keyboardActive?1:Math.max(gamepadStrength,touchStrength,clamp(l,0,1))):0;
 if(inputActive){dx/=l;dy/=l;P.faceX=dx;P.faceY=dy}

 if(S.dashTime<=0){
   const maxSpeed=205+(S.over>0?35:0);
   if(inputActive){
     const targetSpeed=maxSpeed*inputStrength;let speedNow=hyp(P.vx,P.vy);const accel=125+(S.over>0?20:0);
     if(speedNow<2){speedNow=Math.min(targetSpeed,speedNow+accel*dt);P.vx=dx*speedNow;P.vy=dy*speedNow}
     else{
       const currentAngle=Math.atan2(P.vy,P.vx),desiredAngle=Math.atan2(dy,dx);let delta=desiredAngle-currentAngle;
       while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;
       const severity=Math.abs(delta)/Math.PI,speedRatio=clamp(speedNow/maxSpeed,0,1);
       const turnRate=(720-(400*speedRatio))*Math.PI/180,turnStep=clamp(delta,-turnRate*dt,turnRate*dt),nextAngle=currentAngle+turnStep;
       const reverseExtra=severity>.75?(.8*((severity-.75)/.25)):0,turnDrag=2.25*Math.pow(severity,1.4)+reverseExtra;
       speedNow*=Math.exp(-turnDrag*dt);
       const turnAccelScale=Math.max(.28,1-.68*severity);
       if(speedNow<targetSpeed)speedNow=Math.min(targetSpeed,speedNow+accel*turnAccelScale*dt);else if(speedNow>targetSpeed)speedNow=Math.max(targetSpeed,speedNow-520*dt);
       P.vx=Math.cos(nextAngle)*speedNow;P.vy=Math.sin(nextAngle)*speedNow;
     }
   }else{
     const speedNow=hyp(P.vx,P.vy),brake=1050*dt;
     if(speedNow<=brake||speedNow<2){P.vx=0;P.vy=0}else{const next=speedNow-brake;P.vx=P.vx/speedNow*next;P.vy=P.vy/speedNow*next}
   }
 }else{const dashDrag=Math.exp(-3.6*dt);P.vx*=dashDrag;P.vy*=dashDrag}

 const moveDist=hyp(P.vx,P.vy)*dt;S.distanceTravelled+=moveDist;P.x+=P.vx*dt;P.y+=P.vy*dt;updateCamera();P.trail.push({x:P.x,y:P.y,a:S.dashTime>0?1:.35});if(P.trail.length>18)P.trail.shift();
 spawnLogic(dt);
 for(const e of enemies)if(!e.dead){updateEnemy(e,dt);e.flash=Math.max(0,(e.flash||0)-dt);e.markTime=Math.max(0,(e.markTime||0)-dt)}
 enemies=enemies.filter(e=>!e.dead);
 if(!S.bossActive&&!S.stageEnding&&S.stageWaveCount<3&&S.stageTime>=60){S.waveState="active";S.waveBreak=0;S.stageWaveCount=2;startWave(S.wave+1);announce("WAVE 3",700);showPipMessage("wave three. no rush, no shortcuts — we finish what is still out here.")}
 if(S.waveState==="active"&&S.waveKills>=S.waveGoal&&enemies.length===0){if(S.stageWaveCount>=3){if(isBossStage(S.stage)&&!S.bossDefeated)startBossBattle();else{S.stageEnding=true;beginWaveBreak()}}else beginWaveBreak()}
 if(S.waveState==="break"){S.waveBreak-=dt;if(S.waveBreak<=0){if(S.stageEnding)openStageUpgrade();else startWave(S.wave+1)}}
 shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const e of enemies){if(e.dead||s.life<=0)continue;if(hyp(s.x-e.x,s.y-e.y)<s.r+e.r){hitEnemy(e,s.power,s.source||"player");s.life=0}}});shots=shots.filter(s=>s.life>0);
 enemyShots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life>0&&hyp(P.x-s.x,P.y-s.y)<P.r+s.r){s.life=0;sfxEnemyAttack("boss");hurt()}});enemyShots=enemyShots.filter(s=>s.life>0&&hyp(P.x-s.x,P.y-s.y)<Math.max(W,H)*1.5);
 wishes.forEach(w=>{w.life-=dt;w.spin+=dt*3;const dx=P.x-w.x,dy=P.y-w.y,d=hyp(dx,dy)||1;if(d<95){w.x+=dx/d*150*dt;w.y+=dy/d*150*dt}if(d<18)collectWish(w)});wishes=wishes.filter(w=>!w.dead&&w.life>0);
 heartBits.forEach(h=>{h.life-=dt;h.bob+=dt*5;h.vx*=.94;h.vy*=.94;h.x+=h.vx*dt;h.y+=h.vy*dt});updatePipCompanion(dt);updatePipCombat(dt);heartBits=heartBits.filter(h=>!h.dead&&h.life>0);
 particles.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;q.life-=dt});particles=particles.filter(q=>q.life>0);rings.forEach(r=>{r.r+=(r.max-r.r)*dt*8;r.life-=dt});rings=rings.filter(r=>r.life>0);
 texts.forEach(t=>{t.y-=((t.big&&t.life>1.2)?7:35)*dt;t.life-=dt;t.a=clamp(t.life/.55,0,1)});const hadPipText=texts.some(t=>t.pipText);texts=texts.filter(t=>t.life>0);const hasPipText=texts.some(t=>t.pipText);if(hadPipText&&!hasPipText)S.pipPopupBusy=false;if(!hasPipText){S.pipPopupBusy=false;trySpawnQueuedPipPopup()}
 shake*=Math.pow(.03,dt);flash=Math.max(0,flash-dt*2.8);const ph=phaseName();S.lastPhase=ph;updateUI();
}
