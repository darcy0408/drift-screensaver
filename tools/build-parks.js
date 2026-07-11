// Harvest US national parks (names + coords) from Wikipedia's list article.
const API = "https://en.wikipedia.org/w/api.php";
async function api(params) {
  const r = await fetch(API + "?" + new URLSearchParams({ format: "json", ...params }));
  return r.json();
}
(async () => {
  const wt = (await api({ action: "parse", page: "List_of_national_parks_of_the_United_States", prop: "wikitext" })).parse.wikitext["*"];
  const titles = [...new Set([...wt.matchAll(/\[\[([^\]|#]+National Park[^\]|#]*)(?:\|[^\]]*)?\]\]/g)].map(m => m[1].trim()))];
  console.log("park links:", titles.length);
  const rows = [];
  for (let i = 0; i < titles.length; i += 50) {
    const res = await api({ action: "query", prop: "coordinates", colimit: "max", redirects: "1", titles: titles.slice(i, i + 50).join("|") });
    for (const p of Object.values(res.query.pages || {})) {
      const c = p.coordinates && p.coordinates[0];
      if (!c || Math.abs(c.lat) > 85) continue;
      rows.push({ n: p.title.replace(/ \(U\.S\..*\)/, "").replace(/["\\]/g, ""), c: [Math.round(c.lon * 1e5) / 1e5, Math.round(c.lat * 1e5) / 1e5] });
    }
    await new Promise(r => setTimeout(r, 300));
  }
  const seen = new Set();
  const unique = rows.filter(r => { const k = r.c.join(","); if (seen.has(k)) return false; seen.add(k); return true; });
  console.log("parks with coords:", unique.length);
  const out = "// US national parks from Wikipedia's list article (facts: names + coords).\n"
    + "window.PARKS = [\n" + unique.map(r => JSON.stringify(r)).join(",\n") + "\n];\n";
  require("fs").writeFileSync("C:/dev/googlemaps_screensaver/parks.js", out);
  console.log("written parks.js |", unique.slice(0, 5).map(r => r.n).join(" | "));
})().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
