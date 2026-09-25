
// B98 Thunderstorm clouds cost HEAT one at a time: each cloud gathered takes 8% of the meter.
// The first cloud forms on press; another forms every 0.2s while held, up to five. When less than 8%
// remains, gathering pauses until HEAT recovers or the button is released. Starting, each cloud and
// a full charge are marked on screen with flashes, a darkening sky and rolling lightning.
const B98_STORM_CLOUD_COST=8;
const B98_STORM_CLOUD_SECONDS=.2;

function stormCloudFxB98(n){
  ring(P.x,P.y-42,'#9ee7ff',34+n*6);particle(P.x,P.y-42,'#dff9ff',8,110);tone(520+n*90,.07,.02,'triangle');
  flash=Math.max(flash,.12);
}
function stormFullFxB98(){
  flash=Math.max(flash,.75);shake=Math.max(shake,10);ring(P.x,P.y,'#dff9ff',150);ring(P.x,P.y,'#9ee7ff',95);
  particle(P.x,P.y-42,'#dff9ff',26,220);burstTone(740,5);announce('STORM FULL ⚡',700);
}
function gatherStormCloudB98(charge){
  if(charge.clouds>=B93_STORM_MAX_CLOUDS)return false;
  if(S.heat<B98_STORM_CLOUD_COST-1e-9){if(!charge.paused){charge.paused=true;announce('STORM · NEED HEAT',650)}return false}
  charge.paused=false;S.heat=Math.max(0,S.heat-B98_STORM_CLOUD_COST);charge.spent+=B98_STORM_CLOUD_COST;charge.clouds++;
  stormCloudFxB98(charge.clouds);
  if(charge.clouds>=B93_STORM_MAX_CLOUDS){charge.full=true;stormFullFxB98()}
  return true;
}

const triggerOverdriveBeforeB98=triggerOverdrive;
triggerOverdrive=function(){
  const fresh=S?.overType==='storm'&&!S.b93StormCharge;
  const ok=triggerOverdriveBeforeB98();
  if(ok&&fresh&&S.b93StormCharge){
    const charge=S.b93StormCharge;charge.timer=B98_STORM_CLOUD_SECONDS;charge.paused=false;charge.full=false;
    flash=Math.max(flash,.45);shake=Math.max(shake,5);ring(P.x,P.y,'#9ee7ff',120);announce('STORM GATHERING',600);
    gatherStormCloudB98(charge);updateUI();
  }
  return ok;
};

tickStormB93=function(dt){
  if(!S||S.b39Paused)return;
  if(S.b93StormCooldown>0&&S.run)S.b93StormCooldown=Math.max(0,S.b93StormCooldown-dt);
  const charge=S.b93StormCharge;
  if(charge){
    if(!S.run||S.end||S.waveState==='stage'||S.waveState==='break'){cancelStormChargeB93(true);return}
    charge.held+=dt;charge.timer=(charge.timer??B98_STORM_CLOUD_SECONDS)-dt;
    while(charge.timer<=0&&charge.clouds<B93_STORM_MAX_CLOUDS){
      if(!gatherStormCloudB98(charge)){charge.timer=0;break}
      charge.timer+=B98_STORM_CLOUD_SECONDS;
    }
    if(charge.clouds<B93_STORM_MAX_CLOUDS&&Math.random()<dt*3)charge.flicker=.08;
    if(charge.flicker>0)charge.flicker-=dt;
  }
  if(S.run&&!S.end&&(S.waveState==='active'||S.waveState==='boss'))updateStormCloudsB93(dt);else if(S.b93StormClouds?.length)S.b93StormClouds=[];
};

releaseStormB93=function(){
  const charge=S?.b93StormCharge;if(!charge)return false;
  if(charge.cancel||!S.run||S.end||S.b39Paused||S.waveState==='stage'||S.waveState==='break')return cancelStormChargeB93(true);
  const quick=charge.held<B93_STORM_TAP_SECONDS,count=Math.max(1,charge.clouds);
  S.b93StormCharge=null;S.b38OverHeld=false;S.over=0;S.b93StormCooldown=B93_STORM_COOLDOWN;
  if(quick||count===1){flash=Math.max(flash,.55);shake=Math.max(shake,8);strikeStormTargetB93(randomStormTargetB93(),0,1.25+charge.level*.62)}
  else{flash=Math.max(flash,.4);launchStormCloudsB93(count,charge.level);announce(`THUNDERSTORM · ${count} CLOUDS`,650)}
  updateUI();return true;
};

drawStormB93=function(){
  if(!S?.run||S.end)return;const charge=S.b93StormCharge;
  if(charge){
    const n=charge.clouds,sx=worldToScreenX(P.x),sy=worldToScreenY(P.y);
    X.save();X.globalAlpha=.10+n*.045;X.fillStyle='#061226';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore();
    if(charge.flicker>0){X.save();X.globalAlpha=.10;X.fillStyle='#dff9ff';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore()}
    for(let i=0;i<B93_STORM_MAX_CLOUDS;i++){const a=S.t*1.6+i/B93_STORM_MAX_CLOUDS*Math.PI*2;drawCloudB93(worldToScreenX(P.x+Math.cos(a)*52),worldToScreenY(P.y-46+Math.sin(a)*14),i<n?1:.18,i<n?1.05:.7)}
    if(n>=2&&Math.random()<.35){const i=Math.floor(Math.random()*n),j=(i+1)%n,a=S.t*1.6+i/B93_STORM_MAX_CLOUDS*Math.PI*2,b=S.t*1.6+j/B93_STORM_MAX_CLOUDS*Math.PI*2;
      X.save();X.strokeStyle='#dff9ff';X.lineWidth=2;X.shadowColor='#9ee7ff';X.shadowBlur=10;X.beginPath();X.moveTo(worldToScreenX(P.x+Math.cos(a)*52),worldToScreenY(P.y-46+Math.sin(a)*14));X.lineTo((worldToScreenX(P.x+Math.cos(a)*52)+worldToScreenX(P.x+Math.cos(b)*52))/2+rr(-8,8),worldToScreenY(P.y-40));X.lineTo(worldToScreenX(P.x+Math.cos(b)*52),worldToScreenY(P.y-46+Math.sin(b)*14));X.stroke();X.restore()}
    X.save();X.textAlign='center';X.font='900 12px system-ui';X.fillStyle=charge.full?'#fff0a8':charge.paused?'#ff9fba':'#dff9ff';
    X.fillText(charge.full?'FULLY CHARGED · RELEASE':charge.paused?`${n}/${B93_STORM_MAX_CLOUDS} · NEED MORE HEAT`:`${n}/${B93_STORM_MAX_CLOUDS} CLOUDS`,sx,sy-92);X.restore();
  }
  for(const cloud of S.b93StormClouds||[])drawCloudB93(worldToScreenX(cloud.x),worldToScreenY(cloud.y),clamp(1-cloud.delay,0.3,1),.85);
};

const updateUIBeforeB98=updateUI;
updateUI=function(){
  updateUIBeforeB98();const charge=S?.b93StormCharge,button=$('overdrive');if(!charge||!button)return;
  button.innerHTML=`STORM<br><small>${charge.full?'FULL · RELEASE':charge.paused?'NEED HEAT · '+charge.clouds+'/'+B93_STORM_MAX_CLOUDS:'GATHERING '+charge.clouds+'/'+B93_STORM_MAX_CLOUDS}</small>`;
};
OVERDRIVE_INFO.storm.desc='Hold to gather up to five clouds, each costing 8% HEAT; release to strike. Quick taps strike once. Constellation adds ricochets.';
