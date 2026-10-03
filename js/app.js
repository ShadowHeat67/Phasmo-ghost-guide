(() => {
"use strict";

const EVIDENCE = {
  emf:       { label: "EMF 5",        short: "EMF" },
  uv:        { label: "Ultraviolet",  short: "UV" },
  writing:   { label: "Ghost Writing", short: "Writing" },
  freezing:  { label: "Freezing",     short: "Freezing" },
  dots:      { label: "D.O.T.S",      short: "DOTS" },
  orbs:      { label: "Ghost Orbs",   short: "Orbs" },
  spiritbox: { label: "Spirit Box",   short: "Spirit Box" }
};
const EV_KEYS = Object.keys(EVIDENCE);
const NORMAL = 1.7, LOS_MULT = 1.65, RAIL_MAX = 4;
const G = window.GHOSTS;
const byId = Object.fromEntries(G.map(g => [g.id, g]));

/* ---------- state ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem("pgg:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("pgg:" + k, JSON.stringify(v)); } catch {} }
};
const state = {
  ev: Object.fromEntries(EV_KEYS.map(k => [k, 0])),
  evCount: store.get("evCount", 3),
  speed: new Set(), los: null, sanity: new Set(), normalBlink: false, male: false,
  marks: {}, query: "", hideOut: store.get("hideOut", false),
  mod: store.get("mod", 1), surface: store.get("surface", "wood"), volume: store.get("volume", 0.6)
};

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = v => (Math.round(v * 100) / 100).toString().replace(/^(\d)$/, "$1.0");
const speedsOf = g => g.speeds.map(s => s.v);
const minS = g => Math.min(...speedsOf(g));
const maxS = g => Math.max(...speedsOf(g));
const hasLos = g => g.los === true || g.los === "partial";
const stepInterval = v => Math.max(0.12, 1 / (v * state.mod) - 0.075);
const spm = v => Math.round(60 / stepInterval(v));
/* Max speed reachable with LOS. Jinn, Raiju and Dayan build LOS from 1.7; The Twins build like 1.7 then add 0.2. */
function losReach(g) {
  if (g.id === "twins") return NORMAL * LOS_MULT + 0.2;
  if (["jinn", "raiju", "dayan"].includes(g.id)) return NORMAL * LOS_MULT;
  return maxS(g) * LOS_MULT;
}

/* ---------- filtering ---------- */
function evidenceOk(g) {
  const n = state.evCount;
  const found = EV_KEYS.filter(k => state.ev[k] === 1);
  const out = EV_KEYS.filter(k => state.ev[k] === -1);
  const has = k => g.evidence.includes(k);
  for (const f of found) if (!has(f) && !(g.fakeOrbs && f === "orbs")) return false;
  const real = found.filter(f => !(g.fakeOrbs && f === "orbs"));
  if (real.length > n) return false;
  if (g.fakeOrbs && out.includes("orbs")) return false;
  const outMine = out.filter(has);
  if (n === 3 && outMine.length) return false;
  if (outMine.length > 3 - n) return false;
  if (g.guaranteed && n >= 1) {
    if (out.includes(g.guaranteed)) return false;
    if (real.length === n && !real.includes(g.guaranteed)) return false;
  }
  return true;
}
function speedOk(g) {
  if (!state.speed.size || g.fakeOrbs) return true;
  const lo = minS(g), hi = maxS(g);
  const normal = !g.rarelyNormalSpeed && (speedsOf(g).includes(NORMAL) || (g.range && lo < NORMAL && hi > NORMAL));
  return (state.speed.has("slow") && lo < NORMAL) || (state.speed.has("normal") && normal) || (state.speed.has("fast") && hi > NORMAL);
}
function losOk(g) {
  if (state.los === null || g.fakeOrbs) return true;
  return state.los ? hasLos(g) : !hasLos(g) || g.los === "partial";
}
function sanityOk(g) {
  if (!state.sanity.size || g.fakeOrbs) return true;
  const { min, max } = g.sanity;
  return (state.sanity.has("late") && min < 40) || (state.sanity.has("normal") && min <= 50 && max >= 40) ||
         (state.sanity.has("early") && max > 50) || (state.sanity.has("very") && max > 75);
}
function queryOk(g) {
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const hay = [g.name, ...(g.tells || []), ...(g.extra || []), window.VIDEO_NAMES[g.id] || ""].join(" ").toLowerCase();
  return q.split(/\s+/).every(w => hay.includes(w));
}
const traitOut = g => (state.normalBlink && !!g.abnormalBlink) || (state.male && !!g.female);
const possible = g => evidenceOk(g) && speedOk(g) && losOk(g) && sanityOk(g) && !traitOut(g) && state.marks[g.id] !== "out";

/* ---------- audio engine ---------- */
const Audio = (() => {
  let ctx, master, noise, timer, play = null, raf;
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = state.volume; master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  }
  const SURF = {
    wood:   { f: 750,  q: 1.1, thump: 1.0, n: 0.55 },
    carpet: { f: 320,  q: 0.7, thump: 0.75, n: 0.3 },
    tile:   { f: 2600, q: 1.6, thump: 0.55, n: 0.7 },
    gravel: { f: 1500, q: 0.4, thump: 0.5, n: 1.0 }
  };
  let foot = 0;
  function step(t, quiet) {
    foot ^= 1;
    if (state.surface === "click") {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = foot ? 1200 : 900; o.connect(g); g.connect(master);
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o.start(t); o.stop(t + 0.06); return;
    }
    const s = SURF[state.surface] || SURF.wood, vol = quiet ? 0.28 : 1, jit = 1 + (Math.random() - 0.5) * 0.08;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const out = pan || master;
    if (pan) { pan.pan.value = foot ? 0.18 : -0.18; pan.connect(master); }
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(115 * jit, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.9 * s.thump * vol, t + 0.006);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.22);
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = noise; src.playbackRate.value = jit;
    bp.type = "bandpass"; bp.frequency.value = (quiet ? s.f * 0.6 : s.f) * jit; bp.Q.value = s.q;
    ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.6 * s.n * vol, t + 0.004);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    src.connect(bp); bp.connect(ng); ng.connect(out); src.start(t); src.stop(t + 0.15);
  }
  function speedAt(p, t) {
    let acc = 0;
    for (const seg of p.segs) {
      if (t < acc + seg.d) return seg.a === null ? null : seg.a + (seg.b - seg.a) * ((t - acc) / seg.d);
      acc += seg.d;
    }
    return undefined;
  }
  function tick() {
    if (!play) return;
    const now = ctx.currentTime;
    while (play.next < now + 0.12) {
      const t = play.next - play.t0;
      const v = speedAt(play.p, t);
      if (v === undefined) { const end = play.next; play.ending = end; break; }
      if (v === null) { play.next += 0.1; continue; }
      step(play.next, play.p.quiet);
      const at = play.next;
      setTimeout(() => pulse(), Math.max(0, (at - ctx.currentTime) * 1000));
      play.next += stepInterval(v);
    }
    if (play.ending && now > play.ending) stop();
  }
  function pulse() { if (play && play.onStep) play.onStep(); }
  function frame() {
    if (!play) return;
    const t = ctx.currentTime - play.t0, v = speedAt(play.p, t);
    if (play.onFrame) play.onFrame(v, t, play.p.total);
    raf = requestAnimationFrame(frame);
  }
  function start(p, hooks = {}) {
    init(); if (ctx.state === "suspended") ctx.resume();
    stop();
    p.total = p.segs.reduce((a, s) => a + s.d, 0);
    play = { p, t0: ctx.currentTime + 0.05, next: ctx.currentTime + 0.05, ...hooks };
    timer = setInterval(tick, 25); tick(); frame();
    if (hooks.onStart) hooks.onStart();
  }
  function stop() {
    if (!play) return;
    const p = play; play = null; clearInterval(timer); cancelAnimationFrame(raf);
    if (p.onStop) p.onStop();
  }
  function beep(f = 880, d = 0.12) {
    init(); if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.value = f; o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02);
  }
  return { start, stop, beep, setVolume(v) { if (master) master.gain.value = v; }, get playing() { return play; } };
})();

