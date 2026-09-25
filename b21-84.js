
// B95 Heat readout: HEAT reads in real units against the meter's maximum, never as a percentage of
// the ignition line. The top bar is a prominent full-meter gauge with the equipped skill's ignition
// mark; the skill button fills with the whole meter and turns ready once HEAT crosses that mark.
function heatReadoutB95(){
  const cap=heatCapacityB38(),energy=Math.max(0,heatEnergyB38()),id=S?.overType;
  const gate=id==='pip'?B94_PIP_IGNITION_PERCENT:B94_IGNITION_PERCENT;
  return {cap,energy,shown:Math.floor(energy+1e-6),need:Math.ceil(cap*gate/100-1e-6),gate,fill:clamp((S?.heat||0)/100,0,1)};
}

const updateUIBeforeB95=updateUI;
updateUI=function(){
  updateUIBeforeB95();if(!S)return;
  const r=heatReadoutB95(),button=$('overdrive'),bar=$('heatBar'),label=$('overGaugeLabel');
  const name=OVERDRIVE_INFO[S.overType]?.name.toUpperCase()||'';
  if(label)label.textContent=`${name} · ${r.shown}/${r.cap} HEAT`;
  const track=bar?.parentElement;if(track)track.style.setProperty('--b95gate',r.gate+'%');
  if(!button)return;
  button.style.setProperty('--b95fill',(r.fill*100).toFixed(1)+'%');
  button.classList.add('b95gauge');
  // Only the idle, not-yet-ignitable readout changes; charging, cooldown and active labels stay as they are.
  const busy=S.over>0||S.b94Charge||S.b93StormCharge||(S.overType==='storm'&&((S.b93StormCooldown||0)>0||(S.b93StormClouds?.length||0)>0));
  if(!busy&&!canIgniteOverdriveB38(S.overType))button.innerHTML=`${name}<br><small>${r.shown} / ${r.cap}</small>`;
};

(function styleHeatReadoutB95(){
  const style=document.createElement('style');
  style.textContent=`
.bars{grid-template-columns:1fr 2.2fr}
.bars .barbox>#overGaugeLabel{font-size:10px;font-weight:800;color:#ffe7a3;letter-spacing:.08em}
.bars .overbar{position:relative;height:10px;background:#ffffff14;border:1px solid #ffd36f66;box-shadow:0 0 10px #ffd36f22}
.bars .overbar::after{content:"";position:absolute;top:-2px;bottom:-2px;left:var(--b95gate,25%);width:2px;margin-left:-1px;background:#fff7cf;box-shadow:0 0 4px #fff0a8;border-radius:1px}
.bars .overbar #heatBar{box-shadow:0 0 8px #ff9f6faa}
.healthwrap{top:71px}
#overdrive.b95gauge{position:relative;isolation:isolate;overflow:hidden}
#overdrive.b95gauge::before{content:"";position:absolute;left:0;right:0;bottom:0;height:var(--b95fill,0%);z-index:-1;background:linear-gradient(0deg,#ffb347aa,#ffd36f55);transition:height .12s;pointer-events:none}
@media(max-width:560px){.healthwrap{top:72px}.bars .overbar{height:8px}}
`;
  document.head.appendChild(style);
})();
updateUI();
