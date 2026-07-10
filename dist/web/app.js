/* DRIFT — an ambient atlas.
   Esri World Imagery + curated places + mystery dossiers. */

"use strict";

const ESRI_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABEL_TILES = ["a", "b", "c", "d"].map(
  s => `https://${s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png`
);

// Host settings arrive as query params (?mode=mystery&dwell=45&labels=1).
const PARAMS = new URLSearchParams(location.search);
const DWELL_MS = Math.max(15, parseInt(PARAMS.get("dwell"), 10) || 55) * 1000;
const DWELL_MYSTERY_MS = DWELL_MS + 25000;
const HOSTED = !!window.chrome?.webview; // running inside the .scr wrapper
const FADE_MS = 950;
const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Rough continental boxes for "deep field" random mode, weighted by land area.
const LAND_BOXES = [
  { w: 5, latMin: 25, latMax: 60, lngMin: -125, lngMax: -70 },  // North America
  { w: 4, latMin: -40, latMax: 5, lngMin: -75, lngMax: -45 },   // South America
  { w: 3, latMin: 36, latMax: 60, lngMin: -10, lngMax: 30 },    // Europe
  { w: 6, latMin: -30, latMax: 30, lngMin: -15, lngMax: 45 },   // Africa
  { w: 7, latMin: 10, latMax: 55, lngMin: 45, lngMax: 135 },    // Asia
  { w: 2, latMin: -10, latMax: 20, lngMin: 95, lngMax: 140 },   // SE Asia
  { w: 2, latMin: -38, latMax: -15, lngMin: 115, lngMax: 150 }, // Australia
];

const $ = id => document.getElementById(id);

const state = {
  mode: "tour",            // tour | mystery | random
  playlist: [],
  cursor: -1,
  history: [],
  histPos: -1,
  playing: true,
  expedition: null,
  transitioning: false,
  generation: 0,
  dwellStart: 0,
  dwellLength: DWELL_MS,
  dwellElapsed: 0,
  current: null,
  labelsOn: false,
  intelCache: new Map(),
};

/* ---------------- Map ---------------- */

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      esri: {
        type: "raster",
        tiles: [ESRI_TILES],
        tileSize: 256,
        maxzoom: 19,
        attribution: "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      },
      labels: {
        type: "raster",
        tiles: LABEL_TILES,
        tileSize: 256,
        maxzoom: 19,
        attribution: "Labels © CARTO, © OpenStreetMap contributors",
      },
    },
    layers: [
      { id: "esri", type: "raster", source: "esri" },
      { id: "labels", type: "raster", source: "labels", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9 } },
    ],
  },
  center: [0, 20],
  zoom: 2,
  minZoom: 1,
  maxZoom: 18.5,
  keyboard: false,
  preserveDrawingBuffer: true, // lets EXPORT CARD snapshot the map
  attributionControl: { compact: true },
});

/* ---------------- Playlist ---------------- */

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rebuildPlaylist() {
  if (state.expedition) {
    // expeditions play in curated order, not shuffled
    state.playlist = PLACES.filter(p => p.exp === state.expedition);
  } else {
    const pool = state.mode === "mystery"
      ? PLACES.filter(p => p.category === "mystery")
      : PLACES;
    state.playlist = shuffled(pool);
  }
  state.cursor = -1;
}

const EXPEDITIONS = [
  [null, ""],
  ["water", "VANISHING WATER"],
  ["mega", "MEGAPROJECTS RISING"],
  ["blurred", "GOOGLE BLURRED IT"],
];

function cycleExpedition() {
  const i = EXPEDITIONS.findIndex(e => e[0] === state.expedition);
  const [key, label] = EXPEDITIONS[(i + 1) % EXPEDITIONS.length];
  state.expedition = key;
  if (key) state.mode = "tour";
  rebuildPlaylist();
  setModeChip();
  toast(key ? `EXPEDITION — ${label}` : "EXPEDITION ENDED — RESUMING WORLD TOUR");
  advance(1);
}

function weightedBox() {
  const total = LAND_BOXES.reduce((s, b) => s + b.w, 0);
  let r = Math.random() * total;
  for (const b of LAND_BOXES) {
    if ((r -= b.w) <= 0) return b;
  }
  return LAND_BOXES[0];
}

