function runSurvivalChecksB63(){
  const results=[],saved={...settingsB61};
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)},near=(a,b)=>Math.abs(a-b)<1e-6;
  const test=(name,fn)=>{try{applySettingsB61(B61_DEFAULTS);transportFixtureB60();fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test('Opening stages freeze all numeric enemy and boss scaling',()=>{
    for(const stage of [1,2,3]){S.stage=stage;S.wave=stage*3;S.stageWaveCount=3;S.runHearts=999;S.bossCount=4;
      assert(difficulty()===.88&&difficultyWaveB63()===1&&difficultyStageB63()===1,'opening pressure scaled');
      assert(enemyCap()===(H>W?8:11)&&waveGoalFor(S.wave)===8,'opening population scaled');
      spawnEnemy('chaser');assert(enemies.at(-1).hp===2,'opening HP scaled');
      startBossBattle();assert(S.bossMaxHp===79&&enemies.at(-1).bossStage===1,'opening boss scaled');
    }
  });
  test('Stages 4 to 10 scale only with banked run hearts in capped 20-heart tiers',()=>{
    for(const stage of [4,7,10])for(const hearts of [0,19,20,79,80,179,180,999]){
      S.stage=stage;S.wave=99;S.runHearts=hearts;S.heartCurrency=0;S.heartTotal=99999;
      const tier=Math.min(10,1+Math.floor(hearts/20)),w=1+(tier-1)*3;
      const expected=.88+Math.min(1.1,(w-1)*.12)+(tier>=5?.16+Math.min(.34,(tier-5)*.045):0);
      assert(difficultyStageB63()===tier&&near(difficulty(),expected),'wrong heart tier');
      assert(waveGoalFor(99)===8+Math.floor((tier-1)*2/3),'wrong heart kill target');
    }
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
  test('Stage 11 restores exact legacy speed, cap, health, wave and boss formulas',()=>{
    for(const stage of [11,13,17,30]){
      S.stage=stage;S.wave=(stage-1)*3+2;S.stageWaveCount=2;S.runHearts=0;S.bossCount=3;
      const d=.88+Math.min(1.1,(S.wave-1)*.12)+.16+Math.min(.34,(stage-5)*.045);
      assert(near(difficulty(),d),'legacy speed mismatch');assert(enemyCap()===(H>W?15:18),'legacy cap mismatch');
      assert(waveGoalFor(S.wave)===Math.min(16,10+Math.min(2,Math.floor((stage-1)/8))),'legacy kill target mismatch');
      spawnEnemy('charger');assert(enemies.at(-1).hp===3+Math.min(5,1+Math.floor((stage-5)/2)),'legacy HP mismatch');
      startBossBattle();assert(S.bossMaxHp===54+stage*7+4*18&&enemies.at(-1).bossStage===stage+6,'legacy boss mismatch');
    }
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
      hurt();updateUI();assert(seen.some(args=>String(args[2]).includes('CARGO DROPPED ×2'))&&S.b66EmergencyActive,'activation missing');
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
  applySettingsB61(saved);reset();S.audioEnabled=false;return results;
}
