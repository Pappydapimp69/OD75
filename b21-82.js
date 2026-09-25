// B93 Thunderstorm charge: tap for one strike; hold, release and chain through Constellation.
const B93_STORM_TAP_SECONDS=.18;
const B93_STORM_FULL_HOLD_SECONDS=1;
const B93_STORM_MAX_SPEND=20;
const B93_STORM_MAX_CLOUDS=5;
const B93_STORM_COOLDOWN=1.25;

function stormStateB93(){return S?{charge:S.b93StormCharge||null,clouds:S.b93StormClouds||[],cooldown:S.b93StormCooldown||0}:null}
function stormTargetsB93(){return visibleEnemies()}
function randomStormTargetB93(){const pool=stormTargetsB93();return pool.length?pool[Math.floor(rnd()*pool.length)]:null}
function addLightningB93(x1,y1,x2,y2,color='#dff9ff',life=.2){
 const steps=6,dx=x2-x1,dy=y2-y1,len=hyp(dx,dy)||1,nx=-dy/len,ny=dx/len;let ax=x1,ay=y1;
 for(let i=1;i<=steps;i++){const t=i/steps,j=i===steps?0:rr(-8,8),bx=x1+dx*t+nx*j,by=y1+dy*t+ny*j;addOverLine(ax,ay,bx,by,color,life);ax=bx;ay=by}
}
function strikeStormTargetB93(first,bounces=0,damage=1,origin=null){
 if(!first||first.dead)return 0;
 const constellation=Math.max(0,bossPowerLevel('constellation')),range=120+constellation*22;
 const ox=origin?.x??first.x,oy=origin?.y??first.y-Math.max(H*.55,260);
 addLightningB93(ox,oy,first.x,first.y,'#9ee7ff',.24);hitEnemy(first,damage,'overdrive');particle(first.x,first.y,'#9ee7ff',12,130);ring(first.x,first.y,'#9ee7ff',52);
 let hits=1,prev=first,used=new Set([first]);
 for(let i=0;i<bounces;i++){let best=null,bestD=range;for(const e of enemies){if(e.dead||used.has(e))continue;const d=hyp(e.x-prev.x,e.y-prev.y);if(d<bestD){best=e;bestD=d}}if(!best)break;addLightningB93(prev.x,prev.y,best.x,best.y,'#dff9ff',.2);hitEnemy(best,damage*Math.max(.55,.84-i*.08),'overdrive');particle(best.x,best.y,'#9ee7ff',8,105);used.add(best);prev=best;hits++}
 tone(1180-rr(0,260),.07,.018,'square');return hits;
}
function cancelStormChargeB93(restore=true){
 const charge=S?.b93StormCharge;if(!charge)return false;
 if(restore)S.heat=charge.startHeat;S.b93StormCharge=null;S.b38OverHeld=false;S.over=0;updateUI();return true;
}
function launchStormCloudsB93(count,level){
 S.b93StormClouds=[];
 for(let i=0;i<count;i++){const a=-Math.PI/2+(i-(count-1)/2)*.24;S.b93StormClouds.push({x:P.x+Math.cos(a)*30,y:P.y-38+Math.sin(a)*10,delay:i*.11,target:null,age:0,level})}
}
function releaseStormB93(){
 const charge=S?.b93StormCharge;if(!charge)return false;
 if(!S.run||S.end||S.b39Paused||S.waveState==='stage'||S.waveState==='break')return cancelStormChargeB93(true);
 const quick=charge.held<B93_STORM_TAP_SECONDS,spend=quick?4:Math.max(4,Math.min(B93_STORM_MAX_SPEND,charge.spent)),count=quick?1:Math.max(1,Math.min(B93_STORM_MAX_CLOUDS,Math.ceil(spend/4)));
 S.heat=Math.max(0,charge.startHeat-spend);S.b93StormCharge=null;S.b38OverHeld=false;S.over=0;S.b93StormCooldown=B93_STORM_COOLDOWN;
 if(quick){flash=Math.max(flash,.55);shake=Math.max(shake,8);strikeStormTargetB93(randomStormTargetB93(),0,1.25+charge.level*.62)}
 else{launchStormCloudsB93(count,charge.level);announce(`THUNDERSTORM · ${count} CLOUD${count===1?'':'S'}`,650)}
 updateUI();return true;
}
function updateStormCloudsB93(dt){
 const clouds=S?.b93StormClouds||[];
 for(let i=clouds.length-1;i>=0;i--){const cloud=clouds[i];cloud.age+=dt;if((cloud.delay-=dt)>0)continue;if(!cloud.target||cloud.target.dead)cloud.target=randomStormTargetB93();if(!cloud.target){if(cloud.age>2)clouds.splice(i,1);continue}
   const tx=cloud.target.x,ty=cloud.target.y-52,dx=tx-cloud.x,dy=ty-cloud.y,d=hyp(dx,dy)||1,step=Math.min(d,520*dt);cloud.x+=dx/d*step;cloud.y+=dy/d*step;
   if(d<=18){const constellation=Math.max(0,bossPowerLevel('constellation'));strikeStormTargetB93(cloud.target,constellation,1.25+cloud.level*.62,{x:cloud.x,y:cloud.y});flash=Math.max(flash,.1);shake=Math.max(shake,4);clouds.splice(i,1)}
 }
}
function tickStormB93(dt){
 if(!S||S.b39Paused)return;
 if(S.b93StormCooldown>0&&S.run)S.b93StormCooldown=Math.max(0,S.b93StormCooldown-dt);
 const charge=S.b93StormCharge;
 if(charge){if(!S.run||S.end||S.waveState==='stage'||S.waveState==='break'){cancelStormChargeB93(true);return}charge.held+=dt;charge.spent=Math.min(B93_STORM_MAX_SPEND,charge.spent+B93_STORM_MAX_SPEND/B93_STORM_FULL_HOLD_SECONDS*dt);charge.clouds=Math.min(B93_STORM_MAX_CLOUDS,Math.floor((charge.spent+1e-6)/4));S.heat=Math.max(0,charge.startHeat-charge.spent)}
 if(S.run&&!S.end&&(S.waveState==='active'||S.waveState==='boss'))updateStormCloudsB93(dt);else if(S.b93StormClouds?.length)S.b93StormClouds=[];
}