/* footstep demo patterns */
function flat(v, d = 6) { return [{ d, a: v, b: v }]; }
function losPattern(base, rampT = 13) { return [{ d: 2, a: base, b: base }, { d: rampT, a: base, b: base * LOS_MULT }, { d: 2.5, a: base * LOS_MULT, b: base * LOS_MULT }]; }
const PATTERNS = {
  revenant:   { label: "Searching, then detects you", segs: [{ d: 4, a: 1, b: 1 }, { d: 4, a: 3, b: 3 }, { d: 3, a: 3, b: 1 }] },
  deogen:     { label: "Rushes in, then crawls", segs: [{ d: 4, a: 3, b: 3 }, { d: 4.5, a: 0.4, b: 0.4 }] },
  jinn:       { label: "Breaker on, sees you from 3m+", segs: [{ d: 2.5, a: 1.7, b: 1.7 }, { d: 3.5, a: 2.5, b: 2.5 }, { d: 2.5, a: 1.7, b: 1.7 }] },
  raiju:      { label: "Passes your electronics", segs: [{ d: 2.5, a: 1.7, b: 1.7 }, { d: 3.5, a: 2.5, b: 2.5 }, { d: 2.5, a: 1.7, b: 1.7 }] },
  dayan:      { label: "Far, you walk, you freeze", segs: [{ d: 2.5, a: 1.7, b: 1.7 }, { d: 3, a: 2.25, b: 2.25 }, { d: 3.5, a: 1.2, b: 1.2 }] },
  deildegast: { label: "Untouched house, then 15 items moved", segs: [{ d: 4, a: 3, b: 3 }, { d: 1.2, a: null, b: null }, { d: 4, a: 1.5, b: 1.5 }] }
};
function demoFor(g) {
  if (g.pattern && PATTERNS[g.pattern]) return { ...PATTERNS[g.pattern], quiet: g.quiet };
  if (g.los === true && g.speeds.length === 1) return { label: `Line of sight build-up (${+(g.losTime || 13).toFixed(1)}s)`, segs: losPattern(g.speeds[0].v, g.losTime || 13), quiet: g.quiet };
  return null;
}

