// B54 Sound Lab input parity: keyboard and gamepad use the same hold controller as pointer input.
const soundLabInputB54={keyboardButton:null,gamepadButton:null};

function focusedSoundLabButtonB54(){
  const btn=document.activeElement?.closest?.("[data-sound-hold-kind]");
  return btn&&$("pipSoundStep")?.contains(btn)?btn:null;
}
function syntheticSoundLabHoldEventB54(source){
  return{pointerId:source,preventDefault(){}};
}
function startKeyboardSoundLabHoldB54(e){
  if(e.repeat||(e.key!==" "&&e.key!=="Enter")||!stageUpgradeVisibleB35())return;
  const btn=focusedSoundLabButtonB54();if(!btn)return;
  e.preventDefault();soundLabInputB54.keyboardButton=btn;
  beginSoundLabHoldB45(btn,syntheticSoundLabHoldEventB54("keyboard"));
}
function stopKeyboardSoundLabHoldB54(e){
  if((e.key!==" "&&e.key!=="Enter")||!soundLabInputB54.keyboardButton)return;
  e.preventDefault();
  if(soundLabHold.active&&soundLabHold.pointerId==="keyboard")cancelSoundLabHoldB45("keyboard");
  soundLabInputB54.keyboardButton=null;
}
window.addEventListener("keydown",startKeyboardSoundLabHoldB54);
window.addEventListener("keyup",stopKeyboardSoundLabHoldB54);

const pressGamepadMenuABeforeB54=pressGamepadMenuA_B35;
pressGamepadMenuA_B35=function(){
  const btn=ensureGamepadMenuFocusB35();
  if(btn?.dataset?.soundHoldKind){
    soundLabInputB54.gamepadButton=btn;
    beginSoundLabHoldB45(btn,syntheticSoundLabHoldEventB54("gamepad"));
    return;
  }
  pressGamepadMenuABeforeB54();
};
const releaseGamepadMenuABeforeB54=releaseGamepadMenuA_B35;
releaseGamepadMenuA_B35=function(){
  if(soundLabInputB54.gamepadButton){
    if(soundLabHold.active&&soundLabHold.pointerId==="gamepad")cancelSoundLabHoldB45("gamepad");
    soundLabInputB54.gamepadButton=null;
    return;
  }
  releaseGamepadMenuABeforeB54();
};
const clearGamepadMenuBeforeB54=clearGamepadMenuB35;
clearGamepadMenuB35=function(){
  if(soundLabHold.active&&soundLabHold.pointerId==="gamepad")cancelSoundLabHoldB45("gamepad");
  soundLabInputB54.gamepadButton=null;
  clearGamepadMenuBeforeB54();
};
