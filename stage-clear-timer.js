(() => {
  const STAGE_CLEAR_SECONDS = 10;

  const baseBeginWaveBreak = beginWaveBreak;
  beginWaveBreak = function beginWaveBreakWithStageTimer() {
    const result = baseBeginWaveBreak();
    if (S.stageEnding) S.waveBreak = STAGE_CLEAR_SECONDS;
    return result;
  };

  const baseKillBoss = killBoss;
  killBoss = function killBossWithStageTimer(enemy) {
    const result = baseKillBoss(enemy);
    if (S.stageEnding && S.waveState === "break") {
      S.waveBreak = STAGE_CLEAR_SECONDS;
    }
    return result;
  };
})();