/* ---------- now playing bar ---------- */
const bar = $("#nowPlaying");
let activeBtn = null, activeRail = null;
function playSpeed(segs, label, opts = {}) {
  const pattern = { segs, quiet: opts.quiet };
  Audio.start(pattern, {
    onStart() {
      bar.hidden = false;
      $("#npName").textContent = label;
      if (activeBtn) activeBtn.classList.remove("is-playing");
      activeBtn = opts.btn || null; activeRail = opts.rail || null;
      if (activeBtn) activeBtn.classList.add("is-playing");
      if (activeRail) activeRail.classList.add("is-live");
    },
    onStep() { const d = $("#npDot"); d.classList.remove("beat"); void d.offsetWidth; d.classList.add("beat");
      if (activeRail) { const m = activeRail.querySelector(".live"); m.classList.remove("beat"); void m.offsetWidth; m.classList.add("beat"); } },
    onFrame(v, t, total) {
      if (v === undefined) return;
      if (v === null) { $("#npSpeed").textContent = "pause"; return; }
      $("#npSpeed").textContent = `${v.toFixed(2)} m/s`;
      $("#npSpm").textContent = `${spm(v)} steps/min`;
      $("#npProg").style.width = Math.min(100, (t / total) * 100) + "%";
      if (activeRail) activeRail.querySelector(".live").style.left = (Math.min(v * state.mod, RAIL_MAX) / RAIL_MAX * 100) + "%";
    },
    onStop() {
      bar.hidden = true;
      if (activeBtn) activeBtn.classList.remove("is-playing");
      if (activeRail) activeRail.classList.remove("is-live");
      activeBtn = activeRail = null;
    }
  });
}
$("#npStop").addEventListener("click", () => Audio.stop());

/* ---------- rendering ---------- */
const pct = v => (Math.min(v, RAIL_MAX) / RAIL_MAX * 100).toFixed(2) + "%";
function railHTML(g) {
  const sp = speedsOf(g), lo = Math.min(...sp), hi = Math.max(...sp);
  let bands = "";
  if (g.range) bands += `<span class="band range" style="left:${pct(lo)};width:calc(${pct(hi)} - ${pct(lo)})"></span>`;
  if (g.los === true || g.los === "partial") {
    const reach = losReach(g);
    bands += `<span class="band los" style="left:${pct(lo)};width:calc(${pct(reach)} - ${pct(lo)})" title="Reachable with line of sight"></span>`;
  }
  // stagger labels that would collide onto a second row
  const order = g.speeds.map((s, i) => ({ s, i })).sort((x, y) => x.s.v - y.s.v);
  const lvl = {}; let lastAt = [-9, -9];
  for (const { s, i } of order) { const L = s.v - lastAt[0] < 0.42 ? 1 : 0; lvl[i] = L; lastAt[L] = s.v; if (L === 0) lastAt[0] = s.v; }
  const stacked = Object.values(lvl).some(Boolean);
  const marks = g.speeds.map((s, i) =>
    `<button class="mark${lvl[i] ? " up" : ""}" style="left:${pct(s.v)}" data-ghost="${g.id}" data-i="${i}" aria-label="Play ${g.name} footsteps at ${s.v} metres per second (${esc(s.label)})"><span>${fmt(s.v)}</span></button>`).join("");
  const scale = [1, 2, 3].map(n => `<i style="left:${pct(n)}">${n}</i>`).join("") + `<i class="u" style="left:100%">4 m/s</i>`;
  return `<div class="rail${stacked ? " stacked" : ""}" data-ghost="${g.id}"><span class="norm" style="left:${pct(NORMAL)}"></span>${bands}${marks}<span class="live" aria-hidden="true"></span><span class="scale" aria-hidden="true">${scale}</span></div>`;
}
function evChips(g, cls = "") {
  return g.evidence.map(k => {
    const st = state.ev[k];
    return `<span class="ev ev-${k} ${st === 1 ? "on" : st === -1 ? "off" : ""} ${g.guaranteed === k ? "guar" : ""} ${cls}" title="${EVIDENCE[k].label}${g.guaranteed === k ? " (guaranteed)" : ""}">${EVIDENCE[k].short}</span>`;
  }).join("") + (g.fakeOrbs ? `<span class="ev ev-orbs fake ${state.ev.orbs === 1 ? "on" : state.ev.orbs === -1 ? "off" : ""}" title="Fake Ghost Orbs, always shown">+Orbs</span>` : "");
}
function sanityText(g) {
  const s = g.sanity;
  return s.min === s.max ? `${s.base}%` : `${s.base}%<small> (${s.min}–${s.max})</small>`;
}
function losText(g) { return g.los === true ? (g.losTime ? "Yes, fast" : "Yes") : g.los === "partial" ? "Partial" : "No"; }

