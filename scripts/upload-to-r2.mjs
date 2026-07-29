/**
 * Sync public/assets/** to a Cloudflare R2 bucket.
 *
 * R2 is S3-compatible, so this uses @aws-sdk/client-s3 with R2's
 * endpoint. Each object is uploaded under the same relative path as
 * on disk, e.g. `public/assets/bridal/1.jpg` → `assets/bridal/1.jpg`
 * in the bucket. That matches the URL structure the gallery loader
 * builds (`{CDN_BASE}/assets/…`), so the site "just works" once the
 * env var is set.
 *
 * Prerequisites
 * ─────────────
 *   1. An R2 bucket with public dev access enabled OR a custom
 *      Cloudflare-fronted domain routed at the bucket.
 *   2. An API token with "Object Read & Write" for that bucket.
 *   3. `.env.local` filled in:
 *        R2_ACCOUNT_ID=…                (Cloudflare account ID)
 *        R2_ACCESS_KEY_ID=…             (from the API token)
 *        R2_SECRET_ACCESS_KEY=…         (from the API token)
 *        R2_BUCKET=vb-photographe        (bucket name)
 *      (See docs/CLOUDFLARE_SETUP.md for the click-by-click.)
 *
 * Usage
 * ─────
 *   node scripts/upload-to-r2.mjs           # upload everything (skip
 *                                             existing objects with
 *                                             matching size)
 *   node scripts/upload-to-r2.mjs --force   # re-upload everything
 *   node scripts/upload-to-r2.mjs bridal    # only that folder
 */
import fs from "node:fs";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// Load .env.local manually — no dotenv dep needed for one script.
loadDotenv(".env.local");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error(
    "Missing one of R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.\n" +
      "Copy .env.local.example to .env.local and fill in the values.\n" +
      "See docs/CLOUDFLARE_SETUP.md for how to get each one."
  );
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
args.delete("--force");
const ONLY_FOLDERS = new Set(args); // may be empty → upload all

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ROOT = path.resolve("public/assets");
const IMAGE_VIDEO = /\.(jpe?g|png|webp|avif|mp4|webm|mov|m4v)$/i;

/**
 * Node's mimetypes cover common images but not perfectly, so this
 * short table keeps content-type honest for the file extensions we
 * actually serve.
 */
const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
};

async function shouldUpload(key, size) {
  if (FORCE) return true;
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );
    // Skip if remote size matches — cheap way to make repeat runs idempotent.
    if (head.ContentLength === size) return false;
    return true;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404) return true;
    throw err;
  }
}

async function uploadOne(fullPath) {
  const rel = path.relative(ROOT, fullPath).replace(/\\/g, "/");
  const key = `assets/${rel}`;
  const stat = fs.statSync(fullPath);
  if (!(await shouldUpload(key, stat.size))) {
    process.stdout.write(`·`);
    return { skipped: true };
  }
  const body = fs.createReadStream(fullPath);
  const contentType = MIME[path.extname(fullPath).toLowerCase()] || "application/octet-stream";
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  process.stdout.write(`+`);
  return { uploaded: true, bytes: stat.size };
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.name.startsWith(".")) continue;
    if (e.isDirectory()) yield* walk(full);
    else if (IMAGE_VIDEO.test(e.name)) yield full;
  }
}

async function main() {
  if (!fs.existsSync(ROOT)) throw new Error(`No such directory: ${ROOT}`);

  const folders = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((f) => ONLY_FOLDERS.size === 0 || ONLY_FOLDERS.has(f));

  if (folders.length === 0) {
    console.warn("No folders selected — check your filter arguments.");
    return;
  }

  console.log(
    `Uploading to R2 bucket "${R2_BUCKET}" (endpoint: ${R2_ACCOUNT_ID}.r2.cloudflarestorage.com)`
  );
  console.log(`Folders: ${folders.join(", ")}`);
  console.log(`Mode:    ${FORCE ? "force (re-upload everything)" : "incremental (skip matching sizes)"}`);
  console.log(``);

  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;
  const started = Date.now();

  for (const folder of folders) {
    process.stdout.write(`${folder.padEnd(20)} `);
    let uploadedInFolder = 0;
    let skippedInFolder = 0;
    for (const file of walk(path.join(ROOT, folder))) {
      const res = await uploadOne(file);
      if (res.uploaded) {
        uploaded++;
        uploadedInFolder++;
        bytes += res.bytes ?? 0;
      } else {
        skipped++;
        skippedInFolder++;
      }
    }
    console.log(` +${uploadedInFolder} · ${skippedInFolder}`);
  }

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const mb = (bytes / 1024 / 1024).toFixed(1);
  console.log(``);
  console.log(`Done — uploaded ${uploaded} files (${mb} MB), skipped ${skipped}, in ${secs}s`);
}

// ─────────── minimal .env.local loader (no dotenv dep) ───────────
function loadDotenv(file) {
  if (!fs.existsSync(file)) return;
  const raw = fs.readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

main().catch((err) => {
  console.error("\nFailed:", err.message || err);
  process.exit(1);
});
