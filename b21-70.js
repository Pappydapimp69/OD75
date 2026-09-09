// B81 Sound ducking recovers independently instead of remembering the deepest prior hit.
const B81_DUCK_ATTACK=.018,B81_DUCK_RELEASE=.11;
function installDuckingB81(engine){
  if(!engine||engine.b81Ducking)return engine;engine.b81Ducking=true;engine.b81DuckSignature='';engine.b81DuckEnvelopes=0;return engine;
}
function baseMusicGainB81(){const weight=audioMixWeightB42();return clamp(.46/Math.sqrt(1+weight*.045),.27,.46)}
function scheduleMusicEnvelopeB81(engine,now=engine?.ctx?.currentTime||0){
  if(!engine?.music?.gain||!engine.ctx)return;installDuckingB81(engine);
  if(now>=(engine.b42DuckUntil||0))engine.b42DuckFactor=1;
  const active=now<(engine.b42DuckUntil||0),base=baseMusicGainB81(),target=base*(active?engine.b42DuckFactor||1:1),until=active?engine.b42DuckUntil:0;
  const signature=`${target.toFixed(6)}:${until.toFixed(6)}`;if(signature===engine.b81DuckSignature)return;
  engine.b81DuckSignature=signature;const gain=engine.music.gain;
  try{
    gain.cancelScheduledValues(now);gain.setTargetAtTime(target,now,active?B81_DUCK_ATTACK:B81_DUCK_RELEASE);
    if(active)gain.setTargetAtTime(base,until,B81_DUCK_RELEASE);
  }catch(_){gain.value=target}
}
musicGainTargetB42=function(engine){
  if(!engine)return baseMusicGainB81();installDuckingB81(engine);const now=engine.ctx?.currentTime||0;if(now>=(engine.b42DuckUntil||0))engine.b42DuckFactor=1;
  return clamp(baseMusicGainB81()*(now<(engine.b42DuckUntil||0)?engine.b42DuckFactor||1:1),.17,.46);
};
smoothMusicBusB42=function(engine){scheduleMusicEnvelopeB81(engine)};
duckMusicB42=function(factor=.72,duration=.18){
  if(!audioEngine||!audioCtx)return;installAudioEngineB42(audioEngine);installDuckingB81(audioEngine);
  const now=audioCtx.currentTime;if(now>=(audioEngine.b42DuckUntil||0))audioEngine.b42DuckFactor=1;
  audioEngine.b42DuckFactor=Math.min(audioEngine.b42DuckFactor||1,clamp(Number(factor)||.72,.35,1));
  audioEngine.b42DuckUntil=Math.max(audioEngine.b42DuckUntil||0,now+clamp(Number(duration)||.18,.04,.8));audioEngine.b81DuckSignature='';audioEngine.b81DuckEnvelopes++;
  scheduleMusicEnvelopeB81(audioEngine,now);
};
if(audioEngine)installDuckingB81(audioEngine);
