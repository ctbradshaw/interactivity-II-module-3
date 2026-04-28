// The Road That Remembers Wrong
// move through the fog. no clicking needed.
// the road gives the lines back one at a time.

const PHOTO = "../AdobeStock_473031827.jpeg";

const poem = [
  { text: "you were already on the road when i found it",           x:.50, y:.84, w:230, tilt:-2 },
  { text: "the pale line kept slipping under your shoes",           x:.76, y:.71, w:230, tilt: 4 },
  { text: "i missed the turn because i thought you knew it",        x:.21, y:.72, w:230, tilt:-6 },
  { text: "the trees held your coat longer than the light did",     x:.16, y:.52, w:225, tilt:-9 },
  { text: "i kept walking after the gravel should have stopped me", x:.73, y:.49, w:240, tilt: 5 },
  { text: "by then your face was only a colder brightness",         x:.43, y:.43, w:230, tilt:-3 },
  { text: "i called once and the fog answered first",               x:.65, y:.34, w:210, tilt: 2 },
  { text: "then only your steps stayed warm on the road",           x:.29, y:.29, w:220, tilt:-5 },
  { text: "i followed them until the sound gave out",               x:.61, y:.21, w:210, tilt: 2 },
  { text: "when you turned back it was only morning in the mist",   x:.50, y:.15, w:330, tilt: 0 }
];

const ghostWords = ["wait", "wrong road", "still", "not yet", "almost", "gone", "never", "cold"];

