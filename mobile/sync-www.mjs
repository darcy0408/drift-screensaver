// Copies the root web app (the source of truth) into mobile/www for Capacitor.
// Same discipline as dist\web: never edit www/ by hand.
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const www = join(here, "www");

const FILES = [
  "index.html", "style.css", "app.js", "locations.js",
  "starforts.js", "blurred-sites.js", "parks.js", "wayback-releases.js",
  "manifest.webmanifest", "sw.js",
];

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const f of FILES) cpSync(join(root, f), join(www, f));
cpSync(join(root, "icons"), join(www, "icons"), { recursive: true });
console.log(`synced ${FILES.length} files + icons/ -> mobile/www`);
