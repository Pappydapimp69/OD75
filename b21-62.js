// B74 Heartfield integration: Pip routing/mining, batched delivery and live tuning.
const B74_SETTINGS_KEY='od75_heartfield_settings_v1';
const B74_DEFAULTS=Object.freeze({radius:220,settle:2.25,cap:8,mine:.18});
const B74_PRESETS={
  sparse:{radius:160,settle:3,cap:6,mine:.22},
  balanced:{...B74_DEFAULTS},
  dense:{radius:280,settle:1.5,cap:10,mine:.14}
};
const B74_FIELDS=[
  ['radius','Node pull radius',100,340,5,'Pixels used for deterministic node capture.'],
  ['settle','Settle delay',.5,5,.05,'Seconds before loose drops can form nodes.'],
  ['cap','Node value cap',3,12,1,'Maximum hearts stored by one node.'],
  ['mine','Mining interval',.08,.5,.01,'Seconds between hearts extracted from a cluster or node.']
];
function validateSettingsB74(raw){
  if(!raw)return null;const result={};
  for(const [key,,min,max] of B74_FIELDS){const value=Number(raw[key]);if(raw[key]===''||raw[key]===null||typeof raw[key]==='boolean'||!Number.isFinite(value)||value<min||value>max)return null;result[key]=key==='cap'?Math.round(value):value}
  return result;
}
function loadSettingsB74(){try{return validateSettingsB74(JSON.parse(localStorage.getItem(B74_SETTINGS_KEY)))||{...B74_DEFAULTS}}catch(_){return {...B74_DEFAULTS}}}
let settingsB74=loadSettingsB74();
function applySettingsB74(raw){
  const valid=validateSettingsB74(raw);if(!valid)return {ok:false,message:'Enter Heartfield values within the ranges shown.'};
  settingsB74=valid;let saved=true;try{localStorage.setItem(B74_SETTINGS_KEY,JSON.stringify(valid))}catch(_){saved=false}
  heartfieldB74().scan=0;return {ok:true,message:saved?'Heartfield settings applied and saved.':'Heartfield settings applied for this session.'};
}
function readSettingsFormB74(){const raw={};for(const [key] of B74_FIELDS)raw[key]=$('setting-b74-'+key).value;return raw}
function fillSettingsFormB74(config=settingsB74){for(const [key] of B74_FIELDS)$('setting-b74-'+key).value=config[key]}

function cargoSlotsB74(){return cargoWeightB60()>=S.pipCarryCapacity?0:Math.max(1,Math.ceil((S.pipCarryCapacity-cargoWeightB60())/B60_HEART_WEIGHT))}
function heartSourcesB74(){return [...heartBits.filter(h=>{ensureHeartSourceB74(h);return !h.dead&&h.life>0&&!h.b74NodeId&&heartValueB74(h)>0}),...heartfieldB74().nodes.filter(n=>heartValueB74(n)>0)]}
function sourceScoreB74(source){
  const d=hyp(source.x-P.pipX,source.y-P.pipY),reachable=Math.min(heartValueB74(source),cargoSlotsB74());
  const urgency=Math.max(0,3-heartMinLifeB74(source))/3*240;
  return reachable*90-d*.35+urgency;
}
function partnershipAllowsSourceB74(source){
  if(!source||!combatB59()||traitLevelB59('love')<=0)return true;
  const b=partnershipB59();if(b.anchor>0||b.rallyReturn)return false;
  const boss=enemies.find(e=>!e.dead&&e.b59);
  return !(boss&&boss.b59.phase!=='recover'&&hyp(source.x-P.x,source.y-P.y)>Math.max(48,S.pipMoveSpeed*.25));
}
function nextHeartSourceB74(current=null){
  if(cargoSlotsB74()<=0||supportEmergencyB63())return null;
  const candidates=heartSourcesB74().filter(source=>hyp(source.x-P.pipX,source.y-P.pipY)<S.pipDetectRange&&partnershipAllowsSourceB74(source));
  if(!candidates.length)return null;
  candidates.sort((a,b)=>sourceScoreB74(b)-sourceScoreB74(a)||(a.id||a.b74Id)-(b.id||b.b74Id));
  const best=candidates[0];
  if(current&&sourceAliveB74(current)&&candidates.includes(current)&&sourceScoreB74(best)<sourceScoreB74(current)*1.2)return current;
  return best;
}
nextCargoTargetB60=function(){return nextHeartSourceB74(S?.pipTarget)};
findPipHeartTarget=function(){return S?.pipState==='orbit'?nextHeartSourceB74():null};

