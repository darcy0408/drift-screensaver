# Session notes

## 2026-07-11 — `P` opens the pole viewer from anywhere; pinning moved to `K`
**Done:** (commit `ca7711d`, pushed to `main`; GitHub Pages auto-deploys; syntax-verified via `node --check` only, NOT exercised in a live browser — see Risks)
- Added a global keyboard shortcut: pressing `P`/`p` now opens the "Today's Pole" viewer (NASA GIBS polar-stereographic imagery of the Arctic/Antarctic) from anywhere in the app. Previously this viewer was reachable only by navigating to the "The Polar Opening"/Agartha mystery dossier (case file CF-056) and clicking its on-card `TODAY'S POLE` button. New function `cyclePole()` in `app.js`, placed just after `closePole()`: 1st press opens the North pole (Arctic), 2nd press switches to the South pole (Antarctic), 3rd press closes the overlay. It reuses the existing `openPole()`/`closePole()` and the `#pole` overlay; nothing about the viewer itself changed.
- Moved the existing "pin current place to Passport" action off `P` onto `K`/`k` (mnemonic: K = "keep") to free up `P`. The pin logic (`pinCurrent()`) is unchanged — only its key binding moved. The Passport panel is still opened with `V`.
- Updated the on-screen controls hint in `index.html` (now shows `P poles` and `K pin`) and `README.md` (the two pin references changed from `P` to `K`; added a "Poles (`P`)" feature bullet and a `P` / view the poles row in the controls table).
- Bumped the cache-buster query string on every `<script>` and the stylesheet `<link>` in `index.html` from `?v=38` to `?v=39`. The file's own line-9 comment mandates this whenever `app.js`/`style.css`/`locations.js` change, so browsers and the screensaver's WebView2 do not serve a stale cached copy.
- Re-copied `app.js` and `index.html` into `dist/web/`. IMPORTANT for future sessions: `dist/web/` is a MANUAL copy that the `DriftSaver.scr` screensaver serves; the repo-root files (`app.js`, `index.html`, `style.css`, `locations.js`, etc.) are the source of truth, and every root web edit must be re-copied into `dist/web/` or the installed screensaver lags the browser version.

**Decisions:**
- Chose `K` for pinning rather than deleting the pin feature: the Passport panel (`V`) depends on pins existing, so removal was rejected. The user confirmed the "move pin to K" option.
- `P` cycles North → South → close on repeated presses (one key reaches both poles) instead of always opening the same pole.
- Committed straight to `main` (no feature branch) because the user explicitly asked to ship on the next push, and pushes to `main` auto-deploy the public GitHub Pages site — the project's established release workflow.

**Next:**
- Live-verify in a browser once the Claude Chrome extension is connected (it was unavailable this session): press `P` three times and confirm North pole → South pole → overlay closes; press `K` and confirm the `PINNED — n IN PASSPORT` toast appears and the place shows up in the Passport panel (`V`).

**Risks/unverified:**
- The new binding and `cyclePole()` were verified only by `node --check` (parse-clean) and static inspection (the `k`/`p` switch cases resolve correctly with no leftover `P`→pin binding; the DOM ids `cyclePole` touches — `#pole`, `#pole-arctic`, `#pole-antarctic`, `#pole-img` — all exist in `index.html`). The behavior was NOT observed in the running app because the Chrome automation extension was not connected.
- During temp-server cleanup this session I ran `taskkill /F /IM python.exe`, which terminated ALL running `python.exe` processes on the machine (11 of them), not just the local test server I had started. If unrelated Python work was running, it was killed — worth a heads-up if something else died unexpectedly.

