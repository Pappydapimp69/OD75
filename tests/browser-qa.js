// Local-only controls. scripts/serve.mjs injects this on /qa; Pages never includes it.
let qaFrozenB59=false;
let qaPointerB59="";
document.addEventListener("pointerdown",e=>{if(e.target===C)qaPointerB59=`${e.pointerType} ${Math.round(e.clientX)},${Math.round(e.clientY)} @ ${Math.round(performance.now())}`},true);
const qaUpdateB59=update;
update=function(dt){if(!qaFrozenB59)qaUpdateB59(dt)};
const qaPanelB59=document.createElement("section");
qaPanelB59.id="qaPanelB59";
qaPanelB59.style.cssText="position:fixed;z-index:10000;left:8px;bottom:22px;max-width:300px;max-height:42vh;overflow:auto;background:#101820ee;border:1px solid #718599;border-radius:8px;padding:8px;font:11px system-ui;color:white";
qaPanelB59.innerHTML='<b>LOCAL B59 PLAYTEST</b><div style="display:flex;gap:5px;margin:6px 0"><select id="qaBoss" aria-label="Test boss"><option value="1">Grump Star</option><option value="5">Velvet Fang</option><option value="7">Static Bloom</option></select><select id="qaTrait" aria-label="Test traits"><option value="love">Loving</option><option value="compassion">Compassionate</option><option value="support" selected>Supportive</option><option value="mixed">Mixed</option><option value="none">None</option></select></div><div id="qaButtons" style="display:flex;gap:4px;flex-wrap:wrap"></div><pre id="qaStatus" style="white-space:pre-wrap;margin:6px 0"></pre><pre id="qaResults" style="white-space:pre-wrap"></pre>';
document.body.appendChild(qaPanelB59);
function qaButtonB59(label,fn){const button=document.createElement("button");button.textContent=label;button.style.cssText="background:#233c4d;border:1px solid #738fa5;border-radius:4px;font:11px system-ui;padding:4px";button.addEventListener("click",fn);$("qaButtons").appendChild(button)}
function qaEncounterB59(){
  qaFrozenB59=false;const kind=$("qaTrait").value,traits=kind==="mixed"?{love:2,compassion:2,support:2}:kind==="none"?{}:{[kind]:3};
  const e=fixtureB59(Number($("qaBoss").value),traits);e.hp=e.maxHp=250;S.attackCd=.5;S.shields=3;S.audioEnabled=false;return e;
}
function qaStatusB59(){
  const e=enemies?.find(e=>e.b59&&!e.dead),b=S?.b59;
  if(!b)return;
  updateUI();
  $("qaStatus").textContent=`${qaFrozenB59?"FROZEN":"LIVE"} · ${e?bossData(e.bossKey).name:"no boss"}\n${e?.b59.phase||S.waveState} · ${e?.b59.timer.toFixed(2)||""}s · HP ${Math.ceil(S.health)} / shields ${S.shields}\nPip ${S.pipState} · bond ${pipBondB51().toFixed(2)}\nRally ${b.stats.rally} · Cover ${b.stats.cover} · Setup ${b.stats.setup} · Joint ${b.stats.joint} · Gap ${b.stats.gap}\nPlayer screen ${Math.round(worldToScreenX(P.x))},${Math.round(worldToScreenY(P.y))}${b.setup?`\nDiamond screen ${Math.round(worldToScreenX(b.setup.x))},${Math.round(worldToScreenY(b.setup.y))}`:""}\nDashes ${b.dashSerial} · ${qaPointerB59}`;
}
qaButtonB59("Load encounter",()=>{qaEncounterB59();qaStatusB59()});
qaButtonB59("Freeze / play",()=>{qaFrozenB59=!qaFrozenB59;qaStatusB59()});
qaButtonB59("Step 0.1s",()=>{qaFrozenB59=true;for(let i=0;i<6;i++)qaUpdateB59(1/60);qaStatusB59()});
qaButtonB59("Second phase",()=>{const e=enemies.find(e=>e.b59);if(e)e.hp=e.maxHp*.45;qaStatusB59()});
qaButtonB59("Joint opportunity",()=>{
  $("qaTrait").value="support";const e=qaEncounterB59();e.x=105;e.y=0;bossPhaseB59(e,"recover",2);e.b59.clean=true;
  markSetupB59(e);qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Bloom node",()=>{
  $("qaTrait").value="support";$("qaBoss").value="7";const e=qaEncounterB59();e.x=140;e.y=0;e.b59.gapAngle=Math.PI;
  fireBloomB59(e);markSetupB59(e,"petal");qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Rally trip",()=>{
  $("qaTrait").value="love";qaEncounterB59();P.pipX=145;S.pipState="collect";S.pipTarget={x:250,y:0,life:10,dead:false};S.b51PipBond=.2;
  qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Cover shot",()=>{
  $("qaTrait").value="compassion";qaEncounterB59();S.shields=0;enemyShots=[{x:50,y:0,vx:-160,vy:0,life:2,r:5,c:"#ff8fcf"}];
  qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Trait shop",()=>{
  qaEncounterB59();S.run=false;S.stagePending=true;S.prismSeeds=3;renderEmotionButtons();$("stageUp").classList.remove("hidden");
  for(const id of ["abilityStep","overdriveStep","bossRewardStep","audioStep","pipSoundStep"])$(id)?.classList.add("stagehidden");$("emotionStep").classList.remove("stagehidden");
});
qaButtonB59("Sound Lab",()=>{
  qaEncounterB59();S.run=false;S.stagePending=true;S.musicNotes=10;S.pipSoundCredits=3;S.audioMixCredits=3;
  $("stageUp").classList.remove("hidden");openPipSoundStepB26();
});
qaButtonB59("Ascend",()=>{
  $("qaTrait").value="mixed";qaEncounterB59();S.pipCompassion=4;S.overType="pip";S.overLevels.pip=1;S.heat=100;triggerOverdrive();
});
qaButtonB59("Run checks",()=>{
  qaFrozenB59=false;const saved={...settingsB61};applySettingsB61(B61_DEFAULTS);
  const results=[...runPartnershipChecksB59(),...runTransportChecksB60(),...runSettingsChecksB61(),...runSurvivalChecksB63()];applySettingsB61(saved);
  $("qaResults").textContent=results.map(r=>`${r.ok?"PASS":"FAIL"} ${r.name}${r.error?": "+r.error:""}`).join("\n")+`\n${results.filter(r=>r.ok).length}/${results.length} passed`;
  qaStatusB59();
});
qaButtonB59("Hide QA",()=>qaPanelB59.style.display="none");
setInterval(qaStatusB59,200);
qaButtonB59("Cargo trip",()=>{
  transportFixtureB60();P.pipX=24;S.pipState="orbit";S.pipRangeLv=10;applyPipPower();
  heartBits=Array.from({length:13},(_,i)=>heartFixtureB60(100+(i%4)*15,Math.floor(i/4)*12));
  qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Full cargo",()=>{
  transportFixtureB60();transportB60().cargo=Array.from({length:4},()=>heartFixtureB60());S.pipState="return";P.pipX=170;
  qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Meet Pip",()=>{P.x=P.pipX-20;P.y=P.pipY;qaUpdateB59(.02);qaStatusB59()});
qaButtonB59("Emergency return",()=>{
  transportFixtureB60();S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState="collect";
  transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];hurt();updateUI();qaFrozenB59=true;qaStatusB59();
});
qaButtonB59("Hold Heart Mix",()=>{
  const button=$("audioChoice0");button.focus();
  window.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));
  setTimeout(()=>window.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",bubbles:true,cancelable:true})),SOUNDLAB_HOLD_MS+150);
});
const qaCargoB60=document.createElement("pre");qaCargoB60.id="qaCargoB60";qaCargoB60.style.whiteSpace="pre-wrap";qaPanelB59.appendChild(qaCargoB60);
setInterval(()=>{if(S?.b60)qaCargoB60.textContent=`Cargo ${S.b60.cargo.length} · weight ${cargoWeightB60()}/${S.pipCarryCapacity} · speed ${carrySpeedB60().toFixed(1)}\nBank ${S.heartCurrency} · Ground ${heartBits.length} · Relay ${S.pipRelayBuff.toFixed(2)} / CD ${S.b60.relayCd.toFixed(2)}\nAudio ${audioCtx?.state||"none"} · music voices ${audioEngine?.b60MusicVoices?.size||0} · sfx ${audioEngine?.voices?.size||0}`},200);
