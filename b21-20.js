// B33 rarity correction: each exploration drop type gets its own 10% roll every 30 non-boss kills.
// B30 accidentally split one successful 10% roll three ways, making each item effectively ~3.3%.
function rollExplorationDropB33(){
 let spawned=false;
 if(rnd()<EXPLORATION_ROLL_CHANCE_B30){spawnAmbientMusicNote();spawned=true}
 if(rnd()<EXPLORATION_ROLL_CHANCE_B30){spawnMusicStarEvent();spawned=true}
 if(rnd()<EXPLORATION_ROLL_CHANCE_B30){spawnPrismEvent();spawned=true}
 return spawned;
}

rollExplorationDropB30=function(){return rollExplorationDropB33()};
