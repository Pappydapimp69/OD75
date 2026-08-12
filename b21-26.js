// B39 Ascended Pip pause hub: one inspect-only pause screen that makes the synthesis build visible.
const B39_ECHO_TEXT={
 beam:"Piercing star beam joins Ascended Pip.",
 storm:"Chain lightning joins Ascended Pip.",
 guardian:"Protective shield pulses join Ascended Pip.",
 nova:"Radial love-nova bursts join Ascended Pip.",
 gravity:"A gravity pull gathers enemies around Pip."
};
const B39_EMOTION_TEXT={
 love:"Loving strengthens heart pulses, Wish effects and warm-return power.",
 compassion:"Compassionate strengthens protection, shields and rescue effects.",
 support:"Supportive strengthens volleys, attack cadence and movement support."
};
const b39Pause={open:false,resumeRun:false,padStartHeld:false,padAHeld:false,padBHeld:false};

function ascendedUpgradeMarksB39(){
 if(!S)return 0;
 let marks=Math.max(0,(S.pipLevel||1)-1);
 for(const id of B38_BASIC_OVERDRIVES){
   if(!S.overUnlocked?.has(id))continue;
   const lv=Math.max(1,overLevel(id));
   marks+=(id==="beam"?0:1)+Math.max(0,lv-1);
 }
 marks+=(S.pipRangeLv||0)+(S.pipSpeedLv||0)+(S.pipPowerLv||0)+(S.pipGuardLv||0);
 marks+=(S.pipLove||0)+(S.pipCompassion||0)+(S.pipSupport||0);
 marks+=Object.values(S.pipBossPowers||{}).reduce((a,n)=>a+Math.max(0,n|0),0);
 if(typeof activePipSoundIdsB31==="function")for(const id of activePipSoundIdsB31())marks+=Math.max(1,typeof pipSoundLevelB29==="function"?pipSoundLevelB29(id):1);
 return marks;
}
function ascendedEvolutionTierB39(){
 const n=ascendedUpgradeMarksB39();
 return n>=20?4:n>=10?3:n>=4?2:1;
}
function ascendedTierNameB39(tier){return tier===4?"Radiant":tier===3?"Awakened":tier===2?"Growing":"Spark"}
function b39StageUpgradeOpen(){return !!($("stageUp")&&!$("stageUp").classList.contains("hidden"))}