async function randomPlace() {
  const b = weightedBox();
  const lat = b.latMin + Math.random() * (b.latMax - b.latMin);
  const lng = b.lngMin + Math.random() * (b.lngMax - b.lngMin);
  const offset = Math.round(lng / 15);
  const place = {
    id: `rnd-${lat.toFixed(3)}-${lng.toFixed(3)}`,
    name: "Uncharted Stop",
    region: "Somewhere on Earth",
    lat, lng,
    zoom: 10.5 + Math.random() * 3,
    tz: `Etc/GMT${offset <= 0 ? "+" + (-offset) : "-" + offset}`, // Etc/GMT signs are inverted
    wiki: null,
    category: "random",
    blurb: "A place the tour has never seen before. Neither have you, probably.",
  };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&zoom=10&accept-language=en`
    );
    if (res.ok) {
      const geo = await res.json();
      if (geo.address) {
        const a = geo.address;
        const local = a.city || a.town || a.village || a.county || a.state_district || a.state || a.region;
        place.name = local || "Open Country";
        place.region = [a.state && a.state !== local ? a.state : null, a.country].filter(Boolean).join(", ") || "Somewhere on Earth";
      } else {
        place.name = "Open Water";
        place.region = "The World Ocean";
        place.zoom = 7;
        place.blurb = "Mostly ocean, this planet. The dice were always going to land here eventually.";
      }
    }
  } catch { /* offline or rate-limited — coordinates still work */ }
  return place;
}

/* ---------------- HUD ---------------- */

function showCard(el) {
  el.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
}

function hideCard(el) {
  el.classList.remove("show");
  setTimeout(() => { el.hidden = true; }, 650);
}

function fmtCoords(lat, lng) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}  ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

function updateHUD(place) {
  const card = $("place-card");
  const dossier = $("dossier");
  hideCard(card);
  hideCard(dossier);

  updateCardLinks(place);
  setTimeout(() => {
    if (place.dossier) {
      $("dossier-file").textContent = `CASE FILE ${place.dossier.file}`;
      $("dossier-region").textContent = place.region;
      $("dossier-name").textContent = place.name;
      $("dossier-claim").textContent = place.dossier.claim;
      $("dossier-lore").textContent = place.dossier.lore;
      $("dossier-truth").textContent = place.dossier.truth;
      $("dossier-coords").textContent = fmtCoords(place.lat, place.lng);
      $("dossier-credit").textContent = place.credit ? `FILED BY ${place.credit}` : "";
      $("dossier-pole").hidden = place.id !== "agartha";
      showCard(dossier);
    } else {
      $("place-region").textContent = place.region;
      $("place-name").textContent = place.name;
      $("place-blurb").textContent = place.blurb || "";
      $("place-credit").textContent = place.credit ? `FILED BY ${place.credit}` : "";
      $("place-coords").textContent = fmtCoords(place.lat, place.lng);
      showCard(card);
    }
  }, 700);
}

// WMO weather interpretation codes, abridged.
const WMO = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Light showers", 81: "Showers", 82: "Violent showers", 85: "Snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

const weatherCache = new Map();

async function fetchWeather(place) {
  const hit = weatherCache.get(place.id);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.data;
  const url = "https://api.open-meteo.com/v1/forecast"
    + `?latitude=${place.lat.toFixed(4)}&longitude=${place.lng.toFixed(4)}`
    + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code"
    + "&daily=sunrise,sunset&forecast_days=1&timezone=auto";
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather " + res.status);
  const d = await res.json();
  const data = {
    temp: Math.round(d.current.temperature_2m),
    feels: Math.round(d.current.apparent_temperature),
    humidity: Math.round(d.current.relative_humidity_2m),
    wind: Math.round(d.current.wind_speed_10m),
    desc: WMO[d.current.weather_code] || "",
    sunrise: (d.daily.sunrise[0] || "").slice(11, 16),
    sunset: (d.daily.sunset[0] || "").slice(11, 16),
  };
  weatherCache.set(place.id, { at: Date.now(), data });
  return data;
}

const cToF = c => Math.round(c * 9 / 5 + 32);

/* ---------------- Imagery vintage ---------------- */

// Esri's World Imagery service can be identify-queried for the capture
// metadata of whatever photo is on screen at a point.
const SAT_NAMES = {
  WV01: "WorldView-1", WV02: "WorldView-2", WV03: "WorldView-3", WV04: "WorldView-4",
  GE01: "GeoEye-1", PNEO: "Pléiades Neo",
};

function satName(code) {
  if (!code) return null;
  if (SAT_NAMES[code]) return SAT_NAMES[code];
  if (code.startsWith("LG")) return "WorldView Legion";
  if (code.startsWith("PHR")) return "Pléiades";
  if (code.startsWith("SP")) return "SPOT";
  return code;
}

function imageryAge(date) {
  const days = Math.round((Date.now() - date.getTime()) / 86400000);
  if (days < 60) return `${days} days old`;
  if (days < 730) return `${Math.round(days / 30.4)} months old`;
  return `${(days / 365.25).toFixed(1)} years old`;
}

const LIVE_IMAGERY_SERVICE = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";

// Works against the live World Imagery service and against any Wayback
// release's metadata service — the older ones use SRC_* field names.
// The extent is synthesized at a close-up scale even when the map is zoomed
// out: the metadata layers only answer at street-ish scales, and "what's the
// sharp imagery of this spot" is the question we're really asking.
async function fetchImageryInfo(lat, lng, service = LIVE_IMAGERY_SERVICE) {
  const c = map.getContainer();
  const w = Math.max(c.clientWidth, 400);
  const h = Math.max(c.clientHeight, 300);
  const z = Math.max(map.getZoom(), 14.5);
  const degPerPx = 360 / (2 ** z * 512);
  const lngSpan = (w * degPerPx) / 2;
  const latSpan = ((h * degPerPx) / 2) * Math.cos((lat * Math.PI) / 180);
  const url = `${service}/identify`
    + `?geometry=${lng.toFixed(6)},${lat.toFixed(6)}&geometryType=esriGeometryPoint&sr=4326`
    + `&tolerance=1&mapExtent=${(lng - lngSpan).toFixed(6)},${(lat - latSpan).toFixed(6)},${(lng + lngSpan).toFixed(6)},${(lat + latSpan).toFixed(6)}`
    + `&imageDisplay=${w},${h},96&returnGeometry=false&f=json&layers=all`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const rows = (data.results || []).map(r => r.attributes).filter(Boolean);
  if (!rows.length) return null;
  // prefer the metadata row covering the CURRENT zoom (what's on screen);
  // otherwise the sharpest available
  const zNow = Math.round(map.getZoom());
  const inRange = rows.filter(a => {
    const lo = Number(a.MinMapLevel), hi = Number(a.MaxMapLevel);
    return Number.isFinite(lo) && Number.isFinite(hi) && zNow >= lo && zNow <= hi;
  });
  const byRes = arr => arr.slice().sort((x, y) =>
    (parseFloat(x["RESOLUTION (M)"] || x.SRC_RES) || 99) - (parseFloat(y["RESOLUTION (M)"] || y.SRC_RES) || 99));
  const rest = rows.filter(a => !inRange.includes(a));
  // first candidate with an actual capture date wins; undated mosaic rows
  // (common at wide zooms) fall through to the dated high-res imagery
  let attrs = null, raw = "";
  for (const a of [...byRes(inRange), ...byRes(rest)]) {
    const d = String(a["DATE (YYYYMMDD)"] || a.SRC_DATE || "");
    if (/^\d{8}$/.test(d)) { attrs = a; raw = d; break; }
  }
  if (!attrs) return null;
  const date = new Date(+raw.slice(0, 4), +raw.slice(4, 6) - 1, +raw.slice(6, 8));
  const resolution = attrs["RESOLUTION (M)"] || attrs.SRC_RES;
  return {
    date,
    sat: satName(attrs.DESCRIPTION || attrs.SRC_DESC),
    res: resolution ? `${resolution} m/px` : null,
    provider: attrs.SOURCE || attrs.NICE_DESC || null,
  };
}

function renderImagery(place) {
  const els = [$("place-imagery"), $("dossier-imagery")];
  for (const el of els) el.textContent = "";
  fetchImageryInfo(place.lat, place.lng).then(info => {
    if (state.current !== place || !info) return;
    const when = info.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const line = ["IMAGE " + when, imageryAge(info.date), info.sat, info.res].filter(Boolean).join(" · ");
    for (const el of els) el.textContent = line;
  }).catch(() => {});
}

function renderWeather(place, attempt = 0) {
  const els = [$("place-weather"), $("dossier-weather")];
  if (attempt === 0) for (const el of els) el.textContent = "";
  fetchWeather(place).then(w => {
    if (state.current !== place) return; // tour moved on while we fetched
    const line = `${w.temp}°C / ${cToF(w.temp)}°F · ${w.desc} · ☀ ${w.sunrise} – ${w.sunset}`;
    for (const el of els) el.textContent = line;
  }).catch(() => {
    if (attempt < 2 && state.current === place) setTimeout(() => renderWeather(place, attempt + 1), 3000);
  });
}

function updateClock() {
  const tz = state.current?.tz;
  if (!tz) return;
  try {
    $("clock-local").textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: tz,
    }).format(new Date());
  } catch {
    $("clock-local").textContent = "--:--";
  }
}

function setModeChip() {
  const chip = $("mode-chip");
  chip.classList.toggle("mystery", state.mode === "mystery" || !!state.expedition);
  chip.textContent = state.expedition
    ? "EXPEDITION · " + (EXPEDITIONS.find(e => e[0] === state.expedition) || [])[1]
    : { tour: "WORLD TOUR", mystery: "MYSTERY FILES", random: "DEEP FIELD // RANDOM", golden: "GOLDEN HOUR" }[state.mode];
}

let toastTimer;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.hidden = false;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => { el.hidden = true; }, 450);
  }, 2600);
}

/* ---------------- Camera ---------------- */

function fadeToBlack() {
  $("fader").classList.remove("clear");
  return new Promise(r => setTimeout(r, REDUCED_MOTION ? 250 : FADE_MS));
}

function fadeIn() {
  $("fader").classList.add("clear");
}

function awaitTiles(timeoutMs = 3500) {
  return new Promise(resolve => {
    const t = setTimeout(done, timeoutMs);
    function done() { clearTimeout(t); map.off("idle", done); resolve(); }
    map.once("idle", done);
  });
}

function startDrift(durationMs) {
  if (REDUCED_MOTION || durationMs < 4000) return;
  const px = 70 + Math.random() * 60;
  const angle = Math.random() * Math.PI * 2;
  const p = map.project(map.getCenter());
  const target = map.unproject({ x: p.x + Math.cos(angle) * px, y: p.y + Math.sin(angle) * px });
  map.easeTo({
    center: target,
    zoom: map.getZoom() + (Math.random() * 0.55 - 0.2),
    bearing: map.getBearing() + (Math.random() * 12 - 6),
    duration: durationMs + 2000,
    easing: t => t,
  });
}

/* ---------------- Tour engine ---------------- */

async function presentPlace(place, gen) {
  state.transitioning = true;
  await fadeToBlack();
  if (gen !== state.generation) return;

  map.jumpTo({ center: [place.lng, place.lat], zoom: place.zoom, bearing: 0, pitch: 0 });
  state.current = place;
  updateClock();
  await awaitTiles();
  if (gen !== state.generation) return;

  fadeIn();
  console.log("[drift] presenting:", place.name);
  clearMarker();
  closeWayback(); // new stop, back to the present
  updateHUD(place);
  renderWeather(place);
  renderImagery(place);
  closeIntel();
  closePassport();

  state.dwellLength = place.dossier ? DWELL_MYSTERY_MS : DWELL_MS;
  state.dwellStart = performance.now();
  state.dwellElapsed = 0;
  state.transitioning = false;
  startDrift(state.dwellLength);
}

async function advance(direction = 1) {
  const gen = ++state.generation;
  state.playing = true;

  let place;
  if (direction < 0 && state.histPos > 0) {
    state.histPos--;
    place = state.history[state.histPos];
  } else if (state.histPos < state.history.length - 1) {
    state.histPos++;
    place = state.history[state.histPos];
  } else {
    if (state.mode === "random") {
      const pending = randomPlace();
      await fadeToBlack();          // geocode while the screen is dark
      place = await pending;
    } else if (state.mode === "golden") {
      place = pickGoldenPlace();
    } else {
      state.cursor++;
      if (state.cursor >= state.playlist.length) rebuildPlaylist(), state.cursor = 0;
      place = state.playlist[state.cursor];
    }
    if (gen !== state.generation) return;
    state.history.push(place);
    if (state.history.length > 200) state.history.shift();
    state.histPos = state.history.length - 1;
  }
  await presentPlace(place, gen);
}

function setPlaying(playing) {
  state.playing = playing;
  if (playing) {
    state.dwellStart = performance.now() - state.dwellElapsed;
    startDrift(state.dwellLength - state.dwellElapsed);
    toast("TOUR RESUMED");
  } else {
    map.stop();
    toast("PAUSED — EXPLORE FREELY · SPACE TO RESUME");
  }
}

// Master loop: dwell countdown + progress bar.
function tick() {
  if (state.playing && !state.transitioning && state.current) {
    state.dwellElapsed = performance.now() - state.dwellStart;
    const remain = Math.max(0, 1 - state.dwellElapsed / state.dwellLength);
    $("progress-fill").style.transform = `scaleX(${remain})`;
    if (state.dwellElapsed >= state.dwellLength) advance(1);
  }
  requestAnimationFrame(tick);
}

/* ---------------- Intel panel (Wikipedia) ---------------- */

function closeIntel() {
  $("intel-panel").classList.remove("open");
}

// Country flag emoji from an ISO alpha-2 code — pure Unicode, no API.
const flagEmoji = code =>
  String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));

// Resolve the country under a place (lazily, cached on the place object),
// then pull national statistics from Wikidata — free, keyless, and it knows
// the form of government, which most country APIs don't.
async function countryFacts(place) {
  if (place.countryCode === undefined) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${place.lat.toFixed(4)}&lon=${place.lng.toFixed(4)}&zoom=3&accept-language=en`
      );
      const geo = res.ok ? await res.json() : null;
      place.countryCode = (geo && geo.address && geo.address.country_code) || null;
      place.country = (geo && geo.address && geo.address.country) || null;
    } catch { return null; }
  }
  if (!place.countryCode) return null; // international waters

  const query = `SELECT ?countryLabel (MAX(?population) AS ?pop) (MAX(?area) AS ?areaKm2)
  (GROUP_CONCAT(DISTINCT ?capitalLabel; separator=", ") AS ?capitals)
  (GROUP_CONCAT(DISTINCT ?govLabel; separator=", ") AS ?gov)
  (GROUP_CONCAT(DISTINCT ?langLabel; separator=", ") AS ?langs)
  (GROUP_CONCAT(DISTINCT ?currLabel; separator=", ") AS ?currs)
WHERE {
  ?country wdt:P297 "${place.countryCode.toUpperCase()}" .
  ?country rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en")
  OPTIONAL { ?country wdt:P1082 ?population . }
  OPTIONAL { ?country wdt:P2046 ?area . }
  OPTIONAL { ?country wdt:P36 ?capital . ?capital rdfs:label ?capitalLabel . FILTER(LANG(?capitalLabel) = "en") }
  OPTIONAL { ?country wdt:P122 ?govForm . ?govForm rdfs:label ?govLabel . FILTER(LANG(?govLabel) = "en") }
  OPTIONAL { ?country wdt:P37 ?lang . ?lang rdfs:label ?langLabel . FILTER(LANG(?langLabel) = "en") }
  OPTIONAL { ?country wdt:P38 ?curr . ?curr rdfs:label ?currLabel . FILTER(LANG(?currLabel) = "en") }
}
GROUP BY ?countryLabel`;

  const res = await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query));
  if (!res.ok) return null;
  const data = await res.json();
  const b = data.results && data.results.bindings && data.results.bindings[0];
  if (!b || !b.countryLabel) return null;
  const val = k => (b[k] && b[k].value) || null;
  return {
    name: val("countryLabel"),
    gov: val("gov"),
    capital: val("capitals"),
    population: val("pop") ? Number(val("pop")).toLocaleString("en") : null,
    area: val("areaKm2") ? `${Math.round(Number(val("areaKm2"))).toLocaleString("en")} km²` : null,
    languages: val("langs"),
    currency: val("currs"),
  };
}