function renderGrid() {
  const grid = $("#grid");
  const list = G.filter(queryOk);
  let shown = 0;
  grid.innerHTML = list.map(g => {
    const ok = possible(g), mark = state.marks[g.id];
    if (ok) shown++;
    if (!ok && state.hideOut) return "";
    return `<article class="card ${ok ? "" : "dim"} ${mark === "pick" ? "picked" : ""}" data-id="${g.id}">
      <header>
        <h3><button class="open" data-id="${g.id}">${g.name}</button>${g.isNew ? '<em class="tag new">New</em>' : ""}${g.female ? '<em class="tag">♀ only</em>' : ""}</h3>
        <div class="acts">
          <button class="pick" data-id="${g.id}" aria-pressed="${mark === "pick"}" title="Mark as my guess">${mark === "pick" ? "★" : "☆"}</button>
          <button class="cross" data-id="${g.id}" aria-pressed="${mark === "out" || traitOut(g)}" title="Rule out">✕</button>
        </div>
      </header>
      <div class="evrow">${evChips(g)}</div>
      <dl class="stats">
        <div><dt>Hunts at</dt><dd>${sanityText(g)}</dd></div>
        <div><dt>LOS speed-up</dt><dd>${losText(g)}</dd></div>
      </dl>
      ${railHTML(g)}
      <ul class="tells">${g.tells.slice(0, 3).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <button class="more" data-id="${g.id}">Tests, rule-outs and notes</button>
    </article>`;
  }).join("") || `<p class="empty">No ghost matches every filter. Clear one evidence or speed filter, or check whether the difficulty hides evidence.</p>`;
  $("#count").textContent = `${shown} of ${G.length} possible`;
  renderEvAvailability();
}

function renderEvAvailability() {
  const live = G.filter(g => speedOk(g) && losOk(g) && sanityOk(g) && !traitOut(g) && state.marks[g.id] !== "out" && evidenceOk(g));
  for (const k of EV_KEYS) {
    const btn = $(`.evbtn[data-ev="${k}"]`);
    const still = live.some(g => g.evidence.includes(k) || (g.fakeOrbs && k === "orbs"));
    btn.classList.toggle("moot", state.ev[k] === 0 && !still);
  }
}

