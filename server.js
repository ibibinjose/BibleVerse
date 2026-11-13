import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Serves www/ — the same bundle Capacitor ships in the iOS/Android apps.
// Extensionless HTML matches Cloudflare Pages (/privacy -> privacy.html).
// Unknown paths serve index.html, matching Pages when no 404.html is present.
const root = fileURLToPath(new URL("./www/", import.meta.url));
const rootPrefix = root.endsWith(sep) ? root : root + sep;
const startPort = Number(process.env.PORT || 5173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".ico": "image/x-icon" };

function insideRoot(file) {
  return file === root || file.startsWith(rootPrefix);
}
async function readInside(pathname) {
  const file = normalize(join(root, pathname));
  if (!insideRoot(file)) return null;
  try { return { file, data: await readFile(file) }; } catch { return null; }
}
function send(res, file, data) {
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  res.end(data);
}

const server = createServer(async (req, res) => {
  let path = "/";
  try { path = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400, { "Content-Type": "text/plain" }); return res.end("Bad request"); }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path === "/") path = "/index.html";

  const hit = await readInside(path) || (!extname(path) ? await readInside(path + ".html") : null);
  if (hit) return send(res, hit.file, hit.data);
  if (!extname(path)) {
    const index = await readInside("/index.html");
    if (index) return send(res, index.file, index.data);
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found — run `npm run build:www` first");
});

function listen(p) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && p < startPort + 20) {
      console.log(`Port ${p} is in use, trying ${p + 1}...`);
      listen(p + 1);
    } else {
      throw err;
    }
  });
  server.listen(p, "127.0.0.1", () => {
    console.log(`BibleVerse running at http://127.0.0.1:${p}`);
  });
}

listen(startPort);
