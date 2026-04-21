// main knobs for the whole thing
// ROAD_IMAGE is the main swap point if I change the photo later.
// FOG_SCALE keeps the canvas smaller than the screen so it runs smoother.
const ROAD_IMAGE = "../AdobeStock_473031827.jpeg";
const FOG_SCALE = 0.46;
const IDLE_RESET_MS = 30000;
const SOFTEN_MS = 9000;
const HINT_DELAY_MS = 8500;

// these are placed by eye on the road
// x and y are like percent positions from 0 to 1.
// reach is how close the click has to be to count.
const storyLines = [
  { text: "you were already on the road when i found it", x: 0.5, y: 0.84, w: 220, tilt: -2, reach: 205 },
  { text: "the pale line kept slipping under your shoes", x: 0.76, y: 0.71, w: 220, tilt: 5, reach: 188 },
  { text: "i missed the turn because i thought you knew it", x: 0.21, y: 0.72, w: 220, tilt: -7, reach: 182 },
  { text: "the trees held your coat longer than the light did", x: 0.16, y: 0.52, w: 210, tilt: -10, reach: 172 },
  { text: "i kept walking after the gravel should have stopped me", x: 0.73, y: 0.49, w: 220, tilt: 6, reach: 164 },
  { text: "by then your face was only a colder brightness", x: 0.43, y: 0.43, w: 210, tilt: -3, reach: 156 },
  { text: "i called once and the fog answered first", x: 0.65, y: 0.34, w: 180, tilt: 2, reach: 146 },
  { text: "then only your steps stayed warm on the road", x: 0.29, y: 0.29, w: 190, tilt: -6, reach: 140 },
  { text: "i followed them until the sound gave out", x: 0.61, y: 0.21, w: 175, tilt: 2, reach: 132 },
  { text: "when you turned back it was only morning in the mist", x: 0.48, y: 0.13, w: 205, tilt: 0, reach: 126 }
];

