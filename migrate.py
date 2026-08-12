from pathlib import Path
import re, subprocess, sys

base = Path(sys.argv[1])
outdir = Path(sys.argv[2])
html = base.read_text(encoding='utf-8')

def rep(old,new):
    global html
    if old not in html:
        raise SystemExit('missing patch target: '+old[:120])
    html=html.replace(old,new,1)

old_dash='''function dash(){
 if(!S.run||S.end)return;
 if(S.over<=0&&S.dashCd>0)return;
 let dx=(joy.active?joy.dx:0)+gamepad.dx,dy=(joy.active?joy.dy:0)+gamepad.dy;
 if(keys.has("ArrowLeft")||keys.has("a"))dx--;if(keys.has("ArrowRight")||keys.has("d"))dx++;
 if(keys.has("ArrowUp")||keys.has("w"))dy--;if(keys.has("ArrowDown")||keys.has("s"))dy++;
 let l=hyp(dx,dy);if(l<.2){dx=P.faceX;dy=P.faceY;l=hyp(dx,dy)||1}
 dx/=l;dy/=l;P.faceX=dx;P.faceY=dy;P.vx=dx*640;P.vy=dy*640;S.dashTime=.16;S.invuln=.22;S.dashKillsThisDash=0;
 if(S.over<=0)S.dashCd=S.dashMax;
 if(pipWithPlayer()&&S.pipSupport>=2){
   S.supportRush=2+Math.min(1.5,(S.pipSupport-2)*.18);
   popup(P.x,P.y-16,"PIP RUSH","#d9c8ff",false,.65);
 }
 particle(P.x,P.y,COLORS.player,9,90);sfxDash();
}'''
new_dash='''function dashVector(dx,dy){
 if(!S.run||S.end)return false;
 if(S.over<=0&&S.dashCd>0)return false;
 let l=hyp(dx,dy);if(l<.2){dx=P.faceX;dy=P.faceY;l=hyp(dx,dy)||1}
 dx/=l;dy/=l;P.faceX=dx;P.faceY=dy;P.vx=dx*640;P.vy=dy*640;S.dashTime=.16;S.invuln=.22;S.dashKillsThisDash=0;
 if(S.over<=0)S.dashCd=S.dashMax;
 if(pipWithPlayer()&&S.pipSupport>=2){
   S.supportRush=2+Math.min(1.5,(S.pipSupport-2)*.18);
   popup(P.x,P.y-16,"PIP RUSH","#d9c8ff",false,.65);
 }
 particle(P.x,P.y,COLORS.player,9,90);sfxDash();return true;
}
function dash(){
 let dx=(joy.active?joy.dx:0)+gamepad.dx,dy=(joy.active?joy.dy:0)+gamepad.dy;
 if(keys.has("ArrowLeft")||keys.has("a"))dx--;if(keys.has("ArrowRight")||keys.has("d"))dx++;
 if(keys.has("ArrowUp")||keys.has("w"))dy--;if(keys.has("ArrowDown")||keys.has("s"))dy++;
 return dashVector(dx,dy);
}'''
rep(old_dash,new_dash)

old_move='''   if(inputActive){
     // Analog touch and gamepad input scale target speed by deflection.
     const targetVx=dx*maxSpeed*inputStrength;
     const targetVy=dy*maxSpeed*inputStrength;
     const speedNow=hyp(P.vx,P.vy);

     // From rest, acceleration is deliberately slow: roughly two seconds
     // to reach full normal speed at full deflection.
     let accel=96+(S.over>0?18:0);

     if(speedNow>4){
       const aligned=(P.vx*dx+P.vy*dy)/speedNow;

       // Turning should cost momentum. Perpendicular turns brake harder,
       // and reversals brake hardest before speed can rebuild the new way.
       if(aligned<-.15)accel=360;
       else if(aligned<.55)accel=205;
       else if(aligned<.85)accel=135;
     }

     const dvx=targetVx-P.vx,dvy=targetVy-P.vy;
     const dv=hyp(dvx,dvy);
     const maxDelta=accel*dt;
     if(dv<=maxDelta){
       P.vx=targetVx;P.vy=targetVy;
     }else if(dv>0){
       P.vx+=dvx/dv*maxDelta;
       P.vy+=dvy/dv*maxDelta;
     }
   }else{
     // Strong deliberate braking instead of low-friction coasting.
     // At normal top speed the player stops in roughly a fifth of a second.
     const speedNow=hyp(P.vx,P.vy);
     const brake=1050*dt;
     if(speedNow<=brake||speedNow<2){
       P.vx=0;P.vy=0;
     }else{
       const next=speedNow-brake;
       P.vx=P.vx/speedNow*next;
       P.vy=P.vy/speedNow*next;
     }
   }'''
