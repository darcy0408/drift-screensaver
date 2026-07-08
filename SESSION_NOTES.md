# Session notes

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