function removeEmptySourceB74(source){
  if(source.b74Node)heartfieldB74().nodes=heartfieldB74().nodes.filter(n=>n!==source);
  else{source.dead=true;heartBits=heartBits.filter(h=>h!==source)}
}
function extractHeartB74(source){
  if(!sourceAliveB74(source)&&!(source?.b74Node&&heartValueB74(source)>0))return null;
  const lives=heartLivesB74(source);if(!lives.length)return null;lives.sort((a,b)=>a-b);
  if(!source.b74Node&&lives.length===1){
    heartBits=heartBits.filter(h=>h!==source);source.b60Carried=true;source.b74NodeId=0;transportB60().cargo.push(source);return source;
  }
  const life=lives.shift(),heart=makeHeartSourceB74(1,source.x,source.y,Math.max(.01,life),false);heart.b60Carried=true;transportB60().cargo.push(heart);
  if(!source.b74Node)source.life=lives.length?Math.max(...lives):0;
  if(!lives.length)removeEmptySourceB74(source);
  return heart;
}
gatherHeartB60=function(source){
  if(!source||S.pipState==='return'||cargoSlotsB74()<=0||supportEmergencyB63())return false;
  const heart=extractHeartB74(source);if(!heart)return false;sfxPipCue('heart');
  S.pipTarget=cargoSlotsB74()>0?nextHeartSourceB74(sourceAliveB74(source)?source:null):null;
  S.pipState=S.pipTarget?'collect':'return';return true;
};
function miningIntervalB74(){return settingsB74.mine*(S.over>0&&S.overType==='pip'?.8:1)}
function clearMiningB74(){heartfieldB74().mining=null}
function beginMiningB74(source){
  const state=heartfieldB74();if(state.mining?.source!==source)state.mining={source,time:miningIntervalB74()};
}
function tickMiningB74(source,dt){
  const state=heartfieldB74();beginMiningB74(source);state.mining.time-=dt;
  if(state.mining.time>0)return;
  state.mining.time+=miningIntervalB74();const mined=extractHeartB74(source);if(mined)sfxHeartfieldB74('mine',heartValueB74(source)+1);
  if(cargoSlotsB74()<=0){S.pipTarget=null;S.pipState='return';clearMiningB74();return}
  if(sourceAliveB74(source)){S.pipTarget=source;return}
  S.pipTarget=nextHeartSourceB74();S.pipState=S.pipTarget?'collect':'return';clearMiningB74();
}

updatePipTransportB60=function(dt){
  const state=transportB60(),field=heartfieldB74();state.relayCd=Math.max(0,state.relayCd-dt);state.rest=Math.max(0,state.rest-dt);
  if(S.pipState!=='orbit'&&state.cargo.length&&hyp(P.pipX-P.x,P.pipY-P.y)<=30){clearMiningB74();reunitePipB60();return}
  if(S.pipState==='orbit'){
    clearMiningB74();const orbit=pipOrbitPoint();flyPipB60(orbit.x,orbit.y,dt);if(state.rest>0)return;
    const target=findPipHeartTarget();if(target){S.pipTarget=target;S.pipState='collect';sfxPipCue('depart')}return;
  }
  if(S.pipState==='collect'){
    let source=S.pipTarget;if(!sourceAliveB74(source))source=S.pipTarget=nextHeartSourceB74();
    if(!source||cargoSlotsB74()<=0){S.pipTarget=null;S.pipState='return';clearMiningB74();return}
    flyPipB60(source.x,source.y,dt);
    if(hyp(source.x-P.pipX,source.y-P.pipY)<=12){
      if(heartValueB74(source)===1&&!source.b74Node){clearMiningB74();gatherHeartB60(source)}else tickMiningB74(source,dt);
    }else if(field.mining?.source!==source)clearMiningB74();
    return;
  }
  clearMiningB74();flyPipB60(P.x,P.y,dt);if(hyp(P.pipX-P.x,P.pipY-P.y)<=30)reunitePipB60();
};

