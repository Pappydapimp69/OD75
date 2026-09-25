
// B97 Sound Lab wallet: the Notes / Sound Choices / Mix Choices row may stay pinned while scrolling
// down the lists, but it never covers the top row of Pip Sounds. Selecting a top-row card (gamepad,
// keyboard or pointer) or scrolling up into that row returns the Sound Lab to its top, where the
// row sits in its home position above the cards.
(function installSoundLabWalletHomeB97(){
  const style=document.createElement('style');
  style.textContent='#stageUp #soundLabWalletB53{position:sticky;top:-10px;z-index:6;background:#0d131e;padding:10px 0 8px;margin:0 0 10px;border-bottom:1px solid #ffffff18;box-shadow:0 8px 12px #05080d99}@media(max-width:699px){#stageUp #soundLabWalletB53{top:-8px;padding:8px 0 7px;margin-bottom:8px}}';
  document.head.appendChild(style);
})();
function soundLabScrollerB97(){
  let p=$('soundLabWalletB53')?.parentElement;
  while(p&&p!==document.body){const o=getComputedStyle(p).overflowY;if(o==='auto'||o==='scroll')return p;p=p.parentElement}
  return null;
}
function firstPipSoundRowB97(){
  const grid=$('pipSoundGrid');if(!grid||grid.closest('.stagehidden'))return [];
  const cards=[...grid.children].filter(c=>c.getClientRects().length);if(!cards.length)return [];
  const top=cards[0].getBoundingClientRect().top;
  return cards.filter(c=>Math.abs(c.getBoundingClientRect().top-top)<4);
}
function inTopRowB97(el){
  if(!el)return false;const row=firstPipSoundRowB97();
  return row.some(card=>card===el||card.contains(el));
}
function homeSoundLabB97(){const sc=soundLabScrollerB97();if(sc&&sc.scrollTop>0){sc.scrollTop=0;return true}return false}
document.addEventListener('focusin',e=>{if(inTopRowB97(e.target))homeSoundLabB97()},true);
document.addEventListener('pointerdown',e=>{if(inTopRowB97(e.target))homeSoundLabB97()},true);
const soundLabScrollB97={last:0};
document.addEventListener('scroll',e=>{
  const sc=soundLabScrollerB97();if(!sc||e.target!==sc)return;
  const up=sc.scrollTop<soundLabScrollB97.last;soundLabScrollB97.last=sc.scrollTop;if(!up)return;
  const row=firstPipSoundRowB97(),wallet=$('soundLabWalletB53');if(!row.length||!wallet)return;
  const r=row[0].getBoundingClientRect(),w=wallet.getBoundingClientRect();
  // Scrolling up has brought the top row back under the pinned bar: finish the trip to the top.
  if(r.bottom>w.bottom&&r.top<w.bottom){homeSoundLabB97();soundLabScrollB97.last=0}
},true);
