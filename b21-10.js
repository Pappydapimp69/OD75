// B24 audio pass: adaptive boss intensity + music unlock layers during boss fights.
function currentBossHealthRatio(){
 const b=enemies.find(e=>e.type==="boss"&&!e.dead);
 if(!b||!Number.isFinite(b.hp)||!Number.isFinite(b.maxHp)||b.maxHp<=0)return 1;
 return clamp(b.hp/b.maxHp,0,1);
}

PipAudioEngine.prototype.scheduleBossStep=function(time){
 const p=bossData();
 const i=this.step%16;
 const phrase=this.step%64;
 const bar=Math.floor(phrase/16);
 const hpRatio=currentBossHealthRatio();
 const phase=hpRatio<=.30?2:hpRatio<=.65?1:0;
 const root=p.root+(bar===1?3:bar===2?-2:bar===3?5:0);
 const motif=p.motif;
 const note=motif[i%motif.length];
 const variant=p.beat;

 // Boss tempo rises with danger, while respecting the engine's safety cap.
 const targetBpm=p.bpm+(phase===1?6:phase===2?12:0);
 this.setTempo(targetBpm);

 // Core combat pulse: every boss now has a heavier four-on-the-floor backbone.
 if(i===0||i===4||i===8||i===12){
   this.kick(time,phase===2?.070:phase===1?.064:.058);
   if(i===0||i===8)this.bass(root-12,time,.30,phase===2?.066:.058);
 }

 // Mid phase adds off-beat pressure. Final phase becomes nearly continuous.
 if(phase>=1&&(i===2||i===6||i===10||i===14))this.kick(time,phase===2?.052:.038);
 if(phase===0){
   if(i%2===1)this.hat(time,.013+(variant%3)*.002);
 }else if(phase===1){
   if(i%2===1||i===6||i===14)this.hat(time,.016+(variant%3)*.002);
 }else{
   this.hat(time,i%2?.019:.011);
 }

 // Darker, thicker harmony bed than normal waves.
 if(i===0||phase===2&&i===8){
   const chord=variant%3===0?[root,root+3,root+7]:variant%3===1?[root,root+4,root+6]:[root,root+3,root+8];
   this.padChord(chord.map((n,j)=>n+(j?12:0)),time,phase===2?1.05:1.38,phase===2?.031:.027);
 }

 // Main boss motif stays boss-specific, but gets harder-edged as HP falls.
 if(note!=null){
   const octave=phase===2?(i%4===0?24:12):(i%4===0?24:12);
   this.fmBell(MIDI_FREQ(root+octave+note),time,phase===2?.16:.22,phase===2?.040:phase===1?.035:.031,i<8?-.36:.36,this.music);
   if(phase===2&&(i===0||i===4||i===8||i===12)){
     this.voice(MIDI_FREQ(root+note),time,.12,.024,"sawtooth",i<8?-.22:.22,1500,.003,.06,-5,this.music);
   }
 }

 if(i===6||i===14||phase>=1&&(i===3||i===11)){
   this.bass(root-5-(variant%2?2:0),time,.17,phase===2?.042:.032);
 }

 // Previously these five unlocks disappeared during bosses. They now mutate the boss arrangement.
 if(hasAudio("melody")){
   const counter=[12,null,10,12,null,7,10,null,15,null,12,10,null,7,5,null][i];
   if(counter!=null)this.pluck(root+12+counter,time,phase===2?.12:.17,phase===2?.031:.023,i<8?.42:-.42);
 }
 if(hasAudio("harmony")&&(i===0||i===8)){
   const tense=i===0?[root+15,root+19,root+24]:[root+17,root+22,root+27];
   this.padChord(tense,time,phase===2?.82:1.10,phase===2?.017:.013);
 }
 if(hasAudio("bass")&&(i===3||i===7||i===11||i===15)){
   const fill=i===15?7:(i===7?5:0);
   this.bass(root-12+fill,time,.14,phase===2?.035:.028);
 }
 if(hasAudio("bells")&&(phrase===15||phrase===31||phrase===47||phrase===63)){
   this.fmBell(MIDI_FREQ(root+31+(variant%5)),time,.42,phase===2?.034:.027,.58,this.music);
 }
 if(hasAudio("heartbeat")&&(i===0||i===2)){
   this.kick(time,i===0?(phase===2?.043:.034):(phase===2?.027:.020));
 }

 // Phrase-end threat sting, stronger in the final third.
 if(i===15){
   this.fmBell(MIDI_FREQ(root+31+(variant%4)),time,.30,phase===2?.036:.027,.55,this.music);
   if(phase===2)this.bass(root-19,time,.22,.041);
 }
};
