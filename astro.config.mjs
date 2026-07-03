// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
// Wraps the default sharp image service to embed <Image> alt/description as
// XMP/IPTC metadata into optimized output files (AEO / Google Images).
import aeoImage from "astro-aeo-image"

// https://astro.build/config
export default defineConfig({
  // Absolute base for og:image / og:url / canonical. Must be the URL the site
  // is actually served from, or link-preview scrapers can't fetch the image.
  // Switch to https://container-ui.dev once its DNS is live.
  site: "https://container-ui.fly.dev",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), aeoImage()],
})
