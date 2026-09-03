class PipAudioEngine{
 constructor(ctx){
   this.ctx=ctx;
   this.voices=new Set();
   this.voiceLimit=28;
   this.bpm=116;
   this.lookAheadMs=25;
   this.scheduleAhead=.16;
   this.nextStepTime=0;
   this.step=0;
   this.timer=null;
   this.noiseBuffer=this.makeNoiseBuffer();

   this.master=ctx.createGain();
   this.master.gain.value=.84;

   this.music=ctx.createGain();
   this.music.gain.value=.46;

   this.sfx=ctx.createGain();
   this.sfx.gain.value=.74;

   this.musicTone=ctx.createBiquadFilter();
   this.musicTone.type="lowpass";
   this.musicTone.frequency.value=8800;
   this.musicTone.Q.value=.25;

   this.delay=ctx.createDelay(.6);
   this.delay.delayTime.value=.185;
   this.delayFeedback=ctx.createGain();
   this.delayFeedback.gain.value=.15;
   this.delayWet=ctx.createGain();
   this.delayWet.gain.value=.09;

   this.compressor=ctx.createDynamicsCompressor();
   this.compressor.threshold.value=-18;
   this.compressor.knee.value=12;
   this.compressor.ratio.value=3.5;
   this.compressor.attack.value=.004;
   this.compressor.release.value=.18;

   this.music.connect(this.musicTone);
   this.musicTone.connect(this.master);
   this.musicTone.connect(this.delay);
   this.delay.connect(this.delayWet);
   this.delayWet.connect(this.master);
   this.delay.connect(this.delayFeedback);
   this.delayFeedback.connect(this.delay);

   this.sfx.connect(this.master);
   this.master.connect(this.compressor);
   this.compressor.connect(ctx.destination);
 }
 makeNoiseBuffer(){
   const len=Math.max(1,Math.floor(this.ctx.sampleRate*.18));
   const b=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
   const a=b.getChannelData(0);
   for(let i=0;i<len;i++)a[i]=(Math.random()*2-1)*(1-i/len*.35);
   return b;
 }
 setEnabled(on){
   const now=this.ctx.currentTime;
   this.master.gain.cancelScheduledValues(now);
   this.master.gain.setTargetAtTime(on?.84:.0001,now,.035);
 }
 panNode(pan=0){
   if(this.ctx.createStereoPanner){
     const p=this.ctx.createStereoPanner();
     p.pan.value=clamp(pan,-1,1);
     return p;
   }
   return this.ctx.createGain();
 }
 register(endNode,nodes){
   if(this.voices.size>=this.voiceLimit){
     for(const n of nodes){try{n.disconnect()}catch(_){} }
     return false;
   }
   const token={nodes};
   const registry=this.voices;
   registry.add(token);
   endNode.onended=()=>{
     registry.delete(token);
     for(const n of nodes){try{n.disconnect()}catch(_){} }
   };
   return true;
 }
 voice(freq,time,dur=.18,vol=.04,type="triangle",pan=0,cutoff=5000,attack=.012,release=.12,detune=0,bus=this.music){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const ctx=this.ctx,o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),p=this.panNode(pan);
   o.type=type;
   o.frequency.setValueAtTime(freq,time);
   o.detune.setValueAtTime(detune,time);
   f.type="lowpass";f.frequency.setValueAtTime(cutoff,time);f.Q.value=.45;
   g.gain.setValueAtTime(.0001,time);
   g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),time+attack);
   g.gain.setValueAtTime(Math.max(.0002,vol*.76),Math.max(time+attack,time+dur-release));
   g.gain.exponentialRampToValueAtTime(.0001,time+dur);
   o.connect(f);f.connect(g);g.connect(p);p.connect(bus);
   if(!this.register(o,[o,f,g,p]))return;
   o.start(time);o.stop(time+dur+.03);
 }
 fmBell(freq,time,dur=.42,vol=.038,pan=0,bus=this.music){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const ctx=this.ctx,car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain(),amp=ctx.createGain(),p=this.panNode(pan);
   car.type="sine";mod.type="sine";
   car.frequency.setValueAtTime(freq,time);
   mod.frequency.setValueAtTime(freq*2.01,time);
   mg.gain.setValueAtTime(freq*1.55,time);
   mg.gain.exponentialRampToValueAtTime(.001,time+dur*.82);
   amp.gain.setValueAtTime(.0001,time);
   amp.gain.exponentialRampToValueAtTime(vol,time+.008);
   amp.gain.exponentialRampToValueAtTime(.0001,time+dur);
   mod.connect(mg);mg.connect(car.frequency);
   car.connect(amp);amp.connect(p);p.connect(bus);
   if(!this.register(car,[car,mod,mg,amp,p]))return;
   car.start(time);mod.start(time);
   car.stop(time+dur+.03);mod.stop(time+dur+.03);
 }
 padChord(midis,time,dur=1.45,vol=.022){
   const pans=[-.42,0,.42];
   midis.slice(0,3).forEach((m,i)=>{
     const f=MIDI_FREQ(m);
     this.voice(f,time,dur,vol,"triangle",pans[i],2200,.12,.34,-5,this.music);
     this.voice(f,time,dur,vol*.48,"sine",pans[i],3200,.16,.40,5,this.music);
   });
 }
 bass(midi,time,dur=.24,vol=.040){
   this.voice(MIDI_FREQ(midi),time,dur,vol,"square",-.12,560,.008,.08,0,this.music);
   this.voice(MIDI_FREQ(midi-12),time,dur,vol*.44,"sine",.08,420,.01,.09,0,this.music);
 }
 pluck(midi,time,dur=.20,vol=.032,pan=0){
   this.voice(MIDI_FREQ(midi),time,dur,vol,"triangle",pan,3400,.006,.10,0,this.music);
 }
 kick(time,vol=.042){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const o=this.ctx.createOscillator(),g=this.ctx.createGain();
   o.type="sine";
   o.frequency.setValueAtTime(116,time);
   o.frequency.exponentialRampToValueAtTime(46,time+.11);
   g.gain.setValueAtTime(vol,time);
   g.gain.exponentialRampToValueAtTime(.0001,time+.14);
   o.connect(g);g.connect(this.music);
   if(!this.register(o,[o,g]))return;
   o.start(time);o.stop(time+.16);
 }
 hat(time,vol=.009){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const src=this.ctx.createBufferSource(),hp=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),p=this.panNode(rr(-.35,.35));
   src.buffer=this.noiseBuffer;
   hp.type="highpass";hp.frequency.value=6800;
   g.gain.setValueAtTime(vol,time);
   g.gain.exponentialRampToValueAtTime(.0001,time+.052);
   src.connect(hp);hp.connect(g);g.connect(p);p.connect(this.music);
   if(!this.register(src,[src,hp,g,p]))return;
   src.start(time);src.stop(time+.065);
 }
 pop(time,vol=.025,pan=0){
   if(!S||!S.audioEnabled||this.voices.size>=this.voiceLimit)return;
   const src=this.ctx.createBufferSource(),bp=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),p=this.panNode(pan);
   src.buffer=this.noiseBuffer;
   bp.type="bandpass";bp.frequency.value=1800;bp.Q.value=.9;
   g.gain.setValueAtTime(vol,time);
   g.gain.exponentialRampToValueAtTime(.0001,time+.08);
   src.connect(bp);bp.connect(g);g.connect(p);p.connect(this.sfx);
   if(!this.register(src,[src,bp,g,p]))return;
   src.start(time);src.stop(time+.09);
 }
 harmony(){
   const roots=[60,57,53,55];
   const bar=Math.floor((this.step%64)/16);
   const transpose=((Math.max(1,S?.stage||1)-1)%3)*2;
   const root=roots[bar]+transpose;
   const minor=bar===1;
   return {root,chord:minor?[root,root+3,root+7]:[root,root+4,root+7]};
 }
 scheduleBossStep(time){
   const p=bossData();
   const i=this.step%16;
   const bar=Math.floor((this.step%64)/16);
   const root=p.root+(bar===1?3:bar===2?-2:bar===3?5:0);
   const motif=p.motif;
   const note=motif[i%motif.length];
   const variant=p.beat;
   if(i===0||i===8){
     this.kick(time,.060);
     this.bass(root-12,time,.34,.058);
   }
   if((variant%2===0&&(i===4||i===12))||(variant%2===1&&(i===3||i===11)))this.kick(time,.043);
   if((i+variant)%2===1)this.hat(time,.012+(variant%3)*.002);
   if(i===0){
     const chord=variant%3===0?[root,root+3,root+7]:variant%3===1?[root,root+4,root+6]:[root,root+3,root+8];
     this.padChord(chord.map((n,j)=>n+(j?12:0)),time,1.50,.026);
   }
   if(note!=null){
     const octave=(i%4===0)?24:12;
     this.fmBell(MIDI_FREQ(root+octave+note),time,.24,.031,i<8?-.34:.34,this.music);
   }
   if(i===6||i===14)this.bass(root-5-(variant%2?2:0),time,.18,.032);
   if(i===15)this.fmBell(MIDI_FREQ(root+31+(variant%4)),time,.34,.026,.55,this.music);
 }
 scheduleStep(time){
   if(!S||!S.audioEnabled||!(S.run||S.waveState==="break"||S.waveState==="boss"))return;
   if(S.bossActive){this.scheduleBossStep(time);return}
   const i=this.step%16;
   const phrase=this.step%64;
   const {root,chord}=this.harmony();
   const resting=S.waveState==="break";
   const hard=S.stage>=5;
   const over=S.over>0;
   if(i===0)this.padChord(chord.map((n,j)=>n+(j?12:0)),time,1.62,resting?.017:.023);
   if(!resting&&(i===0||i===8)){
     this.bass(root-12,time,.31,hard?.047:.038);
     this.kick(time,hard?.048:.038);
   }
   if(!resting&&(i===4||i===12))this.hat(time,hard?.012:.007);
   const motif=[7,null,9,7,4,null,2,4,7,null,11,9,7,4,null,2];
   const note=motif[i];
   if(note!=null&&!resting&&(i%2===0||over))this.pluck(root+12+note,time,.18,over?.040:.029,i<8?-.2:.2);
   if(!this.b60Arrangement&&hasAudio("melody")&&!resting){
     const counter=[null,12,null,11,9,null,7,null,null,9,null,7,4,null,2,null][i];
     if(counter!=null)this.fmBell(MIDI_FREQ(root+12+counter),time,.30,.022,.36,this.music);
   }
   if(!this.b60Arrangement&&hasAudio("harmony")&&i===0)this.padChord([chord[1]+12,chord[2]+12,chord[0]+26],time,1.35,.011);
   if(!this.b60Arrangement&&hasAudio("bass")&&!resting&&(i===3||i===6||i===11||i===14))this.bass(root-12+(i===14?7:0),time,.16,.025);
   if(!this.b60Arrangement&&hasAudio("bells")&&(phrase===15||phrase===31||phrase===47||phrase===63))this.fmBell(MIDI_FREQ(root+31),time,.52,.025,.55,this.music);
   if(!this.b60Arrangement&&hasAudio("heartbeat")&&!resting&&(i===0||i===2))this.kick(time,i===0?.028:.016);
   if(hard&&!resting&&(i===2||i===6||i===10||i===14))this.hat(time,.011);
   if(hard&&!resting&&i===12)this.bass(root-5,time,.18,.024);
   if(over&&!resting&&i%2===1)this.pluck(root+24+[0,2,4,7][i%4],time,.10,.019,rr(-.5,.5));
 }
 scheduler(){
   if(!this.ctx||this.ctx.state!=="running"||!S||!S.audioEnabled)return;
   const stepDur=60/this.bpm/4;
   while(this.nextStepTime<this.ctx.currentTime+this.scheduleAhead){
     this.scheduleStep(this.nextStepTime);
     this.step++;
     this.nextStepTime+=stepDur;
   }
 }
 start(){
   if(this.timer||this.ctx.state!=="running")return;
   this.nextStepTime=this.ctx.currentTime+.055;
   this.step=0;
   this.timer=setInterval(()=>this.scheduler(),this.lookAheadMs);
 }
 setTempo(bpm){this.bpm=clamp(bpm,92,142)}
 chime(midis=[72,76,79],vol=.055){
   const t=this.ctx.currentTime+.025;
   midis.forEach((m,i)=>this.fmBell(MIDI_FREQ(m),t+i*.085,.30,vol*(1-i*.12),(i-1)*.25,this.sfx));
 }
 sfxTone(freq,d=.09,v=.04,type="triangle"){this.voice(freq,this.ctx.currentTime,d,v,type,0,5200,.005,.05,0,this.sfx)}
 sfxBurst(base,n=3){const t=this.ctx.currentTime;for(let i=0;i<n;i++)this.fmBell(base*(1+i*.19),t+i*.035,.23,.024,(i-(n-1)/2)*.15,this.sfx)}
 playerFire(pipOn=true,over=false){const t=this.ctx.currentTime;this.voice(over?690:(pipOn?540:430),t,.052,over?.030:.019,"square",-.08,3100,.002,.025,0,this.sfx);this.fmBell(over?1035:(pipOn?810:650),t+.010,.085,over?.017:.009,.10,this.sfx)}
 enemyHit(type="chaser",boss=false){const t=this.ctx.currentTime,base=boss?150:type==="core"?230:type==="charger"?205:185;this.voice(base,t,.055,boss?.038:.022,"sawtooth",0,boss?1100:1650,.002,.035,0,this.sfx);this.pop(t,boss?.022:.010,rr(-.22,.22))}
 playerDamage(shielded=true){const t=this.ctx.currentTime;this.voice(shielded?135:82,t,shielded?.16:.24,shielded?.043:.060,"sawtooth",0,900,.002,.12,0,this.sfx);this.pop(t,shielded?.025:.040,0)}
 enemyAttack(kind="contact"){const t=this.ctx.currentTime;if(kind==="charger"){this.voice(118,t,.16,.032,"sawtooth",-.18,1200,.005,.08,0,this.sfx);this.voice(176,t+.045,.10,.020,"square",.18,1600,.003,.05,0,this.sfx)}else if(kind==="boss"){this.voice(96,t,.19,.046,"sawtooth",0,900,.004,.12,0,this.sfx);this.fmBell(288,t+.025,.20,.026,.20,this.sfx)}else this.voice(108,t,.075,.022,"square",0,1300,.002,.04,0,this.sfx)}
 pipCue(kind="talk"){const t=this.ctx.currentTime;if(kind==="depart"){this.fmBell(880,t,.16,.023,-.35,this.sfx);this.fmBell(660,t+.05,.18,.016,.25,this.sfx)}else if(kind==="return"){this.fmBell(660,t,.15,.018,-.25,this.sfx);this.fmBell(990,t+.055,.22,.023,.28,this.sfx)}else if(kind==="heart")this.chime([81,84],.020);else{this.fmBell(760,t,.13,.014,-.15,this.sfx);this.fmBell(910,t+.04,.12,.010,.18,this.sfx)}}
 bossRoar(){const t=this.ctx.currentTime;this.voice(72,t,.55,.060,"sawtooth",-.25,700,.01,.30,-7,this.sfx);this.voice(73,t,.55,.050,"sawtooth",.25,760,.01,.30,7,this.sfx);this.pop(t+.08,.038,0)}
 bossDefeat(){const t=this.ctx.currentTime;[48,55,60,67,72,79].forEach((m,i)=>this.fmBell(MIDI_FREQ(m),t+i*.07,.42,.042*(1-i*.06),(i-2.5)*.12,this.sfx))}
}
function buildAudioGraph(){
 if(audioEngine&&audioCtx)return true;
 try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;audioCtx=new AC();audioEngine=new PipAudioEngine(audioCtx);return true}catch(e){audioCtx=null;audioEngine=null;return false}
}
function unlockAudioFromGesture(){
 if(!S||!S.audioEnabled||!buildAudioGraph())return;
 try{Promise.resolve(audioCtx.resume()).then(()=>{audioUnlocked=audioCtx.state==="running";$("audioToggle").textContent=audioUnlocked?"♫ ON":"♫ TAP";if(audioUnlocked){audioEngine.setEnabled(true);audioEngine.start();audioEngine.chime([72,76,79],.060)}}).catch(()=>{$("audioToggle").textContent="♫ TAP"})}catch(e){$("audioToggle").textContent="♫ TAP"}
}
function unlockAudio(){
 if(!S||!S.audioEnabled)return Promise.resolve(false);if(!buildAudioGraph())return Promise.resolve(false);
 if(audioCtx.state==="running"){audioUnlocked=true;audioEngine.setEnabled(true);audioEngine.start();$("audioToggle").textContent="♫ ON";return Promise.resolve(true)}
 if(audioUnlocking)return Promise.resolve(false);audioUnlocking=true;
 return Promise.resolve(audioCtx.resume()).then(()=>{audioUnlocking=false;audioUnlocked=audioCtx.state==="running";if(audioUnlocked){audioEngine.setEnabled(true);audioEngine.start();$("audioToggle").textContent="♫ ON"}return audioUnlocked}).catch(()=>{audioUnlocking=false;$("audioToggle").textContent="♫ TAP";return false});
}
function ensureAudio(){return !!(S&&S.audioEnabled&&audioEngine&&audioCtx&&audioCtx.state==="running")}
function hasAudio(id){return !!(S&&S.audioUnlocks&&S.audioUnlocks.has(id))}
function synth(freq,when,d=.12,v=.03,type="triangle",dest="sfx"){if(!ensureAudio())return;audioEngine.voice(freq,when,d,v,type,0,5000,.006,.07,0,dest==="music"?audioEngine.music:audioEngine.sfx)}
function noisePop(v=.025){if(!ensureAudio())return;audioEngine.pop(audioCtx.currentTime,v)}
function tone(f,d=.09,v=.04,type="triangle"){if(!ensureAudio())return;audioEngine.sfxTone(f,d,v,type)}
function burstTone(base,n=3){if(!ensureAudio())return;audioEngine.sfxBurst(base,n)}
function sfxPlayerFire(pipOn=true,over=false){if(ensureAudio())audioEngine.playerFire(pipOn,over)}
function sfxHitEnemy(e){if(ensureAudio())audioEngine.enemyHit(e.type,e.type==="boss")}
function sfxPlayerDamage(shielded=true){if(ensureAudio())audioEngine.playerDamage(shielded)}
function sfxEnemyAttack(kind="contact"){if(ensureAudio())audioEngine.enemyAttack(kind)}
function sfxPipCue(kind="talk"){if(ensureAudio())audioEngine.pipCue(kind)}
function sfxBossRoar(){if(ensureAudio())audioEngine.bossRoar()}
function sfxBossDefeat(){if(ensureAudio())audioEngine.bossDefeat()}
function sfxDash(){
 if(!ensureAudio())return;
 if(hasAudio("dashbell"))audioEngine.chime([74,81],.042);
 else{
   const t=audioCtx.currentTime;
   audioEngine.voice(S&&S.over>0?620:430,t,.10,.040,"sawtooth",-.15,2100,.004,.055,0,audioEngine.sfx);
   audioEngine.fmBell(S&&S.over>0?930:690,t+.025,.18,.019,.2,audioEngine.sfx);
 }
}
