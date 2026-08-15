// B53 Sound Lab usability: one hold language, visible resources, and concise cards.
function ensureSoundLabWalletB53(){
  const lab=$("pipSoundStep");if(!lab)return null;
  let wallet=$("soundLabWalletB53");
  if(!wallet){
    wallet=document.createElement("div");wallet.id="soundLabWalletB53";wallet.setAttribute("aria-label","Sound Lab resources");
    wallet.innerHTML='<div><span>♪ NOTES</span><b id="soundLabNotesB53">0</b></div><div><span>SOUND CHOICES</span><b id="soundLabSoundChoicesB53">0</b></div><div><span>MIX CHOICES</span><b id="soundLabMixChoicesB53">0</b></div>';
    const intro=lab.querySelector(":scope > p");if(intro)intro.after(wallet);else lab.prepend(wallet);
  }
  if(!$("pipSoundSectionTitleB53")){
    const title=document.createElement("h3");title.id="pipSoundSectionTitleB53";title.textContent="Pip Sounds";
    const grid=$("pipSoundGrid");if(grid)grid.before(title);
  }
  return wallet;
}
function renderSoundLabWalletB53(){
  if(!S||!ensureSoundLabWalletB53())return;
  $("soundLabNotesB53").textContent=Math.max(0,S.musicNotes||0);
  $("soundLabSoundChoicesB53").textContent=Math.max(0,S.pipSoundCredits||0);
  $("soundLabMixChoicesB53").textContent=Math.max(0,S.audioMixCredits||0);
}
function soundActionB53(pack){
  const lv=pipSoundLevelB29(pack.id),cost=pipSoundUpgradeCostB29(pack.id),credits=Math.max(0,S?.pipSoundCredits||0),notes=Math.max(0,S?.musicNotes||0);
  if(lv>=PIP_SOUND_MAX_LEVEL)return "ACTIVE · MAX";
  if(credits<1)return "NEEDS 1 SOUND CHOICE";
  if(notes<cost){const n=cost-notes;return `NEEDS ${n} MORE NOTE${n===1?"":"S"}`}
  return `${lv?`HOLD TO UPGRADE · LV ${lv+1}`:"HOLD TO UNLOCK"} · ♪${cost}`;
}
function mixActionB53(layer){
  const lv=mixLevelB46(layer.id),cost=mixUpgradeCostB46(layer.id),credits=Math.max(0,S?.audioMixCredits||0),notes=Math.max(0,S?.musicNotes||0);
  if(lv>=B46_MIX_MAX_LEVEL)return "ACTIVE · MAX";
  if(credits<1)return "NEEDS 1 MIX CHOICE";
  if(notes<cost){const n=cost-notes;return `NEEDS ${n} MORE NOTE${n===1?"":"S"}`}
  return `${lv?`HOLD TO UPGRADE · LV ${lv+1}`:"HOLD TO UNLOCK"} · ♪${cost}`;
}
function simplifyPipSoundCardsB53(){
  const buttons=[...($("pipSoundGrid")?.querySelectorAll("button.upgrade")||[])];
  buttons.forEach((btn,i)=>{
    const pack=PIP_SOUND_PACKS[i];if(!pack)return;
    const lv=pipSoundLevelB29(pack.id),maxed=lv>=PIP_SOUND_MAX_LEVEL,affordable=soundLabAffordableB45("pip",pack.id,-1),small=btn.querySelector(".small");
    if(small)small.innerHTML=`<span class="b53SoundEffect">${pack.desc}</span><strong>${soundActionB53(pack)}</strong>`;
    btn.disabled=false;btn.setAttribute("aria-disabled",String(maxed||!affordable));btn.classList.toggle("b53SoundBlocked",maxed||!affordable);
  });
}
function simplifyMixCardsB53(){
  for(let i=0;i<3;i++){
    const btn=$("audioChoice"+i),layer=B46_MIX_LAYERS[i];if(!btn||!layer)continue;
    const lv=mixLevelB46(layer.id),maxed=lv>=B46_MIX_MAX_LEVEL,affordable=soundLabAffordableB45("mix",layer.id,i),small=btn.querySelector(".small");
    if(small)small.innerHTML=`<span class="b53SoundEffect">${layer.desc}</span><strong>${mixActionB53(layer)}</strong>`;
    btn.disabled=false;btn.setAttribute("aria-disabled",String(maxed||!affordable));btn.classList.toggle("b53SoundBlocked",maxed||!affordable);
  }
}
function explainSoundLabBlockB53(kind,id,index){
  if(kind==="pip"){
    const pack=PIP_SOUND_PACKS.find(p=>p.id===id);if(!pack)return;
    const lv=pipSoundLevelB29(id),cost=pipSoundUpgradeCostB29(id);
    if(lv>=PIP_SOUND_MAX_LEVEL){showPipMessage(`${pack.name} is already maxed and active.`,true);return}
    if((S.pipSoundCredits||0)<1){showPipMessage("we need 1 Sound Choice. the next Pip level earns one.",true);return}
    if((S.musicNotes||0)<cost){const n=cost-(S.musicNotes||0);showPipMessage(`we need ${n} more Music Note${n===1?"":"s"} for ${pack.name}.`,true)}
    return;
  }
  const layer=B46_MIX_BY_ID[id];if(!layer)return;
  const lv=mixLevelB46(id),cost=mixUpgradeCostB46(id);
  if(lv>=B46_MIX_MAX_LEVEL){showPipMessage(`${layer.name} is already maxed and active.`,true);return}
  if((S.audioMixCredits||0)<1){showPipMessage(`we need 1 Mix Choice. the next arrives at Pip level ${nextMixLevelB45()}.`,true);return}
  if((S.musicNotes||0)<cost){const n=cost-(S.musicNotes||0);showPipMessage(`we need ${n} more Music Note${n===1?"":"s"} for ${layer.name}.`,true)}
}

