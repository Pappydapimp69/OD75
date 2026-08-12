// B30 rarity pass: exploration drops are kill-checkpoint RNG; bosses guarantee Prism + special Note.
const EXPLORATION_KILL_INTERVAL_B30=30;
const EXPLORATION_ROLL_CHANCE_B30=.10;

function resetExplorationRngB30(){if(S)S.b30LastKillMilestone=0}
const resetBeforeB30=reset;
reset=function(){resetBeforeB30();resetExplorationRngB30();updateUI()};
resetExplorationRngB30();

function rollExplorationDropB30(){
 if(rnd()>=EXPLORATION_ROLL_CHANCE_B30)return false;
 const pick=Math.floor(rnd()*3);
 if(pick===0)spawnAmbientMusicNote();
 else if(pick===1)spawnMusicStarEvent();
 else spawnPrismEvent();
 return true;
}

function checkKillMilestoneDropB30(){
 if(!S||S.end)return;
 if(!Number.isFinite(S.b30LastKillMilestone))S.b30LastKillMilestone=0;
 while(S.kills>=S.b30LastKillMilestone+EXPLORATION_KILL_INTERVAL_B30){
   S.b30LastKillMilestone+=EXPLORATION_KILL_INTERVAL_B30;
   rollExplorationDropB30();
 }
}

// Count all non-boss kills, including chain-reaction kills, toward the same 30-kill checkpoints.
const killBeforeB30=kill;
kill=function(e,chain=false){
 const before=S?.kills||0;
 killBeforeB30(e,chain);
 if((S?.kills||0)>before)checkKillMilestoneDropB30();
};

// Replace B26's timer scheduler. Existing drops still animate, expire and collect normally.
updateB26Drops=function(dt){
 if(!S.run||S.end||S.waveState==="stage")return;
 for(const n of musicNoteDrops){
   if(n.dead)continue;n.life-=dt;n.phase+=dt*5;if(n.fall>0)n.fall=Math.max(0,n.fall-dt);
   if(n.fall<=0&&hyp(P.x-n.x,P.y-n.y)<P.r+n.r+7)collectMusicNote(n);
 }
 for(const n of prismSeedDrops){
   if(n.dead)continue;n.life-=dt;n.phase+=dt*5;if(n.fall>0)n.fall=Math.max(0,n.fall-dt);
   if(n.fall<=0&&hyp(P.x-n.x,P.y-n.y)<P.r+n.r+7)collectPrismSeed(n);
 }
 musicNoteDrops=musicNoteDrops.filter(n=>!n.dead&&n.life>0);
 prismSeedDrops=prismSeedDrops.filter(n=>!n.dead&&n.life>0);
};

function dropBossExplorationRewardsB30(x,y){
 const note={x:x+rr(-18,18),y:y+rr(-18,18),r:14,life:45,dead:false,event:true,reward:2,fall:.28,fallMax:.28,phase:rr(0,6.28),bossDrop:true};
 const prism={x:x+rr(-18,18),y:y+rr(-18,18),r:14,life:45,dead:false,event:true,fall:.28,fallMax:.28,phase:rr(0,6.28),bossDrop:true};
 musicNoteDrops.push(note);prismSeedDrops.push(prism);
 popup(x,y-34,"◆ + ♫ BOSS DROPS","#fff0a8",true,1.2);
 showPipMessage("boss treasure! one Prism Seed and one special Music Note landed right here ✦",true);
}

const killBossBeforeB30=killBoss;
killBoss=function(e){
 if(!e||e.dead)return;
 const x=e.x,y=e.y;
 killBossBeforeB30(e);
 dropBossExplorationRewardsB30(x,y);
};
