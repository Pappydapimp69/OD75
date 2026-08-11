(() => {
  const gp = {
    index: null,
    connected: false,
    dashDown: false,
    touchOwned: false
  };

  const turnBrake = {
    active: false
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
    return buttonDown(gamepad, 0) ||
           buttonDown(gamepad, 1) ||
           buttonDown(gamepad, 2) ||
           buttonDown(gamepad, 5);
  }

  function desiredMovementVector() {
    let x = 0, y = 0;

    if (keys.has("ArrowLeft") || keys.has("a")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) x += 1;
    if (keys.has("ArrowUp") || keys.has("w")) y -= 1;
    if (keys.has("ArrowDown") || keys.has("s")) y += 1;

    if (joy.active) {
      x += joy.dx;
      y += joy.dy;
    }

    const mag = Math.hypot(x, y);
    if (mag <= 0.12) return { x: 0, y: 0, active: false };
    return { x: x / mag, y: y / mag, active: true };
  }

  function shouldEnterTurnBrake() {
    if (typeof S === "undefined" || !S?.run || S.end || S.dashTime > 0) return false;
    if (typeof P === "undefined" || !P) return false;

    const desired = desiredMovementVector();
    const speed = Math.hypot(P.vx, P.vy);

    if (!desired.active || speed <= 4) return false;

    const velocityAngle = Math.atan2(P.vy, P.vx);
    const inputAngle = Math.atan2(desired.y, desired.x);
    let delta = Math.abs(inputAngle - velocityAngle);
    if (delta > Math.PI) delta = Math.PI * 2 - delta;

    return delta > 8 * Math.PI / 180;
  }

  function runBaseUpdateWithTurnBrake(dt, baseUpdate) {
    if (S.dashTime > 0) turnBrake.active = false;

    if (!turnBrake.active && shouldEnterTurnBrake()) {
      turnBrake.active = true;
    }

    const speed = Math.hypot(P.vx, P.vy);

    // Stay in the brake state until the old velocity is actually gone.
    // During this phase, the base game receives ZERO movement input, so
    // it executes its normal "controls released" friction path without
    // simultaneously accelerating toward the new direction.
    if (turnBrake.active && speed > 2) {
      const savedKeys = [...keys];
      const savedJoy = {
        active: joy.active,
        id: joy.id,
        dx: joy.dx,
        dy: joy.dy
      };

      keys.clear();
      joy.active = false;
      joy.dx = 0;
      joy.dy = 0;

      try {
        return baseUpdate(dt);
      } finally {
        for (const k of savedKeys) keys.add(k);
        joy.active = savedJoy.active;
        joy.id = savedJoy.id;
        joy.dx = savedJoy.dx;
        joy.dy = savedJoy.dy;
      }
    }

    if (turnBrake.active && speed <= 2) {
      P.vx = 0;
      P.vy = 0;
      turnBrake.active = false;
    }

    return baseUpdate(dt);
  }

  const baseUpdate = update;
  update = function gamepadUpdate(dt) {
    const gamepad = currentGamepad();

    if (!gamepad) {
      gp.connected = false;
      gp.dashDown = false;
      return runBaseUpdateWithTurnBrake(dt, baseUpdate);
    }

    gp.connected = true;
    const v = readVector(gamepad);
    const moving = Math.hypot(v.x, v.y) > 0.001;

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

    try {
      return runBaseUpdateWithTurnBrake(dt, baseUpdate);
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
      turnBrake.active = false;
      if (typeof announce === "function") announce("GAMEPAD DISCONNECTED", 850);
    }
  });

  queueMicrotask(() => {
    for (const rule of document.querySelectorAll(".rule")) {
      const title = rule.querySelector("b")?.textContent?.trim();
      const small = rule.querySelector(".small");
      if (!small) continue;
      if (title === "MOVE") {
        small.textContent =
          "Drag anywhere, use WASD/arrows, or use a gamepad left stick/D-pad. Turns over 8° fully brake old momentum before rebuilding speed.";
      } else if (title === "DASH") {
        small.textContent =
          "Tap DASH, Space, or gamepad A/B/X/RB. Mobility, dodge, and finisher. Purple cores chain-react.";
      }
    }
  });
})();