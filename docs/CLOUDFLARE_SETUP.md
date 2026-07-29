# Cloudflare R2 setup for photograph delivery

The site's 213 photographs live outside git (2.85 GB — far too big
for GitHub) and are served from Cloudflare R2 in production. The
code doesn't care where the files live: one env var flips URLs from
`/assets/…` (local dev) to `https://<bucket>.r2.dev/assets/…` (prod).

This document walks you through the one-time setup: creating the
bucket, minting an API token, uploading the photos, and wiring the
env var on your host.

---

## 0. Why R2, not Cloudflare Images?

* R2 stores your **originals** and serves them as-is (no lossy
  transforms, no per-image transformation billing).
* Free tier: 10 GB storage + 1 M reads / month. Your ~2.85 GB fits.
* Egress via the `r2.dev` subdomain or a custom Cloudflare-fronted
  domain is free (unlike direct S3 egress).
* Cloudflare Images charges $5/mo + $1 / 100k requests +
  $5 / 100k transformations — a worse fit for a photography portfolio
  where you want to preserve every pixel.

---

## 1. Create the R2 bucket

1. Sign in at <https://dash.cloudflare.com>.
2. In the left sidebar → **R2 Object Storage** → **Create bucket**.
3. Name it `vb-photographe` (or anything you like — write it down).
4. Location: **Automatic** is fine.
5. Click **Create bucket**.

---

## 2. Turn on public access

By default a bucket is private. Enable public access so browsers can
fetch photos directly.

1. Open the bucket → **Settings** → scroll to **Public access**.
2. Under **R2.dev subdomain**, click **Allow access**.
3. Cloudflare will show you a public URL like:
   `https://pub-abcdef123456.r2.dev`
4. **Copy this URL** — it goes into `NEXT_PUBLIC_CDN_BASE_URL`.

> **Optional but recommended**: put a custom domain in front of the
> bucket (e.g. `img.vbphotographe.com`). Free with any Cloudflare
> zone; gives you cache-hit stats and lets you swap providers later
> without changing image URLs. Setup: bucket → **Settings** →
> **Custom Domains** → **Connect Domain**.

---

## 3. Mint an API token

1. R2 sidebar → **Manage R2 API Tokens** → **Create API token**.
2. Permissions: **Object Read & Write**.
3. Bucket: pick your `vb-photographe` bucket (safer than "All buckets").
4. TTL: none needed unless you want auto-expiry.
5. Click **Create API Token**. Cloudflare shows three values:
   * **Access Key ID**
   * **Secret Access Key**
   * **jurisdiction-specific endpoint** — you can ignore this one,
     the upload script builds its own from your account ID.

Also grab your **Cloudflare account ID**: R2 sidebar → the ID is in
the right-hand column, e.g. `abcdef1234567890abcdef1234567890`.

---

## 4. Fill in `.env.local`

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and fill:

```env
# The public R2 URL from step 2
NEXT_PUBLIC_CDN_BASE_URL=https://pub-abcdef123456.r2.dev

# Account ID + API token from step 3
R2_ACCOUNT_ID=abcdef1234567890abcdef1234567890
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
R2_BUCKET=vb-photographe
```

`.env.local` is git-ignored — keys never leave your machine.

---

## 5. Upload the photographs

```bash
npm run upload
```

The script:

* Walks `public/assets/**` for images and videos
* Uploads each one to `assets/<folder>/<file>` in your bucket
* Skips files whose remote size already matches (idempotent — safe to
  re-run any time)
* Sets `Cache-Control: public, max-age=31536000, immutable` so
  browsers + Cloudflare edge cache the photos for a year

Expect the first run to take a while — around 2.85 GB at whatever
your upload bandwidth is. A second run is instant because everything
matches.

Options:

```bash
npm run upload -- --force        # re-upload everything (bypass skip)
npm run upload -- bridal groom   # limit to specific folders
```

Verify the upload by visiting a URL manually, e.g.:

<https://pub-abcdef123456.r2.dev/assets/bridal/1.jpg>

You should see the photograph.

---

## 6. Wire the env var on your host (Render)

On Render:

1. Open your service → **Environment** tab → **Add Environment Variable**.
2. Add **NEXT_PUBLIC_CDN_BASE_URL** = `https://pub-abcdef123456.r2.dev`
   (the exact URL from step 2).
3. Save. Render redeploys.

That's it. Every category card, /work archive tile, and gallery
photograph now streams from Cloudflare's edge.

You **do not** need `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` /
`R2_SECRET_ACCESS_KEY` / `R2_BUCKET` on Render — those are only used
by the local upload script. Keep them on your machine.

---

## 7. Adding more photographs later

The gallery reads from `lib/asset-manifest.json`, which is a listing
of every file per category, generated from your local
`public/assets/` folder. So the workflow is:

```bash
# 1. Drop new files into public/assets/<folder>/ locally
cp ~/Desktop/new-bridals/*.jpg public/assets/bridal/

# 2. Regenerate the manifest (small JSON, gets committed)
npm run manifest

# 3. Push the new files to R2
npm run upload

# 4. Commit + push the code changes (manifest + any code edits)
git add lib/asset-manifest.json
git commit -m "Add 12 new bridal photographs"
git push
```

Render redeploys automatically from git → the new photos appear
online with no other action.

---

## 8. Troubleshooting

**Photos 404 on the deployed site**
Check `NEXT_PUBLIC_CDN_BASE_URL` is set on Render **without** a
trailing slash and matches the exact URL from step 2. Rebuild after
setting env vars.

**`next/image` complains about hostname**
`next.config.mjs` already whitelists `*.r2.dev`,
`*.r2.cloudflarestorage.com`, `imagedelivery.net`, and
`img.vbphotographe.com`. If you use a different custom domain, add
it to `remotePatterns`.

**`npm run upload` errors "Missing …"**
`.env.local` isn't filled in. See step 4.

**`npm run upload` succeeds but visitors can't fetch photos**
The bucket's **Public access** wasn't enabled (step 2). Toggle it
on and try the browser URL again.

**Photos are being aggressively compressed on the site**
They aren't — `next/image` respects `quality` set in the code
(85-90 across the app) and delivers WebP/AVIF at responsive sizes.
The original JPGs in R2 stay untouched. If a specific photograph
looks off, verify the source in the bucket by opening its URL
directly.
