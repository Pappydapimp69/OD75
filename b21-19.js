// B32 run-scoped audio progression: Pip sounds, soundtrack/SFX unlocks and Music Notes never carry between runs.
function resetRunAudioB32(){
 if(!S)return;
 S.musicNotes=0;
 S.pipSoundCredits=1;
 S.pipSoundLevels={};
 S.pipSoundUnlocked=new Set();
 S.pipSoundPack="stack";
 S.audioUnlocks=new Set();
 S.audioChoices=[];
}

// Nothing in the Pip save is allowed to carry sound unlocks into another run/page load.
savePip=function(){
 try{localStorage.setItem(PIP_SAVE_KEY,JSON.stringify({
   level:1,xp:0,love:0,compassion:0,support:0,
   rangeLv:0,speedLv:0,powerLv:0,guardLv:0,bossPowers:{},
   audio:[]
 }))}catch(_){}
};

const resetBeforeB32=reset;
reset=function(){
 resetBeforeB32();
 resetRunAudioB32();
 savePip();
 updateUI();
};

// Clear any legacy persisted soundtrack layers immediately on this build.
resetRunAudioB32();
savePip();

const soundtrackRunCopyB32=$("audioStep")?.querySelector("p");
if(soundtrackRunCopyB32)soundtrackRunCopyB32.textContent="Choose one soundtrack or SFX unlock. Everything unlocked this run stacks together; a new run starts fresh.";

const finishBeforeB32=finish;
finish=function(dead){
 finishBeforeB32(dead);
 const el=$("endText");
 if(el)el.textContent=el.textContent
   .replace("Pip's combat growth resets next run; your soundtrack collection remains.","Pip growth, Music Notes, Pip sounds, and soundtrack unlocks all reset next run.")
   .replace("your soundtrack collection remains","Music Notes and sound unlocks reset next run");
};