async function loadIntel(place) {
  if (state.intelCache.has(place.id)) return state.intelCache.get(place.id);

  const frag = document.createDocumentFragment();
  const addH3 = txt => { const h = document.createElement("h3"); h.textContent = txt; frag.appendChild(h); };
  const addP = txt => { const p = document.createElement("p"); p.textContent = txt; frag.appendChild(p); };
  const addFacts = rows => {
    const ul = document.createElement("ul");
    for (const [label, value] of rows) {
      if (!value) continue;
      const li = document.createElement("li");
      const l = document.createElement("span");
      l.className = "fact-label";
      l.textContent = label;
      const v = document.createElement("span");
      v.className = "fact-value";
      v.textContent = value;
      li.append(l, v);
      ul.appendChild(li);
    }
    frag.appendChild(ul);
  };

  if (place.wiki) {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${place.wiki}`);
      if (res.ok) {
        const data = await res.json();
        addH3("From the archive");
        addP(data.extract || "No summary on file.");
      }
    } catch { addP("Archive unreachable."); }
  }

  // National statistics + a one-paragraph country profile.
  try {
    const facts = await countryFacts(place);
    if (facts) {
      addH3("Country file");
      addFacts([
        ["Country", `${flagEmoji(place.countryCode)} ${facts.name || place.country}`.trim()],
        ["Government", facts.gov],
        ["Capital", facts.capital],
        ["Population", facts.population],
        ["Area", facts.area],
        ["Languages", facts.languages],
        ["Currency", facts.currency],
      ]);
      const countryName = facts.name || place.country;
      if (countryName && countryName !== place.name) {
        try {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.extract) addP(data.extract);
          }
        } catch { }
      }
    }
  } catch { /* stateless places exist — oceans, phantom islands */ }

  // Full current conditions (the card only shows the short version).
  try {
    const w = await fetchWeather(place);
    addH3("Conditions now");
    addFacts([
      ["Temperature", `${w.temp}°C / ${cToF(w.temp)}°F`],
      ["Feels like", `${w.feels}°C / ${cToF(w.feels)}°F`],
      ["Sky", w.desc],
      ["Humidity", `${w.humidity}%`],
      ["Wind", `${w.wind} km/h`],
      ["Daylight", `${w.sunrise} – ${w.sunset}`],
    ]);
  } catch { }

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${place.lat}%7C${place.lng}&gsradius=10000&gslimit=8&format=json&origin=*`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const hits = data?.query?.geosearch || [];
      if (hits.length) {
        addH3("Nearby on record");
        const ul = document.createElement("ul");
        for (const h of hits) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title)}`;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = h.title;
          a.style.color = "inherit";
          const dist = document.createElement("span");
          dist.className = "dist";
          dist.textContent = h.dist >= 1000 ? `${(h.dist / 1000).toFixed(1)} km` : `${Math.round(h.dist)} m`;
          li.append(a, dist);
          ul.appendChild(li);
        }
        frag.appendChild(ul);
      }
    }
  } catch { /* offline — leave what we have */ }

  if (!frag.childNodes.length) addP("Nothing on record within 10 km. That is either very boring or very interesting.");

  // community: anyone can propose this spot for the atlas via a GitHub form
  const submit = document.createElement("p");
  submit.className = "intel-submit";
  const sa = document.createElement("a");
  sa.href = `${REPO_URL}/issues/new?template=submit-spot.yml`
    + `&title=${encodeURIComponent("[Spot] " + place.name)}`
    + `&coordinates=${encodeURIComponent(place.lat.toFixed(5) + ", " + place.lng.toFixed(5))}`;
  sa.target = "_blank";
  sa.rel = "noopener";
  sa.textContent = "Log a find or an inconsistency here →";
  submit.appendChild(sa);
  frag.appendChild(submit);

  state.intelCache.set(place.id, frag);
  return frag;
}

async function toggleIntel() {
  const panel = $("intel-panel");
  if (panel.classList.contains("open")) return closeIntel();
  if (!state.current) return;

  panel.hidden = false;
  panel.classList.add("open");
  const content = $("intel-content");
  content.innerHTML = "<p class='intel-loading'>Querying archives…</p>";
  const place = state.current;
  const frag = await loadIntel(place);
  if (state.current === place) {
    content.innerHTML = "";
    content.appendChild(frag.cloneNode(true));
  }
}

/* ---------------- Golden hour ---------------- */

// Solar altitude in degrees (declination + hour angle; skips the equation of
// time, which is ±15 min — close enough to chase sunsets with).
function solarAltitude(lat, lng, date) {
  const rad = Math.PI / 180;
  const doy = (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000;
  const decl = 23.45 * Math.sin(rad * (360 / 365) * (284 + doy));
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const hourAngle = (((utcHours + lng / 15 + 24) % 24) - 12) * 15;
  const sinAlt = Math.sin(lat * rad) * Math.sin(decl * rad)
    + Math.cos(lat * rad) * Math.cos(decl * rad) * Math.cos(hourAngle * rad);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) / rad;
}

// Prefer places where the sun sits between -4° and +8° (golden/blue hour);
// fall back to whoever is closest so the mode never starves.
function pickGoldenPlace() {
  const now = new Date();
  const recent = new Set(state.history.slice(-8).map(p => p.id));
  const scored = PLACES
    .filter(p => !recent.has(p.id))
    .map(p => ({ p, alt: solarAltitude(p.lat, p.lng, now) }))
    .sort((a, b) => Math.abs(a.alt - 2) - Math.abs(b.alt - 2));
  const inBand = scored.filter(x => x.alt > -4 && x.alt < 8);
  const pool = (inBand.length ? inBand : scored).slice(0, 5);
  return pool[Math.floor(Math.random() * pool.length)].p;
}

/* ---------------- Modes & pins ---------------- */

function setMode(mode) {
  state.expedition = null; // picking a mode ends any expedition
  state.mode = state.mode === mode ? "tour" : mode;
  rebuildPlaylist();
  setModeChip();
  toast({
    mystery: "MYSTERY FILES OPENED",
    random: "DEEP FIELD ENGAGED",
    golden: "CHASING THE SUN",
    tour: "RESUMING WORLD TOUR",
  }[state.mode]);
  advance(1);
}

function getPins() {
  return JSON.parse(localStorage.getItem("drift-pins") || "[]");
}

function pinCurrent() {
  if (!state.current) return;
  const pins = getPins();
  if (!pins.some(p => p.id === state.current.id)) {
    const c = state.current;
    pins.push({ id: c.id, name: c.name, region: c.region, lat: c.lat, lng: c.lng, zoom: c.zoom, tz: c.tz });
    localStorage.setItem("drift-pins", JSON.stringify(pins));
  }
  toast(`PINNED — ${pins.length} IN PASSPORT`);
}

/* ---------------- Passport panel ---------------- */

function closePassport() {
  $("passport").classList.remove("open");
}

function visitPin(pin) {
  const place = PLACES.find(p => p.id === pin.id) || {
    id: pin.id, name: pin.name, region: pin.region || "Pinned place",
    lat: pin.lat, lng: pin.lng, zoom: pin.zoom || 12, tz: pin.tz || null,
    wiki: null, category: "pin", blurb: "One of yours.",
  };
  closePassport();
  state.playing = false;
  state.history.push(place);
  state.histPos = state.history.length - 1;
  presentPlace(place, ++state.generation);
}

// The community field log: every find and inconsistency people have filed,
// public and trackable (GitHub issues wearing a trench coat).
async function loadFieldLog(container) {
  const status = document.createElement("p");
  status.className = "intel-loading";
  status.textContent = "Checking the log…";
  container.appendChild(status);
  try {
    const res = await fetch(
      `https://api.github.com/repos/darcy0408/drift-screensaver/issues?labels=spot-submission&state=open&per_page=15`
    );
    if (!res.ok) throw new Error();
    const entries = await res.json();
    status.remove();
    if (!entries.length) {
      const p = document.createElement("p");
      p.className = "intel-loading";
      p.textContent = "No entries yet — open a spot's MORE INTEL and file the first one.";
      container.appendChild(p);
      return;
    }
    const ul = document.createElement("ul");
    for (const it of entries) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = it.html_url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = it.title.replace(/^\[Spot\]\s*/i, "");
      const n = document.createElement("span");
      n.className = "dist";
      n.textContent = it.comments ? `${it.comments} 💬` : "";
      li.append(a, n);
      ul.appendChild(li);
    }
    container.appendChild(ul);
  } catch {
    status.textContent = "Log unreachable right now.";
  }
}

