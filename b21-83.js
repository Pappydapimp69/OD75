
// B94 Overdrive hold contract: every basic skill ignites at 25% HEAT and Ascended Pip at 70%.
// Beam and Guardian fire on press, drain while held and stop on release, even below the ignition line.
// Nova and Gravity Well join Thunderstorm as charged area skills: holding drains HEAT until fully charged,
// then drains nothing more; nothing happens to enemies until the button is released.
const B94_IGNITION_PERCENT=25;
const B94_PIP_IGNITION_PERCENT=70;
const B94_CHARGE_SKILLS={nova:{spend:20,seconds:1},gravity:{spend:20,seconds:1}};
const B94_MIN_CHARGE=.2;
const B94_NOVA_WAVE_GAP=.16;

function isChargeSkillB94(id){return !!B94_CHARGE_SKILLS[id]}
function chargeLiveB94(){return !!(S&&S.run&&!S.end&&S.waveState!=='stage'&&S.waveState!=='break')}
function chargeFractionB94(charge=S?.b94Charge){if(!charge)return 0;const cfg=B94_CHARGE_SKILLS[charge.id];return clamp(charge.spent/cfg.spend,0,1)}

canIgniteOverdriveB38=function(id=S?.overType){
  if(!S||S.over>0||!S.run||S.end||S.waveState==='stage'||S.b94Charge)return false;
  if(id==='storm'&&((S.b93StormCooldown||0)>0||S.b93StormCharge||(S.b93StormClouds?.length||0)>0))return false;
  if(id==='pip')return S.heat>=B94_PIP_IGNITION_PERCENT-1e-9;
  return S.heat>=B94_IGNITION_PERCENT-1e-9;
};

function startChargeB94(id){
  if(S.b94Charge)return true;
  if(!canIgniteOverdriveB38(id))return false;
  S.b94Charge={id,held:0,spent:0,startHeat:S.heat,level:Math.max(1,overLevel(id))};
  S.b38OverHeld=true;S.over=0;S.overdrives=(S.overdrives||0)+1;
  announce(`${OVERDRIVE_INFO[id].name.toUpperCase()} · CHARGING`,600);tone(id==='nova'?260:150,.12,.012,'sine');
  updateUI();return true;
}
function cancelChargeB94(restore=true){
  const charge=S?.b94Charge;if(!charge)return false;
  if(restore)S.heat=charge.startHeat;
  S.b94Charge=null;S.b38OverHeld=false;S.over=0;updateUI();return true;
}
function releaseChargeB94(){
  const charge=S?.b94Charge;if(!charge)return false;
  if(charge.cancel||!chargeLiveB94()||S.b39Paused)return cancelChargeB94(true);
  const cfg=B94_CHARGE_SKILLS[charge.id],frac=Math.max(B94_MIN_CHARGE,chargeFractionB94(charge));
  const spend=Math.min(charge.startHeat,Math.max(charge.spent,cfg.spend*B94_MIN_CHARGE));
  S.heat=Math.max(0,charge.startHeat-spend);S.b94Charge=null;S.b38OverHeld=false;S.over=0;
  if(charge.id==='nova')releaseNovaB94(frac,charge.level);else releaseGravityB94(frac,charge.level);
  updateUI();return true;
}

function releaseNovaB94(frac,lv){
  const count=1+Math.round(frac*2),radius=(125+lv*24)*(.75+.5*frac),damage=(.9+lv*.72)*(.8+.9*frac);
  S.b94NovaWaves=[];for(let i=0;i<count;i++)S.b94NovaWaves.push({delay:i*B94_NOVA_WAVE_GAP,radius:radius*(1+i*.12),damage});
  flash=Math.max(flash,.25+frac*.35);shake=Math.max(shake,6+frac*8);
}
function fireNovaWaveB94(wave){
  ring(P.x,P.y,'#ff9fba',wave.radius);particle(P.x,P.y,'#ffd36f',18,180);
  for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<=wave.radius)hitEnemy(e,wave.damage,'overdrive');
  burstTone(320+wave.radius*.2,4);
}
function releaseGravityB94(frac,lv){
  const t=getAutoTarget(),x=t?t.x:P.x+P.faceX*90,y=t?t.y:P.y+P.faceY*90;
  S.b94Well={x,y,level:lv,time:(1+2.5*frac)*(1+(lv-1)*.1),pulse:0,radius:175+lv*22};
  flash=Math.max(flash,.2);shake=Math.max(shake,6);burstTone(180+lv*20,4);
}
function updateWellB94(dt){
  const well=S.b94Well;if(!well)return;
  well.time-=dt;well.pulse-=dt;const lv=well.level;
  for(const e of enemies){if(e.dead)continue;const dx=well.x-e.x,dy=well.y-e.y,d=hyp(dx,dy)||1;if(d<well.radius){const pull=(115+lv*28)*(1-d/well.radius+.18);e.x+=dx/d*pull*dt;e.y+=dy/d*pull*dt}}
  if(well.pulse<=0){ring(well.x,well.y,'#b388ff',well.radius);particle(well.x,well.y,'#b388ff',14,90);for(const e of [...enemies])if(!e.dead&&hyp(e.x-well.x,e.y-well.y)<well.radius)hitEnemy(e,.38+lv*.30,'overdrive');well.pulse=Math.max(.24,.52-lv*.045)}
  if(well.time<=0)S.b94Well=null;
}
function tickChargeB94(dt){
  if(!S||S.b39Paused)return;
  const charge=S.b94Charge;
  if(charge){
    if(!chargeLiveB94()){cancelChargeB94(true);return}
    const cfg=B94_CHARGE_SKILLS[charge.id];charge.held+=dt;
    charge.spent=Math.min(cfg.spend,charge.startHeat,charge.spent+cfg.spend/cfg.seconds*dt);
    S.heat=Math.max(0,charge.startHeat-charge.spent);
  }
  if(S.run&&!S.end&&(S.waveState==='active'||S.waveState==='boss')){
    const waves=S.b94NovaWaves||[];
    for(let i=0;i<waves.length;i++){const w=waves[i];if((w.delay-=dt)<=0){fireNovaWaveB94(w);waves.splice(i--,1)}}
    updateWellB94(dt);
  }else{S.b94NovaWaves=[];S.b94Well=null}
}