const style = document.createElement("style");
style.textContent = `
  /* page stuff */
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #d7d8da;
  }

  body { font-family: Georgia, "Times New Roman", serif; }

  .scene {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    touch-action: none;
    background: #d5d7da;
  }

  /* most things sit on top of each other */
  .road,
  .road-wash,
  .end-light,
  .phrases,
  .whisper,
  .progress,
  .pulse,
  .marker,
  .mist {
    position: absolute;
  }

  /* photo layer, still mostly like the real picture */
  .road {
    inset: -2%;
    background-size: cover;
    background-position: center 55%;
    filter: saturate(.8) contrast(1.05) brightness(.88);
    transform: scale(1.03);
    z-index: 0;
  }

  /* blue night left in the fog */
  .road-wash {
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background:
      radial-gradient(circle at 50% 18%, rgba(236, 241, 246, .13), transparent 18%),
      linear-gradient(180deg, rgba(47, 56, 70, .24), rgba(64, 74, 88, .11) 27%, rgba(229, 232, 236, .02) 58%, rgba(26, 31, 39, .18)),
      linear-gradient(90deg, rgba(18, 22, 28, .42), transparent 21%, transparent 79%, rgba(18, 22, 28, .42));
  }

  .scene.ending .road-wash {
    background:
      radial-gradient(circle at 50% 18%, rgba(241, 245, 248, .3), transparent 20%),
      linear-gradient(180deg, rgba(47, 56, 70, .18), rgba(64, 74, 88, .07) 28%, rgba(229, 232, 236, .06) 58%, rgba(26, 31, 39, .14)),
      linear-gradient(90deg, rgba(18, 22, 28, .35), transparent 21%, transparent 79%, rgba(18, 22, 28, .35));
  }

  /* ending glow, it stays hidden till the end */
  .end-light {
    left: 50%;
    top: 22%;
    width: min(46vw, 540px);
    height: min(34vw, 360px);
    border-radius: 999px;
    transform: translate(-50%, -50%) scale(.7);
    opacity: 0;
    pointer-events: none;
    z-index: 2;
    background: radial-gradient(circle, rgba(236, 241, 246, .42), rgba(177, 190, 203, .16) 38%, transparent 72%);
    filter: blur(28px);
    transition: opacity 1200ms ease, transform 1200ms ease;
  }

  .scene.ending .end-light {
    opacity: .82;
    transform: translate(-50%, -50%) scale(1.16);
  }

  .phrases { inset: 0; pointer-events: none; z-index: 4; }

  /* tiny instruction, but not a whole menu */
  .whisper {
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    color: rgba(226, 230, 235, .52);
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: lowercase;
    text-shadow: 0 0 12px rgba(16, 20, 25, .22);
    white-space: nowrap;
    pointer-events: none;
    z-index: 7;
    transition: opacity 500ms ease, color 500ms ease;
  }

  .whisper.dim { opacity: .34; }

  /* little marks so there is some progress feeling */
  .progress {
    left: 18px;
    bottom: 19px;
    display: flex;
    gap: 5px;
    opacity: .48;
    pointer-events: none;
    z-index: 7;
  }

  .progress span {
    width: 10px;
    height: 2px;
    border-radius: 999px;
    background: rgba(224, 230, 236, .18);
    box-shadow: 0 0 8px rgba(224, 230, 236, .04);
    transition: width 400ms ease, background 400ms ease, box-shadow 400ms ease;
  }

  .progress span.on {
    width: 18px;
    background: rgba(225, 231, 237, .58);
    box-shadow: 0 0 12px rgba(225, 231, 237, .18);
  }

  .progress.done { opacity: .72; }

  /* words on the road */
  /* they start basically invisible and then drift in */
  .line {
    position: absolute;
    margin: 0;
    max-width: 42vw;
    color: rgba(31, 35, 41, 0);
    font-size: clamp(13px, 1.45vw, 18px);
    line-height: 1.1;
    letter-spacing: .02em;
    text-align: center;
    text-wrap: balance;
    opacity: 0;
    filter: blur(7px);
    transform: translate(-50%, -50%) rotate(var(--tilt));
    transition: opacity 1200ms ease, filter 1400ms ease, color 900ms ease;
    text-shadow: 0 0 12px rgba(241, 243, 245, .11), 0 0 18px rgba(20, 24, 29, .16);
  }

  /* old memories stay but get weaker */
  .line.soft {
    opacity: .46;
    filter: blur(1.2px);
    color: rgba(39, 45, 54, .6);
  }

  /* current means it is waking up but not fully found yet */
  .line.current {
    opacity: .22;
    filter: blur(3px);
    color: rgba(26, 34, 43, .42);
  }

  /* bright is the main readable moment */
  .line.bright {
    opacity: .96;
    filter: blur(.1px);
    color: rgba(16, 22, 31, .94);
    background: radial-gradient(ellipse, rgba(224, 232, 240, .3), rgba(190, 205, 218, .13) 48%, transparent 74%);
    border-radius: 999px;
    padding: 5px 9px;
    text-shadow: 0 0 5px rgba(237, 241, 245, .48), 0 0 22px rgba(4, 9, 17, .46);
    animation: memoryIn 1300ms ease both;
  }

  .line.last.bright { color: rgba(27, 30, 35, .95); }

  /* ending uses this to let all the words come back */
  .line.remembered {
    opacity: .62;
    filter: blur(.65px);
    color: rgba(27, 34, 43, .72);
    background: radial-gradient(ellipse, rgba(220, 229, 238, .18), rgba(198, 211, 223, .07) 48%, transparent 72%);
    border-radius: 999px;
    padding: 4px 8px;
  }

  .scene.ending .line.remembered { opacity: .8; filter: blur(.28px); }

  .pulse {
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, -50%) scale(.4);
    border: 1px solid rgba(219, 229, 238, .34);
    background: radial-gradient(circle, rgba(228, 235, 242, .2), rgba(228, 235, 242, 0) 68%);
    box-shadow: 0 0 32px rgba(214, 224, 233, .11);
    z-index: 6;
  }

  .pulse.live { animation: pulseOut 880ms ease-out; }

  /* this is the hint glow and the found glow */
  .marker {
    left: 0;
    top: 0;
    width: 54px;
    height: 54px;
    border-radius: 999px;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, -50%) scale(.7);
    background: radial-gradient(circle, rgba(235, 240, 246, .32), rgba(134, 154, 175, .18) 36%, rgba(221, 228, 236, 0) 74%);
    filter: blur(3px);
    z-index: 5;
    transition: opacity 400ms ease;
  }

  .marker.live { opacity: .88; animation: markerBreathe 2.8s ease-in-out infinite; }
  .marker.found { opacity: .95; animation: markerFound 1.9s ease-out; }

  /* actual fog canvas */
  .mist {
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    filter: blur(12px);
    opacity: .95;
    z-index: 3;
  }

  @keyframes pulseOut {
    0% { opacity: .38; transform: translate(-50%, -50%) scale(.36); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(5.1); }
  }

  @keyframes markerBreathe {
    0%, 100% { transform: translate(-50%, -50%) scale(.72); }
    50% { transform: translate(-50%, -50%) scale(1.02); }
  }

  @keyframes markerFound {
    0% { opacity: .74; transform: translate(-50%, -50%) scale(.5); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(3.2); }
  }

  @keyframes memoryIn { 0% { opacity: .04; filter: blur(9px); letter-spacing: .09em; } 55% { opacity: 1; filter: blur(.05px); } 100% { opacity: .96; filter: blur(.1px); letter-spacing: .02em; } }
`;
document.head.appendChild(style);

