/* DRIFT — LIVE SKY.
   What's moving over the map right now. Every Earth-observation satellite
   (and the crewed stations) propagated in the browser from CelesTrak's
   orbital elements — SGP4 via satellite.js — drawn as live dots with ground
   tracks, plus the last 24 hours of earthquakes from USGS. The same birds
   that took the photos you're looking at, caught in the act. Keyless and
   browser-direct; inspired by God's Eye View's satellites and earthquakes
   layers (MIT, bilawalsidhu/gods-eye-view).

   Loaded after app.js: uses map, $, state and toast. */

"use strict";

// Earth-resources birds, the weather fleet (Suomi NPP, NOAA-20/21, GOES,
// Himawari, Sentinel-3…) and the crewed stations: ~250 objects, cheap to
// propagate four times a second. CelesTrak's "active" group (11k) is not.
const TLE_GROUPS = ["resource", "weather", "stations"];
const TLE_URL = g => `https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=tle`;
const TLE_TTL_MS = 6 * 3600 * 1000;  // CelesTrak asks for at most one fetch per group every 2 h
const QUAKE_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const QUAKE_TTL_MS = 5 * 60 * 1000;
const SKY_TICK_MS = 250;              // propagation rate; drawing also follows map movement
const OVERHEAD_KM = 250;              // "overhead" = ground point within this of the map center
const FEATURED = /LANDSAT|SENTINEL-2|WORLDVIEW|GEOEYE|PLEIADES|SPOT [67]|ISS \(ZARYA\)|CSS \(TIANHE\)|TERRA|AQUA|SUOMI NPP|NOAA 2[01]|SKYSAT/;

const sky = {
  on: false,
  loading: false,
  sats: [],          // { name, label, rec, featured, lat, lng, alt, track, trackAt }
  quakes: [],        // { lat, lng, mag, place, time }
  tleAt: 0,          // when the freshest TLE set was fetched
  quakeAt: 0,
  timer: null,
  notified: new Map(), // sat name -> last overhead toast time
  ctx: null,
  dpr: 1,
};

const shortName = n => n.replace(/\s*\(.*\)\s*$/, "").replace(/\s+/g, " ").trim();

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ---- data ---- */

function parseTle(text) {
  const L = text.split(/\r?\n/).map(l => l.trimEnd());
  const out = [];
  for (let i = 1; i + 1 < L.length; i++) {
    if (!L[i].startsWith("1 ") || !L[i + 1].startsWith("2 ")) continue;
    try {
      const name = L[i - 1].trim();
      out.push({ name, label: shortName(name), rec: satellite.twoline2satrec(L[i], L[i + 1]),
        featured: FEATURED.test(name), lat: null, lng: null, alt: 0, track: null, trackAt: 0 });
    } catch { /* malformed element set — skip it */ }
    i++;
  }
  return out;
}

// Cached in localStorage so a screensaver that starts ten times a day still
// asks CelesTrak a handful of times. A stale copy beats no satellites.
async function loadTles() {
  const sets = await Promise.all(TLE_GROUPS.map(async g => {
    const key = "drift-tle-" + g;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(key) || "null"); } catch { /* no storage */ }
    if (cached && Date.now() - cached.t < TLE_TTL_MS) return cached;
    try {
      const res = await fetch(TLE_URL(g));
      if (!res.ok) throw new Error("celestrak " + res.status);
      const text = await res.text();
      if (!/^1 /m.test(text)) throw new Error("not a TLE set");
      const fresh = { t: Date.now(), text };
      try { localStorage.setItem(key, JSON.stringify(fresh)); } catch { /* storage full/denied */ }
      return fresh;
    } catch {
      return cached; // may be null
    }
  }));
  const good = sets.filter(Boolean);
  if (!good.length) throw new Error("no orbital elements");
  sky.tleAt = Math.min(...good.map(s => s.t));
  sky.sats = good.flatMap(s => parseTle(s.text));
}

async function loadQuakes() {
  if (Date.now() - sky.quakeAt < QUAKE_TTL_MS) return;
  try {
    const res = await fetch(QUAKE_URL);
    if (!res.ok) return;
    const data = await res.json();
    sky.quakes = (data.features || []).map(f => ({
      lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1],
      mag: f.properties.mag ?? 0, place: f.properties.place || "", time: f.properties.time,
    })).filter(q => Number.isFinite(q.lat) && Number.isFinite(q.lng));
    sky.quakeAt = Date.now();
  } catch { /* keep the last list */ }
}

/* ---- orbital mechanics ---- */

