---
title: Find the alarm
description: Point a smoke-alarm at a peer, read what it says, and tell a crash from a rotation.
order: 10
updated: 2026-11-15
tags: guides, alarms, monitoring
seeds: starter, lab-operator
---

# Find the alarm

A smoke-alarm watches targets and answers one question per target: is it doing what a
call promises? This walkthrough takes you from "nothing is running" to "I can read the
difference between a dead peer and a rotated one".

You need: a shell, one machine, and nothing deployed.

## 1. Start an empty alarm

An alarm with no targets costs one process and answers `/status` immediately, which is
what you want before pointing it anywhere.

```sh
ocd-smoke-alarm serve --config=my-alarm.yaml --mode=foreground -tui=false
```

```yaml
version: "1"
service: { name: "my-alarm", environment: "local", mode: "foreground" }
health:
  enabled: true
  listen_addr: "127.0.0.1:PORT"
  endpoints: { healthz: "/healthz", readyz: "/readyz", status: "/status" }
runtime:
  state_dir: "./state"
  baseline_file: "./state/known-good.json"
targets: []
known_state: { enabled: true, persist: false }
```

`ready: true` and `targets: []` means the engine is running and watching nothing. That
is a valid resting state, not a broken one.

## 2. Give it something to watch

A target is a claim about how a call should look. `handshake_profile: strict` with no
`required_methods` asserts `initialize`, `tools/list` **and** `resources/list` — so a
peer that implements only tools fails it. Ask the peer what it implements and write
that down instead of guessing:

```yaml
targets:
  - id: "peer"
    enabled: true
    protocol: "mcp"
    endpoint: "http://127.0.0.1:PORT/mcp"
    transport: "http"
    expected:
      healthy_status_codes: [200]
      min_capabilities: ["tools/list"]
    auth: { type: "none" }
    check:
      interval: "10s"
      timeout: "5s"
      retries: 1
      handshake_profile: "strict"
      required_methods: ["initialize", "tools/list"]
```

Validate before you apply it — the binary will refuse a config it cannot parse, and
that refusal is cheaper than a restart:

```sh
ocd-smoke-alarm ops self-check --config=my-alarm.yaml
```

## 3. Apply it without restarting

```sh
ocd-smoke-alarm ops reload --config=my-alarm.yaml
curl -s http://127.0.0.1:PORT/status | jq '.targets'
```

Same pid, same `started_at`, new target set. If the config has
`remote_agent.managed_updates: true` the same command runs `stop_command`,
`start_command`, `verify_command` instead — a restart, not a reload — and nothing on
that path enforces `rollback_on_failure`, so a failed start leaves the alarm down.

## 4. Read the three states you will actually see

| state | what it means | what it is not |
| --- | --- | --- |
| `healthy` | the last check passed | proof the peer is stable |
| `regression` | it was healthy, now it fails | an outage |
| `outage` | it has failed `outage_threshold` times in a row | a rotation |

A rotation and a crash both look like "the check failed" for as long as the process is
gone. Measured on this machine: a peer that was down for a minute flipped the target
to `regression` and cleared when it returned; a peer that restarted every two seconds
reported `healthy` on **every** probe, because it was up for the second the probe
sampled.

## 5. Close the blind spot

Two probes make a crashloop visible where one cannot:

- shorten `interval` until it is shorter than the restart period, or
- compare a **monotonic** value the peer publishes. The lab's dashboard publishes a
  `tick` that advances once a second and an `isotope` that changes on restart; an
  offset that jumps between samples is a restart, an offset that is constant is a
  slide.

That is the whole walkthrough: a target is a claim, `self-check` proves the claim,
`reload` applies it, and a single probe cannot tell churn from health.

## Where this goes next

- The peer's side: [/guides/ask-the-dashboard](/guides/ask-the-dashboard)
- The arithmetic behind "in phase": [/isotopes/dill](/isotopes/dill)
- Why a rotation is not a crash: [/guides/price-a-rotation](/guides/price-a-rotation)
