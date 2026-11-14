// Assembles www/ — the exact web bundle Capacitor ships inside the iOS/Android apps.
// __SITE_URL__ in the listed text files is replaced from site.json.
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const www = new URL("../www/", import.meta.url);
const site = JSON.parse(await readFile(new URL("../site.json", import.meta.url), "utf8"));
const siteUrl = String(site.url || "").replace(/\/+$/, "");
if (!/^https:\/\/[^/]+$/.test(siteUrl)) {
  throw new Error('site.json "url" must be an https origin with no path, such as https://bibleverse-bg9.pages.dev');
}
const publicConfig = {
  url: siteUrl,
  plusEnabled: site.plusEnabled === true,
  analyticsToken: String(site.analyticsToken || ""),
  revenueCatAppleApiKey: String(site.revenueCatAppleApiKey || ""),
  revenueCatGoogleApiKey: String(site.revenueCatGoogleApiKey || ""),
  revenueCatWebApiKey: String(site.revenueCatWebApiKey || ""),
  revenueCatEntitlementId: String(site.revenueCatEntitlementId || "plus"),
};
const configJson = JSON.stringify(publicConfig).replace(/</g, "\\u003c");
function stamp(text, { html }) {
  let out = text.replaceAll("__SITE_CONFIG__", configJson).replaceAll("__SITE_URL__", siteUrl);
  if (html && publicConfig.analyticsToken) {
    const beacon = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":${JSON.stringify(publicConfig.analyticsToken)}}'></script>`;
    out = out.replace("</head>", `${beacon}\n</head>`);
  }
  return out;
}
try {
  await rm(fileURLToPath(www), { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
} catch {}
await mkdir(www, { recursive: true });
const stamped = ["index.html", "privacy.html", "support.html", "app.js", "robots.txt", "sitemap.xml"];
const copied = ["style.css", "fonts.css", "bible.js", "feed-rotation.js", "pull-refresh.js", "feasts.js", "streak.js", "plus.js", "verse-card.js", "sw.js", "manifest.webmanifest", "og-image.png"];
for (const f of stamped) {
  const text = await readFile(new URL(f, root), "utf8");
  if (!text.includes("__SITE_URL__") && (f.endsWith(".html") || f === "sitemap.xml" || f === "robots.txt")) {
    throw new Error(`${f} is missing the __SITE_URL__ placeholder`);
  }
  await writeFile(new URL(f, www), stamp(text, { html: f.endsWith(".html") }));
}
for (const f of copied) {
  await cp(new URL(f, root), new URL(f, www), { force: true });
}
await cp(new URL("data", root), new URL("data", www), { recursive: true, force: true });
await cp(new URL("assets", root), new URL("assets", www), { recursive: true, force: true });
console.log("www/ built (app + full offline Bible)");
