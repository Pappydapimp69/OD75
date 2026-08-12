// B46 Mix Layer rework: exactly three progression layers, each paired with two unique Pip Sounds.
const B46_MIX_MAX_LEVEL=4;
const B46_MIX_LAYERS=[
  {id:"heartmix",family:"heart",icon:"♥♪",name:"Heart Mix",packs:["honey","plush"],members:["harmony","heartbeat","pipchime"],desc:"Warm harmony, heartbeat pulse and Pip chimes."},
  {id:"starmix",family:"star",icon:"✦♪",name:"Star Mix",packs:["starlight","cherub"],members:["melody","bells","dashbell"],desc:"Bright melody, bells and dash sparkle."},
  {id:"orbitmix",family:"orbit",icon:"◎♪",name:"Orbit Mix",packs:["bubble","cosmic"],members:["bass","bubble","shieldchime"],desc:"Deep bass, bubble texture and shield chimes."}
];
const B46_MIX_BY_ID=Object.fromEntries(B46_MIX_LAYERS.map(x=>[x.id,x]));
const B46_MIX_BY_FAMILY=Object.fromEntries(B46_MIX_LAYERS.map(x=>[x.family,x]));

function mixLevelB46(id){return Math.max(0,S?.b46MixLevels?.[id]||0)}
function mixUpgradeCostB46(id){
  const lv=mixLevelB46(id);if(!B46_MIX_BY_ID[id]||lv>=B46_MIX_MAX_LEVEL)return Infinity;
  return lv===0?2:Math.min(4,lv+1);
}
function nextMixTextB46(lv){
  if(lv<=0)return "Unlocks all three bundled audio components.";
  if(lv===1)return "Next: richer secondary voices.";
  if(lv===2)return "Next: stronger arrangement detail.";
  if(lv===3)return "Next: signature full mix.";
  return "Signature mix reached.";
}
function initMixLayersB46(){
  if(!S)return;
  S.b46MixLevels={heartmix:0,starmix:0,orbitmix:0};
}
const resetBeforeB46=reset;
reset=function(){resetBeforeB46();initMixLayersB46();updateUI()};
initMixLayersB46();

// Each Pip Sound belongs to exactly one Mix Layer. No reuse across pairings.
familyForPackB42=function(id){
  for(const layer of B46_MIX_LAYERS)if(layer.packs.includes(id))return layer.family;
  return "heart";
};
familyPackNamesB42=function(family){
  const layer=B46_MIX_BY_FAMILY[family];return layer?layer.packs.map(id=>B41_THEME_NAME[id]||id):[];
};
resonanceRankB42=function(theme){
  const pipLv=pipThemeLevelB41(theme);if(pipLv<=0)return 0;
  const layer=B46_MIX_BY_FAMILY[familyForPackB42(theme)];if(!layer)return 0;
  return Math.min(pipLv,mixLevelB46(layer.id));
};
resonanceRankB41=function(theme){return resonanceRankB42(theme)};
resonanceLabelB41=function(theme){
  const layer=B46_MIX_BY_FAMILY[familyForPackB42(theme)],rank=resonanceRankB42(theme);
  if(!layer)return "No Mix pairing";
  return rank>0?`${layer.name} · ${B41_THEME_NAME[theme]} R${rank}`:`${layer.name} pairs ${layer.packs.map(id=>B41_THEME_NAME[id]).join(" + ")}`;
};

// The Sound Lab now always presents the three actual Mix Layers instead of rotating nine component items.
chooseAudioOptionsB41=function(){
  if(!S)return;
  S.audioChoices=B46_MIX_LAYERS.slice();
  renderAudioChoicesB41();
};
renderAudioChoicesB41=function(){
  const credits=Math.max(0,S?.audioMixCredits||0),notes=Math.max(0,S?.musicNotes||0);
  if($("audioOwned")){
    const owned=B46_MIX_LAYERS.filter(x=>mixLevelB46(x.id)>0).length;
    $("audioOwned").textContent=`MIX ${credits} · ♪ ${notes} · ${owned}/3 Mix Layers · next Mix Choice at Pip Lv ${nextMixLevelB45()}`;
  }
  for(let i=0;i<3;i++){
    const btn=$("audioChoice"+i),layer=B46_MIX_LAYERS[i];if(!btn||!layer)continue;
    const lv=mixLevelB46(layer.id),cost=mixUpgradeCostB46(layer.id),maxed=lv>=B46_MIX_MAX_LEVEL;
    const pair=layer.packs.map(id=>`${B41_THEME_NAME[id]}${pipThemeLevelB41(id)>0?` Lv ${pipThemeLevelB41(id)}`:""}`).join(" + ");
    const active=layer.packs.filter(id=>pipThemeLevelB41(id)>0).map(id=>`${B41_THEME_NAME[id]} R${resonanceRankB42(id)}`);
    const action=maxed?"MAX":credits<1?`NEXT MIX · PIP LV ${nextMixLevelB45()}`:notes<cost?`NEEDS ♪${cost}`:`${lv?`HOLD TO UPGRADE TO LV ${lv+1}`:"HOLD TO UNLOCK"} · ♪${cost} · USE 1 MIX`;
    btn.style.display="";btn.disabled=maxed||credits<1||notes<cost;
    btn.classList.toggle("ready",!btn.disabled);btn.classList.toggle("b41-resonant",active.length>0);
    btn.innerHTML=`<div class="note">${layer.icon}</div><b>${layer.name} · ${lv?`Lv ${lv}`:"LOCKED"}</b><span class="small">${layer.desc}<br><strong>PAIRS ONLY: ${pair}</strong><br>${active.length?`ACTIVE · ${active.join(" · ")}`:"Unlock either paired Pip Sound to create Resonance."}<br>${nextMixTextB46(lv)}<br><strong>${action}</strong></span>`;
  }
  if(typeof annotateSoundLabButtonsB45==="function")annotateSoundLabButtonsB45();
};

