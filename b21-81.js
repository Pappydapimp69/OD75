// B92 Sound engine overhaul: protected cues, spatial impacts, adaptive mix and final limiting.
const B92_PRIORITY={routine:0,action:1,important:2,critical:3};
function installAudioEngineB92(engine){
  if(!engine||engine.b92Installed)return engine;engine.b92Installed=true;
  engine.b92Intensity=0;engine.b92TargetIntensity=0;engine.b92SpatialPan=0;engine.b92CurrentPriority=0;engine.b92StolenVoices=0;
  const ctx=engine.ctx;
  if(ctx&&engine.sfx&&engine.master&&ctx.createBiquadFilter&&ctx.createDynamicsCompressor){
    engine.b92SfxClean=ctx.createBiquadFilter();engine.b92SfxClean.type='highpass';engine.b92SfxClean.frequency.value=55;engine.b92SfxClean.Q.value=.35;
    engine.b92SfxPresence=ctx.createBiquadFilter();engine.b92SfxPresence.type='peaking';engine.b92SfxPresence.frequency.value=2300;engine.b92SfxPresence.Q.value=.72;engine.b92SfxPresence.gain.value=1.8;
    engine.b92SfxComp=ctx.createDynamicsCompressor();engine.b92SfxComp.threshold.value=-14;engine.b92SfxComp.knee.value=8;engine.b92SfxComp.ratio.value=2.4;engine.b92SfxComp.attack.value=.003;engine.b92SfxComp.release.value=.09;
    try{engine.sfx.disconnect()}catch(_){}engine.sfx.connect(engine.b92SfxClean);engine.b92SfxClean.connect(engine.b92SfxPresence);engine.b92SfxPresence.connect(engine.b92SfxComp);engine.b92SfxComp.connect(engine.master);
  }
  if(ctx&&engine.compressor&&ctx.destination&&ctx.createBiquadFilter&&ctx.createDynamicsCompressor){
    engine.b92RumbleCut=ctx.createBiquadFilter();engine.b92RumbleCut.type='highpass';engine.b92RumbleCut.frequency.value=28;engine.b92RumbleCut.Q.value=.25;
    engine.b92Limiter=ctx.createDynamicsCompressor();engine.b92Limiter.threshold.value=-3;engine.b92Limiter.knee.value=0;engine.b92Limiter.ratio.value=20;engine.b92Limiter.attack.value=.002;engine.b92Limiter.release.value=.08;
    try{engine.compressor.disconnect()}catch(_){}engine.compressor.connect(engine.b92RumbleCut);engine.b92RumbleCut.connect(engine.b92Limiter);engine.b92Limiter.connect(ctx.destination);
  }
  return engine;
}
const installAudioBeforeB92=installAudioEngineB42;
installAudioEngineB42=function(engine){return installAudioEngineB92(installAudioBeforeB92(engine))};
if(audioEngine)installAudioEngineB92(audioEngine);

function withAudioPriorityB92(engine,priority,fn){if(!engine)return;const old=engine.b92CurrentPriority||0;engine.b92CurrentPriority=Math.max(old,priority);try{return fn()}finally{engine.b92CurrentPriority=old}}
const registerBeforeB92=PipAudioEngine.prototype.register;
PipAudioEngine.prototype.register=function(endNode,nodes){
  installAudioEngineB92(this);const registry=this.voices,priority=this.b92CurrentPriority||0;
  if(registry?.size>=this.voiceLimit&&priority>=B92_PRIORITY.important){
    const victim=[...registry].filter(token=>(token.b92Priority||0)<priority).sort((a,b)=>(a.b92Priority||0)-(b.b92Priority||0))[0];
    if(victim){registry.delete(victim);for(const node of victim.nodes||[]){try{node.stop?.(this.ctx.currentTime)}catch(_){}try{node.disconnect?.()}catch(_){}}this.b92StolenVoices++}
  }
  const before=new Set(registry||[]),ok=registerBeforeB92.call(this,endNode,nodes);
  if(ok&&registry)for(const token of registry)if(!before.has(token)){token.b92Priority=priority;token.b92Started=this.ctx?.currentTime||0}
  return ok;
};
function protectAudioMethodB92(name,priorityFor){const before=PipAudioEngine.prototype[name];PipAudioEngine.prototype[name]=function(...args){return withAudioPriorityB92(this,priorityFor(...args),()=>before.apply(this,args))}}
protectAudioMethodB92('playerDamage',()=>B92_PRIORITY.critical);
protectAudioMethodB92('bossRoar',()=>B92_PRIORITY.critical);
protectAudioMethodB92('bossDefeat',()=>B92_PRIORITY.critical);
protectAudioMethodB92('enemyAttack',kind=>kind==='boss'||kind==='charger'?B92_PRIORITY.important:B92_PRIORITY.action);
protectAudioMethodB92('pipCue',kind=>kind==='return'||kind==='heart'?B92_PRIORITY.important:B92_PRIORITY.action);