const beginSoundLabHoldBeforeB53=beginSoundLabHoldB45;
beginSoundLabHoldB45=function(btn,e){
  const kind=btn?.dataset?.soundHoldKind,id=btn?.dataset?.soundHoldId,index=Number(btn?.dataset?.soundHoldIndex??-1);
  if(!kind||!id)return;
  if(!soundLabAffordableB45(kind,id,index)){
    e?.preventDefault?.();explainSoundLabBlockB53(kind,id,index);
    btn.classList.remove("b53SoundNudge");void btn.offsetWidth;btn.classList.add("b53SoundNudge");
    return;
  }
  beginSoundLabHoldBeforeB53(btn,e);
};

const renderPipSoundStepBeforeB53=renderPipSoundStepB26;
renderPipSoundStepB26=function(){
  renderPipSoundStepBeforeB53();
  const lab=$("pipSoundStep"),intro=lab?.querySelector(":scope > p");
  if(intro)intro.textContent="Hold a card to unlock or upgrade it.";
  simplifyPipSoundCardsB53();renderSoundLabWalletB53();
};
const renderAudioChoicesBeforeB53=renderAudioChoicesB41;
renderAudioChoicesB41=function(){
  renderAudioChoicesBeforeB53();
  const intro=$("audioStep")?.querySelector(":scope > p");if(intro)intro.textContent="Music and SFX layers";
  simplifyMixCardsB53();renderSoundLabWalletB53();
};

(function installSoundLabUsabilityB53(){
  if(document.getElementById("soundLabUsabilityStyleB53"))return;
  const style=document.createElement("style");style.id="soundLabUsabilityStyleB53";
  style.textContent=`
#stageUp #pipSoundBalance,#stageUp #audioOwned{display:none}
#stageUp #soundLabWalletB53{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 14px}
#stageUp #soundLabWalletB53>div{border:1px solid #ffffff1c;border-radius:12px;background:#111b29;padding:9px 11px;min-width:0}
#stageUp #soundLabWalletB53 span{display:block;color:#aab4c2;font-size:10px;letter-spacing:.04em}
#stageUp #soundLabWalletB53 b{display:block;color:#fff0b8;font-size:22px;margin-top:2px}
#stageUp #pipSoundSectionTitleB53{font-size:18px;margin:4px 0 7px}
#stageUp #audioStep{border-top:1px solid #ffffff18;padding-top:11px;margin-top:12px}
#stageUp #audioStep>p{float:right;margin-top:-30px;color:#8f9aad}
#stageUp .b53SoundEffect{display:block;color:#bdc6d5;margin-bottom:7px}
#stageUp .b53SoundBlocked{opacity:.7;cursor:pointer}
#stageUp .b53SoundNudge{animation:b53SoundNudge .22s ease}
@keyframes b53SoundNudge{25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@media(max-width:699px){
 #stageUp #soundLabWalletB53{gap:5px;margin:7px 0 10px}
 #stageUp #soundLabWalletB53>div{padding:7px}
 #stageUp #soundLabWalletB53 span{font-size:8px}
 #stageUp #soundLabWalletB53 b{font-size:18px}
 #stageUp #audioStep>p{font-size:10px;display:block}
}
`;
  document.head.appendChild(style);
  const title=$("pipSoundStep")?.querySelector(":scope > h2");if(title)title.textContent="Sound Lab ♪";
  ensureSoundLabWalletB53();
})();
