// B39 portrait placement refinement: use the portrait as the coordinate space, not each icon's own box.
renderPipPortraitB39=function(){
 const portrait=$("pipPortraitB39"),orbit=$("b39Orbit");if(!portrait||!orbit)return;
 const tier=ascendedEvolutionTierB39(),marks=ascendedUpgradeMarksB39();
 portrait.className=`tier${tier}`;orbit.innerHTML="";
 const sigils=B38_BASIC_OVERDRIVES.map(id=>({id,icon:OVERDRIVE_INFO[id].icon,unlocked:!!S.overUnlocked?.has(id)}));
 sigils.forEach((s,i)=>{
   const p=orbitPointB39(i,sigils.length,38),el=document.createElement("span");
   el.className="b39-sigil"+(s.unlocked?"":" locked");el.textContent=s.icon;
   el.style.left=`${50+p.x}%`;el.style.top=`${50+p.y}%`;el.style.transform="translate(-50%,-50%)";
   orbit.appendChild(el);
 });
 const motes=[];
 for(let i=0;i<Math.min(3,S.pipLove||0);i++)motes.push({t:"♥",c:"#ff9fba"});
 for(let i=0;i<Math.min(3,S.pipCompassion||0);i++)motes.push({t:"◇",c:"#7ed8ff"});
 for(let i=0;i<Math.min(3,S.pipSupport||0);i++)motes.push({t:"✦",c:"#d9c8ff"});
 const sounds=typeof activePipSoundIdsB31==="function"?activePipSoundIdsB31():[];
 for(let i=0;i<Math.min(4,sounds.length);i++)motes.push({t:"♪",c:"#9ee7ff"});
 motes.forEach((m,i)=>{
   const p=orbitPointB39(i,motes.length,27+(i%2)*9),el=document.createElement("span");
   el.className="b39-mote";el.textContent=m.t;el.style.color=m.c;
   el.style.left=`${50+p.x}%`;el.style.top=`${50+p.y}%`;el.style.transform="translate(-50%,-50%)";
   orbit.appendChild(el);
 });
 $("b39Evolution").innerHTML=`<b>Evolution ${tier} · ${ascendedTierNameB39(tier)} Pip</b><span class="small">${marks} upgrade marks are visibly shaping this form.</span>`;
};

(function compactPipPauseButtonB39(){
 if(document.getElementById("pipPauseButtonCompactB39"))return;
 const style=document.createElement("style");style.id="pipPauseButtonCompactB39";
 style.textContent=`@media(max-width:560px){#pipHubButtonB39{font-size:0;width:28px;min-width:28px;padding:5px}#pipHubButtonB39:after{content:"✦";font-size:11px}}`;
 document.head.appendChild(style);
})();