function ensureAscendedPauseB39(){
 if($("pipPauseB39"))return;
 const style=document.createElement("style");
 style.id="pipPauseStyleB39";
 style.textContent=`
#pipHubButtonB39{pointer-events:auto;cursor:pointer;color:#fff0b8;border:1px solid #ffd36f44;background:#171109d9}
#pipPauseB39{z-index:44}
#pipPauseB39 .b39-card{width:min(940px,96vw);height:min(690px,94dvh);overflow:hidden;padding:16px;display:grid;grid-template-rows:auto 1fr auto;gap:10px}
.b39-head{display:flex;align-items:center;gap:10px}.b39-head h2{margin:0;font-size:clamp(24px,3vw,36px);letter-spacing:-.04em}.b39-head .small{margin-left:auto;text-align:right}
.b39-body{min-height:0;display:grid;grid-template-columns:minmax(230px,.8fr) minmax(0,1.5fr);gap:10px}
.b39-portraitPane,.b39-section{border:1px solid #ffffff18;border-radius:15px;background:#ffffff05}
.b39-portraitPane{display:grid;grid-template-rows:1fr auto;min-height:0;padding:10px;overflow:hidden}
#pipPortraitB39{position:relative;min-height:260px;display:grid;place-items:center;isolation:isolate}
.b39-aura{position:absolute;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,#ffd36f24 0 38%,#b388ff18 55%,transparent 72%);filter:blur(1px);transform:scale(.72);opacity:.52;transition:.25s}
.b39-halo{position:absolute;width:120px;height:36px;border:3px solid #ffd36f88;border-radius:50%;top:21%;opacity:0;transform:rotate(-7deg)}
.b39-wing{position:absolute;width:58px;height:86px;border:2px solid #d9c8ff88;border-radius:80% 20% 80% 20%;opacity:0;top:39%;background:#d9c8ff10}.b39-wing.left{left:25%;transform:rotate(-26deg)}.b39-wing.right{right:25%;transform:scaleX(-1) rotate(-26deg)}
.b39-crown{position:absolute;top:25%;font-size:26px;color:#fff0a8;opacity:0;text-shadow:0 0 18px #ffd36f}
.b39-pipCore{position:relative;width:108px;height:108px;clip-path:polygon(50% 0%,61% 34%,98% 38%,69% 59%,79% 96%,50% 75%,21% 96%,31% 59%,2% 38%,39% 34%);background:linear-gradient(145deg,#fff6ba,#ffd36f 58%,#ffb7d0);filter:drop-shadow(0 0 18px #ffd36f77);z-index:4;transition:.25s}
.b39-face{position:absolute;z-index:5;left:50%;top:50%;transform:translate(-50%,-41%);width:44px;height:34px}.b39-face:before,.b39-face:after{content:"";position:absolute;top:6px;width:6px;height:8px;border-radius:50%;background:#47340d}.b39-face:before{left:8px}.b39-face:after{right:8px}.b39-smile{position:absolute;left:50%;bottom:5px;width:16px;height:8px;transform:translateX(-50%);border-bottom:2px solid #47340d;border-radius:0 0 18px 18px}
.b39-orbit{position:absolute;inset:0;z-index:6;pointer-events:none}.b39-sigil,.b39-mote{position:absolute;left:50%;top:50%;display:grid;place-items:center;border-radius:50%;font-weight:900}.b39-sigil{width:31px;height:31px;border:1px solid #ffffff36;background:#0d131ddd;color:#fff;font-size:15px;box-shadow:0 0 13px #0008}.b39-sigil.locked{opacity:.18;filter:grayscale(1)}.b39-mote{font-size:15px;text-shadow:0 0 10px currentColor}
#pipPortraitB39.tier2 .b39-aura{transform:scale(.9);opacity:.72}#pipPortraitB39.tier2 .b39-halo{opacity:.72}#pipPortraitB39.tier2 .b39-pipCore{width:116px;height:116px}
#pipPortraitB39.tier3 .b39-aura{transform:scale(1.08);opacity:.88}#pipPortraitB39.tier3 .b39-halo,#pipPortraitB39.tier3 .b39-wing{opacity:.82}#pipPortraitB39.tier3 .b39-pipCore{width:124px;height:124px;filter:drop-shadow(0 0 24px #ffd36faa)}
#pipPortraitB39.tier4 .b39-aura{transform:scale(1.28);opacity:1;box-shadow:0 0 55px #b388ff22 inset}#pipPortraitB39.tier4 .b39-halo,#pipPortraitB39.tier4 .b39-wing,#pipPortraitB39.tier4 .b39-crown{opacity:1}#pipPortraitB39.tier4 .b39-pipCore{width:134px;height:134px;background:linear-gradient(145deg,#ffffff,#fff0a8 33%,#ffb7d0 67%,#b388ff);filter:drop-shadow(0 0 30px #fff0a8cc)}
.b39-evolution{text-align:center}.b39-evolution b{display:block;font-size:17px;color:#fff0b8}.b39-reserve{margin-top:6px}.b39-reserveLine{display:flex;justify-content:space-between;font-size:11px}.b39-reserveBar{height:7px;border-radius:999px;background:#ffffff0e;overflow:hidden;margin-top:4px}.b39-reserveBar i{display:block;height:100%;background:linear-gradient(90deg,#ffd36f,#ff6e8b)}
.b39-sections{min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px}.b39-section{padding:9px;min-height:0;overflow:hidden}.b39-section h3{font-size:12px;margin:0 0 6px;color:#fff0b8;letter-spacing:.04em}.b39-list{display:grid;gap:4px;font-size:10.5px;line-height:1.25}.b39-row{padding:5px 6px;border-radius:8px;background:#ffffff05}.b39-row b{color:#fff}.b39-row.locked{opacity:.38}.b39-row .tag{float:right;color:#ffd36f;font-size:9px}.b39-footer{display:flex;gap:8px;align-items:center}.b39-footer .small{flex:1}.b39-footer button{width:auto;min-width:180px}
@media(max-width:680px){#pipPauseB39 .b39-card{width:97vw;height:96dvh;padding:9px;gap:7px}.b39-head h2{font-size:23px}.b39-head .small{font-size:8px}.b39-body{grid-template-columns:38% 62%;gap:6px}.b39-portraitPane{padding:6px}#pipPortraitB39{min-height:0}.b39-pipCore{width:84px;height:84px}#pipPortraitB39.tier2 .b39-pipCore{width:90px;height:90px}#pipPortraitB39.tier3 .b39-pipCore{width:96px;height:96px}#pipPortraitB39.tier4 .b39-pipCore{width:102px;height:102px}.b39-aura{width:140px;height:140px}.b39-halo{width:84px;height:25px;top:25%}.b39-wing{width:40px;height:62px;top:40%}.b39-wing.left{left:16%}.b39-wing.right{right:16%}.b39-crown{top:27%;font-size:19px}.b39-sigil{width:24px;height:24px;font-size:12px}.b39-mote{font-size:11px}.b39-evolution b{font-size:13px}.b39-evolution .small,.b39-reserveLine{font-size:8.5px}.b39-sections{gap:5px}.b39-section{padding:6px}.b39-section h3{font-size:10px;margin-bottom:4px}.b39-list{font-size:8.5px;gap:2px;line-height:1.13}.b39-row{padding:3px 4px}.b39-row .tag{font-size:7.5px}.b39-footer .small{font-size:8px}.b39-footer button{min-width:128px;padding:8px}}
@media(max-height:560px){#pipPauseB39 .b39-card{height:98dvh}.b39-head{display:none}.b39-body{grid-template-columns:34% 66%}.b39-section{padding:5px}.b39-list{font-size:8px}.b39-footer{min-height:34px}}
`;
 document.head.appendChild(style);
 const top=document.querySelector(".top");
 if(top){const btn=document.createElement("button");btn.id="pipHubButtonB39";btn.className="pill";btn.type="button";btn.textContent="PIP ✦";btn.setAttribute("aria-label","Pause and view Ascended Pip");top.insertBefore(btn,$("phase")||null);btn.addEventListener("click",openAscendedPauseB39)}
 const modal=document.createElement("div");modal.id="pipPauseB39";modal.className="modal hidden";
 modal.innerHTML=`<div class="card b39-card"><div class="b39-head"><div><div class="kicker">PAUSED · BUILD SYNTHESIS</div><h2>Ascended Pip ✦</h2></div><div id="b39HeadStats" class="small"></div></div><div class="b39-body"><div class="b39-portraitPane"><div id="pipPortraitB39"><div class="b39-aura"></div><div class="b39-halo"></div><div class="b39-wing left"></div><div class="b39-wing right"></div><div class="b39-crown">✧</div><div class="b39-pipCore"><div class="b39-face"><i class="b39-smile"></i></div></div><div id="b39Orbit" class="b39-orbit"></div></div><div><div id="b39Evolution" class="b39-evolution"></div><div class="b39-reserve"><div id="b39ReserveLine" class="b39-reserveLine"></div><div class="b39-reserveBar"><i id="b39ReserveFill"></i></div></div></div></div><div class="b39-sections"><section class="b39-section"><h3>OVERDRIVE ECHOES</h3><div id="b39EchoList" class="b39-list"></div></section><section class="b39-section"><h3>PIP CORE</h3><div id="b39CoreList" class="b39-list"></div></section><section class="b39-section"><h3>BOSS BONDS</h3><div id="b39BossList" class="b39-list"></div></section><section class="b39-section"><h3>SOUND RESONANCE</h3><div id="b39SoundList" class="b39-list"></div></section></div></div><div class="b39-footer"><span class="small">Inspect only — upgrades still happen through their normal reward systems.</span><button id="resumeB39" class="primary" type="button">Resume · Esc / Start</button></div></div>`;
 document.getElementById("app").appendChild(modal);
 $("resumeB39").addEventListener("click",closeAscendedPauseB39);
}