// B45's delegated hold controller stays authoritative; teach it about the three Mix Layer objects.
const soundLabAffordableBeforeB46=soundLabAffordableB45;
soundLabAffordableB45=function(kind,id,index){
  if(kind!=="mix")return soundLabAffordableBeforeB46(kind,id,index);
  const layer=B46_MIX_BY_ID[id];if(!S?.stagePending||!layer||S.audioChoices?.[index]?.id!==id)return false;
  const lv=mixLevelB46(id),cost=mixUpgradeCostB46(id);
  return lv<B46_MIX_MAX_LEVEL&&(S.audioMixCredits||0)>=1&&(S.musicNotes||0)>=cost;
};
const completeSoundLabHoldBeforeB46=completeSoundLabHoldB45;
completeSoundLabHoldB45=function(kind,id,index){
  if(kind!=="mix")return completeSoundLabHoldBeforeB46(kind,id,index);
  if(!soundLabAffordableB45(kind,id,index))return false;
  const layer=B46_MIX_BY_ID[id],lv=mixLevelB46(id),cost=mixUpgradeCostB46(id),next=lv+1;
  S.musicNotes-=cost;S.audioMixCredits--;S.b46MixLevels[id]=next;
  // Preserve the richer B41/B42 engine: all three bundled components deepen together.
  for(const member of layer.members){S.audioLevels[member]=next;S.audioUnlocks.add(member)}
  const active=layer.packs.filter(pack=>pipThemeLevelB41(pack)>0);
  showPipMessage(lv===0?`${layer.name} unlocked.${active.length?` ${active.map(x=>B41_THEME_NAME[x]).join(" + ")} Resonance is online ✦`:" its paired Pip Sounds are ready to resonate."}`:`${layer.name} is level ${next}. all three audio components deepened together ✦`,true);
  if(audioCtx)burstTone(layer.family==="star"?720:layer.family==="orbit"?480:600,4);
  chooseAudioOptionsB41();renderPipSoundStepB26();
  if(navigator.vibrate)try{navigator.vibrate(35)}catch(_){}
  return true;
};

chooseAudioUnlock=function(index){
  if(performance.now()<soundLabHold.suppressUntil)return;
  const layer=S.audioChoices?.[index];if(!layer||!B46_MIX_BY_ID[layer.id])return;
  const lv=mixLevelB46(layer.id),cost=mixUpgradeCostB46(layer.id);
  if(lv>=B46_MIX_MAX_LEVEL)return;
  if((S.audioMixCredits||0)<1){showPipMessage(`next Mix Choice arrives at Pip level ${nextMixLevelB45()}.`,true);return}
  if((S.musicNotes||0)<cost){showPipMessage(`we need ${cost-(S.musicNotes||0)} more Music Note${cost-(S.musicNotes||0)===1?"":"s"} for ${layer.name}.`,true);return}
  showPipMessage(`hold ${layer.name} to ${lv?"upgrade":"unlock"} it.`,true);
};

// Keep the Ascended Pip page aligned with the unique one-layer/two-sound pairing model.
const renderAscendedPauseBeforeB46=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  renderAscendedPauseBeforeB46();
  const box=$("b39SoundList");if(!box)return;
  box.innerHTML=PIP_SOUND_PACKS.map(pack=>{
    const pipLv=pipThemeLevelB41(pack.id),layer=B46_MIX_BY_FAMILY[familyForPackB42(pack.id)],rank=resonanceRankB42(pack.id),partner=layer?.packs.find(id=>id!==pack.id);
    const mixLv=layer?mixLevelB46(layer.id):0;
    return rowB39(`${pack.name}${pipLv?` Lv ${pipLv}`:""}`,pipLv&&layer?`${layer.name} Lv ${mixLv} pairs only ${B41_THEME_NAME[pack.id]} + ${B41_THEME_NAME[partner]}. ${B41_RESONANCE_TEXT[pack.id]}${mixLv?` Resonance ${rank}.`:" Unlock that Mix Layer to activate it."}`:layer?`Unique pairing: ${layer.name} · ${layer.packs.map(id=>B41_THEME_NAME[id]).join(" + ")}.`:"No Mix pairing.",rank?`R${rank}`:pipLv?"UNPAIRED":"LOCKED",!pipLv);
  }).join("");
};

(function updateMixLayerCopyB46(){
  const title=$("audioStep")?.querySelector("h2");if(title)title.textContent="Mix Layers ♪";
  const copy=$("audioStep")?.querySelector(":scope > p");if(copy)copy.textContent="Three Mix Layers. Each pairs with two unique Pip Sounds; no Pip Sound is reused. Hold to unlock or upgrade.";
})();
