const ROAD_IMAGE = "assets/AdobeStock_473031827.jpeg";
const FOG_SCALE = 0.46;
const IDLE_RESET_MS = 30000;
const SOFTEN_MS = 9000;
const HINT_DELAY_MS = 8500;

const storyLines = [
  { text: "you were already on the road when i found it", x: 0.5, y: 0.8, w: 220, tilt: -2, reach: 230 },
  { text: "the pale line kept slipping under your shoes", x: 0.66, y: 0.72, w: 220, tilt: 5, reach: 210 },
  { text: "i missed the turn because i thought you knew it", x: 0.31, y: 0.66, w: 220, tilt: -7, reach: 205 },
  { text: "the trees held your coat longer than the light did", x: 0.23, y: 0.56, w: 210, tilt: -9, reach: 198 },
  { text: "i kept walking after the gravel should have stopped me", x: 0.61, y: 0.56, w: 220, tilt: 5, reach: 188 },
  { text: "by then your face was only a colder brightness", x: 0.46, y: 0.49, w: 210, tilt: -3, reach: 178 },
  { text: "i called once and the fog answered first", x: 0.57, y: 0.39, w: 180, tilt: 2, reach: 166 },
  { text: "then only your steps stayed warm on the road", x: 0.37, y: 0.33, w: 190, tilt: -6, reach: 158 },
  { text: "i followed them until the sound gave out", x: 0.56, y: 0.26, w: 175, tilt: 2, reach: 148 },
  { text: "when you turned back it was only morning in the mist", x: 0.52, y: 0.19, w: 205, tilt: 0, reach: 140 }
];

