// B86 A monitor change moves devicePixelRatio without firing resize, so the canvas keeps
// the old backing ratio. Watch the ratio itself and re-arm, as resize alone cannot see it.
let b86Query=null;
function rawDprB86(){const n=Number(window.devicePixelRatio);return Number.isFinite(n)&&n>0?n:1}
function bindDprQueryB86(q,fn,on){
  // Safari only has the deprecated addListener/removeListener pair.
  const add=on?"addEventListener":"removeEventListener",old=on?"addListener":"removeListener";
  if(typeof q[add]==="function")q[add]("change",fn);
  else if(typeof q[old]==="function")q[old](fn);
}
function armDprWatchB86(){
  if(typeof window.matchMedia!=="function")return null;
  if(b86Query)bindDprQueryB86(b86Query,onDprChangeB86,false);
  let q=null;
  try{q=window.matchMedia(`(resolution: ${rawDprB86()}dppx)`)}catch(_){return b86Query=null}
  if(!q||typeof q!=="object")return b86Query=null;
  bindDprQueryB86(q,onDprChangeB86,true);
  return b86Query=q;
}
function onDprChangeB86(){resizeArena()}
const resizeArenaBeforeB86=resizeArena;
// Zoom does fire resize, and it moves the ratio too, so the query is re-armed from here
// as well — otherwise the watch keeps testing a ratio the page has already left.
resizeArena=function(){resizeArenaBeforeB86();armDprWatchB86()};
armDprWatchB86();