function orbitPointB39(index,total,radius){
 const a=-Math.PI/2+index/Math.max(1,total)*Math.PI*2;
 return {x:Math.cos(a)*radius,y:Math.sin(a)*radius};
}
function renderPipPortraitB39(){
 const portrait=$("pipPortraitB39"),orbit=$("b39Orbit");if(!portrait||!orbit)return;
 const tier=ascendedEvolutionTierB39(),marks=ascendedUpgradeMarksB39();
 portrait.className=`tier${tier}`;orbit.innerHTML="";
 const sigils=B38_BASIC_OVERDRIVES.map(id=>({id,icon:OVERDRIVE_INFO[id].icon,unlocked:!!S.overUnlocked?.has(id)}));
 sigils.forEach((s,i)=>{const p=orbitPointB39(i,sigils.length,38),el=document.createElement("span");el.className="b39-sigil"+(s.unlocked?"":" locked");el.textContent=s.icon;el.style.transform=`translate(calc(-50% + ${p.x}%),calc(-50% + ${p.y}%))`;orbit.appendChild(el)});
 const motes=[];
 for(let i=0;i<Math.min(3,S.pipLove||0);i++)motes.push({t:"♥",c:"#ff9fba"});
 for(let i=0;i<Math.min(3,S.pipCompassion||0);i++)motes.push({t:"◇",c:"#7ed8ff"});
 for(let i=0;i<Math.min(3,S.pipSupport||0);i++)motes.push({t:"✦",c:"#d9c8ff"});
 const sounds=typeof activePipSoundIdsB31==="function"?activePipSoundIdsB31():[];
 for(let i=0;i<Math.min(4,sounds.length);i++)motes.push({t:"♪",c:"#9ee7ff"});
 motes.forEach((m,i)=>{const p=orbitPointB39(i,motes.length,27+(i%2)*9),el=document.createElement("span");el.className="b39-mote";el.textContent=m.t;el.style.color=m.c;el.style.transform=`translate(calc(-50% + ${p.x}%),calc(-50% + ${p.y}%))`;orbit.appendChild(el)});
 $("b39Evolution").innerHTML=`<b>Evolution ${tier} · ${ascendedTierNameB39(tier)} Pip</b><span class="small">${marks} upgrade marks are visibly shaping this form.</span>`;
}
function rowB39(title,text,tag="",locked=false){return `<div class="b39-row${locked?" locked":""}"><span class="tag">${tag}</span><b>${title}</b> · ${text}</div>`}
function renderAscendedPauseB39(){
 if(!S)return;ensureAscendedPauseB39();renderPipPortraitB39();
 const cap=heatCapacityB38(),energy=heatEnergyB38(),info=OVERDRIVE_INFO[S.overType],sounds=typeof activePipSoundIdsB31==="function"?activePipSoundIdsB31():[];
 $("b39HeadStats").innerHTML=`EQUIPPED <b>${info.name}</b><br>${B38_BASIC_OVERDRIVES.filter(id=>S.overUnlocked?.has(id)).length}/5 ECHOES · ${sounds.length}/6 RESONANCES`;
 $("b39ReserveLine").innerHTML=`<span>HEAT RESERVE</span><b>${Math.round(energy)} / ${cap}</b>`;$("b39ReserveFill").style.width=`${clamp(S.heat,0,100)}%`;
 $("b39EchoList").innerHTML=B38_BASIC_OVERDRIVES.map(id=>{const unlocked=!!S.overUnlocked?.has(id),lv=overLevel(id);return rowB39(`${OVERDRIVE_INFO[id].name}${unlocked?` Lv ${lv}`:""}`,B39_ECHO_TEXT[id],unlocked?"ACTIVE":"LOCKED",!unlocked)}).join("");
 const core=[];
 core.push(rowB39(`Heart Sense Lv ${S.pipRangeLv||0}`,`Ascended Heart magnet reaches farther; current Pip sense is ${Math.round(S.pipDetectRange||41)}px.`,"HEART"));
 core.push(rowB39(`Swift Pip Lv ${S.pipSpeedLv||0}`,`Ascended Heart magnet pulls faster; Pip flight is ${Math.round(S.pipMoveSpeed||285)}.`,"HEART"));
 core.push(rowB39(`Star Power Lv ${S.pipPowerLv||0}`,`Adds extra Ascended starfire as this attribute grows.`,"HEART"));
 core.push(rowB39(`Guardian Glow Lv ${S.pipGuardLv||0}`,`Adds Ascended shield restoration pulses as this attribute grows.`,"HEART"));
 if((S.pipLove||0)>0)core.push(rowB39(`Loving Lv ${S.pipLove}`,B39_EMOTION_TEXT.love,"PRISM"));
 if((S.pipCompassion||0)>0)core.push(rowB39(`Compassionate Lv ${S.pipCompassion}`,B39_EMOTION_TEXT.compassion,"PRISM"));
 if((S.pipSupport||0)>0)core.push(rowB39(`Supportive Lv ${S.pipSupport}`,B39_EMOTION_TEXT.support,"PRISM"));
 $("b39CoreList").innerHTML=core.join("");
 const bossEntries=Object.entries(S.pipBossPowers||{}).filter(([,lv])=>lv>0);
 $("b39BossList").innerHTML=bossEntries.length?bossEntries.map(([id,lv])=>{const b=BOSS_POWER_INFO[id];return rowB39(`${b?.name||id} Lv ${lv}`,b?.levelDesc?b.levelDesc(lv):"This Boss Bond remains active in Pip's build.","BOND")}).join(""):rowB39("No Boss Bonds yet","Defeat a boss to give Pip a unique mutation.","LOCKED",true);
 $("b39SoundList").innerHTML=PIP_SOUND_PACKS.map(pack=>{const lv=typeof pipSoundLevelB29==="function"?pipSoundLevelB29(pack.id):0,active=lv>0;return rowB39(`${pack.name}${active?` Lv ${lv}`:""}`,B38_SOUND_ASCENDED_TEXT[pack.id]||"Adds a themed Ascended resonance.",active?"ACTIVE":"LOCKED",!active)}).join("");
}
function openAscendedPauseB39(){
 ensureAscendedPauseB39();
 if(!S||S.end||b39Pause.open||b39StageUpgradeOpen()||!S.run)return false;
 if(S.b38OverHeld)stopOverdriveB38(false);
 b39Pause.resumeRun=!!S.run;b39Pause.open=true;S.b39Paused=true;S.run=false;
 keys.clear();joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;if(typeof hideJoyViz==="function")hideJoyViz();
 renderAscendedPauseB39();$("pipPauseB39").classList.remove("hidden");
 return true;
}
function closeAscendedPauseB39(){
 if(!b39Pause.open)return false;
 $("pipPauseB39")?.classList.add("hidden");b39Pause.open=false;
 if(S){S.b39Paused=false;S.run=!!b39Pause.resumeRun&&!S.end;last=performance.now();updateUI()}
 b39Pause.resumeRun=false;return true;
}
function toggleAscendedPauseB39(){return b39Pause.open?closeAscendedPauseB39():openAscendedPauseB39()}