// tiny shortcut so the setup is not a mile long
function makeThing(tag, className, text) {
  const thing = document.createElement(tag);
  if (className) thing.className = className;
  if (text) thing.textContent = text;
  return thing;
}

// build the page with js instead of writing a bunch of html
const scene = makeThing("div", "scene");
const road = makeThing("div", "road");
const roadWash = makeThing("div", "road-wash");
const endLight = makeThing("div", "end-light");
const phrasesBox = makeThing("div", "phrases");
const whisper = makeThing("p", "whisper", "click the road. drag where the mist opens.");
const progress = makeThing("div", "progress");
const pulse = makeThing("div", "pulse");
const marker = makeThing("div", "marker");
const mist = makeThing("canvas", "mist");
const progressMarks = [];

road.style.backgroundImage = `url("${ROAD_IMAGE}")`;

const parts = [road, roadWash, endLight, phrasesBox, whisper, progress, pulse, marker, mist];
for (let i = 0; i < parts.length; i += 1) scene.appendChild(parts[i]);
document.body.appendChild(scene);

for (let i = 0; i < storyLines.length; i += 1) {
  const mark = makeThing("span");
  const line = storyLines[i];
  const node = makeThing("p", "line", line.text);

  node.style.left = line.x * 100 + "%";
  node.style.top = line.y * 100 + "%";
  node.style.width = line.w + "px";
  node.style.setProperty("--tilt", line.tilt + "deg");

  if (i === storyLines.length - 1) node.classList.add("last");

  progress.appendChild(mark);
  progressMarks.push(mark);
  phrasesBox.appendChild(node);
  line.node = node;
}

const ctx = mist.getContext("2d");

// viewW/viewH are real screen size.
// mistW/mistH are the smaller canvas size.
let viewW = 0, viewH = 0, mistW = 0, mistH = 0;

// basic play state
// nextStoryIndex is the next phrase the road is waiting for.
let dragging = false, activePointer = null, lastPoint = null;
let nextStoryIndex = 0, currentLine = null;
let idleTimer = null, pulseTimer = null, hintTimer = null;
let lastActionAt = 0, missCount = 0;
let hintIsOn = false, endingShown = false;

// draws one fog oval
function mistOval(x, y, rx, ry, alpha, tone) {
  // I scale a circle instead of drawing an ellipse by hand.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = tone || "rgba(220,226,233," + alpha + ")";
  ctx.fill();
  ctx.restore();
}

// clears fog softly, not like a hard eraser
function softClear(x, y, r, alpha) {
  // black works here because destination-out uses alpha, not the color.
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, "rgba(0,0,0," + alpha + ")");
  grad.addColorStop(0.58, "rgba(0,0,0," + (alpha * 0.34) + ")");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// redraws the fog from scratch
