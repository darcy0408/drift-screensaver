/* DRIFT — LATEST PASS.
   What this spot looked like within the last few days, not the last few
   years. NASA's Harmonized Landsat Sentinel-2 (HLS) product is served as
   per-day tiles by GIBS, and the CMR catalog says which days a satellite
   actually flew over here and how cloudy it was. 30 m per pixel, so this is
   a region's view, not a rooftop's — the Esri mosaic underneath stays the
   sharp one. Keyless, browser-direct, U.S. public domain. Approach ported
   from God's Eye View's Recent Imagery layer (MIT, bilawalsidhu/gods-eye-view).

   Loaded after app.js: uses map, $, state, toast, setPlaying and the panel
   close helpers it defines. */

"use strict";

const HLS_PRODUCTS = {
  S30: { layer: "HLS_S30_Nadir_BRDF_Adjusted_Reflectance", cmr: "C2021957295-LPCLOUD", sat: "Sentinel-2" },
  L30: { layer: "HLS_L30_Nadir_BRDF_Adjusted_Reflectance", cmr: "C2021957657-LPCLOUD", sat: "Landsat 8/9" },
};
const HLS_MAX_LEVEL = 12;   // GIBS serves the 30 m product down to zoom 12
const VIIRS_LAYER = "VIIRS_NOAA21_CorrectedReflectance_TrueColor"; // 250 m daily mosaic, zoom ≤ 9
const VIIRS_MAX_LEVEL = 9;
const RECENT_WINDOW_DAYS = 24;
const CMR_GRANULES = "https://cmr.earthdata.nasa.gov/search/granules.umm_json";

const gibsTiles = (layer, day, level, fmt) =>
  ["a", "b", "c"].map(s =>
    `https://gibs-${s}.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${day}/GoogleMapsCompatible_Level${level}/{z}/{y}/{x}.${fmt}`);

const recent = {
  open: false,
  passes: [],        // candidate days, newest first: { day, product, cloud, n }
  idx: -1,           // which pass is on screen; -1 = VIIRS fallback
  queried: null,     // map center the catalog was last asked about
  seq: 0,
  savedZoom: null,   // where the camera was before we pulled back to zoom 12
  comparing: false,  // true while the archive is shown for comparison
  active: null,      // "recent-hls" | "recent-viirs" | null
};

function addRecentLayers() {
  if (map.getSource("recent-hls")) return;
  const credit = "Latest pass imagery courtesy NASA GIBS / ESDIS — HLS (Sentinel-2, Landsat 8/9), VIIRS (NOAA-21)";
  const spec = (tiles, maxzoom) => ({ type: "raster", tiles, tileSize: 256, maxzoom, attribution: credit });
  map.addSource("recent-hls", spec(gibsTiles(HLS_PRODUCTS.S30.layer, "2000-01-01", HLS_MAX_LEVEL, "png"), HLS_MAX_LEVEL));
  map.addSource("recent-viirs", spec(gibsTiles(VIIRS_LAYER, "2000-01-01", VIIRS_MAX_LEVEL, "jpg"), VIIRS_MAX_LEVEL));
  for (const id of ["recent-hls", "recent-viirs"]) {
    map.addLayer({
      id, type: "raster", source: id,
      layout: { visibility: "none" },
      paint: { "raster-opacity": 0, "raster-opacity-transition": { duration: 900 }, "raster-fade-duration": 300 },
    }, "labels"); // under the place-name labels, over the Esri archive
  }
}

/* ---- catalog ---- */

const utcDay = ms => new Date(ms).toISOString().slice(0, 10);
const dayAge = day => Math.round((Date.now() - Date.parse(day + "T12:00:00Z")) / 86400000);

function fmtRecentDay(day) {
  const when = new Date(day + "T12:00:00Z")
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).toUpperCase();
  const age = dayAge(day);
  return `${when} · ${age <= 0 ? "TODAY" : age === 1 ? "YESTERDAY" : age + " DAYS AGO"}`;
}

