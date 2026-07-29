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
const modeButtons = [...document.querySelectorAll(".mode-tab")];
const gameViews = {
  dice: document.querySelector("#dice-view"),
  cards: document.querySelector("#cards-view"),
  dasha: document.querySelector("#dasha-view"),
};
const cardField = document.querySelector("#card-field");
const deckButtons = [...document.querySelectorAll("[data-deck]")];
const cardCountButtons = [...document.querySelectorAll("[data-card-count]")];
const drawButton = document.querySelector("#draw-button");
const deckResult = document.querySelector("#deck-result");
const cardResult = document.querySelector("#card-result");
const cardHistoryList = document.querySelector("#card-history-list");
const mahadashaSelect = document.querySelector("#mahadasha-select");
const dashaDepthInputs = [...document.querySelectorAll("[data-dasha-depth]")];
const generateDashaButton = document.querySelector("#generate-dasha-button");
const antardashaSelect = document.querySelector("#antardasha-select");
const dashaChain = document.querySelector("#dasha-chain");
const dashaDepthResult = document.querySelector("#dasha-depth-result");
const dashaResult = document.querySelector("#dasha-result");
const dashaHistoryList = document.querySelector("#dasha-history-list");
const accessGate = document.querySelector("#access-gate");
const accessForm = document.querySelector("#access-form");
const accessCodeInput = document.querySelector("#access-code");
const accessError = document.querySelector("#access-error");
const accessButton = document.querySelector(".access-button");

const ACCESS_STORAGE_KEY = "cubik-access-v1";
const ACCESS_STORAGE_VALUE = "granted";
const ACCESS_CODE_HASH = "94edf28c6d6da38fd35d7ad53e485307f89fbeaf120485c8d17a43f323deee71";

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

const PLAYING_SUITS = [
  { key: "spades", name: "пик", symbol: "♠", tone: "black" },
  { key: "hearts", name: "червей", symbol: "♥", tone: "red" },
  { key: "diamonds", name: "бубен", symbol: "♦", tone: "red" },
  { key: "clubs", name: "треф", symbol: "♣", tone: "black" },
];

const PLAYING_RANKS_36 = [
  { short: "6", name: "Шестерка" },
  { short: "7", name: "Семерка" },
  { short: "8", name: "Восьмерка" },
  { short: "9", name: "Девятка" },
  { short: "10", name: "Десятка" },
  { short: "В", name: "Валет" },
  { short: "Д", name: "Дама" },
  { short: "К", name: "Король" },
  { short: "Т", name: "Туз" },
];

const PLAYING_RANKS_52 = [
  { short: "2", name: "Двойка" },
  { short: "3", name: "Тройка" },
  { short: "4", name: "Четверка" },
  { short: "5", name: "Пятерка" },
  ...PLAYING_RANKS_36,
];

const TAROT_MAJOR = [
  "Шут",
  "Маг",
  "Верховная жрица",
  "Императрица",
  "Император",
  "Иерофант",
  "Влюбленные",
  "Колесница",
  "Сила",
  "Отшельник",
  "Колесо фортуны",
  "Справедливость",
  "Повешенный",
  "Смерть",
  "Умеренность",
  "Дьявол",
  "Башня",
  "Звезда",
  "Луна",
  "Солнце",
  "Суд",
  "Мир",
];

const TAROT_MINOR_SUITS = [
  { key: "wands", name: "Жезлов", symbol: "✦" },
  { key: "cups", name: "Кубков", symbol: "●" },
  { key: "swords", name: "Мечей", symbol: "▲" },
  { key: "pentacles", name: "Пентаклей", symbol: "◆" },
];

const TAROT_RANKS = [
  { short: "Т", name: "Туз" },
  { short: "2", name: "Двойка" },
  { short: "3", name: "Тройка" },
  { short: "4", name: "Четверка" },
  { short: "5", name: "Пятерка" },
  { short: "6", name: "Шестерка" },
  { short: "7", name: "Семерка" },
  { short: "8", name: "Восьмерка" },
  { short: "9", name: "Девятка" },
  { short: "10", name: "Десятка" },
  { short: "Пж", name: "Паж" },
  { short: "Рц", name: "Рыцарь" },
  { short: "Кв", name: "Королева" },
  { short: "Кр", name: "Король" },
];

