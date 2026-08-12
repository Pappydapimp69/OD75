// B38 Overdrive synthesis: HEAT is a held energy reserve; basic skills feed Pip Ascendant.
const B38_BASIC_OVERDRIVES=["beam","storm","guardian","nova","gravity"];
const B38_BASIC_IGNITION_PERCENT=20;
const B38_DRAIN_ENERGY_PER_SEC={beam:26,storm:24,guardian:22,nova:28,gravity:23,pip:5};
const B38_SOUND_ASCENDED_TEXT={
 honey:"Ascended: periodically restores a missing shield.",
 bubble:"Ascended: adds soft radial bubble bursts.",
 starlight:"Ascended: fires extra piercing star shots.",
 plush:"Ascended: adds brief protective cuddle-frames.",
 cherub:"Ascended: adds extra angelic star volleys.",
 cosmic:"Ascended: strengthens Pip's gravity pull."
};

function heatCapacityB38(){
 if(!S)return 100;
 let cap=100;
 for(const id of B38_BASIC_OVERDRIVES){
   if(!S.overUnlocked?.has(id))continue;
   const lv=Math.max(1,overLevel(id));
   if(id!=="beam")cap+=10;
   cap+=Math.max(0,lv-1)*5;
 }
 return cap;
}
function heatEnergyB38(){return heatCapacityB38()*clamp((S?.heat||0)/100,0,1)}
function canIgniteOverdriveB38(id=S?.overType){
 if(!S||S.over>0||!S.run||S.end||S.waveState==="stage")return false;
 if(id==="pip")return S.heat>=99.999;
 return S.heat>=B38_BASIC_IGNITION_PERCENT;
}
function stopOverdriveB38(spent=false){
 if(!S||S.over<=0)return false;
 S.over=0;S.overPulse=0;S.overGuardHits=0;S.overTarget=null;S.b38OverHeld=false;
 announce(spent?"OVERDRIVE SPENT":"HEAT BANKED",spent?520:430);
 updateUI();
 return true;
}

// Held activation. Basic Overdrives can ignite at one-fifth charge; Ascendant needs a full reserve.
triggerOverdrive=function(){
 if(!canIgniteOverdriveB38())return false;
 const id=S.overType,lv=Math.max(1,overLevel(id));
 S.over=1;S.b38OverHeld=true;S.overdrives=(S.overdrives||0)+1;S.overPulse=0;S.overFxClock=0;S.overTarget=null;S.ascendantWishMade=false;S.b38AscPulse=0;
 if(id==="guardian"){S.overGuardHits=2+lv*2;S.shields=S.maxShields;S.shieldRegenClock=0}
 else if(id==="gravity"){const t=getAutoTarget();S.overTarget=t?{x:t.x,y:t.y}:{x:P.x+P.faceX*90,y:P.y+P.faceY*90}}
 else if(id==="pip"){S.invuln=Math.max(S.invuln,.35+(S.pipCompassion||0)*.10);S.shields=Math.min(S.maxShields,S.shields+Math.ceil((S.pipCompassion||0)/2))}
 announce(id==="pip"?"PIP ASCENDED ✦":"OVERDRIVE · "+OVERDRIVE_INFO[id].name.toUpperCase(),900);flash=.65;shake=12;burstTone(330+lv*25,6);
 praise(id==="pip"?"okay — everything we've built together. ALL of me. let's go!":"hold it as long as you need — I'll keep the rest banked ✦","big",true);
 updateUI();return true;
};

// Keep legacy active-state logic alive, but replace its duration countdown with reserve drain.
const updateBeforeB38=update;
update=function(dt){
 if(!S){updateBeforeB38(dt);return}
 const active=S.over>0&&S.b38OverHeld;
 const uses=S.overdrives||0;
 if(active)S.over=999999;
 // B06's old post-use HEAT penalty fights the new "frequent basics" role; keep the stat, remove that penalty.
 S.overdrives=0;
 updateBeforeB38(dt);
 S.overdrives=uses;
 if(!active)return;
 if(!S.run||S.end||S.waveState==="stage"){stopOverdriveB38(false);return}
 const cap=heatCapacityB38(),id=S.overType;
 const drain=B38_DRAIN_ENERGY_PER_SEC[id]||24;
 S.heat=Math.max(0,S.heat-(drain/cap)*100*dt);
 if(S.heat<=.0001){S.heat=0;S.over=1;stopOverdriveB38(true)}
 else S.over=1;
 updateUI();
};