// One request per HLS collection: every granule that touched a small box
// around the map center in the last few weeks, with its cloud percentage.
async function searchPasses(lat, lng) {
  const d = 0.04; // ~4 km half-box
  const west = Math.max(-180, lng - d), east = Math.min(180, lng + d);
  const south = Math.max(-85, lat - d), north = Math.min(85, lat + d);
  const box = [west, south, east, north].map(v => v.toFixed(3)).join(",");
  const now = Date.now();
  const temporal = `${new Date(now - RECENT_WINDOW_DAYS * 86400000).toISOString()},${new Date(now).toISOString()}`;
  const results = await Promise.allSettled(Object.entries(HLS_PRODUCTS).map(async ([code, p]) => {
    const res = await fetch(`${CMR_GRANULES}?collection_concept_id=${p.cmr}&bounding_box=${box}`
      + `&temporal=${temporal}&sort_key=-start_date&page_size=60`);
    if (!res.ok) throw new Error("CMR " + res.status);
    const data = await res.json();
    return (data.items || []).map(it => {
      const u = it.umm || {};
      const t = String(u.TemporalExtent?.RangeDateTime?.BeginningDateTime || "");
      const cc = (u.AdditionalAttributes || []).find(a => a.Name === "CLOUD_COVERAGE");
      const cloud = cc && cc.Values ? parseFloat(cc.Values[0]) : NaN;
      return { day: t.slice(0, 10), product: code, cloud };
    }).filter(g => /^\d{4}-\d{2}-\d{2}$/.test(g.day));
  }));
  // mean cloud per (day, product) — a view can straddle two HLS tiles —
  // then the clearer product wins each day
  const byDay = new Map();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const g of r.value) {
      const key = g.day + "/" + g.product;
      const e = byDay.get(key) || { day: g.day, product: g.product, sum: 0, n: 0 };
      e.sum += Number.isFinite(g.cloud) ? g.cloud : 50;
      e.n++;
      byDay.set(key, e);
    }
  }
  const best = new Map();
  for (const e of byDay.values()) {
    const cloud = Math.round(e.sum / e.n);
    const cur = best.get(e.day);
    if (!cur || cloud < cur.cloud) best.set(e.day, { day: e.day, product: e.product, cloud, n: e.n });
  }
  return [...best.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

// Clearest *recent* pass: a little cloud is worth a lot of freshness.
function pickPass(passes) {
  let bestIdx = -1, bestScore = Infinity;
  passes.forEach((p, i) => {
    const score = p.cloud + dayAge(p.day) * 2;
    if (score < bestScore) { bestScore = score; bestIdx = i; }
  });
  return bestIdx;
}

/* ---- showing a pass ---- */

function showRecentLayer(id) {
  for (const other of ["recent-hls", "recent-viirs"]) {
    if (other === id) continue;
    map.setPaintProperty(other, "raster-opacity", 0);
    setTimeout(() => { if (recent.active !== other) map.setLayoutProperty(other, "visibility", "none"); }, 950);
  }
  recent.active = id;
  map.setLayoutProperty(id, "visibility", "visible");
  if (!recent.comparing) map.setPaintProperty(id, "raster-opacity", 1);
}

function applyPass(idx) {
  recent.idx = idx;
  const p = recent.passes[idx];
  if (p) {
    const spec = HLS_PRODUCTS[p.product];
    map.getSource("recent-hls").setTiles(gibsTiles(spec.layer, p.day, HLS_MAX_LEVEL, "png"));
    showRecentLayer("recent-hls");
    $("recent-label").textContent = fmtRecentDay(p.day);
    $("recent-source").textContent =
      `${spec.sat} via NASA HLS · 30 m/px · ${p.cloud}% cloud · pass ${idx + 1} of ${recent.passes.length}`;
  } else {
    // no HLS granule here (open ocean, polar night, or offline catalog):
    // fall back to the daily VIIRS mosaic, two days back so it's assembled
    const day = utcDay(Date.now() - 2 * 86400000);
    map.getSource("recent-viirs").setTiles(gibsTiles(VIIRS_LAYER, day, VIIRS_MAX_LEVEL, "jpg"));
    showRecentLayer("recent-viirs");
    if (map.getZoom() > VIIRS_MAX_LEVEL) map.easeTo({ zoom: VIIRS_MAX_LEVEL, duration: 1200 });
    $("recent-label").textContent = fmtRecentDay(day);
    $("recent-source").textContent = "VIIRS on NOAA-21 · 250 m/px · daily global mosaic (no Landsat / Sentinel-2 pass catalogued here)";
  }
  $("recent-older").disabled = !p || idx >= recent.passes.length - 1;
  $("recent-newer").disabled = !p || idx <= 0;
}

async function refreshRecent() {
  const seq = ++recent.seq;
  const c = map.getCenter();
  recent.queried = { lat: c.lat, lng: c.lng };
  $("recent-source").textContent = "Searching NASA's catalog for recent passes…";
  const keepDay = recent.passes[recent.idx]?.day;
  let passes = [];
  try { passes = await searchPasses(c.lat, c.lng); } catch { /* offline — VIIRS fallback below */ }
  if (seq !== recent.seq || !recent.open) return;
  recent.passes = passes;
  const kept = keepDay ? passes.findIndex(p => p.day === keepDay) : -1;
  applyPass(kept >= 0 ? kept : pickPass(passes));
}

function openRecent() {
  if (!map.getSource("recent-hls")) { toast("LATEST PASS UNAVAILABLE"); return; }
  closeSearch();
  closeIntel();
  closePassport();
  closeWayback();
  closePole();
  if (state.playing && !state.transitioning) setPlaying(false);
  recent.open = true;
  recent.comparing = false;
  $("recent-compare").classList.remove("active");
  $("recent").hidden = false;
  $("recent-label").textContent = "LATEST PASS";
  if (map.getZoom() > HLS_MAX_LEVEL) {
    recent.savedZoom = map.getZoom();
    map.easeTo({ zoom: HLS_MAX_LEVEL, duration: 1200 }); // 30 m pixels need room
  } else {
    recent.savedZoom = null;
  }
  refreshRecent();
}

// restore=false when the tour is moving on anyway (presentPlace jumps next)
function closeRecent(restore = true) {
  if (!recent.open) return;
  recent.open = false;
  recent.seq++;
  $("recent").hidden = true;
  const id = recent.active;
  recent.active = null;
  if (id) {
    map.setPaintProperty(id, "raster-opacity", 0);
    setTimeout(() => { if (recent.active !== id) map.setLayoutProperty(id, "visibility", "none"); }, 950);
  }
  if (restore && recent.savedZoom !== null) map.easeTo({ zoom: recent.savedZoom, duration: 1200 });
  recent.savedZoom = null;
}

function toggleRecent() {
  recent.open ? closeRecent() : openRecent();
}

function stepRecent(dir) { // +1 = older pass, -1 = newer
  if (!recent.open || !recent.passes.length) return;
  const idx = Math.max(0, Math.min(recent.passes.length - 1, recent.idx + dir));
  if (idx !== recent.idx) applyPass(idx);
}

// Hold the archive up against the fresh pass: same spot, years apart.
function toggleRecentCompare() {
  if (!recent.open || !recent.active) return;
  recent.comparing = !recent.comparing;
  $("recent-compare").classList.toggle("active", recent.comparing);
  map.setPaintProperty(recent.active, "raster-opacity", recent.comparing ? 0 : 1);
}

// Wander far enough and the catalog is asked again for the new spot.
let recentMoveTimer;
map.on("moveend", () => {
  if (!recent.open || !recent.queried) return;
  const c = map.getCenter();
  const moved = Math.abs(c.lat - recent.queried.lat) + Math.abs(c.lng - recent.queried.lng);
  if (moved < 0.06) return;
  clearTimeout(recentMoveTimer);
  recentMoveTimer = setTimeout(() => { if (recent.open) refreshRecent(); }, 600);
});

$("recent-close").addEventListener("click", () => closeRecent());
$("recent-older").addEventListener("click", () => stepRecent(1));
$("recent-newer").addEventListener("click", () => stepRecent(-1));
$("recent-compare").addEventListener("click", toggleRecentCompare);
