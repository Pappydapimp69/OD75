// Shared assertions run against the complete game in Node and in the real browser.
function fixtureB59(key=1,traits={}){
  reset();S.audioEnabled=false;S.run=true;S.waveState="boss";S.bossActive=true;S.stageWaveCount=3;
  S.spawn=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;
  for(const id of ["start","end","stageUp","pipPauseB39"])$(id)?.classList.add("hidden");
  for(const [kind,lv] of Object.entries(traits))S[B59_TRAITS[kind].field]=lv;
  const e={type:"boss",bossKey:key,bossStage:1,x:180,y:0,r:30,hp:5000,maxHp:5000,dead:false,
    age:0,flash:0,attackClock:1,volleyCount:0,orbitAngle:0};
  enemies=[e];S.bossName=bossData(key).name;S.bossKey=key;S.bossCount=BOSS_ORDER.indexOf(key);
  if(B59_BOSS_KEYS.includes(key))initBossB59(e);
  return e;
}
function stepB59(seconds){for(let elapsed=0;elapsed<seconds-1e-8;elapsed+=1/60)update(Math.min(1/60,seconds-elapsed))}
function runPartnershipChecksB59(){
  const results=[];
  const assert=(condition,message)=>{if(!condition)throw new Error(message)};
  const test=(name,fn)=>{try{fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test("Level-zero traits preserve ordinary damage and collection",()=>{
    fixtureB59();S.shields=1;hurt();assert(S.shields===0&&S.b59.stats.cover===0,"unlearned Cover intercepted");
    S.pipState="collect";P.pipX=150;S.b51PipBond=.1;assert(!requestRallyB59(),"unlearned Rally started");
    assert(!markSetupB59(enemies[0]),"unlearned Setup started");
  });
  test("Rally recalls a distant Pip, physically returns and restores bond",()=>{
    fixtureB59(1,{love:2});enemies=[];S.b51PipBond=.2;S.pipState="collect";P.pipX=140;P.pipY=0;
    S.pipTarget={x:220,y:0,life:10};assert(requestRallyB59(),"Rally not requested");
    assert(P.pipX===140&&S.pipState==="return","Rally teleported");
    stepB59(.7);assert(S.b59.stats.rally===1&&S.pipState==="orbit","Rally failed to reunite");
    assert(S.b59.grace>0&&pipBondB51()===1,"reunion did not steady bond");
  });
  test("Loving Pip still finishes adjacent pickups and allows long trips at rest",()=>{
    const e=fixtureB59(1,{love:3});const h={x:25,y:0,r:7,life:10,dead:false,vx:0,vy:0,bob:0};heartBits=[h];
    assert(findPipHeartTarget()===h,"nearby pickup suppressed");
    S.pipDetectRange=200;h.x=150;assert(findPipHeartTarget()===null,"dangerous long trip was not shortened");
    bossPhaseB59(e,"recover",2);assert(findPipHeartTarget()===h,"safe collection suppressed");
  });
  test("Rally grace protects a subsequent short trip and higher love deepens it",()=>{
    fixtureB59(1,{love:1});finishRallyB59();const one=S.b59.grace;
    S.pipLove=5;finishRallyB59();assert(S.b59.grace>one,"love investment has no effect");
    S.pipState="collect";P.pipX=50;S.pipTarget={x:65,y:0,r:7,life:10,dead:false};update(.02);
    assert(pipBondB51()===1,"grace lost to legacy bond wrapper");
  });
  test("Cover intercepts once and then permits ordinary damage",()=>{
    fixtureB59(1,{compassion:1});S.shields=1;hurt();
    assert(S.shields===1&&S.b59.stats.cover===1&&S.b59.coverCd>0,"Cover missed or charged incorrectly");
    S.invuln=0;hurt();assert(S.shields===0&&S.b59.stats.cover===1,"Cover ignored cooldown");
  });
  test("Cover respects distance, vulnerability and existing immunity",()=>{
    fixtureB59(1,{compassion:3});S.invuln=1;S.shields=0;hurt();assert(S.b59.coverCd===0,"immunity spent Cover");
    S.invuln=0;S.shields=3;hurt();assert(S.shields===2&&S.b59.stats.cover===0,"healthy player spent Cover");
    S.invuln=0;S.shields=1;P.pipX=500;hurt();assert(S.shields===0&&S.b59.stats.cover===0,"remote Pip covered");
  });
  test("Guardian defenses take precedence over Cover",()=>{
    fixtureB59(1,{compassion:3});S.shields=0;S.guardianCharges=1;hurt();
    assert(S.guardianCharges===0&&S.b59.stats.cover===0,"Cover consumed ahead of Guardian");
  });
  test("Incoming projectile arms a visible Cover cue before impact",()=>{
    fixtureB59(1,{compassion:1});S.shields=0;enemyShots=[{x:45,y:0,vx:-180,vy:0,life:2,r:5}];
    update(.02);assert(S.b59.coverThreat&&S.b59.stats.cover===0,"no anticipation cue");
    stepB59(.2);assert(S.b59.stats.cover===1&&S.health===100,"incoming projectile not intercepted");
  });
  test("Setup requires a new dash crossing, pays once, and leaves auto-fire unchanged",()=>{
    const e=fixtureB59(1,{support:2});bossPhaseB59(e,"recover",2);e.b59.clean=true;
    markSetupB59(e);const m=S.b59.setup,hp=e.hp;
    assert(!consumeSetupB59(m.x-35,m.y,m.x+35,m.y,false),"walking consumed Setup");
    assert(!consumeSetupB59(m.x-35,m.y,m.x+35,m.y,true),"old dash consumed Setup");
    dashVector(1,0);assert(consumeSetupB59(m.x-35,m.y,m.x+35,m.y,true),"dash did not complete Setup");
    assert(e.hp<hp&&S.b59.stats.joint===1,"joint strike missing");
    assert(!consumeSetupB59(m.x-35,m.y,m.x+35,m.y,true),"Setup paid twice");
  });
  test("Actual dash motion completes the opportunity through the full update chain",()=>{
    const e=fixtureB59(1,{support:2});e.x=100;bossPhaseB59(e,"recover",2);e.b59.clean=true;
    markSetupB59(e);dashVector(1,0);stepB59(.16);
    assert(S.b59.stats.joint===1,"swept dash missed the diamond");
  });
  test("Expired, dead and phase-stale opportunities cannot pay",()=>{
    const e=fixtureB59(1,{support:2});bossPhaseB59(e,"recover",2);markSetupB59(e);
    bossPhaseB59(e,"track",.9);update(.01);assert(!S.b59.setup,"phase-stale Setup survived");
    bossPhaseB59(e,"recover",2);markSetupB59(e,"strike",true);e.dead=true;update(.01);assert(!S.b59.setup,"dead target retained");
  });
  test("Immediate danger takes precedence over offensive Setup",()=>{
    const e=fixtureB59(1,{compassion:2,support:3});bossPhaseB59(e,"recover",2);e.b59.clean=true;S.shields=0;
    enemyShots=[{x:40,y:0,vx:-150,vy:0,r:5,life:2}];update(.02);
    assert(S.b59.coverThreat&&!S.b59.setup,"Setup displaced imminent Cover");
  });
  test("Mixed traits rally first, then prepare a joint opening",()=>{
    const e=fixtureB59(1,{love:2,support:2});bossPhaseB59(e,"recover",3);e.b59.clean=true;
    P.pipX=130;S.pipState="collect";S.b51PipBond=.1;S.pipTarget={x:250,y:0,life:10};
    requestRallyB59();assert(!S.b59.setup,"Setup happened while returning");
    stepB59(1.4);assert(S.b59.stats.rally===1&&S.b59.setup,"mixed sequence failed");
  });
  test("Grump's fan follows its locked warning after the player moves",()=>{
    const e=fixtureB59();bossPhaseB59(e,"locked",.1);e.b59.angle=Math.PI;
    P.y=100;for(let i=0;i<8;i++)updateEnemy(e,.02);
    assert(enemyShots.length===5,"unexpected fan size");
    assert(enemyShots.every(s=>Math.abs(angleDeltaB59(Math.atan2(s.vy,s.vx)-Math.PI))<=.411),"fan retargeted after lock");
  });
  test("Phase two begins between attacks and Grump adds a warned second fan",()=>{
    const e=fixtureB59();bossPhaseB59(e,"locked",.1);e.hp=2000;
    updateEnemy(e,.02);assert(!e.b59.second,"phase changed mid-warning");bossCycleB59(e);
    assert(e.b59.second,"phase two absent at boundary");
    bossPhaseB59(e,"locked",.01);updateEnemy(e,.02);assert(e.b59.volley===1,"first volley missing");
    for(let i=0;i<25;i++)updateEnemy(e,.02);
    assert(e.b59.phase==="track"&&e.b59.volley===1,"second volley skipped its warning");
  });
  test("Fang pounce direction is fixed and phase two warns before following",()=>{
    const e=fixtureB59(5);e.b59.second=true;e.b59.angle=Math.PI;bossPhaseB59(e,"locked",.01);
    updateEnemy(e,.02);const x=e.x;P.y=150;
    for(let i=0;i<31;i++)updateEnemy(e,.02);
    assert(e.x<x-170&&Math.abs(e.y)<.001,"pounce tracked moving player");
    assert(e.b59.phase==="follow","second pounce not signaled");
  });
  test("Supportive distraction changes Fang's aim and offers a flank afterward",()=>{
    const e=fixtureB59(5,{support:2});bossPhaseB59(e,"stalk",.9);planSetupB59();
    assert(S.b59.lure&&e.b59.lured,"no distraction");const lure=S.b59.lure;
    updateEnemy(e,.02);assert(Math.abs(angleDeltaB59(e.b59.angle-Math.atan2(lure.y-e.y,lure.x-e.x)))<1e-6,"Fang ignored lure");
    bossRecoverB59(e,2);e.b59.clean=true;S.b59.actionTime=0;planSetupB59();assert(S.b59.setup,"lure did not earn flank opportunity");
  });
  test("Bloom projectile geometry preserves its advertised gap",()=>{
    const e=fixtureB59(7);e.b59.gapAngle=.8;fireBloomB59(e);
    assert(enemyShots.length>=20,"Bloom pattern unexpectedly empty");
    assert(enemyShots.every(s=>Math.abs(angleDeltaB59(s.b59Angle-.8))>=.48),"shot spawned inside safe gap");
    assert(enemyShots.every(s=>hyp(s.x-P.x,s.y-P.y)>P.r+s.r),"point-blank radial spawn");
  });
  test("Bloom's node clears one sector, preserves other shots and pays once",()=>{
    const e=fixtureB59(7,{support:2});e.b59.gapAngle=Math.PI;fireBloomB59(e);markSetupB59(e,"petal");
    const m=S.b59.setup,before=enemyShots.length;dashVector(1,0);
    consumeSetupB59(m.x-35,m.y,m.x+35,m.y,true);
    const remaining=enemyShots.filter(s=>s.life>0).length;
    assert(remaining>0&&remaining<before&&S.b59.stats.gap===1,"node did not clear a bounded sector");
  });
  test("Bloom reversal is announced before the changed volley",()=>{
    const e=fixtureB59(7);e.hp=2000;e.b59.cycle=1;bossCycleB59(e);
    assert(e.b59.phase==="reverse"&&e.b59.timer>=1&&e.b59.direction===-1,"reversal has no warning");
    assert(enemyShots.length===0,"reversal fired immediately");
  });
  test("Four other bosses and ordinary chargers retain their update paths",()=>{
    const e=fixtureB59(11);updateEnemy(e,.04);assert(!e.b59&&e.age>0,"legacy boss replaced");
    const c={type:"charger",x:180,y:0,r:14,state:"aim",aim:.1,age:0,dead:false};enemies=[c];
    updateEnemy(c,.2);assert(c.state==="charge"&&c.b55LaneLocked,"charger commitment lost");
  });
  test("Pause freezes bosses, bond, cooldowns and Ascended timer",()=>{
    fixtureB59(1,{love:2,compassion:2,support:2});S.overType="pip";S.overLevels.pip=1;S.heat=100;triggerOverdrive();
    S.b59.coverCd=4;S.pipState="collect";S.b51PipBond=.5;
    assert(openAscendedPauseB39(),"pause did not open");
    const state=JSON.stringify([S.t,S.b58AscTime,S.heat,S.b51PipBond,S.b59.coverCd,enemies[0].b59.timer]);
    stepB59(2);assert(JSON.stringify([S.t,S.b58AscTime,S.heat,S.b51PipBond,S.b59.coverCd,enemies[0].b59.timer])===state,"paused state advanced");
    closeAscendedPauseB39();update(.02);assert(S.t>0,"resume stayed frozen");
  });
  test("Stage menus and game over cannot spend dash or advance partnership",()=>{
    fixtureB59();S.waveState="stage";const time=S.t;update(.03);assert(S.t===time&&!dashVector(1,0),"stage input advanced combat");
    S.waveState="boss";S.end=true;update(.03);assert(S.t===time&&!dashVector(1,0),"game over advanced combat");
  });
  test("Ascension amplifies the dominant learned instinct and retains B58 cap",()=>{
    fixtureB59(1,{love:1,compassion:4,support:2});enemies=[];S.overType="pip";S.overLevels.pip=1;S.heat=100;
    triggerOverdrive();assert(S.b59.ascTrait==="compassion"&&S.b58AscTime===8,"wrong Ascended instinct or duration");
    S.b59.coverCd=6;update(.04);assert(S.b59.coverCd<5.95,"dominant instinct not amplified");
    const left=S.b58AscTime,uses=S.overdrives;triggerOverdrive();assert(S.b58AscTime===left&&S.overdrives===uses,"repeat activation reset cap");
    stepB59(8.2);assert(S.over===0&&S.heat===0,"Ascension exceeded B58 cap");
  });
  test("Reset clears partnership and preserves run-scoped progression",()=>{
    fixtureB59(1,{love:3});S.b59.coverCd=7;S.b59.grace=1;S.b59.stats.cover=2;reset();
    assert(S.b59.coverCd===0&&S.b59.grace===0&&S.b59.stats.cover===0&&!S.b59.setup,"partnership leaked across runs");
    assert(S.pipLove===0&&S.pipCompassion===0&&S.pipSupport===0,"trait progression leaked");
  });
  test("Prism purchase learns the signature and pause explains all three",()=>{
    fixtureB59();S.stagePending=true;S.prismSeeds=1;choosePipUpgrade("love");
    assert(S.prismSeeds===0&&S.pipLove===1,"trait purchase failed");
    assert(emotionalNextText("love").includes("RALLY"),"shop omits new behavior");
    renderAscendedPauseB39();assert(["Rally","Cover","Setup"].every(t=>$("b39CoreList").textContent.includes(t)),"pause omits instincts");
  });
  test("Keyboard and DASH pointer inputs reach the shared dash action",()=>{
    fixtureB59();window.dispatchEvent(new KeyboardEvent("keydown",{key:" ",bubbles:true}));
    window.dispatchEvent(new KeyboardEvent("keyup",{key:" ",bubbles:true}));assert(S.b59.dashSerial===1,"Space bypassed shared dash");
    S.dashCd=0;$("dash").dispatchEvent(new Event("pointerdown",{bubbles:true,cancelable:true}));assert(S.b59.dashSerial===2,"DASH pointer bypassed shared dash");
  });
  test("Double-tap and double-click reach the same dash action",()=>{
    const now=performance.now.bind(performance);let clock=1000;
    Object.defineProperty(performance,"now",{configurable:true,value:()=>clock});
    try{for(const kind of ["touch","mouse"]){fixtureB59();resetDashTap();const rect=C.getBoundingClientRect();
      for(let i=0;i<2;i++){const ev=new Event("pointerdown",{bubbles:true,cancelable:true});Object.assign(ev,{pointerType:kind,pointerId:12,clientX:rect.left+rect.width*.75,clientY:rect.top+rect.height*.5});C.dispatchEvent(ev);clock+=100}
      assert(S.b59.dashSerial===1,`${kind} double tap bypassed shared dash`);
    }}finally{Object.defineProperty(performance,"now",{configurable:true,value:now});resetDashTap()}
  });
  test("Gamepad dash and pause use the existing input pipeline",()=>{
    fixtureB59();const descriptor=Object.getOwnPropertyDescriptor(navigator,"getGamepads");
    const pad={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
    Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[pad]});
    try{updateGamepadInput();pad.buttons[0]={pressed:true,value:1};updateGamepadInput();assert(S.b59.dashSerial===1,"gamepad dash missed shared action");
      pad.buttons[0]={pressed:false,value:0};updateGamepadInput();pad.buttons[9]={pressed:true,value:1};updateGamepadInput();assert(S.b39Paused,"gamepad pause failed");
    }finally{if(descriptor)Object.defineProperty(navigator,"getGamepads",descriptor);else delete navigator.getGamepads;reset()}
  });
  reset();S.audioEnabled=false;
  return results;
}
