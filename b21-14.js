// B28 economy correction: Hearts buy Pip attributes; Prism Seeds buy emotional traits.
function renderEmotionButtonsB28(){
 const seeds=Math.max(0,S.prismSeeds||0);
 const items=[
   ["upLove","♥","More Loving","love",S.pipLove],
   ["upCompassion","♡","More Compassionate","compassion",S.pipCompassion],
   ["upSupport","✦","More Supportive","support",S.pipSupport]
 ];
 for(const [id,icon,label,kind,lv] of items){
   const btn=$(id);
   btn.innerHTML=`<div class="heart">${icon}</div><b>${label} · Lv ${lv} → ${lv+1} · ◆ 1</b><span class="small">${emotionalNextText(kind)}</span>`;
   btn.disabled=seeds<1;
   btn.classList.toggle("ready",seeds>=1);
 }
 const step=$("emotionStep");
 if(step){
   const p=step.querySelector("p");
   if(p)p.textContent=`◆ ${seeds} Prism Seed${seeds===1?"":"s"} available · Prism Seeds deepen Loving, Compassionate, and Supportive.`;
   let skip=$("skipEmotionB28");
   if(!skip){
     skip=document.createElement("button");
     skip.id="skipEmotionB28";skip.className="primary";skip.type="button";
     skip.textContent="Continue without emotional upgrade";
     step.appendChild(skip);
     skip.addEventListener("click",()=>{if(S.stagePending)openAbilityStep()});
   }
 }
}
renderEmotionButtons=renderEmotionButtonsB28;

choosePipUpgrade=function(kind){
 if(!S.stagePending)return;
 if((S.prismSeeds||0)<1){
   showPipMessage("we need a Prism Seed to deepen that part of me. we can keep going without one.",true);
   return;
 }
 S.prismSeeds--;
 if(kind==="love"){
   S.pipLove++;
   praise(
     S.pipLove===1?"then I'll say it more: I really, really like being yours.":
     S.pipLove===2?"I don't just root for you anymore. I feel proud when I see you.":
     "I think every run with you is becoming one of my favorite memories.",
     "big",true
   );
 }else if(kind==="compassion"){
   S.pipCompassion++;
   praise(
     S.pipCompassion===1?"then I'll be gentler when things hurt. you deserve that.":
     S.pipCompassion===2?"you never have to earn kindness from me. it's already yours.":
     "when the arena gets cruel, I want to be the soft place you can still hear.",
     "big",true
   );
 }else if(kind==="support"){
   S.pipSupport++;
   praise(
     S.pipSupport===1?"then I'll remind you more often: you can do this.":
     S.pipSupport===2?"I want you to hear my voice and remember how capable you are.":
     "I believe in you even before the score does. especially then.",
     "big",true
   );
 }else return;
 applyPipPower();savePip();S.stageGrowthChoice=kind;openAbilityStep();
};

// Restore the four attribute skills to their original Heart Bit economy.
renderAbilityShop=function(){
 $("abilityBalance").textContent=`♥ ${S.heartCurrency} Heart Bits available`;
 const map={range:"abilityRange",speed:"abilitySpeed",power:"abilityPower",guard:"abilityGuard"};
 for(const [kind,id] of Object.entries(map)){
   const info=PIP_ABILITY_INFO[kind],lv=pipAbilityLevel(kind),btn=$(id);
   const rangeOverflow=kind==="range"&&lv>=20;
   const maxed=kind!=="range"&&lv>=info.max;
   const cost=pipAbilityCost(kind);
   if(rangeOverflow){
     btn.innerHTML=`<div class="heart">➜</div><b>Heart Sense · Lv ${lv} → ${lv+1} · ♥ ${cost}</b><span class="small">Range MAX 200px · Pip speed +1%</span>`;
   }else{
     const nextEffect=kind==="range"?(lv+1)%2===1?"RANGE":"SPEED +1%":"";
     btn.innerHTML=`<div class="heart">${info.icon}</div><b>${info.name} · Lv ${lv}${maxed?" MAX":` → ${lv+1}${nextEffect?` · ${nextEffect}`:""} · ♥ ${cost}`}</b><span class="small">${maxed?info.desc:pipAbilityEffectText(kind)}</span>`;
   }
   btn.disabled=maxed||S.heartCurrency<cost;
   btn.classList.toggle("ready",!btn.disabled);
 }
};

buyPipAbility=function(kind){
 if(!S.stagePending)return;
 const info=PIP_ABILITY_INFO[kind];if(!info)return;
 const lv=pipAbilityLevel(kind);
 if(kind!=="range"&&lv>=info.max){showPipMessage(`${info.name} is already as strong as I can make it.`,true);return}
 const cost=pipAbilityCost(kind);
 if(S.heartCurrency<cost){
   const need=cost-S.heartCurrency;
   showPipMessage(`we need ${need} more Heart Bit${need===1?"":"s"} for ${info.name}.`,true);
   return;
 }
 S.heartCurrency-=cost;
 if(kind==="range")S.pipRangeLv++;
 else if(kind==="speed")S.pipSpeedLv++;
 else if(kind==="power")S.pipPowerLv++;
 else if(kind==="guard")S.pipGuardLv++;
 else return;
 applyPipPower();savePip();renderAbilityShop();
 const lines={
   range:(S.pipRangeLv||0)>20
     ?"my Heart Sense is capped at 200px, so that level made me 1% faster!"
     :(S.pipRangeLv||0)%2===0
       ?`my range stayed at ${Math.round(S.pipDetectRange)}px, but I got 1% faster!`
       :`I can feel the hearts farther away now — ${Math.round(S.pipDetectRange)}px!`,
   speed:"oh! I feel quicker. I'll get back to you faster.",
   power:"my star power is stronger. stay close and I'll make it count.",
   guard:"my glow feels steadier. I'll help your shields come back sooner."
 };
 praise(lines[kind],"big",true);
};

// Refresh the corrected economy immediately if the stage modal is already open.
if(S&&S.stagePending){renderEmotionButtons();if(!$("abilityStep").classList.contains("stagehidden"))renderAbilityShop()}