const triggerOverdriveBeforeB94=triggerOverdrive;
triggerOverdrive=function(){
  if(!S)return false;
  const id=S.overType;
  if(isChargeSkillB94(id))return startChargeB94(id);
  if(id==='pip'&&S.over<=0&&S.run&&!S.end&&S.heat<B94_PIP_IGNITION_PERCENT){
    showPipMessage(`Ascended Pip needs ${Math.ceil(B94_PIP_IGNITION_PERCENT-S.heat)}% more HEAT.`,true);return false;
  }
  return triggerOverdriveBeforeB94();
};
const stopOverdriveBeforeB94=stopOverdriveB38;
stopOverdriveB38=function(spent=false){if(S?.b94Charge)return releaseChargeB94();return stopOverdriveBeforeB94(spent)};
const updateBeforeB94=update;
update=function(dt){updateBeforeB94(dt);tickChargeB94(dt);if(S?.b94Charge)updateUI()};

function drawChargeB94(){
  if(!S?.run||S.end)return;
  const charge=S.b94Charge,sx=worldToScreenX(P.x),sy=worldToScreenY(P.y);
  if(charge){
    const frac=chargeFractionB94(charge),color=charge.id==='nova'?'#ff9fba':'#b388ff',full=frac>=.999;
    X.save();X.strokeStyle=color;X.globalAlpha=.35;X.lineWidth=3;X.beginPath();X.arc(sx,sy,30,0,Math.PI*2);X.stroke();
    X.globalAlpha=1;X.lineWidth=full?5:4;X.beginPath();X.arc(sx,sy,30,-Math.PI/2,-Math.PI/2+Math.PI*2*frac);X.stroke();
    X.textAlign='center';X.font='800 10px system-ui';X.fillStyle=color;X.fillText(full?'FULL · RELEASE':`${Math.round(frac*100)}%`,sx,sy-44);X.restore();
  }
  const well=S.b94Well;
  if(well){const wx=worldToScreenX(well.x),wy=worldToScreenY(well.y);X.save();X.fillStyle='#1a0f2e';X.strokeStyle='#b388ff';X.shadowColor='#b388ff';X.shadowBlur=16;X.lineWidth=3;X.beginPath();X.arc(wx,wy,14+Math.sin(S.t*9)*2,0,Math.PI*2);X.fill();X.stroke();X.restore()}
}
const drawBeforeB94=draw;
draw=function(){drawBeforeB94();drawChargeB94()};

const updateUIBeforeB94=updateUI;
updateUI=function(){
  updateUIBeforeB94();if(!S)return;
  const button=$('overdrive');if(!button)return;
  const id=S.overType,name=OVERDRIVE_INFO[id]?.name.toUpperCase()||'';
  if(S.b94Charge){const frac=chargeFractionB94();button.disabled=false;button.classList.add('active');button.classList.remove('ready');button.innerHTML=`${name}<br><small>${frac>=.999?'FULL · RELEASE':'CHARGING '+Math.round(frac*100)+'%'}</small>`;return}
  if(S.over>0||S.b93StormCharge||(id==='storm'&&(S.b93StormCooldown>0||S.b93StormClouds?.length)))return;
  const ready=canIgniteOverdriveB38(id);
  if(id==='pip')button.innerHTML=`PIP ASCENDANT<br><small>${ready?'TAP TO ASCEND':Math.round(S.heat)+'% / '+B94_PIP_IGNITION_PERCENT+'%'}</small>`;
  else if(id==='storm')button.innerHTML=`THUNDERSTORM<br><small>${ready?'HOLD TO CHARGE':Math.round(S.heat)+'% / '+B94_IGNITION_PERCENT+'%'}</small>`;
  else button.innerHTML=`${name}<br><small>${ready?(isChargeSkillB94(id)?'HOLD TO CHARGE':'HOLD TO FIRE'):Math.round(S.heat)+'% / '+B94_IGNITION_PERCENT+'%'}</small>`;
};

