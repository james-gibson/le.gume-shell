---
title: Project seeds
description: Why this repository is a seed rather than a generator, what to keep, and what to throw away.
order: 1
updated: 2026-11-13
tags: templates, bootstrap
seeds: starter
---

# Project seeds

A generator produces a project once and then disappears. A seed keeps producing: you can read
it, diff it, and take only the parts you need. This repository is the second kind.

## Why not a CLI

A `create-*` package has one advantage — a short command — and three costs:

- the template lives twice, once in the CLI and once in its own repo;
- the CLI has to be versioned, trusted and updated independently of the thing it produces;
- the generated project cannot be compared to its source, because the source is inside a
  package you did not read.

A seed has none of those. `git clone` is the short command. The diff you get on upgrade is the
diff you can read.

## What to keep

| Keep | Because |
| --- | --- |
| `src/lib/content.ts` | The whole content model is one file; replacing it means replacing the site |
| `src/lib/markdown.tsx` | Article typography is the site's voice |
| `scripts/verify-publish.mjs` | The guard is the reason a doc site can be public |
| `scripts/postbuild.mjs` | Two files that make Pages behave |
| `.github/workflows/deploy.yml` | The deploy is short on purpose |

## What to replace

- **Sections.** Four is a preference, not a law. Two sections and a flat list is a valid site.
- **Copy.** Every paragraph on this site is an argument about documentation. Yours will be
  about your product.
- **The palette.** Seven tokens in `src/index.css`. Changing them changes the whole site,
  including the fancy-ui components, because they read the same variables.
- **The design page.** Keep the idea, delete the samples you do not use.
- **The inherited pages.** Every page here is about this repository; a clone keeps only the ones it
  can re-derive. The audit below is the whole of step 4.

## The seed checklist

1. `git clone` → `npm install` → `npm run dev`.
2. Rename: `package.json` (`name`, `homepage`), `vite.config.ts` (`base`), `index.html` (title,
   description, canonical).
3. Rewrite `SECTIONS` and the folders under `src/content/`.
4. Delete unused pages; the nav follows the files.
5. `npm run build` — the guard must pass before the first push.

## The audit a clone owes the seed

Step 4 is the one that gets skipped, because an inherited page compiles. It is also the one that
decides whether the new repository is a site or a costume. Run it page by page, before writing
anything new:

| Inherited thing | Keep it only if | Otherwise |
| --- | --- | --- |
| A page under `src/content/` | its examples, commands and numbers are true of *this* repository | delete the file, then fix every link and the section index |
| `src/content/seeds/` | the audiences are yours | replace the cast; the ladder is the pattern, not the people |
| `src/content/isotopes/` | this repository runs the system the page describes | re-derive the page from code that exists here, or remove it |
| `examples/` | the kit is the kit in this repository | delete it, and the guard rule that requires it |
| `/design` | every sample is an import this site ships | rewrite the catalogue with what it actually uses |
| `/palette` | the tokens are the tokens in `index.css` | regenerate them, or delete the route |

A page is inherited until it can be checked against the repository. "The build passes" proves the
markup parses; it does not prove the page is true.

Two mechanical checks catch most of it:

```bash
# pages that still name the parent's repository, routes or products
rg -n 'james-gibson/le\.gume|fancy-ui|spell-check' src/content src scripts README.md AGENTS.md \
  | rg -v 'le\.gume-energy'

# an inherited page usually leaves a receipt: an import from a kit directory
rg -n 'examples/' src scripts
```

An import from `examples/` is an inherited page with a receipt.

## A warning worth printing

A seed you do not read is just a generator with worse ergonomics. The value here is that the
files are small enough to finish reading. If you skip that, you are trusting a stranger's
defaults with your public surface — which is the exact failure this repository is trying to
make harder.
