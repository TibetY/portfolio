# Portfolio

A single-page personal portfolio built with React + Vite. Terminal-flavored UI: decrypt-style name reveal, custom cursor, dark/light theme toggle, a right-click context menu with an easter egg, and a project list that expands on hover/click.

## Stack

- React 19 + Vite
- Plain CSS (`src/App.css`), no UI framework
- ESLint for linting

## Structure

- [src/App.jsx](src/App.jsx) — all page content and behavior (hero, whoami, projects, contact)
- [src/App.css](src/App.css) — styling and theme variables
- Project entries, name, and contact info are configured at the top of `App.jsx` (`HERO_NAME`, `EMAIL`, `PROJECTS`)

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview the production build
npm run lint      # run eslint
```
