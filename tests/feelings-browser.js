// Local fixtures use the production decision/update path; never shipped to Pages.
qaButtonB59('B76 confident trip',()=>loadFeelingsSceneB76(false));
qaButtonB59('B76 cautious trip',()=>loadFeelingsSceneB76(true));
function loadFeelingsSceneB76(cautious){
  transportFixtureB60();S.shields=3;P.pipX=120;S.pipDetectRange=200;
  transportB60().cargo=[makeHeartSourceB74(1,0,0),makeHeartSourceB74(1,0,0)];
  S.pipTarget=makeHeartSourceB74(8,190,0,50);heartBits=[S.pipTarget];
  const f=feelingsB76();f.trip={time:2,maxDistance:150,danger:0,rough:false,approached:false};
  f.worry=cautious?.9:0;f.trust=cautious?.25:.9;f.pride=cautious?.5:.9;
  qaFrozenB59=true;qaUpdateB59(.04);updateUI();qaStatusB59();
}
qaButtonB59('B76 behavior checks',()=>{$('qaResults').textContent=runFeelingsChecksB76().map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.error?': '+r.error:''}`).join('\n');qaFrozenB59=true});
