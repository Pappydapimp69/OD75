// B82 Stages seven through ten rotate enemy pressure instead of repeating one saturated mix.
const B82_ROSTERS=Object.freeze([
  Object.freeze({name:'SWARM',chaser:.72,core:.90,landscape:13,portrait:10}),
  Object.freeze({name:'PULSE',chaser:.48,core:.82,landscape:14,portrait:11}),
  Object.freeze({name:'CHARGE',chaser:.56,core:.76,landscape:15,portrait:12})
]);
function enemyRosterB82(){if(!S||S.stage<7||S.stage>10)return null;return B82_ROSTERS[clamp((S.stageWaveCount||1)-1,0,2)]}
function rosterEnemyB82(roster,roll){return roll<roster.chaser?'chaser':roll<roster.core?'core':'charger'}
const enemyCapBeforeB82=enemyCap;
enemyCap=function(){const roster=enemyRosterB82();return roster?(H>W?roster.portrait:roster.landscape):enemyCapBeforeB82()};
const chooseSpawnBeforeB82=chooseSpawn;
chooseSpawn=function(){const roster=enemyRosterB82();return roster?rosterEnemyB82(roster,rnd()):chooseSpawnBeforeB82()};
const difficultyHudBeforeB82=difficultyHudTextB65;
difficultyHudTextB65=function(){const copy=difficultyHudBeforeB82(),roster=enemyRosterB82();if(roster)copy.long+=` ${roster.name} rotation; enemy cap ${H>W?roster.portrait:roster.landscape}.`;return copy};