function redoMist() {
  // first make the main fog sheet.
  ctx.clearRect(0, 0, mistW, mistH);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(202,209,218,.72)";
  ctx.fillRect(0, 0, mistW, mistH);

  // big uneven fog patches so it doesn't feel flat.
  mistOval(mistW * 0.5, mistH * 0.14, mistW * 0.23, mistH * 0.12, 0.25);
  mistOval(mistW * 0.18, mistH * 0.34, mistW * 0.14, mistH * 0.11, 0.16);
  mistOval(mistW * 0.8, mistH * 0.32, mistW * 0.18, mistH * 0.13, 0.16);
  mistOval(mistW * 0.5, mistH * 0.56, mistW * 0.24, mistH * 0.12, 0.11);

  // darker top and sides gives the morning photo a night leftover feeling.
  ctx.fillStyle = "rgba(42,49,60,.11)";
  ctx.fillRect(0, 0, mistW, mistH * 0.28);
  ctx.fillStyle = "rgba(36,42,53,.055)";
  ctx.fillRect(0, 0, mistW * 0.18, mistH);
  ctx.fillRect(mistW * 0.82, 0, mistW * 0.18, mistH);

  // a few random fog bits make each reset a little different.
  for (let i = 0; i < 12; i += 1) {
    mistOval(Math.random() * mistW, Math.random() * mistH, 20 + Math.random() * 80, 14 + Math.random() * 44, 0.03 + Math.random() * 0.05);
  }
}

function fitMist() {
  // canvas is lower-res on purpose. CSS blur hides that and saves work.
  const rect = scene.getBoundingClientRect();
  const scale = FOG_SCALE * Math.min(window.devicePixelRatio || 1, 1.08);

  viewW = rect.width;
  viewH = rect.height;
  mistW = Math.max(260, Math.round(viewW * scale));
  mistH = Math.max(180, Math.round(viewH * scale));
  mist.width = mistW;
  mist.height = mistH;
  redoMist();
}

function getSpot(event) {
  // vx/vy are screen coords. x/y are matching canvas coords.
  const rect = scene.getBoundingClientRect();
  const vx = event.clientX - rect.left;
  const vy = event.clientY - rect.top;
  return { vx, vy, x: vx * (mistW / viewW), y: vy * (mistH / viewH) };
}

function pulseSpot(vx, vy) {
  // removing and adding the class restarts the same CSS animation.
  pulse.style.left = vx + "px";
  pulse.style.top = vy + "px";
  pulse.classList.remove("live");
  void pulse.offsetWidth;
  pulse.classList.add("live");

  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => pulse.classList.remove("live"), 900);
}

function smallSay(text, dim) {
  whisper.textContent = text;
  whisper.classList.toggle("dim", !!dim);
}

function placeGlow(line) {
  marker.style.left = line.x * 100 + "%";
  marker.style.top = line.y * 100 + "%";
}

function hideGlow() {
  marker.classList.remove("live", "found");
  hintIsOn = false;
}

function giveHint() {
  if (nextStoryIndex >= storyLines.length) return;

  // hint only points at the next needed phrase, not all of them.
  const line = storyLines[nextStoryIndex];
  placeGlow(line);
  marker.classList.remove("found");
  marker.classList.add("live");
  hintIsOn = true;

  if (nextStoryIndex === 0) {
    smallSay("click the road. drag where the mist opens.", false);
  } else {
    smallSay("follow the faint glow. click through it.", false);
  }
}

function foundGlow(line) {
  // same glow element gets reused so the DOM does not grow.
  placeGlow(line);
  marker.classList.remove("live", "found");
  void marker.offsetWidth;
  marker.classList.add("found");

  clearTimeout(marker.timer);
  marker.timer = setTimeout(() => marker.classList.remove("found"), 1900);
}

function markProgress() {
  // progress marks fill from left to right.
  for (let i = 0; i < progressMarks.length; i += 1) {
    progressMarks[i].classList.toggle("on", i < nextStoryIndex);
  }
  progress.classList.toggle("done", nextStoryIndex >= storyLines.length);
}

