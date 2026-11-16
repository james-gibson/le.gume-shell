# Agent hints

## This repository

`le.gume-shell` is a public seed: React 19 + Vite + Tailwind v4, Markdown content, derived
navigation, a publish guard, GitHub Pages on push. It is a *child* of `le.gume`: the same
machinery, a different subject — the lab's services and the four questions worth asking about them.

Live: https://james-gibson.github.io/le.gume-shell/ · Repo: `james-gibson/le.gume-shell`

## Commands

```bash
npm run dev      # vite
npm run build    # tsc, vite, deck, prerender, postbuild, guard   <- what CI runs
npm run smoke    # render every route (and the 404) to a string
npm run guard    # guard alone, against an existing dist/
```

`npm run build` is the gate. The guard fails on placeholders, leaked absolute paths or
credentials, a base path that disagrees with `package.json.homepage`, a missing
`404.html`/`.nojekyll`, source maps, or content that never reached the bundle. Do not weaken a
check to make a build pass; fix the output.

## Content

- One page = one file: `src/content/<section>/<slug>.md`, frontmatter `title` + `description`
  (plus optional `order`, `updated`, `tags`).
- The nav, section indexes, footer columns, TOC and counts are derived from the file tree. There
  is no nav array. Adding a file is adding a page.
- Markdown only. A live widget is a route under `src/pages/`, like `/design`.
- A child seed inherits claims, not just files. Before the first push, run the inherited-page audit
  in `src/content/guides/project-seeds.md` — every page, example and guard rule kept from this
  repository has to be true of the new one, or be deleted with its links.
- Router links are basename-relative; raw `href` strings need `import.meta.env.BASE_URL`.
- Voice: dry, technical, specific. The legume idioms ("project seeds", "nuts and bolts", "peas in
  a pod", "spill the beans") are used as ordinary phrases and never explained.

## Design

Motion and components come from `fancy-ui-react`. Read the component's page
(`https://fancy-ui.rama.app/docs/components/react/<slug>.md`) before using a prop; `className`
exists only where that table lists it. Overlay effects need a `relative overflow-hidden` parent
with a size. `/design` is the live catalogue — keep it in step with what the site actually uses.

## Skills

`.opencode/skills/legume-content/SKILL.md` — the full content workflow (add, edit, restructure,
verify, ship).

`.opencode/commands/page.md` — `/page <section>`: one file, guard, smoke, local commit.
`opencode.json` — the schema and an explicit pointer at this file; skills and commands are discovered
from their directories, not listed.