const DECKS = {
  playing36: {
    label: "36 карт",
    build: () => buildPlayingDeck(PLAYING_RANKS_36),
  },
  playing52: {
    label: "52 карты",
    build: () => buildPlayingDeck(PLAYING_RANKS_52),
  },
  tarot: {
    label: "Таро",
    build: buildTarotDeck,
  },
};

const DASHA_PLANETS = [
  { key: "ketu", name: "Кету", genitive: "Кету", years: 7 },
  { key: "venus", name: "Венера", genitive: "Венеры", years: 20 },
  { key: "sun", name: "Солнце", genitive: "Солнца", years: 6 },
  { key: "moon", name: "Луна", genitive: "Луны", years: 10 },
  { key: "mars", name: "Марс", genitive: "Марса", years: 7 },
  { key: "rahu", name: "Раху", genitive: "Раху", years: 18 },
  { key: "jupiter", name: "Юпитер", genitive: "Юпитера", years: 16 },
  { key: "saturn", name: "Сатурн", genitive: "Сатурна", years: 19 },
  { key: "mercury", name: "Меркурий", genitive: "Меркурия", years: 17 },
];

const DASHA_PLANET_MAP = Object.fromEntries(
  DASHA_PLANETS.map((planet) => [planet.key, planet])
);

const DASHA_LEVELS = [
  { key: "mahadasha", label: "Махадаша" },
  { key: "antardasha", label: "Антрадаша" },
  { key: "pratyantar", label: "Пратьянтарадаша" },
  { key: "sookshma", label: "Сукшмадаша" },
  { key: "prana", label: "Пранадаша" },
];

const OPTIONAL_DASHA_DEPTHS = ["pratyantar", "sookshma", "prana"];

let diceCount = 2;
let currentValues = [1, 6];
let history = [];
let rolling = false;
let rollCounter = 0;
let activeMode = "dice";
let cardDeckKey = "playing36";
let cardCount = 2;
let currentCards = [];
let cardHistory = [];
let drawingCards = false;
let drawCounter = 0;
let currentDashaPath = [];
let dashaHistory = [];

function readSavedAccess() {
  try {
    return localStorage.getItem(ACCESS_STORAGE_KEY) === ACCESS_STORAGE_VALUE;
  } catch {
    return false;
  }
}

function saveAccess() {
  try {
    localStorage.setItem(ACCESS_STORAGE_KEY, ACCESS_STORAGE_VALUE);
  } catch {}
}

function unlockAccess() {
  document.body.classList.remove("is-locked");
  accessGate?.setAttribute("hidden", "");
}

async function hashAccessCode(value) {
  if (!globalThis.crypto?.subtle) {
    return "";
  }

  const data = new TextEncoder().encode(value.trim());
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyAccessCode(value) {
  return (await hashAccessCode(value)) === ACCESS_CODE_HASH;
}

function initAccessGate() {
  if (!accessForm || !accessCodeInput) {
    return;
  }

  if (readSavedAccess()) {
    unlockAccess();
    return;
  }

  accessCodeInput.focus({ preventScroll: true });

  accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    accessButton.disabled = true;
    accessError.hidden = true;

    const isAllowed = await verifyAccessCode(accessCodeInput.value);

    if (isAllowed) {
      saveAccess();
      unlockAccess();
      accessButton.disabled = false;
      return;
    }

    accessButton.disabled = false;
    accessError.hidden = false;
    accessCodeInput.value = "";
    accessCodeInput.focus();
  });
}

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

function buildPlayingDeck(ranks) {
  return ranks.flatMap((rank) =>
    PLAYING_SUITS.map((suit) => ({
      id: `${rank.short}-${suit.key}`,
      type: "playing",
      rank: rank.short,
      symbol: suit.symbol,
      name: `${rank.name} ${suit.name}`,
      tone: suit.tone,
    }))
  );
}

