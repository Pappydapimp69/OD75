function runHeartfieldChecksB74(){
  const results=[],savedSettings={...settingsB74},stored=localStorage.getItem(B74_SETTINGS_KEY);
  const assert=(ok,message)=>{if(!ok)throw Error(message)},near=(a,b,eps=.00001)=>Math.abs(a-b)<eps;
  const test=(name,fn)=>{try{applySettingsB74(B74_DEFAULTS);transportFixtureB60();fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test('Weighted ordinary drops preserve exact enemy averages and boundaries',()=>{
    assert(rollHeartValueB74('chaser',.14)===0&&rollHeartValueB74('chaser',.15)===1&&rollHeartValueB74('chaser',.9)===2&&rollHeartValueB74('chaser',.99)===3,'chaser boundaries wrong');
    assert(rollHeartValueB74('core',.04)===0&&rollHeartValueB74('charger',.1)===1&&rollHeartValueB74('core',.5)===2&&rollHeartValueB74('charger',.9)===3,'rich boundaries wrong');
    const mean=table=>table.reduce((sum,[limit,value],i)=>sum+(limit-(i?table[i-1][0]:0))*value,0);
    assert(near(mean(B74_DROP_TABLES.chaser),1)&&near(mean(B74_DROP_TABLES.rich),2),'drop averages drifted');
  });
  test('Heart value is conserved across loose, node and cargo storage',()=>{
    const cluster=makeHeartSourceB74(3,20,0),node={b74Node:true,id:nextHeartfieldIdB74(),x:40,y:0,lives:[8,9]};
    heartBits=[cluster];heartfieldB74().nodes=[node];transportB60().cargo=[makeHeartSourceB74(1,0,0)];
    assert(looseHeartValueB74()===3&&nodeHeartValueB74()===2&&cargoHeartValueB74()===1&&totalFieldValueB74()===6,'value helpers disagree');
  });
  test('Eligible drops deterministically form one capped node',()=>{
    heartBits=[0,1,2].map(i=>makeHeartSourceB74(1,i*12,0));heartBits.forEach(h=>h.b74Age=3);scanHeartNodesB74();
    assert(heartfieldB74().nodes.length===1&&heartBits.every(h=>h.b74NodeId===heartfieldB74().nodes[0].id),'node assignment failed');
    for(let i=0;i<10;i++)updateNodeSpiralsB74(.04);
    assert(nodeHeartValueB74()===3&&looseHeartValueB74()===0,'spiral transfer lost value');
  });
  test('Partial absorption fills a node and preserves the remainder',()=>{
    const node={b74Node:true,id:nextHeartfieldIdB74(),x:0,y:0,lives:Array(7).fill(8)},cluster=makeHeartSourceB74(3,0,0);
    heartfieldB74().nodes=[node];heartBits=[cluster];cluster.b74NodeId=node.id;transferIntoNodeB74(cluster,node);
    assert(heartValueB74(node)===8&&heartValueB74(cluster)===2&&!cluster.b74NodeId,'partial absorption wrong');
  });
  test('Cluster and node expiration removes individual values without extension',()=>{
    const cluster=makeHeartSourceB74(2,0,0);cluster.b74Lives=[.01,1];const node={b74Node:true,id:nextHeartfieldIdB74(),x:20,y:0,lives:[.01,2],sparkle:3,flash:0};
    heartBits=[cluster];heartfieldB74().nodes=[node];updateHeartLifetimesB74(.02);
    assert(heartValueB74(cluster)===1&&near(cluster.b74Lives[0],.98)&&heartValueB74(node)===1&&near(node.lives[0],1.98),'individual expiry wrong');
  });
  test('Route scoring favors value until an old heart becomes urgent',()=>{
    S.pipDetectRange=200;P.pipX=0;P.pipY=0;const near=makeHeartSourceB74(1,20,0),node={b74Node:true,id:nextHeartfieldIdB74(),x:70,y:0,lives:[9,9,9],sparkle:3,flash:0};
    heartBits=[near];heartfieldB74().nodes=[node];assert(nextHeartSourceB74()===node,'reachable value not preferred');near.b74Lives=[.05];assert(nextHeartSourceB74()===near,'expiry urgency not preferred');
  });
  test('Singles remain instant while clusters use the mining cadence',()=>{
    const single=makeHeartSourceB74(1,P.pipX,P.pipY);heartBits=[single];S.pipState='collect';assert(gatherHeartB60(single)&&transportB60().cargo[0]===single,'single pickup changed');
    transportFixtureB60();const cluster=makeHeartSourceB74(3,P.pipX,P.pipY);heartBits=[cluster];S.pipState='collect';S.pipTarget=cluster;
    tickMiningB74(cluster,.17);assert(!cargoHeartValueB74(),'cluster mined early');tickMiningB74(cluster,.02);assert(cargoHeartValueB74()===1&&heartValueB74(cluster)===2,'cluster cadence wrong');
  });
  test('Mining keeps the one-heart overflow rule and leaves source value behind',()=>{
    transportB60().cargo=Array.from({length:3},()=>makeHeartSourceB74(1,0,0));const cluster=makeHeartSourceB74(2,P.pipX,P.pipY);heartBits=[cluster];S.pipState='collect';S.pipTarget=cluster;
    tickMiningB74(cluster,.2);assert(cargoWeightB60()===12&&heartValueB74(cluster)===1&&S.pipState==='return','overflow or remainder wrong');
  });
  test('Reunion banks one batch, one tier cue and one Relay trigger',()=>{
    S.stage=4;S.runHearts=19;S.stageCurrency=0;S.pipBossPowers.relay=1;transportB60().cargo=Array.from({length:4},()=>makeHeartSourceB74(1,0,0));
    const beforePopup=popup,seen=[];popup=(...args)=>seen.push(args);
    try{assert(deliverCargoB60()===4,'batch count wrong')}finally{popup=beforePopup}
    assert(S.runHearts===23&&S.heartCurrency===4&&S.stageCurrency===4&&S.b73DifficultyTier===2,'batch accounting or tier wrong');
    assert(seen.filter(args=>String(args[2]).includes('♥ +4')).length===1&&transportB60().relayCd===8,'feedback or Relay repeated');
  });
  test('Emergency cargo remains singleton protected value and releases mining',()=>{
    S.pipSupport=1;S.shields=1;S.pipState='collect';const cluster=makeHeartSourceB74(3,P.pipX,P.pipY);heartBits=[cluster];heartfieldB74().mining={source:cluster,time:.1};
    transportB60().cargo=[makeHeartSourceB74(1,P.pipX,P.pipY),makeHeartSourceB74(1,P.pipX,P.pipY)];dropCargoB63();
    assert(!heartfieldB74().mining&&safeCargoCountB67()===2&&heartBits.filter(h=>h.b67SafeDrop).every(h=>heartValueB74(h)===1),'protected cargo integration wrong');
  });
  test('Heartfield settings validate, persist and keep movement settings independent',()=>{
    const movement=JSON.stringify(settingsB61);assert(applySettingsB74(B74_PRESETS.dense).ok&&loadSettingsB74().cap===10,'dense preset failed');
    assert(JSON.stringify(settingsB61)===movement,'Heartfield changed movement settings');
    for(const raw of [{...B74_DEFAULTS,radius:99},{...B74_DEFAULTS,settle:9},{...B74_DEFAULTS,cap:2},{...B74_DEFAULTS,mine:0}])assert(!applySettingsB74(raw).ok,'invalid Heartfield setting accepted');
  });
  test('Heartfield presets stay draft and controller routes can edit and apply them',()=>{
    const descriptor=Object.getOwnPropertyDescriptor(navigator,'getGamepads'),pad={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});const press=i=>{pad.buttons[i]={pressed:true,value:1};updateGamepadInput()},release=i=>{pad.buttons[i]={pressed:false,value:0};updateGamepadInput()};
    try{S.run=false;openMainSettingsB61();$('heartfieldSettingsB74').open=true;document.querySelector('[data-b74-preset="dense"]').click();
      assert(settingsB74.cap===8&&$('setting-b74-cap').value==='10','preset applied without confirmation');
      $('setting-b74-radius').focus();press(15);release(15);assert($('setting-b74-radius').value==='285','controller did not edit Heartfield field');
      $('settingsFormB61').querySelector('[type=submit]').focus();press(0);release(0);assert(settingsB74.radius===285&&settingsB74.cap===10,'controller did not apply Heartfield draft');
    }finally{if(mainSettingsOpenB61)closeMainSettingsB61();if(descriptor)Object.defineProperty(navigator,'getGamepads',descriptor);else delete navigator.getGamepads}
  });
  test('Final pause guard freezes every Heartfield clock together',()=>{
    const source=makeHeartSourceB74(3,0,0);source.b74Age=3;heartBits=[source];const node={b74Node:true,id:nextHeartfieldIdB74(),x:10,y:0,lives:[8],sparkle:2,flash:0};heartfieldB74().nodes=[node];heartfieldB74().scan=.2;heartfieldB74().audioCd=.1;
    S.b39Paused=true;const before=JSON.stringify([source.b74Lives,source.b74Age,node.lives,node.sparkle,S.b74.scan,S.b74.audioCd]);update(.04);
    assert(JSON.stringify([source.b74Lives,source.b74Age,node.lives,node.sparkle,S.b74.scan,S.b74.audioCd])===before,'pause advanced Heartfield');
    S.b39Paused=false;update(.04);assert(source.b74Age>3&&node.lives[0]<8&&S.b74.scan<.2&&S.b74.audioCd<.1,'resume did not advance Heartfield');
  });
  test('Dense field soak stays bounded, finite and conserved until expiry',()=>{
    applySettingsB74({...B74_DEFAULTS,settle:.5});heartBits=Array.from({length:200},(_,i)=>makeHeartSourceB74(1,(i%20)*18,Math.floor(i/20)*18,60));heartBits.forEach(h=>h.b74Age=1);
    const start=totalFieldValueB74();for(let i=0;i<80;i++){scanHeartNodesB74();updateNodeSpiralsB74(.04)}
    const positions=[...heartBits,...heartfieldB74().nodes].every(o=>Number.isFinite(o.x)&&Number.isFinite(o.y));
    assert(totalFieldValueB74()===start&&heartfieldB74().nodes.length<=B74_MAX_NODES&&positions,'soak lost value or escaped bounds');
    assert(new Set([...heartBits.map(h=>h.b74Id),...heartfieldB74().nodes.map(n=>n.id)]).size===heartBits.length+heartfieldB74().nodes.length,'duplicate IDs');
  });
  applySettingsB74(savedSettings);if(stored===null)localStorage.removeItem(B74_SETTINGS_KEY);else localStorage.setItem(B74_SETTINGS_KEY,stored);reset();S.audioEnabled=false;return results;
}
