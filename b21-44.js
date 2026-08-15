// B57 Sticky Sound Lab resources: keep balances visible while browsing long lists.
(function installStickySoundLabWalletB57(){
  if(document.getElementById("stickySoundLabWalletStyleB57"))return;
  const style=document.createElement("style");
  style.id="stickySoundLabWalletStyleB57";
  style.textContent=`
#stageUp #soundLabWalletB53{
  position:sticky;
  top:-10px;
  z-index:6;
  background:#0d131e;
  padding:10px 0 8px;
  margin:0 0 10px;
  border-bottom:1px solid #ffffff18;
  box-shadow:0 8px 12px #05080d99;
}
@media(max-width:699px){
  #stageUp #soundLabWalletB53{
    top:-8px;
    padding:8px 0 7px;
    margin-bottom:8px;
  }
}
`;
  document.head.appendChild(style);
  const wallet=ensureSoundLabWalletB53();
  if(wallet)wallet.setAttribute("role","status");
})();
