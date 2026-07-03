import { OGImageRoute } from "astro-og-canvas"

// The OG image is composed in full by scripts/generate-og-bg.mjs (aurora +
// wordmark + tagline + the app window peeking from the bottom). astro-og-canvas
// serves it at build time as a fill background → /og/index.png.
export const { getStaticPaths, GET } = await OGImageRoute({
  pages: {
    index: { title: "ContainerUI" },
  },
  getImageOptions: () => ({
    title: "",
    bgImage: { path: "./src/assets/og-bg.png", fit: "fill" },
    padding: 0,
    fonts: ["./src/assets/og/Manrope-Medium.ttf"],
  }),
})