function bankHeartBatchB74(cargo){
  const count=cargo.reduce((n,h)=>n+Math.max(1,heartValueB74(h)),0);if(!count)return 0;
  const beforeStage=S.stageCurrency,beforeTier=S.stage>=4&&S.stage<=10?difficultyStageB63():0;
  for(const h of cargo){h.b60Carried=false;h.dead=true}
  S.runHearts=(S.runHearts||0)+count;S.heartCurrency+=count;S.stageCurrency+=count;S.heartTotal=(S.heartTotal||0)+count;saveHeartTotal();
  popup(P.x,P.y,`♥ +${count}`,'#ffb3c7',count>=3,1);sfxHeartfieldB74('deliver',count);
  const praises=[[12,'you earned enough to help me grow. you did that for me. I won\'t forget it.','big'],[8,'eight hearts. you keep showing up for me and I notice.','nice'],[5,'yes — the little hearts! I love doing this with you ✦','nice'],[3,'three little hearts already. you\'re taking such good care of us.','nice']];
  const crossed=praises.find(([mark])=>beforeStage<mark&&S.stageCurrency>=mark);if(crossed)praise(crossed[1],crossed[2],crossed[2]==='big');
  if(beforeTier&&difficultyStageB63()>beforeTier){S.b73DifficultyPulse=B73_DIFFICULTY_PULSE_SECONDS;S.b73DifficultyTier=difficultyStageB63()}
  return count;
}
deliverCargoB60=function(combat=true){
  const state=transportB60(),cargo=state.cargo.splice(0),count=bankHeartBatchB74(cargo);if(!count)return 0;
  if(combat){
    const lv=bossPowerLevel('relay');if(lv>0&&state.relayCd<=0){S.pipRelayBuff=.5+Math.max(0,lv-1)*.1;state.relayCd=8;popup(P.x,P.y-18,'HEART RELAY','#ffd36f',true,.5);ring(P.x,P.y,'#ffd36f',72)}
    if(S.pipLove>=2)lovePulse(P.pipX,P.pipY);
  }
  return count;
};

updateAscendantHeartMagnetB26=function(dt){
  if(!liveB59()||S.over<=0||S.overType!=='pip'||S.pipState==='return'||transportB60().rest>0||S.b59?.rallyReturn)return;
  const lv=Math.max(1,overLevel('pip')),radius=170+lv*58+S.pipDetectRange*.72,pullSpeed=220+lv*92+S.pipMoveSpeed*.58;
  for(const h of heartBits){
    ensureHeartSourceB74(h);if(h.dead||h.b74NodeId||h.b67SafeDrop)continue;
    const dx=P.pipX-h.x,dy=P.pipY-h.y,d=hyp(dx,dy)||1;if(d>radius)continue;
    if(d<=13&&heartValueB74(h)===1&&cargoSlotsB74()>0){gatherHeartB60(h);continue}
    const step=Math.min(d,pullSpeed*(.45+(1-d/radius)*.95)*dt);h.x+=dx/d*step;h.y+=dy/d*step;h.vx*=.72;h.vy*=.72;
  }
};

(function installHeartfieldSettingsB74(){
  const style=document.createElement('style');style.textContent='#heartfieldSettingsB74{margin:14px 0;border:1px solid #ffffff24;border-radius:10px;padding:8px}#heartfieldSettingsB74 summary{cursor:pointer;font-weight:800;color:#ffcad8;padding:5px}.b74Presets{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.b74Presets button{min-height:38px!important}.b74SettingsGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:550px){.b74SettingsGrid{grid-template-columns:1fr}}';document.head.appendChild(style);
  const details=document.createElement('details');details.id='heartfieldSettingsB74';details.innerHTML='<summary>Advanced Heartfield tuning</summary><p>Adjust clustering and mining without restarting.</p><div class="b74SettingsGrid">'+B74_FIELDS.map(([key,label,min,max,step,help])=>`<label for="setting-b74-${key}">${label}<input id="setting-b74-${key}" type="number" min="${min}" max="${max}" step="${step}" required><small>${help} Range: ${min}–${max}.</small></label>`).join('')+'</div><div class="b74Presets"><button type="button" data-b74-preset="sparse">Sparse</button><button type="button" data-b74-preset="balanced">Balanced</button><button type="button" data-b74-preset="dense">Dense</button></div>';
  $('settingsFormB61').querySelector('.b61Actions').before(details);fillSettingsFormB74();
  for(const button of details.querySelectorAll('[data-b74-preset]'))button.addEventListener('click',()=>{fillSettingsFormB74(B74_PRESETS[button.dataset.b74Preset]);$('settingsStatusB61').textContent='Unsaved Heartfield preset. Press Apply to use it.'});
  $('settingsFormB61').addEventListener('submit',e=>{const result=applySettingsB74(readSettingsFormB74());if(!result.ok){e.preventDefault();e.stopImmediatePropagation();$('settingsStatusB61').textContent=result.message}},true);
  const fillBeforeB74=fillSettingsFormB61;fillSettingsFormB61=function(config){fillBeforeB74(config);fillSettingsFormB74(settingsB74)};
})();

const renderPauseBeforeB74=renderAscendedPauseB39;
renderAscendedPauseB39=function(){renderPauseBeforeB74();$('b39CoreList')?.insertAdjacentHTML('beforeend',rowB39('Heartfield',`${settingsB74.radius}px node pull · ${settingsB74.settle.toFixed(2)}s settle · ${settingsB74.cap} max value · ${settingsB74.mine.toFixed(2)}s mining.`,'FIELD'))};
