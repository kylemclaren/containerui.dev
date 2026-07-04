# container-ui.dev

The landing site for **ContainerUI** — a native SwiftUI macOS app that is a GUI
for Apple's [`container`](https://github.com/apple/container) tool.
(App repo: [kylemclaren/container-ui](https://github.com/kylemclaren/container-ui).)

The download links resolve to the **latest release DMG at build time**
(`src/lib/release.ts`, via the GitHub Releases API, with a pinned fallback) — so a
redeploy always points at the newest release build. Bump the fallback pin when cutting
a release for offline/rate-limited builds.

Built with **Astro + Tailwind v4**. The design is macOS-26 "Liquid Glass": the page
is made of the same material as the app — translucent app-chrome over an aurora of the
icon's azure→violet light, with a solid substrate for prose. The hero is a *driven*
recreation of the app window (the All/Running filter actually filters, and each row
reveals the exact `container …` command it maps to — the CLI seam is the signature).

## Develop

```bash
bun install
bun run dev        # http://localhost:4321
bun run build      # static output to dist/
bun run preview
bun run typecheck  # astro check — should be 0 errors
bun run og:bg      # regenerate the OG background (after swapping the screenshot)
```

## Structure

```
src/
  layouts/main.astro     Head, SEO/OG, no-flash theme + no-JS reveal guard
  pages/index.astro      Composes the sections
  pages/og/[...route].ts astro-og-canvas endpoint → /og/index.png (build-time)
  lib/release.ts         one source of truth: repo URL + latest DMG (GitHub API)
  components/
    Nav · Hero · AppWindow   nav + hero + the living app-window mockup
    Approach                 the CLI seam: container --format json → decoded row
    Features · Architecture  three screens; the Views→…→Process pipeline
    Install · Footer         download DMG / build steps, "not installed" state, CTA
    BrandMark.astro          app icon via astro:assets (embeds AEO XMP metadata)
    Icon.astro               inline SF-Symbol-like icons
  scripts/site.ts        theme toggle, scroll-reveal, driven window, copy, tilt
  styles/global.css      design tokens + liquid-glass material + component styles
  assets/                og-bg.png (aurora + app screenshot), og/*.ttf (Inter), icon
scripts/generate-og-bg.mjs OG background compositor (sharp)
public/                  app icon (logo/favicon) + favicon.svg
```

### Open Graph & image metadata

- **OG image** (`/og/index.png`) is generated at build by **astro-og-canvas**: the
  azure→violet aurora, the wordmark + tagline (Inter, `src/assets/og/`), and the real
  dark-mode app window peeking from the bottom. To refresh the screenshot, replace
  `src/assets/app-screenshot.png` and run `bun run og:bg`, then rebuild.
- **astro-aeo-image** wraps the sharp image service and embeds each `<Image>`'s
  alt/description/keywords/creator/license as **XMP/IPTC** into the optimized file
  itself (Google Images + AI answer engines). `BrandMark.astro` carries that metadata.

Dark is the primary appearance; a faithful macOS-light mode is available via the
nav toggle (defaults to the OS preference). Mono type is reserved for the CLI/code
layer only; green is reserved for running status.