const CSS = `
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #020306;
    cursor: none;
  }

  body {
    font-family: Georgia, "Times New Roman", serif;
  }

  #scene {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    background: #020306;
  }

  #photo {
    position: absolute;
    inset: -7%;
    background: url("${PHOTO}") center 56% / cover no-repeat;
    transform-origin: 50% 68%;
    transform: scale(2.34);
    filter: saturate(.46) brightness(.43) contrast(1.22);
    transition: transform 3.2s cubic-bezier(.2,.48,.22,1), filter 3.4s ease;
    z-index: 0;
  }

  #photo::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 48%, rgba(235,242,248,.08), transparent 24%, rgba(1,2,5,.34) 62%, rgba(1,2,5,.94)),
      linear-gradient(90deg, rgba(1,2,5,.92), transparent 27%, transparent 73%, rgba(1,2,5,.92)),
      linear-gradient(180deg, rgba(1,2,5,.56), transparent 38%, rgba(1,2,5,.34));
  }

  #scene.done #photo::after {
    background:
      radial-gradient(ellipse at 50% 45%, rgba(238,246,252,.16), transparent 25%, rgba(1,2,5,.28) 62%, rgba(1,2,5,.96)),
      linear-gradient(90deg, rgba(1,2,5,.96), transparent 28%, transparent 72%, rgba(1,2,5,.96)),
      linear-gradient(180deg, rgba(1,2,5,.64), transparent 38%, rgba(1,2,5,.42));
  }

  #figureGlow {
    position: absolute;
    left: 50%;
    top: 32%;
    width: min(38vw, 520px);
    height: min(42vh, 420px);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230,238,246,.20), rgba(184,199,214,.08) 38%, transparent 72%);
    filter: blur(30px);
    opacity: .035;
    z-index: 1;
    pointer-events: none;
    transition: opacity 2s ease;
  }

  #fog {
    position: absolute;
    inset: -34px;
    width: calc(100% + 68px);
    height: calc(100% + 68px);
    filter: blur(16px);
    z-index: 2;
    pointer-events: none;
  }

  #over {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    pointer-events: none;
  }

  #words {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
  }

  .phrase {
    position: absolute;
    margin: 0;
    max-width: var(--w);
    color: rgba(230,238,246,0);
    opacity: 0;
    filter: blur(9px);
    font-size: clamp(12px, 1.42vw, 18px);
    line-height: 1.16;
    letter-spacing: .025em;
    text-align: center;
    transform: translate(-50%, -50%) rotate(var(--r));
    text-shadow: 0 0 34px rgba(0,0,0,.9);
    transition: opacity 1300ms ease, color 1200ms ease, filter 1300ms ease;
  }

  .phrase.warm {
    opacity: .18;
    color: rgba(222,230,239,.28);
    filter: blur(4px);
  }

  .phrase.alive {
    opacity: 1;
    color: rgba(244,248,252,.98);
    filter: blur(.08px);
    text-shadow:
      0 0 8px rgba(255,225,190,.72),
      0 0 24px rgba(175,50,28,.48),
      0 0 64px rgba(0,0,0,.95);
  }

  .phrase.old {
    opacity: .34;
    color: rgba(206,218,230,.42);
    filter: blur(1.7px);
  }

  .phrase.remembered,
  #scene.done .phrase.remembered {
    opacity: .74;
    color: rgba(246,250,253,.82);
    filter: blur(.45px);
    text-shadow:
      0 0 9px rgba(255,255,255,.32),
      0 0 35px rgba(0,0,0,.95);
  }

  #hint {
    position: absolute;
    left: 50%;
    bottom: 15px;
    transform: translateX(-50%);
    z-index: 8;
    color: rgba(222,232,242,.42);
    font-size: 10px;
    letter-spacing: .14em;
    text-transform: lowercase;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 900ms ease, color 900ms ease;
    text-shadow: 0 0 14px rgba(0,0,0,.8);
  }

  #hint.hide {
    opacity: 0;
  }

  .redFlash,
  .darkFlash,
  .whiteFlash,
  .wound {
    position: absolute;
    pointer-events: none;
    opacity: 0;
  }

  .redFlash,
  .darkFlash,
  .whiteFlash {
    inset: 0;
  }

  .redFlash {
    z-index: 11;
    background:
      radial-gradient(circle at var(--x) var(--y), rgba(110,14,8,var(--redHit,.48)), transparent 34%),
      rgba(58,4,3,var(--redBack,.16));
    mix-blend-mode: multiply;
  }

  .darkFlash {
    z-index: 10;
    background: rgba(0,0,0,var(--darkHit,.68));
  }

  .whiteFlash {
    z-index: 12;
    background: rgba(235,242,248,var(--whiteHit,.16));
  }

  .redFlash.live { animation: redHit 900ms ease forwards; }
  .darkFlash.live { animation: darkHold 2400ms ease forwards; }
  .whiteFlash.live { animation: whiteBlink 650ms ease forwards; }

  @keyframes redHit {
    0% { opacity: 0; }
    18% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes whiteBlink {
    0% { opacity: 0; }
    15% { opacity: .9; }
    100% { opacity: 0; }
  }

  @keyframes darkHold {
    0% { opacity: .95; }
    24% { opacity: .72; }
    100% { opacity: 0; }
  }

  .wound {
    left: var(--x);
    top: var(--y);
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    z-index: 9;
    transform: translate(-50%, -50%) scale(.1);
    background:
      radial-gradient(circle,
        rgba(255,218,176,.62) 0%,
        rgba(146,24,12,.50) 24%,
        rgba(70,7,5,.26) 48%,
        transparent 74%);
    filter: blur(6px);
  }

  .wound.live { animation: woundOpen var(--woundTime,2400ms) ease forwards; }

  @keyframes woundOpen {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(.1); }
    16% { opacity: .86; transform: translate(-50%, -50%) scale(.9); }
    54% { opacity: .56; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(2.75); }
  }

  .ghost {
    position: absolute;
    color: rgba(210,220,232,.12);
    font-size: clamp(9px, .92vw, 12px);
    font-style: italic;
    letter-spacing: .07em;
    z-index: 5;
    transform: translate(-50%, -50%) rotate(var(--r));
    animation: ghostAway 8500ms ease forwards;
  }

  @keyframes ghostAway {
    0% { opacity: 0; filter: blur(5px); }
    22% { opacity: 1; filter: blur(.5px); }
    100% { opacity: 0; filter: blur(8px); }
  }

  @keyframes shake {
    0% { transform: translate(0,0); }
    18% { transform: translate(-2px,1px); }
    35% { transform: translate(2px,-1px); }
    58% { transform: translate(-1px,1px); }
    100% { transform: translate(0,0); }
  }
`;