const style = document.createElement("style");
style.textContent = `
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #d7d8da;
  }

  body {
    font-family: Georgia, "Times New Roman", serif;
  }

  .scene {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    touch-action: none;
    background: #d5d7da;
  }

  .road {
    position: absolute;
    inset: -2%;
    background-size: cover;
    background-position: center 55%;
    filter: saturate(0.8) contrast(1.05) brightness(0.88);
    transform: scale(1.03);
    z-index: 0;
  }

  .road-wash {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 18%, rgba(236, 241, 246, 0.13), transparent 18%),
      linear-gradient(180deg, rgba(47, 56, 70, 0.24), rgba(64, 74, 88, 0.11) 27%, rgba(229, 232, 236, 0.02) 58%, rgba(26, 31, 39, 0.18)),
      linear-gradient(90deg, rgba(18, 22, 28, 0.42), transparent 21%, transparent 79%, rgba(18, 22, 28, 0.42));
    pointer-events: none;
    z-index: 1;
  }

  .scene.ending .road-wash {
    background:
      radial-gradient(circle at 50% 18%, rgba(241, 245, 248, 0.3), transparent 20%),
      linear-gradient(180deg, rgba(47, 56, 70, 0.18), rgba(64, 74, 88, 0.07) 28%, rgba(229, 232, 236, 0.06) 58%, rgba(26, 31, 39, 0.14)),
      linear-gradient(90deg, rgba(18, 22, 28, 0.35), transparent 21%, transparent 79%, rgba(18, 22, 28, 0.35));
  }

  .end-light {
    position: absolute;
    left: 50%;
    top: 22%;
    width: min(46vw, 540px);
    height: min(34vw, 360px);
    border-radius: 999px;
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
    pointer-events: none;
    z-index: 2;
    background:
      radial-gradient(circle, rgba(236, 241, 246, 0.42), rgba(177, 190, 203, 0.16) 38%, transparent 72%);
    filter: blur(28px);
    transition: opacity 1200ms ease, transform 1200ms ease;
  }

  .scene.ending .end-light {
    opacity: 0.82;
    transform: translate(-50%, -50%) scale(1.16);
  }

  .phrases {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
  }

  .whisper {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    color: rgba(226, 230, 235, 0.52);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
    text-shadow: 0 0 12px rgba(16, 20, 25, 0.22);
    white-space: nowrap;
    pointer-events: none;
    z-index: 7;
    transition: opacity 500ms ease, color 500ms ease;
  }

  .whisper.dim {
    opacity: 0.34;
  }

  .progress {
    position: absolute;
    left: 18px;
    bottom: 19px;
    display: flex;
    gap: 5px;
    opacity: 0.48;
    pointer-events: none;
    z-index: 7;
  }

  .progress span {
    width: 10px;
    height: 2px;
    border-radius: 999px;
    background: rgba(224, 230, 236, 0.18);
    box-shadow: 0 0 8px rgba(224, 230, 236, 0.04);
    transition: width 400ms ease, background 400ms ease, box-shadow 400ms ease;
  }

  .progress span.on {
    width: 18px;
    background: rgba(225, 231, 237, 0.58);
    box-shadow: 0 0 12px rgba(225, 231, 237, 0.18);
  }

  .progress.done {
    opacity: 0.72;
  }

  .line {
    position: absolute;
    margin: 0;
    max-width: 42vw;
    color: rgba(31, 35, 41, 0);
    font-size: clamp(13px, 1.45vw, 18px);
    line-height: 1.1;
    letter-spacing: 0.02em;
    text-align: center;
    text-wrap: balance;
    opacity: 0;
    filter: blur(7px);
    transform: translate(-50%, -50%) rotate(var(--tilt));
    transition: opacity 850ms ease, filter 1100ms ease, color 850ms ease;
    text-shadow:
      0 0 12px rgba(241, 243, 245, 0.11),
      0 0 18px rgba(20, 24, 29, 0.16);
  }

  .line.soft {
    opacity: 0.38;
    filter: blur(1.6px);
    color: rgba(45, 49, 56, 0.5);
  }

  .line.current {
    opacity: 0.16;
    filter: blur(3.4px);
    color: rgba(41, 45, 51, 0.32);
  }

  .line.bright {
    opacity: 0.9;
    filter: blur(0.18px);
    color: rgba(24, 28, 34, 0.92);
    background: radial-gradient(ellipse, rgba(226, 232, 238, 0.28), rgba(226, 232, 238, 0.08) 46%, transparent 72%);
    border-radius: 999px;
    padding: 5px 9px;
  }

  .line.last.bright {
    color: rgba(27, 30, 35, 0.95);
  }

  .line.remembered {
    opacity: 0.58;
    filter: blur(0.7px);
    color: rgba(35, 39, 46, 0.74);
    background: radial-gradient(ellipse, rgba(228, 234, 240, 0.18), rgba(228, 234, 240, 0.06) 48%, transparent 72%);
    border-radius: 999px;
    padding: 4px 8px;
  }

  .pulse {
    position: absolute;
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
    border: 1px solid rgba(219, 229, 238, 0.34);
    background: radial-gradient(circle, rgba(228, 235, 242, 0.2), rgba(228, 235, 242, 0) 68%);
    box-shadow: 0 0 32px rgba(214, 224, 233, 0.11);
    z-index: 6;
  }

  .pulse.live {
    animation: pulseOut 880ms ease-out;
  }

  .marker {
    position: absolute;
    left: 0;
    top: 0;
    width: 54px;
    height: 54px;
    border-radius: 999px;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7);
    background:
      radial-gradient(circle, rgba(235, 240, 246, 0.32), rgba(134, 154, 175, 0.18) 36%, rgba(221, 228, 236, 0) 74%);
    filter: blur(3px);
    z-index: 5;
    transition: opacity 400ms ease;
  }

  .marker.live {
    opacity: 0.88;
    animation: markerBreathe 2.8s ease-in-out infinite;
  }

  .marker.found {
    opacity: 0.95;
    animation: markerFound 1.9s ease-out;
  }

  .mist {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    filter: blur(12px);
    opacity: 0.95;
    z-index: 3;
  }

  @keyframes pulseOut {
    0% {
      opacity: 0.38;
      transform: translate(-50%, -50%) scale(0.36);
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(5.1);
    }
  }

  @keyframes markerBreathe {
    0% {
      transform: translate(-50%, -50%) scale(0.72);
    }

    50% {
      transform: translate(-50%, -50%) scale(1.02);
    }

    100% {
      transform: translate(-50%, -50%) scale(0.72);
    }
  }

  @keyframes markerFound {
    0% {
      opacity: 0.74;
      transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(3.2);
    }
  }
`;
document.head.appendChild(style);

const scene = document.createElement("div");
scene.className = "scene";

const road = document.createElement("div");
road.className = "road";
road.style.backgroundImage = `url("${ROAD_IMAGE}")`;

const roadWash = document.createElement("div");
roadWash.className = "road-wash";

const endLight = document.createElement("div");
endLight.className = "end-light";

const phrasesBox = document.createElement("div");
phrasesBox.className = "phrases";