// Fresh passes: which atlas places have the newest photography right now.
// Samples the atlas and asks Esri for capture dates; cached for 12 hours.
async function loadFreshPasses(container) {
  const status = document.createElement("p");
  status.className = "intel-loading";
  container.appendChild(status);
  const cached = JSON.parse(localStorage.getItem("drift-fresh") || "null");
  let items = cached && Date.now() - cached.at < 12 * 3600 * 1000 ? cached.items : null;
  if (!items) {
    status.textContent = "Checking the newest imagery…";
    const sample = shuffled(PLACES).slice(0, 14);
    const infos = await Promise.all(sample.map(p =>
      fetchImageryInfo(p.lat, p.lng)
        .then(i => i && { id: p.id, name: p.name, lat: p.lat, lng: p.lng, t: i.date.getTime(), sat: i.sat })
        .catch(() => null)));
    items = infos.filter(Boolean).sort((a, b) => b.t - a.t).slice(0, 7);
    if (items.length) localStorage.setItem("drift-fresh", JSON.stringify({ at: Date.now(), items }));
  }
  status.remove();
  if (!items || !items.length) {
    const p = document.createElement("p");
    p.className = "intel-loading";
    p.textContent = "Imagery dates unreachable right now.";
    container.appendChild(p);
    return;
  }
  const ul = document.createElement("ul");
  for (const it of items) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = it.name;
    a.addEventListener("click", e => {
      e.preventDefault();
      const place = PLACES.find(p => p.id === it.id);
      if (place) visitPin(place);
    });
    const when = document.createElement("span");
    when.className = "dist";
    when.textContent = new Date(it.t).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      + (it.sat ? ` · ${it.sat}` : "");
    li.append(a, when);
    ul.appendChild(li);
  }
  container.appendChild(ul);
}

function renderPassport() {
  const content = $("passport-content");
  content.innerHTML = "";
  const pins = getPins();

  const freshHead = document.createElement("h3");
  freshHead.textContent = "Fresh passes — newest imagery in the atlas";
  const freshBox = document.createElement("div");
  loadFreshPasses(freshBox);

  const logHead = document.createElement("h3");
  logHead.textContent = "Community field log";
  const logBox = document.createElement("div");
  loadFieldLog(logBox);

  if (!pins.length) {
    const p = document.createElement("p");
    p.className = "intel-loading";
    p.textContent = "Nothing pinned yet — press P when somewhere is worth keeping.";
    content.append(p, freshHead, freshBox, logHead, logBox);
    return;
  }
  const ul = document.createElement("ul");
  for (const pin of pins) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = pin.name;
    if (pin.region) {
      const region = document.createElement("span");
      region.className = "pin-region";
      region.textContent = pin.region;
      a.appendChild(region);
    }
    a.addEventListener("click", e => { e.preventDefault(); visitPin(pin); });
    const del = document.createElement("button");
    del.className = "pin-remove";
    del.textContent = "×";
    del.setAttribute("aria-label", "Remove " + pin.name);
    del.addEventListener("click", () => {
      localStorage.setItem("drift-pins", JSON.stringify(getPins().filter(p => p.id !== pin.id)));
      renderPassport();
    });
    li.append(a, del);
    ul.appendChild(li);
  }
  content.append(ul, freshHead, freshBox, logHead, logBox);
}

function togglePassport() {
  const panel = $("passport");
  if (panel.classList.contains("open")) return closePassport();
  panel.hidden = false;
  renderPassport();
  requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("open")));
}

/* ---------------- Input ---------------- */

// entering clean view also closes transient panels — search included
function toggleClean() {
  if (!document.body.classList.contains("clean")) {
    closeSearch();
    closeIntel();
    closePassport();
    closeWayback();
    closePole();
  }
  document.body.classList.toggle("clean");
}

// The touch bar stands in for the keyboard on phones and tablets.
if (matchMedia("(pointer: coarse)").matches) $("touchbar").hidden = false;

const MODE_CYCLE = ["tour", "mystery", "random", "golden"];
$("tb-next").addEventListener("click", () => advance(1));
$("tb-mode").addEventListener("click", () =>
  setMode(MODE_CYCLE[(MODE_CYCLE.indexOf(state.mode) + 1) % MODE_CYCLE.length]));
$("tb-time").addEventListener("click", toggleWayback);
$("tb-hide").addEventListener("click", toggleClean);

let hintTimer;
function scheduleHintFade() {
  $("controls-hint").classList.remove("faded");
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => $("controls-hint").classList.add("faded"), 12000);
}

// Hide the cursor after a few idle seconds, like a proper screensaver.
let cursorTimer;
function wakeCursor() {
  document.body.classList.remove("no-cursor");
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => document.body.classList.add("no-cursor"), 4500);
}
document.addEventListener("mousemove", wakeCursor);
wakeCursor();

// Nudge-panning: key auto-repeat restarts a short linear glide, so holding
// a key reads as continuous motion (~600 px/s).
function panMap(dx, dy) {
  if (state.playing && !state.transitioning) setPlaying(false);
  map.panBy([dx, dy], { duration: 200, easing: t => t });
}

const PAN_STEP = 120;

document.addEventListener("keydown", e => {
  if (e.target instanceof HTMLInputElement) return; // typing in search, not steering
  scheduleHintFade();
  switch (e.key) {
    case "/": e.preventDefault(); toggleSearch(); break;
    case "h": case "H": toggleClean(); break;
    case "ArrowRight": case "d": case "D":
      e.preventDefault();
      if (e.key.startsWith("Arrow") && !$("wayback").hidden) stepWayback(1);
      else panMap(PAN_STEP, 0);
      break;
    case "ArrowLeft": case "a": case "A":
      e.preventDefault();
      if (e.key.startsWith("Arrow") && !$("wayback").hidden) stepWayback(-1);
      else panMap(-PAN_STEP, 0);
      break;
    case "ArrowUp": case "w": case "W": e.preventDefault(); panMap(0, -PAN_STEP); break;
    case "ArrowDown": case "s": case "S": e.preventDefault(); panMap(0, PAN_STEP); break;
    case "n": case "N": case "PageDown": advance(1); break;
    case "b": case "B": case "PageUp": advance(-1); break;
    case " ": e.preventDefault(); setPlaying(!state.playing); break;
    case "i": case "I": case "Tab": e.preventDefault(); toggleIntel(); break;
    case "m": case "M": setMode("mystery"); break;
    case "r": case "R": setMode("random"); break;
    case "g": case "G": setMode("golden"); break;
    case "v": case "V": togglePassport(); break;
    case "x": case "X": toggleForts(); break;
    case "e": case "E": cycleExpedition(); break;
    case "l": case "L": {
      state.labelsOn = !state.labelsOn;
      map.setLayoutProperty("labels", "visibility", state.labelsOn ? "visible" : "none");
      toast(state.labelsOn ? "LABELS ON" : "LABELS OFF");
      break;
    }
    case "p": case "P": pinCurrent(); break;
    case "f": case "F":
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      break;
    // tap = one level; holding the key glides continuously.
    // "_" is what Shift+minus types, so zooming out works with Shift held.
    case "+": case "=": glideZoom(e.repeat ? 0.4 : 1); break;
    case "-": case "_": glideZoom(e.repeat ? -0.4 : -1); break;
    case "o": case "O": toggleWorldView(); break;
    case "t": case "T": toggleWayback(); break;
    case "Escape":
      // hosted: the .scr wrapper drives Esc via __driftEsc, don't double-fire
      if (!HOSTED) window.__driftEsc();
      break;
  }
});

