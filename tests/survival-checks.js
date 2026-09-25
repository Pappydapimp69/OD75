function runSurvivalChecksB63(){
  const results=[],saved={...settingsB61};
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)},near=(a,b)=>Math.abs(a-b)<1e-6;
  const test=(name,fn)=>{try{applySettingsB61(B61_DEFAULTS);transportFixtureB60();fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test('B99 opening stages spawn only chasers at base scale',()=>{
    const width=W,height=H;try{W=1000;H=600;
    for(const stage of [1,2,3]){S.stage=stage;S.starsTotal=999;S.runHearts=999;S.bossCount=0;S.b99=null;
      for(let i=0;i<60;i++)assert(chooseSpawn()==='chaser','opening stage spawned '+chooseSpawn());
      assert(enemyCap()===10,'landscape cap not 10');H=1200;W=600;assert(enemyCap()===8,'portrait cap not 8');W=1000;H=600;
      enemies=[];const e=spawnEnemy('chaser');assert(e.hp===2&&e.b99.speedMul>=1&&e.b99.speedMul<=1.1,'opening chaser scaled');
      enemies=[];startBossBattle();assert(S.bossMaxHp===72,'opening boss scaled: '+S.bossMaxHp);
    }}finally{W=width;H=height}
  });
  test('B99 stage-end hearts set the heart level that widens speed and health ranges',()=>{
    reset();transportFixtureB60();S.stage=3;S.runHearts=45;S.stageEnding=false;advanceToNextStage();
    assert(S.stage===4&&stateB99().heartLevel===2,'heart level not taken at stage end');
    S.runHearts=400;assert(stateB99().heartLevel===2,'heart level moved mid-stage');
    const r0=traitRangesB99(0),r2=traitRangesB99(2),r12=traitRangesB99(12);
    assert(r2.speed[0]>r0.speed[0]&&r2.speed[1]-r2.speed[0]>r0.speed[1]-r0.speed[0],'speed range did not rise and widen');
    assert(r2.hp[1]>r2.hp[0]&&r12.hp[1]<.7*12,'health range wrong or growth not softened past level 8');
    S.b99.heartLevel=6;const r=traitRangesB99();
    for(let i=0;i<150;i++){enemies=[];const e=spawnEnemy('chaser');
      assert(e.b99.speedMul>=r.speed[0]-1e-9&&e.b99.speedMul<=r.speed[1]+1e-9,'speed roll outside range');
      assert(e.hp>=Math.round(2+r.hp[0])&&e.hp<=Math.round(2+r.hp[1]),'health roll outside range')}
  });
  test('Stage 4 discounts only opening hearts once, then counts new hearts normally',()=>{
    S.stage=3;S.wave=9;S.runHearts=60;S.stageEnding=false;advanceToNextStage();
    assert(S.stage===4&&S.earlyRunHearts===60&&difficultyHeartsB63()===20&&difficultyStageB63()===2,'entry discount wrong');
    assert(S.waveGoal===waveGoalFor(S.wave),'first wave used undiscounted hearts');
    S.runHearts+=20;assert(difficultyHeartsB63()===40&&difficultyStageB63()===3,'new hearts discounted');
    advanceToNextStage();assert(S.earlyRunHearts===60&&difficultyHeartsB63()===40,'discount repeated next stage');
    S.stage=11;assert(difficultyStageB63()===11,'discount leaked into legacy scaling');
    reset();assert(S.earlyRunHearts===0&&S.runHearts===0,'discount survived new run');
  });
  test('B99 aggression minimum rises by one to three every three stages with no cap',()=>{
    reset();transportFixtureB60();S.stage=1;
    for(let i=0;i<30;i++){const before=stateB99().aggMin;S.stageEnding=false;advanceToNextStage();const d=stateB99().aggMin-before;
      if((S.stage-1)%3===0)assert(d>=1&&d<=3,'stage '+S.stage+' bump '+d);else assert(d===0,'stage '+S.stage+' bumped off-cycle')}
    assert(stateB99().aggMin>=11,'aggression capped');const [lo,hi]=aggressionRangeB99();assert(hi===lo+3,'range not four levels wide');
    assert(aggressionEffectB99(1)===0&&aggressionEffectB99(40)<1&&aggressionEffectB99(10)>aggressionEffectB99(4),'effect not slow and diminishing');
  });
  test('B99 the stage after a boss is a breather that defers the aggression bump',()=>{
    reset();transportFixtureB60();S.stage=3;S.runHearts=100;S.bossCount=1;S.stageEnding=false;advanceToNextStage();
    assert(S.stage===4&&stateB99().heartLevel===0&&stateB99().aggMin===1&&stateB99().bumpPending,'breather did not hold');
    S.stageEnding=false;advanceToNextStage();assert(stateB99().heartLevel===5&&stateB99().aggMin>1&&!stateB99().bumpPending,'deferred bump or hearts not applied');
  });
  test('Run hearts count only banked pickups, survive spending and stages, and reset independently of lifetime',()=>{
    const h=heartFixtureB60();heartBits=[h];gatherHeartB60(h);assert(S.runHearts===0,'cargo counted early');
    deliverCargoB60(false);assert(S.runHearts===1,'delivery not counted');collectHeartBit(h);assert(S.runHearts===1,'duplicate counted');
    S.heartCurrency=0;S.stage=4;assert(S.runHearts===1,'spending or stage reset counter');
    const total=S.heartTotal;reset();assert(S.runHearts===0&&S.heartTotal===total,'run reset changed lifetime or retained run hearts');
  });
  test('Compassion extends actual away duration and removes its shield-delay reduction',()=>{
    for(const lv of [0,1,4]){
      transportFixtureB60();S.pipCompassion=lv;S.pipGuardLv=2;applyPipPower();P.pipX=10000;S.pipState='return';
      assert(heartSecondsB63()===1+lv*.5&&near(S.shieldRegenDelay,3.6),'duration or Guard delay wrong');
      stepB59(.5);assert(near(pipBondB51(),1-.5/(1+lv*.5)),'actual decay ignored Compassion');
      stepB59(1+lv*.5);assert(pipBondB51()===0&&near(carrySpeedB60(),285*.9),'empty meter penalty missing');
    }
  });
  test('Shield loss immediately drops cargo without banking and starts a physical emergency return',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState='collect';transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];
    const oldX=P.pipX;hurt();
    assert(S.shields===1&&S.pipState==='return'&&transportB60().cargo.length===0&&heartBits.length===2,'emergency failed');
    assert(P.pipX===oldX&&S.runHearts===0&&S.heartCurrency===0,'recall teleported or banked');
    assert(heartBits.every(h=>!h.b60Carried&&!h.dead&&h.life===10),'dropped hearts not collectible');
    const dropped=[...heartBits];updatePipCompanion(.02);assert(P.pipX<oldX&&heartBits.length===2,'return not physical or drops duplicated');
    S.shields=2;S.pipState='collect';assert(gatherHeartB60(dropped[0]),'dropped heart could not be recovered');deliverCargoB60(false);assert(S.runHearts===1,'recovered heart was not banked exactly once');
  });
  test('Emergency support overrides Rally and refuses cargo or magnet pickups until two shields',()=>{
    S.pipSupport=2;S.pipLove=2;S.shields=1;S.b51PipBond=0;partnershipB59().rallyReturn=true;
    const h=heartFixtureB60();heartBits=[h];S.over=3;S.overType='pip';
    updatePipCompanion(.02);assert(S.pipState==='return'&&!partnershipB59().rallyReturn,'Rally overrode emergency');
    assert(!gatherHeartB60(h),'emergency gathered');const x=h.x;updateAscendantHeartMagnetB26(.1);assert(h.x===x,'emergency magnet moved cargo');
    P.pipX=P.x+20;P.pipY=P.y;updatePipCompanion(.02);assert(S.pipState==='orbit','did not reunite');
    heartBits=[heartFixtureB60(P.x+5,P.y)];transportB60().rest=0;updatePipCompanion(.02);assert(S.pipState==='orbit'&&!S.pipTarget,'left while vulnerable');
    S.shields=2;assert(findPipHeartTarget()!==null,'did not release collection after recovery');
  });
  test('Emergency return fires learned Pip weapons at orbit strength without restoring bond or player bonuses',()=>{
    S.pipSupport=1;S.shields=1;S.pipState='return';S.b51PipBond=0;S.pipShotCd=0;enemies=[{type:'chaser',x:200,y:0,r:12,hp:999,speed:60,age:0,dead:false}];shots=[];
    updatePipCombat(.02);assert(shots.length===0,'granted an unlearned attack');
    S.pipBossPowers.starshot=1;updatePipCombat(.02);
    assert(shots.some(s=>s.source==='pip'&&near(s.power,.86)),'return attack missing or bond-scaled');
    assert(pipBondB51()===0&&!pipWithPlayer()&&near(carrySpeedB60(),256.5),'support restored bond or removed loneliness');
  });
  test('Unlearned Support and two healthy shields preserve cargo gathering',()=>{
    for(const [support,shields] of [[0,1],[1,2]]){
      transportFixtureB60();S.pipSupport=support;S.shields=shields;transportB60().cargo=[heartFixtureB60()];
      const h=heartFixtureB60(160);heartBits=[h];S.pipTarget=h;updatePipCompanion(.02);
      assert(transportB60().cargo.length>=1&&S.runHearts===0,'healthy/unlearned support dropped cargo');
    }
  });
  test('Pause freezes emergency return and describes both changed traits and run pressure',()=>{
    S.pipSupport=1;S.pipCompassion=2;S.shields=1;S.b51PipBond=.5;openAscendedPauseB39();
    const state=JSON.stringify([P.pipX,S.t,pipBondB51(),S.runHearts]);stepB59(.5);
    assert(JSON.stringify([P.pipX,S.t,pipBondB51(),S.runHearts])===state,'paused emergency changed state');
    assert($('b39CoreList').textContent.includes('2.0 seconds away')&&emotionalNextText('compassion').includes('2.0 → 2.5')&&emotionalNextText('support').includes('Below 2 shields'),'copy stale');
    closeAscendedPauseB39();
  });
  test('Difficulty HUD reports opening, heart-tier progress, max and legacy bands',()=>{
    S.stage=2;updateUI();assert($('difficultyHudB65').textContent==='DIFF · OPENING','opening HUD wrong');
    S.stage=4;S.earlyRunHearts=30;S.runHearts=30;updateUI();assert($('difficultyHudB65').textContent==='DIFF · ♥ T1 · 10/20','discount HUD wrong');
    S.runHearts=40;updateUI();assert($('difficultyHudB65').textContent==='DIFF · ♥ T2 · 0/20'&&$('difficultyHudB65').getAttribute('aria-label').includes('toward tier 3'),'boundary HUD wrong');
    S.runHearts=220;updateUI();assert($('difficultyHudB65').textContent==='DIFF · ♥ T10 MAX','max HUD wrong');
    S.stage=11;updateUI();assert($('difficultyHudB65').textContent==='DIFF · STAGE SCALE','legacy HUD wrong');
    reset();assert($('difficultyHudB65').textContent==='DIFF · OPENING','reset HUD stale');
  });
  test('Supportive emergency announces once, labels return and guard, then clears at two shields',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState='collect';transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];
    const beforePopup=popup,seen=[];popup=(...args)=>seen.push(args);
    try{
      hurt();updateUI();assert(!seen.some(args=>String(args[2]).includes('CARGO DROPPED'))&&seen.some(args=>String(args[2]).includes('SHIELD BROKE'))&&S.b66EmergencyActive,'activation cues wrong');
      assert($('tip').textContent.includes('PIP RETURNING')&&$('tip').textContent.includes('SHIELDS 1/2'),'return label missing');
      const count=seen.length;update(.02);update(.02);assert(seen.length===count,'announcement repeated');
      P.pipX=P.x+10;P.pipY=P.y;update(.02);updateUI();assert($('tip').textContent.includes('PIP GUARDING'),'guard label missing');
      S.shields=2;update(.02);updateUI();assert(!S.b66EmergencyActive&&!$('tip').textContent.includes('PIP GUARDING'),'cue did not clear');
    }finally{popup=beforePopup}
    reset();assert(!S.b66EmergencyActive,'cue survived reset');
  });
  test('Emergency-dropped cargo survives indefinitely until two shields, then expires normally',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState='collect';P.pipX=2000;transportB60().cargo=[heartFixtureB60(2000),heartFixtureB60(2000)];
    hurt();S.shieldRegenClock=-999;assert(heartBits.every(h=>h.b67SafeDrop)&&safeCargoCountB67()===2,'cargo not safeguarded');
    updateUI();assert($('tip').textContent.includes('CARGO 2 SAFE'),'safe cargo cue missing');
    stepB59(18);assert(heartBits.length===2&&heartBits.every(h=>h.life>9.9),'cargo expired during emergency');
    const life=heartBits[0].life;openAscendedPauseB39();stepB59(2);assert(heartBits[0].life===life,'pause changed safe lifetime');closeAscendedPauseB39();
    S.shields=2;S.pipSupport=0;P.pipX=P.x;heartBits.forEach(h=>{h.x=10000;h.y=0});stepB59(9.8);
    assert(heartBits.length===2&&heartBits[0].life<.3,'normal countdown did not resume');stepB59(.3);assert(heartBits.length===0,'released cargo did not expire');
  });
  test('Ordinary hearts retain normal lifetime and recovered safe cargo banks once',()=>{
    const ordinary=heartFixtureB60();ordinary.life=.2;heartBits=[ordinary];stepB59(.3);assert(!heartBits.includes(ordinary),'ordinary heart was protected');
    transportFixtureB60();S.pipSupport=1;S.shields=2;S.invuln=0;transportB60().cargo=[heartFixtureB60()];hurt();
    const dropped=heartBits[0];S.shields=2;S.pipSupport=0;S.pipState='collect';assert(gatherHeartB60(dropped),'safe cargo not recoverable');deliverCargoB60(false);
    assert(S.runHearts===1&&S.heartCurrency===1&&dropped.dead,'recovered cargo did not bank once');
  });
  test('Emergency drops form stable, separate recovery markers that update and disappear',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];hurt();
    const first=cargoGroupsB68();assert(first.length===1&&first[0].count===2&&first[0].id===1,'first marker wrong');
    const group=first[0].id,heart=heartBits[0];heart.x+=20;const moved=cargoGroupsB68()[0];assert(moved.id===group&&moved.x!==first[0].x,'centroid stale');
    S.shields=2;S.pipState='collect';assert(gatherHeartB60(heart)&&cargoGroupsB68()[0].count===1,'collection did not update marker');
    deliverCargoB60(false);S.shields=1;S.pipState='collect';transportB60().cargo=[heartFixtureB60()];dropCargoB63();
    assert(cargoGroupsB68().length===2&&new Set(cargoGroupsB68().map(g=>g.id)).size===2,'drop groups merged');
    heartBits.forEach(h=>h.dead=true);assert(cargoGroupsB68().length===0,'empty marker survived');
    reset();assert(!S.b68DropSerial&&cargoGroupsB68().length===0,'marker state survived reset');
  });
  test('Mobile HUD preserves every resource, accessible label and movement fade',()=>{
    S.heartCurrency=12;S.prismSeeds=3;S.musicNotes=4;S.starPoints=5;S.pipSoundCredits=2;S.audioMixCredits=1;renderCurrencyHudB47();
    const items=[...$('currencyHud').querySelectorAll('.b47-currency')];
    assert(items.length===6&&items.map(x=>x.getAttribute('aria-label')).join('|')==='Hearts 12|Prism Seeds 3|Music Notes 4|Run Stars 5|Sound Choices 2|Mix Choices 1','resource HUD lost data');
    S.b47CurrencyHudMoving=true;renderCurrencyHudB47();assert($('currencyHud').classList.contains('b47-moving'),'movement fade lost');
  });
  test('Pip dialogue is one polite status region and emergency tip stays separate',()=>{
    assert($('pipMood').getAttribute('role')==='status'&&$('pipMood').getAttribute('aria-live')==='polite'&&$('pipMood').getAttribute('aria-atomic')==='true','Pip message semantics missing');
    showPipMessage('lane check');assert($('pipMood').textContent.includes('lane check'),'Pip message content lost');
    S.pipSupport=1;S.shields=1;S.pipState='return';updateUI();assert($('tip').textContent.includes('PIP RETURNING')&&!$('pipMood').textContent.includes('PIP RETURNING'),'combat tip merged into dialogue');
  });
  test('Heart timer reports the mechanical reserve only while Pip is away',()=>{
    S.pipCompassion=2;S.b51PipBond=.5;S.b51PipBondVisual=.5;S.pipState='collect';
    assert(near(pipBondSecondsRemainingB72(),1),'timer ignored bond or Compassion');
    const beforeFill=X.fillText,seen=[];X.fillText=(text,...args)=>seen.push(String(text));
    try{drawPipBondTimerB72();assert(seen.includes('1.0s'),'away timer not drawn');seen.length=0;S.pipState='orbit';drawPipBondTimerB72();assert(!seen.length,'orbit timer added permanent clutter')}finally{X.fillText=beforeFill}
    S.pipState='return';S.b51PipBond=0;assert(pipBondSecondsRemainingB72()===0,'empty timer did not reach zero');
  });
  test('Banking a heart-tier boundary pulses the difficulty pill and obeys pause',()=>{
    S.stage=4;S.earlyRunHearts=0;S.runHearts=19;collectHeartBit(heartFixtureB60());updateUI();
    assert(S.b73DifficultyTier===2&&near(S.b73DifficultyPulse,1)&&difficultyHudB65.classList.contains('b73-tier-up'),'tier cue missing');
    assert(difficultyHudB65.textContent==='DIFF · ♥ T2 · 0/20'&&difficultyHudB65.getAttribute('aria-label').includes('Tier 2 reached'),'new tier not reported');
    S.b39Paused=true;update(.4);assert(near(S.b73DifficultyPulse,1),'pause consumed cue');S.b39Paused=false;update(.4);assert(S.b73DifficultyPulse<1,'active play did not consume cue');
    S.b73DifficultyPulse=.01;update(.02);updateUI();assert(!difficultyHudB65.classList.contains('b73-tier-up'),'expired cue stayed lit');
    for(const stage of [3,11]){transportFixtureB60();S.stage=stage;S.runHearts=19;collectHeartBit(heartFixtureB60());assert(!S.b73DifficultyPulse,`stage ${stage} triggered heart-tier cue`)}
    reset();assert(!S.b73DifficultyPulse&&!difficultyHudB65.classList.contains('b73-tier-up'),'reset retained cue');
  });
  test('B99 run stars unlock the roster like bosses and new types start rare',()=>{
    reset();transportFixtureB60();S.stage=5;S.starsTotal=0;assert(unlockedTypesB99().join()==='chaser','locked roster leaked');
    S.starsTotal=6;assert(unlockedTypesB99().includes('charger')&&!unlockedTypesB99().includes('core'),'charger unlock wrong');
    S.starsTotal=52;assert(unlockedTypesB99().length===6,'full roster not unlocked');
    const w=rosterWeightsB99();assert(Math.abs(w.thief-.2/3)<1e-9,'fresh unlock not rare');S.stage=8;assert(Math.abs(rosterWeightsB99().thief-.2)<1e-9,'unlock never matured');
  });
  test('B99 spawn gaps follow rolled speed so fast enemies arrive thinner',()=>{
    const slow={type:'chaser',hp:2,b99:{speedMul:1}},fast={type:'chaser',hp:2,b99:{speedMul:1.6}};let a=0,b=0;
    for(let i=0;i<200;i++){a+=spawnGapB99(slow);b+=spawnGapB99(fast)}assert(b>a*1.4,'fast enemies did not slow spawning');
    S.waveState='active';S.bossActive=false;S.waveKills=0;S.waveGoal=99;enemies=[];S.spawn=0;spawnLogic(.01);assert(enemies.length===1&&S.spawn>=.3,'spawn pacing did not use the spawned enemy');
  });
  test('B99 aggression shortens charger wind-ups and speeds charges without passing the floor',()=>{
    const mk=agg=>{const e={type:'charger',x:P.x+200,y:P.y,r:14,hp:3,dead:false,age:0,state:'aim',aim:.8,vx:0,vy:0,flash:0};stateB99().aggMin=agg;S.b99.heartLevel=0;rollEnemyB99(e);return e};
    const calm=mk(1),hot=mk(30);assert(hot.aim<calm.aim&&hot.aim>=.3,'wind-up scaling wrong');
    hot.aim=.001;enemies=[hot];updateEnemy(hot,.016);assert(hot.state==='charge'&&hyp(hot.vx,hot.vy)>340*1.1,'aggressive charge not faster');
  });
  test('B99 sniper telegraphs, then fires one shot on the locked line',()=>{
    S.b99=null;enemies=[];enemyShots=[];const e=spawnEnemy('sniper');e.x=P.x+220;e.y=P.y;e.b99Fire=0;
    updateEnemy(e,.016);assert(e.b99Aim>0&&!enemyShots.length,'fired without telegraph');
    for(let i=0;i<80&&!enemyShots.length;i++)updateEnemy(e,.016);assert(enemyShots.length===1,'no single shot after telegraph');
  });
  test('B99 splitter breaks into two small chasers that do not split again',()=>{
    enemies=[];const e=spawnEnemy('splitter');kill(e);const babies=enemies.filter(o=>!o.dead&&o.b99Small);
    assert(babies.length===2&&babies.every(b=>b.type==='chaser'&&b.hp===1),'split wrong');kill(babies[0]);assert(enemies.filter(o=>!o.dead&&o.b99Small).length===1,'baby split again');
  });
  test('B99 thief steals from Pip, drops it when caught and keeps it if it escapes',()=>{
    enemies=[];heartBits=[];const h=heartFixtureB60();heartBits=[h];gatherHeartB60(h);assert(transportB60().cargo.length===1,'fixture cargo missing');
    const e=spawnEnemy('thief');e.x=P.pipX;e.y=P.pipY;updateEnemy(e,.016);const stolen=e.b99Stolen;assert(stolen&&!transportB60().cargo.length,'thief did not steal');
    kill(e);assert(heartBits.includes(stolen)&&!stolen.dead,'heart not dropped');
    heartBits=[];const f=spawnEnemy('thief');f.b99Stolen=makeHeartSourceB74(1,f.x,f.y,10,false);f.x=P.x+2000;updateEnemy(f,.016);assert(f.dead&&f.b99Escaped&&!heartBits.length,'escape handling wrong');
  });
  test('B99 bosses scale on their own track',()=>{
    enemies=[];S.bossCount=0;S.b99=null;startBossBattle();const base=S.bossMaxHp;enemies=[];S.b99.heartLevel=6;startBossBattle();assert(S.bossMaxHp===base+54,'heart level did not add boss health');
    S.starsTotal=0;const t0=bossTempoB99();S.starsTotal=50;assert(bossTempoB99()>t0&&bossTempoB99()<=1.3,'star tempo wrong');
    enemyShots=[];S.bossCount=2;S.bossActive=true;const boss=enemies.find(o=>o.type==='boss');boss.b99Ring=.01;updateBossRingB99(.05);assert(enemyShots.length>=8,'late boss ring volley missing');
  });
  applySettingsB61(saved);reset();S.audioEnabled=false;return results;
}
