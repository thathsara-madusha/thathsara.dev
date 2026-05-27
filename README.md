# thathsara.dev — Astro + Svelte 5 port

A "live operations console" portfolio for an ML × Cloud Security engineer. Static content is
rendered by Astro (zero JS); the interactive bits (terminal, threat map, training plot, matrix
rain, snake) are Svelte 5 islands hydrated on demand.

## Stack
- **Astro 5** — page generation, layout, routing
- **Svelte 5** (runes) — interactive islands
- **No other dependencies.** No Tailwind, no UI kit, no chart lib. Hand-rolled SVG/canvas.

## Run

```bash
npm install
npm run dev    # http://localhost:4321
```

Production build:

```bash
npm run build
npm run preview
```

## Layout

```
src/
  pages/
    index.astro              ← the only page; renders all 8 workspaces
  layouts/
    Layout.astro             ← <head>, fonts, global styles, body chrome
  components/
    sections/                ← static Astro components, one per workspace
      Hero.astro             ← interactive bits use <ClockTicker client:load>
      About.astro
      Projects.astro
      OSS.astro
      Writing.astro
      Stack.astro
      Timeline.astro
      Now.astro
    islands/                  ← Svelte 5 components, hydrated as islands
      StatusBar.svelte
      Workspace.svelte       ← workspace switcher (CSS-only show/hide; all sections SSR'd)
      Aside.svelte           ← right rail; mounts the live widgets
      ThreatMap.svelte
      TrainWidget.svelte
      SystemWidget.svelte
      NowPlaying.svelte
      GithubHeatmap.svelte
      Terminal.svelte
      Boot.svelte
      MatrixRain.svelte
      SnakeGame.svelte
      Toast.svelte
      ClockTicker.svelte     ← live clock + event ticker for hero
  lib/
    data.ts                  ← all content lives here
    store.ts                 ← Svelte stores: workspace, theme, toasts, modals
    konami.ts                ← konami-code keystroke listener
  styles/
    global.css               ← TUI theme, CRT scanlines, terminal styles
```

## What ships zero JS
All eight workspaces are server-rendered HTML — visit with JS off and the content reads.
Workspace switching, the terminal, and the live widgets need JS (they're real interactive UI).

## Hydration strategy
- `client:load` — status bar, workspace controller, terminal (always-on)
- `client:visible` — threat map, training plot, system stats, github heatmap (idle until in view)
- `client:idle` — matrix rain / snake (only mount on demand via the store)

## Easter eggs
- **Konami code** (↑↑↓↓←→←→ba) → red-team mode
- **7× click the brand dot** → snake.exe
- **Type `secrets`, `matrix`, `coffee`, `:wq`, `whoami`, `scan org-prod`** in the terminal
- One more we won't write down

## Origin
Ported from a single-HTML React+Babel prototype. The Svelte versions are 1:1 behaviorally — same
content, same animations, same easter eggs. JSX → runes, `useEffect` → `$effect`, `useState` →
`$state`. No React-specific libraries to drop.

## Deploy

Anywhere that serves static files. Static output by default — `npm run build` writes to `dist/`.

```bash
# Netlify / Vercel / Cloudflare Pages
build command: npm run build
publish directory: dist
```