function buildTarotDeck() {
  const majors = TAROT_MAJOR.map((name, index) => ({
    id: `major-${index}`,
    type: "tarot",
    rank: index === 0 ? "0" : String(index),
    symbol: "✦",
    name,
    tone: "tarot",
    arcana: "Старший аркан",
  }));

  const minors = TAROT_MINOR_SUITS.flatMap((suit) =>
    TAROT_RANKS.map((rank) => ({
      id: `${rank.short}-${suit.key}`,
      type: "tarot",
      rank: rank.short,
      symbol: suit.symbol,
      name: `${rank.name} ${suit.name}`,
      tone: "tarot",
      arcana: "Младший аркан",
    }))
  );

  return [...majors, ...minors];
}

function hashString(value) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function sampleCards(deckKey, count) {
  const deck = DECKS[deckKey].build();
  const draw = [];

  for (let index = 0; index < count; index += 1) {
    const cardIndex = rng.range(0, deck.length - 1);
    const [card] = deck.splice(cardIndex, 1);
    draw.push({
      ...card,
      tilt: rng.range(-7, 7),
    });
  }

  return draw;
}

function getDashaSequenceFrom(planetKey) {
  const startIndex = DASHA_PLANETS.findIndex((planet) => planet.key === planetKey);
  const safeIndex = startIndex >= 0 ? startIndex : 0;

  return [
    ...DASHA_PLANETS.slice(safeIndex),
    ...DASHA_PLANETS.slice(0, safeIndex),
  ];
}

function getRandomDashaPlanet(sequence = DASHA_PLANETS) {
  return sequence[rng.range(0, sequence.length - 1)];
}

function getSelectedDashaLevelCount() {
  const checkedDepths = OPTIONAL_DASHA_DEPTHS.filter((depth) => {
    return dashaDepthInputs.some((input) => input.dataset.dashaDepth === depth && input.checked);
  });

  return 2 + checkedDepths.length;
}

function calculateDashaDurationDays(path, levelIndex) {
  if (levelIndex === 0) {
    return path[0].planet.years * 360;
  }

  const product = path
    .slice(0, levelIndex + 1)
    .reduce((total, item) => total * item.planet.years, 1);

  return (360 * product) / Math.pow(120, levelIndex);
}

function formatDashaDuration(days) {
  if (days >= 30) {
    const totalDays = Math.round(days);
    const years = Math.floor(totalDays / 360);
    const months = Math.floor((totalDays % 360) / 30);
    const restDays = totalDays % 30;
    const parts = [];

    if (years > 0) {
      parts.push(`${years} г.`);
    }

    if (months > 0) {
      parts.push(`${months} мес.`);
    }

    if (restDays > 0 || parts.length === 0) {
      parts.push(`${restDays} дн.`);
    }

    return parts.join(" ");
  }

  if (days >= 1) {
    return `${days >= 10 ? Math.round(days) : days.toFixed(1)} дн.`;
  }

  const hours = days * 24;

  if (hours >= 1) {
    return `${hours >= 10 ? Math.round(hours) : hours.toFixed(1)} ч.`;
  }

  return `${Math.max(1, Math.round(hours * 60))} мин.`;
}

function buildDashaPath() {
  const selectedMahadasha = mahadashaSelect?.value ?? "saturn";
  const selectedAntardasha = antardashaSelect?.value ?? "auto";
  const startPlanet =
    selectedMahadasha === "auto"
      ? getRandomDashaPlanet()
      : DASHA_PLANET_MAP[selectedMahadasha] ?? DASHA_PLANET_MAP.saturn;
  const levelCount = getSelectedDashaLevelCount();
  const path = [
    {
      level: DASHA_LEVELS[0],
      planet: startPlanet,
    },
  ];

  if (levelCount > 1) {
    const antardashaSequence = getDashaSequenceFrom(startPlanet.key);
    const antardashaPlanet =
      selectedAntardasha === "auto"
        ? getRandomDashaPlanet(antardashaSequence)
        : DASHA_PLANET_MAP[selectedAntardasha] ?? getRandomDashaPlanet(antardashaSequence);

    path.push({
      level: DASHA_LEVELS[1],
      planet: antardashaPlanet,
    });
  }

  while (path.length < levelCount) {
    const parentPlanet = path[path.length - 1].planet;
    const sequence = getDashaSequenceFrom(parentPlanet.key);
    const planet = getRandomDashaPlanet(sequence);

    path.push({
      level: DASHA_LEVELS[path.length],
      planet,
    });
  }

  return path.map((item, index, fullPath) => ({
    ...item,
    duration: formatDashaDuration(calculateDashaDurationDays(fullPath, index)),
  }));
}