function geodeticAt(rec, date, gmst) {
  let pv;
  try { pv = satellite.propagate(rec, date); } catch { return null; }
  const p = pv && pv.position;
  if (!p || !Number.isFinite(p.x)) return null;
  const g = satellite.eciToGeodetic(p, gmst || satellite.gstime(date));
  const lat = satellite.degreesLat(g.latitude), lng = satellite.degreesLong(g.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, alt: g.height };
}

function propagateAll() {
  const now = new Date();
  const gmst = satellite.gstime(now);
  for (const s of sky.sats) {
    const g = geodeticAt(s.rec, now, gmst);
    if (g) { s.lat = g.lat; s.lng = g.lng; s.alt = g.alt; } else { s.lat = s.lng = null; }
  }
}

// ±8 minutes of ground track, recomputed every 15 s for the few sats that get one.
function groundTrack(s) {
  const now = Date.now();
  if (s.track && now - s.trackAt < 15000) return s.track;
  const pts = [];
  for (let dt = -480; dt <= 480; dt += 30) {
    const g = geodeticAt(s.rec, new Date(now + dt * 1000));
    pts.push(g ? { lat: g.lat, lng: g.lng, future: dt > 0 } : null);
  }
  s.track = pts;
  s.trackAt = now;
  return pts;
}

/* ---- drawing ---- */

