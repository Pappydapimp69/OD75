function runLaunchChecksB75(){
  const results=[];
  const assertB75=(condition,message)=>{if(!condition)throw Error(message)};
  const test=(name,fn)=>{try{fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test('Launch screen keeps one compact goal and three scan-level controls',()=>{
    const card=$('start').querySelector('.b75LaunchCard'),copy=[...card.querySelectorAll('.rule')].map(rule=>rule.textContent.trim());
    assertB75(card&&card.querySelector('.b75LaunchGoal').textContent.includes('SURVIVE 75 SECONDS'),'compact goal missing');
    assertB75(copy.length===3&&copy.every(text=>text.length<50),'control copy expanded');
    assertB75(!card.textContent.includes('lower-left area')&&!card.textContent.includes('Small turns keep momentum'),'old prose survived');
  });
  test('Start and Settings share one visible launch action group',()=>{
    const actions=$('start').querySelector('.b75LaunchActions');
    assertB75(actions&&actions.children.length===2,'launch action group missing');
    assertB75(actions.children[0]===$('begin')&&actions.children[1]===$('openSettingsB61'),'launch actions reordered');
    assertB75($('begin').textContent.includes('A / CROSS')&&$('openSettingsB61').textContent.includes('Y / TRIANGLE'),'controller labels missing');
  });
  test('Compressed Settings action still opens and closes the existing menu',()=>{
    reset();S.run=false;b39Pause.open=false;$('mainSettingsB61').classList.add('hidden');$('openSettingsB61').click();
    assertB75(mainSettingsOpenB61&&!$('mainSettingsB61').classList.contains('hidden'),'settings did not open');
    $('closeSettingsB61').click();assertB75(!mainSettingsOpenB61&&$('mainSettingsB61').classList.contains('hidden'),'settings did not close');
  });
  test('Compressed Start action still enters the authoritative run path',()=>{
    reset();S.run=false;$('start').classList.remove('hidden');$('begin').click();
    assertB75(S.run&&$('start').classList.contains('hidden')&&S.wave===1,'start route changed');
    reset();S.run=false;$('start').classList.remove('hidden');
  });
  return results;
}
