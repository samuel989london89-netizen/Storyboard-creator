# Storyboard AI

A free, browser-based app for generating UX/UI storyboards with AI-illustrated panels.

## Features

- **AI image generation** via [Pollinations.ai](https://pollinations.ai) — completely free, no API key required
- **Character master creator** — describe your character once, generate 4 reference views (front, side, 3/4, portrait). A style seed ensures visual consistency across all panels
- **6 layout presets** — 2×3 grid, 3×2 grid, Hero+4, Editorial Mix, 4-Panel, Cinematic
- **Panel editor** — write title + scene description per panel before generating
- **Individual panel regeneration** — hover any panel and click "Redo"
- **Export as PNG or SVG** — high-res exports of the complete storyboard
- **localStorage persistence** — storyboards are saved in your browser
- **JSON backup/restore** — export all storyboards to a file, import later

## Running locally

```bash
cd storyboard-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## How it works

1. **Define your character** — name, visual description, accent color. Optionally preview 4 master reference views.
2. **Choose a layout** — pick from 6 panel arrangements
3. **Write each panel** — title + scene description per panel
4. **Generate** — AI illustrates all panels in a consistent sketch/silhouette style
5. **Export** — download as PNG (2× pixel ratio) or SVG

## Art style

All panels are generated using the Flux model on Pollinations.ai with a fixed sketch/line-art prompt template. The same character description + style seed is used across all panels for maximum visual consistency.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS v4
- Pollinations.ai (Flux model — free, no API key)
- html-to-image (PNG/SVG export)
- localStorage (persistence)
