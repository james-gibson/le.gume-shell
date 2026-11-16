---
title: Gherkin — read a rate limit before you spend it
description: One request that answers how much is left and when it resets, cached until the reset — the cheapest guard in the lab.
order: 1
updated: 2026-11-15
slots: floor, every
presumes: gh-cli, token:read, no-server, state-file
tags: isotope, gh, limits, cost
seeds: isotopes, lab-operator
---

# Gherkin — read a rate limit before you spend it

Every automated thing in this lab eventually asks GitHub a question. The ones that
ask without looking at the budget are the ones that fail at 3am with a `403` and a
reset time nobody read. The fix is not a retry loop; it is one call that asks
**how much is left**, and a cache that honours the answer.

This is the smallest isotope here: one request, one local file, one threshold.

## What it proves

That a rate limit is a *readable* fact, not weather. `gh api rate_limit` returns the
remaining budget **per resource**, each with its own reset instant — and the buckets
are not interchangeable: on this machine, measured 2026-11-15,

```
core      4900 / 5000   reset in 466s
search      30 /   30   reset in  58s
graphql   4994 / 5000   reset in 2734s
```

A caller that treats "5000 an hour" as one number will spend the search budget on
core-shaped work and then wonder why the search failed. The buckets are separate
ledgers, and the *reset* is the part that makes caching safe: nothing is gained by
asking again before it.

## The parts

| Piece | What it is | What it decides |
| --- | --- | --- |
| The read | `gh api rate_limit` | remaining and reset, per resource |
| The cache | one JSON file beside the state | do not ask again before the earliest reset you care about |
| The floor | `floor` slot | at how many remaining the caller should stop spending |
| The cadence | `every` slot | how often a *fresh* read is allowed, bounded by the reset |

The cache is the whole trick. A rate limit read is itself free in most cases, but
the pattern being taught is the caching: a value with a known expiry should be
stored with that expiry, not re-derived each time.

## What it costs

One request per reset window, one file, and the honesty to stop when the floor is
reached. The file is a cache, not a ledger: if it is deleted, the next read rebuilds
it from one call.

The cost of *not* doing it is the reason it exists: a sweep that spends the search
bucket in forty seconds and then waits an hour, or a bot that treats `403` as a
transient and retries into the reset.

## Take this, not that

**Take:** the per-resource read, the cache keyed by reset, and a floor that makes
the caller stop rather than degrade.

**Leave:** exponential backoff as a *substitute* for reading the budget (it is a
recovery, not a plan), a single global "remaining" number, and any retry that does
not consult the reset instant.

## What would break it

- Reading with a token that lacks access: the response is a `401`, not a budget, and
  a caller that treats every failure as "no budget" will throttle itself to zero.
- Caching past the reset: the cached number is then the thing that stops work, and
  it is wrong in the safe-looking direction.
- Sharing one cache between two identities: the budget belongs to the token, not to
  the machine.
- Trusting it as an *authorization* signal. A remaining count is not a permission;
  it says what the token may still spend, not what it may spend it on.

## Agent prompt

```text
You are implementing le.gume-shell isotope gherkin (read a rate limit before you spend it).

Bound slots: floor, every
Ask for any slot not bound above, one question at a time:
  floor — at how many remaining requests should the caller stop?
  every — how often may a fresh read happen?
Then:
1. Call `gh api rate_limit` once and store the whole response, with the earliest
   reset you care about, in one JSON file next to your state.
2. Before any GitHub call, read that file. If it is still inside the reset window,
   use it; otherwise refresh once.
3. If `remaining` for the resource you need is below `floor`, stop and say which
   resource, how many are left, and when it resets. Do not retry into the reset.
4. Never share the cache with another token; the budget belongs to the identity.
```

## Where it sits in the lab

The lab already reads this number: rotations are priced in the same currency, and
`scripts/lab/prices.py` treats a spend as a rotation rather than a dollar. This
isotope is the read side of that — the part that keeps a loop from spending a
budget it cannot see. The application walkthrough is
[/guides/read-a-rate-limit](/guides/read-a-rate-limit).