function formatDashaPath(path) {
  return path
    .map((item) => `${item.level.label} ${item.planet.genitive}`)
    .join(" / ");
}

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

function setPressedState(buttons, attribute, value) {
  buttons.forEach((button) => {
    const isActive = button.dataset[attribute] === String(value);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setMode(mode) {
  if (rolling || drawingCards || !gameViews[mode]) {
    return;
  }

  activeMode = mode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  Object.entries(gameViews).forEach(([key, view]) => {
    view.hidden = key !== mode;
    view.classList.toggle("is-active", key === mode);
  });

  rollState.textContent = "Готово";
}

function buildCard(card, index, withAnimation = false) {
  const element = document.createElement("article");
  const isRed = card.tone === "red";
  const isTarot = card.type === "tarot";

  element.className = `draw-card${isRed ? " is-red" : ""}${isTarot ? " is-tarot" : ""}${withAnimation ? " is-entering" : ""}`;
  element.style.setProperty("--tilt", `${card.tilt}deg`);
  element.style.animationDelay = withAnimation && !prefersReducedMotion.matches ? `${index * 70}ms` : "0ms";
  element.setAttribute("aria-label", card.name);

  const corner = document.createElement("div");
  corner.className = "card-corner";
  corner.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit">${card.symbol}</span>`;

  const center = document.createElement("div");
  center.className = "card-center";
  center.textContent = card.symbol;

  const name = document.createElement("div");
  name.className = "card-name";
  name.textContent = isTarot ? `${card.name}` : card.name;

  element.append(corner, center, name);
  return element;
}

function renderCards(withAnimation = false) {
  cardField.innerHTML = "";
  currentCards.forEach((card, index) => {
    cardField.appendChild(buildCard(card, index, withAnimation));
  });
  updateCardResults(currentCards);
}

function updateCardResults(cards) {
  deckResult.textContent = DECKS[cardDeckKey].label;
  cardResult.textContent = cards.map((card) => card.name).join(", ");
}

function addCardHistory(cards) {
  cardHistory.unshift({
    deck: DECKS[cardDeckKey].label,
    combo: cards.map((card) => card.name).join(" / "),
  });
  cardHistory = cardHistory.slice(0, 8);

  cardHistoryList.innerHTML = "";
  cardHistory.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.deck}: ${entry.combo}`;
    cardHistoryList.appendChild(item);
  });
}

function renderDashaPath(path) {
  dashaChain.innerHTML = "";

  path.forEach((item, index) => {
    const node = document.createElement("article");
    node.className = `dasha-node${index === path.length - 1 ? " is-final" : ""}`;
    node.setAttribute("aria-label", `${item.level.label} ${item.planet.genitive}`);

    const label = document.createElement("p");
    label.className = "dasha-node-label";
    label.textContent = item.level.label;

    const planet = document.createElement("p");
    planet.className = "dasha-node-planet";
    planet.textContent = item.planet.name;

    const meta = document.createElement("p");
    meta.className = "dasha-node-meta";
    meta.textContent = `≈ ${item.duration}`;

    node.append(label, planet, meta);
    dashaChain.appendChild(node);
  });

  const finalLevel = path[path.length - 1]?.level.label ?? "Антардаша";
  dashaDepthResult.textContent = finalLevel;
  dashaResult.textContent = formatDashaPath(path);
}

function addDashaHistory(path) {
  dashaHistory.unshift({
    level: path[path.length - 1].level.label,
    combo: formatDashaPath(path),
  });
  dashaHistory = dashaHistory.slice(0, 8);

  dashaHistoryList.innerHTML = "";
  dashaHistory.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.level}: ${entry.combo}`;
    dashaHistoryList.appendChild(item);
  });
}

