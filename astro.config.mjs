// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
// Wraps the default sharp image service to embed <Image> alt/description as
// XMP/IPTC metadata into optimized output files (AEO / Google Images).
import aeoImage from "astro-aeo-image"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), aeoImage()],
})
