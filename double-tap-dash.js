(() => {
  const doubleTap = {
    lastTime: 0,
    lastX: 0,
    lastY: 0,
    pointerType: "",
    maxDelay: 330,
    maxDistance: 56
  };

  function clientPointToWorld(clientX, clientY) {
    const rect = C.getBoundingClientRect();
    const sx = (clientX - rect.left) * (W / rect.width);
    const sy = (clientY - rect.top) * (H / rect.height);
    return {
      x: CAM.x + sx - W / 2,
      y: CAM.y + sy - H / 2
    };
  }

  function dashTowardClientPoint(clientX, clientY) {
    if (!S || !S.run || S.end || S.waveState === "stage") return;

    const target = clientPointToWorld(clientX, clientY);
    let dx = target.x - P.x;
    let dy = target.y - P.y;
    const mag = Math.hypot(dx, dy);
    if (mag < 4) return;

    dx /= mag;
    dy /= mag;

    const savedKeys = [...keys];
    const savedJoy = {
      active: joy.active,
      id: joy.id,
      dx: joy.dx,
      dy: joy.dy
    };

    keys.clear();
    joy.active = true;
    joy.id = null;
    joy.dx = dx;
    joy.dy = dy;

    try {
      dash();
    } finally {
      for (const k of savedKeys) keys.add(k);
      joy.active = savedJoy.active;
      joy.id = savedJoy.id;
      joy.dx = savedJoy.dx;
      joy.dy = savedJoy.dy;
    }
  }

  function resetTapMemory() {
    doubleTap.lastTime = 0;
    doubleTap.pointerType = "";
  }

  C.addEventListener("pointerdown", e => {
    if (!S || !S.run || S.end || S.waveState === "stage") {
      resetTapMemory();
      return;
    }
    if (e.target.closest && e.target.closest("button,.modal")) return;

    const now = performance.now();
    const samePointerType = doubleTap.pointerType === e.pointerType;
    const delay = now - doubleTap.lastTime;
    const distance = Math.hypot(
      e.clientX - doubleTap.lastX,
      e.clientY - doubleTap.lastY
    );

    const isDoubleTap =
      samePointerType &&
      delay > 35 &&
      delay <= doubleTap.maxDelay &&
      distance <= doubleTap.maxDistance;

    if (isDoubleTap) {
      resetTapMemory();
      dashTowardClientPoint(e.clientX, e.clientY);
      e.preventDefault();
      return;
    }

    doubleTap.lastTime = now;
    doubleTap.lastX = e.clientX;
    doubleTap.lastY = e.clientY;
    doubleTap.pointerType = e.pointerType;
  }, { passive: false });

  queueMicrotask(() => {
    for (const rule of document.querySelectorAll(".rule")) {
      const title = rule.querySelector("b")?.textContent?.trim();
      const small = rule.querySelector(".small");
      if (!small) continue;
      if (title === "DASH") {
        small.textContent =
          "Double-tap or double-click anywhere to dash toward that point. Space, the DASH button, or gamepad A/B/X/RB also work.";
      }
    }
  });
})();