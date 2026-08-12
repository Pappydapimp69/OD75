// B25: manual Overdrive charge no longer decays.
const updateBeforeB25=update;
update=function(dt){
 const heatBefore=S?S.heat:0;
 updateBeforeB25(dt);
 // Preserve earned HEAT while Overdrive is inactive. triggerOverdrive() is the consumer.
 if(S&&S.run&&S.over<=0&&S.heat<heatBefore)S.heat=heatBefore;
};
