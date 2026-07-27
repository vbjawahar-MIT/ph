/**
 * Generate app/icon.png from the transparent-gold logo.
 *
 * Next.js App Router picks up `app/icon.png` automatically and
 * synthesises `<link rel="icon">` tags for every browser + apple
 * touch icon size. One source file, all favicon sizes covered.
 *
 * The source PNG has substantial transparent margin around the actual
 * artwork; sharp's `.trim()` collapses it to a tight bounding box so
 * the artwork fills the favicon square as much as possible.
 *
 * Run: node scripts/generate-favicon.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("public/logo/logo-gold-transparent.png");
const OUT_ICON = path.resolve("app/icon.png");
const OUT_APPLE = path.resolve("app/apple-icon.png");

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`Missing source: ${SRC}`);

  // Trim the transparent border so the artwork fills as much of the
  // favicon square as possible.
  const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const side = Math.max(width ?? 512, height ?? 512);

  // Extend to a square canvas with transparent fill, then downscale.
  const square = await sharp(trimmed)
    .extend({
      top: Math.floor((side - (height ?? 0)) / 2),
      bottom: Math.ceil((side - (height ?? 0)) / 2),
      left: Math.floor((side - (width ?? 0)) / 2),
      right: Math.ceil((side - (width ?? 0)) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp(square)
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(OUT_ICON);

  await sharp(square)
    .resize(180, 180, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(OUT_APPLE);

  console.log(`Wrote ${OUT_ICON} 512×512`);
  console.log(`Wrote ${OUT_APPLE} 180×180`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