// Touch/mouse: pointerdown starts through the original listener; release banks the remainder.
const b38OverButton=$("overdrive");
if(b38OverButton){
 b38OverButton.addEventListener("pointerup",()=>stopOverdriveB38(false));
 b38OverButton.addEventListener("pointercancel",()=>stopOverdriveB38(false));
 b38OverButton.addEventListener("lostpointercapture",()=>stopOverdriveB38(false));
}
// Keyboard E is held-to-use too.
window.addEventListener("keyup",e=>{if((e.key||"").toLowerCase()==="e")stopOverdriveB38(false)});

// Gamepad Y/Triangle is held-to-use; B35 menu navigation remains intact between stages.
const updateGamepadInputBeforeB38=updateGamepadInput;
updateGamepadInput=function(){
 updateGamepadInputBeforeB38();
 if(!S)return;
 const held=!!gamepad.overHeld,was=!!S.b38PadOverHeld;
 if(held&&!was&&!S.b38OverHeld)triggerOverdrive();
 if(!held&&was&&S.b38OverHeld)stopOverdriveB38(false);
 S.b38PadOverHeld=held;
};

// Reset B38 state without changing the established run-reset economy.
const resetBeforeB38=reset;
reset=function(){
 resetBeforeB38();
 S.b38OverHeld=false;S.b38PadOverHeld=false;S.b38AscPulse=0;S.heatMax=heatCapacityB38();
 updateUI();
};
if(S){S.b38OverHeld=false;S.b38PadOverHeld=false;S.b38AscPulse=0;S.heatMax=heatCapacityB38()}

// Capacity upgrades are shared progression. Each distinct basic skill still keeps its own combat identity.
const completeOverdriveHoldActionBeforeB38=completeOverdriveHoldAction;
completeOverdriveHoldAction=function(id){
 const before=heatCapacityB38();
 const changed=completeOverdriveHoldActionBeforeB38(id);
 if(changed&&B38_BASIC_OVERDRIVES.includes(id)){
   S.heatMax=heatCapacityB38();
   const gain=S.heatMax-before;
   if(gain>0)popup(P.x,P.y-28,`HEAT CAP +${gain}`,"#ffd36f",true,1.0);
 }
 return changed;
};