/* ---------- detail drawer ---------- */
const drawer = $("#drawer");
let lastFocus = null;
function openGhost(id) {
  const g = byId[id]; if (!g) return;
  lastFocus = document.activeElement;
  const demo = demoFor(g);
  const list = (title, items, cls = "") => items && items.length ? `<section><h4>${title}</h4><ul class="${cls}">${items.map(t => `<li>${esc(t)}</li>`).join("")}</ul></section>` : "";
  const tests = g.confirm && g.confirm.length ? `<section><h4>Confirm it</h4><ul class="tests">${g.confirm.map(c => `<li><span class="kind ${c.def ? "def" : "hint"}">${c.def ? "Definitive" : "Hint"}</span>${esc(c.t)}</li>`).join("")}</ul></section>` : "";
  const table = g.speedTable ? `<section><h4>Speed by ${g.speedTable.title.toLowerCase()}</h4><table class="sp"><thead><tr><th>${g.speedTable.cols[0]}</th><th>${g.speedTable.cols[1]}</th><th></th></tr></thead><tbody>${
    g.speedTable.rows.map(r => `<tr><td>${r[0]}</td><td>${Number(r[1]).toFixed(2)} m/s</td><td><button class="play sm" data-v="${r[1]}" data-label="${esc(g.name)} at ${r[0]}" ${g.quiet ? "data-quiet" : ""}>Play</button></td></tr>`).join("")}</tbody></table></section>` : "";
  const vname = window.VIDEO_NAMES[g.id];
  $("#drawerBody").innerHTML = `
    <header class="dh">
      <h2 id="drawerTitle">${g.name}${g.isNew ? ' <em class="tag new">New in v0.18</em>' : ""}</h2>
      <div class="evrow">${evChips(g)}</div>
      ${g.guaranteed ? `<p class="note">${EVIDENCE[g.guaranteed].label} is guaranteed when at least 1 evidence is given.</p>` : ""}
      ${g.fakeOrbs ? `<p class="note">Ghost Orbs always appear as a fake 4th evidence, even on 0 evidence.</p>` : ""}
    </header>
    <section class="facts">
      <div><span>Hunt sanity</span><strong>${sanityText(g)}</strong>${g.sanity.note ? `<em>${esc(g.sanity.note)}</em>` : ""}</div>
      <div><span>Line of sight</span><strong>${losText(g)}</strong>${g.losNote ? `<em>${esc(g.losNote)}</em>` : g.los === true ? `<em>Up to ${losReach(g).toFixed(2)} m/s after ${+(g.losTime || 13).toFixed(1)}s in view</em>` : ""}</div>
    </section>
    <section><h4>Hear it</h4>
      <div class="plays">${g.speeds.map(s => `<button class="play" data-v="${s.v}" data-label="${esc(g.name)} ${esc(s.label)}" ${g.quiet ? "data-quiet" : ""}>${fmt(s.v)} m/s <small>${esc(s.label)}</small></button>`).join("")}
      ${demo ? `<button class="play demo" data-demo="${g.id}">${esc(demo.label)}</button>` : ""}
      <button class="play ref" data-v="1.7" data-label="Normal ghost, 1.7 m/s">Compare: normal 1.7</button></div>
      ${railHTML(g)}
    </section>
    ${list("Tells", g.tells)}
    ${list("Behaviour", g.behaviours)}
    ${list("Abilities", g.abilities)}
    ${table}
    ${tests}
    ${list("Rule it out", g.ruleOut, "outs")}
    ${list("Worth knowing", g.extra, "extra")}
    ${vname ? `<p class="vname">The video's captions call it "${esc(vname)}".</p>` : ""}`;
  drawer.hidden = false;
  document.body.classList.add("drawer-open");
  requestAnimationFrame(() => drawer.classList.add("open"));
  $("#drawerClose").focus();
}
function closeDrawer() {
  drawer.classList.remove("open"); document.body.classList.remove("drawer-open");
  setTimeout(() => { drawer.hidden = true; }, 200);
  if (lastFocus) lastFocus.focus();
}
$("#drawerClose").addEventListener("click", closeDrawer);
drawer.addEventListener("click", e => { if (e.target === drawer) closeDrawer(); });