## 2026-07-10 — Content explosion (161 places, 83 case files, 10 expeditions, 3 pin catalogues), community layer, NASA pole viewer, phone touch bar
**Done:** (web features verified by puppeteer-core end-to-end tests; all pushed; live site auto-deploys)
- README.md with screenshots (docs/), share blurb delivered in chat. Ethos section: no verdicts — claim/lore/record plus verification instruments.
- Content: Why Files canon (CF-042–055), Agartha/Polar Opening (CF-056) with a TODAY'S POLE viewer fetching yesterday's Arctic/Antarctic from NASA GIBS in polar stereographic, star forts on every continent (CF-057–066), Google Earth classics + Coronado swastika + Atlantis Grid (CF-067/068), Copenhagen's Erased Ring (CF-069), Epstein island/ranch (CF-076/077 — record held to courts/DOJ IG/named reporting), Racetrack Playa (CF-081), Andrews golf (CF-082), Vatican + Chronovisor (CF-083).
- Ten expeditions on the `E` key (curated, ORDERED tours): vanishing water, megaprojects, Google-blurred-it, ice clock, cities that vanish, reef builders, listening posts, continuity of government, national parks, Pentagon's back nine.
- Three pin catalogues on `X`: 2,035 star forts (Colm Gibney's KMZ, starforts.org, no-copyright; junk placemarks filtered), 21 Wikipedia-catalogued blur sites (build-blurred.js harvests the article's links, resolves coords via Wikipedia's coordinate DB), 63 US national parks (build-parks.js). Clicking any pin presents it; blur/park pins wire their Wikipedia article into MORE INTEL.
- Community layer: `?ll=lat,lng,zoom` deep links + COPY LINK (copies public site URL), EXPORT CARD (map snapshot + dossier text to 1200×1500 PNG; map runs preserveDrawingBuffer), G MAPS compare button, search accepts pasted Google Maps URLs and raw coordinates, GitHub issue form (.github/ISSUE_TEMPLATE/submit-spot.yml) linked prefilled from the intel panel, contributor credit line (place.credit → "FILED BY …"), passport panel gains Community Field Log (GitHub issues API) and Fresh Passes (newest capture dates across sampled atlas places, cached 12 h).
- Phones: touch bar (NEXT/MODE/TIME/HIDE) on coarse pointers; keyboard hints hidden there. Verified under iPhone emulation.
- Fixes: the phantom-search root cause (author display:flex beats UA [hidden] — unlayered `:is(...)[hidden]{display:none}` rule now enforces it, verified at computed-style level); arrows drive the timeline whenever it's open regardless of focus; wayback change-scan survives metros whose tilemap `select` references internal release ids missing from the public catalogue (samples onward, keeps partial results — Vatican went from 195-fallback to 9 distinct images in 4 s).

**Decisions:**
- Repo is PRIVATE by user choice until "all the way done" — the Pages site stays public and auto-updates (verified), so the share link works; submit form/field log/README/ZIP downloads stay dormant until the repo is flipped public (one toggle re-enables everything).
- Community submissions ride GitHub issues (moderated, free, no backend); contributor credit via place.credit is the reward mechanism.
- Epstein/true-crime files: claims presented as claims, record limited to convictions, DOJ IG, and named outlets.

**Next:**
1. Launch package remains pending user go: OG preview tags, viral-safe geocoder (Nominatim policy), Show HN/Reddit posting.
2. Parked ideas: Today's File (daily featured case), daily guess game with emoji-share, ambient sound toggle, expedition picker for the phone touch bar (E is keyboard-only), ghost-architecture expedition, importing more of the blur list (most entries are prose without coordinates — community bounty).

**Blocked on user:** deciding when the repo goes public; multi-monitor .scr test.

**Risks/unverified:**
- The .scr wrapper hasn't been recompiled or exercised since the touch-bar/expedition era — web-only changes flow through, but a fresh full screensaver run is worth a glance next session.
- EXPORT CARD verified as download-trigger + blob only — nobody has eyeballed the rendered PNG composition yet.
- Wayback internal-release sampling (idx -= 4) coarsens release labels in heavy-update metros; capture dates shown remain accurate.
- data catalogues (starforts/blurred/parks) are build-time snapshots; regeneration scripts are in tools/ and documented in each file's header comment.

## 2026-07-09 (later) — Search docked out of the way, landmark-aware clicks, time machine now steps only real image changes with full attribution
**Done:** (each verified by puppeteer-core end-to-end tests against installed Chrome; all pushed and live on GitHub Pages)
- Search panel redesigned: docks top-left under the ⌕ SEARCH chip in a compact ~22rem column (was parked across the screen center); results scroll within 42vh. All existing close paths kept.
- Click identification is landmark-aware: reverse geocode at building level (Nominatim zoom 18 when map zoom ≥14) runs alongside a Wikipedia geosearch (300 m); the nearest article names the click when the geocoder only finds something minor (footpath/bench) or the article is <120 m away. Verified: SoFi Stadium, Bondi Beach, Belvedere Castle; `a.road` kept in the name fallback chain so plain street clicks still name the street. Landmark clicks set `place.wiki` so the intel panel shows the article.
- Time machine overhauled per user feedback:
  - Slider now offers ONLY releases where the current view actually changed. Implementation: walk the wayback tilemap endpoint (`.../tilemap/{release}/{z}/{y}/{x}` — its `select` field names the release that truly serves the tile) newest→oldest, then collapse runs sharing a capture date at the view center via per-release metadata identify. Shibuya: 195 slider stops → 11 distinct photos.
  - Each stop shows attribution: "shot Jan 15, 2007 · Terracolor · CNES/Airbus DS" (release date in amber above it). Older metadata services use SRC_* field names; parser handles both schemas.
  - Slider is disabled with a SCANNING… label until the change-point scan lands (~5-10 s) — sliding during the scan previously gave the old every-release behavior, which the user hit and reported.
  - Scan re-runs (single shared debounce timer) when the map moves while the panel is open.
- Imagery attribution now works at EVERY zoom: identify synthesizes a close-up extent (metadata layers only answer at street scales) with `layers=all`, picks the row covering the current zoom, and falls through undated wide-zoom mosaic rows to dated imagery. Before this, tour stops wider than ~z14 (most of them) showed no IMAGE line and no time machine source line — the user reasonably reported the feature as absent.
- Slider got 2014/NOW end markers and a toast that says where the slider is.

**Decisions:**
- Wikipedia geosearch (free, CORS-open) chosen over Overpass for landmark naming — Nominatim's address chain simply does not contain enclosing features (verified: a Central Park lawn click returns memorial→road→quarter, no park).
- The commit message rule learned the hard way: PowerShell 5.1 mangles embedded double quotes when passing args to git — keep commit messages free of `"`.

**Next:**
1. Launch package (still pending user decision): `?ll=` deep links + copy-link button, root README.md with GIF, OG preview tags, viral-safe geocoder.
2. Parked: guess-the-country mode, Reddit via wrapper fetch, Mapillary, per-monitor modes.

**Risks/unverified:**
- Wayback tilemap `select` semantics are undocumented Esri internals — if the endpoint changes shape, the scan falls back to all 195 releases (with a visible toast).
- Change-point scan latency (~5-10 s) depends on Esri latency; multi-monitor .scr and `/p` preview still untested on real hardware.
**Done:** (all web features verified by puppeteer-core end-to-end tests driving installed Chrome; wrapper changes verified by live .scr runs and user testing)
- Published: repo is public at https://github.com/darcy0408/drift-screensaver with GitHub Pages serving the app live at https://darcy0408.github.io/drift-screensaver/ — every push to `main` auto-updates the site. Desktop shortcut "DRIFT" on the user's desktop launches `dist\DriftSaver.scr /s` with a custom amber-globe icon (`dist\drift.ico`).
- Search (`/` key or SEARCH chip): Nominatim geocoding, results list, flight sized by result bounding box. Explicit-submit only (Nominatim policy).
- Imagery vintage line on every card ("IMAGE Sep 16, 2025 · 10 months old · WorldView-2 · 0.5 m/px") via identify-query on Esri World Imagery. IMPORTANT: use the `geometry=lng,lat` comma shorthand — the JSON-object geometry form returns HTTP 400 from browsers.
- Time machine (`T`): slider over 195 Esri Wayback releases back to Feb 2014, swaps the raster source via `setTiles`. Release list is baked into `wayback-releases.js` because the wayback config JSON (S3) has no CORS header; tiles themselves are CORS-open. Regeneration command is in the file header.
- Zoom overhaul for the touchpad user: time-based accumulation target (`glideZoom`) so rapid pinch/wheel events stack; `Shift+minus` (types "_") mapped to zoom out; `O` toggles world view and back; map bounded zoom 1–18.5.
- Dismissal/UX: click-to-identify with pulsing marker; MORE INTEL button opens enriched panel (Wikidata SPARQL country stats incl. government form — REST Countries free API was deprecated in 2026, do not use); `H` clean view hides ALL chrome and closes transient panels; search closes via ×, click-outside, `/` toggle, Esc; cards have ×.
- Screensaver (.scr) root-cause fixes: wrapper appends web build timestamp to the navigation URL (WebView2 heuristically cached index.html and served users a stale app — this caused two separate "can't close search" reports); Esc is now forwarded to the page (`window.__driftEsc`) to close panels first, exits when nothing is open, double-Esc within 1.5s force-exits even if the page is wedged.
- Bug fixed after user report with screenshots: the `H` clean-view CSS hide-list omitted `#search`, so H hid everything EXCEPT search. H now closes all transient panels before hiding chrome.

**Decisions:**
- GitHub Pages over any hosting setup — free, zero-config, auto-deploys from `main`, and the static app needs no backend.
- Wikidata SPARQL replaced REST Countries for national statistics (deprecated API + Wikidata has form-of-government, which the user explicitly wanted).
- Esc protocol: the page owns Esc semantics via `window.__driftEsc`; the WinForms host only forwards and provides the double-press force-exit. Page keydown ignores Esc when hosted to avoid double-firing.
- Cache-busting is two-layer by design: `?v=N` on asset links (bump on EVERY web change) + build-timestamp param from the wrapper for index.html itself.

**Next:**
1. "Launch package" if the user wants to promote it (discussed, not built): shareable deep links (`?ll=lat,lng,zoom` + copy-link button), root README.md with screenshots/GIF for the repo, Open Graph preview tags, and a viral-safe geocoder (Nominatim's policy forbids heavy traffic — Photon/komoot or graceful degradation) before any Show HN / Reddit post.
- 2. Smaller ideas parked: guess-the-country mode, Reddit chatter via wrapper-side fetch, Mapillary street-level, per-monitor modes, passport export.

**Blocked on user:** whether to pursue the public launch; testing multi-monitor .scr behavior (single display here).

**Risks/unverified:**
- The `.scr` `/p` preview pane and multi-monitor per-screen tours remain untested on real hardware.
- Esri Wayback tile URL pattern and the baked release list could drift; regenerate `wayback-releases.js` from the S3 config if the time machine 404s.
- One unreproduced anomaly: a single test screenshot on 2026-07-09 showed the search panel open without an obvious trigger; two exact replays were clean. If search ever opens by itself, that's the thread to pull.
- `dist\web\` is a manual copy of the root web files — every root edit must be re-copied or the .scr lags the browser version.

## 2026-07-07 — Built DRIFT map screensaver from scratch: web app, Windows .scr package, and three feature additions

**Done:**
- Full web app ("DRIFT — an ambient atlas"): MapLibre GL over free Esri World Imagery tiles (no API key/billing), 55 curated locations in `locations.js` including 19 "mystery files" with claim/lore/record dossiers, Ken Burns drift tour with crossfades, Wikipedia intel panel (`I`), four tour modes — World Tour, Mystery Files (`M`), Deep Field random with Nominatim reverse-geocoding (`R`), Golden Hour via solar-altitude math (`G`). Verified with puppeteer-core end-to-end tests driving installed Chrome (screenshots + state assertions all green).
- Windows screensaver package in `dist\`: `DriftSaver.scr` is a C# WinForms + WebView2 host compiled with the `csc.exe` bundled in Windows .NET Framework 4.8 — **no .NET SDK is installed on this machine; wrapper code must stay C# 5 compatible** (no string interpolation, no `?.`, no `nameof`). Handles `/s` `/c` `/p` protocol, one independent tour per monitor, Esc-only exit (other input interacts), settings dialog writing `%APPDATA%\DriftSaver\settings.txt`. Verified running fullscreen via DPI-aware screen capture.
- Touchpad-aware input (user is on a laptop touchpad): two-finger scroll pans, pinch/Ctrl+scroll zooms, notchy mouse wheel still zooms, arrows/WASD pan, `N`/`B` next/back. All five input paths verified by simulated-input tests.
- Passport viewer (`V`): panel listing pins saved with `P` (localStorage `drift-pins`), click to fly back, `×` to unpin. Verified.
- Live weather on location cards via Open-Meteo (free, keyless): temp, conditions, sunrise–sunset, 30-min cache, 2 retries. Verified.
- Rebuild command for the wrapper (run from repo root):
  `& "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /platform:x64 /optimize+ /out:dist\DriftSaver.scr /r:System.dll /r:System.Core.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:dist\Microsoft.Web.WebView2.Core.dll /r:dist\Microsoft.Web.WebView2.WinForms.dll wrapper\Program.cs`

**Decisions:**
- Esri World Imagery over Google Maps API — user preference; avoids Google Cloud account/billing entirely. Google could return later as an optional keyed "premium mode".
- Conspiracy content is framed as entertainment: every dossier shows the claim, the lore, AND the mundane/official record side by side.
- Root files (`index.html`, `style.css`, `app.js`, `locations.js`) are the source of truth; `dist\web\` is a copy the .scr serves. **Any web edit must be re-copied to `dist\web\`** (no build step).
- The `#map` rule in `style.css` is intentionally OUTSIDE all `@layer` blocks: MapLibre's stylesheet is unlayered and unlayered styles beat any layer, so a layered `#map { position:absolute; inset:0 }` gets overridden by `.maplibregl-map { position:relative }` and the map collapses to a black 300px strip. This was the session's big bug — hours of black-screen debugging.
- Asset links in `index.html` carry `?v=3` cache-busting stamps — bump on every web-file change or browsers/WebView2 serve stale copies (second black-screen incident of the session).

**Next:**
1. User should install: right-click `dist\DriftSaver.scr` → Install (instructions in `dist\README.txt`).
2. Candidate features, in rough priority: guess-the-country mode (GeoGuessr-lite, was offered and deferred), Reddit "what people are saying" fetched host-side in the wrapper (browser CORS blocks it), more mystery case files, Mapillary street-level views, per-monitor mode settings.
3. Repo is on GitHub: https://github.com/darcy0408/drift-screensaver (private; default branch `main`). Flip public with `gh repo edit darcy0408/drift-screensaver --visibility public` if the user wants to share it.

**Blocked on user:** installing the screensaver and choosing idle timeout (Windows dialog).

**Risks/unverified:**
- Multi-monitor per-screen tours are coded but never tested on real hardware (single-display session).
- The `/p` preview and `/c` settings dialog of the .scr were compiled but never visually exercised.
- Deep Field random mode relies on Nominatim's fair-use policy — fine for one user, would need care if distributed.
- A stray hidden `http-server` on port 8237 (caching disabled) may still be running from this session; it dies on reboot and is safe to kill.
