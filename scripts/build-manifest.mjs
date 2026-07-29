/**
 * Build lib/asset-manifest.json from the local public/assets tree.
 *
 * Why this exists
 * ───────────────
 * The photographs live in public/assets/{folder}/ and are gitignored
 * because they total ~2.85 GB. Any hosted build (Render, Vercel,
 * Netlify, etc.) never sees the actual JPGs — only the code. Without
 * a manifest, the runtime filesystem loader would find empty folders
 * and every category would render "Coming Soon".
 *
 * This script walks the local assets tree and writes a small JSON
 * catalog of `{ folder: [file, file, …] }` in natural sort order.
 * The manifest IS committed to git, so it deploys alongside the code.
 *
 * At request time the gallery loader reads from this catalog instead
 * of the filesystem and prefixes each URL with NEXT_PUBLIC_CDN_BASE_URL
 * (see lib/gallery.ts). Photos are served from Cloudflare R2 in prod
 * and from public/assets/ in dev — same code path, one env var.
 *
 * Run whenever files are added or removed:
 *   node scripts/build-manifest.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("public/assets");
const OUT = path.resolve("lib/asset-manifest.json");

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
// Skip these — either dotfiles or the .gitkeep placeholder that
// preserves the folder structure in git.
const SKIP = new Set([".gitkeep"]);

const NATURAL = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function listFolder(folderName) {
  const dir = path.join(ROOT, folderName);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files
    .filter((f) => !f.startsWith(".") && !SKIP.has(f))
    .filter((f) => IMAGE_EXT.test(f) || VIDEO_EXT.test(f))
    .sort(NATURAL.compare);
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.warn(`Assets root not found: ${ROOT}`);
    fs.writeFileSync(OUT, JSON.stringify({}, null, 2));
    return;
  }

  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  const manifest = {};
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    manifest[entry.name] = listFolder(entry.name);
  }

  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

  const summary = Object.entries(manifest)
    .map(([folder, files]) => `  ${folder.padEnd(20)} ${files.length}`)
    .join("\n");
  const total = Object.values(manifest).reduce((n, arr) => n + arr.length, 0);
  console.log(`Wrote ${OUT}`);
  console.log(summary);
  console.log(`  ${"".padEnd(20)} ────`);
  console.log(`  ${"total".padEnd(20)} ${total}`);
}

main();