const renderOverdriveStepBeforeB94=renderOverdriveStep;
renderOverdriveStep=function(){
  renderOverdriveStepBeforeB94();
  const cap=heatCapacityB38(),ready=S.heat>=B94_PIP_IGNITION_PERCENT;
  if($('starBalance'))$('starBalance').textContent=`★ ${S.starPoints} Run Stars · HEAT ${Math.round(heatEnergyB38())}/${cap} · skills ignite at ${B94_IGNITION_PERCENT}% · Ascended Pip ignites at ${B94_PIP_IGNITION_PERCENT}%`;
  const idx=OVER_ORDER.indexOf('pip'),span=idx>=0?$('overChoice'+idx)?.querySelector('.b38-synthesis'):null;
  if(span)span.textContent=`${ready?'READY':'NEEDS '+Math.ceil(B94_PIP_IGNITION_PERCENT-S.heat)+'% MORE HEAT'} · TAP ONCE · AUTO-DRAINS TO ZERO · EXTRA HEAT = MORE TIME`;
};
const overdriveHelpB94=$('overdriveStep')?.querySelector('p');
if(overdriveHelpB94)overdriveHelpB94.textContent=`Only one skill is equipped. Every skill ignites at ${B94_IGNITION_PERCENT}% HEAT and keeps going while held, even below that. Beam and Guardian drain while held. Thunderstorm, Nova and Gravity Well charge while held and strike on release. Ascended Pip needs ${B94_PIP_IGNITION_PERCENT}% HEAT; tap once and it drains automatically.`;

const renderAscendedPauseBeforeB94=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  renderAscendedPauseBeforeB94();
  const line=$('b39ReserveLine');if(!line)return;
  const ready=S.heat>=B94_PIP_IGNITION_PERCENT;
  line.innerHTML=`<span>HEAT RESERVE · ASCEND AT ${B94_PIP_IGNITION_PERCENT}%</span><b>${Math.round(S.heat)}%${ready?' · READY':''}</b>`;
};

OVERDRIVE_INFO.beam.desc='Hold to fire rapid piercing starfire; it drains HEAT while held. Levels add damage and penetration.';
OVERDRIVE_INFO.guardian.desc='Hold to absorb hits, restore shields and blast attackers away; it drains HEAT while held.';
OVERDRIVE_INFO.nova.desc='Hold to charge, release to unleash up to three expanding shockwaves around you. A full charge hits hardest and widest.';
OVERDRIVE_INFO.gravity.desc='Hold to charge, release to open a singularity at your target that pulls and damages enemies. A full charge lasts longest.';
OVERDRIVE_INFO.storm.desc='Hold to gather up to five clouds, release to strike. Quick taps strike once. Constellation adds ricochets.';
OVERDRIVE_INFO.pip.desc=`The synthesis form. Tap once at ${B94_PIP_IGNITION_PERCENT}% HEAT; it stays active and drains automatically to zero.`;

const resetBeforeB94=reset;
reset=function(){resetBeforeB94();S.b94Charge=null;S.b94NovaWaves=[];S.b94Well=null;updateUI()};
if(S){S.b94Charge=null;S.b94NovaWaves=[];S.b94Well=null}
window.addEventListener('blur',()=>{if(S?.b94Charge)S.b94Charge.cancel=true},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S?.b94Charge)S.b94Charge.cancel=true},true);

// Sound Lab: the audition controls inherited the browser's white button face with light text,
// showing as blank white boxes. Give them the game's button styling so their labels read.
(function styleMixAuditionsB94(){
  const style=document.createElement('style');
  style.textContent='#mixAuditionsB60 button{background:#142132;color:#e7f1ff;border:1px solid #52627b;border-radius:9px;cursor:pointer;font-weight:700}#mixAuditionsB60 button:hover,#mixAuditionsB60 button:focus-visible{border-color:#7ed8ff;background:#1a2c42}#mixAudioToggleB60{min-height:38px;padding:7px 14px;font-size:12px}#mixAudioToggleB60[aria-pressed="true"]{border-color:#7ed8ff}';
  document.head.appendChild(style);
})();
updateUI();
