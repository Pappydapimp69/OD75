// B75 Compress the launch screen so play and settings stay immediately reachable.
const B75_LAUNCH_RULES=[
  ['MOVE','Stick · WASD · arrows'],
  ['AUTO-FIRE','Locks the nearest enemy'],
  ['DASH','Double-tap · Space · A/B/X/RB']
];
function installLaunchScreenB75(){
  const start=$('start'),card=start?.querySelector('.card'),goal=card?.querySelector('p'),rules=card?.querySelectorAll('.rule');
  if(!card||!goal||rules?.length!==B75_LAUNCH_RULES.length||!$('begin')||!$('openSettingsB61'))return false;
  card.classList.add('b75LaunchCard');
  goal.className='b75LaunchGoal';
  goal.innerHTML='<b>SURVIVE 75 SECONDS.</b> Clear waves, bank hearts, grow Pip. Wish Stars summon bosses.';
  rules.forEach((rule,index)=>{
    const [name,detail]=B75_LAUNCH_RULES[index];
    rule.innerHTML=`<b>${name}</b><span class="small">${detail}</span>`;
  });
  const actions=document.createElement('div');actions.className='b75LaunchActions';
  $('begin').before(actions);actions.append($('begin'),$('openSettingsB61'));
  $('begin').textContent='START RUN · A / CROSS';
  $('openSettingsB61').textContent='SETTINGS · Y / TRIANGLE';
  const style=document.createElement('style');style.id='launchStyleB75';style.textContent=`
    #start .b75LaunchCard{width:min(640px,94vw);max-height:calc(100dvh - 24px);overflow:hidden;padding:clamp(16px,2.5vw,24px)}
    #start .b75LaunchGoal{font-size:14px;line-height:1.4;margin:8px 0 14px;color:#dce5f0}
    #start .b75LaunchGoal b{color:#fff}
    #start .rules{margin:0 0 14px;gap:8px}
    #start .rule{min-height:72px;display:grid;align-content:center;gap:5px;padding:11px}
    #start .rule b{margin:0;color:#fff}
    #start .rule .small{font-size:11px;line-height:1.35}
    #start .b75LaunchActions{display:grid;grid-template-columns:1.5fr 1fr;gap:8px}
    #start .b75LaunchActions #openSettingsB61{margin-top:0}
    #start .b75LaunchActions button{min-height:46px}
    @media(max-width:560px){
      #start.modal{padding:8px}
      #start .b75LaunchCard{width:100%;max-height:calc(100dvh - 16px);padding:15px;border-radius:16px}
      #start .kicker{font-size:9px}
      #start .logo{font-size:clamp(46px,14vw,60px);margin:7px 0 9px}
      #start .b75LaunchGoal{font-size:12px;line-height:1.35;margin:7px 0 10px}
      #start .rules{grid-template-columns:1fr;margin:0 0 10px;gap:5px}
      #start .rule{min-height:0;grid-template-columns:82px 1fr;align-items:center;align-content:normal;gap:8px;padding:8px 10px}
      #start .rule .small{font-size:10px}
      #start .b75LaunchActions{grid-template-columns:1fr;gap:6px}
      #start .b75LaunchActions button{min-height:42px;padding:9px}
    }
    @media(max-height:560px){
      #start .b75LaunchCard{padding:11px 14px}
      #start .kicker{display:none}
      #start .logo{font-size:42px;margin:2px 0 6px}
      #start .b75LaunchGoal{margin:4px 0 7px}
      #start .rules{margin-bottom:7px}
      #start .rule{min-height:50px;padding:7px}
      #start .b75LaunchActions button{min-height:38px;padding:7px}
    }
  `;document.head.appendChild(style);
  return true;
}
installLaunchScreenB75();