$("intel-close").addEventListener("click", closeIntel);
$("passport-close").addEventListener("click", closePassport);
$("place-intel").addEventListener("click", toggleIntel);
$("dossier-intel").addEventListener("click", toggleIntel);
$("place-share").addEventListener("click", shareLink);
$("dossier-share").addEventListener("click", shareLink);

// Manual exploration pauses the tour.
for (const ev of ["dragstart", "dblclick", "touchstart"]) {
  map.on(ev, () => { if (state.playing && !state.transitioning) setPlaying(false); });
}

/* ---------------- Click to identify ---------------- */

let clickMarker = null;

function dropMarker(lngLat) {
  if (clickMarker) clickMarker.remove();
  const el = document.createElement("div");
  el.className = "click-marker";
  clickMarker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
}

function clearMarker() {
  if (clickMarker) { clickMarker.remove(); clickMarker = null; }
}

let identifySeq = 0;

async function identifyClick(lngLat) {
  const seq = ++identifySeq;
  const lat = lngLat.lat, lng = lngLat.lng;
  const offset = Math.round(lng / 15);
  const place = {
    id: `click-${lat.toFixed(4)}-${lng.toFixed(4)}`,
    name: "Somewhere", region: "Coordinates only", lat, lng,
    zoom: map.getZoom(),
    tz: `Etc/GMT${offset <= 0 ? "+" + (-offset) : "-" + offset}`,
    wiki: null, category: "click", blurb: "",
  };
  // Wikipedia geosearch runs alongside the reverse geocode: the nearest
  // article is usually the landmark a human means — the beach, the stadium,
  // the park — while Nominatim names the nearest small object (a footpath,
  // a bench) and its address chain omits enclosing features entirely.
  const wikiNearby = fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat.toFixed(5)}%7C${lng.toFixed(5)}&gsradius=300&gslimit=3&format=json&origin=*`
  ).then(r => (r.ok ? r.json() : null)).catch(() => null);

  try {
    // finer-grained reverse geocode the deeper you're zoomed; 18 = building/POI level
    const mz = map.getZoom();
    const z = mz >= 14 ? 18 : mz >= 11 ? 16 : mz >= 9 ? 12 : 8;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&zoom=${z}&accept-language=en`
    );
    let geo = null;
    if (res.ok) {
      geo = await res.json();
      const a = geo.address || {};
      place.name = geo.name || a.road || a.neighbourhood || a.suburb || a.village || a.town || a.city || a.county || a.state || "Open Water";
      place.region = [
        a.city && a.city !== place.name ? a.city : null,
        a.state && a.state !== place.name ? a.state : null,
        a.country,
      ].filter(Boolean).join(", ") || "The World Ocean";
      place.country = a.country || null;
      place.countryCode = a.country_code || null;
      place.blurb = (geo.display_name || "").split(", ").slice(0, 5).join(", ");
    }

    // Prefer the landmark when the click is on/near one: always when the
    // geocoder only found something minor, or when the article is very close.
    const MINOR_AMENITIES = new Set(["bench", "waste_basket", "bicycle_parking", "toilets", "shelter", "drinking_water", "parking", "parking_space", "vending_machine"]);
    const minor = !geo || !geo.name
      || geo.category === "highway"
      || (geo.category === "amenity" && MINOR_AMENITIES.has(geo.type))
      || (geo.category === "historic" && geo.type === "memorial");
    const wiki = await wikiNearby;
    const hit = wiki && wiki.query && wiki.query.geosearch && wiki.query.geosearch[0];
    if (hit && (minor || hit.dist < 120)) {
      place.name = hit.title;
      place.wiki = encodeURIComponent(hit.title); // intel panel gets the article too
      place.region = `Landmark · ${place.region}`;
    } else if (geo && geo.name && geo.type) {
      // otherwise lead with what kind of thing this is ("Stadium · Inglewood…")
      const POI_CATS = new Set(["leisure", "amenity", "tourism", "natural", "historic", "aeroway", "man_made", "shop", "railway", "building", "waterway", "water", "place", "boundary"]);
      if (POI_CATS.has(geo.category) && !["yes", "house"].includes(geo.type)) {
        const t = geo.type.replace(/_/g, " ");
        place.region = `${t.charAt(0).toUpperCase()}${t.slice(1)} · ${place.region}`;
      }
    }
  } catch { /* offline — coordinates still stand */ }
  if (seq !== identifySeq) return; // user clicked somewhere else meanwhile
  state.current = place;
  updateClock();
  updateHUD(place);
  renderWeather(place);
  renderImagery(place);
}

map.on("click", e => {
  if (state.transitioning) return;
  if (state.playing) setPlaying(false);
  closeIntel();
  closeSearch();
  // catalogued pins under the cursor beat a reverse geocode
  if (map.getLayer("blur-pts")) {
    const blur = map.queryRenderedFeatures(e.point, { layers: ["blur-pts"] });
    if (blur.length) { presentBlurSite(blur[0]); return; }
  }
  if (map.getLayer("starfort-pts")) {
    const hits = map.queryRenderedFeatures(e.point, { layers: ["starfort-pts"] });
    if (hits.length) { presentFort(hits[0]); return; }
  }
  dropMarker(e.lngLat);
  identifyClick(e.lngLat);
});

/* ---------------- THE CATALOGUE: 2,045 star forts ---------------- */

let fortsOn = false;

function addFortLayer() {
  if (!window.STARFORTS || map.getSource("starforts")) return;
  map.addSource("starforts", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: window.STARFORTS.map(f => ({
        type: "Feature",
        properties: { n: f.n },
        geometry: { type: "Point", coordinates: f.c },
      })),
    },
  });
  map.addLayer({
    id: "starfort-pts",
    type: "circle",
    source: "starforts",
    layout: { visibility: "none" },
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 2.5, 8, 4.5, 14, 7],
      "circle-color": "#e8c35a",
      "circle-opacity": 0.85,
      "circle-stroke-color": "#241a06",
      "circle-stroke-width": 1.2,
    },
  });
  map.on("mouseenter", "starfort-pts", () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "starfort-pts", () => { map.getCanvas().style.cursor = ""; });
}

function addBlurLayer() {
  if (!window.BLURRED || map.getSource("blursites")) return;
  map.addSource("blursites", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: window.BLURRED.map(f => ({
        type: "Feature",
        properties: { n: f.n, k: f.k, w: f.w },
        geometry: { type: "Point", coordinates: f.c },
      })),
    },
  });
  map.addLayer({
    id: "blur-pts",
    type: "circle",
    source: "blursites",
    layout: { visibility: "none" },
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 3.5, 8, 6, 14, 9],
      "circle-color": "#e05656",
      "circle-opacity": 0.9,
      "circle-stroke-color": "#2b0d0d",
      "circle-stroke-width": 1.4,
    },
  });
  map.on("mouseenter", "blur-pts", () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "blur-pts", () => { map.getCanvas().style.cursor = ""; });
}

function toggleForts() {
  if (!map.getLayer("starfort-pts")) { toast("OVERLAYS UNAVAILABLE"); return; }
  fortsOn = !fortsOn;
  const vis = fortsOn ? "visible" : "none";
  map.setLayoutProperty("starfort-pts", "visibility", vis);
  if (map.getLayer("blur-pts")) map.setLayoutProperty("blur-pts", "visibility", vis);
  toast(fortsOn
    ? `OVERLAYS — ${window.STARFORTS.length.toLocaleString("en")} STAR FORTS (AMBER) · ${(window.BLURRED || []).length} REPORTED BLUR SITES (RED)`
    : "OVERLAYS HIDDEN");
}