function skyCanvas() {
  const c = $("sky");
  const box = map.getContainer();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = box.clientWidth, h = box.clientHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    c.style.width = w + "px";
    c.style.height = h + "px";
  }
  sky.dpr = dpr;
  const ctx = c.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function drawSky() {
  if (!sky.on) return;
  const { ctx, w, h } = skyCanvas();
  ctx.clearRect(0, 0, w, h);
  const mono = "11px ui-monospace, Consolas, monospace";
  const center = map.getCenter();
  const now = Date.now();

  /* earthquakes: rings sized by magnitude, fading with age, the fresh ones pulsing */
  ctx.lineWidth = 1.2;
  let quakeLabels = 0;
  for (const q of sky.quakes) {
    const p = map.project([q.lng, q.lat]);
    if (p.x < -40 || p.y < -40 || p.x > w + 40 || p.y > h + 40) continue;
    const ageH = (now - q.time) / 3600000;
    const alpha = Math.max(0.3, 1 - ageH / 30);
    const r = 3 + Math.max(0, q.mag) * 2.2;
    ctx.strokeStyle = `rgba(232, 112, 72, ${alpha})`;
    ctx.fillStyle = `rgba(232, 112, 72, ${alpha * 0.18})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (ageH < 1) { // a ring that keeps rolling out for an hour
      const t = (now % 3000) / 3000;
      ctx.strokeStyle = `rgba(232, 112, 72, ${(1 - t) * 0.8})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, r + t * 26, 0, Math.PI * 2); ctx.stroke();
    }
    if (q.mag >= 4.5 && quakeLabels < 30) {
      quakeLabels++;
      ctx.font = mono;
      ctx.fillStyle = `rgba(255, 196, 170, ${Math.min(1, alpha + 0.2)})`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`M${q.mag.toFixed(1)}`, p.x + r + 5, p.y);
    }
  }

  /* satellites */
  const inView = [];
  for (const s of sky.sats) {
    if (s.lat === null) continue;
    const p = map.project([s.lng, s.lat]);
    if (p.x < -20 || p.y < -20 || p.x > w + 20 || p.y > h + 20) continue;
    inView.push({ s, p });
  }
  const featuredInView = inView.filter(v => v.s.featured);
  const labelAll = inView.length <= 24;
  const labelFeatured = featuredInView.length <= 40;

  // ground tracks for the headline birds nearest the center
  const tracked = featuredInView
    .map(v => ({ ...v, d: haversineKm(center.lat, center.lng, v.s.lat, v.s.lng) }))
    .sort((a, b) => a.d - b.d).slice(0, 6);
  ctx.lineWidth = 1;
  for (const v of tracked) {
    const pts = groundTrack(v.s);
    let prev = null;
    for (const pt of pts) {
      if (!pt) { prev = null; continue; }
      const q = map.project([pt.lng, pt.lat]);
      if (prev && Math.abs(q.x - prev.x) < w / 2) {
        ctx.strokeStyle = pt.future ? "rgba(240, 195, 90, 0.55)" : "rgba(240, 195, 90, 0.22)";
        ctx.setLineDash(pt.future ? [4, 4] : []);
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
      prev = q;
    }
  }
  ctx.setLineDash([]);

  for (const { s, p } of inView) {
    const station = /ISS|TIANHE|CSS/.test(s.name);
    const color = station ? "255, 255, 255" : s.featured ? "240, 195, 90" : "170, 205, 255";
    const r = s.featured ? 3.2 : 1.8;
    ctx.fillStyle = `rgba(${color}, 0.25)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(${color}, 0.95)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    if (labelAll || (s.featured && labelFeatured)) {
      ctx.font = mono;
      ctx.fillStyle = `rgba(${color}, 0.9)`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 4;
      ctx.fillText(s.label, p.x + r + 6, p.y);
      ctx.shadowBlur = 0;
    }
  }

  updateSkyHud(center, now);
}

/* ---- HUD + overhead alerts ---- */

function updateSkyHud(center, now) {
  const tracked = sky.sats.filter(s => s.lat !== null);
  let nearest = null, nearestKm = Infinity;
  for (const s of tracked) {
    const d = haversineKm(center.lat, center.lng, s.lat, s.lng);
    if (d < nearestKm) { nearestKm = d; nearest = s; }
  }
  const overhead = tracked.filter(s => haversineKm(center.lat, center.lng, s.lat, s.lng) <= OVERHEAD_KM);
  const tleAgeH = Math.round((now - sky.tleAt) / 3600000);
  $("sky-hud-main").textContent =
    `LIVE SKY · ${tracked.length} SATELLITES · ${overhead.length} OVERHEAD · ${sky.quakes.length} QUAKES / 24 H`
    + (tleAgeH >= 1 ? ` · ORBITS ${tleAgeH} H OLD` : "");
  let sub = "";
  if (nearest && nearestKm < 1500) {
    sub = `${nearest.label} · ${Math.round(nearest.alt)} KM UP · ${Math.round(nearestKm)} KM ${nearestKm <= OVERHEAD_KM ? "— OVERHEAD" : "AWAY"}`;
  }
  let nq = null, nqKm = Infinity;
  for (const q of sky.quakes) {
    const d = haversineKm(center.lat, center.lng, q.lat, q.lng);
    if (d < nqKm) { nqKm = d; nq = q; }
  }
  if (nq && nqKm < 400) {
    const ageH = (now - nq.time) / 3600000;
    const age = ageH < 1 ? `${Math.max(1, Math.round(ageH * 60))} MIN AGO` : `${Math.round(ageH)} H AGO`;
    sub += (sub ? "  ·  " : "") + `M${nq.mag.toFixed(1)} QUAKE ${Math.round(nqKm)} KM AWAY · ${age}`;
  }
  $("sky-hud-sub").textContent = sub;

  // a headline bird crossing the spot you're looking at deserves a word
  if (!state.transitioning) {
    for (const s of overhead) {
      if (!s.featured) continue;
      const last = sky.notified.get(s.name) || 0;
      if (now - last < 20 * 60 * 1000) continue;
      sky.notified.set(s.name, now);
      toast(`${s.label} OVERHEAD NOW · ${Math.round(s.alt)} KM UP`);
      break;
    }
  }
}

/* ---- lifecycle ---- */

function skyTick() {
  propagateAll();
  drawSky();
  loadQuakes();
}

async function startSky() {
  if (typeof satellite === "undefined") { toast("LIVE SKY UNAVAILABLE — ORBIT LIBRARY DIDN'T LOAD"); return; }
  if (sky.loading) return;
  sky.loading = true;
  toast("LIVE SKY — FETCHING ORBITS…");
  try {
    if (!sky.sats.length || Date.now() - sky.tleAt > TLE_TTL_MS) await loadTles();
  } catch {
    sky.loading = false;
    toast("LIVE SKY UNAVAILABLE — CELESTRAK DIDN'T ANSWER");
    return;
  }
  sky.loading = false;
  sky.on = true;
  $("sky").hidden = false;
  $("sky-hud").hidden = false;
  loadQuakes().then(drawSky);
  skyTick();
  clearInterval(sky.timer);
  sky.timer = setInterval(skyTick, SKY_TICK_MS);
  toast(`LIVE SKY ON · ${sky.sats.length} SATELLITES TRACKED`);
}

function stopSky() {
  sky.on = false;
  clearInterval(sky.timer);
  sky.timer = null;
  const c = $("sky");
  c.getContext("2d").clearRect(0, 0, c.width, c.height);
  c.hidden = true;
  $("sky-hud").hidden = true;
  toast("LIVE SKY OFF");
}

function toggleSky() {
  sky.on ? stopSky() : startSky();
}

map.on("move", () => { if (sky.on) drawSky(); });
map.on("resize", () => { if (sky.on) drawSky(); });
