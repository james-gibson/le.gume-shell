---
title: Read a rate limit
description: Ask GitHub how much is left before spending it, cache until the reset, and price the spend.
order: 12
updated: 2026-11-15
tags: guides, gh, limits, cost
seeds: starter, lab-operator
---

# Read a rate limit

The lab bills in rotations, and a rotation costs a call. Before any loop asks GitHub
forty questions, it should ask one: **how many are left, and when does that change?**

You need: `gh` authenticated, and five minutes.

## 1. Read the whole ledger

```sh
gh api rate_limit
```

It returns a bucket per resource, each with its own reset:

```
core      4900 / 5000   reset in 466s
search      30 /   30   reset in  58s
graphql   4994 / 5000   reset in 2734s
```

Those are three separate budgets. The usual failure is not exhaustion, it is
**mixing them**: a sweep that spends the thirty-request search bucket in a minute and
then reports "GitHub is down" for an hour. Read the bucket you are about to use.

## 2. Cache the answer until the reset

The value has a known expiry, so store it with one:

```sh
gh api rate_limit > .cache/rate-limit.json
```

A caller should refresh when `now > reset`, not on a timer. A cache keyed by the reset
instant is always at most one reset stale, and it never asks a question whose answer
cannot have changed.

## 3. Stop at a floor, do not degrade

Pick a floor — `remaining < 200` on `core`, for example — and make it a *stop*, not a
retry. The difference matters: a retry loop converts a budget problem into a timeout
problem and takes the failure from "visible now" to "visible in an hour".

```
if remaining(core) < floor:
    stop; say which resource, how many are left, and when it resets
```

## 4. Price the spend

In the lab a call is a rotation, and a rotation has a nominal price of one penny —
not a dollar, because the dollar price is per plane. The point of the price is not
accounting; it is the decision it forces: **does this loop earn its rotations?** A
weekly job that spends 12 calls to find one stale link is a profit centre; a sweep
that spends 4,000 to produce a list nobody reads is a cost centre, and you can say so
before it runs.

## 5. Do not confuse the budget with permission

`remaining` says what the token may still spend. It says nothing about what it may
spend it on: a token with 4,900 core requests left is still a token, and if the process
holding it can read files, the budget is the least interesting thing about it. That is
the other axis — [/isotopes/piccalilli](/isotopes/piccalilli) measures it.

## End state

You can answer "how much is left, when does it reset, and do we stop or continue" from
one cached read, and you have a number for what the loop costs. The isotope version,
with slots for the floor and cadence, is [/isotopes/gherkin](/isotopes/gherkin).
