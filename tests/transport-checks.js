function heartFixtureB60(x=150,y=0){return {x,y,r:7,life:10,dead:false,vx:0,vy:0,bob:0}}
function transportFixtureB60(){
  fixtureB59();enemies=[];S.bossActive=false;S.waveState="active";S.spawn=999;S.waveGoal=999;
  P.x=0;P.y=0;P.pipX=150;P.pipY=0;S.pipState="collect";S.pipTarget=null;
  S.heartCurrency=0;S.stageCurrency=0;S.heartTotal=0;
}
function runTransportChecksB60(){
  const results=[],assert=(ok,message)=>{if(!ok)throw Error(message)};
  const test=(name,fn)=>{try{fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test("Prism shop supports repeated purchases, exact inventory and explicit Continue",()=>{
    transportFixtureB60();openStageUpgrade();S.prismSeeds=3;renderEmotionButtons();
    $("upLove").click();$("upLove").click();$("upSupport").click();
    assert(S.prismSeeds===0&&S.pipLove===2&&S.pipSupport===1,"wrong spending or trait totals");
    assert(!$("emotionStep").classList.contains("stagehidden"),"shop advanced prematurely");
    choosePipUpgrade("love");assert(S.pipLove===2&&S.prismSeeds===0,"overspend");
    assert($("upLove").disabled,"unaffordable purchase enabled");
    $("skipPipUpgrade").click();assert(!$("abilityStep").classList.contains("stagehidden"),"Continue did not advance");
    S.prismSeeds=1;choosePipUpgrade("love");assert(S.prismSeeds===1,"hidden shop spent inventory");
  });
  test("Invalid Prism purchase preserves wallet",()=>{
    transportFixtureB60();openStageUpgrade();S.prismSeeds=2;choosePipUpgrade("invalid");assert(S.prismSeeds===2,"invalid trait charged");
  });
  test("Heart Sense grows slower after 10, caps range, and never multiplies Swift",()=>{
    transportFixtureB60();const values=[];
    for(const lv of [0,9,10,11,20,100]){S.pipRangeLv=lv;applyPipPower();values.push(S.pipDetectRange);assert(S.pipMoveSpeed===285,"Sense changes flight speed");assert(S.pipCarryCapacity===10+lv*2,"capacity progression");}
    assert(values.join() === [82,154,162,164,182,200].join(),"wrong range curve");
    S.pipSpeedLv=2;applyPipPower();assert(S.pipMoveSpeed===353,"Swift altered by Sense");
  });
  test("Remote pickups become cargo without crediting currency or lifetime totals",()=>{
    transportFixtureB60();const h=heartFixtureB60();heartBits=[h];updatePipCompanion(.02);
    assert(transportB60().cargo[0]===h&&!heartBits.includes(h),"pickup did not move to cargo");
    assert(S.heartCurrency===0&&S.heartTotal===0&&!h.dead,"credited remotely");
  });
  test("Pip fills capacity with one overflow heart then must return",()=>{
    transportFixtureB60();heartBits=Array.from({length:6},(_,i)=>heartFixtureB60(150+i,0));
    for(let i=0;i<10;i++)updatePipCompanion(.001);
    assert(cargoWeightB60()===12&&S.pipState==="return"&&heartBits.length===2,"capacity did not stop collection");
    assert(!gatherHeartB60(heartBits[0])&&cargoWeightB60()===12,"overloaded Pip gathered another heart");
  });
  test("Pip keeps gathering around his own position after player drifts away",()=>{
    transportFixtureB60();P.x=-400;heartBits=[heartFixtureB60(150),heartFixtureB60(180),heartFixtureB60(350)];
    updatePipCompanion(.01);assert(S.pipState==="collect"&&S.pipTarget.x===180,"second local heart ignored");
    for(let i=0;i<15;i++)updatePipCompanion(.02);
    assert(cargoWeightB60()===6&&S.pipState==="return","did not return after local cluster");
  });
  test("Expired targets are skipped without losing existing cargo",()=>{
    transportFixtureB60();const h=heartFixtureB60(),next=heartFixtureB60(170);heartBits=[h,next];gatherHeartB60(h);next.life=0;
    updatePipCompanion(.01);assert(S.pipState==="return"&&cargoWeightB60()===3,"expired target lost cargo or stalled");
  });
  test("Cargo weight smoothly halves flight speed, including overflow",()=>{
    transportFixtureB60();const state=transportB60();
    for(const [n,factor] of [[0,1],[1,.85],[3,.55],[4,.5]]){state.cargo=Array.from({length:n},()=>heartFixtureB60());assert(Math.abs(carrySpeedB60()-285*factor)<1e-8,"incorrect loaded speed");}
    S.pipSpeedLv=2;applyPipPower();assert(carrySpeedB60()===353/2,"Swift not applied to loaded flight");
    S.pipRangeLv=1;applyPipPower();state.cargo.length=3;assert(carrySpeedB60()>353*.55,"capacity does not reduce burden");
  });
  test("Meeting a loaded Pip banks every heart exactly once and restores bond",()=>{
    transportFixtureB60();heartBits=[heartFixtureB60()];gatherHeartB60(heartBits[0]);P.x=130;S.b51PipBond=0;
    updatePipCompanion(.02);assert(S.heartCurrency===1&&S.stageCurrency===1&&S.heartTotal===1,"delivery accounting");
    assert(S.pipState==="orbit"&&S.b51PipBond===1&&cargoWeightB60()===0,"reunion did not complete");
    updatePipCompanion(.02);deliverCargoB60();assert(S.heartCurrency===1,"double credit");
  });
  test("Cargo survives a long chase and does not expire",()=>{
    transportFixtureB60();P.x=-10000;heartBits=[heartFixtureB60()];heartBits[0].life=.05;gatherHeartB60(heartBits[0]);
    stepB59(12);assert(cargoWeightB60()===3&&S.heartCurrency===0,"cargo expired or banked remotely");
    P.x=P.pipX;update(.02);assert(S.heartCurrency===1,"long trip lost heart");
  });
  test("Stage-clear reunion banks cargo before shop without triggering Relay",()=>{
    transportFixtureB60();S.pipBossPowers.relay=1;heartBits=[heartFixtureB60()];gatherHeartB60(heartBits[0]);openStageUpgrade();
    assert(S.heartCurrency===1&&cargoWeightB60()===0&&S.pipRelayBuff===0,"stage handoff accounting or proc");
    openAbilityStep();assert($("abilityBalance").textContent.includes("1 Heart"),"shop balance missing cargo");
  });
  test("New runs clear cargo and Relay cooldown",()=>{
    transportFixtureB60();transportB60().cargo=[heartFixtureB60()];transportB60().relayCd=7;reset();
    assert(cargoWeightB60()===0&&transportB60().relayCd===0,"cargo/cooldown leaked into new run");
  });
  test("Heart Relay lasts 0.5 seconds, scales by 0.1 and needs a real delivery",()=>{
    transportFixtureB60();S.pipBossPowers.relay=1;reunitePipB60();assert(S.pipRelayBuff===0,"empty return procced");
    transportB60().cargo=[heartFixtureB60()];reunitePipB60();assert(S.pipRelayBuff===.5&&transportB60().relayCd===8,"level 1 timing");
    transportB60().relayCd=0;S.pipBossPowers.relay=4;transportB60().cargo=[heartFixtureB60()];reunitePipB60();
    assert(S.pipRelayBuff===.8,"level scaling");
  });
  test("Heart Relay cannot retrigger inside 8 seconds and pause freezes cooldown",()=>{
    transportFixtureB60();S.pipBossPowers.relay=1;transportB60().cargo=[heartFixtureB60()];reunitePipB60();
    stepB59(1);assert(S.pipRelayBuff===0,"buff outlived duration");
    transportB60().cargo=[heartFixtureB60()];reunitePipB60();assert(S.pipRelayBuff===0,"cooldown retrigger");
    const cd=transportB60().relayCd;S.b39Paused=true;update(.04);assert(transportB60().relayCd===cd,"pause aged cooldown");S.b39Paused=false;
    stepB59(7.02);transportB60().cargo=[heartFixtureB60()];reunitePipB60();assert(S.pipRelayBuff===.5,"cooldown never recovered");
  });
  test("Rally returns weighted cargo without teleporting or discarding it",()=>{
    transportFixtureB60();S.pipLove=2;S.b51PipBond=.1;transportB60().cargo=Array.from({length:4},()=>heartFixtureB60());
    assert(requestRallyB59(),"Rally not started");assert(P.pipX===150&&S.heartCurrency===0,"Rally teleported cargo");
    stepB59(1);assert(S.b59.stats.rally===1&&S.heartCurrency===4&&cargoWeightB60()===0,"Rally cargo delivery failed");
  });
  test("Ascension respects capacity and delivers through the same cargo route",()=>{
    transportFixtureB60();S.overType="pip";S.over=5;S.overLevels.pip=1;
    heartBits=Array.from({length:7},()=>heartFixtureB60());updateAscendantHeartMagnetB26(.02);
    assert(cargoWeightB60()===12&&heartBits.length===3&&S.heartCurrency===0,"Ascension bypassed transport");
    updateAscendantHeartMagnetB26(.02);assert(heartBits.length===3,"magnet kept collecting during return");
    P.x=P.pipX;updatePipCompanion(.02);assert(S.heartCurrency===4,"Ascension cargo not delivered");
  });
  test("Every Mix level adds a distinct recurring music part in waves and bosses",()=>{
    transportFixtureB60();S.audioEnabled=true;
    for(const boss of [false,true]){
      S.bossActive=boss;const signatures=[];
      for(const layer of B46_MIX_LAYERS){let previous=0;
        for(let lv=1;lv<=4;lv++){
          const events=[],engine={step:0,music:{},harmony:()=>({root:60,chord:[60,64,67]})};
          for(const method of ["voice","kick","pluck","fmBell"])engine[method]=(...args)=>events.push([method,engine.step,...args.slice(0,4)]);
          for(let i=0;i<16;i++){engine.step=i;scheduleMixB60(engine,layer.id,lv,i*.13)}
          assert(events.length>previous,`${layer.id} Lv ${lv} has no new arrangement detail`);previous=events.length;
          if(lv===1)signatures.push(JSON.stringify(events));
        }
      }
      assert(new Set(signatures).size===3,"mixes sound identical");
    }
  });
  test("Mix purchase changes actual level and bundled components exactly once",()=>{
    transportFixtureB60();openStageUpgrade();openPipSoundStepB26();S.audioMixCredits=2;S.musicNotes=10;chooseAudioOptionsB41();
    assert(completeSoundLabHoldB45("mix","heartmix",0),"unlock failed");
    assert(mixLevelB46("heartmix")===1&&S.audioMixCredits===1&&S.musicNotes===8,"unlock charge");
    assert(completeSoundLabHoldB45("mix","heartmix",0),"upgrade failed");
    assert(mixLevelB46("heartmix")===2&&S.audioMixCredits===0&&S.musicNotes===6,"upgrade charge");
    for(const member of B46_MIX_BY_ID.heartmix.members)assert(audioLevelB41(member)===2,"bundled component stale");
    assert(!completeSoundLabHoldB45("mix","heartmix",0),"unfunded upgrade succeeded");
    assert($("mixAuditionStatusB60").textContent.includes("muted"),"muted audition not explained");
  });
  test("Music scheduling is isolated from busy SFX and all sound respects mute",()=>{
    transportFixtureB60();S.audioEnabled=true;S.b46MixLevels.starmix=1;
    const events=[],sfx=new Set(Array.from({length:24},()=>({}))),engine={step:1,voices:sfx,music:{},harmony:()=>({root:60,chord:[60,64,67]})};
    for(const method of ["voice","kick","pluck","fmBell","bass","padChord","hat"])engine[method]=()=>{assert(engine.voices!==sfx,"music shares saturated SFX budget");events.push(method)};
    PipAudioEngine.prototype.scheduleStep.call(engine,.1);assert(events.length>0&&engine.voices===sfx,"music silent or SFX registry not restored");
    S.audioEnabled=false;events.length=0;PipAudioEngine.prototype.scheduleStep.call(engine,.2);assert(events.length===0,"mute ignored");
  });
  test("Gamepad repeats Prism purchases and Continue preserves unspent seeds",()=>{
    transportFixtureB60();openStageUpgrade();S.prismSeeds=3;renderEmotionButtons();
    const rects=new Map();for(const btn of $("stageUp").querySelectorAll("button")){if(btn.getBoundingClientRect().width===0){rects.set(btn,btn.getBoundingClientRect);btn.getBoundingClientRect=()=>({left:0,top:0,width:100,height:50})}}
    const descriptor=Object.getOwnPropertyDescriptor(navigator,"getGamepads"),pad={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
    Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[pad]});
    try{
      focusGamepadButtonB35($("upCompassion"));
      for(let i=0;i<2;i++){pad.buttons[0]={pressed:true,value:1};updateGamepadInput();pad.buttons[0]={pressed:false,value:0};updateGamepadInput()}
      assert(S.pipCompassion===2&&S.prismSeeds===1&&!$("emotionStep").classList.contains("stagehidden"),"controller did not repeat purchases");
      pad.buttons[1]={pressed:true,value:1};updateGamepadInput();assert(!$("abilityStep").classList.contains("stagehidden")&&S.prismSeeds===1,"controller Continue lost seeds");
    }finally{if(descriptor)Object.defineProperty(navigator,"getGamepads",descriptor);else delete navigator.getGamepads;for(const [btn,rect] of rects)btn.getBoundingClientRect=rect;clearGamepadMenuB35()}
  });
  test("Sound Lab pointer, keyboard and gamepad holds share one purchase and audition",()=>{
    const now=performance.now.bind(performance);let clock=10000;
    Object.defineProperty(performance,"now",{configurable:true,value:()=>clock});
    try{for(const route of ["pointer","keyboard","gamepad"]){
      transportFixtureB60();openStageUpgrade();openPipSoundStepB26();S.audioMixCredits=1;S.musicNotes=5;chooseAudioOptionsB41();
      const btn=$("audioChoice0"),rect=btn.getBoundingClientRect;btn.getBoundingClientRect=()=>({left:0,top:0,width:100,height:50});
      try{
        btn.focus();
        if(route==="pointer"){const e=new Event("pointerdown",{bubbles:true,cancelable:true});Object.assign(e,{pointerId:77});btn.dispatchEvent(e)}
        else if(route==="keyboard")window.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));
        else{focusGamepadButtonB35(btn);pressGamepadMenuA_B35()}
        assert(soundLabHold.active,`${route} did not start hold`);clock+=SOUNDLAB_HOLD_MS+1;tickSoundLabHoldB45();
        if(route==="pointer"){const e=new Event("pointerup",{bubbles:true});Object.assign(e,{pointerId:77});btn.dispatchEvent(e)}
        else if(route==="keyboard")window.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",bubbles:true,cancelable:true}));
        else releaseGamepadMenuA_B35();
        btn.click();
        assert(mixLevelB46("heartmix")===1&&S.audioMixCredits===0&&S.musicNotes===3,`${route} charged twice or failed`);
        assert($("mixAuditionStatusB60").textContent.includes("muted"),`${route} did not reach audition`);
      }finally{btn.getBoundingClientRect=rect;cancelSoundLabHoldB45();clearGamepadMenuB35()}
    }}finally{Object.defineProperty(performance,"now",{configurable:true,value:now})}
  });
  reset();return results;
}
