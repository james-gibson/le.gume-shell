---
title: From a design doc to scenarios
description: Turn one design document into a reviewed Gherkin set — choose the slice, write the promise, name the observable, and leave decisions as tickets.
order: 5
updated: 2026-11-13
tags: gherkin, bdd, specifications
seeds: scenario-as-contract
---

# From a design doc to scenarios

A design document usually arrives with two things: prose that explains the model, and a schema that
stores it. The missing middle is the set of promises a third party can check. This guide turns one
document into that set, in an order that keeps the decisions visible.

This is the task half of [Scenario as contract](/seeds/scenario-as-contract). The seed page is the
argument; this page is the work.

## Before you start

You need a design document, a schema or a draft of one, and the name of the person who can decide
what "policy" means. If the last one does not exist, the first output is a decision list, not a
feature file.

## Step 1 — pick one vertical slice

Do not start with the entity matrix. Pick one path a person or a process can complete: a member
withdraws a book; a job moves from queued to running; a visitor opens a room and reads a note. A
slice has a starting state, one action and an observable end.

Write the slice in one sentence. If it needs two "and then"s, it is two slices.

## Step 2 — name the promise, not the task

The title is the cheapest review you will get. Read it before you write the steps.

| If the title starts with | It is probably | Where it belongs |
| --- | --- | --- |
| "Create a ..." | a task | the backlog |
| "A ... can ..." | a behaviour | a scenario |
| "Follows the configured policy" | a decision | a ticket |

A task can still be a scenario if the task is the interface: "a member withdraws a book" is a
behaviour; "the withdraw endpoint returns 201" is the observable that proves it. The distinction is
not the grammar; it is whether the sentence names a state of the world a person cares about.

## Step 3 — write one action and one observable

```gherkin
Feature: A member withdraws a book
  Scenario: A member withdraws an available copy
    Given a member with no loans
    And an available copy of "Dune"
    When the member withdraws "Dune"
    Then the copy is on loan to the member
    And the shelf count for "Dune" is 1
```

Three rules are enough to start:

- **One `When` per scenario.** Two actions mean two scenarios, unless the scenario is a state
  machine and the alternating `When`/`Then` pairs are the behaviour.
- **`Given` states the world, not the action.** `Given an available copy` is a state; `Given I call
  the withdraw endpoint` is an action wearing the wrong keyword.
- **`Then` names a value a third party can check.** "Properly aligned", "without performance
  issues" and "continues without error" are adjectives; a count, a status, a file or a timestamp is
  a check.

## Step 4 — turn every policy into a decision

A step like this is the most expensive sentence in the file:

```gherkin
Then the request is rejected according to policy
```

It passes for every policy, so it can never fail. Replace it with a decision row:

| Decision | Options | Owner | Schema consequence | Scenario |
| --- | --- | --- | --- | --- |
| Can a member reserve a copy already on loan? | reject; queue; allow with notification | the person who owns the loan rules | a `Reservation` or a `queuedAt` field | one per option |

The decision row is the ticket. The scenario is written after the decision, not before. If you are
estimating the work, grep the spec for "policy", "if allowed" and "either"; every match is a
decision you have not made.

## Step 5 — connect the schema

The triangle has three edges. The prose-to-scenario edge is the feature file. The scenario-to-schema
edge is a citation, and a citation needs a check.

- Add a comment to each model or field naming the scenario that exercises it.
- Add a coverage table, or a script, that fails when a cited ID is missing or a field has no
  scenario. A table in a review document is a start; a failing check is the thing that survives.
- Cite a name or a stable ID, not a range of ordinals. A range is a promise about the set staying
  the same size.

## Step 6 — review the set

- [ ] Every scenario has one `When`.
- [ ] Every `Then` names something a third party can check.
- [ ] No `Then` says "policy", "if allowed" or "either ... or ...".
- [ ] The feature names a beneficiary, or the page says why it does not.
- [ ] Every schema field is cited by a scenario or marked untested.
- [ ] IDs are stable; no machine depends on an ordinal.
- [ ] Tasks are in the backlog; the feature is the promise.

## Done when

You can hand the feature file and the coverage table to someone who did not write the design
document, and they can say what is promised, what is decided, and what is still open. If they cannot,
the missing piece is a decision or an observable, not more prose.

## If the scenarios need an identity

A content-addressed canon gives each scenario a stable identity, but it is not a drop-in for
Cucumber. It may drop `Background`, corrupt a `Scenario Outline`, and ignore tables and docstrings.
Converting is a rewrite: each `Background` becomes a `Given` in every scenario, each outline becomes
separate scenarios, and tables move into steps or examples.

The benefit is a stable name and deduplication; the cost is verbosity and the loss of the outline's
compactness. Do not run both on the same text. Pick the artifact that owns the truth. The naming
argument is the same one [What an isotope is](/isotopes/what-is-an-isotope) makes: an ordinal is a
position, and a name is an identity.

## What to do with the matrix

The CRUD and constraint matrix is still useful. Keep it as a verification appendix; do not present
it as the product conversation. The narrative slice is the entrance, the matrix is the reference,
and the decisions are the backlog.