ensureAscendedPauseB39();
window.addEventListener("keydown",e=>{
 if(e.repeat)return;
 const k=(e.key||"").toLowerCase();
 if(k==="escape"||k==="p"){if(b39Pause.open||S?.run){e.preventDefault();toggleAscendedPauseB39()}}
});

// Gamepad Start toggles pause. A/Cross or B/Circle resumes while paused.
const updateGamepadInputBeforeB39=updateGamepadInput;
updateGamepadInput=function(){
 updateGamepadInputBeforeB39();
 const pads=navigator.getGamepads?navigator.getGamepads():[];let pad=null;
 if(gamepad.index!==null&&pads[gamepad.index]&&pads[gamepad.index].connected)pad=pads[gamepad.index];
 if(!pad){for(const p of pads)if(p&&p.connected){pad=p;break}}
 if(!pad){b39Pause.padStartHeld=false;b39Pause.padAHeld=false;b39Pause.padBHeld=false;return}
 const pressed=i=>!!(pad.buttons&&pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5));
 const start=pressed(9),a=pressed(0),b=pressed(1);
 if(start&&!b39Pause.padStartHeld&&(b39Pause.open||S?.run))toggleAscendedPauseB39();
 if(b39Pause.open&&((a&&!b39Pause.padAHeld)||(b&&!b39Pause.padBHeld)))closeAscendedPauseB39();
 b39Pause.padStartHeld=start;b39Pause.padAHeld=a;b39Pause.padBHeld=b;
};

// Keep reset lifecycle explicit: pause never leaks into a new run.
const resetBeforeB39=reset;
reset=function(){
 if(b39Pause.open){$("pipPauseB39")?.classList.add("hidden");b39Pause.open=false;b39Pause.resumeRun=false}
 resetBeforeB39();if(S)S.b39Paused=false;
};