function spatialPanB92(x){const span=Math.max(180,(typeof W==='number'?W:900)*.48);return clamp(((Number(x)||0)-(P?.x||0))/span,-.82,.82)}
function withSpatialAudioB92(engine,x,fn){if(!engine)return fn();const old=engine.b92SpatialPan||0;engine.b92SpatialPan=spatialPanB92(x);try{return fn()}finally{engine.b92SpatialPan=old}}
const panNodeBeforeB92=PipAudioEngine.prototype.panNode;
PipAudioEngine.prototype.panNode=function(pan=0){return panNodeBeforeB92.call(this,clamp(pan+(this.b92SpatialPan||0),-1,1))};
const hitSfxBeforeB92=sfxHitEnemy;
sfxHitEnemy=function(e){return withSpatialAudioB92(audioEngine,e?.x,()=>hitSfxBeforeB92(e))};
const killSfxBeforeB92=sfxKill;
sfxKill=function(e){return withSpatialAudioB92(audioEngine,e?.x,()=>killSfxBeforeB92(e))};

function targetAudioIntensityB92(){
  if(!S?.run||S.end||S.waveState==='stage'||S.b39Paused)return 0;
  if(S.bossActive)return 1;
  const live=enemies.reduce((n,e)=>n+(!e.dead?1:0),0),cap=Math.max(6,typeof enemyCap==='function'?enemyCap():12);
  const pressure=clamp(live/cap,0,1),hurt=1-clamp((S.health||0)/Math.max(1,S.maxHealth||100),0,1),over=S.over>0?.18:0;
  return clamp(pressure*.72+hurt*.22+over,0,1);
}
function updateAudioSceneB92(engine,dt=.025){
  if(!engine?.ctx)return 0;installAudioEngineB92(engine);engine.b92TargetIntensity=targetAudioIntensityB92();
  const blend=1-Math.exp(-Math.max(0,dt)*3.2);engine.b92Intensity+= (engine.b92TargetIntensity-engine.b92Intensity)*blend;
  const now=engine.ctx.currentTime,intensity=clamp(engine.b92Intensity,0,1);
  try{engine.musicTone?.frequency?.setTargetAtTime(5400+intensity*3900,now,.16);engine.delayWet?.gain?.setTargetAtTime(.065+intensity*.055,now,.18);engine.sfx?.gain?.setTargetAtTime(.76-intensity*.08,now,.12)}catch(_){}
  return intensity;
}
const schedulerBeforeB92=PipAudioEngine.prototype.scheduler;
PipAudioEngine.prototype.scheduler=function(){updateAudioSceneB92(this,this.lookAheadMs/1000);return schedulerBeforeB92.call(this)};
const scheduleBeforeB92=PipAudioEngine.prototype.scheduleStep;
PipAudioEngine.prototype.scheduleStep=function(time){
  scheduleBeforeB92.call(this,time);if(!S?.run||S.end||S.b39Paused||S.waveState==='break'||S.waveState==='stage')return;
  const i=this.step%16,intensity=this.b92Intensity||0;
  if(intensity>.62&&(i===3||i===7||i===11||i===15))this.hat(time,.004+(intensity-.62)*.012);
  if((S.health||100)<40&&(i===0||i===8))this.kick(time,.010);
};
function audioEngineSnapshotB92(engine=audioEngine){return engine?{intensity:engine.b92Intensity||0,target:engine.b92TargetIntensity||0,voices:engine.voices?.size||0,stolen:engine.b92StolenVoices||0,limited:!!engine.b92Limiter,spatial:!!engine.b92SfxPresence}:null}

// B92 Skill charge contract: only Ascended Pip needs a full meter. Beam becomes usable at half charge; other basics retain their frequent-use threshold.
const B92_BEAM_IGNITION_PERCENT=50;
const canIgniteBeforeB92=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){
  if(id==='pip')return !!(S&&S.over<=0&&S.run&&!S.end&&S.waveState!=='stage'&&S.heat>=99.999);
  if(id==='beam')return !!(S&&S.over<=0&&S.run&&!S.end&&S.waveState!=='stage'&&S.heat>=B92_BEAM_IGNITION_PERCENT);
  return canIgniteBeforeB92(id);
};
const updateUIBeforeB92=updateUI;
updateUI=function(){
  updateUIBeforeB92();if(!S||S.over>0)return;
  const button=$('overdrive');if(!button)return;
  if(S.overType==='beam')button.innerHTML=`BEAM<br><small>${canIgniteOverdriveB38('beam')?'HOLD TO FIRE':Math.round(S.heat)+'% / 50%'}</small>`;
  else if(S.overType==='pip')button.innerHTML=`PIP ASCENDANT<br><small>${canIgniteOverdriveB38('pip')?'TAP TO ASCEND':'FILL RESERVE'}</small>`;
};
