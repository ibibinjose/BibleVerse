import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

// Serves www/ — the same bundle Capacitor ships in the iOS/Android apps.
const root = fileURLToPath(new URL("./www/", import.meta.url));
const startPort = Number(process.env.PORT || 5173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".ico": "image/x-icon" };

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (path === "/") path = "/index.html";
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found — run `npm run build:www` first");
  }
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