/* ---------- event delegation ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.classList.contains("mark")) {
    const g = byId[t.dataset.ghost], s = g.speeds[+t.dataset.i];
    if (t.classList.contains("is-playing")) return Audio.stop();
    return playSpeed(flat(s.v), `${g.name}, ${s.label}`, { btn: t, rail: t.closest(".rail"), quiet: g.quiet });
  }
  if (t.classList.contains("play")) {
    if (t.classList.contains("is-playing")) return Audio.stop();
    const rail = $("#drawerBody .rail");
    if (t.dataset.demo) { const g = byId[t.dataset.demo], d = demoFor(g); return playSpeed(d.segs, `${g.name}: ${d.label}`, { btn: t, rail, quiet: g.quiet }); }
    return playSpeed(flat(+t.dataset.v), t.dataset.label, { btn: t, rail: t.closest("#drawerBody") ? rail : null, quiet: t.hasAttribute("data-quiet") });
  }
  if (t.classList.contains("open") || t.classList.contains("more")) return openGhost(t.dataset.id);
  if (t.classList.contains("cross")) { const id = t.dataset.id; state.marks[id] = state.marks[id] === "out" ? undefined : "out"; return renderGrid(); }
  if (t.classList.contains("pick")) { const id = t.dataset.id; for (const k in state.marks) if (state.marks[k] === "pick") delete state.marks[k]; if (t.getAttribute("aria-pressed") !== "true") state.marks[id] = "pick"; return renderGrid(); }
});

/* ---------- filter controls ---------- */
function cycleEv(k) {
  state.ev[k] = state.ev[k] === 0 ? 1 : state.ev[k] === 1 ? -1 : 0;
  const b = $(`.evbtn[data-ev="${k}"]`);
  b.dataset.state = state.ev[k];
  b.setAttribute("aria-label", `${EVIDENCE[k].label}: ${["unknown", "found", "ruled out"][state.ev[k] === -1 ? 2 : state.ev[k]]}`);
  renderGrid();
}
function buildFilters() {
  $("#evList").innerHTML = EV_KEYS.map((k, i) =>
    `<button class="evbtn ev-${k}" data-ev="${k}" data-state="0" aria-label="${EVIDENCE[k].label}: unknown"><kbd>${i + 1}</kbd><span class="nm">${EVIDENCE[k].label}</span><span class="st" aria-hidden="true"></span></button>`).join("");
  $$(".evbtn").forEach(b => b.addEventListener("click", () => cycleEv(b.dataset.ev)));
  $$("#evCount button").forEach(b => {
    b.setAttribute("aria-pressed", +b.dataset.n === state.evCount);
    b.addEventListener("click", () => { state.evCount = +b.dataset.n; store.set("evCount", state.evCount);
      $$("#evCount button").forEach(x => x.setAttribute("aria-pressed", x === b)); renderGrid(); });
  });
  const toggleSet = (sel, set) => $$(sel).forEach(b => b.addEventListener("click", () => {
    const v = b.dataset.v; set.has(v) ? set.delete(v) : set.add(v); b.setAttribute("aria-pressed", set.has(v)); renderGrid(); }));
  toggleSet("#speedF button", state.speed);
  toggleSet("#sanityF button", state.sanity);
  $$("#losF button").forEach(b => b.addEventListener("click", () => {
    const v = b.dataset.v === "yes"; state.los = state.los === v ? null : v;
    $$("#losF button").forEach(x => x.setAttribute("aria-pressed", state.los !== null && (x.dataset.v === "yes") === state.los)); renderGrid(); }));
  $("#search").addEventListener("input", e => { state.query = e.target.value; renderGrid(); });
  [["#normalBlink", "normalBlink"], ["#maleF", "male"]].forEach(([sel, key]) => {
    const c = $(sel); c.checked = state[key];
    c.addEventListener("change", () => { state[key] = c.checked; renderGrid(); });
  });
  const ho = $("#hideOut"); ho.checked = state.hideOut;
  ho.addEventListener("change", () => { state.hideOut = ho.checked; store.set("hideOut", ho.checked); renderGrid(); });
  $("#reset").addEventListener("click", resetAll);
}
function resetAll() {
  EV_KEYS.forEach(k => { state.ev[k] = 0; $(`.evbtn[data-ev="${k}"]`).dataset.state = 0; });
  state.speed.clear(); state.sanity.clear(); state.los = null; state.normalBlink = state.male = false; $("#normalBlink").checked = $("#maleF").checked = false; state.marks = {}; state.query = ""; $("#search").value = "";
  $$("#speedF button, #sanityF button, #losF button").forEach(b => b.setAttribute("aria-pressed", "false"));
  timers.forEach(t => t.reset()); tapReset();
  renderGrid();
}

/* ---------- sound settings ---------- */
function buildSound() {
  const mod = $("#mod"), surf = $("#surface"), vol = $("#volume");
  mod.value = state.mod; surf.value = state.surface; vol.value = state.volume;
  mod.addEventListener("change", () => { state.mod = +mod.value; store.set("mod", state.mod); tapShow(); });
  surf.addEventListener("change", () => { state.surface = surf.value; store.set("surface", surf.value); });
  vol.addEventListener("input", () => { state.volume = +vol.value; store.set("volume", state.volume); Audio.setVolume(state.volume); });
}

