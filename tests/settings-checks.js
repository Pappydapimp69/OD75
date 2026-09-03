function runSettingsChecksB61(){
  const results=[],saved={...settingsB61},stored=localStorage.getItem(B61_SETTINGS_KEY);
  const assert=(ok,message)=>{if(!ok)throw Error(message)},near=(a,b)=>Math.abs(a-b)<.00001;
  const preset={...B61_DEFAULTS,pipBase:140,swiftFlat:10,swiftMode:'alternating',fullSpeed:35};
  const test=(name,fn)=>{try{applySettingsB61(B61_DEFAULTS);transportFixtureB60();fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test('Default settings preserve B60 movement at every Swift level',()=>{
    for(let lv=0;lv<=8;lv++){S.pipSpeedLv=lv;applyPipPower();assert(S.pipMoveSpeed===285+34*lv,'Swift default changed')}
    assert(playerSpeedB61()===205,'player default changed');
  });
  test('Alternating Swift compounds the proposed sequence through level 8',()=>{
    applySettingsB61(preset);
    const expected=[140,150,151.5,161.5,163.115,173.115,174.84615,184.84615,186.6946115];
    expected.forEach((speed,lv)=>{S.pipSpeedLv=lv;applyPipPower();assert(near(S.pipMoveSpeed,speed),'wrong level '+lv)});
    S.pipRangeLv=20;applyPipPower();assert(near(S.pipMoveSpeed,expected[8]),'Heart Sense changed speed');
  });
  test('Configured cargo slowdown is linear on gather and return, clamped at full load',()=>{
    applySettingsB61(preset);S.pipCarryCapacity=10;
    for(const count of [0,1,2,3,4]){
      transportB60().cargo=Array.from({length:count},()=>heartFixtureB60());
      const speed=140*(1-.65*Math.min(count*3/10,1));
      for(const state of ['collect','return']){S.pipState=state;P.pipX=0;P.pipY=0;flyPipB60(1000,0,.1);assert(near(P.pipX,speed*.1),'wrong '+state+' speed at '+count)}
    }
  });
  test('Applying paused settings changes movement without altering cargo, upgrades or timers',()=>{
    S.pipSpeedLv=3;applyPipPower();transportB60().cargo=[heartFixtureB60()];openAscendedPauseB39();selectPauseTabB61('settings');
    const state=JSON.stringify([transportB60().cargo,S.pipSpeedLv,S.pipRangeLv,S.heartCurrency,S.t,S.b51PipBond]);
    P.vx=205;P.vy=0;applySettingsB61({...preset,playerSpeed:100});update(.5);
    assert(near(S.pipMoveSpeed,161.5)&&P.vx===100,'movement did not apply');
    assert(JSON.stringify([transportB60().cargo,S.pipSpeedLv,S.pipRangeLv,S.heartCurrency,S.t,S.b51PipBond])===state,'run state changed');
    assert(S.b39Paused&&!S.run&&b39Pause.open,'applying resumed gameplay');
    assert($('b39CoreList').textContent.includes('35%'),'pause copy stale');
    assert(pipAbilityEffectText('speed').includes('163.1'),'shop preview stale');closeAscendedPauseB39();
  });
  test('Normal player movement uses the configured cap through the full update chain',()=>{
    applySettingsB61({...preset,playerSpeed:100});P.vx=0;P.vy=0;keys.add('d');
    try{stepB59(2);assert(near(hyp(P.vx,P.vy),100),'normal movement ignored configured cap')}
    finally{keys.clear()}
  });
  test('Invalid tuning is rejected without replacing applied or saved values',()=>{
    const before=JSON.stringify(settingsB61),storage=localStorage.getItem(B61_SETTINGS_KEY);
    for(const raw of [{...preset,pipBase:''},{...preset,pipBase:NaN},{...preset,fullSpeed:0},{...preset,playerSpeed:1001},{...preset,swiftMode:'oops'}])assert(!applySettingsB61(raw).ok,'invalid accepted');
    assert(JSON.stringify(settingsB61)===before&&localStorage.getItem(B61_SETTINGS_KEY)===storage,'invalid value mutated settings');
  });
  test('Presets remain drafts until Apply, persist, and survive a new run',()=>{
    S.run=false;openMainSettingsB61();$('settingsPresetB61').click();
    assert(settingsB61.pipBase===285&&$('setting-pipBase').value==='140','preset applied without confirmation');
    $('settingsFormB61').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    assert(loadSettingsB61().pipBase===140&&settingsB61.swiftMode==='alternating','Apply did not save');
    closeMainSettingsB61();reset();assert(S.pipMoveSpeed===140&&settingsB61.fullSpeed===35,'reset lost tuning');
    openMainSettingsB61();$('settingsDefaultsB61').click();assert(settingsB61.pipBase===140,'defaults applied prematurely');
    $('settingsFormB61').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));assert(S.pipMoveSpeed===285,'defaults failed');closeMainSettingsB61();
  });
  test('Corrupt or out-of-range saved tuning safely falls back to B60',()=>{
    for(const data of ['{bad',JSON.stringify({...preset,fullSpeed:300}),'null']){localStorage.setItem(B61_SETTINGS_KEY,data);assert(loadSettingsB61().pipBase===285,'corrupt storage accepted')}
  });
  test('Settings keyboard input stays paused; tab arrows and Escape remain usable',()=>{
    openAscendedPauseB39();$('buildTabB61').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(!$('settingsPaneB61').hidden,'tab arrow failed');const input=$('setting-pipBase');input.focus();const serial=S.b59.dashSerial;
    for(const key of [' ','p','e'])input.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
    assert(b39Pause.open&&S.b59.dashSerial===serial&&!keys.size,'typing triggered gameplay');
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert(!b39Pause.open&&S.run,'Escape failed');
  });
  test('Controller opens main settings, edits values, selects pause tabs and resumes without dashing',()=>{
    const descriptor=Object.getOwnPropertyDescriptor(navigator,'getGamepads');
    const pad={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
    const press=i=>{pad.buttons[i]={pressed:true,value:1};updateGamepadInput()},release=i=>{pad.buttons[i]={pressed:false,value:0};updateGamepadInput()};
    try{
      S.run=false;$('start').classList.remove('hidden');updateGamepadInput();press(3);release(3);assert(mainSettingsOpenB61,'Y did not open settings');
      press(15);release(15);assert($('setting-pipBase').value==='286','D-pad did not adjust');
      $('settingsFormB61').querySelector('[type=submit]').focus();press(0);release(0);assert(settingsB61.pipBase===286&&!S.run,'A failed Apply or started game');
      press(1);release(1);assert(!mainSettingsOpenB61&&!S.run,'B started gameplay');
      $('start').classList.add('hidden');S.run=true;press(9);release(9);assert(b39Pause.open,'Start did not pause');
      press(15);release(15);assert(!$('settingsPaneB61').hidden,'controller tab failed');
      press(13);release(13);assert(document.activeElement===$('setting-pipBase'),'controller field navigation failed');
      $('settingsPresetB61').focus();press(0);release(0);assert(b39Pause.open&&$('setting-pipBase').value==='140','A resumed instead of loading draft');
      const serial=S.b59.dashSerial;press(1);updateGamepadInput();assert(!b39Pause.open&&S.b59.dashSerial===serial,'B resume became dash');release(1);
    }finally{if(descriptor)Object.defineProperty(navigator,'getGamepads',descriptor);else delete navigator.getGamepads;reset()}
  });
  test('Loneliness starts only at zero and multiplies every cargo load after Swift tuning',()=>{
    for(const config of [B61_DEFAULTS,preset]){
      applySettingsB61(config);S.pipSpeedLv=4;applyPipPower();
      for(const count of [0,1,3,4]){
        transportB60().cargo=Array.from({length:count},()=>heartFixtureB60());
        const normal=swiftSpeedB61(4)*(1-(1-config.fullSpeed/100)*Math.min(count*3/10,1));
        for(const bond of [1,.5,.00001,0]){S.b51PipBond=bond;assert(near(carrySpeedB60(),normal*(bond===0?.9:1)),'wrong load/bond speed')}
        S.b51PipBond=.001;assert(near(carrySpeedB60(),normal),'penalty survived recovery');
      }
    }
  });
  test('Lonely gather and return movement use the penalty through the complete update chain',()=>{
    applySettingsB61(preset);
    for(const state of ['collect','return']){
      transportFixtureB60();S.b51PipBond=0;S.pipState=state;
      transportB60().cargo=Array.from({length:3},()=>heartFixtureB60());
      const target=heartFixtureB60(500);heartBits=[target];S.pipTarget=target;
      const before=P.pipX,speed=140*(1-.65*.9)*.9;update(.02);
      assert(near(P.pipX-before,(state==='collect'?1:-1)*speed*.02),'actual '+state+' displacement ignored loneliness');
    }
  });
  test('Reunion clears loneliness immediately without compounding or changing base speeds',()=>{
    applySettingsB61(preset);S.b51PipBond=0;transportB60().cargo=[heartFixtureB60()];P.x=P.pipX-20;
    update(.02);assert(pipBondB51()===1&&S.pipState==='orbit'&&cargoWeightB60()===0,'reunion did not restore heart');
    assert(carrySpeedB60()===140&&S.pipMoveSpeed===140&&playerSpeedB61()===205,'speed was permanently reduced');
    for(let i=0;i<5;i++){S.b51PipBond=0;assert(carrySpeedB60()===126,'penalty compounded');S.b51PipBond=1;assert(carrySpeedB60()===140,'penalty stuck')}
  });
  test('Pause freezes a lonely cargo trip and inspection explains the speed penalty',()=>{
    S.b51PipBond=0;S.pipState='return';transportB60().cargo=[heartFixtureB60()];openAscendedPauseB39();
    const before=JSON.stringify([P.pipX,P.pipY,S.t,cargoWeightB60(),pipBondB51(),carrySpeedB60()]);stepB59(.5);
    assert(JSON.stringify([P.pipX,P.pipY,S.t,cargoWeightB60(),pipBondB51(),carrySpeedB60()])===before,'pause advanced lonely trip');
    assert($('b39CoreList').textContent.includes('another 10% slower')&&$('lonelyNoteB62').textContent.includes('after cargo slowdown'),'inspection missing penalty');closeAscendedPauseB39();
  });
  applySettingsB61(saved);if(stored===null)localStorage.removeItem(B61_SETTINGS_KEY);else localStorage.setItem(B61_SETTINGS_KEY,stored);
  reset();S.audioEnabled=false;return results;
}