// this is the main drag feeling
function rubMist(from, to) {
  // break the drag path into small soft circles.
  // it makes the clearing feel like disturbed mist instead of one hard brush.
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 10));

  ctx.globalCompositeOperation = "destination-out"; // this erases fog

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    const size = 12 + Math.min(11, dist * 0.05);

    softClear(x, y, size, 0.14);
    // extra nearby clears make the edge less perfect.
    softClear(x + (Math.random() * 8 - 4), y + (Math.random() * 8 - 4), size * 0.82, 0.1);
    if (Math.random() < 0.55) softClear(x + (Math.random() * 12 - 6), y + (Math.random() * 10 - 5), size * 0.58, 0.07);
  }

  ctx.globalCompositeOperation = "source-over";

  if (Math.random() < 0.6) {
    // a tiny darker smear trails behind sometimes.
    mistOval(to.x + (Math.random() * 16 - 8), to.y + (Math.random() * 12 - 6), 8 + Math.random() * 18, 6 + Math.random() * 10, 0.028, "rgba(92,104,118,.038)");
  }
}

function quietLine(line) {
  // after a while the readable phrase becomes residue.
  if (!line || endingShown) return;
  line.node.classList.remove("bright", "current");
  line.node.classList.add("soft");
}

function showLine(line) {
  if (!line) return;

  // only one phrase should feel like it is really arriving.
  clearTimeout(line.timer);
  line.node.classList.remove("remembered", "soft", "current");
  line.node.classList.add("bright");

  if (!line.seen) {
    // first time finding it gets the pretty little reward glow.
    line.seen = true;
    foundGlow(line);
  }

  line.timer = setTimeout(() => quietLine(line), SOFTEN_MS);
}

function endingBit() {
  if (endingShown) return;

  // the end makes the road remember everything for one moment.
  endingShown = true;
  scene.classList.add("ending");
  smallSay("for a second, it all comes back.", false);

  ctx.globalCompositeOperation = "destination-out";
  // open up the middle of the mist so the final memory breathes.
  softClear(mistW * 0.5, mistH * 0.28, Math.min(mistW, mistH) * 0.34, 0.16);
  softClear(mistW * 0.5, mistH * 0.54, Math.min(mistW, mistH) * 0.26, 0.1);
  ctx.globalCompositeOperation = "source-over";

  // then add two dark wisps so it is not just a happy glow.
  mistOval(mistW * 0.18, mistH * 0.32, mistW * 0.18, mistH * 0.025, 0.05, "rgba(13,18,25,.05)");
  mistOval(mistW * 0.82, mistH * 0.22, mistW * 0.2, mistH * 0.03, 0.045, "rgba(12,16,23,.045)");

  for (let i = 0; i < storyLines.length; i += 1) {
    // stop all the fade timers and force the whole story to stay visible.
    const line = storyLines[i];
    clearTimeout(line.timer);
    line.node.classList.remove("soft", "current", "bright");
    line.node.classList.add("remembered");
  }

  storyLines[storyLines.length - 1].node.classList.add("bright");
}

function howFar(line, vx, vy) {
  // distance from click to the hidden phrase spot.
  const px = line.x * viewW;
  const py = line.y * viewH;
  return Math.hypot(vx - px, vy - py);
}

// checks if the click is close enough to the next memory
function tryStory(vx, vy) {
  if (nextStoryIndex >= storyLines.length) return false;

  const nextLine = storyLines[nextStoryIndex];

  // hints make the search a bit more forgiving.
  const kindness = hintIsOn ? 95 : 45;
  if (howFar(nextLine, vx, vy) > nextLine.reach + kindness) return false;

  if (currentLine) {
    clearTimeout(currentLine.timer);
    quietLine(currentLine);
  }

  currentLine = nextLine;
  nextStoryIndex += 1;
  missCount = 0;

  // once the phrase is found, hide the guide and fill progress.
  hideGlow();
  markProgress();

  currentLine.node.classList.remove("soft");
  currentLine.node.classList.add("current");
  showLine(currentLine);
  smallSay("keep going. it is still here.", true);

  if (nextStoryIndex >= storyLines.length) endingBit();
  return true;
}

function checkCurrent(vx, vy) {
  // dragging near the phrase keeps it readable longer.
  if (!currentLine) return;
  if (howFar(currentLine, vx, vy) < currentLine.reach) {
    showLine(currentLine);
    if (nextStoryIndex >= storyLines.length) endingBit();
  }
}