/* ---------- tap tempo ---------- */
let taps = [];
function tap() {
  const now = performance.now();
  if (taps.length && now - taps[taps.length - 1] > 2500) taps = [];
  taps.push(now); if (taps.length > 9) taps.shift();
  const b = $("#tapBtn"); b.classList.remove("beat"); void b.offsetWidth; b.classList.add("beat");
  tapShow();
}
function tapSpeed() {
  if (taps.length < 3) return null;
  const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1) / 1000;
  return 1 / ((iv + 0.075) * state.mod);
}
function tapShow() {
  const v = tapSpeed(), out = $("#tapOut"), m = $("#tapMatch");
  if (!v) { out.textContent = taps.length ? `Keep tapping (${taps.length}/3)` : "Tap along with the footsteps"; m.innerHTML = ""; return; }
  const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
  out.innerHTML = `<strong>${v.toFixed(2)} m/s</strong> <span>${Math.round(60000 / iv)} steps/min</span>`;
  const near = [], withLos = [];
  for (const g of G) {
    if (g.fakeOrbs) continue;
    const sp = speedsOf(g), lo = Math.min(...sp), hi = Math.max(...sp);
    const base = sp.some(s => Math.abs(s - v) <= 0.08) || (g.range && v >= lo - 0.08 && v <= hi + 0.08);
    if (base) near.push(g.name);
    else if (hasLos(g) && sp.some(s => v > s && v <= s * LOS_MULT + 0.05)) withLos.push(g.name);
  }
  m.innerHTML = `<p><b>Base speed match:</b> ${near.join(", ") || "none"}</p>${withLos.length ? `<p><b>Only after LOS build-up:</b> ${withLos.join(", ")}</p>` : ""}`;
}
function tapReset() { taps = []; tapShow(); }
$("#tapBtn").addEventListener("click", tap);
$("#tapReset").addEventListener("click", tapReset);

/* ---------- timers ---------- */
function makeTimer(root, max, stages) {
  const out = root.querySelector(".tt"), msg = root.querySelector(".tmsg"), fill = root.querySelector(".tfill"), btn = root.querySelector(".tgo");
  root.querySelector(".ticks").innerHTML = stages.filter(s => s.at > 0).map(s => `<i style="left:${s.at / max * 100}%"><b>${s.at}s</b></i>`).join("");
  let t0 = null, iv = null, lastStage = -1;
  function draw() {
    const t = t0 === null ? 0 : Math.min(max, (performance.now() - t0) / 1000);
    out.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    fill.style.width = (t / max * 100) + "%";
    let idx = 0; stages.forEach((s, i) => { if (t >= s.at) idx = i; });
    msg.textContent = t0 === null ? root.dataset.idle : stages[idx].msg;
    if (t0 !== null && idx !== lastStage) { if (lastStage !== -1) Audio.beep(idx === stages.length - 1 ? 660 : 990); lastStage = idx; }
    if (t >= max) { clearInterval(iv); iv = null; btn.textContent = "Restart"; }
  }
  btn.addEventListener("click", () => {
    if (iv) { reset(); return; }
    t0 = performance.now(); lastStage = -1; btn.textContent = "Stop"; iv = setInterval(draw, 200); draw();
  });
  function reset() { clearInterval(iv); iv = null; t0 = null; btn.textContent = "Start"; draw(); }
  draw();
  return { reset, toggle: () => btn.click() };
}
const timers = [
  makeTimer($("#smudge"), 180, [
    { at: 0, msg: "No ghost can hunt yet" },
    { at: 60, msg: "Only a Demon can hunt" },
    { at: 90, msg: "Any ghost except a Spirit" },
    { at: 180, msg: "Any ghost can hunt" }]),
  makeTimer($("#cooldown"), 25, [
    { at: 0, msg: "No ghost can hunt yet" },
    { at: 20, msg: "Only a Demon can hunt" },
    { at: 25, msg: "Any ghost can hunt" }])
];

