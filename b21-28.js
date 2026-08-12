// B40 upgrade readability compression: reduce repeated header prose, align icons with names, enlarge useful text.
(function installUpgradeCompressionB40(){
 if(document.getElementById("upgradeCompressionB40"))return;
 const style=document.createElement("style");style.id="upgradeCompressionB40";
 style.textContent=`
#stageUp .upgrade,#stageUp .audiochoice{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr;column-gap:10px;align-items:start}
#stageUp .upgrade .heart,#stageUp .audiochoice .note{grid-column:1;grid-row:1;margin:0;line-height:1;font-size:clamp(29px,3vw,38px);align-self:center}
#stageUp .upgrade b,#stageUp .audiochoice b{grid-column:2;grid-row:1;margin:0;align-self:center;font-size:clamp(19px,2vw,23px);line-height:1.12}
#stageUp .upgrade .small,#stageUp .audiochoice .small{grid-column:1 / -1;grid-row:2;margin-top:7px;font-size:clamp(13.5px,1.35vw,16px);line-height:1.34}
#stageUp .upgrade strong,#stageUp .audiochoice strong{font-size:1em}
#stageUp h2{margin:2px 0 5px;font-size:clamp(29px,3.2vw,39px)}
#stageUp .stageStep>p,#stageUp #overdriveStep>p,#stageUp #bossRewardStep>p,#stageUp #emotionStep>p,#stageUp #abilityStep>p,#stageUp #pipSoundStep>p,#stageUp #audioStep>p{margin:3px 0 7px;font-size:clamp(13px,1.25vw,15px);line-height:1.3}
#stageUp .overgrid,#stageUp .upgradegrid,#stageUp .abilitygrid,#stageUp .bossgrid,#stageUp .audiogrid,#stageUp #pipSoundGrid{margin:8px 0;gap:8px}
#stageUp .overgrid .upgrade,#stageUp #pipSoundGrid .upgrade{min-height:108px}
@media(max-width:699px){
 #stageUp>.card{padding:10px 11px}
 #stageUp h2{font-size:25px;margin:0 0 4px}
 #stageUp .stageStep>p,#stageUp #overdriveStep>p,#stageUp #bossRewardStep>p,#stageUp #emotionStep>p,#stageUp #abilityStep>p,#stageUp #pipSoundStep>p,#stageUp #audioStep>p{font-size:11px;line-height:1.22;margin:2px 0 5px}
 #stageUp .upgrade,#stageUp .audiochoice{padding:10px;column-gap:7px;min-height:0}
 #stageUp .upgrade .heart,#stageUp .audiochoice .note{font-size:27px}
 #stageUp .upgrade b,#stageUp .audiochoice b{font-size:17px;line-height:1.08}
 #stageUp .upgrade .small,#stageUp .audiochoice .small{font-size:12.5px;line-height:1.24;margin-top:5px}
 #stageUp .overgrid,#stageUp .upgradegrid,#stageUp .abilitygrid,#stageUp .bossgrid,#stageUp .audiogrid,#stageUp #pipSoundGrid{margin:6px 0;gap:6px}
 #stageUp .overgrid .upgrade,#stageUp #pipSoundGrid .upgrade{min-height:0}
}
@media(max-height:620px){
 #stageUp .stageStep>p,#stageUp #overdriveStep>p,#stageUp #bossRewardStep>p,#stageUp #emotionStep>p,#stageUp #abilityStep>p,#stageUp #pipSoundStep>p,#stageUp #audioStep>p{display:none}
 #stageUp h2{margin-bottom:4px}
 #stageUp .upgrade .small,#stageUp .audiochoice .small{line-height:1.18}
}
`;
 document.head.appendChild(style);

 const terse={
  overdriveStep:"Equip one. Hold locked/unleveled skills to invest Stars.",
  bossRewardStep:"Choose the Boss Bond Pip learns from this fight.",
  emotionStep:"Spend one Prism Seed to deepen one emotional trait.",
  abilityStep:"Spend Heart Bits to strengthen Pip for this run.",
  pipSoundStep:"Spend Music Notes and Sound Choices to shape Pip's sound stack.",
  audioStep:"Choose one soundtrack or SFX layer for this run."
 };
 for(const [id,text] of Object.entries(terse)){
  const step=$(id),p=step?.querySelector(":scope > p");if(p)p.textContent=text;
 }
})();
