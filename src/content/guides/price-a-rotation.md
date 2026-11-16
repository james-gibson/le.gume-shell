---
title: Price a rotation
description: What it costs to move a surface, why a restart is not a rotation, and the one measurement that catches both.
order: 13
updated: 2026-11-15
tags: guides, rotation, tick, monitoring
seeds: starter, lab-operator
---

# Price a rotation

A rotation is supposed to be cheap: the surface moves, the address stays, and a valid
caller never notices. That only holds if you know what "notices" costs. This walkthrough
prices it in the only currency that transfers — time, measured against a baseline you
own.

You need: a peer that answers, and the ability to call it two hundred times.

## 1. Know the difference between a rotation and a restart

They look identical to a monitor. Measured on this machine:

- a peer that was **down** for a minute flipped its target to `regression` and cleared
  when it returned — correct behaviour, and a rotation that way reads as an outage;
- a peer that restarted **every two seconds** reported `healthy` on every probe for
  thirty seconds, because it was up for the second each probe sampled.

So a restart is either a false outage or an invisible one, and neither is a rotation.
A rotation keeps the address and moves the process underneath it.

## 2. Put the handoff on a clock, not in a log

Two sides that share a clock do not need to tell each other anything:

```
tick  = floor(unix / 5)
grace = 1 tick        # a handoff that starts late finishes next tick and is on time
```

Two samples, one epoch apart, classify the relationship: a constant offset is a
**slide** (carry it), an offset moving one per tick is a different **cadence** (two
gauges, never in phase), and a jump is a **restart** (the only thing worth emitting).
Nothing is written down, so there is nothing to host or prune.

## 3. Measure what a caller can see

Take two hundred calls at the rate your clients actually use, and compare the
distribution before and after the rotation. On this machine, against a real baseline:

```
adhd.status baseline: n=31743  p50=0.38ms p95=0.88ms p99=2.07ms

shift      calls needed to spot it (p<0.05, 80% power)
+0.05ms    500
+0.10ms    100
+0.25ms     20
+0.50ms     10
```

Read it in both directions:

- **a fast path cannot absorb a delay.** A poll with a 0.38ms median and a 2ms tail has
  no room for a lie: half a millisecond is visible in ten calls. So you do not slow a
  fast path to punish anyone — you would be announcing yourself.
- **the path with a tail can.** A call whose real distribution already reaches seconds
  (a proxy hop, a tool call) can take a rebuild and still look normal, because the
  work is real and samples the same tail.

## 4. Make the cost a rebuild, not a delay

A rebuild is re-election, re-provisioning, re-negotiation — work the cluster does
anyway, whose latency is a fact rather than a message. The trade:

| | tarpit | rebuild |
| --- | --- | --- |
| where the delay comes from | invented | the work |
| a legitimate burst | pays too | rotates, so pays nothing |
| after the fact | no trace | N rebuilds, attributable |
| invented or not | invented | real |

A well-rotated caller stays balanced and induces none; an unbalanced one pays in
iterations, which is the currency an attack actually spends.

## 5. Check the rotation is neutral

The failure this walkthrough exists to catch: if two members of a set serve different
distributions, the rotation schedule leaks through timing alone — a caller with a
stopwatch learns when the surface moved, without asking `tools/list` once. Run the
measurement against each member after a rotation and diff them. A member whose fast-path
median has drifted is a member that tells time.

## End state

You can state what a rotation costs, in calls and in milliseconds, and you have a test
that fails when the cost becomes visible. The arithmetic, with slots, is
[/isotopes/dill](/isotopes/dill); the alarm that has to survive it is
[/guides/find-the-alarm](/guides/find-the-alarm).
