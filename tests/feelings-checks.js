function runFeelingsChecksB76(){
  const results=[],assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const test=(name,fn)=>{try{transportFixtureB60();S.shields=3;fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  const load=()=>{transportB60().cargo=[makeHeartSourceB74(1,0,0),makeHeartSourceB74(1,0,0)];S.pipState='collect';S.pipTarget=makeHeartSourceB74(3,210,0);heartBits=[S.pipTarget]};
  test('Experience changes actual source selection without changing detection range',()=>{
    P.pipX=0;S.pipDetectRange=200;
    const near=makeHeartSourceB74(1,25,0),rich=makeHeartSourceB74(2,150,0);heartBits=[near,rich];
    enemies=[{x:150,y:0,type:'chaser',dead:false},{x:165,y:0,type:'chaser',dead:false}];
    const f=feelingsB76();f.pride=.9;f.trust=.9;assert(nextHeartSourceB74()===rich,'confident Pip did not choose value');
    f.worry=1;f.pride=.5;assert(nextHeartSourceB74()===near,'worried Pip did not choose safer source');
  });
  test('Same cargo and field produce different return commitments after experience',()=>{
    load();const f=feelingsB76();f.trip={time:2,maxDistance:150,danger:0,rough:false,approached:false};
    f.worry=.9;f.trust=.25;decidePipB76();assert(S.pipState==='return'&&f.intent==='cautious','cautious load did not return');
    S.pipState='collect';f.worry=0;f.trust=.9;f.pride=.9;decidePipB76();assert(S.pipState==='collect','confident load returned early');
  });
  test('Sustained player approach causes physical partial-load rendezvous',()=>{
    load();const bank=S.heartCurrency;P.pipX=160;feelingsB76().px=0;
    for(let i=0;i<16;i++){P.x+=2;observePipB76(.04)}
    decidePipB76();assert(S.pipState==='return'&&feelingsB76().intent==='meet','approach not recognized');
    const x=P.pipX;updatePipTransportB60(.04);assert(P.pipX<x&&S.heartCurrency===bank,'return teleported or banked remotely');
    for(let i=0;i<150&&S.pipState!=='orbit';i++)updatePipTransportB60(.04);
    assert(S.heartCurrency===bank+2&&feelingsB76().stats.met===1,'delivery/recognition not recorded exactly once');
    reunitePipB60();assert(S.heartCurrency===bank+2&&feelingsB76().stats.met===1,'duplicate reward or memory');
  });
  test('Pip-only closure, lateral movement and dashes do not imply player intent',()=>{
    load();for(let i=0;i<20;i++){P.pipX-=2;observePipB76(.04)}assert(!feelingsB76().trip.approached,'Pip motion mistaken for player');
    for(let i=0;i<20;i++){P.y+=2;observePipB76(.04)}assert(!feelingsB76().trip.approached,'lateral pass recognized');
    S.dashTime=1;for(let i=0;i<10;i++){P.x+=4;observePipB76(.04)}assert(!feelingsB76().trip.approached,'dash recognized');
  });
  test('Rough trip learns caution and holds physically reunited Pip briefly',()=>{
    load();const f=feelingsB76();f.trip={time:2,maxDistance:150,danger:0,rough:true,approached:false};P.pipX=20;
    reunitePipB60();assert(f.stats.rough===1&&f.worry>0&&transportB60().rest===1.2,'rough reunion not learned');
    updatePipTransportB60(.04);assert(S.pipState==='orbit','recovery hold ignored');
    for(let i=0;i<40;i++)updatePipTransportB60(.04);assert(f.hold===0,'recovery hold never ends');
  });
  test('Real damage marks one rough episode and protection does not invent one',()=>{
    load();observePipB76(.04);S.invuln=1;hurt();assert(!feelingsB76().trip.rough,'protected hit learned danger');
    S.invuln=0;hurt();assert(feelingsB76().trip.rough,'actual distant damage missed');
    const worry=feelingsB76().worry;S.invuln=0;hurt();assert(feelingsB76().worry===worry,'one trip repeatedly penalized');
  });
  test('Completed safe trips actually build trust and pride; empty reunions do not',()=>{
    const f=feelingsB76();
    for(let trip=0;trip<4;trip++){
      load();P.pipX=150;for(let i=0;i<20;i++)observePipB76(.04);
      S.pipState='return';for(let i=0;i<150&&S.pipState!=='orbit';i++)updatePipTransportB60(.04);
    }
    assert(f.stats.safe===4&&f.trust>.75&&f.pride>.65,'real trips did not teach confidence');
    const trust=f.trust;for(let i=0;i<5;i++)reunitePipB60();assert(f.trust===trust,'empty reunion farmed trust');
  });
  test('A danger-driven partial return retains its reason until reunion',()=>{
    load();const f=feelingsB76();f.trip={time:2,maxDistance:150,danger:1,rough:false,approached:false};
    f.motives={concern:1,attachment:.3};decidePipB76();assert(S.pipState==='return'&&f.trip.rough,'danger return not committed');
    f.trip.danger=0;P.pipX=20;reunitePipB60();assert(f.stats.rough===1&&f.hold>0,'safe arrival erased dangerous trip');
  });
  test('Emotional line survives the existing generic mood refresh',()=>{
    setIntentB76('cautious','Taking a shorter trip','these will do. coming home.');updateUI();
    assert($('pipMood').textContent.includes('these will do'),'generic praise overwrote intention');
  });
  test('Pause freezes memory through the final assembled update',()=>{
    load();observePipB76(.04);feelingsB76().hold=1;S.b39Paused=true;const before=JSON.stringify(feelingsB76());
    stepB59(.5);assert(JSON.stringify(feelingsB76())===before,'pause advanced emotion');
  });
  test('Stage cleanup preserves learning while a new run clears it',()=>{
    const f=feelingsB76();f.trust=.8;f.stats.safe=3;f.trip={time:2};openStageUpgrade();
    assert(f.trust===.8&&f.stats.safe===3&&f.trip===null,'stage lost learning or kept stale trip');reset();assert(feelingsB76().trust===.5&&feelingsB76().stats.safe===0,'new run retained memory');
  });
  test('Loving and Supportive retain precedence over emotional collection',()=>{
    load();const f=feelingsB76();f.trip={time:2,maxDistance:150,danger:2,approached:true};S.b59.rallyReturn=true;
    decidePipB76();assert(f.intent==='rally','Rally overridden');S.b59.rallyReturn=false;S.pipSupport=1;S.shields=1;
    updatePipCompanion(.04);assert(f.intent==='support'&&cargoHeartValueB74()===0&&safeCargoCountB67()===2,'emergency cargo/priority changed');
  });
  reset();return results;
}