document.head.appendChild(Object.assign(document.createElement("style"), { textContent: CSS }));

// build DOM
const scene = document.createElement("div");
scene.id = "scene";

const photo = document.createElement("div");
photo.id = "photo";

const figureGlow = document.createElement("div");
figureGlow.id = "figureGlow";

const fog = document.createElement("canvas");
fog.id = "fog";

const over = document.createElement("canvas");
over.id = "over";

const words = document.createElement("div");
words.id = "words";

const hint = document.createElement("p");
hint.id = "hint";
hint.textContent = "move through the mist";

const red = document.createElement("div");
red.className = "redFlash";
const white = document.createElement("div");
white.className = "whiteFlash";
const dark = document.createElement("div");
dark.className = "darkFlash";
const wound = document.createElement("div");
wound.className = "wound";

scene.append(photo, figureGlow, fog, over, words, hint, dark, red, white, wound);
document.body.appendChild(scene);

const ctx = fog.getContext("2d");
const octx = over.getContext("2d");

let W = 0, H = 0;
let fW = 0, fH = 0;

let current = 0;
let found = 0;
let locked = false;
let done = false;

let prev = null;
let footDist = 0;
let lastCreep = 0;
let lastGhost = 0;

const wakes = [];
const cracks = [];
const steps = [];

const rain = Array.from({ length: 58 }, () => ({
  x: Math.random(),
  y: Math.random(),
  spd: .0007 + Math.random() * .0014,
  len: .015 + Math.random() * .035
}));

const fogDrift = [
  { x:.26, y:.38, p:0 },
  { x:.74, y:.29, p:1.5 },
  { x:.50, y:.58, p:2.4 },
  { x:.17, y:.66, p:4.0 },
  { x:.83, y:.54, p:5.2 }
];

poem.forEach((p) => {
  const el = document.createElement("p");
  el.className = "phrase";
  el.textContent = p.text;
  el.style.left = p.x * 100 + "%";
  el.style.top = p.y * 100 + "%";
  el.style.setProperty("--w", p.w + "px");
  el.style.setProperty("--r", p.tilt + "deg");

  p.el = el;
  p.heat = 0;
  p.out = false;

  words.appendChild(el);
});

function resize() {
  W = scene.offsetWidth;
  H = scene.offsetHeight;

  // larger than the viewport to kill the boxy blur edge
  fW = Math.round((W + 80) * .43);
  fH = Math.round((H + 80) * .43);

  fog.width = fW;
  fog.height = fH;
  over.width = W;
  over.height = H;

  rebuildFog();
}

function oval(x, y, rx, ry, alpha, dark) {
  ctx.save();
  ctx.translate(x * fW, y * fH);
  ctx.scale(rx * fW, ry * fH);

  const g = ctx.createRadialGradient(0,0,0,0,0,1);
  g.addColorStop(0, dark ? `rgba(4,7,14,${alpha})` : `rgba(190,205,219,${alpha})`);
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function rebuildFog() {
  ctx.clearRect(0, 0, fW, fH);
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "rgba(174,190,207,.99)";
  ctx.fillRect(0, 0, fW, fH);

  // uneven fog beds
  oval(.50, .50, .92, .74, .16);
  oval(.50, .12, .32, .16, .30);
  oval(.20, .38, .22, .13, .24);
  oval(.80, .31, .24, .14, .24);
  oval(.50, .58, .32, .15, .20);
  oval(.15, .62, .18, .12, .19);
  oval(.88, .52, .19, .11, .18);

  // dirty irregularity
  for (let i = 0; i < 22; i++) {
    oval(Math.random(), Math.random(), .035 + Math.random() * .13, .015 + Math.random() * .06, .02 + Math.random() * .05);
  }

  ctx.fillStyle = "rgba(5,8,18,.30)";
  ctx.fillRect(0, 0, fW, fH * .24);
}

function toFog(vx, vy) {
  return {
    x: (vx + 40) * (fW / (W + 80)),
    y: (vy + 40) * (fH / (H + 80))
  };
}

function point(e) {
  const r = scene.getBoundingClientRect();
  const vx = e.clientX - r.left;
  const vy = e.clientY - r.top;
  const f = toFog(vx, vy);

  return { vx, vy, x: f.x, y: f.y };
}

function clearSmoke(x, y, r, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(.42, `rgba(0,0,0,${a * .24})`);
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function addWake(x, y, dx, dy) {
  wakes.push({
    x, y,
    r: 22 + Math.random() * 13,
    dx: dx * .012 + (Math.random() - .5) * .18,
    dy: dy * .012 + (Math.random() - .5) * .14,
    life: 1
  });

  if (wakes.length > 220) wakes.shift();
}

function smokeTrail(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 7));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    addWake(a.x + dx * t, a.y + dy * t, dx, dy);
  }
}