const whisper = document.createElement("p");
whisper.className = "whisper";
whisper.textContent = "click the road. drag where the mist opens.";

const progress = document.createElement("div");
progress.className = "progress";
const progressMarks = [];

const pulse = document.createElement("div");
pulse.className = "pulse";

const marker = document.createElement("div");
marker.className = "marker";

const mist = document.createElement("canvas");
mist.className = "mist";

scene.appendChild(road);
scene.appendChild(roadWash);
scene.appendChild(endLight);
scene.appendChild(phrasesBox);
scene.appendChild(whisper);
scene.appendChild(progress);
scene.appendChild(pulse);
scene.appendChild(marker);
scene.appendChild(mist);
document.body.appendChild(scene);

for (let i = 0; i < storyLines.length; i += 1) {
  const mark = document.createElement("span");
  progress.appendChild(mark);
  progressMarks.push(mark);
}

for (let i = 0; i < storyLines.length; i += 1) {
  const line = storyLines[i];
  const node = document.createElement("p");
  node.className = "line";
  if (i === storyLines.length - 1) node.classList.add("last");
  node.textContent = line.text;
  node.style.left = line.x * 100 + "%";
  node.style.top = line.y * 100 + "%";
  node.style.width = line.w + "px";
  node.style.setProperty("--tilt", line.tilt + "deg");
  phrasesBox.appendChild(node);
  line.node = node;
}

const ctx = mist.getContext("2d");

let viewW = 0;
let viewH = 0;
let mistW = 0;
let mistH = 0;
let dragging = false;
let activePointer = null;
let lastPoint = null;
let trailAmount = 0;
let nextStoryIndex = 0;
let currentLine = null;
let idleTimer = null;
let refillClock = null;
let pulseTimer = null;
let hintTimer = null;
let lastActionAt = 0;
let missCount = 0;
let hintIsOn = false;
let endingShown = false;

function puff(x, y, rx, ry, alpha, tone) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = tone || "rgba(220, 226, 233, " + alpha + ")";
  ctx.fill();
  ctx.restore();
}

function freshMist() {
  ctx.clearRect(0, 0, mistW, mistH);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(202, 209, 218, 0.72)";
  ctx.fillRect(0, 0, mistW, mistH);

  puff(mistW * 0.5, mistH * 0.14, mistW * 0.23, mistH * 0.12, 0.25);
  puff(mistW * 0.18, mistH * 0.34, mistW * 0.14, mistH * 0.11, 0.16);
  puff(mistW * 0.8, mistH * 0.32, mistW * 0.18, mistH * 0.13, 0.16);
  puff(mistW * 0.5, mistH * 0.56, mistW * 0.24, mistH * 0.12, 0.11);

  ctx.fillStyle = "rgba(42, 49, 60, 0.11)";
  ctx.fillRect(0, 0, mistW, mistH * 0.28);
  ctx.fillStyle = "rgba(36, 42, 53, 0.055)";
  ctx.fillRect(0, 0, mistW * 0.18, mistH);
  ctx.fillRect(mistW * 0.82, 0, mistW * 0.18, mistH);

  for (let i = 0; i < 12; i += 1) {
    puff(
      Math.random() * mistW,
      Math.random() * mistH,
      20 + Math.random() * 80,
      14 + Math.random() * 44,
      0.03 + Math.random() * 0.05
    );
  }
}

function softBlob(x, y, r, alpha) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, "rgba(0, 0, 0, " + alpha + ")");
  grad.addColorStop(0.58, "rgba(0, 0, 0, " + (alpha * 0.34) + ")");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function resizeMist() {
  const rect = scene.getBoundingClientRect();
  viewW = rect.width;
  viewH = rect.height;

  const scale = FOG_SCALE * Math.min(window.devicePixelRatio || 1, 1.08);
  mistW = Math.max(260, Math.round(viewW * scale));
  mistH = Math.max(180, Math.round(viewH * scale));

  mist.width = mistW;
  mist.height = mistH;
  freshMist();
}

function placeFromEvent(event) {
  const rect = scene.getBoundingClientRect();
  const vx = event.clientX - rect.left;
  const vy = event.clientY - rect.top;

  return {
    vx,
    vy,
    x: vx * (mistW / viewW),
    y: vy * (mistH / viewH)
  };
}

function flashPulse(vx, vy) {
  pulse.style.left = vx + "px";
  pulse.style.top = vy + "px";
  pulse.classList.remove("live");
  void pulse.offsetWidth;
  pulse.classList.add("live");

  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    pulse.classList.remove("live");
  }, 900);
}

