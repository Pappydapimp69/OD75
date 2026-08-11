(() => {
  const gp = {
    index: null,
    connected: false,
    dashDown: false,
    touchOwned: false
  };

  function buttonDown(gamepad, index) {
    const b = gamepad?.buttons?.[index];
    return !!(b && (b.pressed || b.value > 0.55));
  }

  function deadzone(x, y, dead = 0.18) {
    const mag = Math.hypot(x, y);
    if (mag <= dead) return { x: 0, y: 0 };
    const strength = Math.min(1, (mag - dead) / (1 - dead));
    return { x: (x / mag) * strength, y: (y / mag) * strength };
  }

  function currentGamepad() {
    if (!navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    let pad = gp.index != null ? pads[gp.index] : null;
    if (!pad) {
      pad = [...pads].find(Boolean) || null;
      if (pad) gp.index = pad.index;
    }
    return pad;
  }

  function readVector(gamepad) {
    const stick = deadzone(gamepad?.axes?.[0] || 0, gamepad?.axes?.[1] || 0);
    let x = stick.x, y = stick.y;

    const up = buttonDown(gamepad, 12);
    const down = buttonDown(gamepad, 13);
    const left = buttonDown(gamepad, 14);
    const right = buttonDown(gamepad, 15);

    if (left) x -= 1;
    if (right) x += 1;
    if (up) y -= 1;
    if (down) y += 1;

    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    return { x, y };
  }

  function gamepadDashDown(gamepad) {
    // Standard mapping: A, B, X, or right bumper.
    return buttonDown(gamepad, 0) ||
           buttonDown(gamepad, 1) ||
           buttonDown(gamepad, 2) ||
           buttonDown(gamepad, 5);
  }

  function applyDirectionalTurnFriction(dt) {
    if (typeof S === "undefined" || !S?.run || S.end || S.dashTime > 0) return;
    if (typeof P === "undefined" || !P) return;

    let x = 0, y = 0;
    const left = keys.has("ArrowLeft") || keys.has("a");
    const right = keys.has("ArrowRight") || keys.has("d");
    const up = keys.has("ArrowUp") || keys.has("w");
    const down = keys.has("ArrowDown") || keys.has("s");

    if (left) x -= 1;
    if (right) x += 1;
    if (up) y -= 1;
    if (down) y += 1;

    if (joy.active) {
      x += joy.dx;
      y += joy.dy;
    }

    const inputMag = Math.hypot(x, y);
    const speed = Math.hypot(P.vx, P.vy);
    if (inputMag <= 0.12 || speed <= 4) return;

    x /= inputMag;
    y /= inputMag;

    const velocityAngle = Math.atan2(P.vy, P.vx);
    const inputAngle = Math.atan2(y, x);
    let delta = Math.abs(inputAngle - velocityAngle);
    if (delta > Math.PI) delta = Math.PI * 2 - delta;

    if (delta <= 8 * Math.PI / 180) return;

    // More than 8 degrees of directional change gets exactly the same
    // hard friction as releasing the controls.
    const brake = 1050 * dt;
    if (speed <= brake || speed < 2) {
      P.vx = 0;
      P.vy = 0;
    } else {
      const next = speed - brake;
      P.vx = (P.vx / speed) * next;
      P.vy = (P.vy / speed) * next;
    }
  }

  // Preserve the game's original update function. We temporarily feed
  // the controller vector through its existing analog touch joystick.
  const baseUpdate = update;
  update = function gamepadUpdate(dt) {
    const gamepad = currentGamepad();
    if (!gamepad) {
      gp.connected = false;
      gp.dashDown = false;
      applyDirectionalTurnFriction(dt);
      return baseUpdate(dt);
    }

    gp.connected = true;
    const v = readVector(gamepad);
    const moving = Math.hypot(v.x, v.y) > 0.001;

    // Only borrow the touch joystick when a real touch pointer is not active.
    const realTouchActive = joy.active && joy.id !== null;
    const saved = realTouchActive ? null : {
      active: joy.active,
      id: joy.id,
      dx: joy.dx,
      dy: joy.dy
    };

    if (!realTouchActive) {
      joy.active = moving;
      joy.id = null;
      joy.dx = v.x;
      joy.dy = v.y;
      gp.touchOwned = moving;
    }

    const dashDown = gamepadDashDown(gamepad);
    if (dashDown && !gp.dashDown) dash();
    gp.dashDown = dashDown;

    applyDirectionalTurnFriction(dt);

    try {
      return baseUpdate(dt);
    } finally {
      if (saved) {
        joy.active = saved.active;
        joy.id = saved.id;
        joy.dx = saved.dx;
        joy.dy = saved.dy;
      }
    }
  };

  window.addEventListener("gamepadconnected", e => {
    gp.index = e.gamepad.index;
    gp.connected = true;
    if (typeof announce === "function") announce("GAMEPAD CONNECTED", 850);
    if (typeof S !== "undefined" && S?.run && typeof showPipMessage === "function") {
      showPipMessage("controller found ✦ left stick or D-pad to move, A/B/X or RB to dash.");
    }
  });

  window.addEventListener("gamepaddisconnected", e => {
    if (gp.index === e.gamepad.index) {
      gp.index = null;
      gp.connected = false;
      gp.dashDown = false;
      if (typeof announce === "function") announce("GAMEPAD DISCONNECTED", 850);
    }
  });

  // Update start-screen discoverability without changing game layout.
  queueMicrotask(() => {
    for (const rule of document.querySelectorAll(".rule")) {
      const title = rule.querySelector("b")?.textContent?.trim();
      const small = rule.querySelector(".small");
      if (!small) continue;
      if (title === "MOVE") {
        small.textContent =
          "Drag anywhere, use WASD/arrows, or use a gamepad left stick/D-pad. Speed starts at zero, builds gradually, and brakes hard on release.";
      } else if (title === "DASH") {
        small.textContent =
          "Tap DASH, Space, or gamepad A/B/X/RB. Mobility, dodge, and finisher. Purple cores chain-react.";
      }
    }
  });
})();