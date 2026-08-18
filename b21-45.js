// B58 Ascended control + Sound Lab pairing clarity.
const B58_ASCENDED_BASE_SECONDS=8;
const B58_ASCENDED_MAX_SECONDS=12;

function ascendedDurationB58(energy){
  return clamp(B58_ASCENDED_BASE_SECONDS+Math.max(0,energy-B43_ASCENDED_IGNITION_HEAT)*.04,B58_ASCENDED_BASE_SECONDS,B58_ASCENDED_MAX_SECONDS);
}

// Repeated activation is always a no-op while Pip is already Ascended.
const triggerOverdriveBeforeB58=triggerOverdrive;
triggerOverdrive=function(){
  if(S?.overType==="pip"&&S.over>0)return true;
  const pip=S?.overType==="pip",energy=pip?heatEnergyB38():0;
  const started=triggerOverdriveBeforeB58();
  if(started&&pip){
    S.b58AscTime=ascendedDurationB58(energy);
    B38_DRAIN_ENERGY_PER_SEC.pip=Math.max(1,energy/S.b58AscTime);
  }
  return started;
};

// HEAT still drains normally, but combat gains can never extend Ascended Pip past this cap.
const updateBeforeB58=update;
update=function(dt){
  updateBeforeB58(dt);
  if(!S)return;
  if(S.b43AscAuto&&S.overType==="pip"&&S.over>0){
    S.b58AscTime=Math.max(0,(S.b58AscTime||0)-dt);
    if(S.b58AscTime<=0){S.heat=0;stopOverdriveB38(true)}
  }else if(S.over<=0)S.b58AscTime=0;
};

const resetBeforeB58=reset;
reset=function(){resetBeforeB58();S.b58AscTime=0};
if(S)S.b58AscTime=0;

function soundPairingCopyB58(pack){
  const layer=B46_MIX_BY_FAMILY[familyForPackB42(pack.id)];
  return layer?`${layer.name.toUpperCase()} · ${B41_RESONANCE_TEXT[pack.id]||"Adds Resonance."}`:"NO MIX PAIRING";
}
function mixPairingCopyB58(layer){
  return `BOOSTED BY ${layer.packs.map(id=>B41_THEME_NAME[id].toUpperCase()).join(" + ")}`;
}

const simplifyPipSoundCardsBeforeB58=simplifyPipSoundCardsB53;
simplifyPipSoundCardsB53=function(){
  simplifyPipSoundCardsBeforeB58();
  [...($("pipSoundGrid")?.querySelectorAll("button.upgrade")||[])].forEach((btn,i)=>{
    const pack=PIP_SOUND_PACKS[i],effect=btn.querySelector(".b53SoundEffect");if(!pack||!effect)return;
    effect.insertAdjacentHTML("afterend",`<span class="b58Pairing">${soundPairingCopyB58(pack)}</span>`);
  });
};
const simplifyMixCardsBeforeB58=simplifyMixCardsB53;
simplifyMixCardsB53=function(){
  simplifyMixCardsBeforeB58();
  for(let i=0;i<3;i++){
    const layer=B46_MIX_LAYERS[i],effect=$("audioChoice"+i)?.querySelector(".b53SoundEffect");if(!layer||!effect)continue;
    effect.insertAdjacentHTML("afterend",`<span class="b58Pairing">${mixPairingCopyB58(layer)}</span>`);
  }
};

(function installAscendedAndPairingStyleB58(){
  if(document.getElementById("ascendedAndPairingStyleB58"))return;
  const style=document.createElement("style");style.id="ascendedAndPairingStyleB58";
  style.textContent=`#stageUp .b58Pairing{display:block;color:#ffe7a3;font-size:11px;font-weight:800;letter-spacing:.025em;margin:-2px 0 7px}`;
  document.head.appendChild(style);
})();
