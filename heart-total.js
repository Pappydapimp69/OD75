(() => {
  const HEART_TOTAL_KEY = "overdrive75_player_heart_total_v1";

  function loadHeartTotal() {
    try {
      const n = Number(localStorage.getItem(HEART_TOTAL_KEY) || 0);
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveHeartTotal() {
    try {
      localStorage.setItem(HEART_TOTAL_KEY, String(Math.max(0, Math.floor(S.heartTotal || 0))));
    } catch (_) {}
  }

  if (typeof S !== "undefined" && S) S.heartTotal = loadHeartTotal();

  const baseCollectHeartBit = collectHeartBit;
  collectHeartBit = function collectHeartBitForPlayer(h) {
    if (!h || h.dead) return;

    const walletBefore = S.heartCurrency || 0;
    const stageBefore = S.stageCurrency || 0;

    baseCollectHeartBit(h);

    // The base game normally increments these already. These guards make
    // sure a Pip pickup can never fail to reach the player's actual totals.
    if ((S.heartCurrency || 0) === walletBefore) S.heartCurrency = walletBefore + 1;
    if ((S.stageCurrency || 0) === stageBefore) S.stageCurrency = stageBefore + 1;

    S.heartTotal = (S.heartTotal || 0) + 1;
    saveHeartTotal();

    if (typeof updateUI === "function") updateUI();
  };

  const baseUpdateUI = updateUI;
  updateUI = function updateUIWithPlayerHeartTotal() {
    baseUpdateUI();
    const hud = document.getElementById("currencyHud");
    if (hud && typeof S !== "undefined" && S) {
      hud.textContent = `♥ ${S.heartCurrency || 0} WALLET · ${S.heartTotal || 0} TOTAL`;
    }
  };

  // Reapply the saved total after reset(), which recreates S.
  const baseReset = reset;
  reset = function resetWithPlayerHeartTotal() {
    const result = baseReset();
    S.heartTotal = loadHeartTotal();
    if (typeof updateUI === "function") updateUI();
    return result;
  };

  if (typeof updateUI === "function") updateUI();
})();