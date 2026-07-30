/**
 * Resolve kommodo.ai share URLs to direct image URLs.
 *
 * The user-supplied URLs (https://kommodo.ai/i/<id>) are HTML share
 * pages, not direct image resources — using them as <img src> would
 * give the browser text/html and refuse to render. Each share page
 * carries an <meta property="og:image"> pointing to a direct
 * plain-apac-prod-public.komododecks.com/.../image.jpg URL that IS
 * hotlinkable and serves the original JPEG at full quality.
 *
 * This script:
 *   1. Fetches every share page in `SHARE_URLS` (defined below).
 *   2. Parses out the og:image URL.
 *   3. HEAD-checks the direct URL is 200 image/*.
 *   4. Writes a static `{ number: direct_url }` map to
 *      lib/hosted-images.json, committed to git so builds are
 *      reproducible.
 *
 * If ANY URL fails, the script aborts and prints which ones failed —
 * per the migration brief (§10-§11), a partial or invented mapping
 * would silently break the site.
 *
 * Run: node scripts/fetch-hosted-images.mjs
 * Re-run any time the source list changes (safe / idempotent).
 */
import fs from "node:fs";
import path from "node:path";

// User-supplied share URLs — order preserved. `null` slots mean the
// user explicitly said "no URL provided" (104-110); those numbers
// stay handled by the existing gallery mechanism.
const SHARE_URLS = {
  1: "https://kommodo.ai/i/Q0A37Vr7H0HIKsBWKapo",
  2: "https://kommodo.ai/i/TMfPBy1p13pXL2EP4ZrE",
  3: "https://kommodo.ai/i/uBV0miLUPG9ft5AjPLO7",
  4: "https://kommodo.ai/i/5kjQOid6SKWmpNNnlQho",
  5: "https://kommodo.ai/i/V8T3HhdcE1DDmamLByuN",
  6: "https://kommodo.ai/i/04k9HCIyLolrsXTwHISF",
  7: "https://kommodo.ai/i/DMYVedc9tkodwRtsYHtP",
  8: "https://kommodo.ai/i/LfGw22NtwrbNXoosXUsa",
  9: "https://kommodo.ai/i/tFzb60TpgzOsuFs07cWE",
  10: "https://kommodo.ai/i/YtbP0dwuyDXpEo3ZJXh6",
  11: "https://kommodo.ai/i/aFFKnFXbwk9IkAJlOSMu",
  12: "https://kommodo.ai/i/OqzbHUSh3uBujBO0UwlG",
  13: "https://kommodo.ai/i/6wJ0TpOw95WbFuqAfdp7",
  14: "https://kommodo.ai/i/LkY3VfxuJq0Um5O5hG0O",
  15: "https://kommodo.ai/i/aXFNVy5A3pcEFc6zfwZw",
  16: "https://kommodo.ai/i/CZGPsoo6dwAGquSLoQGM",
  17: "https://kommodo.ai/i/Y4ZmakCYVp5i8EXksPXp",
  18: "https://kommodo.ai/i/YhMlYwiSXwMCO3an72St",
  19: "https://kommodo.ai/i/4aPftOZQgXUknRbmAEPz",
  20: "https://kommodo.ai/i/S7QLt0x6oa08STplb7pE",
  21: "https://kommodo.ai/i/XH9MPxuqw6hxeihGvYOm",
  22: "https://kommodo.ai/i/m2muhuMNhsG8fePLUOnl",
  23: "https://kommodo.ai/i/YalFe7tRfIWKsDO0hdBQ",
  24: "https://kommodo.ai/i/WAJWrXEhlcbuyDMLqRiR",
  25: "https://kommodo.ai/i/CzaaZx3vae9p1OPnwUbT",
  26: "https://kommodo.ai/i/M4LeV1w7fR0yZDYik3bc",
  27: "https://kommodo.ai/i/EEuyD9qGM3mQdT7OrYhZ",
  28: "https://kommodo.ai/i/IBG1PfjaxilymJdEAvKE",
  29: "https://kommodo.ai/i/64K3gl4foW3wYcYqrHPT",
  30: "https://kommodo.ai/i/MVZcTpp4pw71RCEHQ3DB",
  31: "https://kommodo.ai/i/9UgKbxpO9unq9wk4FNQ3",
  32: "https://kommodo.ai/i/b8x2OfmveZKjRehCoV18",
  33: "https://kommodo.ai/i/uOcNMw2Y8MfEbFzIkYpp",
  34: "https://kommodo.ai/i/txUp8pGav5brrNRez3iK",
  35: "https://kommodo.ai/i/ovvqUk2RihzLncSpSb0M",
  36: "https://kommodo.ai/i/8ORn4OtZEeqDrNYkaviq",
  37: "https://kommodo.ai/i/GSJz5ehW0bzbNTyUdWxK",
  38: "https://kommodo.ai/i/89kwR6FFFpKx86X4ZngD",
  39: "https://kommodo.ai/i/x6QFJ2WS9SS6nTaEyhJG",
  40: "https://kommodo.ai/i/dmxsFaidcybFOBSJ0Gnq",
  41: "https://kommodo.ai/i/MCh6blaBy90eFMXyFj4E",
  42: "https://kommodo.ai/i/wYlTZ32UQMvQqta7Gy5X",
  43: "https://kommodo.ai/i/5HbWzb34ChO3JraOmPke",
  44: "https://kommodo.ai/i/PX30oo0t8u1VWYfYQEbd",
  45: "https://kommodo.ai/i/rZXRCZL0xUkLt3Bx9MK1",
  46: "https://kommodo.ai/i/xnarew7YWVzlAF2re5hA",
  47: "https://kommodo.ai/i/9Sg2ingRedZMzZfYZCFF",
  48: "https://kommodo.ai/i/KwKtYzVHbOVb5FJ1MEsP",
  49: "https://kommodo.ai/i/M4rsjP9VlYHbRfEqqd1q",
  50: "https://kommodo.ai/i/XyhpobdT6QvTge3jVehP",
  51: "https://kommodo.ai/i/a10UZlWvN1nQ91NJ1ThB",
  52: "https://kommodo.ai/i/Zo7vmLh5Lb07AbVbATCd",
  53: "https://kommodo.ai/i/nkdKZr0y48CyRJIVui70",
  54: "https://kommodo.ai/i/acwzfCR8PQJhlkVEB78z",
  55: "https://kommodo.ai/i/RfzVn1xd8Hl8cUeUX4nB",
  56: "https://kommodo.ai/i/ec0HuelrHEwePbD8ZaIK",
  57: "https://kommodo.ai/i/rkHUBbqzlyBqbsaYo7t4",
  58: "https://kommodo.ai/i/w8wp9tTaJkplM8h4i63H",
  59: "https://kommodo.ai/i/8urh3PF3b5PRMMAylkET",
  60: "https://kommodo.ai/i/sNPCsBLRrldDhJp360cS",
  61: "https://kommodo.ai/i/cakZhfhHUSVL3fNzy6VE",
  62: "https://kommodo.ai/i/YpCLiU1JiCisGTXQ4McB",
  63: "https://kommodo.ai/i/EOFnmj3FX0VWTWpRSxwS",
  64: "https://kommodo.ai/i/Rfhouglctzb2hEn0vtgd",
  65: "https://kommodo.ai/i/F4ZL1Yfh5npjEmnJGCzK",
  66: "https://kommodo.ai/i/UcIyZV4ELijrWmB1PGWX",
  67: "https://kommodo.ai/i/xMJKeW8JD1PLX0JaF8oy",
  68: "https://kommodo.ai/i/GfnejRW3swUrtNRmxrhG",
  69: "https://kommodo.ai/i/AyZSt1CX9B7ndaOEa56V",
  70: "https://kommodo.ai/i/tkUAIOG3CEC20uABmbtE",
  71: "https://kommodo.ai/i/0SzMeL0JB0C6EFVx5rme",
  72: "https://kommodo.ai/i/oyLwtgS7CPp3P3y3hRAx",
  73: "https://kommodo.ai/i/wkSbEyUe5w5WbH1TfkQ6",
  74: "https://kommodo.ai/i/wnFnG1ZSOsAyOic3px1E",
  75: "https://kommodo.ai/i/nSPr56lbQHLwaXc5QbuB",
  76: "https://kommodo.ai/i/JkKpi7Rf4MNSCACAWOp7",
  77: "https://kommodo.ai/i/9XSUrDLPrr8HCkgrrrll",
  78: "https://kommodo.ai/i/NmsdpdYiOLpzqng3pZmP",
  79: "https://kommodo.ai/i/NiYkvX3krXfMNQZbj0dd",
  80: "https://kommodo.ai/i/5HmjYWXvXFY7nDxbVEAC",
  81: "https://kommodo.ai/i/HL0twXUGup4LiypDIuJx",
  82: "https://kommodo.ai/i/zu4IWHfoIAxlRYXqGNmN",
  83: "https://kommodo.ai/i/1Dpq3HbRPzAORLht1d3F",
  84: "https://kommodo.ai/i/OdeQdHZ62bE5HWuTnm46",
  85: "https://kommodo.ai/i/e7s6FGJmSDgHc3MaP7Hu",
  86: "https://kommodo.ai/i/UbDJ6mDTaGoGj2bt9Z0x",
  87: "https://kommodo.ai/i/DSV9Z4J9Jd1athdZX15L",
  88: "https://kommodo.ai/i/PHjuD8LiM4qfU6eZxRh0",
  89: "https://kommodo.ai/i/UdT8GLAc0fXbCDHl1wgV",
  90: "https://kommodo.ai/i/zhPXeP1EzZcDmYjFIPjG",
  91: "https://kommodo.ai/i/GHWvu7LfyTUlxZCOASDA",
  92: "https://kommodo.ai/i/jDHsz4BgZqO5i14Bt2N4",
  93: "https://kommodo.ai/i/PAPXo2uOyBjSWDCpCu87",
  94: "https://kommodo.ai/i/vq34VSfaHizFRbvWsJQp",
  95: "https://kommodo.ai/i/0VSWMuQQDSnbH3Fge5gP",
  96: "https://kommodo.ai/i/4yClIV1AdVfhpvn81N7L",
  97: "https://kommodo.ai/i/Ksm3gjU3SyGErIZwxZ95",
  98: "https://kommodo.ai/i/ORvXMwJr6XLJKr7l2f6c",
  99: "https://kommodo.ai/i/qlG9EOCgI7ocqy8lKIw4",
  100: "https://kommodo.ai/i/wBeY0lY48iXRi0kLNbHt",
  101: "https://kommodo.ai/i/sEbwhEbJj57pDd3ykxEM",
  102: "https://kommodo.ai/i/a06IQ2ff5I5GBlwilEf7",
  103: "https://kommodo.ai/i/NG89q64p8hEU8ZYEtiX3",
  // 104-110: intentionally absent — those are Candid Videos (YouTube).
  111: "https://kommodo.ai/i/3KNorB6sCYYm499rcpHF",
  112: "https://kommodo.ai/i/6TJUPeNoZauYF3Cx1kYf",
  113: "https://kommodo.ai/i/VuyzijFyyv1DdiT5ZlGR",
  114: "https://kommodo.ai/i/AVqoOWJDSFoP5YTIeUn2",
  115: "https://kommodo.ai/i/qOWBz3uQc2YlisOQNg2v",
  116: "https://kommodo.ai/i/ebV8qAJj7F9Ze7asE8Cn",
  117: "https://kommodo.ai/i/RZbOI5sGIoIYCC3IjOKD",
  118: "https://kommodo.ai/i/EOXqjm32xLadiiUJKFte",
  119: "https://kommodo.ai/i/Hkyr4mPCErvrmLZy1fro",
  120: "https://kommodo.ai/i/B7eDimFnd2ESlXelXmPG",
  121: "https://kommodo.ai/i/ggLXnlgI3sbldAPRdlcz",
  122: "https://kommodo.ai/i/hSMKWcBL6NstM10zl5bY",
  123: "https://kommodo.ai/i/vPjX1HBYFZyuctXjPYK9",
  124: "https://kommodo.ai/i/JnDSJUFaBXoqPdoVQqhR",
  125: "https://kommodo.ai/i/A8IjjbZtnBXAHgoWWDQB",
  126: "https://kommodo.ai/i/XPkZiFuZtKyDqwdI2RoG",
  127: "https://kommodo.ai/i/1vGjAJArr3vPXP2mYuyH",
  128: "https://kommodo.ai/i/pt2lZVbgiWE8wCcKrqqV",
  129: "https://kommodo.ai/i/8Smh02WlVuyro9QE1DZE",
  130: "https://kommodo.ai/i/Y3yPp4VcfqDOQmwWa6gP",
  131: "https://kommodo.ai/i/DoneKQBg6llbPL1BWeEd",
  132: "https://kommodo.ai/i/amcmM0vjpxgKc4vFQ626",
  133: "https://kommodo.ai/i/xPNINVWcrKeV1MLXlLp7",
  134: "https://kommodo.ai/i/6dHNdo7P6gM9e2eOZgtV",
  135: "https://kommodo.ai/i/i4M0BmBHW2QnLqTo2LJY",
  136: "https://kommodo.ai/i/V8EMzkKbYn9ONWAWqUdT",
  137: "https://kommodo.ai/i/F1ZyHwR4N5yAxVI3Z1Jt",
  138: "https://kommodo.ai/i/Oz9xi00iB7uYm4a9LWPX",
  139: "https://kommodo.ai/i/VXfTFTI71HLj3oPIcSEH",
  140: "https://kommodo.ai/i/liRvS73RhWqdZuHWfRXj",
  141: "https://kommodo.ai/i/Kn8Jvl9hOZmOby12pvxv",
  142: "https://kommodo.ai/i/rf9niZ9435lV0FeyipLb",
  143: "https://kommodo.ai/i/GrDDfglP97NdwuezLOH0",
  144: "https://kommodo.ai/i/1YyHCxVoSHifOCCdq6Yp",
  145: "https://kommodo.ai/i/DK0vpgjqIEXn0QiT6uiD",
  146: "https://kommodo.ai/i/BndA5t9gsxo8J3Ti8f1h",
  147: "https://kommodo.ai/i/50KXYfpOfifChyqM2cUO",
  148: "https://kommodo.ai/i/hEsSWK0t29tiHHh58syz",
  149: "https://kommodo.ai/i/iOM4d5fqa395owRuTUOC",
  150: "https://kommodo.ai/i/ydnGk9OQBDS2J2Y139wd",
  151: "https://kommodo.ai/i/aDYR9UFRdt2OKb96vMd2",
  152: "https://kommodo.ai/i/Y73Ka1Fa571sjOjsrRKo",
  153: "https://kommodo.ai/i/jj5zTmI2ZHagdOw9fpkK",
  154: "https://kommodo.ai/i/tpxgj6UQl31F7aKuGTSX",
  155: "https://kommodo.ai/i/Tv3aZ6ciNGS9hBW5SsAP",
  156: "https://kommodo.ai/i/Gge0D4tTra0pk8OrpbIH",
  157: "https://kommodo.ai/i/fqyQRG1MFKy3I90RLMI2",
  158: "https://kommodo.ai/i/Tr5NQPx3kQgoPHEQcg08",
  159: "https://kommodo.ai/i/OxQIVG812XEMNxTJhti7",
  160: "https://kommodo.ai/i/fdNQ9mID2fQQE3iHXOr3",
  161: "https://kommodo.ai/i/29wAQNUU2C23sjZGPTtL",
  162: "https://kommodo.ai/i/OdDemhT9P5q9IxJOLwDY",
  163: "https://kommodo.ai/i/xVH5XMGE859Uf8ce09Ys",
  164: "https://kommodo.ai/i/XTQ9QwiYyS52c9xIff8z",
  165: "https://kommodo.ai/i/83s0ZOsDsd4bXvGJ02DN",
  166: "https://kommodo.ai/i/NVTrWRzPQzTg77Fotus8",
  167: "https://kommodo.ai/i/NkGOieRR39Z8Xxp7cgT8",
  168: "https://kommodo.ai/i/TsyQH80h2kQy3NpAps9q",
  169: "https://kommodo.ai/i/00aDm19FUN5tUjZy1Fu7",
  170: "https://kommodo.ai/i/nxdBrvAekM3YwfHyhtxT",
  171: "https://kommodo.ai/i/Cdmu9mTVjtYNC6ysqjcY",
  172: "https://kommodo.ai/i/d7t7mUJTiEMwArFsZEle",
  173: "https://kommodo.ai/i/AjMcJdgM8r5ev3ClGz30",
  174: "https://kommodo.ai/i/TdyEeWsAvOEtVyT4UiJk",
  175: "https://kommodo.ai/i/evuZG7SxPe29Zf139Gni",
  176: "https://kommodo.ai/i/OgCXIbThcZRC5E23osF8",
  177: "https://kommodo.ai/i/oenmT3IGDSW62T15qvHz",
  178: "https://kommodo.ai/i/EC2Ix4s1ZpyV9IZirOwG",
  179: "https://kommodo.ai/i/66BoXLa8K2RT15Rn8TLF",
  180: "https://kommodo.ai/i/qgjoYTjpLBqJMt7lrhpu",
  181: "https://kommodo.ai/i/WSWVRS2QNYAj8Dj1hMGs",
  182: "https://kommodo.ai/i/aAOsTADEqwo3TNc3tvNE",
  183: "https://kommodo.ai/i/WBxBMftFVMnNyacEVlsc",
  184: "https://kommodo.ai/i/NDLmBmIV6J2hvu5Db3cX",
  185: "https://kommodo.ai/i/k0ER6UP7OEwkS9Mjd2by",
  186: "https://kommodo.ai/i/GXAsc3855Koh6mtARORX",
  187: "https://kommodo.ai/i/G8Vt1xjX9cVbriFq3NO5",
  188: "https://kommodo.ai/i/Gi8cxCMvnUOBi2YnRao5",
  189: "https://kommodo.ai/i/X7wgRuGZyIkn1SKwav7y",
  190: "https://kommodo.ai/i/3js7RwY3VfoRpLqq376g",
  191: "https://kommodo.ai/i/PusRjEaOuEGjizA5HdkG",
  192: "https://kommodo.ai/i/TRy6Mtw6FCA0IqU4arS6",
  193: "https://kommodo.ai/i/ynTsZTsyz3giXYKKqbmg",
  194: "https://kommodo.ai/i/ESicoZCFVgFDx8vgUL9Q",
  195: "https://kommodo.ai/i/u3BG34lDiO9CwozRrjfV",
  196: "https://kommodo.ai/i/6RKFEzwBziIerRlMPnUJ",
  197: "https://kommodo.ai/i/HS7ouHqiQtvIZXUFTUjv",
  198: "https://kommodo.ai/i/sSY31AL33jxSSgWBWzyb",
  199: "https://kommodo.ai/i/IAMiITfle9QgFu7GYI5a",
  200: "https://kommodo.ai/i/zdtH3BxOUv2cRrjtSM9z",
  201: "https://kommodo.ai/i/cz2Plcd9gnP0R6zAod9o",
  202: "https://kommodo.ai/i/zROhnEkfPbfCuEPGbPAV",
  203: "https://kommodo.ai/i/CMSWoTPj2qlopzpA5OP6",
  204: "https://kommodo.ai/i/psthynZQWbR2svm70sc7",
  205: "https://kommodo.ai/i/oyLjMXl2GUl645hH8adO",
  206: "https://kommodo.ai/i/tgtEEjOwDiDgpsnSKgrn",
  207: "https://kommodo.ai/i/bYkphAh9eUpRbjOtWoK0",
  208: "https://kommodo.ai/i/lGG1uYSeLDvxCv2ws0ay",
  209: "https://kommodo.ai/i/EYtyRgOam6E0HBtdyQMT",
  210: "https://kommodo.ai/i/w9PrHphDafoNOmwlPnll",
  211: "https://kommodo.ai/i/YtvMDdxh00XRsHcZPkKM",
  212: "https://kommodo.ai/i/vKh75FmAg18fOf3awtmg",
  213: "https://kommodo.ai/i/QYTHapdnbsomPSXrk8rX",
  214: "https://kommodo.ai/i/qrVmrYxkR584a5qQqcaR",
  215: "https://kommodo.ai/i/We2SInn9zFTcel8HbcHW",
  216: "https://kommodo.ai/i/KcgcRvJsEVIrz8PNI7cL",
  217: "https://kommodo.ai/i/WT6onD8tNoFoMXmldKcf",
  218: "https://kommodo.ai/i/v02Nw0tdXgTs9obUgSuZ",
};