function drawFog(now) {
  // redraw instead of permanently erasing. this keeps it smoky.
  const ratio = found / poem.length;
  ctx.clearRect(0,0,fW,fH);
  ctx.globalCompositeOperation = "source-over";

  const base = done ? .62 : (.98 - ratio * .18);
  const breathing = Math.sin(now / 5600) * .022;

  ctx.fillStyle = `rgba(176,191,207,${base + breathing})`;
  ctx.fillRect(0,0,fW,fH);

  oval(.50, .50, .9, .72, .14);
  oval(.50, .12, .32, .16, .27);
  oval(.20, .38, .22, .13, .20);
  oval(.80, .31, .24, .14, .20);
  oval(.50, .58, .32, .15, .15);

  fogDrift.forEach(n => {
    const x = n.x + Math.sin(now / 8500 + n.p) * .075;
    const y = n.y + Math.cos(now / 11000 + n.p) * .052;
    oval(x, y, .07, .032, .06);
  });

  ctx.fillStyle = "rgba(2,4,10,.30)";
  ctx.fillRect(0,0,fW,fH*.22);

  // wakes thin the fog but don't destroy it
  ctx.globalCompositeOperation = "destination-out";

  for (const w of wakes) {
    clearSmoke(w.x, w.y, w.r, .095 * w.life + .03);
    clearSmoke(w.x + w.dx * 8, w.y + w.dy * 6, w.r * .65, .04 * w.life);
  }

  if (done) {
    clearSmoke(fW*.5, fH*.30, Math.min(fW,fH)*.38, .22);
    clearSmoke(fW*.5, fH*.60, Math.min(fW,fH)*.30, .14);
  }

  ctx.globalCompositeOperation = "source-over";

  // smoke curls back over the cleared trails
  for (const w of wakes) {
    const ax = w.x - w.dx * 9;
    const ay = w.y - w.dy * 7;
    const bx = w.x + w.dx * 6;
    const by = w.y + w.dy * 5;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(Math.atan2(w.dy, w.dx));
    ctx.scale(w.r * 1.05, w.r * .30);

    const g = ctx.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0, `rgba(224,233,240,${.05 * w.life})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0,0,1,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.atan2(w.dy, w.dx) + .3);
    ctx.scale(w.r * .70, w.r * .20);
    ctx.fillStyle = `rgba(12,18,28,${.026 * w.life})`;
    ctx.beginPath();
    ctx.arc(0,0,1,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    w.x += w.dx;
    w.y += w.dy;
    w.life -= .014;
  }

  for (let i = wakes.length - 1; i >= 0; i--) {
    if (wakes[i].life <= 0) wakes.splice(i, 1);
  }
}

function drawOverlay(now) {
  octx.clearRect(0,0,W,H);

  const rainA = .035 + found / poem.length * .065;
  octx.strokeStyle = `rgba(145,164,184,${rainA})`;
  octx.lineWidth = .55;

  for (const d of rain) {
    d.y += d.spd;
    if (d.y > 1.08) {
      d.y = -.05;
      d.x = Math.random();
    }

    octx.beginPath();
    octx.moveTo(d.x * W, d.y * H);
    octx.lineTo(d.x * W - 5, d.y * H + d.len * H);
    octx.stroke();
  }

  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i];
    const age = now - s.born;
    const t = age / 4100;
    if (t >= 1) {
      steps.splice(i, 1);
      continue;
    }

    const a = (1 - t) * .18;
    octx.fillStyle = `rgba(230,238,246,${a})`;
    octx.shadowColor = `rgba(230,238,246,${a})`;
    octx.shadowBlur = 10;
    octx.beginPath();
    octx.arc(s.x, s.y, 2 + t * 11, 0, Math.PI * 2);
    octx.fill();
    octx.shadowBlur = 0;
  }

  octx.lineWidth = .85;
  for (const c of cracks) {
    c.p = Math.min(1, c.p + c.spd);

    octx.strokeStyle = "rgba(150,118,104,.31)";
    octx.beginPath();
    octx.moveTo(c.x1, c.y1);
    octx.lineTo(c.x1 + (c.x2 - c.x1) * c.p, c.y1 + (c.y2 - c.y1) * c.p);
    octx.stroke();
  }
}

function activeLine() {
  return poem[current];
}

function addHeat(vx, vy, amount) {
  if (locked || done) return;

  const p = activeLine();
  if (!p) return;

  const d = Math.hypot(vx - p.x * W, vy - p.y * H);
  const range = 180;

  if (d > range) {
    if (found > 1 && Math.random() < .012) ghost(vx, vy);
    return;
  }

  const near = 1 - d / range;
  p.heat += amount * (.25 + near * near * 1.7);

  if (p.heat > 60) p.el.classList.add("warm");

  const need = current === poem.length - 1 ? 360 : 190;
  if (p.heat >= need) reveal(p);
}

function reveal(p) {
  if (p.out || locked) return;

  locked = true;
  p.out = true;
  found++;

  hint.classList.add("hide");

  // old lines become ghosts
  poem.forEach(line => {
    if (line.out && line !== p) {
      line.el.classList.remove("alive", "warm");
      line.el.classList.add("old");
    }
  });

  p.el.classList.remove("warm", "old");
  p.el.classList.add("alive");

  bigReveal(p);
  updatePhoto();

  current++;

  if (current >= poem.length) {
    setTimeout(finish, 2700);
    return;
  }

  setTimeout(() => {
    locked = false;
    hint.textContent = "move toward what is still hidden";
    hint.classList.remove("hide");
  }, 2800);
}

function updatePhoto() {
  const ratio = found / poem.length;
  const zoom = 2.34 - ratio * 1.32;
  const sat = Math.max(.1, .46 - ratio * .34);
  const bright = .43 + ratio * .24;

  photo.style.transform = `scale(${zoom.toFixed(2)})`;
  photo.style.filter = `saturate(${sat.toFixed(2)}) brightness(${bright.toFixed(2)}) contrast(1.18)`;
  figureGlow.style.opacity = .025 + ratio * .13;
}

function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function bigReveal(p) {
  const mood = found / poem.length;
  const hit = .55 + mood * .45;

  scene.style.animation = "none";
  void scene.offsetWidth;
  scene.style.animation = `shake ${360 + mood * 150}ms ease`;

  const x = p.x * 100 + "%";
  const y = p.y * 100 + "%";

  red.style.setProperty("--x", x);
  red.style.setProperty("--y", y);
  red.style.setProperty("--redHit", .30 + mood * .32);
  red.style.setProperty("--redBack", .10 + mood * .15);
  dark.style.setProperty("--darkHit", .46 + mood * .32);
  white.style.setProperty("--whiteHit", .10 + mood * .13);
  wound.style.setProperty("--x", x);
  wound.style.setProperty("--y", y);
  wound.style.setProperty("--s", (160 + hit * 105 + Math.random() * 60) + "px");
  wound.style.setProperty("--woundTime", (2100 + mood * 700) + "ms");

  replay(red, "live");
  replay(white, "live");
  replay(dark, "live");
  replay(wound, "live");

  addCrack(p.x * W, p.y * H);

  // phrase opens a temporary hole in the smoke
  const f = toFog(p.x * W, p.y * H);
  wakes.push({ x:f.x, y:f.y, r:72, dx:0, dy:-.2, life:1.2 });
  wakes.push({ x:f.x, y:f.y, r:90, dx:.2, dy:.1, life:1.1 });
}

function addCrack(vx, vy) {
  const mood = found / poem.length;
  const count = 4 + Math.floor(mood * 5) + Math.floor(Math.random() * 2);

  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 / count) * i + (Math.random() - .5) * .85;
    const len = 42 + mood * 80 + Math.random() * 95;

    cracks.push({
      x1: vx,
      y1: vy,
      x2: vx + Math.cos(a) * len,
      y2: vy + Math.sin(a) * len,
      p: 0,
      spd: .015 + Math.random() * .016
    });
  }

  while (cracks.length > 55) cracks.shift();
}

function finish() {
  done = true;
  locked = false;
  scene.classList.add("done");

  hint.textContent = "for a second, it all comes back";
  hint.classList.remove("hide");

  for (let i = 0; i < poem.length; i++) {
    const p = poem[i];
    p.el.classList.remove("warm", "old", "alive");
    p.el.classList.add("remembered");
  }

  photo.style.transform = "scale(1.01)";
  photo.style.filter = "saturate(.08) brightness(.88) contrast(1.08)";
  figureGlow.style.opacity = .50;
}

function ghost(vx, vy) {
  const word = ghostWords[Math.floor(Math.random() * ghostWords.length)];

  const g = document.createElement("span");
  g.className = "ghost";
  g.textContent = word;
  g.style.left = vx + (Math.random() * 100 - 50) + "px";
  g.style.top = vy + (Math.random() * 70 - 35) + "px";
  g.style.setProperty("--r", (Math.random() * 20 - 10) + "deg");

  words.appendChild(g);
  setTimeout(() => g.remove(), 8600);
}

function step(vx, vy) {
  steps.push({ x: vx, y: vy, born: performance.now() });
  if (steps.length > 70) steps.shift();
}

function move(e) {
  if (locked) return;

  const pt = point(e);

  if (!prev) {
    prev = pt;
    return;
  }

  const d = Math.hypot(pt.vx - prev.vx, pt.vy - prev.vy);
  if (d < 1.1) return;

  smokeTrail(prev, pt);
  addHeat(pt.vx, pt.vy, d * .42);

  footDist += d;
  if (footDist > 52) {
    step(pt.vx, pt.vy);
    footDist = 0;
  }

  prev = pt;
}

function resetPrev() {
  prev = null;
}

function maybeGhost(now) {
  if (found < 2 || locked || done) return;
  if (now - lastGhost < 19000 + Math.random() * 17000) return;

  lastGhost = now;
  ghost(Math.random() * W, Math.random() * H);
}

function fogCreep(now) {
  if (locked || done) return;
  if (now - lastCreep < 190) return;

  lastCreep = now;

  // not too much, just keeps the road alive
  if (Math.random() < .5) {
    wakes.push({
      x: Math.random() * fW,
      y: Math.random() * fH,
      r: 18 + Math.random() * 44,
      dx: Math.random() * .18 - .09,
      dy: Math.random() * .14 - .07,
      life: .45 + Math.random() * .45
    });

    if (wakes.length > 220) wakes.shift();
  }
}

function loop(now) {
  drawFog(now);
  drawOverlay(now);
  fogCreep(now);
  maybeGhost(now);
  requestAnimationFrame(loop);
}

resize();
window.addEventListener("resize", resize);
scene.addEventListener("pointermove", move);
scene.addEventListener("pointerleave", resetPrev);
scene.addEventListener("pointercancel", resetPrev);
requestAnimationFrame(loop);
