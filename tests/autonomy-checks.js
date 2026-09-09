function runAutonomyChecks(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{transportFixtureB60();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
  const charger=()=>({type:'charger',x:180,y:0,r:14,hp:4,speed:0,dead:false,age:0,state:'aim',aim:1,vx:0,vy:0});
  test('B77 steady movement changes the actual committed charge direction',()=>{const e=charger();enemies=[e];for(let i=0;i<21;i++){P.y+=2;updateEnemy(e,.04)}const direct=Math.atan2(P.y-e.y,P.x-e.x);assert(e.b55LaneLocked&&e.b55LaneAngle<direct,'no anticipation');const a=e.b55LaneAngle;P.y-=50;for(let i=0;i<8;i++)updateEnemy(e,.04);assert(e.state==='charge'&&e.b55LaneAngle===a&&Math.abs(Math.atan2(e.vy,e.vx)-a)<1e-8,'lane changed after commitment')});
  test('B77 stationary, dash and pause never manufacture motion knowledge',()=>{const e=charger();for(let i=0;i<21;i++)updateEnemy(e,.04);assert(Math.abs(e.b55LaneAngle-Math.PI)<1e-8,'stationary prediction');e.b55LaneLocked=false;S.dashTime=1;P.y=90;updateEnemy(e,.04);assert(e.b77.time===0,'dash learned');const before=JSON.stringify(e);S.b39Paused=true;updateEnemy(e,.04);assert(JSON.stringify(e)===before,'pause advanced')});
  test('B77 prediction is bounded and cannot change enemy speed',()=>{const e=charger();e.b77={time:1,vx:0,vy:999};lockChargerLaneB55(e);assert(Math.abs(e.b55LaneAngle-Math.atan2(28,180)*-1-Math.PI)<1e-7,'prediction cap');assert(e.speed===0,'speed changed')});
  return out;
}
