// Single source of truth for the app repo + latest download.
// Resolved at BUILD time from the GitHub Releases API so a redeploy always
// links to the newest DMG; falls back to a pinned release if the API is
// unreachable/rate-limited, so the download link is never broken.

export const REPO = "kylemclaren/container-ui"
export const repoUrl = `https://github.com/${REPO}`
export const allReleasesUrl = `${repoUrl}/releases`

// Bump this pin when you cut a release, so offline/rate-limited builds still
// point at a valid DMG. Online builds override it with the live latest.
const FALLBACK = {
  version: "v0.1.0",
  dmgUrl: `${repoUrl}/releases/download/v0.1.0/ContainerUI-0.1.0.dmg`,
  size: 2740088,
}

export type Release = {
  repoUrl: string
  allReleasesUrl: string
  version: string
  dmgUrl: string
  dmgSize: string
  shaUrl: string
  releaseUrl: string
}

function fmtSize(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`
}

async function resolveLatest(): Promise<Release> {
  let version = FALLBACK.version
  let dmgUrl = FALLBACK.dmgUrl
  let size = FALLBACK.size
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "container-ui.dev-build" },
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      const dmg = (data.assets ?? []).find(
        (a: { name: string }) => a.name?.toLowerCase().endsWith(".dmg"),
      )
      if (data.tag_name && dmg?.browser_download_url) {
        version = data.tag_name
        dmgUrl = dmg.browser_download_url
        size = dmg.size ?? size
      }
    }
  } catch {
    // offline / rate-limited — keep the pinned fallback
  }
  return {
    repoUrl,
    allReleasesUrl,
    version,
    dmgUrl,
    dmgSize: fmtSize(size),
    shaUrl: `${repoUrl}/releases/download/${version}/SHA256SUMS.txt`,
    releaseUrl: `${repoUrl}/releases/tag/${version}`,
  }
}

// Memoize so the API is hit once per build, shared across all components.
let cached: Promise<Release> | undefined
export function getRelease(): Promise<Release> {
  return (cached ??= resolveLatest())
}
