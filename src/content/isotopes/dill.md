---
title: Dill — agree on a rotation without logging it
description: Both sides compute floor(unix/tick); the offset is the handshake, and only a disagreement is an event.
order: 2
updated: 2026-11-15
slots: tick
presumes: synced-clock, no-storage, http-json-rpc
tags: isotope, rotation, tick, cost
seeds: isotopes, lab-operator
---

# Dill — agree on a rotation without logging it

Two processes wanting to rotate together have three options: one tells the other
(and now there is a message, a channel and a failure mode), both write down what
they did (and now there is a log to host, prune and reconcile), or **both compute the
same number from the clock they already share**.

This isotope is the third. It is four lines of arithmetic and it replaces a feed of
success records.

## What it proves

That agreement does not have to be *recorded* to be *checkable*. Both sides reduce
UTC seconds to an integer epoch:

```
tick = floor(unix_seconds / tick_seconds)        # le.gume-shell uses 5
```

Two samples, one epoch apart, classify the whole relationship:

| observed over two epochs | meaning | what to do |
| --- | --- | --- |
| offset constant | a **slide** of n ticks | carry the offset; it is recoverable |
| offset moves by one per local tick | different **cadence** | two gauges; they will never come into phase |
| offset jumps | restart or clock move | the only thing worth emitting |

Measured against a live peer (two requests, nothing written):

```
tick = floor(unix/5s); grace = 1 tick(s)
  sample 1  local=358957238  peer=358957238  offset=+0
  sample 2  local=358957240  peer=358957240  offset=+0
VERDICT: slide — constant offset of +0 tick(s), same cadence, in phase
```

That is the entire instrument. A monitor that would otherwise store a row per
success stores nothing, and still knows whether the other side is in phase.

## The parts

| Piece | What it is | What it decides |
| --- | --- | --- |
| The epoch width | `tick` seconds, shared by both sides | the resolution of every agreement |
| The reduction | `floor(unix / tick)` | the number both sides can compute |
| The grace | one tick, usually | how late an agreement may be and still hold |
| The comparison | two samples, one epoch apart | slide vs cadence vs event |

The grace is what makes it usable under load: a handoff that starts at the end of a
tick finishes in the next, and both sides agree it was on time. In the lab this is
`PathGraceTicks = 1` with a five-second tick: a route negotiated on tick *T* is
accepted on *T* and *T+1*, refused at *T+2*.

## What it costs

Two requests per check, no storage, no retention, and one assumption: **the clocks
are within a tick**. That assumption is the price, and it is a real one — a host with
drifted time is out of phase with everything, and the arithmetic will say so rather
than hiding it.

The cost of the alternative is what this isotope exists to avoid: a row per success
in a file that has to be kept, rotated and trusted, so that a monitor can answer a
question the clock can answer for free.

## Take this, not that

**Take:** the epoch reduction, the two-sample comparison, and a grace of one tick.

**Leave:** a success log as the agreement mechanism, a shared counter mutated by
one side (that is a lock, with the same availability problem), and any scheme that
needs a message to say "we are in phase".

## What would break it

- A tick width that does not divide the workflow: a five-second epoch with a
  ninety-second job agrees once and then drifts out of every window.
- Comparing against a *stale* baseline instead of the clock: you then measure years,
  not phase.
- Treating a constant offset as a fault. A whole-tick offset is a slide, and a slide
  is recoverable; refusing it forces a renegotiation that was never needed.
- Using it where the two sides do not need to agree. A one-shot read has no phase.

## Agent prompt

```text
You are implementing le.gume-shell isotope dill (agree on a rotation without logging it).

Bound slots: tick
Ask for any slot not bound above:
  tick — how many seconds wide should one epoch be?
Then:
1. On both sides, compute epoch = floor(unix_seconds / tick). Do not store it.
2. Exchange the current epoch once, and again one epoch later.
3. Classify: constant offset = slide (carry it), offset moving one per tick =
   different cadence (stop; agree on a width), offset jump = restart (report it).
4. Accept an agreement that is at most one epoch late; refuse at two.
5. Write no log for a success. Emit only the disagreement.
```

## Where it sits in the lab

The lab's rotation, the 42i tick, and the proxy's path grace all read the same
clock. The application walkthrough is
[/guides/price-a-rotation](/guides/price-a-rotation).