/* ---------- tabs and guide pages ---------- */
function buildGuides() {
  const Gd = window.GUIDES;
  $("#setupList").innerHTML = Gd.setup.map(([a, b]) => `<li><strong>${esc(a)}</strong><span>${esc(b)}</span></li>`).join("");
  $("#orderList").innerHTML = Gd.order.map(([a, b]) => `<li><strong>${esc(a)}</strong><span>${esc(b)}</span></li>`).join("");
  $("#testTables").innerHTML = Gd.tests.map(t => `<section><h3>${esc(t.title)}</h3><div class="tw"><table><thead><tr>${t.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`).join("");
  $("#changeList").innerHTML = Gd.changes.map(([v, d, t]) => `<li><span class="ver">${v}</span><span class="dt">${d}</span><p>${esc(t)}</p></li>`).join("");
  $("#videoRows").innerHTML = Gd.video.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
  // evidence lookup
  $("#evLookup").innerHTML = EV_KEYS.map(k => {
    const gs = G.filter(g => g.evidence.includes(k) || (g.fakeOrbs && k === "orbs")).map(g => g.name + (g.guaranteed === k ? "*" : g.fakeOrbs && k === "orbs" ? " (fake)" : ""));
    return `<tr><th><span class="ev ev-${k}">${EVIDENCE[k].short}</span></th><td>${gs.length}</td><td>${gs.join(", ")}</td></tr>`;
  }).join("");
  // speed ladder
  const groups = new Map();
  for (const g of G) { if (g.fakeOrbs) continue; for (const s of g.speeds) {
    const k = s.v.toFixed(3); if (!groups.has(k)) groups.set(k, { v: s.v, items: [] });
    groups.get(k).items.push({ g, s }); } }
  const rows = [...groups.values()].sort((a, b) => a.v - b.v);
  $("#ladder").innerHTML = rows.map(({ v, items }) => {
    const names = items.map(x => x.g.name).join(", ");
    const odd = items.filter(x => x.s.label !== "base");
    const sub = items.length === 1 ? items[0].s.label
      : !odd.length ? "base speed"
      : items.length > 4 ? "standard speed; " + odd.map(x => `${x.g.name} ${x.s.label}`).join(", ")
      : items.map(x => `${x.g.name}: ${x.s.label}`).join("; ");
    const quiet = items.length === 1 && items[0].g.quiet;
    return `<li style="--w:${pct(v)}"><button class="play" data-v="${v}" data-label="${esc(names)} at ${fmt(v)} m/s" ${quiet ? "data-quiet" : ""}><span class="lv">${fmt(v)}</span><span class="lg">${esc(names)}</span><span class="ll">${esc(sub)}</span></button></li>`;
  }).join("") + `<li style="--w:${pct(3.71)}"><button class="play" data-v="3.71" data-label="Moroi max with LOS at 0% sanity"><span class="lv">3.71</span><span class="lg">Moroi</span><span class="ll">fastest possible: 0% sanity, 13s line of sight</span></button></li>`;
  $("#demoList").innerHTML = G.filter(g => demoFor(g) && (g.pattern)).map(g => `<button class="play demo" data-demo="${g.id}">${g.name}: ${esc(demoFor(g).label)}</button>`).join("") +
    `<button class="play demo" data-demo="aswang">Aswang: fast line of sight (8.7s)</button><button class="play demo" data-demo="banshee">Standard: line of sight (13s)</button>`;
}
function setTab(name) {
  $$(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === name));
  $$(".page").forEach(p => p.hidden = p.id !== "page-" + name);
  document.body.dataset.tab = name;
  window.scrollTo(0, 0);
}
$$(".tabs button").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));

/* ---------- mobile filters ---------- */
$("#filtersToggle").addEventListener("click", () => {
  const open = document.body.classList.toggle("rail-open");
  $("#filtersToggle").setAttribute("aria-expanded", open);
});

/* ---------- keyboard ---------- */
document.addEventListener("keydown", e => {
  if (e.target.matches("input, select, textarea")) { if (e.key === "Escape") e.target.blur(); return; }
  if (e.key === "Escape") { if (!drawer.hidden) closeDrawer(); else Audio.stop(); return; }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 7) { cycleEv(EV_KEYS[n - 1]); return; }
  const k = e.key.toLowerCase();
  if (k === "t") { tap(); e.preventDefault(); }
  else if (k === "s") timers[0].toggle();
  else if (k === "c") timers[1].toggle();
  else if (k === "/") { e.preventDefault(); $("#search").focus(); }
  else if (k === "r" && e.shiftKey) resetAll();
});

/* ---------- theme ---------- */
const THEMES = ["auto", "dark", "light"];
const themeBtn = $("#themeToggle");
const applyTheme = t => {
  if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  themeBtn.textContent = "Theme: " + t[0].toUpperCase() + t.slice(1);
};
applyTheme(store.get("theme", "auto"));
themeBtn.addEventListener("click", () => {
  const next = THEMES[(THEMES.indexOf(store.get("theme", "auto")) + 1) % THEMES.length];
  store.set("theme", next); applyTheme(next); setTop();
});

/* ---------- boot ---------- */
$$(".gv").forEach(x => x.textContent = window.GAME_VERSION);
$$(".dd").forEach(x => x.textContent = window.DATA_DATE);
const setTop = () => document.documentElement.style.setProperty("--toph", $(".top").offsetHeight + "px");
setTop(); addEventListener("resize", setTop);
buildFilters(); buildSound(); buildGuides(); renderGrid(); setTab("ghosts");
})();
