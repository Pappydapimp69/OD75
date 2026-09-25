
// B96 Sound Lab wallet scrolls with the page: the Notes / Sound Choices / Mix Choices row is no
// longer pinned to the top of the Sound Lab, so it cannot cover the cards or trap scrolling.
(function unpinSoundLabWalletB96(){
  const style=document.createElement('style');
  style.textContent='#stageUp #soundLabWalletB53{position:static;top:auto;z-index:auto;background:none;padding:0;box-shadow:none;border-bottom:0;margin:10px 0 14px}@media(max-width:699px){#stageUp #soundLabWalletB53{padding:0;margin:7px 0 10px}}';
  document.head.appendChild(style);
})();
