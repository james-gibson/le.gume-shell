---
title: Scenario as contract
description: A scenario is a promise — one observable, one identity, and a decision that cannot hide in "follows policy".
order: 51
updated: 2026-11-13
tags: seed, gherkin, specifications, project-management
---

# Scenario as contract

The audience is someone with a design document and a schema, and no shared definition of done. The
assumption is that you can read Gherkin and have a data model you intend to keep. The entrance is
[From a design doc to scenarios](/guides/from-design-doc-to-scenarios).

## What is inside

- **The task** — one guide: choose the slice, write the promise, name the observable, and leave the
  decisions as tickets.
- **The triangle** — prose, scenarios, schema. Each edge is a claim that only a check can keep true.
- **The four checks** — one `When`; a `Then` a third party can check; no policy steps; one identity
  scheme that no machine depends on ordinally.

## Why it is shaped this way

A design document usually arrives as prose plus a schema. The scenarios are the missing middle: the
set of promises a third party can check. Writing them is not the hard part. The hard part is keeping
the three artifacts from disagreeing.

The draft that prompted this seed had the right instinct: it numbered every scenario and cited the
numbers from the schema. That is a traceability graph in one file. It also had three failure modes
worth teaching:

- **The numbers are positions, not identities.** Insert a scenario and every range citation after it
  means something else. A name or a content hash survives an insertion; an ordinal does not.
- **"Follows the configured policy" is a decision.** It passes for every policy, so it can never
  fail. It belongs in a ticket, not a `Then`.
- **A citation is not a check.** The schema can cite a scenario that does not exist, or contradict
  one it does. Nothing notices unless a check reads both sides.

The seed sits at rung 1 because the reader is understanding the contract, not deploying it. A rung
is a level, not a slot: the twelve factors and this seed share rung 1 because they ask the same
readiness of the reader. The same contract is useful to a developer running the suite and an agent
writing the next feature; the rung describes the first reader, not the only one.

## Lifting this seed

1. Copy [the guide](/guides/from-design-doc-to-scenarios) and this page.
2. Add the registry entry to `src/lib/seeds.ts`: `id`, `title`, `audience`, `assumes`, `teaches`,
   `entry`, `touches`, `lateral: true`.
3. Add `seeds: scenario-as-contract` to the guide, or to another page that belongs to the seed.
4. Keep the four checks. Replace the example with a slice from your own model.
5. Run `npm run build`. The guard refuses a seed with no member page, an entrance that is not a
   route, or a shelf whose order disagrees with the ladder.

## What it costs to host

- **A second language.** Gherkin has to stay true to the code; a stale step is worse than no step.
- **A checker.** The traceability claim is only worth making if a missing citation fails the build.
  Without that, the triangle is decoration.
- **The discipline to separate tasks from promises.** A CRUD checklist is a work plan, not a
  product conversation. Keeping both in one file is how the distinction gets lost.
- **The temptation to teach Cucumber.** This seed is about the contract, not the runner. The
  mechanics belong in the tool's documentation.

## What it does not cover

Cucumber installation, step-definition code, or running a suite in CI. It covers the editorial
contract: what a scenario promises, who can check it, and what to do when the promise is a decision
instead of a behaviour.