new_move='''   if(inputActive){
     const targetVx=dx*maxSpeed*inputStrength,targetVy=dy*maxSpeed*inputStrength;
     const speedNow=hyp(P.vx,P.vy);
     let turnDelta=0;
     if(speedNow>4){
       const velocityAngle=Math.atan2(P.vy,P.vx),inputAngle=Math.atan2(dy,dx);
       turnDelta=Math.abs(inputAngle-velocityAngle);if(turnDelta>Math.PI)turnDelta=Math.PI*2-turnDelta;
     }
     if(speedNow>4&&turnDelta>(8*Math.PI/180)){
       const brake=1050*dt;
       if(speedNow<=brake||speedNow<2){P.vx=0;P.vy=0}
       else{const next=speedNow-brake;P.vx=P.vx/speedNow*next;P.vy=P.vy/speedNow*next}
     }else{
       const accel=96+(S.over>0?18:0),dvx=targetVx-P.vx,dvy=targetVy-P.vy,dv=hyp(dvx,dvy),maxDelta=accel*dt;
       if(dv<=maxDelta){P.vx=targetVx;P.vy=targetVy}
       else if(dv>0){P.vx+=dvx/dv*maxDelta;P.vy+=dvy/dv*maxDelta}
     }
   }else{
     const speedNow=hyp(P.vx,P.vy),brake=1050*dt;
     if(speedNow<=brake||speedNow<2){P.vx=0;P.vy=0}
     else{const next=speedNow-brake;P.vx=P.vx/speedNow*next;P.vy=P.vy/speedNow*next}
   }'''
rep(old_move,new_move)

old_touch='''function screenJoyStart(e){
 if(!S||!S.run||S.end||S.waveState==="stage")return;
 if(e.pointerType!=="touch"&&e.pointerType!=="pen")return;
 if(e.target.closest&&e.target.closest("button,.modal"))return;
 if(joy.active)return;
 joy.active=true;
 joy.id=e.pointerId;
 joy.originX=e.clientX;
 joy.originY=e.clientY;
 joy.dx=0;joy.dy=0;
 try{C.setPointerCapture(e.pointerId)}catch(_){}
 e.preventDefault();
}'''
new_touch='''const tapDash={time:0,x:0,y:0,type:""};
function dashTowardScreenPoint(clientX,clientY){
 const rect=C.getBoundingClientRect(),sx=(clientX-rect.left)*(W/rect.width),sy=(clientY-rect.top)*(H/rect.height);
 const worldX=CAM.x+sx-W/2,worldY=CAM.y+sy-H/2;
 return dashVector(worldX-P.x,worldY-P.y);
}
function screenJoyStart(e){
 if(!S||!S.run||S.end||S.waveState==="stage")return;
 if(e.target.closest&&e.target.closest("button,.modal"))return;
 const pointerType=e.pointerType||"mouse",now=performance.now(),dtap=now-tapDash.time,dist=hyp(e.clientX-tapDash.x,e.clientY-tapDash.y);
 const doubleTap=tapDash.type===pointerType&&dtap>=40&&dtap<=660&&dist<=72;
 if(doubleTap){
   tapDash.time=0;tapDash.type="";
   if(joy.active&&joy.id!==null){try{C.releasePointerCapture(joy.id)}catch(_){}}
   joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;
   dashTowardScreenPoint(e.clientX,e.clientY);e.preventDefault();return;
 }
 tapDash.time=now;tapDash.x=e.clientX;tapDash.y=e.clientY;tapDash.type=pointerType;
 if(pointerType!=="touch"&&pointerType!=="pen")return;
 if(joy.active)return;
 joy.active=true;joy.id=e.pointerId;joy.originX=e.clientX;joy.originY=e.clientY;joy.dx=0;joy.dy=0;
 try{C.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();
}'''
rep(old_touch,new_touch)

rep('S.waveBreak=stageEnd?3.3:4.2;','S.waveBreak=stageEnd?10:4.2;')