const canIgniteBeforeB93=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){if(id==='storm'&&((S?.b93StormCooldown||0)>0||S?.b93StormCharge||(S?.b93StormClouds?.length||0)>0))return false;return canIgniteBeforeB93(id)};
const triggerOverdriveBeforeB93=triggerOverdrive;
triggerOverdrive=function(){
 if(S?.overType!=='storm')return triggerOverdriveBeforeB93();
 if(S.b93StormCharge)return true;if(!canIgniteOverdriveB38('storm'))return false;
 S.b93StormCharge={held:0,spent:0,clouds:0,startHeat:S.heat,level:Math.max(1,overLevel('storm'))};S.b38OverHeld=true;S.over=0;S.overdrives=(S.overdrives||0)+1;announce('THUNDERSTORM · CLOUDS GATHERING',650);tone(180,.12,.012,'sine');updateUI();return true;
};
const stopOverdriveBeforeB93=stopOverdriveB38;
stopOverdriveB38=function(spent=false){if(S?.b93StormCharge)return releaseStormB93();return stopOverdriveBeforeB93(spent)};
const updateBeforeB93=update;
update=function(dt){updateBeforeB93(dt);tickStormB93(dt);if(S?.b93StormCharge||(S?.b93StormCooldown||0)>0)updateUI()};

function drawCloudB93(x,y,alpha=1,scale=1){X.save();X.globalAlpha=alpha;X.fillStyle='#cdeeff';X.shadowColor='#7ed8ff';X.shadowBlur=10*scale;for(const q of [[-10,2,9],[0,-3,12],[11,2,8],[-1,5,14]]){X.beginPath();X.arc(x+q[0]*scale,y+q[1]*scale,q[2]*scale,0,Math.PI*2);X.fill()}X.restore()}
function drawStormB93(){
 if(!S?.run||S.end)return;const charge=S.b93StormCharge;
 if(charge){const shown=Math.min(B93_STORM_MAX_CLOUDS,Math.max(1,Math.ceil(charge.spent/4)));for(let i=0;i<shown;i++){const a=S.t*1.8+i/shown*Math.PI*2;drawCloudB93(worldToScreenX(P.x+Math.cos(a)*42),worldToScreenY(P.y-42+Math.sin(a)*12),i<charge.clouds?1:.38,.72)}X.save();X.textAlign='center';X.font='800 10px system-ui';X.fillStyle='#dff9ff';X.fillText(`${charge.clouds}/${B93_STORM_MAX_CLOUDS} CLOUDS`,worldToScreenX(P.x),worldToScreenY(P.y)-82);X.restore()}
 for(const cloud of S.b93StormClouds||[])drawCloudB93(worldToScreenX(cloud.x),worldToScreenY(cloud.y),clamp(1-cloud.delay,0.3,1),.65);
}
const drawBeforeB93=draw;
draw=function(){drawBeforeB93();drawStormB93()};

const updateUIBeforeB93=updateUI;
updateUI=function(){
 updateUIBeforeB93();if(!S||S.overType!=='storm')return;const button=$('overdrive');if(!button)return;
 const charge=S.b93StormCharge,clouds=S.b93StormClouds?.length||0,cool=S.b93StormCooldown||0;
 if(charge){button.disabled=false;button.classList.add('active');button.innerHTML=`THUNDERSTORM<br><small>GATHERING ${charge.clouds}/${B93_STORM_MAX_CLOUDS}</small>`}
 else if(clouds){button.disabled=true;button.innerHTML=`THUNDERSTORM<br><small>${clouds} CLOUD${clouds===1?'':'S'} STRIKING</small>`}
 else if(cool>0){button.disabled=true;button.innerHTML=`THUNDERSTORM<br><small>COOLDOWN ${cool.toFixed(1)}s</small>`}
 else if(canIgniteOverdriveB38('storm')){button.disabled=false;button.innerHTML='THUNDERSTORM<br><small>TAP OR HOLD</small>'}
};

function clearStormB93(restore=false){if(S?.b93StormCharge)cancelStormChargeB93(restore);if(S){S.b93StormClouds=[];S.b93StormCooldown=0}}
const resetBeforeB93=reset;
reset=function(){resetBeforeB93();S.b93StormCharge=null;S.b93StormClouds=[];S.b93StormCooldown=0;updateUI()};
if(S){S.b93StormCharge=null;S.b93StormClouds=[];S.b93StormCooldown=0}
window.addEventListener('blur',()=>{if(S?.b93StormCharge)S.b93StormCharge.cancel=true},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S?.b93StormCharge)S.b93StormCharge.cancel=true},true);
const releaseStormBeforeB93=releaseStormB93;
releaseStormB93=function(){if(S?.b93StormCharge?.cancel)return cancelStormChargeB93(true);return releaseStormBeforeB93()};
OVERDRIVE_INFO.storm.desc='Tap for one lightning strike. Hold to gather five clouds; release to seek targets and ricochet through nearby enemies with Constellation.';
updateUI();
