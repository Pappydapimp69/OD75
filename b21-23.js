// B36 readability pass: use the upgrade modal's available space for larger, easier-to-read type.
(function installUpgradeReadabilityB36(){
 if(document.getElementById("upgradeReadabilityB36"))return;
 const style=document.createElement("style");
 style.id="upgradeReadabilityB36";
 style.textContent=`
#stageUp{padding:clamp(8px,2vw,18px)}
#stageUp>.card{
 width:min(780px,96vw);
 max-height:94dvh;
 padding:clamp(16px,2.4vw,28px);
 border-radius:20px;
}
#stageUp .kicker{font-size:clamp(11px,1.15vw,13px);line-height:1.3}
#stageUp h2{font-size:clamp(24px,3.1vw,34px);line-height:1.05;margin:5px 0 9px;letter-spacing:-.025em}
#stageUp .card p{font-size:clamp(14px,1.65vw,17px);line-height:1.42;margin:8px 0 11px}
#stageUp .small{font-size:clamp(12px,1.35vw,14px);line-height:1.4}
#stageUp #stageBond{font-size:clamp(13px,1.45vw,15px);line-height:1.4}
#stageUp .upgradegrid,#stageUp .bossgrid,#stageUp .abilitygrid,#stageUp .audiogrid,#stageUp .overgrid{gap:clamp(9px,1.3vw,13px);margin:clamp(10px,1.5vw,15px) 0}
#stageUp .audiochoice,#stageUp .upgrade{
 padding:clamp(13px,1.7vw,17px);
 min-height:clamp(118px,15dvh,148px);
 border-radius:15px;
 line-height:1.3;
}
#stageUp .audiochoice b,#stageUp .upgrade b{font-size:clamp(16px,1.8vw,19px);line-height:1.18;margin-bottom:6px}
#stageUp .audiochoice .note,#stageUp .upgrade .heart{font-size:clamp(25px,2.8vw,31px);line-height:1;margin-bottom:8px}
#stageUp .primary{font-size:clamp(15px,1.65vw,18px);line-height:1.2;padding:clamp(12px,1.5vw,16px)}
#stageUp #starBalance,#stageUp #abilityBalance,#stageUp #pipSoundBalance,#stageUp #audioOwned{font-size:clamp(12px,1.35vw,14px);line-height:1.4}
@media(max-width:560px){
 #stageUp{padding:6px}
 #stageUp>.card{width:calc(100vw - 12px);max-height:97dvh;padding:12px 12px 13px;border-radius:15px}
 #stageUp .kicker{font-size:10.5px}
 #stageUp h2{font-size:clamp(21px,6vw,27px);margin:3px 0 6px}
 #stageUp .card p{font-size:13.5px;line-height:1.34;margin:5px 0 8px}
 #stageUp .small{font-size:11.5px;line-height:1.34}
 #stageUp #stageBond{font-size:12px}
 #stageUp .audiochoice,#stageUp .upgrade{padding:10px;min-height:auto}
 #stageUp .audiochoice b,#stageUp .upgrade b{font-size:14.5px;line-height:1.16;margin-bottom:4px}
 #stageUp .audiochoice .note,#stageUp .upgrade .heart{font-size:23px;margin-bottom:5px}
 #stageUp .primary{font-size:14.5px;padding:11px}
 #stageUp .upgradegrid,#stageUp .bossgrid,#stageUp .abilitygrid,#stageUp .audiogrid,#stageUp .overgrid{gap:7px;margin:8px 0}
}
@media(max-height:620px){
 #stageUp>.card{padding:10px 12px;max-height:98dvh}
 #stageUp h2{font-size:21px;margin:2px 0 4px}
 #stageUp .card p{font-size:12.5px;line-height:1.28;margin:4px 0 6px}
 #stageUp .small{font-size:10.5px;line-height:1.28}
 #stageUp .audiochoice,#stageUp .upgrade{padding:8px;min-height:auto}
 #stageUp .audiochoice b,#stageUp .upgrade b{font-size:13.5px;margin-bottom:3px}
 #stageUp .audiochoice .note,#stageUp .upgrade .heart{font-size:21px;margin-bottom:4px}
 #stageUp .primary{font-size:13.5px;padding:9px}
 #stageUp .upgradegrid,#stageUp .bossgrid,#stageUp .abilitygrid,#stageUp .audiogrid,#stageUp .overgrid{gap:6px;margin:6px 0}
}
`;
 document.head.appendChild(style);
})();
