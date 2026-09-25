// B91 Wave closeout read
const B91_WAVE_CLOSE_SECONDS=.8;
function clearWaveCloseB91(){if(S){S.b91WaveCloseCue=0;S.b91WaveCloseText=""}}
function waveRemainingB91(){return Math.max(0,(S?.waveGoal||0)-(S?.waveKills||0))}
function triggerWaveCloseB91(){
 if(!S||S.waveState!=="active"||S.bossActive)return;
 const left=waveRemainingB91();
 if(left>0&&left<=2){S.b91WaveCloseCue=B91_WAVE_CLOSE_SECONDS;S.b91WaveCloseText=`${left} LEFT`}
 else if(left<=0)clearWaveCloseB91();
}
function tickWaveCloseB91(dt){
 if(!S)return;
 if(S.b39Paused)return;
 if(!S.run||S.end||S.waveState!=="active"||S.bossActive||waveRemainingB91()<=0){clearWaveCloseB91();return}
 if(S.b91WaveCloseCue>0)S.b91WaveCloseCue=Math.max(0,S.b91WaveCloseCue-dt);
}
function waveCloseCueB91(){
 if(!S||!S.b91WaveCloseCue||!S.b91WaveCloseText||S.waveState!=="active"||S.bossActive)return null;
 const k=clamp(S.b91WaveCloseCue/B91_WAVE_CLOSE_SECONDS,0,1);
 return {x:P.x,y:P.y-44-(1-k)*10,alpha:k,text:S.b91WaveCloseText};
}
function drawWaveCloseB91(){
 const q=waveCloseCueB91();if(!q)return;
 X.save();X.globalAlpha=.18+.38*q.alpha;X.strokeStyle=COLORS.gold;X.lineWidth=2;
 X.beginPath();X.arc(P.x,P.y,34+(1-q.alpha)*8,0,Math.PI*2);X.stroke();
 X.globalAlpha=.78*q.alpha;X.fillStyle=COLORS.gold;X.font="bold 14px system-ui";X.textAlign="center";
 X.fillText(q.text,q.x,q.y);X.restore();
}
const killBeforeB91=kill;
kill=function(e,chain=false){const before=waveRemainingB91();killBeforeB91(e,chain);if(e?.type==="boss"){clearWaveCloseB91();return}if(before>waveRemainingB91())triggerWaveCloseB91()};
const updateBeforeB91=update;
update=function(dt){updateBeforeB91(dt);tickWaveCloseB91(dt)};
const drawBeforeB91=draw;
draw=function(){drawBeforeB91();drawWaveCloseB91()};
const startWaveBeforeB91=startWave;
startWave=function(n){const r=startWaveBeforeB91(n);clearWaveCloseB91();return r};
const beginWaveBreakBeforeB91=beginWaveBreak;
beginWaveBreak=function(){const r=beginWaveBreakBeforeB91();clearWaveCloseB91();return r};
const resetBeforeB91=reset;
reset=function(){resetBeforeB91();clearWaveCloseB91()};
const openStageUpgradeBeforeB91=openStageUpgrade;
openStageUpgrade=function(){const r=openStageUpgradeBeforeB91();clearWaveCloseB91();return r};
