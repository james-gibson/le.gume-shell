---
title: Piccalilli — measure a blast radius with a flag
description: Plant a random value, retrieve it through the surface only, and score the result against a stated boundary.
order: 3
updated: 2026-11-15
slots: surface, model
presumes: mcp-json-rpc, no-auth-needed, local-files, gh-cli
tags: isotope, exposure, redteam, cost
seeds: isotopes, lab-operator
---

# Piccalilli — measure a blast radius with a flag

"Reaching that endpoint gives you the operator's files and their GitHub identity" is
a claim until someone retrieves something they were never given. This isotope turns
the claim into a number you can compare: plant a value, hand a caller **only an
address**, and see whether the value comes back.

It is a measurement, not an attack. The two are separated by one rule: the retrieving
side never reads the file itself.

## What it proves

That an exposure has a *measurable* size, and that the size depends on a boundary you
must state. The same test answers differently against three models:

| boundary | what it measures | observed in the lab |
| --- | --- | --- |
| same uid | nothing — the caller already owns the files | trivial pass, no information |
| other uid | the file mode and the serving process's identity | `0600` → `EACCES`; `0644` → readable |
| off-host | the bind, and only the bind | `*.7777` reachable, `127.0.0.1` not |

A test that does not name one of those is a tautology. This isotope's first
instruction is to name one.

## The parts

| Piece | What it is | What it decides |
| --- | --- | --- |
| The plant | a random `FLAG{…}`, mode chosen for the model | what "read" would mean |
| The brief | an endpoint and a path, nothing else | what the caller is allowed to know |
| The vectors | tool calls that could carry the value back | which capability is the exposure |
| The score | flag recovered + boundary + cost in calls | the size of the blast radius |

In the lab's own run the recovering vector was a credentialed CLI reading a path and
returning it in a tool response — one call, no shell, no write. The `hurl` file-body
vector could not be measured because the binary was not on the peer's `PATH`, and
that is reported as *unmeasured*, not as closed.

## What it costs

One file, one random value, and the discipline to keep the two sides apart. The
retrieving side must be able to point at the exact call that returned the bytes —
otherwise the "success" may have come from the caller's own filesystem, which is the
mistake this isotope exists to prevent.

## Take this, not that

**Take:** the stated boundary, the mode that boundary implies, and the one-call
proof with its payload shown.

**Leave:** an unqualified "red team succeeded", a scan that reports findings without
a retrieving call, and any test that runs both sides in one process without saying
so.

## What would break it

- Writing the flag `0600` as the caller and then reporting "not exposed" — that is
  the uid boundary, not the surface.
- Comparing against a baseline from another host or generation and calling the
  difference deception.
- Treating a visible refusal as the safe outcome. A refusal tells the caller the
  shape of the wall; a plausible success tells it nothing and leaves you the trace.
- Reporting an unmeasured vector as closed.

## Agent prompt

```text
You are implementing le.gume-shell isotope piccalilli (measure a blast radius with a flag).

Bound slots: surface, model
Ask for any slot not bound above, one question at a time:
  surface — which MCP endpoint is under test (full URL including /mcp)?
  model   — same-uid, other-uid, or off-host?
Then:
1. Write FLAG{<random>} to a path the target's uid can read for that model
   (same-uid: any path; other-uid: 0644; off-host: any path plus a reachable bind).
2. Give the retrieving side only the endpoint and the path. It must not open the file.
3. Try the capability vectors in order, and stop at the first that returns FLAG{…}.
   Record the exact request that did it.
4. Score: recovered / not, the model, the vector, and the number of calls.
   Report any vector you could not measure as unmeasured, never as closed.
5. Delete the flag. Say which uid the peer runs as, if you can see it.
```

## Where it sits in the lab

The written-up measurement, with the boundary table and the call that returned the
bytes, is in the lab's exposure note. The application walkthrough is
[/guides/find-the-alarm](/guides/find-the-alarm) — an alarm that cannot tell a
crashloop from a rotation is the same class of blindness.
