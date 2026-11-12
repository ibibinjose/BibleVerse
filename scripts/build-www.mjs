// Assembles www/ — the exact web bundle Capacitor ships inside the iOS/Android apps.
import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const www = new URL("../www/", import.meta.url);
try {
  await rm(fileURLToPath(www), { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
} catch {}
await mkdir(www, { recursive: true });
for (const f of ["index.html", "privacy.html", "style.css", "fonts.css", "app.js", "bible.js", "sw.js", "manifest.webmanifest", "robots.txt", "sitemap.xml"]) {
  await cp(new URL(f, root), new URL(f, www), { force: true });
}
await cp(new URL("data", root), new URL("data", www), { recursive: true, force: true });
await cp(new URL("assets", root), new URL("assets", www), { recursive: true, force: true });
console.log("www/ built (app + full offline Bible)");
