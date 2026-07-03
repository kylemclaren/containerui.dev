// Landing-site behavior. The hero window is DRIVEN: the filter filters, the
// seam echoes the live `container` command, rows reveal their argv, the
// sparkline plots. This is the thesis — a responsive GUI over a CLI — as proof.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const finePointer = window.matchMedia("(pointer: fine)").matches

/* ---------------------------------------------------------------- theme */
function initTheme() {
  const btn = document.getElementById("theme-toggle")
  if (!btn) return
  const apply = (t: string) => {
    document.documentElement.setAttribute("data-theme", t)
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light appearance" : "Switch to dark appearance")
    btn.dataset.theme = t
  }
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"
    try { localStorage.setItem("theme", next) } catch {}
    apply(next)
  })
}

/* -------------------------------------------------------- scroll reveal */
function initReveal() {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
  if (reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in")
          io.unobserve(e.target)
        }
      })
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  )
  els.forEach((el) => io.observe(el))
}

/* ----------------------------------------------------------- copy chips */
function initCopy() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || ""
      try {
        await navigator.clipboard.writeText(text)
        btn.classList.add("copied")
        window.setTimeout(() => btn.classList.remove("copied"), 1600)
      } catch {}
    })
  })
}

/* ------------------------------------------------------- hero window ux */
const SEAM_ALL = 'container list <span class="fl">--all --format json</span>'
const SEAM_RUNNING = 'container list <span class="fl">--format json</span>'

function setSeam(html: string) {
  const seam = document.getElementById("hero-seam")
  if (seam) seam.innerHTML = html + '<span class="caret"></span>'
}

function initFilter() {
  const all = document.getElementById("seg-all")
  const running = document.getElementById("seg-running")
  const sub = document.getElementById("hero-sub")
  const rows = Array.from(document.querySelectorAll<HTMLElement>("#hero-rows .row"))
  if (!all || !running || !rows.length) return
  let mode: "all" | "running" = "all"

  const render = () => {
    rows.forEach((r) => {
      const idle = r.dataset.state === "idle"
      r.style.display = mode === "running" && idle ? "none" : ""
    })
    all.classList.toggle("on", mode === "all")
    running.classList.toggle("on", mode === "running")
    all.setAttribute("aria-pressed", String(mode === "all"))
    running.setAttribute("aria-pressed", String(mode === "running"))
    if (sub) sub.textContent = mode === "all" ? "5 containers · 3 running" : "3 containers · 3 running"
    setSeam(mode === "all" ? SEAM_ALL : SEAM_RUNNING)
  }

  all.addEventListener("click", () => { mode = "all"; render() })
  running.addEventListener("click", () => { mode = "running"; render() })

  // Rows echo their exact argv into the seam as you point at them.
  const restore = () => setSeam(mode === "all" ? SEAM_ALL : SEAM_RUNNING)
  rows.forEach((r) => {
    const cmd = r.querySelector(".row-cmd")?.textContent?.replace(/^\$/, "").trim()
    if (!cmd) return
    r.addEventListener("mouseenter", () => setSeam(escapeHtml(cmd)))
    r.addEventListener("mouseleave", restore)
  })
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string)
}

/* ---------------------------------------------------------- sparklines */
function initSparks() {
  document.querySelectorAll<SVGPathElement>("[data-spark] path").forEach((path) => {
    const N = 22
    const data = Array.from({ length: N }, () => 6 + Math.random() * 8)
    const draw = () => {
      const w = 62, h = 20, pad = 2
      const max = Math.max(...data, 14)
      const pts = data.map((v, i) => {
        const x = (i / (N - 1)) * w
        const y = h - pad - (v / max) * (h - pad * 2)
        return `${x.toFixed(1)} ${y.toFixed(1)}`
      })
      path.setAttribute("d", "M" + pts.join(" L"))
    }
    draw()
    if (reduceMotion) return
    window.setInterval(() => {
      data.push(6 + Math.random() * 9)
      data.shift()
      draw()
    }, 1100)
  })
}