const OG_IMAGE_RE =
  /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i;

async function resolveOne(number, shareUrl) {
  const html = await fetch(shareUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VBPh-build/1.0)" },
    redirect: "follow",
  }).then((r) => {
    if (!r.ok) throw new Error(`share HTTP ${r.status}`);
    return r.text();
  });
  const match = OG_IMAGE_RE.exec(html);
  if (!match) throw new Error("no og:image meta tag");
  const direct = match[1];

  // HEAD-check to make sure it's really a hotlinkable image
  const head = await fetch(direct, {
    method: "HEAD",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VBPh-build/1.0)" },
  });
  if (!head.ok) throw new Error(`direct HTTP ${head.status}`);
  const ct = head.headers.get("content-type") || "";
  if (!ct.startsWith("image/")) throw new Error(`content-type ${ct}`);
  return direct;
}

async function main() {
  const numbers = Object.keys(SHARE_URLS)
    .map(Number)
    .sort((a, b) => a - b);
  console.log(`Resolving ${numbers.length} kommodo share URLs…`);

  const out = {};
  const failures = [];
  let done = 0;

  for (const n of numbers) {
    try {
      out[n] = await resolveOne(n, SHARE_URLS[n]);
      done++;
      if (done % 20 === 0 || done === numbers.length) {
        console.log(`  ${done}/${numbers.length}`);
      }
    } catch (err) {
      failures.push({ number: n, share: SHARE_URLS[n], error: err.message });
      process.stdout.write("!");
    }
  }

  if (failures.length > 0) {
    console.error(`\n\n${failures.length} URL(s) failed:`);
    for (const f of failures) {
      console.error(`  ${f.number}: ${f.share} — ${f.error}`);
    }
    process.exit(2);
  }

  const outPath = path.resolve("lib/hosted-images.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${outPath} — ${Object.keys(out).length} entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
