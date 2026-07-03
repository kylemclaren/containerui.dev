// Composes the full Open Graph image (1200×630): azure→violet aurora, the
// ContainerUI icon + wordmark + tagline as a CENTERED stack, and the real
// dark-mode app window peeking from the bottom. The screenshot is a transparent
// PNG that already carries its own rounded corners + drop shadow, so it's
// composited as-is (no fabricated frame). Text is Manrope, rendered via sharp.
// The astro-og-canvas endpoint serves the result as a fill background.
//   node scripts/generate-og-bg.mjs   (or: bun run og:bg)  then rebuild.
import sharp from "sharp"

const W = 1200,
  H = 630
const SCREENSHOT = "src/assets/app-screenshot.png"
const ICON = "public/app-icon-1024.png"
const F_BOLD = "src/assets/og/Manrope-ExtraBold.ttf"
const F_MED = "src/assets/og/Manrope-Medium.ttf"
const OUT = "src/assets/og-bg.png"
const centerX = (w) => Math.round((W - w) / 2)

// --- aurora base -----------------------------------------------------------
const aurora = Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="12%" cy="0%" r="58%">
      <stop offset="0%" stop-color="#3f6bff" stop-opacity="0.58"/><stop offset="100%" stop-color="#3f6bff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="93%" cy="-10%" r="64%">
      <stop offset="0%" stop-color="#9b5cff" stop-opacity="0.64"/><stop offset="100%" stop-color="#9b5cff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="edge" cx="50%" cy="70%" r="48%">
      <stop offset="0%" stop-color="#7d5cff" stop-opacity="0.26"/><stop offset="100%" stop-color="#7d5cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05060c" stop-opacity="0.10"/><stop offset="54%" stop-color="#05060c" stop-opacity="0"/><stop offset="100%" stop-color="#05060c" stop-opacity="0.28"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#080912"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <rect width="${W}" height="${H}" fill="url(#edge)"/>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
</svg>`)

// --- app window (transparent PNG: own rounded corners + shadow) -------------
const shotW = 1148
const trimmed = await sharp(SCREENSHOT).trim().png().toBuffer() // drops empty transparent margin, keeps the shadow
const windowImg = await sharp(trimmed).resize({ width: shotW }).png().toBuffer()
const shotH = (await sharp(windowImg).metadata()).height
const visible = 272
const shotTop = H - visible
const shotLeft = centerX(shotW)

// --- text (Manrope) --------------------------------------------------------
const wordmark = await sharp({
  text: {
    text: `<span foreground="#f2f4fb">Container</span><span foreground="#9d80ff">UI</span>`,
    font: "Manrope 96",
    fontfile: F_BOLD,
    rgba: true,
    dpi: 72,
  },
})
  .png()
  .toBuffer()
const wm = await sharp(wordmark).metadata()

const tagline = await sharp({
  text: {
    text: `<span foreground="#aab2cf">A native Mac app for Apple’s container tool</span>`,
    font: "Manrope 32",
    fontfile: F_MED,
    rgba: true,
    dpi: 72,
  },
})
  .png()
  .toBuffer()
const tg = await sharp(tagline).metadata()

const iconSize = 82
const icon = await sharp(ICON).resize({ width: iconSize, height: iconSize }).png().toBuffer()

// centered vertical rhythm for the top block
const iconTop = 52
const wmTop = iconTop + iconSize + 22
const tgTop = wmTop + wm.height + 26

// --- compose (everything centered) -----------------------------------------
await sharp(aurora)
  .composite([
    { input: windowImg, top: shotTop, left: shotLeft },
    { input: icon, top: iconTop, left: centerX(iconSize) },
    { input: wordmark, top: wmTop, left: centerX(wm.width) },
    { input: tagline, top: tgTop, left: centerX(tg.width) },
  ])
  .png()
  .toFile(OUT)

console.log(
  `wrote ${OUT} — wordmark ${wm.width}x${wm.height}, tagline ${tg.width}x${tg.height}, window ${shotW}x${shotH} peeking ${visible}px`,
)
