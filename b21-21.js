// B34 Sound Lab: merge Pip sound progression and soundtrack/SFX rewards into one between-stage screen.
function ensureSoundLabB34(){
 ensurePipSoundStepB26();
 const lab=$("pipSoundStep"),audio=$("audioStep");
 if(!lab||!audio)return;
 const title=lab.querySelector("h2");
 if(title)title.textContent="Sound Lab ♪";
 const intro=lab.querySelector("p");
 if(intro)intro.textContent="Build Pip's sound stack with Music Notes, then choose one soundtrack or SFX layer for this stage. Everything unlocked this run stacks together.";
 const continueBtn=$("continuePipSounds");
 if(continueBtn)continueBtn.style.display="none";
 let section=$("soundtrackSectionB34");
 if(!section){
   section=document.createElement("div");
   section.id="soundtrackSectionB34";
   lab.appendChild(section);
 }
 if(audio.parentElement!==section)section.appendChild(audio);
 const audioTitle=audio.querySelector("h2");
 if(audioTitle)audioTitle.textContent="Soundtrack + SFX";
 const audioCopy=audio.querySelector("p");
 if(audioCopy)audioCopy.textContent="Choose one layer to finish this stage. All soundtrack and SFX unlocks from this run stay active and stack.";
}

openPipSoundStepB26=function(){
 ensureSoundLabB34();
 $("emotionStep").classList.add("stagehidden");
 $("abilityStep").classList.add("stagehidden");
 $("pipSoundStep").classList.remove("stagehidden");
 $("audioStep").classList.remove("stagehidden");
 renderPipSoundStepB26();
 chooseAudioOptions();
 showPipMessage((S.pipSoundCredits||0)>0
   ?"Sound Lab time. deepen my sound stack if you want, then pick the layer that sends us into the next stage."
   :"Sound Lab time. my current Pip sounds stay stacked; pick our next soundtrack or SFX layer when you're ready.",true);
 unlockAudio().then(ok=>{if(ok)burstTone(523,4)});
};

// Any older path that asks for the separate audio screen now opens the merged Sound Lab instead.
openAudioStep=function(){openPipSoundStepB26()};

// Choosing the soundtrack/SFX reward still finishes the stage, but cleanly hides the merged screen first.
const chooseAudioUnlockBeforeB34=chooseAudioUnlock;
chooseAudioUnlock=function(index){
 const lab=$("pipSoundStep"),audio=$("audioStep");
 if(lab)lab.classList.add("stagehidden");
 if(audio)audio.classList.add("stagehidden");
 chooseAudioUnlockBeforeB34(index);
};

ensureSoundLabB34();
