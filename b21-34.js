// B47 arena currency HUD: large icon/count readout, no pill, hides while moving and returns after 1.4s idle.
const B47_CURRENCY_HUD_IDLE_SECONDS=1.4;
const B47_CURRENCY_HUD_MOVE_SPEED=8;

function currencyItemsB47(){
  if(!S)return [];
  const items=[
    {icon:"♥",value:Math.max(0,S.heartCurrency||0),title:"Hearts"},
    {icon:"◆",value:Math.max(0,S.prismSeeds||0),title:"Prism Seeds"},
    {icon:"♪",value:Math.max(0,S.musicNotes||0),title:"Music Notes"},
    {icon:"★",value:Math.max(0,S.starPoints||0),title:"Run Stars"}
  ];
  if((S.pipSoundCredits||0)>0)items.push({icon:"◉",value:Math.max(0,S.pipSoundCredits||0),title:"Sound Choices"});
  if((S.audioMixCredits||0)>0)items.push({icon:"≋",value:Math.max(0,S.audioMixCredits||0),title:"Mix Choices"});
  return items;
}
function renderCurrencyHudB47(){
  const hud=$("currencyHud");if(!hud||!S)return;
  hud.innerHTML=currencyItemsB47().map(item=>`<span class="b47-currency" title="${item.title}" aria-label="${item.title} ${item.value}"><i>${item.icon}</i><b>${item.value}</b></span>`).join("");
  hud.classList.toggle("b47-moving",!!S.b47CurrencyHudMoving);
}

const updateUIBeforeB47=updateUI;
updateUI=function(){updateUIBeforeB47();renderCurrencyHudB47()};

const updateBeforeB47=update;
update=function(dt){
  updateBeforeB47(dt);
  if(!S||!P)return;
  const moving=hyp(P.vx||0,P.vy||0)>B47_CURRENCY_HUD_MOVE_SPEED;
  if(moving){S.b47CurrencyHudIdle=0;S.b47CurrencyHudMoving=true}
  else{
    S.b47CurrencyHudIdle=Math.min(B47_CURRENCY_HUD_IDLE_SECONDS,(S.b47CurrencyHudIdle||0)+Math.max(0,dt||0));
    S.b47CurrencyHudMoving=S.b47CurrencyHudIdle<B47_CURRENCY_HUD_IDLE_SECONDS;
  }
  const hud=$("currencyHud");if(hud)hud.classList.toggle("b47-moving",!!S.b47CurrencyHudMoving);
};

const resetBeforeB47=reset;
reset=function(){
  resetBeforeB47();
  S.b47CurrencyHudIdle=B47_CURRENCY_HUD_IDLE_SECONDS;
  S.b47CurrencyHudMoving=false;
  renderCurrencyHudB47();
};
if(S){S.b47CurrencyHudIdle=B47_CURRENCY_HUD_IDLE_SECONDS;S.b47CurrencyHudMoving=false}

(function installCurrencyHudB47(){
  if(document.getElementById("currencyHudB47Style"))return;
  const style=document.createElement("style");style.id="currencyHudB47Style";
  style.textContent=`
#currencyHud{
  left:max(9px,env(safe-area-inset-left));top:100px;
  display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;
  max-width:calc(100vw - 18px);padding:0;border:0;border-radius:0;
  background:transparent;backdrop-filter:none;box-shadow:none;
  color:#fff;font-size:30px;font-weight:950;line-height:1;
  opacity:1;transform:translateY(0);transition:opacity .16s ease,transform .16s ease;
  text-shadow:0 2px 8px #000,0 0 12px #0009;
}
#currencyHud.b47-moving{opacity:0;transform:translateY(-4px)}
#currencyHud .b47-currency{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
#currencyHud .b47-currency i{font-style:normal;font-size:1.08em;line-height:1}
#currencyHud .b47-currency b{font-size:1em;line-height:1;letter-spacing:-.04em}
#currencyHud .b47-currency:nth-child(1) i{color:#ff9fba}
#currencyHud .b47-currency:nth-child(2) i{color:#d7b7ff}
#currencyHud .b47-currency:nth-child(3) i{color:#9ee7ff}
#currencyHud .b47-currency:nth-child(4) i{color:#ffd36f}
#currencyHud .b47-currency:nth-child(5) i{color:#fff0b8}
#currencyHud .b47-currency:nth-child(6) i{color:#b9f0ff}
@media(max-width:560px){#currencyHud{top:96px;font-size:30px;gap:7px 14px;max-width:94vw}}
`;
  document.head.appendChild(style);
  renderCurrencyHudB47();
})();
