---
title: Ivory, dimmed
description: The palette moved from near-white on moss-green to dim ivory on a neutral ground, with a spicy pink for interaction and a pastel for the second voice.
order: 18
updated: 2026-11-15
tags: design, colour, accessibility
seeds: starter
---

# Ivory, dimmed

Three changes, each with a reason:

| Token | Was | Is | Why |
| --- | --- | --- | --- |
| `cream` | `#f2efe4` | `#d9d3c6` | near-white on near-black is a glare source at 3am; dimming costs nothing |
| `pulse` | `#b6f24a` green | `#ff2d95` spicy pink | interaction needs the most separation on a dark ground |
| `violet` | `#a78bfa` violet | `#ffc2dd` pastel pink | the second voice, quieter, same family |
| `ink` / `surface` | green-tinted | warm neutral | the pinks sat on moss and looked muddy |

The base moved with the accents. A green-tinted black under a hot pink reads as an accident; the
same pink on a neutral warm black reads as a choice.

## The numbers

Contrast against `ink` (`#0b0a0b`), computed with the WCAG relative-luminance formula:

| Pair | Ratio | Standard |
| --- | --- | --- |
| cream on ink | 13.0:1 | AAA for body text |
| pulse pink on ink | 5.6:1 | AA for body text |
| pastel pink on ink | 12.9:1 | AAA |
| muted on ink | 6.4:1 | AA |

The spicy pink is the one that matters: it is used for links, focus rings and the primary button, so
it has to clear 4.5:1 on its own rather than relying on size. 5.6:1 is the margin.

## What it costs

- **Three places to change.** The theme tokens in `src/index.css`, the accents hardcoded in
  `Home`, `Design`, `AgentHandoff`, `FileView` and the Markdown renderer, and the swatch list on
  `/design`. A token that is only in one of them is a colour that drifts.
- **The doom waivers assume a dark palette.** They waive gradients, alpha and dark mode because the
  design is dark. A light theme would invalidate the set, not just the colours.
- **The gate reads what ships.** `src/lib/palette.json` lists the combinations the site actually
  paints and the floor each must clear; `npm run contrast` fails the build when one drops. It also
  reads the built pages, resolves every `currentColor` to the token its class names, applies the
  alpha that class actually carries, and fails when an ink and its ground fall below the floor
  *after* alpha, when a painted element names no declared ink, or when two touching marks are
  closer than 3:1. A gradient still has no single ratio to declare — the worst stop is the number
  to check, by hand.

That is `RULES-09`, and it needs no browser: the rule that would cover the rest is a static read of
the built HTML, not `DOOM-014`. What it cannot see is a pair whose geometry the source has not
settled (a hover state) and a gradient's interior stops.

## The check

[/palette](/palette) is the page that fits every shade against every other: a matrix of ratios, the
declared pairs with their floors, and the gradients the site paints with the worse of their two
stops. `/design` renders the components; `/palette` renders the colour. If a swatch disagrees with
what you see on a page, the hardcoded accent is the one that is wrong.
