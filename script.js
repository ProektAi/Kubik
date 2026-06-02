const diceField = document.querySelector("#dice-field");
const dieTemplate = document.querySelector("#die-template");
const countInput = document.querySelector("#dice-count");
const decreaseButton = document.querySelector("#decrease-count");
const increaseButton = document.querySelector("#increase-count");
const rollButton = document.querySelector("#roll-button");
const totalResult = document.querySelector("#total-result");
const comboResult = document.querySelector("#combo-result");
const historyList = document.querySelector("#history-list");
const rollState = document.querySelector("#roll-state");
const appPanel = document.querySelector(".hero-panel");

const FACE_PIPS = {
  1: ["cc"],
  2: ["tl", "br"],
  3: ["tl", "cc", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "cc", "bl", "br"],
  6: ["tl", "tr", "cl", "cr", "bl", "br"],
};

const FACE_ROTATIONS = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: -90, y: 0, z: 0 },
  3: { x: 0, y: -90, z: 0 },
  4: { x: 0, y: 90, z: 0 },
  5: { x: 90, y: 0, z: 0 },
  6: { x: 0, y: 180, z: 0 },
};

const MAX_DICE = 12;
const MIN_DICE = 1;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let diceCount = 2;
let currentValues = [1, 6];
let history = [];
let rolling = false;
let rollCounter = 0;

class DiceRng {
  constructor() {
    this.counter = 0;
    this.entropy = new Uint32Array(16);
    this.fallbackState = this.seedFallback();
    this.cryptoReady = Boolean(globalThis.crypto?.getRandomValues);
    this.stir(Date.now());

    if (this.cryptoReady) {
      globalThis.crypto.getRandomValues(this.entropy);
    }
  }

  seedFallback() {
    const now = Date.now() >>> 0;
    const perf = Math.floor(performance.now() * 1000) >>> 0;
    return new Uint32Array([
      this.mix32(now ^ 0x9e3779b9),
      this.mix32(perf ^ 0x243f6a88),
      this.mix32((now + perf) ^ 0xb7e15162),
      this.mix32((now << 7) ^ (perf >>> 3) ^ 0x8aed2a6b),
    ]);
  }

  stir(value) {
    const input = Number.isFinite(value) ? value >>> 0 : 0;
    const index = this.counter & 15;
    this.entropy[index] = this.mix32(
      this.entropy[index] ^ input ^ (performance.now() * 1000) ^ this.counter
    );
    this.counter += 1;
  }

  randomUint32() {
    if (this.cryptoReady) {
      const buffer = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buffer);
      const index = this.counter & 15;
      const mixed = this.mix32(buffer[0] ^ this.entropy[index] ^ this.counter);
      this.entropy[index] = this.mix32(this.entropy[index] + mixed + 0x9e3779b9);
      this.counter += 1;
      return mixed >>> 0;
    }

    return this.xoshiro32();
  }

  die() {
    const sides = 6;
    const limit = Math.floor(0x100000000 / sides) * sides;
    let value = this.randomUint32();

    while (value >= limit) {
      value = this.randomUint32();
    }

    return (value % sides) + 1;
  }

  range(min, max) {
    const span = max - min + 1;
    const limit = Math.floor(0x100000000 / span) * span;
    let value = this.randomUint32();

    while (value >= limit) {
      value = this.randomUint32();
    }

    return min + (value % span);
  }

  mix32(value) {
    let x = value >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
  }

  xoshiro32() {
    const s = this.fallbackState;
    const result = this.rotl(Math.imul(s[1], 5), 7);
    const t = s[1] << 9;
    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];
    s[2] ^= t;
    s[3] = this.rotl(s[3], 11);
    return result >>> 0;
  }

  rotl(value, shift) {
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
  }
}

const rng = new DiceRng();

function clampDiceCount(value) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return diceCount;
  }

  return Math.min(MAX_DICE, Math.max(MIN_DICE, parsed));
}

function createPips(face) {
  return FACE_PIPS[face]
    .map((position) => `<span class="pip" data-pos="${position}"></span>`)
    .join("");
}

function buildDie(value, index) {
  const fragment = dieTemplate.content.cloneNode(true);
  const wrap = fragment.querySelector(".die-wrap");
  const die = fragment.querySelector(".die");
  const reader = fragment.querySelector(".die-reader");

  fragment.querySelectorAll(".die-face").forEach((face) => {
    face.innerHTML = createPips(Number(face.dataset.face));
  });

  reader.textContent = `Кубик ${index + 1}: ${value}`;
  applyFace(die, value, false);
  return fragment;
}