anchor='function collectHeartBit(h){'
pos=html.index(anchor)
helpers='''const HEART_TOTAL_KEY="overdrive75_player_heart_total_v1";\nfunction loadHeartTotal(){try{const n=Number(localStorage.getItem(HEART_TOTAL_KEY)||0);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0}catch(_){return 0}}\nfunction saveHeartTotal(){try{localStorage.setItem(HEART_TOTAL_KEY,String(Math.max(0,Math.floor(S.heartTotal||0))))}catch(_){}}\n'''
html=html[:pos]+helpers+html[pos:]
rep('h.dead=true;S.heartCurrency++;S.stageCurrency++;','h.dead=true;S.heartCurrency++;S.stageCurrency++;S.heartTotal=(S.heartTotal||0)+1;saveHeartTotal();')
rep('heartCurrency:0,stageCurrency:0,upgradeCost:12,','heartCurrency:0,heartTotal:loadHeartTotal(),stageCurrency:0,upgradeCost:12,')
rep('$("currencyHud").textContent=`♥ ${S.heartCurrency} HEART BITS`;','$("currencyHud").textContent=`♥ ${S.heartCurrency} WALLET · ${S.heartTotal||0} TOTAL`;')

old_wave=''' if(S.waveState==="active"&&S.stageWaveCount<3&&S.stageTime>=60){
   S.stageWaveCount=2;
   startWave(S.wave+1);
   announce("WAVE 3",700);
   showPipMessage("wave three. no rush, no shortcuts — we finish what is still out here.");
 }'''
new_wave=''' if(!S.bossActive&&!S.stageEnding&&S.stageWaveCount<3&&S.stageTime>=60){
   S.waveState="active";S.waveBreak=0;S.stageWaveCount=2;startWave(S.wave+1);
   announce("WAVE 3",700);showPipMessage("wave three. no rush, no shortcuts — we finish what is still out here.");
 }'''
if old_wave in html: html=html.replace(old_wave,new_wave,1)

build='OD75-2026-08-12-B18'
html=html.replace('<title>OVERDRIVE 75</title>',f'<title>OVERDRIVE 75 · {build}</title>',1)
html=html.replace('</body>',f'<div id="od75BuildStamp" style="position:fixed;left:8px;bottom:6px;z-index:9999;font:10px/1 system-ui;color:#ffffff66;pointer-events:none">{build}</div></body>',1)

style=re.search(r'<style>(.*?)</style>',html,re.S|re.I)
script=re.search(r'<script(?:\s[^>]*)?>(.*?)</script>',html,re.S|re.I)
css=style.group(1).strip()+'\n'; js=script.group(1).strip()
prefix='(() => {\n'; suffix='\n})();'
if not(js.startswith(prefix) and js.endswith(suffix)): raise SystemExit('wrapper mismatch')
js=js[len(prefix):-len(suffix)].strip()+'\n'

cands=[m.start()+1 for m in re.finditer(r'\n(?=(?:function |const |let |var |class |addEventListener\(|window\.addEventListener\(|C\.addEventListener\(|resizeArena\(|reset\())',js)]
cands=sorted(set([0]+cands+[len(js)])); targets=[len(js)*i/4 for i in range(1,4)]; splits=[0]
for t in targets:
    valid=[b for b in cands if b>splits[-1]+4000 and b<len(js)-1000]
    splits.append(min(valid,key=lambda b:abs(b-t)))
splits.append(len(js)); chunks=[js[splits[i]:splits[i+1]].lstrip('\n') for i in range(4)]

index=html[:style.start()]+'<link rel="stylesheet" href="styles.css?v=B18">'+html[style.end():]
sm=re.search(r'<script(?:\s[^>]*)?>.*?</script>',index,re.S|re.I)
tags='\n'.join(f'<script src="game-{i}.js?v=B18"></script>' for i in range(1,5))
index=index[:sm.start()]+tags+index[sm.end():]

outdir.mkdir(parents=True,exist_ok=True)
(outdir/'index.html').write_text(index,encoding='utf-8')
(outdir/'styles.css').write_text(css,encoding='utf-8')
for i,ch in enumerate(chunks,1):(outdir/f'game-{i}.js').write_text(ch,encoding='utf-8')

for i in range(1,5):
    r=subprocess.run(['node','--check',str(outdir/f'game-{i}.js')],capture_output=True,text=True)
    if r.returncode: raise SystemExit(r.stderr)
for marker in ['dtap<=660','turnDelta>(8*Math.PI/180)','S.waveBreak=stageEnd?10:4.2;','S.heartTotal=(S.heartTotal||0)+1']:
    if marker not in js: raise SystemExit('missing marker '+marker)
print('migration source validated')
