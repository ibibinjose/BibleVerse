// Draws a shareable verse card. Callers pass a canvas; this file does not touch the network.

export function wrapLines(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function paintVerseCard(canvas, { title, verse, ref, bg = "#1e3a2f", fg = "#f7f3ea" }) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(245,197,66,.9)";
  ctx.fillRect(72, 120, 72, 6);
  ctx.fillStyle = fg;
  ctx.textBaseline = "top";
  ctx.font = "700 34px 'DM Sans', sans-serif";
  ctx.fillText("BIBLEVERSE", 72, 148);
  ctx.font = "900 68px Fraunces, Georgia, serif";
  const titleLines = wrapLines(ctx, title || "A verse", w - 144);
  titleLines.forEach((line, i) => ctx.fillText(line, 72, 230 + i * 80));
  const verseTop = 230 + titleLines.length * 80 + 36;
  ctx.font = "500 46px Newsreader, Georgia, serif";
  const verseLines = wrapLines(ctx, `“${verse || ""}”`, w - 144);
  verseLines.forEach((line, i) => ctx.fillText(line, 72, verseTop + i * 64));
  ctx.font = "700 32px 'DM Sans', sans-serif";
  ctx.fillStyle = "#f5c542";
  ctx.fillText(ref || "", 72, h - 120);
  ctx.font = "600 26px 'DM Sans', sans-serif";
  ctx.fillStyle = "rgba(247,243,234,.72)";
  ctx.fillText("Read it offline in BibleVerse", 72, h - 72);
  return canvas;
}

export async function verseCardBlob(fields) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  if (document.fonts?.ready) await document.fonts.ready;
  paintVerseCard(canvas, fields);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("card");
  return blob;
}

export async function shareVerseCard(fields) {
  const blob = await verseCardBlob(fields);
  const file = new File([blob], "bibleverse-verse.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: fields.title || "BibleVerse", text: fields.ref || "" });
    return "shared";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bibleverse-verse.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