// Ascendant Echoes: unlocked basic Overdrives become weaker ingredients in the ultimate form.
function ascendantEchoBeamB38(lv){
 const t=nearestEnemyFrom(P.pipX,P.pipY,720);if(!t)return;
 const a=Math.atan2(t.y-P.pipY,t.x-P.pipX);
 shots.push({x:P.pipX,y:P.pipY,vx:Math.cos(a)*690,vy:Math.sin(a)*690,r:5.5,life:.88,power:.62+lv*.18,source:"pip",pierce:1+Math.floor(lv/3)});
 addOverLine(P.pipX,P.pipY,t.x,t.y,"#fff0a8",.10);
}
function ascendantEchoStormB38(lv){
 const t=nearestEnemyFrom(P.pipX,P.pipY,680);if(!t)return;
 addOverLine(t.x,t.y-180,t.x,t.y,"#9ee7ff",.14);hitEnemy(t,.45+lv*.20,"pip");particle(t.x,t.y,"#9ee7ff",6,80);
}
function ascendantEchoNovaB38(lv){
 const radius=78+lv*9;ring(P.pipX,P.pipY,"#ff9fba",radius);
 for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.pipX,e.y-P.pipY)<radius)hitEnemy(e,.20+lv*.10,"pip");
}
function ascendantEchoGravityB38(lv){
 const radius=135+lv*12;
 for(const e of enemies){if(e.dead)continue;const dx=P.pipX-e.x,dy=P.pipY-e.y,d=hyp(dx,dy)||1;if(d<radius){const pull=(25+lv*8)*(1-d/radius+.15);e.x+=dx/d*pull;e.y+=dy/d*pull}}
}
function ascendantSoundResonanceB38(pulse){
 if(typeof activePipSoundIdsB31!=="function")return;
 const ids=activePipSoundIdsB31();if(!ids.length)return;
 const has=id=>ids.includes(id),lv=id=>Math.max(1,typeof pipSoundLevelB29==="function"?pipSoundLevelB29(id):1);
 if(has("honey")&&pulse%(9-Math.min(3,lv("honey")-1))===0&&S.shields<S.maxShields){S.shields++;S.shieldRegenClock=0;ring(P.pipX,P.pipY,"#ffd36f",50);popup(P.pipX,P.pipY-18,"HONEY GLOW","#fff0a8",false,.7)}
 if(has("bubble")&&pulse%4===0){const r=58+lv("bubble")*6;ring(P.pipX,P.pipY,"#9ee7ff",r);for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.pipX,e.y-P.pipY)<r)hitEnemy(e,.15+lv("bubble")*.08,"pip")}
 if(has("starlight")&&pulse%4===1)ascendantEchoBeamB38(Math.max(1,lv("starlight")-1));
 if(has("plush"))S.invuln=Math.max(S.invuln,.055+lv("plush")*.012);
 if(has("cherub")&&pulse%5===2){const t=nearestEnemyFrom(P.pipX,P.pipY,650);if(t){const n=1+Math.floor(lv("cherub")/2);for(let i=0;i<n;i++)pushPipShot(P.pipX,P.pipY,t,.38+lv("cherub")*.09,rr(-.14,.14))}}
 if(has("cosmic")){const boost=lv("cosmic");const radius=110+boost*12;for(const e of enemies){if(e.dead)continue;const dx=P.pipX-e.x,dy=P.pipY-e.y,d=hyp(dx,dy)||1;if(d<radius){e.x+=dx/d*(9+boost*4);e.y+=dy/d*(9+boost*4)}}}
}
const ascendantPulseBeforeB38=ascendantPulse;
ascendantPulse=function(){
 ascendantPulseBeforeB38();
 const pulse=(S.b38AscPulse=(S.b38AscPulse||0)+1);
 if(S.overUnlocked?.has("beam")&&pulse%4===0)ascendantEchoBeamB38(Math.max(1,overLevel("beam")));
 if(S.overUnlocked?.has("storm")&&pulse%6===1)ascendantEchoStormB38(Math.max(1,overLevel("storm")));
 if(S.overUnlocked?.has("guardian")&&pulse%7===2){const lv=Math.max(1,overLevel("guardian"));S.invuln=Math.max(S.invuln,.08+lv*.018);ring(P.pipX,P.pipY,"#7ed8ff",48+lv*4)}
 if(S.overUnlocked?.has("nova")&&pulse%6===3)ascendantEchoNovaB38(Math.max(1,overLevel("nova")));
 if(S.overUnlocked?.has("gravity"))ascendantEchoGravityB38(Math.max(1,overLevel("gravity")));
 // Heart attributes visibly feed the form too.
 if((S.pipPowerLv||0)>0&&pulse%5===0)ascendantEchoBeamB38(Math.max(1,Math.ceil((S.pipPowerLv||0)/2)));
 if((S.pipGuardLv||0)>0&&pulse%Math.max(6,13-(S.pipGuardLv||0))===0&&S.shields<S.maxShields){S.shields++;S.shieldRegenClock=0;ring(P.pipX,P.pipY,"#7ed8ff",56)}
 if((S.pipLove||0)>=2&&!S.ascendantWishMade&&pulse>=12){S.ascendantWishMade=true;spawnWish(P.pipX,P.pipY)}
 ascendantSoundResonanceB38(pulse);
};

// Heart Sense and Swift Pip directly strengthen the Ascendant Heart magnet.
updateAscendantHeartMagnetB26=function(dt){
 if(!S.run||S.end||S.over<=0||S.overType!=="pip")return;
 const lv=Math.max(1,overLevel("pip"));
 const radius=170+lv*58+(S.pipDetectRange||41)*.72;
 const pullSpeed=220+lv*92+(S.pipMoveSpeed||285)*.58;
 for(const h of heartBits){
   if(h.dead||h.life<=0)continue;
   const dx=P.pipX-h.x,dy=P.pipY-h.y,d=hyp(dx,dy)||1;
   if(d>radius)continue;
   if(d<13){collectHeartBit(h);continue}
   const proximity=1-clamp(d/radius,0,1),step=Math.min(d,pullSpeed*(.45+proximity*.95)*dt);
   h.x+=dx/d*step;h.y+=dy/d*step;h.vx*=.72;h.vy*=.72;
 }
};

// Make the synthesis legible without adding another forced screen.
OVERDRIVE_INFO.beam.desc="Hold for piercing starfire. Levels strengthen Beam and expand the shared HEAT reserve.";
OVERDRIVE_INFO.storm.desc="Hold for chained lightning. Levels strengthen Storm and expand the shared HEAT reserve.";
OVERDRIVE_INFO.guardian.desc="Hold for blocks, shield recovery and knockback. Levels expand the shared HEAT reserve.";
OVERDRIVE_INFO.nova.desc="Hold for repeated radial shockwaves. Levels strengthen Nova and expand the shared HEAT reserve.";
OVERDRIVE_INFO.gravity.desc="Hold to pull enemies into a damaging well. Levels strengthen Gravity and expand the shared HEAT reserve.";
OVERDRIVE_INFO.pip.desc="The synthesis form. Requires a full HEAT reserve and combines your Pip build, unlocked Echoes and Sound Resonances.";

