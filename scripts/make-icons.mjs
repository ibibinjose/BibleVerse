// Generates the BibleVerse logo PNG set from code (no external tools).
// Master art is drawn per-pixel in a 1024 space, then downsampled.
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { deflateSync } from "node:zlib";

const GOLD = [245, 197, 66], LIGHT = [250, 216, 130], DARK = [183, 136, 30], INK = [12, 12, 14];

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const cs = Buffer.alloc(4); cs.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, cs]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    rgba.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- geometry (1024 space, normalized 0..1) ----
function starPoly(cx, cy, r) {
  const p = 0.18;
  const seq = [[0, -1], [p, -p], [1, 0], [p, p], [0, 1], [-p, p], [-1, 0], [-p, -p]];
  return seq.map(([dx, dy]) => [cx + dx * r, cy + dy * r]);
}
function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const STAR = starPoly(0.5, 0.2, 0.098);
const topL = (x) => 0.493 - 0.223 * (x - 0.219);
const botL = (x) => 0.681 - 0.223 * (x - 0.219);
const topR = (x) => 0.438 + 0.223 * (x - 0.5);
const botR = (x) => 0.625 + 0.223 * (x - 0.5);
function inBook(x, y) {
  if (x < 0.5) return x >= 0.219 && x <= 0.5 && y >= topL(x) && y <= botL(x);
  return x <= 0.781 && x >= 0.5 && y >= topR(x) && y <= botR(x);
}

function render(size, { rounded = false, artScale = 1, artOnly = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const C = { x: 0.5, y: 0.53 };
  const R = rounded ? 0.225 : 0;
  for (let j = 0; j < size; j++) {
    const y = (j + 0.5) / size;
    for (let i = 0; i < size; i++) {
      const x = (i + 0.5) / size;
      const o = (j * size + i) * 4;
      if (rounded) {
        // rounded-corner mask
        const nx = Math.min(Math.max(x, R), 1 - R), ny = Math.min(Math.max(y, R), 1 - R);
        const dx = (x - nx) * size, dy = (y - ny) * size;
        if (dx * dx + dy * dy > (R * size) ** 2) {
          buf[o + 3] = 0; // transparent corner
          continue;
        }
      }
      // art transform (for maskable safe-zone)
      const tx = C.x + (x - C.x) / artScale, ty = C.y + (y - C.y) / artScale;
      let px = INK, alpha = 255;
      if (artOnly) { buf[o + 3] = 0; px = null; }
      if (inPoly(tx, ty, STAR)) px = GOLD;
      else if (inBook(tx, ty)) {
        const left = tx < 0.5;
        px = left ? LIGHT : GOLD;
        const bot = left ? botL(tx) : botR(tx);
        const top = left ? topL(tx) : topR(tx);
        if (Math.abs(tx - 0.5) <= 0.01) px = INK;
        else if (ty > bot - 0.033) px = DARK;
        else {
          for (const off of [0.054, 0.093, 0.132]) {
            const edge = left ? [0.254, 0.46] : [0.54, 0.746];
            if (tx >= edge[0] && tx <= edge[1] && Math.abs(ty - (top + off)) <= 0.005) {
              px = [110, 80, 18]; // pre-blended ink-on-gold line
              break;
            }
          }
        }
      }
      if (px) { buf[o] = px[0]; buf[o + 1] = px[1]; buf[o + 2] = px[2]; buf[o + 3] = alpha; }
    }
  }
  // box downsample is unnecessary: we render natively at each size
  return encodePNG(size, size, buf);
}

function pngSize(path) {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path]).toString();
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)[1]);
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)[1]);
  return [w, h];
}

const root = new URL("../", import.meta.url).pathname;
mkdirSync(root + "assets/icons", { recursive: true });
const web = [
  ["assets/icons/icon-192.png", 192, { rounded: true }],
  ["assets/icons/icon-512.png", 512, { rounded: true }],
  ["assets/icons/maskable-512.png", 512, { artScale: 1 / 0.72 }],
  ["assets/icons/apple-touch-icon.png", 180, {}],
  ["assets/icons/favicon-32.png", 32, { rounded: true }],
  ["assets/icons/favicon-16.png", 16, { rounded: true }],
];
for (const [f, s, opt] of web) {
  writeFileSync(root + f, render(s, opt));
  console.log("wrote", f);
}
// iOS (single 1024 icon, opaque full-bleed)
writeFileSync(root + "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", render(1024, {}));
console.log("wrote iOS AppIcon");
// Android legacy + round + foreground (match existing sizes)
import { readdirSync, existsSync } from "node:fs";
for (const d of readdirSync(root + "android/app/src/main/res")) {
  if (!d.startsWith("mipmap-")) continue;
  for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
    const p = `${root}android/app/src/main/res/${d}/${name}`;
    if (!existsSync(p)) continue;
    try {
      const [w] = pngSize(p);
      writeFileSync(p, render(w, {}));
      console.log("wrote", d + "/" + name, w);
    } catch {}
  }
  const fg = `${root}android/app/src/main/res/${d}/ic_launcher_foreground.png`;
  if (!existsSync(fg)) continue;
  try {
    const [w] = pngSize(fg);
    writeFileSync(fg, render(w, { artOnly: true, artScale: 1 / 0.6 }));
    console.log("wrote", d + "/ic_launcher_foreground.png", w);
  } catch {}
}