/* ----------------------------------------------------------- hero tilt */
function initTilt() {
  const el = document.querySelector<HTMLElement>("[data-tilt]")
  const stage = document.getElementById("hero-stage")
  if (!el || !stage || reduceMotion || !finePointer) return
  let raf = 0
  stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`)
      el.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`)
    })
  })
  stage.addEventListener("mouseleave", () => {
    el.style.setProperty("--ry", "0deg")
    el.style.setProperty("--rx", "0deg")
  })
}

/* --------------------------------------------------- images pull demo */
// Self-running: the pull bar sweeps to done, a new image row fades in, resets.
function initPullDemo() {
  const demo = document.querySelector<HTMLElement>("[data-pull-demo]")
  if (!demo || reduceMotion) return
  const bar = demo.querySelector<HTMLElement>(".pull-fill")
  const pct = demo.querySelector<HTMLElement>(".pull-pct")
  const newRow = demo.querySelector<HTMLElement>(".pull-new")
  if (!bar || !pct || !newRow) return
  let p = 0
  const tick = () => {
    p += 4 + Math.random() * 9
    if (p >= 100) {
      p = 100
      bar.style.width = "100%"
      pct.textContent = "done"
      newRow.classList.add("in")
      window.setTimeout(() => {
        newRow.classList.remove("in")
        p = 0
        bar.style.width = "0%"
        pct.textContent = "0%"
        window.setTimeout(tick, 900)
      }, 2600)
      return
    }
    bar.style.width = p + "%"
    pct.textContent = Math.round(p) + "%"
    window.setTimeout(tick, 260)
  }
  window.setTimeout(tick, 1200)
}

/* ---------------------------------------------------- latest release */
// The download links are resolved at BUILD time, so a deploy that predates a
// new release would point at the old DMG. This re-checks the GitHub Releases
// API on load and rewrites the links/version/size to the true latest, so the
// site self-heals between deploys. Build-time values are the no-JS fallback;
// any failure here leaves them untouched.
function initLatestRelease() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-dl-href]"))
  if (!links.length) return
  // Derive owner/repo from the build-time link — no hardcoded repo to drift.
  const m = (links[0].getAttribute("href") || "").match(/github\.com\/([^/]+\/[^/]+)\/releases/)
  if (!m) return
  const repo = m[1]

  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 4000)
  fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
    signal: ctrl.signal,
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data: { tag_name?: string; assets?: { name?: string; browser_download_url?: string; size?: number }[] }) => {
      const dmg = (data.assets ?? []).find((a) => a.name?.toLowerCase().endsWith(".dmg"))
      if (!data.tag_name || !dmg?.browser_download_url) return
      const version = data.tag_name
      const dmgUrl = dmg.browser_download_url
      const base = dmgUrl.replace(/\/releases\/.*$/, "")
      const setAll = (sel: string, apply: (el: HTMLElement) => void) =>
        document.querySelectorAll<HTMLElement>(sel).forEach(apply)

      setAll("[data-dl-href]", (el) => ((el as HTMLAnchorElement).href = dmgUrl))
      setAll("[data-dl-sha]", (el) => ((el as HTMLAnchorElement).href = `${base}/releases/download/${version}/SHA256SUMS.txt`))
      setAll("[data-dl-version]", (el) => (el.textContent = version))
      if (typeof dmg.size === "number") {
        const size = `${(dmg.size / 1048576).toFixed(1)} MB`
        setAll("[data-dl-size]", (el) => (el.textContent = size))
      }
    })
    .catch(() => {
      /* offline / rate-limited — keep the build-time links */
    })
    .finally(() => window.clearTimeout(timer))
}

/* -------------------------------------------------------- nav on scroll */
function initNav() {
  const nav = document.getElementById("nav")
  if (!nav) return
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12)
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })
}

initTheme()
initReveal()
initCopy()
initFilter()
initSparks()
initTilt()
initPullDemo()
initNav()
initLatestRelease()
