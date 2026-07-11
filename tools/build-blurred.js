// Build blurred-sites.js from Wikipedia's censorship list (prose article:
// harvest wikilinks per country section; the coordinate lookup itself
// filters places from citations, and country-type pages are excluded).
const API = "https://en.wikipedia.org/w/api.php";

async function api(params) {
  const r = await fetch(API + "?" + new URLSearchParams({ format: "json", ...params }));
  if (!r.ok) throw new Error("api " + r.status);
  return r.json();
}

(async () => {
  const page = "List_of_satellite_map_images_with_missing_or_unclear_data";
  const wt = (await api({ action: "parse", page, prop: "wikitext" })).parse.wikitext["*"];

  const SKIP = new Set(["See also", "References", "External links", "Notes", "Further reading"]);
  let section = "";
  const items = [];
  for (const line of wt.split("\n")) {
    const h = line.match(/^(=+)\s*(.+?)\s*\1$/);
    if (h) { section = h[2].replace(/\[\[|\]\]/g, "").trim(); continue; }
    if (!section || SKIP.has(section)) continue;
    for (const m of line.matchAll(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g)) {
      const title = m[1].trim();
      if (/^(File|Image|Category|Template):/i.test(title)) continue;
      items.push({ title, label: (m[2] || m[1]).trim(), country: section });
    }
  }
  console.log("candidate links:", items.length);

  const titles = [...new Set(items.map(i => i.title))];
  const coords = new Map(); // title -> {c:[lon,lat], type}
  for (let i = 0; i < titles.length; i += 50) {
    const res = await api({
      action: "query", prop: "coordinates", colimit: "max",
      coprop: "type", redirects: "1", titles: titles.slice(i, i + 50).join("|"),
    });
    const redirect = new Map((res.query.redirects || []).map(r => [r.to, r.from]));
    for (const p of Object.values(res.query.pages || {})) {
      const c = p.coordinates && p.coordinates[0];
      if (!c) continue;
      const entry = { c: [c.lon, c.lat], type: c.type || "" };
      coords.set(p.title, entry);
      if (redirect.has(p.title)) coords.set(redirect.get(p.title), entry);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.log("with coordinates:", coords.size);

  const seen = new Set();
  const rows = [];
  for (const it of items) {
    const hit = coords.get(it.title);
    if (!hit || hit.type === "country" || hit.type === "adm1st") continue;
    const key = hit.c[0].toFixed(2) + "," + hit.c[1].toFixed(2);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      n: it.label.replace(/["\\]/g, ""),
      c: [Math.round(hit.c[0] * 1e5) / 1e5, Math.round(hit.c[1] * 1e5) / 1e5],
      k: it.country.replace(/["\\]/g, ""),
      w: it.title.replace(/["\\]/g, ""),
    });
  }
  console.log("final sites:", rows.length);
  console.log("sample:", rows.slice(0, 6).map(r => `${r.n} [${r.k}]`).join(" | "));

  const out = "// Sites catalogued on Wikipedia's 'List of satellite map images with\n"
    + "// missing or unclear data' (names/coords are facts; see each article for\n"
    + "// the story and citations). Regenerate with build-blurred.js.\n"
    + "window.BLURRED = [\n"
    + rows.map(r => JSON.stringify(r)).join(",\n")
    + "\n];\n";
  require("fs").writeFileSync("C:/dev/googlemaps_screensaver/blurred-sites.js", out);
  console.log("written blurred-sites.js");
})().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
