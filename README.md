# ~/mreed — portfolio

> `> decrypting identity_`

A single-page personal portfolio with a terminal / hacker aesthetic, built for **Marcus Reed** — a developer working in cyber security & intelligence. It's a fast, dependency-light React app that leans hard into mono-spaced type, scanlines, and a few interactive flourishes.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)

---

## Features

- **Decrypt-on-load hero** — the name scrambles through glyphs before resolving, like a cracked cipher.
- **Custom cursor** — a smoothed ring + echo + dot that snaps and scales over interactive elements (pointer-fine devices only).
- **Dark / light theme** — toggle from the top bar; preference persists via `localStorage`.
- **Expandable project list** — hover or tap a row to reveal a writeup and an ASCII diagram for each project.
- **Custom right-click menu** — a terminal-styled context menu with quick actions… and a `noclip` easter egg. Try right-clicking anywhere.
- **CRT scanline overlay** and subtle glitch animations for atmosphere.
- **No trackers, no cookies** — just static files.

## Tech stack

| | |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 (`@vitejs/plugin-react`) |
| Styling | Hand-written CSS + CSS custom properties |
| Font | JetBrains Mono |
| Linting | ESLint 10 (react-hooks, react-refresh) |

## Getting started

```bash
# install dependencies
npm install

# start the dev server (with HMR)
npm run dev

# build for production
npm run build

# preview the production build locally
npm run preview

# lint
npm run lint
```

The dev server prints a local URL (default `http://localhost:5173`).

## Project structure

```
portfolio/
├── index.html          # entry HTML, font preloads, root mount
├── vite.config.js      # Vite + React plugin config
├── eslint.config.js    # flat ESLint config
└── src/
    ├── main.jsx        # React root render
    ├── App.jsx         # the entire single-page app + interactions
    ├── App.css         # component styles
    └── index.css       # globals, theme variables, keyframes
```

Most of the content lives in `src/App.jsx`. To customize:

- **Identity & links** — `HERO_NAME`, `EMAIL`, `GITHUB_URL`, `PGP_URL` at the top of `App.jsx`.
- **Projects** — edit the `PROJECTS` array (id, name, blurb, tags, detail, ASCII art).
- **Colors** — tweak `THEME_VARS` in `App.jsx` and the `--accent` / theme variables in `src/index.css`.

## License

No license specified — all rights reserved by default. Add a `LICENSE` file if you intend to make this reusable.
