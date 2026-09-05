// B69 Compact mobile resource HUD below the Pip/difficulty row.
const mobileHudStyleB69=document.createElement('style');
mobileHudStyleB69.id='mobileHudStyleB69';
mobileHudStyleB69.textContent=`@media(max-width:560px){
  #currencyHud{left:8px;right:8px;top:151px;width:auto;max-width:none;display:flex;flex-wrap:nowrap;gap:10px;font-size:12px;line-height:1;padding:6px 8px;border:1px solid #ffffff20;border-radius:999px;background:#070a11c9;backdrop-filter:blur(7px);overflow:hidden;text-overflow:ellipsis}
  #currencyHud .b47-currency{gap:3px;min-width:0}
  #currencyHud .b47-currency i{font-size:1em}
}`;
document.head.appendChild(mobileHudStyleB69);