function renderDice() {
  const values = Array.from({ length: diceCount }, (_, index) => {
    return currentValues[index] ?? rng.die();
  });

  currentValues = values;
  diceField.innerHTML = "";
  values.forEach((value, index) => {
    diceField.appendChild(buildDie(value, index));
  });
  updateResults(values);
}

function applyFace(die, value, withSpin = true) {
  const rotation = FACE_ROTATIONS[value];
  const spinX = withSpin ? rng.range(2, 6) * 360 : 0;
  const spinY = withSpin ? rng.range(2, 7) * 360 : 0;
  const spinZ = withSpin ? rng.range(-2, 2) * 90 : 0;

  die.style.setProperty("--rx", `${rotation.x + spinX}deg`);
  die.style.setProperty("--ry", `${rotation.y + spinY}deg`);
  die.style.setProperty("--rz", `${rotation.z + spinZ}deg`);
}

function updateResults(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  totalResult.textContent = String(total);
  comboResult.textContent = values.join(" + ");
}

function setDiceCount(value) {
  diceCount = clampDiceCount(value);
  countInput.value = String(diceCount);
  currentValues = currentValues.slice(0, diceCount);

  while (currentValues.length < diceCount) {
    currentValues.push(rng.die());
  }

  renderDice();
}

function addHistory(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  history.unshift({
    total,
    combo: values.join("+"),
  });
  history = history.slice(0, 8);

  historyList.innerHTML = "";
  history.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.total}: ${entry.combo}`;
    historyList.appendChild(item);
  });
}

function rollDice() {
  if (rolling) {
    return;
  }

  rolling = true;
  rollCounter += 1;
  rng.stir(Date.now() ^ rollCounter ^ diceCount);

  const values = Array.from({ length: diceCount }, () => rng.die());
  const diceWraps = [...diceField.querySelectorAll(".die-wrap")];
  const duration = prefersReducedMotion.matches ? 0 : rng.range(860, 1280);

  appPanel.classList.add("is-rolling");
  rollButton.disabled = true;
  rollState.textContent = "Бросок";

  diceWraps.forEach((wrap, index) => {
    const die = wrap.querySelector(".die");
    const reader = wrap.querySelector(".die-reader");
    const value = values[index];

    wrap.classList.remove("is-throwing");
    wrap.style.setProperty("--throw-duration", `${duration + rng.range(-80, 120)}ms`);
    wrap.style.setProperty("--dx", `${rng.range(-54, 54)}px`);
    wrap.style.setProperty("--dy", `${rng.range(-16, 26)}px`);
    wrap.style.setProperty("--tilt", `${rng.range(-22, 22)}deg`);
    die.style.setProperty("--throw-duration", `${duration + rng.range(-80, 140)}ms`);

    void wrap.offsetWidth;
    wrap.classList.add("is-throwing");
    applyFace(die, value, true);
    reader.textContent = `Кубик ${index + 1}: ${value}`;
  });

  window.setTimeout(() => {
    currentValues = values;
    updateResults(values);
    addHistory(values);
    appPanel.classList.remove("is-rolling");
    rollButton.disabled = false;
    rollState.textContent = "Готово";
    rolling = false;
  }, duration + 130);
}

function stirFromEvent(event) {
  const pointer = "clientX" in event ? (event.clientX << 16) ^ event.clientY : 0;
  rng.stir(pointer ^ Date.now() ^ Math.floor(performance.now() * 1000));
}

decreaseButton.addEventListener("click", () => setDiceCount(diceCount - 1));
increaseButton.addEventListener("click", () => setDiceCount(diceCount + 1));
countInput.addEventListener("change", () => setDiceCount(countInput.value));
countInput.addEventListener("input", () => {
  const value = clampDiceCount(countInput.value);
  if (String(value) === countInput.value.trim()) {
    setDiceCount(value);
  }
});
rollButton.addEventListener("click", rollDice);

window.addEventListener("pointermove", stirFromEvent, { passive: true });
window.addEventListener("pointerdown", stirFromEvent, { passive: true });
window.addEventListener("keydown", stirFromEvent);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

renderDice();
