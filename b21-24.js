// B37 spatial readability: use wide upgrade screens more efficiently so type can stay large without extra scrolling.
(function installUpgradeSpatialReadabilityB37(){
 if(document.getElementById("upgradeSpatialReadabilityB37"))return;
 const style=document.createElement("style");
 style.id="upgradeSpatialReadabilityB37";
 style.textContent=`
@media(min-width:700px) and (min-height:621px){
 #stageUp>.card{width:min(860px,97vw);padding:clamp(19px,2.3vw,30px)}
 #stageUp h2{font-size:clamp(27px,3vw,36px)}
 #stageUp .card p{font-size:clamp(15.5px,1.55vw,18px);line-height:1.46}
 #stageUp .small{font-size:clamp(12.5px,1.25vw,14.5px);line-height:1.42}
 #stageUp .audiochoice b,#stageUp .upgrade b{font-size:clamp(17px,1.7vw,20px)}
 #stageUp .audiochoice .note,#stageUp .upgrade .heart{font-size:clamp(27px,2.6vw,32px)}
 #stageUp .primary{font-size:clamp(16px,1.55vw,19px)}
 #stageUp .overgrid{grid-template-columns:repeat(3,minmax(0,1fr))}
 #stageUp #pipSoundGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
 #stageUp .overgrid .upgrade,#stageUp #pipSoundGrid .upgrade{min-height:128px}
 #stageUp #pipSoundStep>p{max-width:760px}
 #stageUp #soundtrackSectionB34{margin-top:4px;padding-top:4px;border-top:1px solid #ffffff14}
 #stageUp #audioStep h2{font-size:clamp(23px,2.4vw,30px);margin-top:8px}
}
@media(min-width:1000px) and (min-height:700px){
 #stageUp>.card{width:min(930px,96vw)}
 #stageUp h2{font-size:38px}
 #stageUp .card p{font-size:18px}
 #stageUp .small{font-size:14.5px}
 #stageUp .audiochoice b,#stageUp .upgrade b{font-size:20px}
 #stageUp .audiochoice,#stageUp .upgrade{padding:17px 18px}
}
@media(max-width:699px){
 #stageUp #pipSoundGrid,#stageUp .overgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;
 document.head.appendChild(style);
})();