function setWhisper(text, dim) {
  whisper.textContent = text;
  whisper.classList.toggle("dim", !!dim);
}

function moveMarker(line) {
  marker.style.left = line.x * 100 + "%";
  marker.style.top = line.y * 100 + "%";
}

function hideMarker() {
  marker.classList.remove("live");
  marker.classList.remove("found");
  hintIsOn = false;
}

function showHint() {
  if (nextStoryIndex >= storyLines.length) return;

  const nextLine = storyLines[nextStoryIndex];
  moveMarker(nextLine);
  marker.classList.remove("found");
  marker.classList.add("live");
  hintIsOn = true;

  if (nextStoryIndex === 0) {
    setWhisper("click the road. drag where the mist opens.", false);
  } else {
    setWhisper("follow the faint glow. click through it.", false);
  }
}

function flashFound(line) {
  moveMarker(line);
  marker.classList.remove("live");
  marker.classList.remove("found");
  void marker.offsetWidth;
  marker.classList.add("found");

  clearTimeout(marker.timer);
  marker.timer = setTimeout(() => {
    marker.classList.remove("found");
  }, 1900);
}

function updateProgress() {
  for (let i = 0; i < progressMarks.length; i += 1) {
    progressMarks[i].classList.toggle("on", i < nextStoryIndex);
  }

  progress.classList.toggle("done", nextStoryIndex >= storyLines.length);
}

function thinMist(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 10));

  ctx.globalCompositeOperation = "destination-out";

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    const size = 12 + Math.min(11, dist * 0.05);

    softBlob(x, y, size, 0.14);
    softBlob(x + (Math.random() * 8 - 4), y + (Math.random() * 8 - 4), size * 0.82, 0.1);

    if (Math.random() < 0.55) {
      softBlob(x + (Math.random() * 12 - 6), y + (Math.random() * 10 - 5), size * 0.58, 0.07);
    }
  }

  ctx.globalCompositeOperation = "source-over";

  if (Math.random() < 0.6) {
    puff(
      to.x + (Math.random() * 16 - 8),
      to.y + (Math.random() * 12 - 6),
      8 + Math.random() * 18,
      6 + Math.random() * 10,
      0.028,
      "rgba(92, 104, 118, 0.038)"
    );
  }
}

function softenLine(line) {
  if (!line) return;
  if (endingShown) return;
  line.node.classList.remove("bright");
  line.node.classList.remove("current");
  line.node.classList.add("soft");
}

function brightenLine(line) {
  if (!line) return;

  clearTimeout(line.timer);
  line.node.classList.remove("remembered");
  line.node.classList.remove("soft");
  line.node.classList.remove("current");
  line.node.classList.add("bright");

  if (!line.seen) {
    line.seen = true;
    flashFound(line);
  }

  line.timer = setTimeout(() => {
    softenLine(line);
  }, SOFTEN_MS);
}

function showEnding() {
  if (endingShown) return;

  endingShown = true;
  scene.classList.add("ending");
  setWhisper("for a second, it all comes back.", false);

  ctx.globalCompositeOperation = "destination-out";
  softBlob(mistW * 0.5, mistH * 0.28, Math.min(mistW, mistH) * 0.34, 0.16);
  softBlob(mistW * 0.5, mistH * 0.54, Math.min(mistW, mistH) * 0.26, 0.1);
  ctx.globalCompositeOperation = "source-over";

  for (let i = 0; i < storyLines.length; i += 1) {
    const line = storyLines[i];
    clearTimeout(line.timer);
    line.node.classList.remove("soft");
    line.node.classList.remove("current");
    line.node.classList.remove("bright");
    line.node.classList.add("remembered");
  }

  storyLines[storyLines.length - 1].node.classList.add("bright");
}

function distToLine(line, vx, vy) {
  const px = line.x * viewW;
  const py = line.y * viewH;
  return Math.hypot(vx - px, vy - py);
}

function advanceStory(vx, vy) {
  if (nextStoryIndex >= storyLines.length) return false;

  const nextLine = storyLines[nextStoryIndex];
  const kindness = hintIsOn ? 95 : 45;
  if (distToLine(nextLine, vx, vy) > nextLine.reach + kindness) return false;

  if (currentLine) {
    clearTimeout(currentLine.timer);
    softenLine(currentLine);
  }

  currentLine = nextLine;
  nextStoryIndex += 1;
  missCount = 0;
  hideMarker();
  updateProgress();

  currentLine.node.classList.remove("soft");
  currentLine.node.classList.add("current");
  brightenLine(currentLine);
  setWhisper("keep going. it is still here.", true);

  if (nextStoryIndex >= storyLines.length) {
    showEnding();
  }

  return true;
}

