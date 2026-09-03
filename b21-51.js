// B61 Saved movement tuning, shared between main-menu settings and the pause tab.
const B61_SETTINGS_KEY="od75_movement_settings_v1";
const B61_DEFAULTS=Object.freeze({pipBase:285,swiftFlat:34,swiftPercent:1,swiftMode:"flat",fullSpeed:50,playerSpeed:205});
const B61_FIELDS=[
  ["pipBase","Pip starting speed",20,1000,1,"Pixels per second before Swift upgrades."],
  ["swiftFlat","Swift flat increase",0,200,1,"Speed added on each flat-increase level."],
  ["swiftPercent","Swift percentage increase",0,100,.1,"Percent of current speed, compounded on percentage levels."],
  ["fullSpeed","Speed remaining at full cargo (%)",5,100,1,"35 means 35% speed remains, a 65% reduction. Slowdown is linear throughout gathering and returning."],
  ["playerSpeed","Player normal top speed",20,1000,1,"Changes normal flight; acceleration and dash behavior remain the same."]
];
function validateSettingsB61(raw){
  if(!raw||!['flat','alternating'].includes(raw.swiftMode))return null;
  const result={swiftMode:raw.swiftMode};
  for(const [key,,min,max] of B61_FIELDS){
    if(raw[key]===""||raw[key]===null||typeof raw[key]==="boolean")return null;
    const value=Number(raw[key]);if(!Number.isFinite(value)||value<min||value>max)return null;result[key]=value;
  }
  return result;
}
function loadSettingsB61(){try{return validateSettingsB61(JSON.parse(localStorage.getItem(B61_SETTINGS_KEY)))||{...B61_DEFAULTS}}catch(_){return {...B61_DEFAULTS}}}
let settingsB61=loadSettingsB61();
function swiftSpeedB61(level,config=settingsB61){
  let speed=config.pipBase;
  for(let lv=1;lv<=Math.max(0,Math.min(8,level));lv++)speed=config.swiftMode==="alternating"&&lv%2===0?speed*(1+config.swiftPercent/100):speed+config.swiftFlat;
  return speed;
}
function playerSpeedB61(){return settingsB61.playerSpeed}
const applyPipPowerBeforeB61=applyPipPower;
applyPipPower=function(){applyPipPowerBeforeB61();S.pipMoveSpeed=swiftSpeedB61(S.pipSpeedLv||0)};
// B62 Loneliness multiplies the final cargo-adjusted speed only at an empty heart.
const B62_LONELY_SPEED_FACTOR=.9;
carrySpeedB60=function(){return S.pipMoveSpeed*(1-(1-settingsB61.fullSpeed/100)*clamp(cargoWeightB60()/S.pipCarryCapacity,0,1))*(pipBondB51()===0?B62_LONELY_SPEED_FACTOR:1)};
function applySettingsB61(raw){
  const valid=validateSettingsB61(raw);if(!valid)return {ok:false,message:"Enter numbers within the ranges shown."};
  settingsB61=valid;applyPipPower();
  // Respect a lowered normal cap on resume, without disturbing an active dash.
  const speed=hyp(P.vx,P.vy);if(S.dashTime<=0&&speed>valid.playerSpeed){P.vx*=valid.playerSpeed/speed;P.vy*=valid.playerSpeed/speed}
  let saved=true;try{localStorage.setItem(B61_SETTINGS_KEY,JSON.stringify(valid))}catch(_){saved=false}
  PIP_ABILITY_INFO.speed.desc=`Swift follows your movement settings. Full cargo retains ${valid.fullSpeed}% flight speed.`;
  updateUI();if(b39Pause.open)renderAscendedPauseB39();
  return {ok:true,message:saved?"Applied and saved on this device. Current upgrades and cargo are unchanged.":"Applied for this session. Browser storage is unavailable, so these settings will not survive a reload."};
}
const pipAbilityEffectTextBeforeB61=pipAbilityEffectText;
pipAbilityEffectText=function(kind){
  if(kind!=="speed")return pipAbilityEffectTextBeforeB61(kind);
  const next=swiftSpeedB61((S.pipSpeedLv||0)+1);
  return `${S.pipMoveSpeed.toFixed(1)} → ${next.toFixed(1)} flight speed · ${(next*settingsB61.fullSpeed/100).toFixed(1)} at full load`;
};
// Replace B60's fixed 50% inspection copy with the actual setting.
const renderAscendedPauseBeforeB61=renderAscendedPauseB39;
renderAscendedPauseB39=function(){
  renderAscendedPauseBeforeB61();
  const rows=$("b39CoreList")?.querySelectorAll('.b39-row')||[];
  for(const row of rows)if(row.textContent.includes("Heart transport"))row.outerHTML=rowB39("Heart transport",`${Math.round(S.pipDetectRange)}px sense · ${cargoWeightB60()}/${S.pipCarryCapacity} weight. Full load retains ${settingsB61.fullSpeed}% flight speed. Empty heart: Pip is lonely and moves another 10% slower. Meet Pip within 30px to bank his cargo.`,"CARGO");
};
let mainSettingsOpenB61=false;
function settingsVisibleB61(){return mainSettingsOpenB61||(b39Pause.open&&!$("settingsPaneB61").hidden)}
function readSettingsFormB61(){const raw={swiftMode:$("setting-swiftMode").value};for(const [key] of B61_FIELDS)raw[key]=$("setting-"+key).value;return raw}
function fillSettingsFormB61(config){
  $("setting-swiftMode").value=config.swiftMode;for(const [key] of B61_FIELDS)$("setting-"+key).value=config[key];
  $("settingsStatusB61").textContent="Changes take effect only when you press Apply.";previewSettingsB61();
}
function previewSettingsB61(){
  const config=validateSettingsB61(readSettingsFormB61()),table=$("settingsPreviewB61");
  $("setting-swiftPercent").disabled=$("setting-swiftMode").value==="flat";
  if(!config){table.innerHTML="";$("settingsStatusB61").textContent="Enter valid numbers within the displayed ranges.";return}
  table.innerHTML='<thead><tr><th>Swift Lv</th><th>Empty</th><th>Full cargo</th><th>Player</th></tr></thead><tbody>'+Array.from({length:9},(_,lv)=>{const speed=swiftSpeedB61(lv,config);return `<tr${lv===(S.pipSpeedLv||0)?' class="current"':''}><th>${lv}</th><td>${speed.toFixed(2)}</td><td>${(speed*config.fullSpeed/100).toFixed(2)}</td><td>${config.playerSpeed.toFixed(2)}</td></tr>`}).join('')+'</tbody>';
}
function selectPauseTabB61(tab){
  const settings=tab==="settings";$("buildPaneB61").hidden=settings;$("settingsPaneB61").hidden=!settings;
  for(const name of ['build','settings']){const button=$(name+"TabB61");button.setAttribute('aria-selected',String(name===tab));button.tabIndex=name===tab?0:-1}
  if(settings){$("settingsPaneB61").appendChild($("settingsFormB61"));fillSettingsFormB61(settingsB61)}
}
function openMainSettingsB61(){
  if(S.run||b39Pause.open)return;mainSettingsOpenB61=true;$("mainSettingsContentB61").appendChild($("settingsFormB61"));fillSettingsFormB61(settingsB61);
  $("mainSettingsB61").classList.remove('hidden');$("setting-pipBase").focus();
}
function closeMainSettingsB61(){mainSettingsOpenB61=false;$("mainSettingsB61").classList.add('hidden');keys.clear();$("openSettingsB61").focus()}
function menuControlsB61(){
  const root=$(mainSettingsOpenB61?'mainSettingsB61':'pipPauseB39');
  return [...root.querySelectorAll('button,input,select')].filter(el=>!el.disabled&&!el.closest('[hidden],.hidden'));
}
function tabKeyB61(key){
  const name=key==='Home'?'build':key==='End'?'settings':$("buildTabB61").getAttribute('aria-selected')==='true'?'settings':'build';
  selectPauseTabB61(name);$(name+'TabB61').focus();
}
(function installSettingsB61(){
  const style=document.createElement('style');style.textContent=`
  #openSettingsB61{margin-top:9px}#mainSettingsB61{z-index:60}#mainSettingsB61>.card{width:min(720px,96vw)}#mainSettingsB61>.card,#pipPauseB39>.card{max-width:100%}
  #pipPauseB39 .b39-card{grid-template-rows:auto auto minmax(0,1fr) auto}.b61PauseContent{min-height:0;overflow:hidden}#buildPaneB61{height:100%}#buildPaneB61>.b39-body{height:100%}#settingsPaneB61{height:100%;overflow:auto;padding:3px 8px}
  .b61Tabs{display:flex;gap:8px}.b61Tabs button{padding:9px 20px;border:1px solid #52627b;border-radius:9px;background:#142132}.b61Tabs [aria-selected=true]{border-color:#ffd36f;color:#ffd36f}
  #settingsFormB61{font-size:14px}#settingsFormB61 .b61Fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}#settingsFormB61 label{display:grid;gap:5px;font-weight:700}#settingsFormB61 small{font-size:11px;line-height:1.4;font-weight:400;color:#becbdf}#settingsFormB61 input,#settingsFormB61 select{width:100%;min-height:40px;padding:8px;background:#172335;color:white;border:1px solid #657795;border-radius:8px;font:inherit}#settingsFormB61 input:disabled{opacity:.45}
  .b61Actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.b61Actions button{padding:10px;border:1px solid #7088a7;border-radius:9px;background:#142c40;min-height:42px}#settingsFormB61 button:focus-visible,.b61Tabs button:focus-visible{outline:3px solid #8de0ff;outline-offset:2px}
  #settingsPreviewB61{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}#settingsPreviewB61 td,#settingsPreviewB61 th{padding:5px;text-align:right;border-bottom:1px solid #ffffff14}#settingsPreviewB61 .current{background:#ffd36f15}#settingsStatusB61{min-height:2.5em;color:#ffd36f}#pipPauseB39 [hidden]{display:none!important}
  @media(max-width:550px){#pipPauseB39,#mainSettingsB61{padding:6px}#settingsFormB61 .b61Fields{grid-template-columns:1fr}#settingsFormB61{font-size:13px}.b61Tabs button{flex:1}#pipPauseB39 .b39-footer .small{display:none}}
  @media(max-height:560px){#pipPauseB39 .b39-card{grid-template-rows:auto minmax(0,1fr) auto}}
  `;document.head.appendChild(style);
  const form=document.createElement('form');form.id='settingsFormB61';form.innerHTML='<p>Tune movement without restarting. Settings are saved on this device. Values below are pixels per second unless marked %.</p><div class="b61Fields">'+B61_FIELDS.map(([key,label,min,max,step,help])=>`<label for="setting-${key}">${label}<input id="setting-${key}" type="number" min="${min}" max="${max}" step="${step}" required><small>${help} Range: ${min}–${max}.</small></label>`).join('')+'<label for="setting-swiftMode">Swift upgrade pattern<select id="setting-swiftMode"><option value="flat">Flat increase every level (B60)</option><option value="alternating">Alternate: +flat, then +% of current speed</option></select><small>Alternating starts with the flat increase at level 1.</small></label></div><div class="b61Actions"><button type="button" id="settingsDefaultsB61">Load B60 defaults</button><button type="button" id="settingsPresetB61">Load 140 / +10 / 1% / 35% preset</button><button type="submit">Apply settings</button></div><p id="settingsStatusB61" role="status"></p><table id="settingsPreviewB61" aria-label="Speed preview by Swift level"></table>';
  const modal=document.createElement('div');modal.id='mainSettingsB61';modal.className='modal hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-label','Game settings');modal.innerHTML='<div class="card"><h2>Game settings</h2><div id="mainSettingsContentB61"></div><button type="button" class="primary" id="closeSettingsB61">Back to main screen</button></div>';$("app").appendChild(modal);$("mainSettingsContentB61").appendChild(form);
  const main=document.createElement('button');main.id='openSettingsB61';main.type='button';main.className='primary';main.textContent='Game settings · Y / Triangle';$("begin").after(main);main.addEventListener('click',openMainSettingsB61);$("closeSettingsB61").addEventListener('click',closeMainSettingsB61);
  const card=$("pipPauseB39").querySelector('.b39-card'),body=card.querySelector('.b39-body'),content=document.createElement('div');content.className='b61PauseContent';content.innerHTML='<div id="buildPaneB61" role="tabpanel" aria-labelledby="buildTabB61"></div><div id="settingsPaneB61" role="tabpanel" aria-labelledby="settingsTabB61" hidden></div>';body.before(content);$("buildPaneB61").appendChild(body);
  const tabs=document.createElement('div');tabs.className='b61Tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Pause pages');tabs.innerHTML='<button type="button" id="buildTabB61" role="tab" aria-selected="true" aria-controls="buildPaneB61">Pip build</button><button type="button" id="settingsTabB61" role="tab" aria-selected="false" aria-controls="settingsPaneB61" tabindex="-1">Settings</button>';content.before(tabs);
  for(const name of ['build','settings'])$(name+'TabB61').addEventListener('click',()=>selectPauseTabB61(name));
  modal.setAttribute('aria-modal','true');
  const lonelyNote=document.createElement('p');lonelyNote.id='lonelyNoteB62';lonelyNote.textContent='Preview assumes a charged heart meter. At zero, Pip feels lonely and moves another 10% slower, after cargo slowdown. Recharging the heart removes this penalty.';form.appendChild(lonelyNote);
  card.querySelector('.b39-footer .small').textContent='D-pad: move / adjust · A: select · Esc / B / Start: resume';
  form.addEventListener('input',()=>{$("settingsStatusB61").textContent='Unsaved changes. Press Apply to use them.';previewSettingsB61()});
  form.addEventListener('submit',e=>{e.preventDefault();const result=applySettingsB61(readSettingsFormB61());$("settingsStatusB61").textContent=result.message;previewSettingsB61()});
  $("settingsDefaultsB61").addEventListener('click',()=>fillSettingsFormB61(B61_DEFAULTS));
  $("settingsPresetB61").addEventListener('click',()=>fillSettingsFormB61({...B61_DEFAULTS,pipBase:140,swiftFlat:10,swiftMode:'alternating',fullSpeed:35}));
  window.addEventListener('keydown',e=>{
    if(!mainSettingsOpenB61&&!b39Pause.open)return;
    // Native input editing and button activation still run; gameplay shortcuts do not.
    e.stopImmediatePropagation();
    if(e.key==='Escape'||(!mainSettingsOpenB61&&e.key.toLowerCase()==='p'&&!e.target.closest?.('#settingsFormB61'))){e.preventDefault();mainSettingsOpenB61?closeMainSettingsB61():closeAscendedPauseB39();return}
    if(e.target.closest?.('.b61Tabs')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();tabKeyB61(e.key)}
    if(e.key==='Tab'){
      const controls=menuControlsB61().filter(el=>el.tabIndex>=0),index=controls.indexOf(document.activeElement);
      e.preventDefault();controls[(index+(e.shiftKey?-1:1)+controls.length)%controls.length]?.focus();
    }
  },true);
})();
const closePauseBeforeB61=closeAscendedPauseB39;
closeAscendedPauseB39=function(){const result=closePauseBeforeB61();if(result){selectPauseTabB61('build');keys.clear();$("pipHubButtonB39").focus()}return result};
$("resumeB39").removeEventListener('click',closePauseBeforeB61);
$("resumeB39").addEventListener('click',()=>closeAscendedPauseB39());
const openPauseBeforeB61=openAscendedPauseB39;
openAscendedPauseB39=function(){const result=openPauseBeforeB61();if(result){selectPauseTabB61('build');$("buildTabB61").focus()}return result};
$("pipHubButtonB39").removeEventListener('click',openPauseBeforeB61);
$("pipHubButtonB39").addEventListener('click',()=>openAscendedPauseB39());
// Consume controller input before the old A-to-resume and main-menu A-to-start handlers.
const padB61={a:false,b:false,start:false,y:false,x:0,dy:0,next:0};
const gamepadBeforeB61=updateGamepadInput;
updateGamepadInput=function(){
  const pads=navigator.getGamepads?.()||[];
  const pad=pads[gamepad.index]?.connected?pads[gamepad.index]:Array.from(pads).find(p=>p?.connected);
  if(!pad){Object.assign(padB61,{a:false,b:false,start:false,y:false,x:0,dy:0,next:0});gamepadBeforeB61();return}
  const pressed=i=>!!(pad.buttons?.[i]?.pressed||pad.buttons?.[i]?.value>.5);
  const a=pressed(0),b=pressed(1),start=pressed(9),y=pressed(3),menu=mainSettingsOpenB61||b39Pause.open;
  const opening=!menu&&!$("start").classList.contains('hidden')&&y&&!padB61.y;
  if(opening)openMainSettingsB61();
  if(menu||opening){
    if((b&&!padB61.b)||(start&&!padB61.start)){mainSettingsOpenB61?closeMainSettingsB61():closeAscendedPauseB39()}
    else {
      let controls=menuControlsB61();if(!controls.includes(document.activeElement))controls[0]?.focus();
      const x=(pressed(15)?1:0)-(pressed(14)?1:0)||(Math.abs(pad.axes?.[0]||0)>.55?Math.sign(pad.axes[0]):0);
      const dy=(pressed(13)?1:0)-(pressed(12)?1:0)||(Math.abs(pad.axes?.[1]||0)>.55?Math.sign(pad.axes[1]):0);
      const changed=x!==padB61.x||dy!==padB61.dy,now=performance.now();
      if((x||dy)&&(changed||now>=padB61.next)){
        const active=document.activeElement,index=controls.indexOf(active);
        if(dy)controls[(index+dy+controls.length)%controls.length]?.focus();
        else if(active?.type==='number'){
          const value=Number(active.value)||0;active.value=String(Number(clamp(value+x*Number(active.step),Number(active.min),Number(active.max)).toFixed(4)));
          active.dispatchEvent(new Event('input',{bubbles:true}));
        }else if(active?.tagName==='SELECT'){active.selectedIndex=(active.selectedIndex+x+active.options.length)%active.options.length;active.dispatchEvent(new Event('input',{bubbles:true}))}
        else if(active?.getAttribute('role')==='tab')tabKeyB61(x<0?'ArrowLeft':'ArrowRight');
        else controls[(index+x+controls.length)%controls.length]?.focus();
        document.activeElement?.scrollIntoView?.({block:'nearest'});padB61.next=now+(changed?350:120);
      }
      padB61.x=x;padB61.dy=dy;
      if(a&&!padB61.a&&document.activeElement?.tagName==='BUTTON')document.activeElement.click();
    }
    // Prevent a held menu button from becoming an action when the modal closes.
    gamepad.dashHeld=a||b||pressed(2)||pressed(5);gamepad.overHeld=y;gamepad.dx=0;gamepad.dy=0;
    gamepadMenuB35.aHeld=a;gamepadMenuB35.bHeld=b;
    b39Pause.padAHeld=a;b39Pause.padBHeld=b;b39Pause.padStartHeld=start;
  }else gamepadBeforeB61();
  Object.assign(padB61,{a,b,start,y});
};
const resetBeforeB61=reset;
reset=function(){resetBeforeB61();mainSettingsOpenB61=false;$("mainSettingsB61").classList.add('hidden');selectPauseTabB61('build')};
PIP_ABILITY_INFO.speed.desc=`Swift follows your movement settings. Full cargo retains ${settingsB61.fullSpeed}% flight speed.`;
if(S)applyPipPower();