const renderOverdriveStepBeforeB38=renderOverdriveStep;
renderOverdriveStep=function(){
 renderOverdriveStepBeforeB38();
 const cap=heatCapacityB38(),echoes=B38_BASIC_OVERDRIVES.filter(id=>S.overUnlocked?.has(id)).length,sounds=typeof activePipSoundIdsB31==="function"?activePipSoundIdsB31().length:0;
 S.heatMax=cap;
 $("starBalance").textContent=`★ ${S.starPoints} Run Stars · HEAT reserve ${cap} · basics ignite at 20% · Pip Ascendant requires FULL`;
 OVER_ORDER.forEach((id,i)=>{
   const btn=$("overChoice"+i),small=btn?.querySelector(".small");if(!small)return;
   if(id==="pip")small.insertAdjacentHTML("afterbegin",`<span class="b38-synthesis">SYNTHESIS · ${echoes}/5 Echoes · ${sounds}/6 Sound Resonances · ${cap} HEAT reserve</span><br>`);
   else small.insertAdjacentHTML("afterbegin",`<span class="b38-synthesis">SHARED RESERVE · ${cap} HEAT · this skill becomes an Ascended Echo</span><br>`);
 });
 $("continueOverdrive").textContent=`Equip ${OVERDRIVE_INFO[S.overType].name}`;
};
const overdriveHelpB38=$("overdriveStep")?.querySelector("p");
if(overdriveHelpB38)overdriveHelpB38.textContent="Only one skill is equipped. Hold a basic Overdrive to spend HEAT and release to bank the rest. Pip Ascendant needs a full reserve; every basic unlock/level expands that reserve and feeds the Ascended form.";

const renderPipSoundStepBeforeB38=renderPipSoundStepB26;
renderPipSoundStepB26=function(){
 renderPipSoundStepBeforeB38();
 const buttons=[...($("pipSoundGrid")?.querySelectorAll("button")||[])];
 buttons.forEach((btn,i)=>{const pack=PIP_SOUND_PACKS[i],small=btn.querySelector(".small");if(pack&&small&&!small.querySelector(".b38-resonance"))small.insertAdjacentHTML("afterbegin",`<span class="b38-resonance">${B38_SOUND_ASCENDED_TEXT[pack.id]}</span><br>`)});
 const p=$("pipSoundStep")?.querySelector("p");if(p)p.textContent="Every unlocked sound stacks for this run — and now each one also becomes a visible Sound Resonance inside Pip Ascendant.";
};

(function installB38Style(){
 if(document.getElementById("b38OverdriveStyle"))return;
 const style=document.createElement("style");style.id="b38OverdriveStyle";
 style.textContent=`#stageUp .b38-synthesis,#stageUp .b38-resonance{color:#ffe7a3;font-weight:800}#overdrive.active{animation:none}#overdrive.active small{color:#fff0a8}`;
 document.head.appendChild(style);
})();

// Replace the legacy duration-oriented HUD with reserve/capacity language.
const updateUIBeforeB38=updateUI;
updateUI=function(){
 updateUIBeforeB38();
 if(!S)return;
 const cap=heatCapacityB38(),energy=heatEnergyB38(),info=OVERDRIVE_INFO[S.overType],active=S.over>0&&S.b38OverHeld,ready=canIgniteOverdriveB38();
 S.heatMax=cap;
 $("heatBar").style.width=clamp(S.heat,0,100)+"%";
 $("overGaugeLabel").textContent=`${info.name.toUpperCase()} · ${Math.round(energy)}/${cap} HEAT`;
 $("overdrive").disabled=!(active||ready);
 $("overdrive").classList.toggle("ready",!active&&ready);$("overdrive").classList.toggle("active",active);
 if(active)$("overdrive").innerHTML=`${info.name.toUpperCase()}<br><small>RELEASE TO BANK</small>`;
 else if(S.overType==="pip")$("overdrive").innerHTML=`PIP ASCENDANT<br><small>${S.heat>=99.999?"HOLD TO ASCEND":"FILL RESERVE"}</small>`;
 else $("overdrive").innerHTML=`${info.name.toUpperCase()}<br><small>${ready?"HOLD TO USE":Math.round(S.heat)+"% / 20%"}</small>`;
};

updateUI();
