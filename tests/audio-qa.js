// Browser-only Web Audio rendering. Uses the production synthesizers and scheduling path.
async function renderAudioCaseB60(levels,boss){
  S.b46MixLevels={heartmix:0,starmix:0,orbitmix:0,...levels};S.audioLevels={};S.audioUnlocks=new Set();
  for(const layer of B46_MIX_LAYERS)for(const member of layer.members){S.audioLevels[member]=mixLevelB46(layer.id);if(mixLevelB46(layer.id))S.audioUnlocks.add(member)}
  S.audioEnabled=true;S.run=true;S.end=false;S.stagePending=false;S.b39Paused=false;
  S.waveState=boss?"boss":"active";S.bossActive=boss;S.stage=1;S.bossKey=1;S.bossCount=0;enemies=[];seed=12345;
  const ctx=new OfflineAudioContext(2,Math.ceil(4.9*22050),22050),engine=new PipAudioEngine(ctx);
  installAudioEngineB42(engine);engine.music.gain.value=musicGainTargetB42(engine);
  const noise=engine.noiseBuffer.getChannelData(0);let n=123;
  for(let i=0;i<noise.length;i++){n=(n*1664525+1013904223)>>>0;noise[i]=(n/4294967296*2-1)*(1-i/noise.length*.35)}
  engine.step=0;engine.scheduleStep(.05);
  let suspended=ctx.suspend(.12);const rendering=ctx.startRendering();
  for(let i=1;i<32;i++){
    await suspended;engine.step=i;engine.scheduleStep(.05+i*.13);
    if(i<31)suspended=ctx.suspend(.12+i*.13);
    await ctx.resume();
  }
  const buffer=await rendering,values=buffer.getChannelData(0);let sum=0,peak=0;
  for(const value of values){sum+=value*value;peak=Math.max(peak,Math.abs(value))}
  return {buffer,values,rms:Math.sqrt(sum/values.length),peak,musicVoices:engine.b60MusicVoices.size};
}
function audioWavB60(buffer){
  const length=buffer.length,bytes=new ArrayBuffer(44+length*4),view=new DataView(bytes);
  const word=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))};
  word(0,"RIFF");view.setUint32(4,36+length*4,true);word(8,"WAVE");word(12,"fmt ");view.setUint32(16,16,true);
  view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);word(36,"data");view.setUint32(40,length*4,true);
  const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
  for(let i=0;i<length;i++){view.setInt16(44+i*4,clamp(left[i],-1,1)*32767,true);view.setInt16(46+i*4,clamp(right[i],-1,1)*32767,true)}
  return new Blob([bytes],{type:"audio/wav"});
}
qaButtonB59("Render audio checks",async()=>{
  qaFrozenB59=true;const status=$("qaResults");status.textContent="Rendering actual audio…";
  const saved=S,savedEnemies=enemies;S={...S};const rows=[];
  try{
    for(const boss of [false,true]){
      const base=await renderAudioCaseB60({},boss);
      for(const id of ["heartmix","starmix","orbitmix","all"]){
        for(const lv of id==="all"?[4]:[1,4]){
          const mix=await renderAudioCaseB60(id==="all"?{heartmix:lv,starmix:lv,orbitmix:lv}:{[id]:lv},boss);let diff=0;
          for(let i=0;i<mix.values.length;i++)diff+=(mix.values[i]-base.values[i])**2;
          const relative=Math.sqrt(diff/mix.values.length)/base.rms;
          const ok=mix.rms>.001&&mix.peak<.98&&relative>.20&&mix.musicVoices===0;
          rows.push(`${ok?"PASS":"FAIL"} ${boss?"boss":"wave"} ${id} Lv${lv}: RMS ${mix.rms.toFixed(4)}, peak ${mix.peak.toFixed(3)}, change ${(relative*100).toFixed(0)}%, voices ${mix.musicVoices}`);
          status.textContent=rows.join("\n");
          if(!boss&&lv===1){
            const box=document.createElement("div"),label=document.createElement("span"),player=document.createElement("audio");label.textContent=id;player.controls=true;player.src=URL.createObjectURL(audioWavB60(mix.buffer));player.style.width="260px";box.append(label,player);qaPanelB59.appendChild(box);
          }
        }
      }
    }
    status.textContent=rows.join("\n")+`\n${rows.filter(x=>x.startsWith("PASS")).length}/${rows.length} audio renders passed`;
  }catch(e){status.textContent+="\nERROR "+e.stack}
  finally{S=saved;enemies=savedEnemies}
});

async function renderHeartfieldAudioB74(){
  const ctx=new OfflineAudioContext(2,Math.ceil(.8*22050),22050),engine=new PipAudioEngine(ctx);installAudioEngineB42(engine);
  const noise=engine.noiseBuffer.getChannelData(0);let n=741;
  for(let i=0;i<noise.length;i++){n=(n*1664525+1013904223)>>>0;noise[i]=n/4294967296*2-1}
  scheduleHeartfieldAudioB74(engine,.05,'form',4);scheduleHeartfieldAudioB74(engine,.31,'mine',5);
  const original=ctx.currentTime;void original;scheduleHeartfieldAudioB74(engine,.55,'deliver',3);
  const buffer=await ctx.startRendering(),values=buffer.getChannelData(0);let sum=0,peak=0;
  for(const value of values){sum+=value*value;peak=Math.max(peak,Math.abs(value))}
  return {buffer,rms:Math.sqrt(sum/values.length),peak};
}
qaButtonB59("Render Heartfield audio",async()=>{
  qaFrozenB59=true;const status=$("qaResults");status.textContent="Rendering Heartfield production audio…";
  try{const result=await renderHeartfieldAudioB74(),ok=result.rms>.0005&&result.peak<.98;status.textContent=`${ok?'PASS':'FAIL'} Heartfield audio: RMS ${result.rms.toFixed(4)}, peak ${result.peak.toFixed(3)}`;
    const player=document.createElement('audio');player.controls=true;player.src=URL.createObjectURL(audioWavB60(result.buffer));player.style.width='260px';qaPanelB59.appendChild(player)}catch(e){status.textContent='ERROR '+e.stack}
});
