// B60 Audible mix signatures, shared by gameplay and free Sound Lab auditions.
B46_MIX_BY_ID.heartmix.desc="A warm two-note harmony and a recurring double heartbeat.";
B46_MIX_BY_ID.starmix.desc="A bright bell melody that answers the main tune every bar.";
B46_MIX_BY_ID.orbitmix.desc="A bouncing bass groove with high bubble notes between beats.";
function mixHarmonyB60(engine){
  if(!S.bossActive)return engine.harmony();
  const p=bossData(),bar=Math.floor((engine.step%64)/16),root=p.root+(bar===1?3:bar===2?-2:bar===3?5:0);
  return {root,chord:[root,root+(p.beat%3===1?4:3),root+7]};
}
function scheduleMixB60(engine,id,lv,time){
  if(lv<=0)return;
  const i=engine.step%16,{root,chord}=mixHarmonyB60(engine),gain=1+(lv-1)*.08;
  if(id==="heartmix"){
    if(i===0||i===8){
      engine.voice(MIDI_FREQ(chord[1]+12),time,.72,.043*gain,"triangle",-.35,2500,.04,.22,0,engine.music);
      engine.voice(MIDI_FREQ(chord[2]+12),time,.72,.032*gain,"sine",.35,3200,.04,.22,0,engine.music);
    }
    if(i===1||i===3||i===9||i===11)engine.kick(time,(i%8===1?.055:.035)*gain);
    if(lv>=2&&(i===6||i===14))engine.pluck(chord[0]+24,time,.25,.032*gain,-.2);
    if(lv>=3&&(i===4||i===12))engine.voice(MIDI_FREQ(chord[1]+19),time,.36,.025*gain,"triangle",.3,2800,.02,.15,0,engine.music);
    if(lv>=4&&i===15)engine.fmBell(MIDI_FREQ(root+31),time,.30,.032,-.3,engine.music);
  }else if(id==="starmix"){
    const notes={1:19,5:16,9:14,13:19};
    if(notes[i]!=null)engine.fmBell(MIDI_FREQ(root+notes[i]),time,.34,.052*gain,i<8?.4:-.4,engine.music);
    if(lv>=2&&(i===7||i===15))engine.fmBell(MIDI_FREQ(root+24),time,.30,.042*gain,-.25,engine.music);
    if(lv>=3&&(i===3||i===11))engine.pluck(root+21,time,.22,.038*gain,.25);
    if(lv>=4&&(i===5||i===13))engine.fmBell(MIDI_FREQ(root+31),time+.06,.25,.027,-.4,engine.music);
  }else if(id==="orbitmix"){
    if([2,6,10,14].includes(i))engine.voice(MIDI_FREQ(root-12+(i===14?7:0)),time,.27,.070*gain,"triangle",-.12,1300,.008,.10,0,engine.music);
    if(i===4||i===12)engine.fmBell(MIDI_FREQ(root+12),time,.18,.036*gain,.4,engine.music);
    if(lv>=2&&(i===7||i===15))engine.voice(MIDI_FREQ(root-5),time,.18,.05*gain,"square",0,700,.008,.08,0,engine.music);
    if(lv>=3&&(i===3||i===11))engine.fmBell(MIDI_FREQ(root+19),time,.22,.039*gain,-.4,engine.music);
    if(lv>=4&&(i===0||i===8))engine.voice(MIDI_FREQ(root-24),time,.34,.055,"sine",0,700,.008,.15,0,engine.music);
  }
}
PipAudioEngine.prototype.scheduleStep=function(time){
  if(!S?.audioEnabled)return;
  const preview=this.b60Preview,labOpen=S.stagePending&&!$("pipSoundStep").classList.contains("stagehidden");
  if(preview&&(time>=preview.until||!labOpen)){
    this.b60Preview=null;if($("mixAuditionStatusB60"))$("mixAuditionStatusB60").textContent="Audition finished. Hear any mix again below.";
  }
  if(!this.b60Preview&&(!S.run||S.end||S.b39Paused||S.waveState==="stage"))return;
  // Music and combat have separate bounded registries, so busy combat cannot eat the soundtrack.
  const sfxVoices=this.voices;this.b60MusicVoices=this.b60MusicVoices||new Set();this.voices=this.b60MusicVoices;
  this.b60Arrangement=true;
  try{
    if(this.b60Preview){
      const savedStep=this.step;this.step-=this.b60Preview.startStep;
      try{scheduleMixB60(this,this.b60Preview.id,this.b60Preview.level,time)}finally{this.step=savedStep}
    }else{
      for(const layer of B46_MIX_LAYERS)scheduleMixB60(this,layer.id,mixLevelB46(layer.id),time);
      // Original base arrangement; B41's overlapping level voices are replaced by the signatures above.
      scheduleStepBeforeB41.call(this,time);
    }
  }finally{this.voices=sfxVoices}
};
function ensureMixAuditionsB60(){
  if($("mixAuditionsB60")){renderMixAudioControlB60();return}
  const section=document.createElement("div");section.id="mixAuditionsB60";
  section.innerHTML='<button id="mixAudioToggleB60" type="button"></button><p id="mixAuditionStatusB60" role="status">Hear a mix on its own. Auditions are free.</p><div class="b60AuditionButtons"></div>';
  for(const layer of B46_MIX_LAYERS){
    const button=document.createElement("button");button.type="button";button.textContent=`Hear ${layer.name}`;
    button.addEventListener("click",()=>previewMixB60(layer.id));section.lastElementChild.appendChild(button);
  }
  $("audioStep").appendChild(section);
  $("mixAudioToggleB60").addEventListener("click",async()=>{
    S.audioEnabled=!S.audioEnabled;renderMixAudioControlB60();
    if(!S.audioEnabled){
      if(audioEngine){audioEngine.setEnabled(false);audioEngine.b60Preview=null}
      $("audioToggle").textContent="♫ OFF";$("mixAuditionStatusB60").textContent="Sound muted.";
    }else{
      const ok=await unlockAudio();$("mixAuditionStatusB60").textContent=ok?"Sound enabled. Choose a mix to hear it on its own.":"Sound could not start. Try enabling it again.";
    }
  });
  renderMixAudioControlB60();
}
function renderMixAudioControlB60(){const button=$("mixAudioToggleB60");if(button){button.textContent=S.audioEnabled?"Mute sound":"Enable sound";button.setAttribute("aria-pressed",String(S.audioEnabled))}}
async function previewMixB60(id){
  const layer=B46_MIX_BY_ID[id];if(!S.stagePending||!layer)return false;
  ensureMixAuditionsB60();const status=$("mixAuditionStatusB60");
  if(!S.audioEnabled){status.textContent="Sound is muted. Turn audio on to hear this mix.";return false}
  const run=S;
  if(!await unlockAudio()){status.textContent="Tap the audio control to enable sound, then try again.";return false}
  if(S!==run||!S.stagePending)return false;
  const lv=mixLevelB46(id);audioEngine.b60Preview={id,level:Math.max(1,lv),until:audioCtx.currentTime+4.5,startStep:audioEngine.step};
  status.textContent=`Playing ${layer.name} · Lv ${Math.max(1,lv)}${lv?" · active in your soundtrack":" · preview, still locked"}. ${layer.desc}`;
  return true;
}
const completeSoundLabHoldBeforeB60=completeSoundLabHoldB45;
completeSoundLabHoldB45=function(kind,id,index){
  const result=completeSoundLabHoldBeforeB60(kind,id,index);
  if(result&&kind==="mix")void previewMixB60(id);
  return result;
};
const renderAudioChoicesBeforeB60=renderAudioChoicesB41;
renderAudioChoicesB41=function(){renderAudioChoicesBeforeB60();ensureMixAuditionsB60()};
nextMixTextB46=function(lv){return lv>=4?"Full signature arrangement.":lv===0?"Unlock a recurring background part.":"Next level adds more notes to this mix's signature."};
(function installMixAuditionsB60(){
  const style=document.createElement("style");style.textContent='#mixAuditionsB60{margin-top:10px}#mixAuditionStatusB60{font-size:12px;color:#c6d8eb;min-height:2em}.b60AuditionButtons{display:flex;gap:6px;flex-wrap:wrap}.b60AuditionButtons button{flex:1;min-width:90px;min-height:40px;padding:7px;font-size:12px}';document.head.appendChild(style);
})();
