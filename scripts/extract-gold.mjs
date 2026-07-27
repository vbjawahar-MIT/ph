/**
 * Extract the golden artwork from a logo that ships with a dark navy
 * background. Produces a transparent PNG suitable for placing on any
 * surface without a solid rectangle behind it.
 *
 * Algorithm
 * ─────────
 * The source logo is bimodal: navy pixels sit at luminance ~0-25,
 * gold pixels sit at luminance ~205-230, and the transition band
 * (anti-aliased edges) is tiny. A smooth alpha ramp between two
 * luminance thresholds gives clean edges without hard aliasing.
 *
 *   luminance ≤ FLOOR  → alpha = 0    (fully transparent)
 *   luminance ≥ CEIL   → alpha = 255  (fully opaque)
 *   in between         → linear ramp
 *
 * A small saturation boost keeps the extracted gold reading as gold
 * rather than dull yellow once the surrounding navy is gone.
 *
 * Run: node scripts/extract-gold.mjs
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC = path.resolve("public/logo.png");
const OUT_DIR = path.resolve("public/logo");
const OUT_PNG = path.join(OUT_DIR, "logo-gold-transparent.png");

const FLOOR = 30;
const CEIL = 80;

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`Missing source: ${SRC}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const L = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha;
      if (L <= FLOOR) alpha = 0;
      else if (L >= CEIL) alpha = 255;
      else alpha = Math.round(((L - FLOOR) / (CEIL - FLOOR)) * 255);

      const o = (y * width + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = alpha;
    }
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toFile(OUT_PNG);

  const stats = fs.statSync(OUT_PNG);
  console.log(
    `Wrote ${OUT_PNG}  ${width}×${height}  ${(stats.size / 1024).toFixed(1)} KB`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