function presentBlurSite(feat) {
  const [lng, lat] = feat.geometry.coordinates;
  const offset = Math.round(lng / 15);
  const place = {
    id: "blur-" + lat.toFixed(4) + "-" + lng.toFixed(4),
    name: feat.properties.n,
    region: `Reported obscured — ${feat.properties.k}`,
    lat, lng,
    zoom: Math.max(map.getZoom(), 14),
    tz: `Etc/GMT${offset <= 0 ? "+" + (-offset) : "-" + offset}`,
    wiki: encodeURIComponent(feat.properties.w),
    category: "blur",
    blurb: "Catalogued as blurred or degraded on at least one map provider. Compare with G MAPS and the time machine — then log what you actually see.",
    credit: "Wikipedia — satellite censorship list",
  };
  dropMarker({ lng, lat });
  map.flyTo({ center: [lng, lat], zoom: place.zoom, duration: 2200 });
  state.current = place;
  updateClock();
  updateHUD(place);
  renderWeather(place);
  map.once("moveend", () => { if (state.current === place) renderImagery(place); });
}

function presentFort(feat) {
  const [lng, lat] = feat.geometry.coordinates;
  const offset = Math.round(lng / 15);
  const place = {
    id: "fort-" + lat.toFixed(4) + "-" + lng.toFixed(4),
    name: feat.properties.n,
    region: "Star fort — THE CATALOGUE",
    lat, lng,
    zoom: Math.max(map.getZoom(), 14.5),
    tz: `Etc/GMT${offset <= 0 ? "+" + (-offset) : "-" + offset}`,
    wiki: null, category: "fort",
    blurb: `One of ${(window.STARFORTS || []).length.toLocaleString("en")} star-fort sites logged by a worldwide community of volunteers.`,
    credit: "THE CATALOGUE by Colm Gibney · starforts.org",
  };
  dropMarker({ lng, lat });
  map.flyTo({ center: [lng, lat], zoom: place.zoom, duration: 2200 });
  state.current = place;
  updateClock();
  updateHUD(place);
  renderWeather(place);
  map.once("moveend", () => { if (state.current === place) renderImagery(place); });
}

/* ---------------- Time machine (Esri Wayback) ---------------- */

const WB = window.WAYBACK || []; // releases, oldest first; slider max = "today"
let waybackIdx = null;           // null = present-day imagery

const waybackUrl = n =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${n}/{z}/{y}/{x}`;

const fmtWaybackDate = d =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();

// "Who took this?" for the archived view under the map center.
let waybackSrcSeq = 0;

async function updateWaybackSource() {
  const el = $("wayback-source");
  if (waybackIdx === null || !WB[waybackIdx] || !WB[waybackIdx].m) { el.textContent = ""; return; }
  const seq = ++waybackSrcSeq;
  el.textContent = "…";
  const c = map.getCenter();
  const info = await fetchImageryInfo(c.lat, c.lng,
    `https://metadata.maptiles.arcgis.com/arcgis/rest/services/World_Imagery_Metadata_${WB[waybackIdx].m}/MapServer`
  ).catch(() => null);
  if (seq !== waybackSrcSeq) return;
  if (!info) { el.textContent = ""; return; }
  const when = info.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  el.textContent = ["shot " + when, info.sat, info.provider].filter(Boolean).join(" · ");
}

function setWayback(idx) {
  const src = map.getSource("esri");
  if (!src) return;
  if (idx === null || idx >= WB.length) {
    waybackIdx = null;
    src.setTiles([ESRI_TILES]);
    $("wayback-label").textContent = "TODAY";
    $("wayback-source").textContent = "";
  } else {
    waybackIdx = idx;
    src.setTiles([waybackUrl(WB[idx].n)]);
    $("wayback-label").textContent = fmtWaybackDate(WB[idx].d);
    updateWaybackSource();
  }
}

// one shared timer so opening the panel and map movement can't both kick
// off scans at once
let waybackMoveTimer;
function scheduleWaybackScan(delay) {
  clearTimeout(waybackMoveTimer);
  waybackMoveTimer = setTimeout(() => {
    if ($("wayback").hidden) return;
    if (waybackIdx !== null) updateWaybackSource();
    scanWaybackChanges();
  }, delay);
}

map.on("moveend", () => {
  if (!$("wayback").hidden) scheduleWaybackScan(500);
});

/* The slider only offers releases where THIS view actually changed.
   The tilemap endpoint reports which release truly serves a tile
   ("select"), so walking newest→oldest skips every no-change release. */

const tileXY = (lat, lng, z) => {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const rad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  const clamp = v => Math.min(Math.max(v, 0), n - 1);
  return { x: clamp(x), y: clamp(y), z };
};

let sliderMap = WB.map((_, i) => i); // slider position -> WB index; last position = TODAY
let wbScanSeq = 0;

async function computeLocalChanges() {
  const seq = ++wbScanSeq;
  const c = map.getCenter();
  const { x, y, z } = tileXY(c.lat, c.lng, Math.max(3, Math.min(Math.round(map.getZoom()), 16)));
  const byN = new Map(WB.map((r, i) => [r.n, i]));
  const found = new Set();
  let idx = WB.length - 1;
  let guard = 0;
  while (idx >= 0 && guard++ < 60) {
    let resp;
    try {
      const res = await fetch(
        `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tilemap/${WB[idx].n}/${z}/${y}/${x}`
      );
      if (!res.ok) break;
      resp = await res.json();
    } catch { return null; }
    if (seq !== wbScanSeq) return null; // superseded by a newer scan
    if (!resp || resp.valid === false || !resp.data || resp.data[0] !== 1) break;
    const effIdx = byN.has(resp.select && resp.select[0]) ? byN.get(resp.select[0]) : idx;
    found.add(effIdx);
    idx = effIdx - 1;
  }
  return seq === wbScanSeq ? [...found].sort((a, b) => a - b) : null;
}

function rebuildWaybackSlider() {
  const slider = $("wayback-slider");
  slider.max = String(sliderMap.length);
  let pos = sliderMap.length;
  if (waybackIdx !== null) {
    const at = sliderMap.findIndex(i => i >= waybackIdx);
    pos = at === -1 ? sliderMap.length - 1 : at;
  }
  slider.value = String(pos);
}

async function scanWaybackChanges() {
  $("wayback-slider").disabled = true; // no month-by-month sliding before the scan lands
  $("wayback-label").textContent = "SCANNING…";
  const scanSeq = wbScanSeq + 1; // computeLocalChanges will bump to this
  const c = map.getCenter();
  let local = await computeLocalChanges();
  if ($("wayback").hidden) return;

  // a tile can change at its edges while the photo at the view's center
  // stays the same — collapse runs that share a center capture date
  if (local && local.length > 1) {
    const infos = await Promise.all(local.map(i => WB[i].m
      ? fetchImageryInfo(c.lat, c.lng,
          `https://metadata.maptiles.arcgis.com/arcgis/rest/services/World_Imagery_Metadata_${WB[i].m}/MapServer`
        ).catch(() => null)
      : Promise.resolve(null)));
    if (wbScanSeq !== scanSeq || $("wayback").hidden) return; // superseded meanwhile
    const refined = [];
    let prevKey = "__none";
    local.forEach((wbIdx, k) => {
      const key = infos[k] ? `${infos[k].date.getTime()}|${infos[k].sat || ""}` : `unknown-${k}`;
      if (key !== prevKey) { refined.push(wbIdx); prevKey = key; }
    });
    local = refined;
  }

  if (local && local.length) {
    sliderMap = local;
    toast(`${local.length} DISTINCT IMAGES OF THIS VIEW — DRAG THE SLIDER`);
  } else {
    sliderMap = WB.map((_, i) => i); // scan failed — fall back to every release
    toast("COULD NOT SCAN THIS VIEW — SHOWING EVERY RELEASE");
  }
  rebuildWaybackSlider();
  $("wayback-slider").disabled = false;
  $("wayback-label").textContent = waybackIdx === null ? "TODAY" : fmtWaybackDate(WB[waybackIdx].d);
}

function openWayback() {
  if (!WB.length) { toast("TIME MACHINE UNAVAILABLE"); return; }
  closeSearch();
  closeIntel();
  closePassport();
  if (state.playing && !state.transitioning) setPlaying(false);
  sliderMap = WB.map((_, i) => i);
  rebuildWaybackSlider();
  $("wayback-slider").disabled = true; // unlocked when the scan lands
  $("wayback").hidden = false;
  scheduleWaybackScan(50);
}

function closeWayback() {
  $("wayback").hidden = true;
  if (waybackIdx !== null) setWayback(null); // always come home to the present
}

function toggleWayback() {
  $("wayback").hidden ? openWayback() : closeWayback();
}

let waybackTimer;
$("wayback-slider").addEventListener("input", e => {
  const pos = +e.target.value;
  const idx = pos >= sliderMap.length ? null : sliderMap[pos];
  $("wayback-label").textContent = idx === null ? "TODAY" : fmtWaybackDate(WB[idx].d);
  clearTimeout(waybackTimer); // don't reload tiles for every pixel of drag
  waybackTimer = setTimeout(() => setWayback(idx), 150);
});

