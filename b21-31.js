// B43 Ascended Pip ignition: 100 HEAT energy threshold, one-tap activation, automatic full depletion.
const B43_ASCENDED_IGNITION_HEAT=100;

function ascendedHeatReadyB43(){
  return !!(S&&heatEnergyB38()>=B43_ASCENDED_IGNITION_HEAT-.001);
}
function ascendedHeatStatusB43(){
  const energy=Math.max(0,heatEnergyB38()),cap=heatCapacityB38();
  return {energy,cap,ready:energy>=B43_ASCENDED_IGNITION_HEAT-.001};
}

// Pip Ascendant no longer requires the expanded reservoir to be completely full.
// It ignites once stored energy reaches 100 HEAT; banking beyond 100 extends the auto-drain duration.
const canIgniteOverdriveBeforeB43=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){
  if(id!=="pip")return canIgniteOverdriveBeforeB43(id);
  if(!S||S.over>0||!S.run||S.end||S.waveState==="stage")return false;
  return ascendedHeatReadyB43();
};

const triggerOverdriveBeforeB43=triggerOverdrive;
triggerOverdrive=function(){
  if(S?.overType!=="pip")return triggerOverdriveBeforeB43();
  if(!canIgniteOverdriveB38("pip")){
    if(S&&S.run&&!S.end){
      const need=Math.max(0,Math.ceil(B43_ASCENDED_IGNITION_HEAT-heatEnergyB38()));
      if(need>0)showPipMessage(`Ascended Pip needs ${need} more HEAT.`,true);
    }
    return false;
  }
  const lv=Math.max(1,overLevel("pip"));
  S.over=1;
  S.b38OverHeld=true; // keeps the existing reserve-drain engine active; input release no longer owns this flag for Pip.
  S.b43AscAuto=true;
  S.overdrives=(S.overdrives||0)+1;
  S.overPulse=0;S.overFxClock=0;S.overTarget=null;S.ascendantWishMade=false;S.b38AscPulse=0;
  S.invuln=Math.max(S.invuln,.35+(S.pipCompassion||0)*.10);
  S.shields=Math.min(S.maxShields,S.shields+Math.ceil((S.pipCompassion||0)/2));
  announce("PIP ASCENDED ✦",900);flash=.65;shake=12;burstTone(330+lv*25,6);
  praise("okay — everything we've built together. ALL of me. let's go!","big",true);
  updateUI();
  return true;
};

// Release events from mouse/touch/keyboard/gamepad still stop held BASIC Overdrives,
// but cannot cancel an active Ascended Pip transformation during live play.
const stopOverdriveBeforeB43=stopOverdriveB38;
stopOverdriveB38=function(spent=false){
  if(S?.b43AscAuto&&S.overType==="pip"&&S.over>0&&!spent&&S.run&&!S.end&&S.waveState!=="stage")return false;
  const wasAsc=!!(S?.b43AscAuto&&S.overType==="pip");
  const stopped=stopOverdriveBeforeB43(spent);
  if(wasAsc&&stopped)S.b43AscAuto=false;
  return stopped;
};

// B38's reserve drain remains authoritative. Because it drains energy/second against the
// expanded capacity, entering above 100 stored HEAT naturally grants more Ascended time.
const updateBeforeB43=update;
update=function(dt){
  updateBeforeB43(dt);
  if(!S)return;
  if(S.b43AscAuto&&S.overType==="pip"&&S.over<=0)S.b43AscAuto=false;
};

const resetBeforeB43=reset;
reset=function(){
  resetBeforeB43();
  S.b43AscAuto=false;
  updateUI();
};
if(S)S.b43AscAuto=false;

// Rewrite the player-facing contract everywhere the old FULL-reserve wording appeared.
OVERDRIVE_INFO.pip.desc="The synthesis form. Tap once at 100 stored HEAT; it stays active and drains automatically to zero. Extra stored HEAT extends the transformation.";

const renderOverdriveStepBeforeB43=renderOverdriveStep;
renderOverdriveStep=function(){
  renderOverdriveStepBeforeB43();
  const {energy,cap,ready}=ascendedHeatStatusB43();
  if($("starBalance"))$("starBalance").textContent=`★ ${S.starPoints} Run Stars · HEAT ${Math.round(energy)}/${cap} · basics ignite at 20% · Ascended Pip ignites at 100 HEAT`;
  const idx=OVER_ORDER.indexOf("pip"),btn=idx>=0?$("overChoice"+idx):null,small=btn?.querySelector(".small");
  if(small)small.insertAdjacentHTML("afterbegin",`<span class="b38-synthesis">${ready?"READY":"NEEDS "+Math.max(0,Math.ceil(100-energy))+" HEAT"} · TAP ONCE · AUTO-DRAINS TO ZERO · EXTRA HEAT = MORE TIME</span><br>`);
};
const overdriveHelpB43=$("overdriveStep")?.querySelector("p");
if(overdriveHelpB43)overdriveHelpB43.textContent="Only one skill is equipped. Hold a basic Overdrive and release to bank the rest. Ascended Pip is different: once stored HEAT reaches 100, tap once to transform; it drains automatically to zero, and any HEAT stored above 100 makes the form last longer.";

// Keep the pause synthesis readout explicit about the 100-HEAT ignition point.
const renderAscendedPauseBeforeB43=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  renderAscendedPauseBeforeB43();
  const line=$("b39ReserveLine");if(!line)return;
  const {energy,cap,ready}=ascendedHeatStatusB43();
  line.innerHTML=`<span>HEAT RESERVE · ASCEND AT 100</span><b>${Math.round(energy)} / ${cap}${ready?" · READY":""}</b>`;
};