// fog slowly comes back when nobody is touching it
function mistBack() {
  if (dragging || endingShown || !mistW || !mistH) return;

  // quietFor decides how much fog gets to creep back in.
  const quietFor = Date.now() - lastActionAt;
  if (quietFor < 120) return;

  const alpha = quietFor > 2400 ? 0.06 : 0.03;
  const x = Math.random() * mistW;
  const y = Math.random() * mistH;

  // as more phrases are found, the fog gets more wrong.
  const badFog = nextStoryIndex / storyLines.length;
  const tone = quietFor > 1800 && Math.random() < 0.35
    ? "rgba(122,132,145," + (alpha * 0.65) + ")"
    : "rgba(222,227,232," + alpha + ")";

  mistOval(x, y, 18 + Math.random() * 62, 14 + Math.random() * 36, alpha, tone);

  if (nextStoryIndex > 1 && Math.random() < 0.08 + badFog * 0.16) {
    // these are the black wisps corrupting the normal white mist.
    const black = 0.014 + badFog * 0.03;
    mistOval(x + Math.random() * 70 - 35, y + Math.random() * 44 - 22, 38 + Math.random() * 100, 5 + Math.random() * 15, black, "rgba(12,17,24," + black + ")");
  }

  if (quietFor > 2200) {
    // a very light sheet helps the fog heal itself.
    ctx.fillStyle = "rgba(214,219,225,.018)";
    ctx.fillRect(0, 0, mistW, mistH);
  }
}

// keeps track of hints and the auto reset
function markWake() {
  // every real action restarts the timers.
  lastActionAt = Date.now();
  clearTimeout(idleTimer);
  clearTimeout(hintTimer);

  idleTimer = setTimeout(restart, IDLE_RESET_MS);
  hintTimer = setTimeout(() => {
    // hints only show after waiting, not instantly.
    if (!dragging) giveHint();
  }, HINT_DELAY_MS);
}

function restart() {
  // this is used by the idle reset and by pressing r.
  clearTimeout(hintTimer);

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
  hideGlow();
  redoMist();

  // put the small cue and progress back to the start.
  smallSay("click the road. drag where the mist opens.", false);
  markProgress();

  for (let i = 0; i < storyLines.length; i += 1) {
    // remove all the reveal classes from every phrase.
    const line = storyLines[i];
    clearTimeout(line.timer);
    line.seen = false;
    line.node.classList.remove("bright", "soft", "current", "remembered");
  }
}

// mouse and finger stuff starts here
function pressDown(event) {
  if (activePointer !== null) return;

  // pointer capture keeps the drag working even if the finger slides fast.
  activePointer = event.pointerId;
  dragging = true;
  mist.setPointerCapture(event.pointerId);

  const spot = getSpot(event);
  lastPoint = spot;

  // one click does a pulse, clears a little fog, and checks story progress.
  pulseSpot(spot.vx, spot.vy);
  rubMist(spot, { x: spot.x + 1, y: spot.y + 1 });
  markWake();

  if (!tryStory(spot.vx, spot.vy)) {
    // after a few misses, the road gives a quiet hint.
    missCount += 1;
    if (missCount > 2) giveHint();
  }

  checkCurrent(spot.vx, spot.vy);
}

function dragAround(event) {
  if (!dragging || event.pointerId !== activePointer) return;

  const spot = getSpot(event);
  const prev = lastPoint || spot;
  const dist = Math.hypot(spot.vx - prev.vx, spot.vy - prev.vy);

  // tiny movements are ignored so the canvas is not redrawing too much.
  if (dist < 1.5) return;

  rubMist(prev, spot);
  checkCurrent(spot.vx, spot.vy);
  lastPoint = spot;
  markWake();
}

function letGo(event) {
  if (event.pointerId !== activePointer) return;

  // release capture so the next click can start fresh.
  if (mist.hasPointerCapture(event.pointerId)) {
    mist.releasePointerCapture(event.pointerId);
  }

  dragging = false;
  lastPoint = null;
  activePointer = null;
}

// start the piece
fitMist();
markProgress();
markWake();

window.addEventListener("resize", fitMist);
mist.addEventListener("pointerdown", pressDown);
mist.addEventListener("pointermove", dragAround);
mist.addEventListener("pointerup", letGo);
mist.addEventListener("pointercancel", letGo);
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") {
    restart();
    markWake();
  }
});

// slow fog timer. this is cheaper than a full animation loop.
setInterval(mistBack, 240);