$("wayback-close").addEventListener("click", closeWayback);

// arrow keys drive the timeline whenever it's open, regardless of focus
function stepWayback(dir) {
  const s = $("wayback-slider");
  if (s.disabled) return;
  const pos = Math.max(0, Math.min(+s.max, +s.value + dir));
  s.value = String(pos);
  s.dispatchEvent(new Event("input", { bubbles: true }));
}

/* ---------------- Escape, one place ----------------
   The .scr host forwards Esc here; panels close first, a second Esc
   (or Esc with nothing open) exits the screensaver. */

function anyPanelOpen() {
  return !$("search").hidden || !$("wayback").hidden || !$("pole").hidden
    || $("intel-panel").classList.contains("open")
    || $("passport").classList.contains("open");
}

window.__driftEsc = () => {
  if (anyPanelOpen()) {
    closeSearch();
    closeIntel();
    closePassport();
    closeWayback();
    closePole();
  } else if (HOSTED) {
    window.chrome.webview.postMessage("exit");
  }
};

/* ---------------- Today's Pole (NASA GIBS, polar projection) ---------------- */

// Web Mercator can't draw the poles — but NASA's VIIRS instrument photographs
// them daily, and the Worldview snapshot service renders those passes in
// polar stereographic on demand. The Hollow Earth case file's receipts.
const POLES = {
  arctic: { crs: "EPSG:3413", title: "THE NORTH POLE", wv: "arctic" },
  antarctic: { crs: "EPSG:3031", title: "THE SOUTH POLE", wv: "antarctic" },
};

function openPole(which) {
  const p = POLES[which];
  const d = new Date(Date.now() - 86400000); // yesterday: complete orbital coverage
  const day = d.toISOString().slice(0, 10);
  $("pole").hidden = false;
  $("pole-title").textContent = `${p.title} — ${day.toUpperCase()}`;
  $("pole-caption").textContent = "Fetching yesterday's satellite passes from NASA…";
  $("pole-worldview").href = `https://worldview.earthdata.nasa.gov/?p=${p.wv}`;
  $("pole-arctic").classList.toggle("active", which === "arctic");
  $("pole-antarctic").classList.toggle("active", which === "antarctic");
  const img = $("pole-img");
  img.onload = () => {
    const month = d.getUTCMonth() + 1;
    const dark = which === "antarctic" ? month >= 4 && month <= 9 : month <= 2 || month >= 11;
    $("pole-caption").textContent =
      "Photographed yesterday by the VIIRS instrument on Suomi NPP, assembled from every "
      + "orbital pass and drawn in polar stereographic — the projection Web Mercator can't. "
      + (dark
        ? "Mostly dark because the pole is deep in its months-long polar night — the sun, not a cover-up."
        : "Fully lit: the pole is in its months-long polar day right now.");
  };
  img.onerror = () => {
    if ($("pole").hidden || !img.src) return;
    $("pole-caption").textContent = "NASA's snapshot service didn't answer — try again in a minute, or open Worldview directly.";
  };
  img.src = "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot"
    + `&TIME=${day}&BBOX=-4194304,-4194304,4194304,4194304&CRS=${p.crs}`
    + "&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=1100&HEIGHT=1100";
}

function closePole() {
  $("pole").hidden = true;
  $("pole-img").removeAttribute("src");
}

$("dossier-pole").addEventListener("click", () => openPole("arctic"));
$("pole-arctic").addEventListener("click", () => openPole("arctic"));
$("pole-antarctic").addEventListener("click", () => openPole("antarctic"));
$("pole-close").addEventListener("click", closePole);

/* ---------------- Export card as image ---------------- */

function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
  const words = String(text).split(" ");
  let line = "", lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      if (++lines >= maxLines) { ctx.fillText(line.replace(/.{3}$/, "…"), x, y); return y + lineH; }
      ctx.fillText(line, x, y);
      y += lineH;
      line = words[i];
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

function exportCard() {
  const place = state.current;
  if (!place) return;
  const W = 1200, H = 1500, M = 70;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  // map snapshot, cover-fit into the top
  const mh = place.dossier ? 640 : 860;
  const mc = map.getCanvas();
  const scale = Math.max(W / mc.width, mh / mc.height);
  const sw = W / scale, sh = mh / scale;
  x.fillStyle = "#0a0b10";
  x.fillRect(0, 0, W, H);
  x.drawImage(mc, (mc.width - sw) / 2, (mc.height - sh) / 2, sw, sh, 0, 0, W, mh);
  const g = x.createLinearGradient(0, mh - 200, 0, mh + 10);
  g.addColorStop(0, "rgba(10,11,16,0)");
  g.addColorStop(1, "#0a0b10");
  x.fillStyle = g;
  x.fillRect(0, mh - 200, W, 220);

  const amber = "#e8c35a", ink = "#f0ede4", dim = "#b9b4a6", faint = "#8a867a";
  let y = mh + 40;
  x.fillStyle = amber;
  x.font = "600 24px Consolas, monospace";
  x.fillText((place.dossier ? `CASE FILE ${place.dossier.file} — ` : "") + (place.region || "").toUpperCase(), M, y);
  y += 66;
  x.fillStyle = ink;
  x.font = "300 64px 'Segoe UI', sans-serif";
  y = wrapText(x, place.name, M, y, W - 2 * M, 70, 2) + 14;

  if (place.dossier) {
    for (const [label, text, lines] of [["THE CLAIM", place.dossier.claim, 4], ["THE LORE", place.dossier.lore, 4], ["THE RECORD", place.dossier.truth, 5]]) {
      x.fillStyle = amber;
      x.font = "600 20px Consolas, monospace";
      x.fillText(label, M, y);
      y += 34;
      x.fillStyle = dim;
      x.font = "26px 'Segoe UI', sans-serif";
      y = wrapText(x, text, M, y, W - 2 * M, 36, lines) + 22;
    }
  } else if (place.blurb) {
    x.fillStyle = dim;
    x.font = "30px 'Segoe UI', sans-serif";
    y = wrapText(x, place.blurb, M, y, W - 2 * M, 42, 4) + 20;
  }

  const meta = [$("place-weather").textContent || $("dossier-weather").textContent,
    $("place-imagery").textContent || $("dossier-imagery").textContent,
    fmtCoords(place.lat, place.lng)].filter(Boolean);
  x.font = "22px Consolas, monospace";
  for (const line of meta) {
    x.fillStyle = faint;
    x.fillText(line, M, y);
    y += 34;
  }

  x.fillStyle = amber;
  x.font = "600 22px Consolas, monospace";
  x.fillText("DRIFT — AN AMBIENT ATLAS", M, H - 46);
  x.fillStyle = faint;
  const site = "darcy0408.github.io/drift-screensaver";
  x.fillText(site, W - M - x.measureText(site).width, H - 46);

  c.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `drift-${place.id}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    toast("CARD EXPORTED — CHECK YOUR DOWNLOADS");
  }, "image/png");
}

$("place-export").addEventListener("click", exportCard);
$("dossier-export").addEventListener("click", exportCard);

/* ---------------- Sharing & coordinates ---------------- */

const SITE_URL = "https://darcy0408.github.io/drift-screensaver/";
const REPO_URL = "https://github.com/darcy0408/drift-screensaver";

function shareLink() {
  const c = state.current || { lat: map.getCenter().lat, lng: map.getCenter().lng };
  const url = `${SITE_URL}?ll=${c.lat.toFixed(5)},${c.lng.toFixed(5)},${map.getZoom().toFixed(2)}`;
  navigator.clipboard.writeText(url)
    .then(() => toast("LINK COPIED — ANYONE CAN OPEN IT"))
    .catch(() => toast(url)); // clipboard blocked — at least show it
}

function updateCardLinks(place) {
  const href = `https://www.google.com/maps/@?api=1&map_action=map&center=${place.lat.toFixed(6)},${place.lng.toFixed(6)}&zoom=${Math.round(Math.min(map.getZoom(), 20))}&basemap=satellite`;
  $("place-gmaps").href = href;
  $("dossier-gmaps").href = href;
}

// fly to explicit coordinates (from a pasted link or "lat, lng")
function goToCoords(lat, lng, zoom) {
  closeSearch();
  if (state.playing) setPlaying(false);
  const z = zoom || Math.max(map.getZoom(), 14);
  dropMarker({ lng, lat });
  map.flyTo({ center: [lng, lat], zoom: z, duration: 2500 });
  map.once("moveend", () => identifyClick({ lng, lat }));
}

