// assets/js/main.js
(() => {
  const cfg = window.configData || {};
  const state = {
    countdownTargetTime: cfg.countdownTargetTime || "2026-01-23T00:00:00",
    autoLaunch: !!cfg.autoLaunch,
    longExposure: !!cfg.longExposure,
    wordShell: !!cfg.wordShell,
    fireworkText: Array.isArray(cfg.fireworkText) ? cfg.fireworkText : []
  };

  // DOM
  const menu = document.getElementById("menu");
  const openBtn = document.querySelector(".open-menu-btn");
  const closeBtn = document.querySelector(".close-menu-btn");
  const launchNowBtn = document.querySelector(".launch-now-btn");

  const inputTarget = document.querySelector(".countdown-target");
  const inputAuto = document.querySelector(".auto-launch");
  const inputLong = document.querySelector(".long-exposure");
  const inputWord = document.querySelector(".word-shell");
  const inputText = document.querySelector(".firework-text");

  const countdownText = document.getElementById("countdownText");

  // Menu
  openBtn.addEventListener("click", () => menu.classList.remove("hide"));
  closeBtn.addEventListener("click", () => menu.classList.add("hide"));

  // init form
  inputTarget.value = state.countdownTargetTime;
  inputAuto.checked = state.autoLaunch;
  inputLong.checked = state.longExposure;
  inputWord.checked = state.wordShell;
  inputText.value = state.fireworkText.join("\n");

  // form -> state
  inputTarget.addEventListener("change", () => state.countdownTargetTime = inputTarget.value);
  inputAuto.addEventListener("change", () => state.autoLaunch = inputAuto.checked);
  inputLong.addEventListener("change", () => state.longExposure = inputLong.checked);
  inputWord.addEventListener("change", () => state.wordShell = inputWord.checked);
  inputText.addEventListener("input", () => {
    state.fireworkText = inputText.value.split("\n").map(s => s.trim()).filter(Boolean);
  });

  // countdown
  let finale = false;
  const pad = (n) => String(n).padStart(2, "0");

  function updateCountdown() {
    const target = new Date(state.countdownTargetTime).getTime();
    if (!Number.isFinite(target)) { countdownText.textContent = "目标时间格式不正确"; return; }

    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      countdownText.textContent = "放假啦 🎉";
      finale = true;
      return;
    }

    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000);   diff %= 60000;
    const s = Math.floor(diff / 1000);

    countdownText.textContent = `${d} 天 ${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // fireworks schedule
  let lastLaunch = 0;

  function randomText() {
    if (!state.wordShell) return null;
    if (!state.fireworkText || state.fireworkText.length === 0) return null;
    return state.fireworkText[Math.floor(Math.random() * state.fireworkText.length)];
  }

  function launchOneAtX(x) {
    Fireworks.launch(
      x,
      Stage.height,
      M.rand(Stage.height * 0.18, Stage.height * 0.55),
      randomText()
    );
  }

  launchNowBtn.addEventListener("click", () => {
    launchOneAtX(M.rand(Stage.width * 0.2, Stage.width * 0.8));
  });

  window.addEventListener("pointerdown", (e) => {
    launchOneAtX(Stage.toCanvasX(e.clientX));
  });

  function tick(ts) {
    requestAnimationFrame(tick);

    Stage.clear(state.longExposure);

    const interval = finale ? 150 : 650;
    if (state.autoLaunch && ts - lastLaunch > interval) {
      lastLaunch = ts;
      launchOneAtX(M.rand(Stage.width * 0.15, Stage.width * 0.85));
    }

    Fireworks.updateAndDraw();
  }

  requestAnimationFrame(tick);
})();
