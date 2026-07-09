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
  const pool = state.mode === "mystery"
    ? PLACES.filter(p => p.category === "mystery")
    : PLACES;
  state.playlist = shuffled(pool);
  state.cursor = -1;
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

  setTimeout(() => {
    if (place.dossier) {
      $("dossier-file").textContent = `CASE FILE ${place.dossier.file}`;
      $("dossier-region").textContent = place.region;
      $("dossier-name").textContent = place.name;
      $("dossier-claim").textContent = place.dossier.claim;
      $("dossier-lore").textContent = place.dossier.lore;
      $("dossier-truth").textContent = place.dossier.truth;
      $("dossier-coords").textContent = fmtCoords(place.lat, place.lng);
      showCard(dossier);
    } else {
      $("place-region").textContent = place.region;
      $("place-name").textContent = place.name;
      $("place-blurb").textContent = place.blurb || "";
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

async function fetchImageryInfo(lat, lng) {
  const b = map.getBounds();
  const c = map.getContainer();
  const url = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/identify"
    + `?geometry=${lng.toFixed(6)},${lat.toFixed(6)}&geometryType=esriGeometryPoint&sr=4326`
    + `&tolerance=1&mapExtent=${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`
    + `&imageDisplay=${Math.round(c.clientWidth)},${Math.round(c.clientHeight)},96&returnGeometry=false&f=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const attrs = data.results && data.results[0] && data.results[0].attributes;
  if (!attrs) return null;
  const raw = String(attrs["DATE (YYYYMMDD)"] || "");
  if (!/^\d{8}$/.test(raw)) return null;
  const date = new Date(+raw.slice(0, 4), +raw.slice(4, 6) - 1, +raw.slice(6, 8));
  return {
    date,
    sat: satName(attrs.DESCRIPTION),
    res: attrs["RESOLUTION (M)"] ? `${attrs["RESOLUTION (M)"]} m/px` : null,
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
  chip.classList.toggle("mystery", state.mode === "mystery");
  chip.textContent = { tour: "WORLD TOUR", mystery: "MYSTERY FILES", random: "DEEP FIELD // RANDOM", golden: "GOLDEN HOUR" }[state.mode];
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

function renderPassport() {
  const content = $("passport-content");
  content.innerHTML = "";
  const pins = getPins();
  if (!pins.length) {
    const p = document.createElement("p");
    p.className = "intel-loading";
    p.textContent = "Nothing pinned yet — press P when somewhere is worth keeping.";
    content.appendChild(p);
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
  content.appendChild(ul);
}

function togglePassport() {
  const panel = $("passport");
  if (panel.classList.contains("open")) return closePassport();
  panel.hidden = false;
  renderPassport();
  requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("open")));
}

/* ---------------- Input ---------------- */

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
    case "h": case "H":
      // entering clean view also closes transient panels — search included
      if (!document.body.classList.contains("clean")) {
        closeSearch();
        closeIntel();
        closePassport();
        closeWayback();
      }
      document.body.classList.toggle("clean");
      break;
    case "ArrowRight": case "d": case "D": e.preventDefault(); panMap(PAN_STEP, 0); break;
    case "ArrowLeft": case "a": case "A": e.preventDefault(); panMap(-PAN_STEP, 0); break;
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
  try {
    // finer-grained reverse geocode the deeper you're zoomed
    const z = map.getZoom() >= 13 ? 16 : map.getZoom() >= 9 ? 12 : 8;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&zoom=${z}&accept-language=en`
    );
    if (res.ok) {
      const geo = await res.json();
      const a = geo.address || {};
      place.name = geo.name || a.suburb || a.village || a.town || a.city || a.county || a.state || "Open Water";
      place.region = [
        a.city && a.city !== place.name ? a.city : null,
        a.state && a.state !== place.name ? a.state : null,
        a.country,
      ].filter(Boolean).join(", ") || "The World Ocean";
      place.country = a.country || null;
      place.countryCode = a.country_code || null;
      place.blurb = (geo.display_name || "").split(", ").slice(0, 5).join(", ");
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
  dropMarker(e.lngLat);
  identifyClick(e.lngLat);
});

/* ---------------- Time machine (Esri Wayback) ---------------- */

const WB = window.WAYBACK || []; // releases, oldest first; slider max = "today"
let waybackIdx = null;           // null = present-day imagery

const waybackUrl = n =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${n}/{z}/{y}/{x}`;

const fmtWaybackDate = d =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();

function setWayback(idx) {
  const src = map.getSource("esri");
  if (!src) return;
  if (idx === null || idx >= WB.length) {
    waybackIdx = null;
    src.setTiles([ESRI_TILES]);
    $("wayback-label").textContent = "TODAY";
  } else {
    waybackIdx = idx;
    src.setTiles([waybackUrl(WB[idx].n)]);
    $("wayback-label").textContent = fmtWaybackDate(WB[idx].d);
  }
}

function openWayback() {
  if (!WB.length) { toast("TIME MACHINE UNAVAILABLE"); return; }
  closeSearch();
  closeIntel();
  closePassport();
  if (state.playing && !state.transitioning) setPlaying(false);
  const slider = $("wayback-slider");
  slider.max = String(WB.length);
  slider.value = waybackIdx === null ? String(WB.length) : String(waybackIdx);
  $("wayback").hidden = false;
  toast("TIME MACHINE — DRAG BACK THROUGH THE YEARS");
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
  const idx = +e.target.value;
  $("wayback-label").textContent = idx >= WB.length ? "TODAY" : fmtWaybackDate(WB[idx].d);
  clearTimeout(waybackTimer); // don't reload tiles for every pixel of drag
  waybackTimer = setTimeout(() => setWayback(idx >= WB.length ? null : idx), 150);
});

$("wayback-close").addEventListener("click", closeWayback);

/* ---------------- Escape, one place ----------------
   The .scr host forwards Esc here; panels close first, a second Esc
   (or Esc with nothing open) exits the screensaver. */

function anyPanelOpen() {
  return !$("search").hidden || !$("wayback").hidden
    || $("intel-panel").classList.contains("open")
    || $("passport").classList.contains("open");
}

window.__driftEsc = () => {
  if (anyPanelOpen()) {
    closeSearch();
    closeIntel();
    closePassport();
    closeWayback();
  } else if (HOSTED) {
    window.chrome.webview.postMessage("exit");
  }
};

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
  advance(1);
});
