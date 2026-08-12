// B27: explicit Overdrive duration scaling. Every level adds uptime; Pip Ascendant starts at 5.0s.
function overdriveDurationB27(id,lv){
 lv=Math.max(1,lv|0);
 const n=lv-1;
 if(id==="beam")return 3.48+n*.48;
 if(id==="storm")return 3.82+n*.42;
 if(id==="guardian")return 4.48+n*.48;
 if(id==="nova")return 2.84+n*.34;
 if(id==="gravity")return 4.26+n*.46;
 return 5.00+n*.55;
}

triggerOverdrive=function(){
 if(!S||!S.run||S.end||S.waveState==="stage"||S.over>0||S.heat<100)return false;
 const id=S.overType,lv=Math.max(1,overLevel(id));
 S.heat=0;S.overdrives++;S.overPulse=0;S.overFxClock=0;S.overTarget=null;S.ascendantWishMade=false;
 S.over=overdriveDurationB27(id,lv);
 if(id==="guardian"){S.overGuardHits=2+lv*2;S.shields=S.maxShields;S.shieldRegenClock=0}
 else if(id==="gravity"){const t=getAutoTarget();S.overTarget=t?{x:t.x,y:t.y}:{x:P.x+P.faceX*90,y:P.y+P.faceY*90}}
 else if(id==="pip"){S.invuln=Math.max(S.invuln,.25+(S.pipCompassion||0)*.10);S.shields=Math.min(S.maxShields,S.shields+Math.ceil((S.pipCompassion||0)/2))}
 announce("OVERDRIVE · "+OVERDRIVE_INFO[id].name.toUpperCase(),1050);flash=.65;shake=12;burstTone(330+lv*25,6);
 praise(id==="pip"?"okay — me and you. ALL of me. let's go!":"you saved it for exactly the right moment ✦","big",true);
 updateUI();return true;
};

// Keep the skill copy clear that leveling also extends duration.
OVERDRIVE_INFO.beam.desc="Rapid piercing starfire. Levels add damage, penetration and duration.";
OVERDRIVE_INFO.storm.desc="Lightning rains across the viewport and chains through nearby enemies. Levels add power, chains and duration.";
OVERDRIVE_INFO.guardian.desc="Absorbs hits, restores shields and blasts attackers away. Levels add blocks and duration.";
OVERDRIVE_INFO.nova.desc="Repeated expanding shockwaves punish anything surrounding you. Levels add radius, damage and duration.";
OVERDRIVE_INFO.gravity.desc="Pulls enemies into a damaging singularity near your current target. Levels add pull power and duration.";
OVERDRIVE_INFO.pip.desc="Pip becomes the super. Starts at 5 seconds; levels extend duration while Loving, Compassionate and Supportive reshape it.";
