/**
 * Build gallery thumbnails.
 *
 *   node scripts/build-thumbs.mjs           # only new / changed photos
 *   node scripts/build-thumbs.mjs --force   # rebuild everything
 *
 * The Next.js image optimizer is off (Render's free CPU can't keep up),
 * so without this every grid tile downloads the full ~450 KB original.
 * This script fetches each hosted photograph once (lib/hosted-images.json),
 * writes an 800px WebP thumbnail to public/thumbs/<number>.webp (~60 KB)
 * and records its dimensions in lib/gallery-thumbs.json so grids can
 * reserve the exact space before the image arrives.
 *
 * Thumbnails are built from the HOSTED file — the one the site actually
 * shows — not the local copy in public/assets, which can differ.
 * The lightbox keeps opening the full-resolution original.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const HOSTED_PATH = path.join(ROOT, "lib/hosted-images.json");
const MANIFEST_PATH = path.join(ROOT, "lib/gallery-thumbs.json");
const OUT_DIR = path.join(ROOT, "public/thumbs");

const WIDTH = 800;
const QUALITY = 72;
const CONCURRENCY = 6;
const force = process.argv.includes("--force");

const hosted = JSON.parse(await fs.readFile(HOSTED_PATH, "utf8"));
let previous = {};
try {
  previous = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
} catch {
  // first run
}

await fs.mkdir(OUT_DIR, { recursive: true });

const exists = (p) =>
  fs.access(p).then(
    () => true,
    () => false,
  );

const entries = Object.entries(hosted);
const manifest = {};
let next = 0;
let built = 0;
let reused = 0;

async function worker() {
  while (next < entries.length) {
    const [num, url] = entries[next++];
    const file = path.join(OUT_DIR, `${num}.webp`);

    if (!force && previous[num]?.url === url && (await exists(file))) {
      manifest[num] = previous[num];
      reused++;
      continue;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`#${num}: HTTP ${res.status} for ${url}`);
    const original = Buffer.from(await res.arrayBuffer());

    const { data, info } = await sharp(original)
      .rotate() // honour EXIF orientation
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true });

    await fs.writeFile(file, data);
    manifest[num] = { url, w: info.width, h: info.height };
    built++;
    process.stdout.write(`  #${num} ${info.width}x${info.height} ${Math.round(data.length / 1024)} KB\n`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => Number(a) - Number(b)),
);
await fs.writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + "\n");

console.log(`\nThumbnails: ${built} built, ${reused} reused → public/thumbs/`);
console.log(`Manifest:   ${path.relative(ROOT, MANIFEST_PATH)}`);
