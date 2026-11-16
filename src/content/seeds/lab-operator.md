---
title: The lab operator
description: You have found the lab. Here is what runs, what each part costs, and which page to open first.
order: 65
updated: 2026-11-15
tags: seed, lab, operations
---

# The lab operator

The audience is someone who has found a set of small services talking JSON-RPC to each
other and wants to know what is running **before** touching it. The assumption is a
shell, one machine, and no fear of a `curl` with a JSON body. The entrance is
[Find the alarm](/guides/find-the-alarm).

## What is inside

- **The three questions** — what is running, what is it doing, what does it cost.
- **The difference between absent and churning** — a dead peer and a restarting one
  look the same to a ten-second probe, and only one of them is broken.
- **The capability map** — an alarm only reads; a dashboard with a credentialed CLI in
  its tool list can spend the operator's token, and that is a different class of thing
  to expose.
- **Rotation arithmetic** — a shared tick, a one-tick grace, and why a delay on a fast
  path announces itself.

## The three questions, in order

1. **What is running?** An alarm's `/status` lists targets and their last check; a
   dashboard's `adhd.status` lists lights, peers, and a monotonic tick. Both answer in
   one request, and neither is a health guarantee — they say what was observed.
2. **What is it doing?** A light names its source. A red light from a decoy is a caller
   accumulating 42i distance; a red light from a target is a failed probe. They are not
   the same alarm and should not share a page.
3. **What does it cost?** A call is a rotation, a rotation is priced in pennies, and a
   rate limit is a budget with a reset. Before a loop runs, ask how many it will spend
   and whether anything reads the result.

## Why it is shaped this way

The lab's failure mode is not a crash; it is a **blind spot that looks healthy**. A
process that restarts faster than the probe interval reports `healthy` forever; a
honeypot whose alert has no sink fires into a log nobody reads; a rotation that shuts
down and comes back is indistinguishable from an outage to everything downstream.

So this seed teaches measurements rather than components: what an interval can and
cannot see, what a tick proves, what a threshold costs in missed contacts. A component
you can restart is a component you can replace; a measurement is the thing that tells
you whether the replacement worked.

## Lifting this seed

- Entrance: [/guides/find-the-alarm](/guides/find-the-alarm)
- The peer's own view: [/guides/ask-the-dashboard](/guides/ask-the-dashboard)
- The budget: [/guides/read-a-rate-limit](/guides/read-a-rate-limit)
- The arithmetic: [/guides/price-a-rotation](/guides/price-a-rotation)

If you take one thing: **do not trust a single probe interval**. Either make the
interval shorter than the failure, or compare a value that cannot lie about having
restarted.
