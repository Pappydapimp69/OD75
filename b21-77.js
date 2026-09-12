// B88 Perimeter pressure: enemy entry points are weighted by visible edge length.
function perimeterSpawnPointB88(roll,width=W,height=H,cameraX=CAM.x,cameraY=CAM.y,margin=52){
  const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
  let unit=Number(roll);
  if(!Number.isFinite(unit))unit=0;
  unit=clamp(unit,0,1-1e-12);
  let d=unit*(w*2+h*2);
  const left=cameraX-w/2,right=cameraX+w/2,top=cameraY-h/2,bottom=cameraY+h/2;
  if(d<w)return {x:left+d,y:top-margin,edge:"top"};
  d-=w;
  if(d<h)return {x:right+margin,y:top+d,edge:"right"};
  d-=h;
  if(d<w)return {x:right-d,y:bottom+margin,edge:"bottom"};
  d-=w;
  return {x:left-margin,y:bottom-d,edge:"left"};
}
const spawnEnemyBeforeB88=spawnEnemy;
spawnEnemy=function(type){
  const before=enemies.length;
  spawnEnemyBeforeB88(type);
  if(enemies.length<=before)return;
  const p=perimeterSpawnPointB88(rnd());
  for(let i=before;i<enemies.length;i++){enemies[i].x=p.x;enemies[i].y=p.y;enemies[i].b88Edge=p.edge}
};
