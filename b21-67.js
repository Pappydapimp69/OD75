// B78 Specific experiences change heart-patch choice, then fade rather than becoming permanent fear.
function roughPatchesB78(){return feelingsB76().patches||(feelingsB76().patches=[])}
function rememberPatchB78(x,y){
  const patches=roughPatchesB78(),old=patches.find(p=>hyp(p.x-x,p.y-y)<80);
  if(old){old.life=24;return}
  patches.push({x,y,life:24});if(patches.length>3)patches.shift();
}
function patchPenaltyB78(source){return roughPatchesB78().reduce((n,p)=>Math.max(n,Math.max(0,1-hyp(source.x-p.x,source.y-p.y)/110)*110*p.life/24),0)}
const scoreBeforeB78=sourceScoreB74;
sourceScoreB74=function(source){return scoreBeforeB78(source)-patchPenaltyB78(source)};
const observeBeforeB78=observePipB76;
observePipB76=function(dt){observeBeforeB78(dt);const patches=roughPatchesB78();for(const p of patches)p.life-=dt;feelingsB76().patches=patches.filter(p=>p.life>0)};
const decideBeforeB78=decidePipB76;
decidePipB76=function(){decideBeforeB78();const f=feelingsB76();if(f.intent==='shelter'&&f.trip&&!f.trip.patchRemembered){rememberPatchB78(P.pipX,P.pipY);f.trip.patchRemembered=true}};
const stageBeforeB78=openStageUpgrade;
openStageUpgrade=function(){const result=stageBeforeB78();feelingsB76().patches=[];return result};
const pauseBeforeB78=renderAscendedPauseB39;
renderAscendedPauseB39=function(){pauseBeforeB78();const n=roughPatchesB78().length;if(n)$('b39CoreList')?.insertAdjacentHTML('beforeend',rowB39('A different patch',`Pip remembers ${n} rough heart ${n===1?'patch':'patches'}. He favors alternatives, but still gathers there if needed. These memories fade within 24 seconds and clear between stages.`,'CAUTION'))};
