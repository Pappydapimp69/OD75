// B30 UI cleanup: B28 added a duplicate emotional-skip control. Keep the original control only.
const renderEmotionButtonsBeforeB30Cleanup=renderEmotionButtons;
renderEmotionButtons=function(){
 renderEmotionButtonsBeforeB30Cleanup();
 const duplicate=$("skipEmotionB28");
 if(duplicate)duplicate.remove();
};
if(S&&S.stagePending)renderEmotionButtons();