// recognize coordinates and Google Maps URLs pasted into search, so people
// can check a spot they found on Google against this imagery (and the
// time machine) in one paste
function parseCoordQuery(q) {
  let m = q.match(/^\s*(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)\s*$/);
  if (m && Math.abs(+m[1]) <= 90 && Math.abs(+m[2]) <= 180) {
    return { lat: +m[1], lng: +m[2], zoom: null };
  }
  m = q.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+(?:\.\d+)?)([zm]))?/); // google maps address-bar URL
  if (m) {
    const zoom = m[4] === "z" ? Math.min(+m[3], 18.5) : 15;
    return { lat: +m[1], lng: +m[2], zoom };
  }
  m = q.match(/[?&]q(?:uery)?=(-?\d+\.\d+),(-?\d+\.\d+)/); // ?q=lat,lng style links
  if (m) return { lat: +m[1], lng: +m[2], zoom: null };
  return null;
}

/* ---------------- Search ---------------- */

function openSearch() {
  const panel = $("search");
  panel.hidden = false;
  $("search-input").value = "";
  $("search-results").innerHTML = "";
  $("search-input").focus();
}

function closeSearch() {
  $("search").hidden = true;
  $("search-input").blur();
}

function toggleSearch() {
  $("search").hidden ? openSearch() : closeSearch();
}

// Light dismiss: clicking anywhere outside the search panel closes it.
document.addEventListener("mousedown", e => {
  if ($("search").hidden) return;
  if (!$("search").contains(e.target) && e.target.id !== "search-chip") closeSearch();
});

function goToSearchResult(r) {
  closeSearch();
  if (state.playing) setPlaying(false);
  const lat = Number(r.lat), lng = Number(r.lon);
  const offset = Math.round(lng / 15);
  const a = r.address || {};
  const name = r.name || (r.display_name || "").split(",")[0] || "Found it";
  const place = {
    id: `search-${r.place_id}`,
    name,
    region: (r.display_name || "").split(", ").slice(1, 4).join(", "),
    lat, lng,
    zoom: map.getZoom(),
    tz: `Etc/GMT${offset <= 0 ? "+" + (-offset) : "-" + offset}`,
    wiki: null, category: "search",
    blurb: r.display_name || "",
    country: a.country || null,
    countryCode: a.country_code || null,
  };
  dropMarker({ lng, lat });
  // the bounding box sizes the flight: a country fills the screen, a house fills the block
  const [s, n, w, e] = r.boundingbox.map(Number);
  map.fitBounds([[w, s], [e, n]], { duration: 3200, padding: 80, maxZoom: 17 });
  state.current = place;
  state.history.push(place);
  state.histPos = state.history.length - 1;
  updateClock();
  updateHUD(place);
  renderWeather(place);
  map.once("moveend", () => { if (state.current === place) renderImagery(place); });
}

async function runSearch() {
  const q = $("search-input").value.trim();
  if (!q) return;
  const coords = parseCoordQuery(q);
  if (coords) return goToCoords(coords.lat, coords.lng, coords.zoom);
  const list = $("search-results");
  list.innerHTML = "<li><span class='result-detail'>Searching…</span></li>";
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&accept-language=en`
    );
    const results = res.ok ? await res.json() : [];
    if (!results.length) {
      list.innerHTML = "<li><span class='result-detail'>Nothing found — try adding a city or country.</span></li>";
      return;
    }
    if (results.length === 1) return goToSearchResult(results[0]);
    list.innerHTML = "";
    for (const r of results) {
      const li = document.createElement("li");
      const nm = document.createElement("span");
      nm.className = "result-name";
      nm.textContent = r.name || (r.display_name || "").split(",")[0];
      const detail = document.createElement("span");
      detail.className = "result-detail";
      detail.textContent = r.display_name;
      li.append(nm, detail);
      li.addEventListener("click", () => goToSearchResult(r));
      list.appendChild(li);
    }
    list.firstChild.classList.add("first");
    list._results = results;
  } catch {
    list.innerHTML = "<li><span class='result-detail'>Search unreachable — check the connection.</span></li>";
  }
}

let searchArmed = false; // first Enter searches, second Enter takes the top result

$("search-input").addEventListener("keydown", e => {
  e.stopPropagation();
  if (e.key === "Escape") { closeSearch(); return; }
  if (e.key === "Enter") {
    const results = $("search-results")._results;
    if (searchArmed && results && results.length) {
      goToSearchResult(results[0]);
    } else {
      searchArmed = true;
      runSearch();
    }
  } else {
    searchArmed = false;
    $("search-results")._results = null;
  }
});

$("search-chip").addEventListener("click", toggleSearch);
$("search-close").addEventListener("click", closeSearch);
$("place-close").addEventListener("click", () => hideCard($("place-card")));
$("dossier-close").addEventListener("click", () => hideCard($("dossier")));

// Touchpad-aware wheel handling (replaces MapLibre's zoom-only default):
//   pinch / ctrl+scroll  -> zoom around the cursor
//   two-finger scroll    -> pan (any direction)
//   notchy mouse wheel   -> zoom (classic behavior)
map.scrollZoom.disable();

function isNotchyMouseWheel(e) {
  if (e.deltaX !== 0) return false;                    // horizontal component = touchpad
  if (e.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) return true; // line/page mode = real wheel
  return Math.abs(e.deltaY) >= 80 && Math.abs(e.deltaY) % 20 === 0; // 100/120-per-notch drivers
}

// Zooming accumulates against a target, not the live zoom — otherwise rapid
// pinch/wheel events keep restarting a barely-progressed animation and the
// map crawls no matter how hard you gesture. Time-based: any zoom input
// within 400ms of the last one stacks onto the same running target.
let zoomTarget = null;
let zoomTargetAt = 0;

function glideZoom(delta, screenPoint) {
  const now = performance.now();
  const base = zoomTarget !== null && now - zoomTargetAt < 400 ? zoomTarget : map.getZoom();
  zoomTarget = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), base + delta));
  zoomTargetAt = now;
  const opts = { zoom: zoomTarget, duration: 160, easing: t => t };
  if (screenPoint) opts.around = map.unproject(screenPoint);
  map.easeTo(opts);
}

map.getCanvasContainer().addEventListener("wheel", e => {
  e.preventDefault();
  if (state.playing && !state.transitioning) setPlaying(false);
  if (e.ctrlKey || isNotchyMouseWheel(e)) {
    const rect = map.getContainer().getBoundingClientRect();
    const delta = e.ctrlKey ? -e.deltaY * 0.025 : (e.deltaY < 0 ? 0.8 : -0.8);
    glideZoom(delta, [e.clientX - rect.left, e.clientY - rect.top]);
  } else {
    map.panBy([e.deltaX, e.deltaY], { duration: 0 });
  }
}, { passive: false });

// O swoops out to see the whole planet, then back to where you were.
let savedCamera = null;

function toggleWorldView() {
  if (state.playing && !state.transitioning) setPlaying(false);
  if (map.getZoom() > 4) {
    savedCamera = { center: map.getCenter(), zoom: map.getZoom() };
    map.flyTo({ zoom: 1.5, duration: 2500 });
    toast("WORLD VIEW — O TO RETURN");
  } else if (savedCamera) {
    map.flyTo({ center: savedCamera.center, zoom: savedCamera.zoom, duration: 2500 });
    savedCamera = null;
  }
}

/* ---------------- Boot ---------------- */

map.on("error", e => console.error("[drift] map error:", e.error ? e.error.message : e));

window.drift = { map, state, fetchWeather }; // debugging handle

map.on("load", () => {
  console.log("[drift] map loaded, starting tour");
  addFortLayer();
  addBlurLayer();
  const m = PARAMS.get("mode");
  if (["mystery", "random", "golden"].includes(m)) state.mode = m;
  if (PARAMS.get("labels") === "1") {
    state.labelsOn = true;
    map.setLayoutProperty("labels", "visibility", "visible");
  }
  // Esri credit must stay available, but after a good look it can tuck
  // itself down to the ⓘ icon (click to expand again).
  setTimeout(() => {
    const attrib = document.querySelector("details.maplibregl-ctrl-attrib");
    if (attrib) {
      attrib.removeAttribute("open");
      attrib.classList.remove("maplibregl-compact-show");
    }
  }, 10000);

  rebuildPlaylist();
  const at = PARAMS.get("at"); // deep-link: ?at=<place id> starts the tour there
  if (at) {
    const idx = state.playlist.findIndex(p => p.id === at);
    if (idx > 0) state.playlist.unshift(state.playlist.splice(idx, 1)[0]);
  }
  setModeChip();
  scheduleHintFade();
  setInterval(updateClock, 1000);
  tick();

  // shared deep link (?ll=lat,lng,zoom) opens paused at that exact spot
  const ll = (PARAMS.get("ll") || "").match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,(\d+\.?\d*))?$/);
  if (ll && Math.abs(+ll[1]) <= 90 && Math.abs(+ll[2]) <= 180) {
    state.playing = false;
    fadeIn();
    map.jumpTo({ center: [+ll[2], +ll[1]], zoom: ll[3] ? Math.min(+ll[3], 18.5) : 14 });
    dropMarker({ lng: +ll[2], lat: +ll[1] });
    identifyClick({ lng: +ll[2], lat: +ll[1] });
  } else {
    advance(1);
  }
});