function settleCurrent(vx, vy) {
  if (!currentLine) return;
  if (distToLine(currentLine, vx, vy) < currentLine.reach) {
    brightenLine(currentLine);

    if (nextStoryIndex >= storyLines.length) showEnding();
  }
}

function refillMist() {
  if (dragging) return;
  if (endingShown) return;
  if (!mistW || !mistH) return;

  const quietFor = Date.now() - lastActionAt;
  if (quietFor < 120) return;

  const alpha = quietFor > 2400 ? 0.06 : 0.03;
  const x = Math.random() * mistW;
  const y = Math.random() * mistH;
  const tone = quietFor > 1800 && Math.random() < 0.35
    ? "rgba(122, 132, 145, " + (alpha * 0.65) + ")"
    : "rgba(222, 227, 232, " + alpha + ")";

  puff(x, y, 18 + Math.random() * 62, 14 + Math.random() * 36, alpha, tone);

  if (quietFor > 2200) {
    ctx.fillStyle = "rgba(214, 219, 225, 0.018)";
    ctx.fillRect(0, 0, mistW, mistH);
  }
}

function scheduleReset() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    resetPiece();
  }, IDLE_RESET_MS);
}

function scheduleHint() {
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    if (!dragging) showHint();
  }, HINT_DELAY_MS);
}

function noteAction() {
  lastActionAt = Date.now();
  scheduleReset();
  scheduleHint();
}

function resetPiece() {
  clearTimeout(hintTimer);
  trailAmount = 0;
  dragging = false;
  activePointer = null;
  lastPoint = null;
  nextStoryIndex = 0;
  currentLine = null;
  missCount = 0;
  hintIsOn = false;
  endingShown = false;
  scene.classList.remove("ending");
  pulse.classList.remove("live");
  hideMarker();
  freshMist();
  setWhisper("click the road. drag where the mist opens.", false);
  updateProgress();

  for (let i = 0; i < storyLines.length; i += 1) {
    const line = storyLines[i];
    clearTimeout(line.timer);
    line.seen = false;
    line.node.classList.remove("bright");
    line.node.classList.remove("soft");
    line.node.classList.remove("current");
    line.node.classList.remove("remembered");
  }
}

function beginDrag(event) {
  if (activePointer !== null) return;

  activePointer = event.pointerId;
  dragging = true;
  mist.setPointerCapture(event.pointerId);

  const spot = placeFromEvent(event);
  lastPoint = spot;
  trailAmount += 12;
  flashPulse(spot.vx, spot.vy);
  thinMist(spot, { x: spot.x + 1, y: spot.y + 1 });
  noteAction();

  const movedStory = advanceStory(spot.vx, spot.vy);
  if (!movedStory) {
    missCount += 1;

    if (missCount > 2) {
      showHint();
    }
  }

  settleCurrent(spot.vx, spot.vy);
}

function moveDrag(event) {
  if (!dragging || event.pointerId !== activePointer) return;

  const spot = placeFromEvent(event);
  const prev = lastPoint || spot;
  const dx = spot.vx - prev.vx;
  const dy = spot.vy - prev.vy;
  const dist = Math.hypot(dx, dy);

  if (dist < 1.5) return;

  trailAmount += dist;
  thinMist(prev, spot);
  settleCurrent(spot.vx, spot.vy);
  lastPoint = spot;
  noteAction();
}

function endDrag(event) {
  if (event.pointerId !== activePointer) return;

  if (mist.hasPointerCapture(event.pointerId)) {
    mist.releasePointerCapture(event.pointerId);
  }

  dragging = false;
  lastPoint = null;
  activePointer = null;
}

resizeMist();
noteAction();

window.addEventListener("resize", resizeMist);
mist.addEventListener("pointerdown", beginDrag);
mist.addEventListener("pointermove", moveDrag);
mist.addEventListener("pointerup", endDrag);
mist.addEventListener("pointercancel", endDrag);
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") {
    resetPiece();
    noteAction();
  }
});

refillClock = setInterval(() => {
  refillMist();
}, 240);