function generateDasha(shouldSaveHistory = true) {
  rng.stir(
    Date.now() ^
      hashString(mahadashaSelect?.value ?? "saturn") ^
      hashString(antardashaSelect?.value ?? "auto") ^
      getSelectedDashaLevelCount()
  );
  currentDashaPath = buildDashaPath();
  renderDashaPath(currentDashaPath);

  if (shouldSaveHistory) {
    addDashaHistory(currentDashaPath);
    appPanel.classList.add("is-rolling");
    generateDashaButton.disabled = true;
    rollState.textContent = "Даши";

    window.setTimeout(() => {
      appPanel.classList.remove("is-rolling");
      generateDashaButton.disabled = false;
      rollState.textContent = "Готово";
    }, prefersReducedMotion.matches ? 0 : 360);
  }
}

function syncDashaDepthInputs(changedInput) {
  const changedIndex = OPTIONAL_DASHA_DEPTHS.indexOf(changedInput.dataset.dashaDepth);

  dashaDepthInputs.forEach((input) => {
    const index = OPTIONAL_DASHA_DEPTHS.indexOf(input.dataset.dashaDepth);

    if (changedInput.checked && index <= changedIndex) {
      input.checked = true;
    }

    if (!changedInput.checked && index >= changedIndex) {
      input.checked = false;
    }
  });
}

function setCardDeck(deckKey) {
  if (!DECKS[deckKey] || drawingCards) {
    return;
  }

  cardDeckKey = deckKey;
  setPressedState(deckButtons, "deck", deckKey);
  rng.stir(Date.now() ^ hashString(deckKey));
  currentCards = sampleCards(cardDeckKey, cardCount);
  renderCards(false);
}

function setCardCount(value) {
  const parsed = Number.parseInt(value, 10);

  if (![2, 3].includes(parsed) || drawingCards) {
    return;
  }

  cardCount = parsed;
  setPressedState(cardCountButtons, "cardCount", cardCount);
  rng.stir(Date.now() ^ cardCount);
  currentCards = sampleCards(cardDeckKey, cardCount);
  renderCards(false);
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

function drawCards() {
  if (drawingCards) {
    return;
  }

  drawingCards = true;
  drawCounter += 1;
  rng.stir(Date.now() ^ drawCounter ^ cardCount ^ hashString(cardDeckKey));

  const duration = prefersReducedMotion.matches ? 0 : rng.range(360, 580);
  currentCards = sampleCards(cardDeckKey, cardCount);

  appPanel.classList.add("is-rolling");
  drawButton.disabled = true;
  rollState.textContent = "Карты";
  renderCards(true);

  window.setTimeout(() => {
    addCardHistory(currentCards);
    appPanel.classList.remove("is-rolling");
    drawButton.disabled = false;
    rollState.textContent = "Готово";
    drawingCards = false;
  }, duration + 180);
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
drawButton.addEventListener("click", drawCards);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
deckButtons.forEach((button) => {
  button.addEventListener("click", () => setCardDeck(button.dataset.deck));
});
cardCountButtons.forEach((button) => {
  button.addEventListener("click", () => setCardCount(button.dataset.cardCount));
});
mahadashaSelect.addEventListener("change", () => generateDasha(false));
antardashaSelect.addEventListener("change", () => generateDasha(false));
generateDashaButton.addEventListener("click", () => generateDasha(true));
dashaDepthInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncDashaDepthInputs(input);
    generateDasha(false);
  });
});

window.addEventListener("pointermove", stirFromEvent, { passive: true });
window.addEventListener("pointerdown", stirFromEvent, { passive: true });
window.addEventListener("keydown", stirFromEvent);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js?v=6").catch(() => {});
  });
}

initAccessGate();
renderDice();
currentCards = sampleCards(cardDeckKey, cardCount);
renderCards(false);
generateDasha(false);
